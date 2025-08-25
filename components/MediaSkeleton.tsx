import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface MediaSkeletonProps {
  viewMode?: 'grid' | 'list';
  count?: number;
}

const MediaItemSkeleton: React.FC<{ delay?: number; viewMode: 'grid' | 'list'; index?: number }> = ({ 
  delay = 0, 
  viewMode,
  index = 0
}) => {
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

  if (viewMode === 'grid') {
    const itemSize = (width - 4) / 3; // 3 columns with 1px gaps
    
    return (
      <Animated.View style={[styles.gridMediaContainer, { width: itemSize, height: itemSize, opacity }]}>
        <View style={styles.gridMediaSkeleton} />
        {/* Randomly show video indicator on some items */}
        {Math.random() > 0.6 && (
          <View style={styles.gridVideoIndicatorSkeleton} />
        )}
      </Animated.View>
    );
  }

  // List view
  const aspectRatio = 16 / 9; // Default aspect ratio for skeleton
  const containerWidth = width - 32; // 16px padding on each side
  const itemHeight = containerWidth / aspectRatio;

  return (
    <Animated.View style={[styles.listMediaContainer, { opacity }]}>
      <View style={[styles.listMediaSkeleton, { height: itemHeight }]}>
        {/* Randomly show mute button on some videos */}
        {Math.random() > 0.5 && (
          <View style={styles.muteButtonSkeleton} />
        )}
      </View>
      {/* Randomly show description on some items */}
      {Math.random() > 0.4 && (
        <View style={styles.descriptionContainer}>
          <View style={styles.descriptionLineSkeleton} />
          <View style={styles.chevronSkeleton} />
        </View>
      )}
    </Animated.View>
  );
};

const MediaSkeleton: React.FC<MediaSkeletonProps> = ({ viewMode = 'list', count = 6 }) => {
  const gridCount = viewMode === 'grid' ? 18 : count; // More items for grid view
  const itemCount = viewMode === 'grid' ? gridCount : count;

  return (
    <View style={styles.container}>
      {viewMode === 'grid' ? (
        <View style={styles.gridContent}>
          {/* Render grid items in rows of 3 */}
          {Array.from({ length: Math.ceil(itemCount / 3) }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.gridRow}>
              {Array.from({ length: 3 }).map((_, colIndex) => {
                const itemIndex = rowIndex * 3 + colIndex;
                if (itemIndex >= itemCount) return null;
                
                return (
                  <MediaItemSkeleton
                    key={itemIndex}
                    delay={itemIndex * 50}
                    viewMode="grid"
                    index={itemIndex}
                  />
                );
              })}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.listContent}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <MediaItemSkeleton
              key={index}
              delay={index * 100}
              viewMode="list"
              index={index}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // List View Styles
  listContent: {
    paddingTop: 6,
    paddingBottom: 20,
  },
  listMediaContainer: {
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listMediaSkeleton: {
    width: '100%',
    backgroundColor: colors.whiteOverlay,
    borderRadius: 8,
    position: 'relative',
  },
  muteButtonSkeleton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 28,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 16,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.primaryAccent,
    gap: 8,
  },
  descriptionLineSkeleton: {
    flex: 1,
    height: 14,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 4,
  },
  chevronSkeleton: {
    width: 20,
    height: 20,
    backgroundColor: colors.whiteOverlay,
    borderRadius: 10,
  },
  
  // Grid View Styles
  gridContent: {
    padding: 1,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  gridMediaContainer: {
    position: 'relative',
    borderRadius: 0,
    overflow: 'hidden',
  },
  gridMediaSkeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.whiteOverlay,
  },
  gridVideoIndicatorSkeleton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.secondaryAccent,
  },
});

export default MediaSkeleton;
