import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

interface PostSkeletonProps {
  showMedia?: boolean;
  delay?: number;
}

export default function PostSkeleton({ showMedia = true, delay = 0 }: PostSkeletonProps) {
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
    <View style={styles.container}>
      {/* Header with avatar and username */}
      <View style={styles.header}>
        <Animated.View style={[styles.avatar, { opacity: pulseAnim }]} />
        <View style={styles.userInfo}>
          <Animated.View style={[styles.skeletonText, styles.username, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.skeletonText, styles.timestamp, { opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Title */}
      <Animated.View style={[styles.skeletonText, styles.title, { opacity: pulseAnim }]} />

      {/* Description */}
      <View style={styles.description}>
        <Animated.View style={[styles.skeletonText, styles.descriptionLine1, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonText, styles.descriptionLine2, { opacity: pulseAnim }]} />
      </View>

      {/* Media placeholder */}
      {showMedia && (
        <Animated.View style={[styles.media, { opacity: pulseAnim }]} />
      )}

      {/* Actions (like, comment, etc.) */}
      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <Animated.View style={[styles.actionIcon, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.skeletonText, styles.actionText, { opacity: pulseAnim }]} />
        </View>
        <View style={styles.actionItem}>
          <Animated.View style={[styles.actionIcon, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.skeletonText, styles.actionText, { opacity: pulseAnim }]} />
        </View>
        <View style={styles.actionItem}>
          <Animated.View style={[styles.actionIcon, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.skeletonText, styles.actionText, { opacity: pulseAnim }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryAccent,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryAccent,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  skeletonText: {
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  username: {
    height: 16,
    width: 120,
    marginBottom: 4,
  },
  timestamp: {
    height: 12,
    width: 80,
  },
  title: {
    height: 20,
    width: '70%',
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
  },
  descriptionLine1: {
    height: 14,
    width: '95%',
    marginBottom: 4,
  },
  descriptionLine2: {
    height: 14,
    width: '80%',
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: colors.secondaryAccent,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondaryAccent,
    marginRight: 6,
  },
  actionText: {
    height: 14,
    width: 30,
  },
});
