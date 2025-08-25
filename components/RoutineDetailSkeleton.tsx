import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface RoutineDetailSkeletonProps {
  exerciseCount?: number;
}

export default function RoutineDetailSkeleton({ exerciseCount = 6 }: RoutineDetailSkeletonProps) {
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

  const HeaderSkeleton = () => (
    <View style={styles.routineHeader}>
      <View style={styles.routineNameRow}>
        <SkeletonBox style={[styles.skeletonText, styles.routineNameSkeleton]} />
        <View style={styles.actionButtonsContainer}>
          <SkeletonBox style={styles.actionButtonSkeleton} delay={50} />
          <SkeletonBox style={styles.actionButtonSkeleton} delay={100} />
        </View>
      </View>
      <View style={styles.routineStats}>
        <SkeletonBox style={[styles.skeletonText, styles.routineStatsSkeleton]} delay={150} />
      </View>
    </View>
  );

  const CreatorSkeleton = () => (
    <View style={styles.creatorSection}>
      <View style={styles.creatorInfo}>
        <SkeletonBox style={styles.avatarSkeleton} delay={200} />
        <View style={styles.creatorDetails}>
          <SkeletonBox style={[styles.skeletonText, styles.creatorNameSkeleton]} delay={250} />
          <SkeletonBox style={[styles.skeletonText, styles.creatorDateSkeleton]} delay={300} />
        </View>
      </View>
    </View>
  );

  const StatisticsSkeleton = () => (
    <View style={styles.statisticsSection}>
      <View style={styles.statisticsContainer}>
        <SkeletonBox style={[styles.skeletonText, styles.statisticItemSkeleton]} delay={350} />
        <SkeletonBox style={[styles.skeletonText, styles.statisticItemSkeleton]} delay={400} />
        <SkeletonBox style={[styles.skeletonText, styles.statisticItemSkeleton]} delay={450} />
      </View>
    </View>
  );

  const ActionButtonSkeleton = () => (
    <View style={styles.actionButtonContainer}>
      <SkeletonBox style={styles.startWorkoutButtonSkeleton} delay={500} />
    </View>
  );

  const ExerciseItemSkeleton = ({ index }: { index: number }) => (
    <View key={index} style={styles.exerciseItemWrapper}>
      <View style={styles.exerciseItemContent}>
        <View style={styles.exerciseSelectableArea}>
          <SkeletonBox style={styles.exerciseImageSkeleton} delay={550 + (index * 50)} />
          <View style={styles.exerciseInfo}>
            <View style={styles.exerciseNameRow}>
              <SkeletonBox 
                style={[styles.skeletonText, styles.exerciseNameSkeleton]} 
                delay={600 + (index * 50)} 
              />
            </View>
            <View style={styles.exerciseItemDetails}>
              <SkeletonBox 
                style={[styles.skeletonText, styles.exerciseDetailsSkeleton]} 
                delay={650 + (index * 50)} 
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const WorkoutSectionSkeleton = () => (
    <View style={styles.workoutSection}>
      <SkeletonBox style={[styles.skeletonText, styles.sectionTitleSkeleton]} delay={500} />
      {Array.from({ length: exerciseCount }).map((_, index) => (
        <ExerciseItemSkeleton key={index} index={index} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.scrollView}>
        <View style={styles.content}>
          <HeaderSkeleton />
          <CreatorSkeleton />
          <StatisticsSkeleton />
          <ActionButtonSkeleton />
          <WorkoutSectionSkeleton />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  skeletonText: {
    borderRadius: 4,
  },
  routineHeader: {
    padding: 20,
    paddingBottom: 12,
  },
  routineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  routineNameSkeleton: {
    width: width * 0.5,
    height: 24,
  },
  routineStatsSkeleton: {
    width: width * 0.4,
    height: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonSkeleton: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  routineStats: {
    marginTop: 4,
  },
  creatorSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  creatorDetails: {
    flex: 1,
    gap: 4,
  },
  creatorNameSkeleton: {
    width: width * 0.4,
    height: 14,
  },
  creatorDateSkeleton: {
    width: width * 0.25,
    height: 12,
  },
  statisticsSection: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
  },
  statisticsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statisticItemSkeleton: {
    width: 60,
    height: 13,
  },
  actionButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  startWorkoutButtonSkeleton: {
    height: 48,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 6,
  },
  workoutSection: {
    backgroundColor: colors.background,
    paddingTop: 12,
  },
  sectionTitleSkeleton: {
    width: 80,
    height: 18,
    marginBottom: 12,
    marginLeft: 20,
  },
  exerciseItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
  },
  exerciseItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  exerciseSelectableArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImageSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseNameSkeleton: {
    width: width * 0.4,
    height: 16,
  },
  exerciseItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseDetailsSkeleton: {
    width: width * 0.3,
    height: 14,
  },
});
