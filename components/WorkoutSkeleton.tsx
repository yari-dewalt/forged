import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

export default function WorkoutSkeleton() {
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
    <GestureHandlerRootView>
    <ScrollView style={styles.container}>
      {/* Quick Start Section */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionTitleSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.quickStartSkeleton, { opacity: pulseAnim }]} />
      </View>

      {/* My Routines Section */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionTitleSkeleton, { opacity: pulseAnim }]} />
        
        {/* Quick Action Buttons */}
        <View style={styles.quickActionsContainer}>
          <Animated.View style={[styles.quickActionSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.quickActionSkeleton, { opacity: pulseAnim }]} />
        </View>
        
        {/* Routine Cards */}
        <View style={styles.routinesContainer}>
          {Array.from({ length: 3 }, (_, index) => (
            <RoutineCardSkeleton key={index} delay={index * 150} />
          ))}
          <Animated.View style={[styles.viewAllButtonSkeleton, { opacity: pulseAnim }]} />
        </View>
      </View>

      {/* Workout History Section */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionTitleSkeleton, { opacity: pulseAnim }]} />
        
        <View style={styles.historyContainer}>
          {Array.from({ length: 3 }, (_, index) => (
            <HistoryCardSkeleton key={index} delay={index * 100} />
          ))}
          <Animated.View style={[styles.viewAllButtonSkeleton, { opacity: pulseAnim }]} />
        </View>
      </View>
    </ScrollView>
    </GestureHandlerRootView>
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
      <View style={styles.routineCardContent}>
        <Animated.View style={[styles.routineTitleSkeleton, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.routineDetailsSkeleton, { opacity: pulseAnim }]} />
      </View>
      <Animated.View style={[styles.startButtonSkeleton, { opacity: pulseAnim }]} />
    </View>
  );
}

// Individual history card skeleton
function HistoryCardSkeleton({ delay }: { delay: number }) {
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
    <View style={styles.historyCard}>
      <Animated.View style={[styles.historyDateSkeleton, { opacity: pulseAnim }]} />
      <View style={styles.historyDetails}>
        <Animated.View style={[styles.historyTitleSkeleton, { opacity: pulseAnim }]} />
        <View style={styles.historyStats}>
          <Animated.View style={[styles.historyStatSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.historyStatSkeleton, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.historyStatSkeleton, { opacity: pulseAnim }]} />
        </View>
      </View>
      <Animated.View style={[styles.chevronSkeleton, { opacity: pulseAnim }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitleSkeleton: {
    height: 22,
    width: 140,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 12,
  },
  quickStartSkeleton: {
    height: 100,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  quickActionSkeleton: {
    flex: 1,
    height: 44,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 10,
  },
  routinesContainer: {
    marginBottom: 16,
  },
  routineCard: {
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  routineCardContent: {
    marginBottom: 12,
  },
  routineTitleSkeleton: {
    height: 19,
    width: '70%',
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 8,
  },
  routineDetailsSkeleton: {
    height: 14,
    width: '90%',
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  startButtonSkeleton: {
    height: 44,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 10,
  },
  viewAllButtonSkeleton: {
    height: 36,
    width: 150,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    alignSelf: 'center',
  },
  historyContainer: {
    marginBottom: 16,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  historyDateSkeleton: {
    width: 60,
    height: 36,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 6,
    marginRight: 16,
  },
  historyDetails: {
    flex: 1,
  },
  historyTitleSkeleton: {
    height: 19,
    width: '75%',
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
    marginBottom: 10,
  },
  historyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyStatSkeleton: {
    height: 14,
    width: 60,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  chevronSkeleton: {
    width: 20,
    height: 20,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 10,
  },
});
