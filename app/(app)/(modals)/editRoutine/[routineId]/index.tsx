import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from "../../../../../constants/colors";
import { supabase } from "../../../../../lib/supabase";
import { useAuthStore } from "../../../../../stores/authStore";
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import * as Haptics from 'expo-haptics';

// Create a simple exercise selection interface since the main one might have complex dependencies
interface ExerciseSelectionProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseData) => void;
}

interface Exercise {
  id: number;
  exerciseId: string;
  name: string;
  totalSets: number;
  defaultWeight: number | null;
  defaultReps: number;
  defaultRPE: number;
  image_url?: string | null;
  isNew?: boolean;
}

interface ExerciseData {
  id: string;
  name: string;
  default_reps?: number;
  default_rpe?: number;
  image_url?: string | null;
}

export default function EditRoutine() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { routineId } = params;
  const { session } = useAuthStore();
  const [routineName, setRoutineName] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [originalRoutineName, setOriginalRoutineName] = useState("");
  const [originalRoutineData, setOriginalRoutineData] = useState<any>(null);
  const nameInputRef = useRef<TextInput>(null);
  const [failedImages, setFailedImages] = useState(new Set<string>());
  
  // Bottom sheet state
  const [exerciseOptionsModalVisible, setExerciseOptionsModalVisible] = useState(false);
  const [selectedExerciseForOptions, setSelectedExerciseForOptions] = useState<Exercise | null>(null);
  const [reorderModalVisible, setReorderModalVisible] = useState(false);
  
  // Bottom Sheet refs
  const exerciseOptionsBottomSheetRef = useRef<BottomSheet>(null);
  const reorderBottomSheetRef = useRef<BottomSheet>(null);
  
  // Bottom Sheet snap points
  const exerciseOptionsSnapPoints = useMemo(() => ['40%'], []);
  const reorderSnapPoints = useMemo(() => ['30%'], []);

  useEffect(() => {
    if (routineId && routineId !== 'new') {
      loadRoutineData();
    } else if (routineId === 'new') {
      // For new routines, set initial state
      setRoutineName("New Routine");
      setOriginalRoutineName("");
      setExercises([]);
      setInitialLoading(false);
    }
  }, [routineId]);

  // Handle exercise selection from the exercise selection screen
  useEffect(() => {
    const handleExerciseSelection = () => {
      // Check if we returned from exercise selection with selected exercises
      if (params?.selectedExercises && params?.fromRoutineEdit) {
        try {
          const selectedExercises = JSON.parse(params.selectedExercises as string);
          if (Array.isArray(selectedExercises) && selectedExercises.length > 0) {
            // Add all selected exercises at once
            const newExercises = selectedExercises.map(exercise => ({
              id: Date.now() + Math.random(), // Unique temporary ID for new exercises
              exerciseId: exercise.id,
              name: exercise.name,
              totalSets: 3,
              defaultWeight: null,
              defaultReps: exercise.default_reps || 8,
              defaultRPE: exercise.default_rpe || 8,
              image_url: exercise.image_url || null,
              isNew: true, // Flag to identify new exercises
            }));
            
            setExercises(prevExercises => {
              const updated = [...prevExercises, ...newExercises];
              return updated;
            });
            
            // Clear the params to prevent this effect from running again
            router.setParams({ selectedExercises: undefined, fromRoutineEdit: undefined });
          }
        } catch (error) {
          //console.error('Error parsing selected exercises:', error);
        }
      }
    };

    handleExerciseSelection();
  }, [params?.selectedExercises, params?.fromRoutineEdit]);

  const loadRoutineData = async () => {
    try {
      setInitialLoading(true);
      
      // Fetch routine details
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();

      if (routineError) throw routineError;

      // Check if user is the original creator of this routine
      // Only the original creator can edit the routine
      const isOriginalCreator = routineData.original_creator_id 
        ? routineData.original_creator_id === session?.user?.id
        : routineData.user_id === session?.user?.id;

      if (!isOriginalCreator) {
        Alert.alert(
          "Cannot Edit Routine", 
          "You can only edit routines that you originally created. This routine was created by someone else.",
          [
            { text: "OK", onPress: () => router.back() }
          ]
        );
        return;
      }

      // Also check if user owns this routine (current user_id)
      if (routineData.user_id !== session?.user?.id) {
        Alert.alert("Error", "You don't have permission to edit this routine");
        router.back();
        return;
      }

      setRoutineName(routineData.name);
      setOriginalRoutineName(routineData.name);
      setOriginalRoutineData(routineData);

      // Fetch routine exercises with exercise details including image
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('routine_exercises')
        .select(`
          *,
          exercises (
            image_url
          )
        `)
        .eq('routine_id', routineId)
        .order('order_position');

      if (exercisesError) throw exercisesError;

      // Transform exercises data to match the state structure
      const transformedExercises = exercisesData.map((exercise) => ({
        id: exercise.id, // Use the routine_exercise ID
        exerciseId: exercise.exercise_id,
        name: exercise.name,
        totalSets: exercise.total_sets || 3,
        defaultWeight: exercise.default_weight,
        defaultReps: exercise.default_reps || 8,
        defaultRPE: exercise.default_rpe || 8,
        image_url: exercise.exercises?.image_url || null,
      }));

      setExercises(transformedExercises);
    } catch (error) {
      console.error("Error loading routine:", error);
      Alert.alert("Error", "Failed to load routine data");
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const addExerciseToRoutine = (exercise: ExerciseData) => {
    // Create a new exercise object with default sets
    const newExercise: Exercise = {
      id: Date.now(), // Temporary ID for new exercises
      exerciseId: exercise.id,
      name: exercise.name,
      totalSets: 3,
      defaultWeight: null,
      defaultReps: exercise.default_reps || 8,
      defaultRPE: exercise.default_rpe || 8,
      image_url: exercise.image_url || null,
      isNew: true, // Flag to identify new exercises
    };
    
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (exerciseId: number) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
  };

  const updateExerciseSets = (exerciseId: number, totalSets: number) => {
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, totalSets } 
        : exercise
    ));
  };

  const updateExerciseDefaults = (exerciseId: number, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, [field]: value } 
        : exercise
    ));
  };

  const handleSaveRoutine = async () => {
    // Validate routine data
    if (routineName.trim() === "") {
      Alert.alert("Error", "Please enter a routine name");
      return;
    }
  
    if (exercises.length === 0) {
      Alert.alert("Error", "Please add at least one exercise to your routine");
      return;
    }
  
    setLoading(true);
  
    try {
      if (routineId === 'new') {
        // Create new routine
        await createNewRoutine();
      } else {
        // Update existing routine - no need to check for duplicate names when editing
        await updateRoutine();
      }
      
    } catch (error) {
      console.error("Error saving routine:", error);
      Alert.alert("Error", "Failed to save routine. Please try again.");
      setLoading(false);
    }
  };

  const promptForNewName = () => {
    Alert.prompt(
      "Duplicate Routine Name",
      "You already have a routine with this name. Please enter a different name:",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setLoading(false)
        },
        {
          text: "Save",
          onPress: (newName) => {
            if (!newName || newName.trim() === "") {
              Alert.alert("Error", "Please enter a valid name");
              return;
            }
            
            setRoutineName(newName.trim());
          }
        }
      ],
      "plain-text",
      routineName,
      "default"
    );
  };

  const updateRoutine = async () => {
    try {
      // Update routine name and timestamp
      const { error: routineError } = await supabase
        .from('routines')
        .update({
          name: routineName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', routineId);

      if (routineError) throw routineError;

      // Delete all existing routine exercises
      const { error: deleteError } = await supabase
        .from('routine_exercises')
        .delete()
        .eq('routine_id', routineId);

      if (deleteError) throw deleteError;

      // Insert all exercises (both existing and new)
      const exercisesData = exercises.map((exercise, index) => {
        // Handle custom exercises vs. database exercises
        const isCustomExercise = !exercise.exerciseId || exercise.exerciseId.startsWith('custom-');
        
        if (isCustomExercise) {
          // This is a custom exercise - don't include exercise_id
          return {
            routine_id: routineId,
            name: exercise.name,
            order_position: index,
            total_sets: exercise.totalSets,
            default_weight: exercise.defaultWeight,
            default_reps: exercise.defaultReps,
            default_rpe: exercise.defaultRPE,
            // exercise_id is intentionally omitted for custom exercises
          };
        } else {
          // This is a database exercise - include exercise_id
          return {
            routine_id: routineId,
            exercise_id: exercise.exerciseId,
            name: exercise.name,
            order_position: index,
            total_sets: exercise.totalSets,
            default_weight: exercise.defaultWeight,
            default_reps: exercise.defaultReps,
            default_rpe: exercise.defaultRPE,
          };
        }
      });

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      Alert.alert(
        "Success",
        "Routine updated successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error("Error updating routine:", error);
      Alert.alert("Error", "Failed to update routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createNewRoutine = async () => {
    try {
      // Check if routine with same name already exists for this user
      const { data: existingRoutines, error: checkError } = await supabase
        .from('routines')
        .select('id, name')
        .eq('user_id', session?.user?.id)
        .ilike('name', routineName.trim())
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (existingRoutines && existingRoutines.length > 0) {
        setLoading(false);
        promptForNewName();
        return;
      }
      
      // Create the routine
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .insert({
          name: routineName.trim(),
          user_id: session?.user?.id,
        })
        .select('id')
        .single();

      if (routineError) throw routineError;

      const newRoutineId = routineData.id;

      // Add exercises to the routine
      const exercisesData = exercises.map((exercise, index) => {
        // Handle custom exercises vs. database exercises
        const isCustomExercise = !exercise.exerciseId || exercise.exerciseId.startsWith('custom-');
        
        if (isCustomExercise) {
          // This is a custom exercise - don't include exercise_id
          return {
            routine_id: newRoutineId,
            name: exercise.name,
            order_position: index,
            total_sets: exercise.totalSets,
            default_weight: exercise.defaultWeight,
            default_reps: exercise.defaultReps,
            default_rpe: exercise.defaultRPE,
            // exercise_id is intentionally omitted for custom exercises
          };
        } else {
          // This is a database exercise - include exercise_id
          return {
            routine_id: newRoutineId,
            exercise_id: exercise.exerciseId,
            name: exercise.name,
            order_position: index,
            total_sets: exercise.totalSets,
            default_weight: exercise.defaultWeight,
            default_reps: exercise.defaultReps,
            default_rpe: exercise.defaultRPE,
          };
        }
      });

      const { error: exercisesError } = await supabase
        .from('routine_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      Alert.alert(
        "Success",
        "Routine created successfully!",
        [
          {
            text: "OK",
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error("Error creating routine:", error);
      Alert.alert("Error", "Failed to create routine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Check if there are any changes
    const hasChanges = routineId === 'new' 
      ? (routineName.trim() !== "New Routine" || exercises.length > 0)
      : (routineName.trim() !== originalRoutineName || 
         exercises.some(ex => ex.isNew) ||
         exercises.length === 0); // If all exercises were deleted

    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        routineId === 'new' 
          ? "Are you sure you want to discard your new routine?"
          : "Are you sure you want to discard your changes?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleNameChange = (newName: string) => {
    const nameToSave = newName.trim() || "New Routine";
    setRoutineName(nameToSave);
    setIsEditingName(false);
  };

  // Bottom Sheet callbacks
  const handleExerciseOptionsSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setExerciseOptionsModalVisible(false);
      setSelectedExerciseForOptions(null);
    }
  }, []);

  const handleReorderSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setReorderModalVisible(false);
    }
  }, []);

  // Functions to show exercise options
  const showExerciseOptions = (exercise: Exercise) => {
    setSelectedExerciseForOptions(exercise);
    setExerciseOptionsModalVisible(true);
    exerciseOptionsBottomSheetRef.current?.expand();
  };

  const handleReorderExercises = () => {
    exerciseOptionsBottomSheetRef.current?.close();
    setTimeout(() => {
      setReorderModalVisible(true);
      reorderBottomSheetRef.current?.expand();
    }, 200);
  };

  const handleRemoveExercise = () => {
    if (!selectedExerciseForOptions) return;
    
    Alert.alert(
      "Remove Exercise",
      `Are you sure you want to remove "${selectedExerciseForOptions.name}" from your routine?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeExercise(selectedExerciseForOptions.id);
            exerciseOptionsBottomSheetRef.current?.close();
          }
        }
      ]
    );
  };

  const showExerciseDetails = async (exercise: Exercise) => {
    // For custom exercises (exercise_id is null), we need to find the custom exercise ID
    // Custom exercises are identified by having no exercise_id and should be loaded from local storage
    let exerciseId = exercise.exerciseId;
    
    if (!exercise.exerciseId) {
      // This is a custom exercise - try to find it in local storage by name
      try {
        const customExercises = await AsyncStorage.getItem('custom_exercises');
        if (customExercises) {
          const exercises = JSON.parse(customExercises);
          const customExercise = exercises.find((ex: any) => ex.name === exercise.name);
          if (customExercise) {
            exerciseId = customExercise.id;
          } else {
            // If not found in local storage, don't navigate
            console.log('Custom exercise not found in local storage:', exercise.name);
            return;
          }
        } else {
          // If no custom exercises in storage, don't navigate
          console.log('No custom exercises found in local storage');
          return;
        }
      } catch (error) {
        console.error('Error loading custom exercises:', error);
        return;
      }
    }
    
    router.push({
      pathname: '/(app)/(modals)/exerciseDetails',
      params: { 
        exerciseId: exerciseId,
        exerciseName: exercise.name,
        fromRoutineEdit: 'true'
      }
    });
  };

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
                activeOpacity={0.5} onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {isEditingName ? (
          <TextInput
            ref={nameInputRef}
            style={styles.headerTitleInput}
            value={routineName}
            onChangeText={setRoutineName}
            onBlur={() => handleNameChange(routineName)}
            onSubmitEditing={() => handleNameChange(routineName)}
            autoFocus
            selectTextOnFocus
            placeholder="Routine Name"
            placeholderTextColor={colors.secondaryText}
          />
        ) : (
          <TouchableOpacity
                activeOpacity={0.5} 
            onPress={() => {
              setIsEditingName(true);
              setTimeout(() => nameInputRef.current?.focus(), 100);
            }}
            style={styles.headerTitleContainer}
          >
            <View style={styles.editableHeaderTitle}>
              <Text style={styles.headerTitle}>
                {routineName || 'Untitled Routine'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
                activeOpacity={0.5} 
          onPress={handleSaveRoutine} 
          style={styles.headerButton}
          disabled={loading}
        >
            <Text style={styles.saveText}>
              {routineId === 'new' ? 'Create' : 'Save'}
            </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {exercises.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="barbell-outline" size={60} color={colors.secondaryText} />
            <Text style={styles.emptyStateTitle}>No exercises yet</Text>
            <Text style={styles.emptyStateText}>
              Start adding exercises to your routine
            </Text>
            <TouchableOpacity
                activeOpacity={0.5}
              style={styles.emptyStateButton}
              onPress={() => router.push({
                pathname: '/(app)/(modals)/exerciseSelection',
                params: { fromRoutineEdit: 'true', routineId: routineId }
              })}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.primaryText} />
              <Text style={styles.emptyStateButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.exercisesContainer}>
            {exercises.map((item) => (
              <View 
                key={item.id} 
                style={[
                  styles.exerciseCard, 
                ]}
              >
                {/* Exercise header with name and options */}
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNameContainer}>
                    <View style={styles.exerciseTitleRow}>
                      {/* Exercise name and image pressable area */}
                      <TouchableOpacity
                activeOpacity={0.5} 
                        style={styles.exerciseTitlePressable}
                      >
                        <View style={styles.exerciseNameAndBadgeContainer}>
                          <TouchableOpacity
                activeOpacity={0.5} 
                            onPress={() => showExerciseDetails(item)}
                            style={styles.exerciseNamePressable}
                          >
                            <View style={styles.exerciseNameRow}>
                              {/* Exercise Image */}
                              {item.image_url && !failedImages.has(item.id.toString()) ? (
                                <Image 
                                  source={{ uri: item.image_url }}
                                  style={styles.exerciseImage}
                                  resizeMode="cover"
                                  onError={() => {
                                    setFailedImages(prev => new Set(prev).add(item.id.toString()));
                                  }}
                                />
                              ) : (
                                <View style={styles.exerciseImagePlaceholder}>
                                  <Ionicons 
                                    name={(!item.exerciseId || item.exerciseId.startsWith('custom-')) ? "construct-outline" : "barbell-outline"} 
                                    size={20} 
                                    color={colors.secondaryText} 
                                  />
                                </View>
                              )}
                              
                              {/* Exercise Name */}
                              <Text style={styles.exerciseName}>{item.name}</Text>
                            </View>
                          </TouchableOpacity>
                          
                          {/* Custom Exercise Badge */}
                          {(!item.exerciseId || item.exerciseId.startsWith('custom-')) && (
                            <View style={styles.customBadge}>
                              <Text style={styles.customBadgeText}>Custom</Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                      
                      {/* Keep the options button separate */}
                      <TouchableOpacity
                activeOpacity={0.5} 
                        style={styles.exerciseOptionsButton}
                        onPress={() => showExerciseOptions(item)}
                      >
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.secondaryText} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                
                {/* Exercise configuration inline */}
                <View style={styles.exerciseInlineConfig}>
                  <View style={styles.configRow}>
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>Sets</Text>
                      <View style={styles.setCountControl}>
                        <TouchableOpacity
                activeOpacity={0.5} 
                          style={styles.setCountButton}
                          onPress={() => {
                            if (item.totalSets > 1) {
                              updateExerciseSets(item.id, item.totalSets - 1);
                            }
                          }}
                        >
                          <Ionicons name="remove" size={16} color={colors.primaryText} />
                        </TouchableOpacity>
                        <Text style={styles.setCountText}>{item.totalSets}</Text>
                        <TouchableOpacity
                activeOpacity={0.5} 
                          style={styles.setCountButton}
                          onPress={() => updateExerciseSets(item.id, item.totalSets + 1)}
                        >
                          <Ionicons name="add" size={16} color={colors.primaryText} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>Default Reps</Text>
                      <TextInput
                        style={styles.configInput}
                        value={item.defaultReps?.toString() || ''}
                        onChangeText={(text) => {
                          const numValue = parseInt(text) || 0;
                          if (numValue >= 0) {
                            updateExerciseDefaults(item.id, "defaultReps", numValue);
                          }
                        }}
                        keyboardType="numeric"
                        placeholder="8"
                        placeholderTextColor={colors.secondaryText}
                      />
                    </View>
                    
                    <View style={styles.configItem}>
                      <Text style={styles.configLabel}>Default RPE</Text>
                      <TextInput
                        style={styles.configInput}
                        value={item.defaultRPE?.toString() || ''}
                        onChangeText={(text) => {
                          const numValue = parseInt(text) || 0;
                          if (numValue >= 0 && numValue <= 10) {
                            updateExerciseDefaults(item.id, "defaultRPE", numValue);
                          }
                        }}
                        keyboardType="numeric"
                        placeholder="8"
                        placeholderTextColor={colors.secondaryText}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.addExerciseContainer}>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.addExerciseButton}
                onPress={() => router.push({
                  pathname: '/(app)/(modals)/exerciseSelection',
                  params: { fromRoutineEdit: 'true', routineId: routineId }
                })}
              >
                <Ionicons name="add-circle-outline" size={22} color={colors.brand} />
                <Text style={styles.addExerciseButtonText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Exercise Options Bottom Sheet */}
      <BottomSheet
        ref={exerciseOptionsBottomSheetRef}
        index={-1}
        snapPoints={exerciseOptionsSnapPoints}
        onChange={handleExerciseOptionsSheetChanges}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
      >
        <BottomSheetView style={styles.exerciseOptionsModalContent}>
          <Text style={styles.exerciseOptionsTitle}>
            {selectedExerciseForOptions?.name}
          </Text>
          <Text style={styles.exerciseOptionsSubtitle}>
            Choose an action for this exercise
          </Text>
          
          <View style={styles.exerciseOptionsContent}>
            {/* Reorder Option */}
            <TouchableOpacity
                activeOpacity={0.5} style={styles.exerciseOptionItem} onPress={handleReorderExercises}>
              <View style={styles.exerciseOptionIcon}>
                <Ionicons name="reorder-three-outline" size={24} color={colors.primaryText} />
              </View>
              <View style={styles.exerciseOptionTextContainer}>
                <Text style={styles.exerciseOptionTitle}>Reorder Exercises</Text>
                <Text style={styles.exerciseOptionSubtitle}>Change the order of exercises in your routine</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
            </TouchableOpacity>

            {/* Remove Exercise Option */}
            <TouchableOpacity
                activeOpacity={0.5} style={[styles.exerciseOptionItem, styles.destructiveOption]} onPress={handleRemoveExercise}>
              <View style={styles.exerciseOptionIcon}>
                <Ionicons name="trash-outline" size={24} color={colors.notification} />
              </View>
              <View style={styles.exerciseOptionTextContainer}>
                <Text style={[styles.exerciseOptionTitle, styles.destructiveText]}>Remove Exercise</Text>
                <Text style={styles.exerciseOptionSubtitle}>Permanently remove this exercise from your routine</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.notification} />
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Reorder Bottom Sheet */}
<BottomSheet
  ref={reorderBottomSheetRef}
  index={-1}
  snapPoints={reorderSnapPoints}
  onChange={handleReorderSheetChanges}
  backgroundStyle={styles.bottomSheetBackground}
  handleIndicatorStyle={styles.bottomSheetIndicator}
  backdropComponent={(props) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
    />
  )}
  enablePanDownToClose={true}
>
  <BottomSheetView style={styles.reorderModalContent}>
    <Text style={styles.reorderModalTitle}>Reorder Exercises</Text>
    <Text style={styles.reorderModalSubtitle}>
      Hold and drag exercises to change their order
    </Text>
    
    <View style={styles.reorderExerciseList}>
      <DraggableFlatList
        data={exercises}
        keyExtractor={item => item.id.toString()}
        onDragBegin={() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (error) {
            // Fallback for devices without haptics
          }
        }}
        onDragEnd={({ data }) => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {
            // Fallback for devices without haptics
          }
          setExercises(data);
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, drag, isActive }) => (
          <TouchableOpacity
                activeOpacity={0.5}
            onLongPress={drag}
            delayLongPress={100}
            style={[
              styles.reorderExerciseItem,
              isActive && styles.reorderExerciseItemActive
            ]}
          >
            {/* Exercise Image */}
            {item.image_url && !failedImages.has(item.id.toString()) ? (
              <Image 
                source={{ uri: item.image_url }}
                style={styles.reorderExerciseImage}
                resizeMode="cover"
                onError={() => {
                  setFailedImages(prev => new Set(prev).add(item.id.toString()));
                }}
              />
            ) : (
              <View style={styles.reorderExerciseImagePlaceholder}>
                <Ionicons 
                  name={(!item.exerciseId || item.exerciseId.startsWith('custom-')) ? "construct-outline" : "barbell-outline"} 
                  size={18} 
                  color={colors.secondaryText} 
                />
              </View>
            )}
            
            <View style={styles.reorderExerciseInfo}>
              <View style={styles.reorderExerciseNameRow}>
                <Text style={styles.reorderExerciseName}>{item.name}</Text>
                {/* Custom Exercise Badge */}
                {(!item.exerciseId || item.exerciseId.startsWith('custom-')) && (
                  <View style={styles.reorderCustomBadge}>
                    <Text style={styles.reorderCustomBadgeText}>Custom</Text>
                  </View>
                )}
              </View>
              <Text style={styles.reorderExerciseStats}>
                {item.totalSets} sets • {item.defaultReps || 0} default reps
              </Text>
            </View>
            <View style={styles.reorderDragHandle}>
              <Ionicons name="reorder-three-outline" size={24} color={colors.secondaryText} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
    
    <View style={styles.reorderModalFooter}>
      <TouchableOpacity
                activeOpacity={0.5} 
        style={styles.reorderDoneButton}
        onPress={() => reorderBottomSheetRef.current?.close()}
      >
        <Text style={styles.reorderDoneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  </BottomSheetView>
</BottomSheet>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.secondaryText,
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryAccent,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlay,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingTop: 53,
  },
  headerButton: {
    padding: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    flex: 1,
    textAlign: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  editableHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
    backgroundColor: colors.whiteOverlayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 35,
  },
  headerTitleInput: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
    backgroundColor: colors.whiteOverlayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    color: colors.brand,
    fontWeight: '400',
  },
  saveText: {
    fontSize: 16,
    color: colors.brand,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  exercisesContainer: {
    marginBottom: 20,
  },
  exerciseCard: {
    padding: 16,
    borderBottomColor: colors.whiteOverlay,
    borderBottomWidth: 1,
    backgroundColor: colors.background,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseTitlePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNameAndBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNamePressable: {
    paddingVertical: 2,
    flex: 1,
  },
  exerciseOptionsButton: {
    padding: 8,
    marginLeft: 12,
  },
  exerciseInlineConfig: {
    marginTop: 12,
    backgroundColor: colors.overlay,
    borderRadius: 8,
    padding: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brand,
    flex: 1,
  },
  setCountControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.whiteOverlay,
  },
  setCountButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  setCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    paddingHorizontal: 12,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.whiteOverlayLight,
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.whiteOverlay,
    borderStyle: 'dashed',
  },
  addExerciseContainer: {
    padding: 16,
  },
  addExerciseButtonText: {
    color: colors.brand,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Exercise Card New Styles
  exerciseNameContainer: {
    flex: 1,
    marginLeft: 8,
  },
  exerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.primaryText,
  },
  exerciseImagePlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.whiteOverlayLight,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  configItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  configLabel: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 8,
    fontWeight: '500',
  },
  configInput: {
    backgroundColor: colors.overlay,
    borderRadius: 8,
    color: colors.primaryText,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.whiteOverlay,
  },
  // Bottom Sheet Styles
  bottomSheetBackground: {
    backgroundColor: colors.primaryAccent,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bottomSheetIndicator: {
    backgroundColor: colors.secondaryText,
    width: 50,
  },
  exerciseOptionsModalContent: {
    flex: 1,
    padding: 10,
  },
  exerciseOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 8,
  },
  exerciseOptionsSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlay,
    paddingBottom: 12,
  },
  exerciseOptionsContent: {
    flex: 1,
  },
  exerciseOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
  },
  exerciseOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.whiteOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  exerciseOptionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  exerciseOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  exerciseOptionSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 20,
  },
  destructiveOption: {
    marginTop: 8,
  },
  destructiveText: {
    color: colors.notification,
  },
  reorderModalContent: {
    flex: 1,
    padding: 10,
  },
  reorderModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 8,
  },
  reorderModalSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlay,
    paddingBottom: 12,
  },
  reorderExerciseList: {
    flex: 1,
    maxHeight: 300,
  },
  reorderExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.overlay,
    borderRadius: 8,
    marginBottom: 8,
  },
  reorderExerciseItemActive: {
    backgroundColor: colors.whiteOverlay,
  },
  reorderExerciseImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: colors.primaryText,
  },
  reorderExerciseImagePlaceholder: {
  width: 36,
  height: 36,
  borderRadius: 18,
  marginRight: 12,
  backgroundColor: colors.whiteOverlay,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: colors.whiteOverlayLight,
},
  reorderExerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reorderExerciseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  reorderExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
  },
  reorderCustomBadge: {
    backgroundColor: colors.customBadgeBg,
    borderColor: colors.customBadgeBorder,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginLeft: 6,
  },
  reorderCustomBadgeText: {
    color: colors.customBadgeText,
    fontSize: 8,
    fontWeight: '600',
  },
  reorderExerciseStats: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  reorderDragHandle: {
    padding: 8,
  },
reorderModalFooter: {
  paddingVertical: 16,
  borderTopWidth: 1,
  borderTopColor: colors.whiteOverlay,
},
  reorderDoneButton: {
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  reorderDoneButtonText: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 16,
  },
  customBadge: {
    backgroundColor: colors.customBadgeBg,
    borderColor: colors.customBadgeBorder,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  customBadgeText: {
    color: colors.customBadgeText,
    fontSize: 10,
    fontWeight: '600',
  },
});
