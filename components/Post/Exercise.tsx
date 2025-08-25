import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { Ionicons as IonIcon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface ExerciseProps {
  exerciseData: any;
  imageUrl?: string;
  simplified?: boolean;
  postUser?: {
    id: string;
    username?: string;
    name?: string;
    full_name?: string;
  };
}

const Exercise: React.FC<ExerciseProps> = ({ exerciseData, imageUrl, simplified = false, postUser }) => {
  const router = useRouter();
  const [imageLoadError, setImageLoadError] = useState(false);
  
  const handleExercisePress = async () => {
    // Navigate to exercise details using the exercise_id, not the workout_exercise id
    if (exerciseData.exercise_id) {
      router.push(`/exerciseDetails?exerciseId=${exerciseData.exercise_id}`);
    } else {
      // This is a custom exercise - try to find it in local storage by name
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const customExercises = await AsyncStorage.default.getItem('custom_exercises');
        if (customExercises) {
          const exercises = JSON.parse(customExercises);
          const customExercise = exercises.find((ex: any) => ex.name === (exerciseData.exercises?.name || exerciseData.name));
          if (customExercise) {
            router.push(`/exerciseDetails?exerciseId=${customExercise.id}`);
          } else {
            // Show modal about custom exercise not in library
            const creatorUsername = postUser?.username || 'Unknown User';
            const { Alert } = await import('react-native');
            Alert.alert(
              "Custom Exercise", 
              `This custom exercise was created by ${creatorUsername} and is not in your exercise library.`,
              [
                { text: "OK", style: "default" }
              ]
            );
          }
        } else {
          // Show modal about custom exercise not in library
          const creatorUsername = postUser?.username || 'Unknown User';
          const { Alert } = await import('react-native');
          Alert.alert(
            "Custom Exercise", 
            `This custom exercise was created by ${creatorUsername} and is not in your exercise library.`,
            [
              { text: "OK", style: "default" }
            ]
          );
        }
      } catch (error) {
        console.error('Error loading custom exercises:', error);
      }
    }
  };

  const getSetsCount = () => {
    if (exerciseData.workout_sets) {
      return exerciseData.workout_sets.length;
    }
    return exerciseData.sets || 3;
  };
  
  return (
    <TouchableOpacity
                activeOpacity={0.5} style={styles.container} onPress={handleExercisePress}>
      <View style={styles.exerciseNameRow}>
        {/* Exercise Image */}
        {exerciseData.exercises?.image_url && !imageLoadError ? (
          <View style={styles.exerciseImageContainer}>
            <Image 
              source={{ uri: exerciseData.exercises.image_url }}
              style={styles.exerciseImage}
              resizeMode="cover"
              onError={() => setImageLoadError(true)}
            />
          </View>
        ) : (
          <View style={styles.exerciseImagePlaceholder}>
            <IonIcon 
              name={!exerciseData.exercise_id ? "construct-outline" : "barbell-outline"} 
              size={18} 
              color={colors.secondaryText} 
            />
          </View>
        )}
        
        {/* Exercise Name and Set Count */}
        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseNameContainer}>
            <Text style={styles.exerciseName}>
              {exerciseData.exercises?.name || exerciseData.name}
              <Text style={styles.setCount}> ({getSetsCount()} sets)</Text>
            </Text>
            {!exerciseData.exercise_id && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Custom</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  exerciseImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.primaryText,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  exerciseImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.whiteOverlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.whiteOverlay,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brand,
    flex: 1,
  },
  setCount: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.secondaryText,
  },
  customBadge: {
    backgroundColor: colors.customBadgeBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.customBadgeBorder,
  },
  customBadgeText: {
    fontSize: 10,
    color: colors.customBadgeText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default Exercise;