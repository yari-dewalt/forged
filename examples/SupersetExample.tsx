// Example of how to use superset functionality in your workout interface

import { useWorkoutStore } from '../stores/workoutStore';

// Example component showing how to create and manage supersets
const SupersetExample = () => {
  const { 
    activeWorkout, 
    addExercise, 
    createSuperset, 
    removeFromSuperset,
    addToSuperset,
    getSupersetsFromWorkout 
  } = useWorkoutStore();

  // Example: Create a superset from two exercises
  const createExampleSuperset = () => {
    // First, add two exercises to your workout
    const exercise1Id = addExercise({
      id: 'ex1',
      name: 'Bench Press',
      exercise_id: 'bench-press-123',
      defaultSets: 3,
      image_url: 'https://example.com/bench-press.jpg'
    });

    const exercise2Id = addExercise({
      id: 'ex2', 
      name: 'Incline Dumbbell Press',
      exercise_id: 'incline-db-press-456',
      defaultSets: 3,
      image_url: 'https://example.com/incline-db-press.jpg'
    });

    // Create a superset from these two exercises
    const supersetId = createSuperset([exercise1Id, exercise2Id]);
    
    console.log('Created superset:', supersetId);
  };

  // Example: Add an exercise to existing superset
  const addToExistingSuperset = (supersetId: string) => {
    const exercise3Id = addExercise({
      id: 'ex3',
      name: 'Dumbbell Flyes',
      exercise_id: 'db-flyes-789',
      defaultSets: 3,
      image_url: 'https://example.com/db-flyes.jpg'
    });

    // Add to existing superset
    addToSuperset(exercise3Id, supersetId);
  };

  // Example: Remove exercise from superset
  const removeExerciseFromSuperset = (exerciseId: string) => {
    removeFromSuperset(exerciseId);
  };

  // Example: Get all supersets in current workout
  const getAllSupersets = () => {
    const supersets = getSupersetsFromWorkout();
    console.log('Current supersets:', supersets);
    
    // Each superset object looks like:
    // {
    //   id: "superset-1234567890-123",
    //   exercises: [
    //     { id: "ex1", name: "Bench Press", superset_id: "superset-1234567890-123", superset_order: 0, ... },
    //     { id: "ex2", name: "Incline Dumbbell Press", superset_id: "superset-1234567890-123", superset_order: 1, ... }
    //   ]
    // }
  };

  return null; // This is just an example, not a real component
};

export default SupersetExample;
