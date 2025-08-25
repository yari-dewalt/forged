import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { colors } from '../constants/colors';
import * as VideoThumbnails from 'expo-video-thumbnails';

interface VideoThumbnailProps {
  videoUri: string;
  style?: any;
  placeholder?: React.ReactNode;
  onThumbnailGenerated?: (thumbnailUri: string) => void;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ 
  videoUri, 
  style, 
  placeholder,
  onThumbnailGenerated 
}) => {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    generateThumbnail();
  }, [videoUri]);

  const generateThumbnail = async () => {
    try {
      setLoading(true);
      setError(false);
      
      // Generate thumbnail using expo-video-thumbnails
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000, // 1 second
        quality: 0.8,
      });
      
      if (uri) {
        setThumbnailUri(uri);
        onThumbnailGenerated?.(uri);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error generating video thumbnail:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        {placeholder || (
          <View style={styles.loadingContainer}>
          </View>
        )}
      </View>
    );
  }

  if (error || !thumbnailUri) {
    return (
      <View style={[styles.container, style]}>
        {placeholder || (
          <View style={styles.errorContainer}>
            <View style={styles.errorPlaceholder} />
          </View>
        )}
      </View>
    );
  }

  return (
    <Image
      source={{ uri: thumbnailUri }}
      style={[styles.thumbnail, style]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorPlaceholder: {
    width: 30,
    height: 30,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});

export default VideoThumbnail;
