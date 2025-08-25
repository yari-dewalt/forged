import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const ActivityChartSkeleton: React.FC = () => {
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

    animate();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      {/* Selected point stats */}
      <View style={styles.selectedPointStatsContainer}>
        <View style={styles.selectedPointDateContainer}>
          <View style={styles.selectedPointDateSkeleton} />
          <View style={styles.selectedPointValueSkeleton} />
        </View>
      </View>
      
      {/* Chart skeleton */}
      <View style={styles.chartContainer}>
        <View style={styles.chartSkeleton}>
          {/* Chart lines skeleton */}
          <View style={styles.chartLinesSkeleton}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={styles.chartHorizontalLine} />
            ))}
          </View>
          
          {/* Chart dots skeleton */}
          <View style={styles.chartDotsContainer}>
            {Array.from({ length: 8 }).map((_, index) => (
              <ChartDotSkeleton key={index} delay={index * 100} />
            ))}
          </View>
          
          {/* Chart labels skeleton */}
          <View style={styles.chartLabelsContainer}>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={index} style={styles.chartLabelSkeleton} />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

interface ChartDotSkeletonProps {
  delay: number;
}

const ChartDotSkeleton: React.FC<ChartDotSkeletonProps> = ({ delay }) => {
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
    <Animated.View style={[styles.chartDotSkeleton, { opacity }]} />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryAccent,
  },
  
  // Selected Point Stats Skeleton
  selectedPointStatsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: colors.primaryAccent,
  },
  selectedPointDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPointDateSkeleton: {
    height: 14,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: 70,
  },
  selectedPointValueSkeleton: {
    height: 16,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: 60,
  },
  
  // Chart Skeleton Styles
  chartContainer: {
    alignItems: 'center',
    paddingRight: 0,
  },
  chartSkeleton: {
    width: Dimensions.get('window').width,
    height: 220,
    backgroundColor: colors.primaryAccent,
    borderRadius: 16,
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
  },
  chartLinesSkeleton: {
    position: 'absolute',
    top: 40,
    left: 55,
    right: 20,
    bottom: 60,
    justifyContent: 'space-between',
  },
  chartHorizontalLine: {
    height: 1,
    backgroundColor: colors.whiteOverlay,
    opacity: 0.3,
  },
  chartDotsContainer: {
    position: 'absolute',
    top: 50,
    left: 65,
    right: 30,
    bottom: 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  chartDotSkeleton: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.whiteOverlay,
  },
  chartLabelsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 55,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabelSkeleton: {
    height: 12,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: 40,
  },
});

export default ActivityChartSkeleton;
