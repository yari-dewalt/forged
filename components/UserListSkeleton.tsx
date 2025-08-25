import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface UserListSkeletonProps {
  count?: number;
  showFollowButton?: boolean;
}

const UserListSkeleton: React.FC<UserListSkeletonProps> = ({ 
  count = 8, 
  showFollowButton = true 
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <UserItemSkeleton 
          key={index} 
          delay={index * 100}
          showFollowButton={showFollowButton}
        />
      ))}
    </View>
  );
};

interface UserItemSkeletonProps {
  delay: number;
  showFollowButton: boolean;
}

const UserItemSkeleton: React.FC<UserItemSkeletonProps> = ({ delay, showFollowButton }) => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, [opacity, delay]);

  return (
    <Animated.View style={[styles.userItem, { opacity }]}>
      {/* Avatar skeleton */}
      <View style={styles.avatar} />
      
      {/* User info skeleton */}
      <View style={styles.userInfo}>
        <View style={styles.username} />
        <View style={styles.fullName} />
      </View>
      
      {/* Follow button skeleton */}
      {showFollowButton && (
        <View style={styles.followButton} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.whiteOverlay,
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  username: {
    height: 16,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '40%',
  },
  fullName: {
    height: 14,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '60%',
  },
  followButton: {
    width: 80,
    height: 32,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 16,
  },
});

export default UserListSkeleton;
