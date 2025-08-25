import { View, Text, ScrollView, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { colors } from "../../../../../constants/colors";
import ActivityCalendar from "../../../../../components/ActivityCalendar";
import { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import IonIcon from "react-native-vector-icons/Ionicons";
import { supabase } from "../../../../../lib/supabase";
import { getUserWeightUnit, displayWeightForUser } from "../../../../../utils/weightUtils";

// Interface for our workout data structure
interface WorkoutDay {
  date: Date;
  day: number;
  postId: string;
  exercises: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    weight: number;
    weight_unit: string;
  }[];
}

const Activity = () => {
  const router = useRouter();
  const { userId, selectedDay: initialSelectedDay, selectedDate: initialSelectedDateString } = useLocalSearchParams();
  
  const [workoutDays, setWorkoutDays] = useState<number[]>([]);
  const [workoutData, setWorkoutData] = useState<WorkoutDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(
    initialSelectedDay ? Number(initialSelectedDay) : null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialSelectedDateString ? new Date(String(initialSelectedDateString)) : null
  );
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDay | null>(null);
  const [userWeightUnit, setUserWeightUnit] = useState<'kg' | 'lbs'>('kg');
  
  // Stats for monthly summary
  const [monthlySummary, setMonthlySummary] = useState({
    totalWorkouts: 0,
    workoutsPerWeek: 0,
    totalSets: 0,
    setsPerWeek: 0,
    totalWeightLifted: 0
  });
  
  useEffect(() => {
    fetchUserWorkouts();
  }, [userId]);
  
  useEffect(() => {
    // When selected day changes, find the corresponding workout
    if (selectedDay && selectedDate) {
      const workout = workoutData.find(w => 
        w.day === selectedDay && 
        w.date.getMonth() === selectedDate.getMonth() && 
        w.date.getFullYear() === selectedDate.getFullYear()
      );
      setSelectedWorkout(workout || null);
    } else {
      setSelectedWorkout(null);
    }
  }, [selectedDay, selectedDate, workoutData]);

  const fetchUserWorkouts = async () => {
    try {
      setIsLoading(true);
      
      // Get user's weight unit preference
      const weightUnit = await getUserWeightUnit(String(userId));
      setUserWeightUnit(weightUnit);
      
      // Get current date to calculate start of month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Fetch posts with workout_id for the user
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          id,
          created_at,
          user_id,
          workout_id,
          post_exercises(id, name, sets, reps, weight, weight_unit)
        `)
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Process posts into workout days
      const workouts: WorkoutDay[] = [];
      const days: number[] = [];
      let totalSets = 0;
      let totalWeight = 0;
      
      posts.forEach(post => {
        if (post.workout_id || (post.post_exercises && post.post_exercises.length > 0)) {
          const postDate = new Date(post.created_at);
          const day = postDate.getDate();
          
          // Add to workout days list
          days.push(day);
          
          // Track post exercises for this day
          const exercises = post.post_exercises.map(exercise => {
            // Calculate total weight lifted
            const weight = exercise.weight || 0;
            const sets = exercise.sets || 0;
            const repsPerSet = parseInt(exercise.reps) || 0;
            
            totalSets += sets;
            totalWeight += weight * sets * repsPerSet;
            
            return {
              id: exercise.id,
              name: exercise.name,
              sets: exercise.sets,
              reps: exercise.reps,
              weight: exercise.weight,
              weight_unit: exercise.weight_unit
            };
          });
          
          workouts.push({
            date: postDate,
            day,
            postId: post.id,
            exercises
          });
        }
      });
      
      // Calculate weekly averages (assuming 4.33 weeks in a month)
      const weeksInMonth = 4.33;
      const workoutsPerWeek = days.length / weeksInMonth;
      const setsPerWeek = totalSets / weeksInMonth;
      
      setWorkoutDays([...new Set(days)]); // Deduplicate days
      setWorkoutData(workouts);
      setMonthlySummary({
        totalWorkouts: days.length,
        workoutsPerWeek: Math.round(workoutsPerWeek * 10) / 10,
        totalSets: totalSets,
        setsPerWeek: Math.round(setsPerWeek),
        totalWeightLifted: totalWeight
      });
      
    } catch (err) {
      console.error('Error fetching workout data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaySelected = (day: number, date: Date) => {
    if (selectedDay === day && 
        selectedDate?.getMonth() === date.getMonth() && 
        selectedDate?.getFullYear() === date.getFullYear()) {
      // Unselect if clicking the same day
      setSelectedDay(null);
      setSelectedDate(null);
    } else {
      setSelectedDay(day);
      setSelectedDate(date);
    }
  };

  const handleViewPost = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.calendarContainer}>
        <Text style={styles.sectionTitle}>Workout Calendar</Text>
        <ActivityCalendar 
          workoutDays={workoutDays} 
          weeksToShow={4} 
          showLegend
          onDaySelected={handleDaySelected}
          initialSelectedDay={selectedDay}
        />
      </View>
      
      {selectedDay && (
        <View style={styles.selectedDayContainer}>
          <Text style={styles.sectionTitle}>
            {selectedDate?.toDateString()}
          </Text>
          {selectedWorkout ? (
            <View style={styles.dayExercises}>
              {selectedWorkout.exercises.map(exercise => (
                <View key={exercise.id} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseInfo}>
                    {exercise.weight} {exercise.weight_unit} • {exercise.sets}x{exercise.reps}
                  </Text>
                </View>
              ))}
              <TouchableOpacity
                activeOpacity={0.5} 
                style={styles.viewPostButton}
                onPress={() => handleViewPost(selectedWorkout.postId)}
              >
                <Text style={styles.viewPostButtonText}>View Post</Text>
                <IonIcon style={styles.viewPostButtonArrow} name="arrow-forward" size={20} color={colors.primaryText} />
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noWorkoutText}>No workout on this day</Text>
          )}
        </View>
      )}
      
      <View style={styles.monthlySummary}>
        <Text style={styles.sectionTitle}>
          Monthly Summary
        </Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryItemName}>Total Workouts</Text>
          <Text style={styles.summaryItemValue}>{monthlySummary.totalWorkouts}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryItemName}>Avg Workouts / Week</Text>
          <Text style={styles.summaryItemValue}>{monthlySummary.workoutsPerWeek}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryItemName}>Total Volume (sets)</Text>
          <Text style={styles.summaryItemValue}>{monthlySummary.totalSets}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryItemName}>Avg Volume / Week</Text>
          <Text style={styles.summaryItemValue}>{monthlySummary.setsPerWeek}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryItemName}>Total Weight Lifted</Text>
          <Text style={styles.summaryItemValue}>
            {displayWeightForUser(monthlySummary.totalWeightLifted, 'kg', userWeightUnit, true)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  calendarContainer: {
    width: '100%',
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    paddingTop: 10,
  },
  selectedDayContainer: {
    backgroundColor: colors.primaryAccent,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  dayExercises: {
    gap: 22,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 14,
    color: colors.primaryText,
  },
  exerciseInfo: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  viewPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderColor: colors.primaryText,
    borderWidth: 1,
    padding: 10,
    backgroundColor: colors.secondaryAccent,
  },
  viewPostButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
  },
  viewPostButtonArrow: {
    position: 'absolute',
    right: 10,
  },
  noWorkoutText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    padding: 20,
  },
  monthlySummary: {
    backgroundColor: colors.primaryAccent,
    padding: 16,
    borderRadius: 12,
    width: '100%',
    gap: 22,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  summaryItemName: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  summaryItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
});

export default Activity;