import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface RoutineCardSkeletonProps {
  delay?: number;
}

const RoutineCardSkeleton: React.FC<RoutineCardSkeletonProps> = ({ delay = 0 }) => {
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
    <Animated.View style={[styles.routineCard, { opacity }]}>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.routineInfo}>
            <View style={styles.routineNameRow}>
              <View style={styles.routineNameSkeleton} />
              {/* Randomly show saved badge on some cards */}
              {Math.random() > 0.7 && (
                <View style={styles.savedBadgeSkeleton} />
              )}
            </View>
            <View style={styles.exerciseCountSkeleton} />
          </View>
        </View>
        
        {/* Exercise preview skeleton */}
        <View style={styles.exercisePreview}>
          <View style={styles.exercisePreviewLineSkeleton} />
        </View>
        
        {/* Footer skeleton */}
        <View style={styles.cardFooter}>
          <View style={styles.dateContainer}>
            <View style={styles.iconSkeleton} />
            <View style={styles.lastUsedSkeleton} />
          </View>
          <View style={styles.dateContainer}>
            <View style={styles.iconSkeleton} />
            <View style={styles.lastUpdatedSkeleton} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const RoutineListSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.listContent}>
        {Array.from({ length: 6 }).map((_, index) => (
          <RoutineCardSkeleton key={index} delay={index * 100} />
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
  },
  routineCard: {
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 6,
    height: 150,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineInfo: {
    flex: 1,
  },
  routineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routineNameSkeleton: {
    height: 16,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '60%',
    marginBottom: 8,
  },
  savedBadgeSkeleton: {
    height: 20,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 12,
    width: 60,
  },
  exerciseCountSkeleton: {
    height: 14,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '40%',
  },
  exercisePreview: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 8,
  },
  exercisePreviewLineSkeleton: {
    height: 13,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '85%',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconSkeleton: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.whiteOverlay,
  },
  lastUsedSkeleton: {
    height: 12,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: 80,
  },
  lastUpdatedSkeleton: {
    height: 12,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: 90,
  },
});

export default RoutineListSkeleton;
