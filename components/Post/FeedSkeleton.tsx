import React from 'react';
import { View } from 'react-native';
import PostSkeleton from './PostSkeleton';

interface FeedSkeletonProps {
  count?: number;
}

export default function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton 
          key={index} 
          showMedia={Math.random() > 0.3} // Randomly show media on ~70% of skeletons
          delay={index * 200} // Stagger the animation start times
        />
      ))}
    </View>
  );
}
