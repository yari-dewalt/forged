import { View, Text, StyleSheet, Pressable, TouchableWithoutFeedback, Alert, ActivityIndicator, Modal, Animated, Dimensions, Share, TouchableOpacity, Image } from "react-native";
import { colors } from "../../constants/colors";
import { Ionicons as IonIcon, AntDesign } from '@expo/vector-icons';
import ExercisesList from "./ExercisesList";
import MediaGallery from "./MediaGallery";
import { useEffect, useState, useRef } from "react";
import CachedAvatar from "../CachedAvatar";
import { useRouter, useFocusEffect, usePathname } from "expo-router";
import { checkIfUserLikedPost, deletePost, likePost, formatTimeAgo, likeComment } from "../../utils/postUtils";
import { useAuthStore } from "../../stores/authStore";
import { fetchComments } from "../../utils/postUtils";
import { useProfileStore } from "../../stores/profileStore";
import * as Haptics from 'expo-haptics';
import { usePostVisibility } from "../../hooks/usePostVisibility";
import { useCallback } from "react";
import { supabase } from "../../lib/supabase";
import { convertWeight, getUserWeightUnit, formatWeight, displayWeightForUser } from "../../utils/weightUtils";

const Post = ({ data, onDelete, isDetailView = false }) => {
  const [liked, setLiked] = useState(data.is_liked || false);
  const [likesCount, setLikesCount] = useState(data.likes || 0);
  const [commentsCount, setCommentsCount] = useState(data.comments_count || 0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [workoutData, setWorkoutData] = useState(null);
  const [isWorkoutLoading, setIsWorkoutLoading] = useState(false);
  const [followButtonState, setFollowButtonState] = useState<'follow' | 'following' | 'hidden'>('follow');
  const [isFollowAnimating, setIsFollowAnimating] = useState(false);
  const [likesData, setLikesData] = useState(null);
  const [previewComments, setPreviewComments] = useState([]);
  const [commentLikes, setCommentLikes] = useState(new Map()); // Track comment like states
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const router = useRouter();
  const pathname = usePathname();
  const { profile, session } = useAuthStore();
  const { updatePostsCount, isCurrentUser, followUser, checkIfFollowing, isUserFollowed } = useProfileStore();
  const { isVisible: isPostVisible, elementRef: postRef, onLayout: onPostLayout } = usePostVisibility({ threshold: 0.5 });
  
  // Get user's preferred weight unit
  const userWeightUnit = getUserWeightUnit(profile);

  // Check if we should show the follow button
  const isProfileRoute = pathname.includes('/profile');
  const isMainProfilePage = isProfileRoute && 
    (pathname.endsWith(`/profile/${data.user.id}`) || pathname.endsWith(`/profile/${data.user.id}/index`) || pathname.endsWith('/profile'));

  // Show follow button if:
  // 1. Not on a profile route (showing posts in home feed, etc.)
  // 2. OR on the main profile page (not on subpages like followers, following, etc.)
  // 3. AND post is not from the current user
  // 4. AND user is not already following the post author
  const shouldShowFollowButton = (!isProfileRoute || isMainProfilePage) && 
    data.user.id !== session?.user?.id && 
    data.user.id !== profile?.id &&
    !isUserFollowed(data.user.id); // Use global follow state

  // Check following status on mount
  useEffect(() => {
    // No need for local state management - we'll use the global state
    // The global state will be updated when following/unfollowing users
  }, []);

  // Handle follow button press
  const handleFollowPress = async () => {
    if (isFollowAnimating || !session?.user?.id) return;
    
    setIsFollowAnimating(true);
    setFollowButtonState('following');
    
    try {
      // Actually follow the user
      await followUser(data.user.id, session.user.id);
      
      // No need to update local state - the global state is updated in followUser
      
      // Show the "Following" state briefly, then fade out
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setFollowButtonState('hidden');
          setIsFollowAnimating(false);
          fadeAnim.setValue(1); // Reset for potential future use
        });
      }, 1000);
    } catch (error) {
      console.error('Error following user:', error);
      // Reset button state on error
      setFollowButtonState('follow');
      setIsFollowAnimating(false);
    }
  };

  // Reset follow button state when route changes
  useEffect(() => {
    setFollowButtonState('follow');
    setIsFollowAnimating(false);
    fadeAnim.setValue(1);
    
    // No need to re-check following status - global state handles this
  }, [pathname]);

  // Compute animated style for follow button
  const followButtonAnimatedStyle = {
    opacity: followButtonState === 'following' ? fadeAnim : 1
  };

  // Handle screen focus/blur events to pause videos when navigating away
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, [])
  );

  // Load comment count on mount
  useEffect(() => {
    const getCommentCount = async () => {
      if (data.id) {
        setIsCommentLoading(true);
        try {
          const comments = await fetchComments(data.id);
          let totalCount = comments.length;
          
          // Add the count of any replies
          comments.forEach(comment => {
            if (comment.replies) {
              totalCount += comment.replies.length;
            }
          });
          
          setCommentsCount(totalCount);
          
          // Set preview comments (top 2)
          setPreviewComments(comments.slice(0, 2));
        } catch (error) {
          console.error('Error getting comments count:', error);
        } finally {
          setIsCommentLoading(false);
        }
      }
    };
    
    getCommentCount();
  }, [data.id]);

  useEffect(() => {
    // Check if the current user has already liked this post
    const checkLikeStatus = async () => {
      if (session?.user?.id && data.id) {
        const hasLiked = await checkIfUserLikedPost(data.id, session.user.id);
        setLiked(hasLiked);
      }
    };
    
    checkLikeStatus();
  }, [session?.user?.id, data.id]);

  // Fetch likes data for display
  useEffect(() => {
    const fetchLikesData = async () => {
      if (data.id && likesCount > 0) {
        try {
          const { data: likes, error } = await supabase
            .from('post_likes')
            .select(`
              user_id,
              created_at,
              profiles:user_id (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('post_id', data.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (likes && likes.length > 0) {
            // Find the most recent user that the current user follows (if any)
            let featuredUser = null;
            if (session?.user?.id) {
              // Check which of these users the current user follows
              const userIds = likes.map(like => like.user_id);
              const { data: following, error: followError } = await supabase
                .from('follows')
                .select('following_user_id')
                .eq('follower_user_id', session.user.id)
                .in('following_user_id', userIds);

              if (!followError && following && following.length > 0) {
                const followingIds = following.map(f => f.following_user_id);
                featuredUser = likes.find(like => followingIds.includes(like.user_id));
              }
            }
            
            // If no followed user found, use the most recent liker
            if (!featuredUser) {
              featuredUser = likes[0];
            }

            // Filter out current user from display
            const filteredLikes = likes.filter(like => like.user_id !== session?.user?.id);

            setLikesData({
              featuredUser: featuredUser?.profiles,
              totalCount: filteredLikes.length,
              recentLikes: filteredLikes.slice(0, 3)
            });
          }
        } catch (error) {
          console.error('Error fetching likes data:', error);
        }
      } else {
        setLikesData(null);
      }
    };

    fetchLikesData();
  }, [data.id, likesCount, session?.user?.id]);

  // Fetch workout data if workout_id exists
  useEffect(() => {
    const fetchWorkoutData = async () => {
      if (data.workout_id) {
        setIsWorkoutLoading(true);
        try {
          const { data: workout, error } = await supabase
            .from('workouts')
            .select(`
              id,
              name,
              start_time,
              end_time,
              notes,
              routine_id,
              routines(
                id,
                name
              ),
              workout_exercises(
                id,
                name,
                exercise_id,
                superset_id,
                exercises(
                  id,
                  name,
                  image_url
                ),
                workout_sets(
                  id,
                  weight,
                  reps,
                  is_completed
                )
              )
            `)
            .eq('id', data.workout_id)
            .single();

          console.log(data);

          if (error) throw error;

          if (workout) {
            // Calculate duration from start_time and end_time if available
            let calculatedDuration = 0;
            if (workout.start_time && workout.end_time) {
              const startTime = new Date(workout.start_time);
              const endTime = new Date(workout.end_time);
              calculatedDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // in seconds
            }

            // Calculate total volume
            let totalVolume = 0;
            const exercises = workout.workout_exercises || [];
            
            exercises.forEach(exercise => {
              const sets = exercise.workout_sets || [];
              sets.forEach(set => {
                if (set.weight && set.reps) {
                  totalVolume += set.weight * set.reps;
                }
              });
            });

            setWorkoutData({
              ...workout,
              duration: calculatedDuration,
              exerciseCount: exercises.length,
              totalVolume: Math.round(totalVolume),
              totalSets: exercises.reduce((acc, ex) => 
                acc + (ex.workout_sets?.length || 0), 0)
            });
          }
        } catch (error) {
          console.error('Error fetching workout data:', error);
        } finally {
          setIsWorkoutLoading(false);
        }
      }
    };

    fetchWorkoutData();
  }, [data.workout_id]);

  const handleDeletePost = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to delete posts');
      return;
    }
    
    if (data.user.id !== session.user.id) {
      Alert.alert('Error', 'You can only delete your own posts');
      return;
    }
    
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(data.id, session.user.id);
              
              // Update profile posts count if this is the current user's profile
              if (isCurrentUser && data.user.id === session.user.id) {
                updatePostsCount(-1);
              }
              
              // Call the onDelete callback to update UI
              if (onDelete) {
                onDelete(data.id);
              }
              
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleMediaPress = (mediaItem, index) => {
    // Handle media press - open fullscreen viewer or play video
    // Navigate to media viewer or open modal
  };

  const toggleLiked = async () => {
    if (!session?.user?.id) {
      Alert.alert('Please sign in to like posts');
      return;
    }
    
    setIsLikeLoading(true);
    
    try {
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistically update UI
      const newLikedState = !liked;
      setLiked(newLikedState);
      setLikesCount(prevCount => newLikedState ? prevCount + 1 : Math.max(0, prevCount - 1));
      
      // Make the actual API call
      const result = await likePost(data.id, session.user.id);
      
      // If something went wrong, revert to the previous state
      if (result.liked !== newLikedState) {
        setLiked(result.liked);
        setLikesCount(prevCount => result.liked ? prevCount + 1 : Math.max(0, prevCount - 1));
      }
    } catch (error) {
      // If there's an error, revert to the previous state
      console.error('Error toggling like:', error);
      setLiked(!liked);
      setLikesCount(prevCount => liked ? prevCount + 1 : Math.max(0, prevCount - 1));
      Alert.alert('Error', 'Failed to update like status. Please try again.');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleCommentAdded = async () => {
    // Increment comment count when a new comment is added
    setCommentsCount(prev => prev + 1);
    
    // Refresh preview comments
    try {
      const comments = await fetchComments(data.id);
      setPreviewComments(comments.slice(0, 2));
    } catch (error) {
      console.error('Error refreshing preview comments:', error);
    }
  };

  const handleCommentLike = async (commentId: string, currentLikes: number, isLiked: boolean) => {
    if (!session?.user?.id) {
      Alert.alert('Please sign in to like comments');
      return;
    }

    try {
      // Add haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Optimistically update the comment likes state
      const newLikedState = !isLiked;
      setCommentLikes(prev => {
        const newMap = new Map(prev);
        newMap.set(commentId, newLikedState);
        return newMap;
      });

      // Update the preview comments with new like count
      setPreviewComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                likes: newLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1),
                is_liked: newLikedState 
              }
            : comment
        )
      );

      // Make the actual API call
      const result = await likeComment(commentId, session.user.id);
      
      // If the result doesn't match our optimistic update, correct it
      if (result.liked !== newLikedState) {
        setCommentLikes(prev => {
          const newMap = new Map(prev);
          newMap.set(commentId, result.liked);
          return newMap;
        });
        
        setPreviewComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { 
                  ...comment, 
                  likes: result.liked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
                  is_liked: result.liked 
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic updates on error
      setCommentLikes(prev => {
        const newMap = new Map(prev);
        newMap.set(commentId, isLiked);
        return newMap;
      });
      
      setPreviewComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: currentLikes, is_liked: isLiked }
            : comment
        )
      );
      
      Alert.alert('Error', 'Failed to update like status. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      // For now, we'll create a temporary share URL
      // Once the app is on the app store, this can be updated to deep link
      const shareUrl = `https://atlas-app.com/post/${data.id}`;
      const shareTitle = data.title || `${data.user.full_name || data.user.username || 'Someone'}'s workout`;
      const shareMessage = `Check out this post from ${data.user.username} on Atlas!`;

      const result = await Share.share({
        message: `${shareMessage}\n\n${shareUrl}`,
        url: shareUrl, // iOS will use this for the URL
        title: shareTitle,
      }, {
        // Options for Android
        dialogTitle: 'Share this post',
        subject: shareTitle, // For email
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared via:', result.activityType);
        } else {
          // Shared successfully
          console.log('Post shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Share was dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Error', 'Unable to share this post. Please try again.');
    }
  };

  const showBottomSheet = () => {
    setOptionsVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setOptionsVisible(false);
    });
  };

  return (
    <View 
      ref={postRef}
      style={styles.container}
      onLayout={onPostLayout}
    >
      {/* Need to stop propagation on these elements */}
      <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
        <View style={styles.postHeader}>
          <TouchableOpacity
                activeOpacity={0.5} onPress={() => router.push(`/profile/${data.user.id}`)}>
            <CachedAvatar
              path={data.user.avatar_url}
              size={40}
            />
          </TouchableOpacity>
          <View style={styles.postHeaderInfo}>
            <TouchableOpacity
                activeOpacity={0.5} onPress={() => router.push(`/profile/${data.user.id}`)}>
              <Text style={styles.username}>{data.user.username || 'Unknown User'}</Text>
            </TouchableOpacity>
            <Text style={styles.postDate}>{formatTimeAgo(data.createdAt) || ''}</Text>
          </View>

          {/* Add post options menu button for owner's posts */}
          {session?.user?.id === data.user.id && (
            <TouchableOpacity
                activeOpacity={0.5} 
              style={styles.optionsButton}
              onPress={showBottomSheet}
            >
              <IonIcon name="ellipsis-horizontal" size={20} color={colors.primaryText} />
            </TouchableOpacity>
          )}

          {/* Follow button for other users' posts */}
          {shouldShowFollowButton && followButtonState !== 'hidden' && (
            <Animated.View style={[
              styles.followButtonContainer,
              followButtonAnimatedStyle
            ]}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={[
                  styles.followButton,
                  followButtonState === 'following' && styles.followingButton
                ]}
                onPress={handleFollowPress}
                disabled={isFollowAnimating}
              >
                <Text style={[
                  styles.followButtonText,
                  followButtonState === 'following' && styles.followingButtonText
                ]}>
                  {followButtonState === 'following' ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {(data.title || workoutData?.name) && (
        <Text style={styles.postTitle}>{data.title || workoutData?.name || ''}</Text>
      )}

      {data.text && <Text style={styles.postText}>{data.text || ''}</Text>}

<View style={styles.workoutInfoContainer}>
  {!isWorkoutLoading && workoutData?.duration && workoutData.duration > 0 && (
    <View style={styles.workoutInfo}>
      <Text style={styles.workoutInfoHeaderText}>Time</Text>
      <Text style={styles.workoutInfoText}>
        {Math.floor(workoutData.duration / 60) || 0}mins
      </Text>
    </View>
  )}

  {!isWorkoutLoading && workoutData?.exerciseCount && workoutData.exerciseCount > 0 && (
    <View style={styles.workoutInfo}>
      <Text style={styles.workoutInfoHeaderText}>Exercises</Text>
      <View style={styles.exerciseCountContainer}>
        <Text style={styles.workoutInfoText}>
          {String(workoutData.exerciseCount || 0)}
        </Text>
        <IonIcon name="barbell" size={16} color={colors.primaryText} />
      </View>
    </View>
  )}

  {!isWorkoutLoading && workoutData?.totalVolume && workoutData.totalVolume > 0 && (
    <View style={styles.workoutInfo}> 
      <Text style={styles.workoutInfoHeaderText}>Volume</Text>
      <Text style={styles.workoutInfoText}>
        {displayWeightForUser(workoutData.totalVolume, 'kg', userWeightUnit, true) || '0kg'}
      </Text>
    </View>
  )}
</View>

      {(data.media?.length > 0 || workoutData?.workout_exercises?.length > 0) && (
        <MediaGallery 
          media={data.media || []} 
          exercises={isDetailView ? [] : (workoutData?.workout_exercises || [])}
          onMediaPress={handleMediaPress}
          isDetailView={isDetailView}
          isPostVisible={isPostVisible && isScreenFocused}
          workoutId={workoutData?.id}
          workoutName={workoutData?.name}
          routineData={workoutData?.routines}
          postUser={data.user}
        />
      )}
      <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
        <View style={styles.buttonsContainer}>
          <View style={styles.button}>
            <TouchableOpacity
                activeOpacity={0.5} 
              onPress={toggleLiked} 
            >
                <AntDesign 
                  name={liked ? "like1" : "like2"} 
                  size={26} 
                  color={liked ? colors.brand : colors.primaryText} 
                />
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={0.5} onPress={() => router.push(`/post/${data.id}/likes`)}>
              <Text style={styles.buttonText}>{likesCount || 0}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
                activeOpacity={0.5} onPress={() => router.push(`/post/${data.id}/comments`)} style={styles.button}>
            <IonIcon name="chatbubble-outline" size={26} color={colors.primaryText} />
            <Text style={styles.buttonText}>{commentsCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity
                activeOpacity={0.5} onPress={handleShare} style={styles.button}>
            <IonIcon name="share-outline" size={26} color={colors.primaryText} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

      {likesData && likesCount > 0 && (
        <View style={styles.likesDisplayContainer}>
          <TouchableOpacity
                activeOpacity={0.5} 
            style={styles.likesAvatarsContainer}
            onPress={() => router.push(`/post/${data.id}/likes`)}
          >
            {likesData.recentLikes?.slice(0, 3).map((like, index) => (
              <View 
                key={like.user_id} 
                style={[
                  index === 0 ? styles.likeAvatarFirst : styles.likeAvatarOverlap
                ]}
              >
                <CachedAvatar
                  path={like.profiles?.avatar_url}
                  size={20}
                  style={styles.likeAvatar}
                />
              </View>
            ))}
          </TouchableOpacity>
          <View style={styles.likesTextContainer}>
            <Text style={styles.likesText}>
              Liked by{' '}
              <Text 
                style={styles.boldText}
                onPress={() => router.push(`/profile/${likesData.featuredUser?.id}`)}
              >
                {likesData.featuredUser?.username || 'Someone'}
              </Text>
              {likesData.totalCount > 1 && (
                <>
                  {' '}and{' '}
                  <Text 
                    style={styles.boldText}
                    onPress={() => router.push(`/post/${data.id}/likes`)}
                  >
                    others
                  </Text>
                </>
              )}
            </Text>
          </View>
        </View>
      )}

      {/* Comments Preview Section */}
      <View style={styles.commentsPreviewContainer}>
        {/* Preview existing comments */}
        {previewComments.map((comment, index) => {
          const isLiked = commentLikes.get(comment.id) ?? comment.is_liked;
          const currentLikes = comment.likes || 0;
          
          return (
            <View key={comment.id} style={styles.commentPreview}>
              <TouchableOpacity
                activeOpacity={0.5} onPress={() => router.push(`/profile/${comment.user?.id}`)}>
                <CachedAvatar 
                  path={comment.user?.avatar_url} 
                  size={30} 
                  style={styles.commentAvatar}
                />
              </TouchableOpacity>
              <View style={styles.commentContent}>
                <TouchableOpacity
                activeOpacity={0.5} onPress={() => router.push(`/profile/${comment.user?.id}`)}>
                  <Text style={styles.commentUsername}>
                    {comment.user?.username || 'User'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                activeOpacity={0.5} onPress={() => router.push(`/post/${data.id}/comments`)}>
                  <Text style={styles.commentText}>
                    {comment.text}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                activeOpacity={0.5} 
                style={styles.commentLikes}
                onPress={() => handleCommentLike(comment.id, currentLikes, isLiked)}
              >
                <AntDesign 
                  name={isLiked ? "like1" : "like2"}
                  size={16} 
                  color={isLiked ? colors.brand : colors.secondaryText} 
                />
                {currentLikes > 0 && (
                  <Text style={styles.commentLikesText}>
                    {currentLikes}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
        
        {/* Add comment input */}
        <TouchableOpacity
                activeOpacity={0.5} 
          style={styles.addCommentContainer}
          onPress={() => router.push(`/post/${data.id}/comments?focus=true`)}
        >
          <CachedAvatar 
            path={session?.user?.user_metadata?.avatar_url || profile?.avatar_url} 
            size={30} 
            style={styles.commentAvatar}
          />
          <View style={styles.addCommentInput}>
            <Text style={styles.addCommentPlaceholder}>
              Add a comment...
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {isDetailView && (
        <View style={styles.dividerLine} />
      )}

      {isDetailView && workoutData?.workout_exercises?.length > 0 && (
        <View style={styles.detailedExercisesContainer}>
          <Text style={styles.exercisesSectionTitle}>Routine</Text>
          <Text style={styles.postText}>{workoutData?.name || 'Routine Name'}</Text>
          <Text style={[styles.exercisesSectionTitle, styles.workoutSectionMargin]}>Workout</Text>
          <ExercisesList exercises={workoutData.workout_exercises || []} isDetailView={true} postUser={data.user} />
        </View>
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={optionsVisible}
        onRequestClose={hideBottomSheet}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
                activeOpacity={0.5} 
          style={styles.bottomSheetOverlay}
          onPress={hideBottomSheet}
        >
          <Animated.View 
            style={[
              styles.bottomSheetContainer,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0], // Slide up from bottom
                  })
                }],
                opacity: slideAnim,
              }
            ]}
          >
            <View style={styles.bottomSheetHandle} />
            
            <Text style={styles.bottomSheetTitle}>Post Options</Text>
            <Text style={styles.bottomSheetSubtitle}>Choose an action for this post</Text>
            
            <TouchableOpacity
                activeOpacity={0.5} 
              style={styles.bottomSheetOption}
              onPress={() => {
                hideBottomSheet();
                setTimeout(() => router.push(`editPost/${data.id}`), 200);
              }}
            >
              <View style={styles.bottomSheetOptionIcon}>
                <IonIcon name="create-outline" size={24} color={colors.primaryText} />
              </View>
              <View style={styles.bottomSheetOptionTextContainer}>
                <Text style={styles.bottomSheetOptionText}>Edit Post</Text>
                <Text style={styles.bottomSheetOptionSubtitle}>Make changes to your post content</Text>
              </View>
              <IonIcon name="chevron-forward" size={20} color={colors.secondaryText} />
            </TouchableOpacity>
            
            <TouchableOpacity
                activeOpacity={0.5} 
              style={[styles.bottomSheetOption, styles.deleteBottomSheetOption]}
              onPress={() => {
                hideBottomSheet();
                setTimeout(() => handleDeletePost(), 200);
              }}
            >
              <View style={styles.bottomSheetOptionIcon}>
                <IonIcon name="trash-outline" size={24} color={colors.notification} />
              </View>
              <View style={styles.bottomSheetOptionTextContainer}>
                <Text style={styles.deleteBottomSheetOptionText}>Delete Post</Text>
                <Text style={styles.bottomSheetOptionSubtitle}>Permanently remove this post</Text>
              </View>
              <IonIcon name="chevron-forward" size={20} color={colors.notification} />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
  },
  postHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  postHeaderInfo: {
    flexDirection: 'column',
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryText,
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  likeAvatar: {
    borderWidth: 2,
    borderColor: colors.primaryAccent,
  },
  likeAvatarFirst: {
    marginLeft: 0,
  },
  likeAvatarOverlap: {
    marginLeft: -5,
  },
  postTitle: {
    width: '100%',
    fontSize: 18,
    fontWeight: 600,
    color: colors.primaryText,
    paddingHorizontal: 16,
  },
  workoutInfoContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
  },
  workoutInfo: {
    gap: 6,
  },
  workoutInfoHeaderText: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  workoutInfoText: {
    fontSize: 14,
    color: colors.primaryText,
  },
  postText: {
    width: '100%',
    fontSize: 14,
    color: colors.primaryText,
    paddingHorizontal: 16,
  },
  dividerLine: {
    width: '90%',
    height: 1,
    backgroundColor: colors.primaryText,
    opacity: 0.25,
  },
  likesAvatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
    justifyContent: 'flex-start',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    fontSize: 15,
    color: colors.primaryText,
    fontWeight: '500',
  },
  likesDisplayContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  likesText: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 18,
  },
  likesTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  boldText: {
    fontWeight: '600',
    color: colors.primaryText,
    fontSize: 13,
    lineHeight: 18,
  },
  optionsButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: colors.secondaryAccent,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 10,
    paddingBottom: 34, // Account for safe area
    paddingTop: 20,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomSheetHandle: {
    width: 50,
    height: 4,
    backgroundColor: colors.secondaryText,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 8,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 12,
  },
  bottomSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  bottomSheetOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bottomSheetOptionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  bottomSheetOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  bottomSheetOptionSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  deleteBottomSheetOption: {
    marginTop: 8,
  },
  deleteBottomSheetOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.notification,
    marginBottom: 4,
  },
  detailedExercisesContainer: {
    width: '100%',
    backgroundColor: colors.primaryAccent,
    paddingTop: 12,
    gap: 12,
  },
  exercisesSectionTitle: {
    fontSize: 16,
    color: colors.secondaryText,
    paddingHorizontal: 16,
  },
  exerciseCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutSectionMargin: {
    marginBottom: -12,
  },
  // Follow button styles
  followButtonContainer: {
    // Container for follow button animation
    marginLeft: 'auto',
  },
  followButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8,
  },
  followingButton: {
    backgroundColor: colors.secondaryAccent,
  },
  followButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.primaryText,
  },
  // Comments Preview Styles
  commentsPreviewContainer: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.background,
    gap: 12,
  },
  commentPreview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentAvatar: {
    marginTop: 2,
  },
  commentContent: {
    flex: 1,
    marginRight: 10,
    gap: 4,
  },
  commentText: {
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 18,
  },
  commentUsername: {
    fontWeight: '600',
    color: colors.primaryText,
  },
  commentLikes: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 8,
  },
  commentLikesText: {
    fontSize: 11,
    color: colors.secondaryText,
    fontWeight: '500',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addCommentInput: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: colors.whiteOverlay,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primaryAccent,
  },
  addCommentPlaceholder: {
    fontSize: 14,
    color: colors.primaryText,
  },
});

export default Post;