import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, FlatList } from 'react-native';
import { colors } from '../constants/colors';

export default function ExploreRoutinesSkeleton() {
  return (
    <View style={styles.container}>
      {/* Trending Section */}
      <View style={styles.section}>
        <TrendingSectionSkeleton />
      </View>

      {/* All Routines Section */}
      <View style={styles.section}>
        <AllRoutinesSectionSkeleton />
      </View>
    </View>
  );
}

// Trending section skeleton
function TrendingSectionSkeleton() {
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
    <View style={styles.trendingSection}>
      {/* Section title */}
      <Animated.View style={[styles.sectionTitleSkeleton, { opacity: pulseAnim }]} />
      
      {/* Horizontal scrolling routine cards */}
      <View style={styles.horizontalContainer}>
        {Array.from({ length: 3 }, (_, index) => (
          <TrendingRoutineCardSkeleton key={index} delay={index * 100} />
        ))}
      </View>
    </View>
  );
}

// All routines section skeleton
function AllRoutinesSectionSkeleton() {
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
    <View style={styles.allRoutinesSection}>
      {/* Section title */}
      <Animated.View style={[styles.sectionTitleSkeleton, { opacity: pulseAnim }]} />
      
      {/* Filter/sort options */}
      <View style={styles.filterContainer}>
        <Animated.View style={[styles.filterButtonSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.filterButtonSkeleton, { opacity: pulseAnim }]} />
      </View>
      
      {/* Routine cards list */}
      <View style={styles.routinesList}>
        {Array.from({ length: 4 }, (_, index) => (
          <RoutineCardSkeleton key={index} delay={index * 150} />
        ))}
      </View>
    </View>
  );
}

// Individual trending routine card skeleton
function TrendingRoutineCardSkeleton({ delay }: { delay: number }) {
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
    <View style={styles.trendingCard}>
      {/* Badge */}
      <Animated.View style={[styles.badgeSkeleton, { opacity: pulseAnim }]} />
      
      {/* Title */}
      <Animated.View style={[styles.cardTitleSkeleton, { opacity: pulseAnim }]} />
      
      {/* Creator info */}
      <View style={styles.creatorInfo}>
        <Animated.View style={[styles.creatorAvatarSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.creatorNameSkeleton, { opacity: pulseAnim }]} />
      </View>
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <Animated.View style={[styles.statSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.statSkeleton, { opacity: pulseAnim }]} />
      </View>
      
      {/* Muscle groups */}
      <View style={styles.muscleGroups}>
        <Animated.View style={[styles.muscleGroupSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.muscleGroupSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.muscleGroupSkeleton, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
}

// Individual routine card skeleton
function RoutineCardSkeleton({ delay }: { delay: number }) {
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
    <View style={styles.routineCard}>
      {/* Header with title and save button */}
      <View style={styles.cardHeader}>
        <Animated.View style={[styles.routineTitleSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.saveButtonSkeleton, { opacity: pulseAnim }]} />
      </View>
      
      {/* Creator info */}
      <View style={styles.creatorInfo}>
        <Animated.View style={[styles.creatorAvatarSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.creatorNameSkeleton, { opacity: pulseAnim }]} />
      </View>
      
      {/* Exercises count */}
      <Animated.View style={[styles.exerciseCountSkeleton, { opacity: pulseAnim }]} />
      
      {/* Muscle groups */}
      <View style={styles.muscleGroups}>
        <Animated.View style={[styles.muscleGroupSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.muscleGroupSkeleton, { opacity: pulseAnim }]} />
      </View>
      
      {/* Stats row */}
      <View style={styles.statsRow}>
        <Animated.View style={[styles.statSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.statSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.statSkeleton, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: 24,
  },
  trendingSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  allRoutinesSection: {
    paddingHorizontal: 16,
  },
  sectionTitleSkeleton: {
    height: 24,
    width: 150,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 16,
  },
  horizontalContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  trendingCard: {
    width: 280,
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    padding: 16,
  },
  badgeSkeleton: {
    height: 20,
    width: 60,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 10,
    marginBottom: 12,
  },
  cardTitleSkeleton: {
    height: 20,
    width: '80%',
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorAvatarSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondaryAccent,
    marginRight: 8,
  },
  creatorNameSkeleton: {
    height: 14,
    width: 80,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statSkeleton: {
    height: 14,
    width: 50,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleGroupSkeleton: {
    height: 24,
    width: 60,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButtonSkeleton: {
    height: 36,
    width: 80,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 8,
  },
  routinesList: {
    gap: 12,
  },
  routineCard: {
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineTitleSkeleton: {
    height: 20,
    width: '70%',
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  saveButtonSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryAccent,
  },
  exerciseCountSkeleton: {
    height: 16,
    width: 100,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
