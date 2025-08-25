import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface WorkoutCardSkeletonProps {
  delay?: number;
}

const WorkoutCardSkeleton: React.FC<WorkoutCardSkeletonProps> = ({ delay = 0 }) => {
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
    <Animated.View style={[styles.workoutCard, { opacity }]}>
      <View style={styles.workoutCardContent}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutInfo}>
            <View style={styles.workoutNameSkeleton} />
            <View style={styles.workoutDateSkeleton} />
          </View>
          <View style={styles.workoutDurationSkeleton} />
        </View>
        
        <View style={styles.workoutStats}>
          <View style={styles.workoutStat}>
            <View style={styles.iconSkeleton} />
            <View style={styles.workoutStatTextSkeleton} />
          </View>
          <View style={styles.workoutStat}>
            <View style={styles.iconSkeleton} />
            <View style={styles.workoutStatTextSkeleton} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const WorkoutListSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.listContent}>
        {Array.from({ length: 8 }).map((_, index) => (
          <WorkoutCardSkeleton key={index} delay={index * 100} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  workoutCard: {
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  workoutCardContent: {
    backgroundColor: colors.primaryAccent,
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutNameSkeleton: {
    height: 16,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '70%',
    marginBottom: 12,
  },
  workoutDateSkeleton: {
    height: 14,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '50%',
  },
  workoutDurationSkeleton: {
    height: 24,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 12,
    width: 60,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  iconSkeleton: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.whiteOverlay,
  },
  workoutStatTextSkeleton: {
    height: 12,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: 80,
    marginLeft: 4,
  },
});

export default WorkoutListSkeleton;
