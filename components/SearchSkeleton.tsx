import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface SearchSkeletonProps {
  count?: number;
}

const SearchSkeleton: React.FC<SearchSkeletonProps> = ({ count = 6 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SearchResultSkeleton key={index} delay={index * 100} />
      ))}
    </View>
  );
};

interface SearchResultSkeletonProps {
  delay: number;
}

const SearchResultSkeleton: React.FC<SearchResultSkeletonProps> = ({ delay }) => {
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
    <Animated.View style={[styles.searchResultItem, { opacity }]}>
      {/* Avatar skeleton */}
      <View style={styles.avatar} />
      
      {/* User info skeleton */}
      <View style={styles.userInfo}>
        <View style={styles.username} />
        <View style={styles.metadata} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.whiteOverlay,
  },
  userInfo: {
    flex: 1,
    gap: 6,
  },
  username: {
    height: 16,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '45%',
  },
  metadata: {
    height: 14,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
    width: '65%',
  },
});

export default SearchSkeleton;
