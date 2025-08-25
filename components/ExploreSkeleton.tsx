import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import SuggestedUsersSkeleton from './SuggestedUsersSkeleton';
import FeedSkeleton from './Post/FeedSkeleton';

export default function ExploreSkeleton() {
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Suggested Users Section Skeleton */}
      <View style={styles.sectionContainer}>
        <SuggestedUsersSkeleton count={4} />
      </View>
      
      {/* Feed Posts Section Skeleton */}
      <View style={styles.postsContainer}>
        <FeedSkeleton count={3} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    gap: 16,
    paddingVertical: 16,
  },
  sectionContainer: {
    gap: 8,
  },
  postsContainer: {
    gap: 0,
  },
});
