import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface SuggestedUsersSkeletonProps {
  count?: number;
}

export default function SuggestedUsersSkeleton({ count = 4 }: SuggestedUsersSkeletonProps) {
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
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <Animated.View style={[styles.headerSkeleton, { opacity: pulseAnim }]} />
      
      {/* Horizontal scrollable user cards */}
      <View style={styles.usersContainer}>
        {Array.from({ length: count }, (_, index) => (
          <UserCardSkeleton key={index} delay={index * 150} />
        ))}
      </View>
    </View>
  );
}

// Individual user card skeleton component with animation
function UserCardSkeleton({ delay }: { delay: number }) {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim, delay]);

  return (
    <View style={styles.userCard}>
      {/* Avatar skeleton */}
      <Animated.View style={[styles.avatarSkeleton, { opacity: pulseAnim }]} />
      
      {/* Username skeleton */}
      <Animated.View style={[styles.usernameSkeleton, { opacity: pulseAnim }]} />
      
      {/* Subtitle skeleton */}
      <Animated.View style={[styles.subtitleSkeleton, { opacity: pulseAnim }]} />
      
      {/* Follow button skeleton */}
      <Animated.View style={[styles.buttonSkeleton, { opacity: pulseAnim }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  headerSkeleton: {
    height: 20,
    width: 120,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 12,
  },
  usersContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userCard: {
    width: 140,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryAccent,
    padding: 12,
    borderRadius: 8,
  },
  avatarSkeleton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondaryAccent,
  },
  usernameSkeleton: {
    height: 16,
    width: 100,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginTop: 2,
  },
  subtitleSkeleton: {
    height: 12,
    width: 60,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  buttonSkeleton: {
    height: 32,
    width: '90%',
    backgroundColor: colors.secondaryAccent,
    borderRadius: 10,
    marginTop: 0,
  },
});
