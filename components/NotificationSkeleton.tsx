import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface NotificationSkeletonProps {
  count?: number;
}

const NotificationSkeleton: React.FC<NotificationSkeletonProps> = ({ count = 5 }) => {
  const shimmerOpacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerOpacity]);

  const renderSkeletonItem = (index: number) => (
    <View key={index} style={styles.skeletonItem}>
      <Animated.View style={[styles.avatar, { opacity: shimmerOpacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.title, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.message, { opacity: shimmerOpacity }]} />
        <Animated.View style={[styles.timestamp, { opacity: shimmerOpacity }]} />
      </View>
      <Animated.View style={[styles.unreadDot, { opacity: shimmerOpacity }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, index) => renderSkeletonItem(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondaryAccent,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondaryAccent,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    height: 16,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 6,
    width: '70%',
  },
  message: {
    height: 14,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 4,
    width: '90%',
  },
  timestamp: {
    height: 12,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    width: '40%',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryAccent,
    marginLeft: 8,
    marginTop: 4,
  },
});

export default NotificationSkeleton;
