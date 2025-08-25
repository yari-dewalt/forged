import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface PostCommentsSkeletonProps {
  commentCount?: number;
  hasLikes?: boolean;
  hasTitle?: boolean;
  hasDescription?: boolean;
  hasReplies?: boolean;
}

export default function PostCommentsSkeleton({ 
  commentCount = 5,
  hasLikes = true,
  hasTitle = true,
  hasDescription = true,
  hasReplies = true
}: PostCommentsSkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const createDelayedAnimation = (delay: number) => {
    const delayedAnim = useRef(new Animated.Value(0.5)).current;
    
    useEffect(() => {
      setTimeout(() => {
        const pulse = Animated.loop(
          Animated.sequence([
            Animated.timing(delayedAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(delayedAnim, {
              toValue: 0.5,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        pulse.start();
      }, delay);
    }, [delayedAnim]);
    
    return delayedAnim;
  };

  const SkeletonBox = ({ style, delay = 0 }: { style: any; delay?: number }) => {
    const animValue = delay > 0 ? createDelayedAnimation(delay) : pulseAnim;
    return (
      <Animated.View
        style={[
          {
            backgroundColor: colors.whiteOverlayLight,
            opacity: animValue,
          },
          style,
        ]}
      />
    );
  };

  const PostHeaderSkeleton = () => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <SkeletonBox style={styles.postAvatarSkeleton} />
        <View style={styles.postHeaderInfo}>
          <SkeletonBox style={styles.postUsernameSkeleton} delay={50} />
          <SkeletonBox style={styles.postDateSkeleton} delay={100} />
        </View>
      </View>

      {hasTitle && (
        <SkeletonBox style={styles.postTitleSkeleton} delay={150} />
      )}

      {hasDescription && (
        <View style={styles.postTextContainer}>
          <SkeletonBox style={styles.postTextSkeleton} delay={200} />
          <SkeletonBox style={styles.postTextSkeleton2} delay={250} />
          <SkeletonBox style={styles.postTextSkeleton3} delay={300} />
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <View style={styles.leftSection}>
          <SkeletonBox style={styles.likeButtonSkeleton} delay={350} />
          
          {hasLikes && (
            <View style={styles.likesSection}>
              <View style={styles.likesAvatarsContainer}>
                <SkeletonBox style={styles.likeAvatarSkeleton} delay={400} />
                <SkeletonBox style={[styles.likeAvatarSkeleton, styles.likeAvatarOverlap]} delay={450} />
                <SkeletonBox style={[styles.likeAvatarSkeleton, styles.likeAvatarOverlap]} delay={500} />
              </View>
              <SkeletonBox style={styles.likesTextSkeleton} delay={550} />
            </View>
          )}
        </View>
        
        <View style={styles.rightSection}>
          <SkeletonBox style={styles.commentCountSkeleton} delay={600} />
        </View>
      </View>
    </View>
  );

  const CommentSkeleton = ({ index, hasReplies: commentHasReplies = false }: { index: number; hasReplies?: boolean }) => (
    <View style={styles.commentItem}>
      <SkeletonBox style={styles.commentAvatarSkeleton} delay={700 + (index * 100)} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <SkeletonBox style={styles.commentUsernameSkeleton} delay={750 + (index * 100)} />
          <SkeletonBox style={styles.commentTimeSkeleton} delay={800 + (index * 100)} />
          <View style={styles.commentInlineLikes}>
            <SkeletonBox style={styles.commentLikeButtonSkeleton} delay={850 + (index * 100)} />
          </View>
        </View>
        
        <View style={styles.commentTextContainer}>
          <SkeletonBox style={styles.commentTextSkeleton} delay={900 + (index * 100)} />
          <SkeletonBox style={styles.commentTextSkeleton2} delay={950 + (index * 100)} />
        </View>
        
        <View style={styles.commentActions}>
          <SkeletonBox style={styles.replyButtonSkeleton} delay={1000 + (index * 100)} />
        </View>

        {commentHasReplies && (
          <View style={styles.repliesContainer}>
            {Array.from({ length: 2 }).map((_, replyIndex) => (
              <View key={replyIndex} style={styles.replyItem}>
                <SkeletonBox style={styles.replyAvatarSkeleton} delay={1050 + (index * 100) + (replyIndex * 50)} />
                <View style={styles.replyContent}>
                  <View style={styles.replyHeader}>
                    <SkeletonBox style={styles.replyUsernameSkeleton} delay={1100 + (index * 100) + (replyIndex * 50)} />
                    <SkeletonBox style={styles.replyTimeSkeleton} delay={1150 + (index * 100) + (replyIndex * 50)} />
                    <View style={styles.replyInlineLikes}>
                      <SkeletonBox style={styles.replyLikeButtonSkeleton} delay={1200 + (index * 100) + (replyIndex * 50)} />
                    </View>
                  </View>
                  <SkeletonBox style={styles.replyTextSkeleton} delay={1250 + (index * 100) + (replyIndex * 50)} />
                  <View style={styles.commentActions}>
                    <SkeletonBox style={styles.replyActionButtonSkeleton} delay={1300 + (index * 100) + (replyIndex * 50)} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const AddCommentSkeleton = () => (
    <View style={styles.addCommentContainer}>
      <View style={styles.inputRow}>
        <SkeletonBox style={styles.inputAvatarSkeleton} delay={1500} />
        <SkeletonBox style={styles.inputContainerSkeleton} delay={1550} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <PostHeaderSkeleton />
        {Array.from({ length: commentCount }).map((_, index) => (
          <CommentSkeleton 
            key={index} 
            index={index} 
            hasReplies={hasReplies && index < 2} 
          />
        ))}
      </View>
      <AddCommentSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondaryAccent,
  },
  listContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  // Post Header Skeleton
  postContainer: {
    backgroundColor: colors.primaryAccent,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  postAvatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderInfo: {
    flex: 1,
    gap: 4,
  },
  postUsernameSkeleton: {
    width: width * 0.3,
    height: 16,
    borderRadius: 4,
  },
  postDateSkeleton: {
    width: width * 0.2,
    height: 12,
    borderRadius: 4,
  },
  postTitleSkeleton: {
    width: width * 0.7,
    height: 18,
    borderRadius: 4,
    marginBottom: 8,
  },
  postTextContainer: {
    marginBottom: 12,
    gap: 4,
  },
  postTextSkeleton: {
    width: width * 0.85,
    height: 14,
    borderRadius: 4,
  },
  postTextSkeleton2: {
    width: width * 0.75,
    height: 14,
    borderRadius: 4,
  },
  postTextSkeleton3: {
    width: width * 0.6,
    height: 14,
    borderRadius: 4,
  },
  buttonsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  likeButtonSkeleton: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commentCountSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  likesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  likesAvatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeAvatarSkeleton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primaryAccent,
  },
  likeAvatarOverlap: {
    marginLeft: -8,
  },
  likesTextSkeleton: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
  // Comment Skeleton
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.secondaryAccent,
  },
  commentAvatarSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 2,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentUsernameSkeleton: {
    width: width * 0.25,
    height: 14,
    borderRadius: 4,
  },
  commentTimeSkeleton: {
    width: width * 0.15,
    height: 12,
    borderRadius: 4,
  },
  commentInlineLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  commentLikeButtonSkeleton: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  commentTextContainer: {
    marginBottom: 8,
    gap: 4,
  },
  commentTextSkeleton: {
    width: width * 0.6,
    height: 14,
    borderRadius: 4,
  },
  commentTextSkeleton2: {
    width: width * 0.45,
    height: 14,
    borderRadius: 4,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  replyButtonSkeleton: {
    width: 40,
    height: 12,
    borderRadius: 4,
  },
  // Reply Skeleton
  repliesContainer: {
    marginTop: 12,
    paddingLeft: 12,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  replyAvatarSkeleton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginTop: 2,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  replyUsernameSkeleton: {
    width: width * 0.2,
    height: 13,
    borderRadius: 4,
  },
  replyTimeSkeleton: {
    width: width * 0.12,
    height: 11,
    borderRadius: 4,
  },
  replyInlineLikes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  replyLikeButtonSkeleton: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  replyTextSkeleton: {
    width: width * 0.5,
    height: 13,
    borderRadius: 4,
    marginBottom: 6,
  },
  replyActionButtonSkeleton: {
    width: 35,
    height: 12,
    borderRadius: 4,
  },
  // Add Comment Skeleton
  addCommentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 32,
    backgroundColor: colors.secondaryAccent,
    borderTopWidth: 0.5,
    borderTopColor: colors.whiteOverlay,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  inputAvatarSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 4,
  },
  inputContainerSkeleton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
  },
});
