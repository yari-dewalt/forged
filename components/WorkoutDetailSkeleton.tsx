import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface WorkoutDetailSkeletonProps {
  exerciseCount?: number;
  hasMuscleData?: boolean;
  hasEquipment?: boolean;
  hasNotes?: boolean;
}

export default function WorkoutDetailSkeleton({ 
  exerciseCount = 5,
  hasMuscleData = true,
  hasEquipment = true,
  hasNotes = false
}: WorkoutDetailSkeletonProps) {
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

  const WorkoutHeaderSkeleton = () => (
    <View style={styles.workoutHeader}>
      <SkeletonBox style={styles.workoutNameSkeleton} />
      <SkeletonBox style={styles.routineInfoSkeleton} delay={50} />
      <View style={styles.workoutStats}>
        <SkeletonBox style={styles.workoutStatSkeleton} delay={100} />
        <SkeletonBox style={styles.workoutStatSkeleton} delay={150} />
        <SkeletonBox style={styles.workoutStatSkeleton} delay={200} />
      </View>
      <SkeletonBox style={styles.startWorkoutButtonSkeleton} delay={250} />
    </View>
  );

  const UserSectionSkeleton = () => (
    <View style={styles.userSection}>
      <View style={styles.userInfo}>
        <SkeletonBox style={styles.userAvatarSkeleton} delay={300} />
        <View style={styles.userDetails}>
          <SkeletonBox style={styles.userTextSkeleton} delay={350} />
          <SkeletonBox style={styles.workoutDateSkeleton} delay={400} />
        </View>
      </View>
    </View>
  );

  const NotesSectionSkeleton = () => (
    <View style={styles.notesSection}>
      <SkeletonBox style={styles.sectionTitleSkeleton} delay={450} />
      <SkeletonBox style={styles.notesTextSkeleton} delay={500} />
    </View>
  );

  const MuscleSplitSkeleton = () => (
    <View style={styles.muscleSplitSection}>
      <SkeletonBox style={styles.sectionTitleSkeleton} delay={550} />
      {Array.from({ length: 4 }).map((_, index) => (
        <View key={index} style={styles.muscleBar}>
          <View style={styles.muscleBarHeader}>
            <SkeletonBox style={styles.muscleBarLabelSkeleton} delay={600 + (index * 25)} />
            <SkeletonBox style={styles.muscleBarPercentageSkeleton} delay={625 + (index * 25)} />
          </View>
          <SkeletonBox style={styles.muscleBarBackgroundSkeleton} delay={650 + (index * 25)} />
        </View>
      ))}
    </View>
  );

  const EquipmentSectionSkeleton = () => (
    <View style={styles.equipmentSection}>
      <SkeletonBox style={styles.sectionTitleSkeleton} delay={750} />
      <View style={styles.equipmentGrid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBox 
            key={index} 
            style={styles.equipmentItemSkeleton} 
            delay={800 + (index * 50)} 
          />
        ))}
      </View>
    </View>
  );

  const ExerciseItemSkeleton = ({ index }: { index: number }) => (
    <View key={index} style={styles.exerciseItemWrapper}>
      <View style={styles.exerciseItemContent}>
        <View style={styles.exerciseSelectableArea}>
          <SkeletonBox style={styles.exerciseImageSkeleton} delay={950 + (index * 100)} />
          <View style={styles.exerciseInfo}>
            <View style={styles.exerciseNameRow}>
              <SkeletonBox 
                style={styles.exerciseNameSkeleton} 
                delay={1000 + (index * 100)} 
              />
            </View>
          </View>
        </View>
      </View>
      
      {/* Sets container skeleton */}
      <View style={styles.setsContainer}>
        {/* Sets header skeleton */}
        <View style={styles.setsHeader}>
          <SkeletonBox style={styles.setHeaderSkeleton} delay={1050 + (index * 100)} />
          <SkeletonBox style={styles.setHeaderSkeleton} delay={1075 + (index * 100)} />
          <SkeletonBox style={styles.setHeaderSkeleton} delay={1100 + (index * 100)} />
          <SkeletonBox style={styles.setHeaderSkeleton} delay={1125 + (index * 100)} />
        </View>
        
        {/* Sets data skeleton - typically 3-5 sets per exercise */}
        {Array.from({ length: 4 }).map((_, setIndex) => (
          <View key={setIndex} style={[
            styles.setRow,
            setIndex % 2 === 1 && styles.setRowAlternate
          ]}>
            <SkeletonBox 
              style={styles.setDataSkeleton} 
              delay={1150 + (index * 100) + (setIndex * 25)} 
            />
            <SkeletonBox 
              style={styles.setDataSkeleton} 
              delay={1175 + (index * 100) + (setIndex * 25)} 
            />
            <SkeletonBox 
              style={styles.setDataSkeleton} 
              delay={1200 + (index * 100) + (setIndex * 25)} 
            />
            <SkeletonBox 
              style={styles.setDataSkeleton} 
              delay={1225 + (index * 100) + (setIndex * 25)} 
            />
          </View>
        ))}
      </View>
    </View>
  );

  const ExercisesSectionSkeleton = () => (
    <View style={styles.exercisesSection}>
      <SkeletonBox style={styles.exercisesSectionTitleSkeleton} delay={900} />
      {Array.from({ length: exerciseCount }).map((_, index) => (
        <ExerciseItemSkeleton key={index} index={index} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <WorkoutHeaderSkeleton />
        <UserSectionSkeleton />
        {hasNotes && <NotesSectionSkeleton />}
        <View style={styles.sectionDivider} />
        {hasMuscleData && <MuscleSplitSkeleton />}
        {hasEquipment && <EquipmentSectionSkeleton />}
        <ExercisesSectionSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingBottom: 40,
    backgroundColor: colors.background,
  },
  workoutHeader: {
    padding: 20,
    paddingBottom: 12,
  },
  workoutNameSkeleton: {
    width: width * 0.6,
    height: 24,
    borderRadius: 4,
    marginBottom: 8,
  },
  routineInfoSkeleton: {
    width: width * 0.4,
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  workoutStatSkeleton: {
    width: 80,
    height: 12,
    borderRadius: 4,
  },
  startWorkoutButtonSkeleton: {
    height: 44,
    borderRadius: 8,
    marginTop: 16,
  },
  userSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userTextSkeleton: {
    width: width * 0.5,
    height: 14,
    borderRadius: 4,
  },
  workoutDateSkeleton: {
    width: width * 0.6,
    height: 12,
    borderRadius: 4,
  },
  notesSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  sectionTitleSkeleton: {
    width: 80,
    height: 18,
    borderRadius: 4,
    marginBottom: 12,
  },
  notesTextSkeleton: {
    width: width * 0.8,
    height: 40,
    borderRadius: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.whiteOverlay,
    marginVertical: 8,
  },
  muscleSplitSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  muscleBar: {
    marginBottom: 12,
  },
  muscleBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  muscleBarLabelSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  muscleBarPercentageSkeleton: {
    width: 40,
    height: 14,
    borderRadius: 4,
  },
  muscleBarBackgroundSkeleton: {
    height: 8,
    borderRadius: 4,
    width: '100%',
  },
  equipmentSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
  },
  equipmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentItemSkeleton: {
    width: 80,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
  },
  exercisesSection: {
    backgroundColor: colors.background,
    paddingTop: 12,
  },
  exercisesSectionTitleSkeleton: {
    width: 80,
    height: 18,
    borderRadius: 4,
    marginBottom: 12,
    marginLeft: 20,
  },
  exerciseItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
    position: 'relative',
  },
  exerciseItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
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
  },
  exerciseNameSkeleton: {
    width: width * 0.4,
    height: 16,
    borderRadius: 4,
  },
  setsContainer: {
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  setHeaderSkeleton: {
    flex: 1,
    height: 12,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  setRowAlternate: {
    backgroundColor: colors.primaryAccent,
  },
  setDataSkeleton: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    marginHorizontal: 8,
  },
});
