import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Animated
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '../../../constants/colors';
import { useNotificationStore, Notification, NotificationType } from '../../../stores/notificationStore';
import { useAuthStore } from '../../../stores/authStore';
import { useProfileStore } from '../../../stores/profileStore';
import CachedAvatar from '../../../components/CachedAvatar';
import NotificationSkeleton from '../../../components/NotificationSkeleton';
import IonIcon from '@expo/vector-icons/Ionicons';
import { SwipeRow } from 'react-native-swipe-list-view';
import { supabase } from '../../../lib/supabase';

interface NotificationItem extends Notification {
  isGrouped?: boolean;
  groupedNotifications?: Notification[];
  otherCount?: number;
  formattedMessage?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { followUser, unfollowUser } = useProfileStore();
  const { 
    notifications, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);
  const swipeableRefs = useRef({});
  const [deletedNotifications, setDeletedNotifications] = useState(new Set());
  const [deletionAnimations, setDeletionAnimations] = useState({});
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [lastDeletedNotification, setLastDeletedNotification] = useState(null);
  const undoToastAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [loadingImages, setLoadingImages] = useState(new Set());
  
  // Fetch notifications on mount
  useEffect(() => {
    if (session?.user?.id) {
      //fetchNotifications();
    }
  }, [session?.user?.id]);

  // Mark all notifications as read when navigating away from screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        // This runs when the screen loses focus (navigating away)
        if (session?.user?.id && notifications.length > 0) {
          const unreadNotifications = notifications.filter(n => !n.read);
          if (unreadNotifications.length > 0) {
            markAllAsRead();
          }
        }
      };
    }, [session?.user?.id, markAllAsRead]) // Remove notifications from dependencies
  );
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, []);
  
  // Format timestamp to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    // For older notifications, show the date
    return date.toLocaleDateString();
  };

  // Get time period for notification grouping
  const getTimePeriod = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 24 * 7) {
      return 'Last 7 days';
    } else if (diffInHours < 24 * 30) {
      return 'Last 30 days';
    } else {
      return 'Older';
    }
  };

  // Group notifications by time period (excluding deleted ones)
  const groupedNotifications = notifications
    .filter(notification => !deletedNotifications.has(notification.id))
    .reduce((groups, notification) => {
      const period = getTimePeriod(notification.created_at);
      if (!groups[period]) {
        groups[period] = [];
      }
      groups[period].push(notification);
      return groups;
    }, {} as Record<string, Notification[]>);

  // Group similar notifications within each time period
  const groupSimilarNotifications = (notifications: Notification[]) => {
    const grouped = {};
    const ungrouped = [];
    
    notifications.forEach(notification => {
      // Define grouping key based on notification type and target
      let groupKey = null;
      
      if (notification.type === 'follow') {
        // Group all follows together
        groupKey = 'follow';
      } else if (notification.type === 'post_like' && notification.post_id) {
        // Group likes on the same post
        groupKey = `post_like_${notification.post_id}`;
      } else if (notification.type === 'routine_like' && notification.routine_id) {
        // Group likes on the same routine
        groupKey = `routine_like_${notification.routine_id}`;
      } else if (notification.type === 'routine_save' && notification.routine_id) {
        // Group saves on the same routine
        groupKey = `routine_save_${notification.routine_id}`;
      }
      
      if (groupKey) {
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(notification);
      } else {
        // Don't group comments, replies, etc. - keep them individual
        ungrouped.push(notification);
      }
    });
    
    const result = [...ungrouped];
    
    // Process grouped notifications
    Object.entries(grouped).forEach(([groupKey, groupNotifications]: [string, Notification[]]) => {
      if (groupNotifications.length === 1) {
        // If only one notification in group, don't group it
        result.push(groupNotifications[0]);
      } else {
        // Create a grouped notification
        const firstNotification = groupNotifications[0];
        const otherCount = groupNotifications.length - 1;
        
        // Create grouped notification object
        const groupedNotification = {
          ...firstNotification,
          id: `grouped_${groupKey}`,
          isGrouped: true,
          groupedNotifications: groupNotifications,
          otherCount,
          // Use the most recent notification's timestamp
          created_at: new Date(Math.max(...groupNotifications.map(n => new Date(n.created_at).getTime()))).toISOString()
        };
        
        result.push(groupedNotification);
      }
    });
    
    // Sort by creation time (most recent first)
    return result.sort((a, b) => {
      const aTime = a.isGrouped ? a.created_at : new Date(a.created_at).getTime();
      const bTime = b.isGrouped ? b.created_at : new Date(b.created_at).getTime();
      return bTime - aTime;
    });
  };

  // Apply grouping to each time period
  const processedGroupedNotifications = {};
  Object.entries(groupedNotifications).forEach(([period, notifications]) => {
    processedGroupedNotifications[period] = groupSimilarNotifications(notifications);
  });

  // Create flat list data with headers
  const flatListData = [];
  const periods = ['Today', 'Last 7 days', 'Last 30 days', 'Older'];
  
  periods.forEach(period => {
    if (processedGroupedNotifications[period] && processedGroupedNotifications[period].length > 0) {
      // Add header
      flatListData.push({ type: 'header', title: period, id: `header-${period}` });
      // Add notifications
      processedGroupedNotifications[period].forEach(notification => {
        flatListData.push({ type: 'notification', ...notification });
      });
    }
  });

  // Format notification message for grouped notifications
  const formatNotificationMessage = (notification: any) => {
    if (!notification.isGrouped) {
      // Regular notification - use existing message
      return notification.message;
    }
    
    // Grouped notification - create "and others" message
    const firstUser = notification.actor?.username || 'Someone';
    const otherCount = notification.otherCount;
    
    switch (notification.type) {
      case 'follow':
        if (otherCount === 1) {
          return `${firstUser} and 1 other started following you`;
        } else {
          return `${firstUser} and ${otherCount} others started following you`;
        }
      case 'post_like':
        if (otherCount === 1) {
          return `${firstUser} and 1 other liked your post`;
        } else {
          return `${firstUser} and ${otherCount} others liked your post`;
        }
      case 'routine_like':
        if (otherCount === 1) {
          return `${firstUser} and 1 other liked your routine`;
        } else {
          return `${firstUser} and ${otherCount} others liked your routine`;
        }
      case 'routine_save':
        if (otherCount === 1) {
          return `${firstUser} and 1 other saved your routine`;
        } else {
          return `${firstUser} and ${otherCount} others saved your routine`;
        }
      default:
        return notification.message;
    }
  };
  const handlePress = (notification: Notification, groupedNotifications?: Notification[]) => {
    // Mark all notifications in the group as read
    if (groupedNotifications && groupedNotifications.length > 0) {
      groupedNotifications.forEach(notif => markAsRead(notif.id));
    } else {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'follow':
        router.push(`/profile/${notification.actor_id}`);
        break;
      case 'post_like':
        if (notification.post_id) {
          router.push(`/post/${notification.post_id}`);
        }
        break;
      case 'post_comment':
      case 'comment_like':
      case 'comment_reply':
        if (notification.post_id) {
          router.push(`/post/${notification.post_id}/comments`);
        }
        break;
      case 'routine_like':
      case 'routine_save':
        if (notification.routine_id) {
          router.push(`/routine/${notification.routine_id}`);
        }
        break;
      default:
        // Default action if type is not recognized
        break;
    }
  };

  // Handle profile navigation
  const handleProfilePress = (actorId: string) => {
    closeAllSwipeables();
    router.push(`/profile/${actorId}`);
  };

  // Close all swipeable rows
  const closeAllSwipeables = () => {
    Object.keys(swipeableRefs.current).forEach(key => {
      if (swipeableRefs.current[key]) {
        swipeableRefs.current[key].closeRow();
      }
    });
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (userId: string) => {
    if (!session?.user?.id || userId === session.user.id) return;
    
    // Add haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics might not be available on all devices
    }
    
    const isCurrentlyFollowing = followingUsers.has(userId);
    
    // Optimistic update
    if (isCurrentlyFollowing) {
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } else {
      setFollowingUsers(prev => new Set([...prev, userId]));
    }
    
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId, session.user.id);
      } else {
        await followUser(userId, session.user.id);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert optimistic update on error
      if (isCurrentlyFollowing) {
        setFollowingUsers(prev => new Set([...prev, userId]));
      } else {
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    }
  };

  // Get right side content based on notification type
  const getRightContent = (notification: Notification) => {
    switch (notification.type) {
      case 'follow':
        const isOwnProfile = session?.user?.id === notification.actor_id;
        const isFollowing = followingUsers.has(notification.actor_id);
        
        if (isOwnProfile) return null;
        
        return (
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing && styles.followingButton
            ]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent navigation
              closeAllSwipeables();
              handleFollowToggle(notification.actor_id);
            }}
          >
            <Text style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText
            ]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        );
      case 'post_like':
      case 'post_comment':
      case 'comment_like':
      case 'comment_reply':
        // Show post media thumbnail if available
        const getMediaUri = (storagePath: string) => {
          // Process URL if it's not already a full URL
          if (!storagePath.startsWith('http')) {
            try {
              const { data: urlData } = supabase.storage
                .from('user-content')
                .getPublicUrl(storagePath);
              return urlData?.publicUrl || storagePath;
            } catch (error) {
              console.error('Error processing media URL:', error);
              return storagePath;
            }
          }
          return storagePath;
        };

        return (
          <View style={styles.mediaThumbnail}>
            {notification.post?.media && notification.post.media.length > 0 ? (
              <View style={styles.thumbnailContainer}>
                {loadingImages.has(notification.post.media[0].id) && (
                  <View style={styles.thumbnailLoading} />
                )}
                <Image 
                  source={{ uri: getMediaUri(notification.post.media.sort((a, b) => a.order_index - b.order_index)[0].storage_path) }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                  onLoadStart={() => {
                    setLoadingImages(prev => new Set(prev).add(notification.post?.media?.[0]?.id));
                  }}
                  onLoadEnd={() => {
                    setLoadingImages(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(notification.post?.media?.[0]?.id);
                      return newSet;
                    });
                  }}
                  onError={() => {
                    setLoadingImages(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(notification.post?.media?.[0]?.id);
                      return newSet;
                    });
                  }}
                />
              </View>
            ) : (
              <View style={[styles.thumbnailImage, styles.placeholderThumbnail]}>
                <IonIcon name="image-outline" size={16} color={colors.secondaryText} />
              </View>
            )}
          </View>
        );
      case 'routine_like':
      case 'routine_save':
        return (
          <View style={styles.routineIcon}>
            <IonIcon name="barbell-outline" size={20} color={colors.primaryText} />
          </View>
        );
      default:
        return null;
    }
  };

  // Get notification icon based on type  
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'follow':
        return 'person-add-outline';
      case 'post_like':
      case 'routine_like':
      case 'comment_like':
        return 'heart-outline';
      case 'post_comment':
      case 'comment_reply':
        return 'chatbubble-outline';
      case 'routine_save':
        return 'bookmark-outline';
      default:
        return 'notifications-outline';
    }
  };
  
  // Handle delete notification with undo functionality
  const handleDelete = (notificationId: string) => {
    // Find the notification to store for potential undo
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Start fade out animation
    const animationKey = `notification-${notificationId}`;
    const fadeAnim = new Animated.Value(1);
    
    setDeletionAnimations(prev => ({
      ...prev,
      [animationKey]: fadeAnim
    }));

    // Animate fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      // Add to deleted notifications set
      setDeletedNotifications(prev => new Set(prev).add(notificationId));
      
      // Store for undo functionality
      setLastDeletedNotification(notification);
      
      // Show undo toast
      setShowUndoToast(true);
      Animated.timing(undoToastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Auto-hide toast after 4 seconds and permanently delete
      const timeoutId = setTimeout(() => {
        hideUndoToast();
        setTimeout(() => {
          // Actually delete from database only if not undone
          if (deletedNotifications.has(notificationId)) {
            deleteNotification(notificationId);
          }
          
          // Clean up animations
          setDeletionAnimations(prev => {
            const newAnims = { ...prev };
            delete newAnims[animationKey];
            return newAnims;
          });
        }, 300);
      }, 4000);
      
      // Store timeout ID so we can cancel it on undo
      setLastDeletedNotification({
        ...notification,
        _timeoutId: timeoutId
      });
    });
  };

  // Handle undo deletion
  const handleUndo = () => {
    if (lastDeletedNotification) {
      // Clear the timeout to prevent permanent deletion
      if (lastDeletedNotification._timeoutId) {
        clearTimeout(lastDeletedNotification._timeoutId);
      }
      
      // Remove from deleted set (this will make it appear again)
      setDeletedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(lastDeletedNotification.id);
        return newSet;
      });
      
      // Clean up animation
      const animationKey = `notification-${lastDeletedNotification.id}`;
      setDeletionAnimations(prev => {
        const newAnims = { ...prev };
        delete newAnims[animationKey];
        return newAnims;
      });
      
      setLastDeletedNotification(null);
    }
    hideUndoToast();
  };

  // Hide undo toast
  const hideUndoToast = () => {
    Animated.timing(undoToastAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowUndoToast(false);
    });
  };

  // Render notification item
  const renderNotification = ({ item }: { item: any }) => {
    // Render header
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{item.title}</Text>
        </View>
      );
    }

    // Render notification
    const swipeableKey = `notification-${item.id}`;
    const animationKey = `notification-${item.id}`;
    const deleteAnimation = deletionAnimations[animationKey] || new Animated.Value(1);
    
    return (
      <Animated.View
        style={{
          opacity: deleteAnimation,
        }}
      >
        <SwipeRow
          rightOpenValue={-80}
          disableRightSwipe={true}
          friction={20}
          tension={10}
          directionalDistanceChangeThreshold={10}
          swipeToOpenPercent={30}
          swipeToClosePercent={30}
          closeOnRowPress={true}
          closeOnScroll={true}
          onRowDidOpen={() => {
            // Close other swipeables when this one opens
            Object.keys(swipeableRefs.current).forEach(key => {
              if (key !== swipeableKey && swipeableRefs.current[key]) {
                swipeableRefs.current[key].closeRow();
              }
            });
          }}
          ref={ref => {
            if (ref) {
              swipeableRefs.current[swipeableKey] = ref;
            }
          }}
        >
          {/* Hidden delete button (shows when swiped) */}
          <View style={styles.hiddenItem}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <IonIcon name="trash-outline" size={20} color="white" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Main notification row */}
          <Pressable
            style={[
              styles.notificationItem,
              !item.read && styles.unreadNotification
            ]}
            onPress={() => {
              closeAllSwipeables();
              handlePress(item, item.groupedNotifications);
            }}
          >
            {({ pressed }) => (
              <>
                {/* Press feedback overlay */}
                {pressed && (
                  <View style={styles.notificationPressOverlay} />
                )}
                
                {/* User Avatar */}
                <TouchableOpacity activeOpacity={0.5} 
                  style={styles.avatarContainer}
                  onPress={() => handleProfilePress(item.actor_id)}
                >
                  {item.isGrouped ? (
                    // Grouped notification - show stacked avatars
                    <View style={styles.stackedAvatars}>
                      <CachedAvatar 
                        path={item.actor?.avatar_url}
                        size={44}
                        style={[styles.avatar, styles.primaryAvatar]}
                      />
                      {item.groupedNotifications && item.groupedNotifications.length > 1 && (
                        <CachedAvatar 
                          path={item.groupedNotifications[1]?.actor?.avatar_url}
                          size={32}
                          style={[styles.avatar, styles.secondaryAvatar]}
                        />
                      )}
                      {item.otherCount > 1 && (
                        <View style={styles.avatarCounter}>
                          <Text style={styles.avatarCounterText}>
                            +{item.otherCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    // Regular notification - single avatar
                    <CachedAvatar 
                      path={item.actor?.avatar_url}
                      size={44}
                      style={styles.avatar}
                    />
                  )}
                </TouchableOpacity>
                
                {/* Notification Content */}
                <View style={styles.content}>
                  <View style={styles.messageContainer}>
                    <Text style={styles.message} numberOfLines={2}>
                      {item.isGrouped ? (
                        // Grouped notification - show custom message
                        <Text style={styles.message}>
                          <Text style={[styles.message, styles.username]}>
                            {item.actor?.username || 'Someone'}
                          </Text>
                          <Text style={styles.message}>
                            {' ' + formatNotificationMessage(item).replace(item.actor?.username || '', '').trim()}
                          </Text>
                        </Text>
                      ) : (
                        // Regular notification - show username + message
                        <Text style={styles.message}>
                          <Text 
                            style={[styles.message, styles.username]}
                            onPress={() => handleProfilePress(item.actor_id)}
                          >
                            {item.actor?.username || 'Someone'}
                          </Text>
                          <Text style={styles.message}>
                            {' ' + item.message.replace(item.actor?.username || '', '').trim()}
                          </Text>
                        </Text>
                      )}
                    </Text>
                  </View>
                  <Text style={styles.time}>
                    {formatRelativeTime(item.created_at)}
                  </Text>
                </View>

                {/* Right side content */}
                <View style={styles.rightContent}>
                  {getRightContent(item)}
                </View>
              </>
            )}
          </Pressable>
        </SwipeRow>
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      
      {/* Notifications List */}
      <FlatList
        ref={scrollViewRef}
        data={flatListData}
        renderItem={renderNotification}
        keyExtractor={item => item.type === 'header' ? item.id : item.id.toString()}
        contentContainerStyle={styles.listContent}
        onScrollBeginDrag={() => {
          // Close all swipeables when user starts scrolling
          closeAllSwipeables();
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.brand]}
            tintColor={colors.brand}
          />
        }
        ListEmptyComponent={
          loading ? (
            <NotificationSkeleton count={10} />
          ) : (
            <View style={styles.emptyContainer}>
              <IonIcon
                name="notifications-off-outline"
                size={64}
                color={colors.secondaryText}
              />
              <Text style={styles.emptyText}>
                No notifications yet
              </Text>
              <Text style={styles.emptySubtext}>
                When you receive notifications, they'll appear here
              </Text>
            </View>
          )
        }
      />

      {/* Undo Toast */}
      {showUndoToast && (
        <Animated.View
          style={[
            styles.undoToast,
            {
              transform: [
                {
                  translateY: undoToastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
              opacity: undoToastAnim,
            },
          ]}
        >
          <Text style={styles.undoToastText}>Notification deleted</Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.undoButton}>Undo</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 20,
    minHeight: '100%',
  },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
  },
  sectionHeaderText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
    backgroundColor: colors.background,
  },
  unreadNotification: {
    backgroundColor: colors.primaryAccent,
  },
  notificationPressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  stackedAvatars: {
    position: 'relative',
    width: 44,
    height: 44,
  },
  primaryAvatar: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  secondaryAvatar: {
    position: 'absolute',
    top: 6,
    left: 12,
    zIndex: 1,
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarCounter: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.brand,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarCounterText: {
    color: colors.primaryText,
    fontSize: 10,
    fontWeight: '600',
  },
  avatar: {
    marginRight: 0,
  },
  content: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  message: {
    color: colors.primaryText,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  username: {
    fontWeight: '500',
  },
  time: {
    color: colors.secondaryText,
    fontSize: 12,
  },
  rightContent: {
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    width: 100,
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  mediaThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 40,
    height: 40,
  },
  thumbnailLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 8,
    zIndex: 1,
  },
  thumbnailImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  placeholderThumbnail: {
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#dc3545',
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: '100%',
    backgroundColor: '#dc3545',
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    height: 300,
  },
  emptyText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: colors.secondaryText,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  undoToast: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  undoToastText: {
    color: colors.primaryText,
    fontSize: 14,
    flex: 1,
  },
  undoButton: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '600',
  },
});