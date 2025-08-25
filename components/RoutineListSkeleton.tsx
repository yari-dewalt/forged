import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

export default function RoutineListSkeleton() {
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
      {/* Content section */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Array.from({ length: 6 }, (_, index) => (
          <RoutineCardSkeleton key={index} delay={index * 100} />
        ))}
      </ScrollView>
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
        <View style={styles.titleContainer}>
          <Animated.View style={[styles.routineTitleSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.officialBadgeSkeleton, { opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.saveButtonSkeleton, { opacity: pulseAnim }]} />
      </View>
      
      {/* Creator info */}
      <View style={styles.creatorInfo}>
        <Animated.View style={[styles.creatorAvatarSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.creatorNameSkeleton, { opacity: pulseAnim }]} />
      </View>
      
      {/* Exercise count */}
      <Animated.View style={[styles.exerciseCountSkeleton, { opacity: pulseAnim }]} />
      
      {/* Muscle groups */}
      <View style={styles.muscleGroups}>
        <Animated.View style={[styles.muscleGroupSkeleton, { opacity: pulseAnim }]} />
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
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  routineCard: {
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  routineTitleSkeleton: {
    height: 20,
    width: 150,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  officialBadgeSkeleton: {
    height: 20,
    width: 16,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 10,
  },
  saveButtonSkeleton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondaryAccent,
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
    width: 120,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  exerciseCountSkeleton: {
    height: 16,
    width: 100,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 12,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  muscleGroupSkeleton: {
    height: 24,
    width: 70,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statSkeleton: {
    height: 14,
    width: 60,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
});
