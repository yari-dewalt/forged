import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

interface ActivityCalendarProps {
  workoutDays?: number[]; // Array of days that had workouts (1-31)
  weeksToShow?: number; // Number of weeks to display (default: 4)
  showLegend?: boolean; // Show legend for workout days
  onDaySelected?: (day: number, date: Date) => void; // Callback for day selection
  showSelection?: boolean; // Show selected day visually
  initialSelectedDay?: number; // Initial selected day
}

const ActivityCalendar: React.FC<ActivityCalendarProps> = ({ 
  workoutDays = [],
  weeksToShow = 4,
  showLegend = false,
  onDaySelected,
  showSelection = true,
  initialSelectedDay = null,
}) => {
  // State to track the selected day
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (initialSelectedDay !== null) {
      setSelectedDay(initialSelectedDay);
    }
  }, [initialSelectedDay]);
  
  const calendarData = useMemo(() => {
    // Get current date
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create a rectangular grid (weeksToShow rows x 7 columns)
    const grid: (number | null)[][] = Array(weeksToShow).fill(null).map(() => Array(7).fill(null));
    
    // Calculate the number of days we need to show
    const totalDays = weeksToShow * 7;
    
    // Calculate the end date (today) and start date (today - totalDays + 1)
    const endDate = new Date(currentYear, currentMonth, currentDay);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - totalDays + 1);
    
    // Calculate the day of week for the first day (0 = Sunday, 6 = Saturday)
    const startDayOfWeek = startDate.getDay();
    
    // Fill the grid with days, starting from the startDate
    const currentDate = new Date(startDate);
    
    // Get the dates to fill in the grid
    const dates: Date[] = [];
    for (let i = 0; i < totalDays; i++) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Store date objects for each day in the grid
    const dateMap = new Map<number, Date>();
    
    // Fill the grid with dates
    // Fill from top-left to bottom-right
    for (let row = 0; row < weeksToShow; row++) {
      for (let col = 0; col < 7; col++) {
        const index = row * 7 + col;
        if (index < dates.length) {
          // Store the day of the month in the grid
          const date = dates[index];
          const day = date.getDate();
          grid[row][col] = day;
          dateMap.set(day, date);
        } else {
          grid[row][col] = null;
        }
      }
    }
    
    // Check if a day is included in workout days
    const hasWorkout = (day: number) => workoutDays.includes(day);
    
    // Check if a date is today
    const isToday = (day: number) => day === currentDay;
    
    // Get the date object for a given day
    const getDateForDay = (day: number) => dateMap.get(day) || new Date();
    
    return { 
      grid, 
      hasWorkout, 
      isToday, 
      getDateForDay,
      startDayOfWeek // Pass this to render headers correctly
    };
  }, [workoutDays, weeksToShow]);
  
  // Generate correct weekday headers based on the first day of the calendar
  const weekdayHeaders = useMemo(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    // Start from the calculated first day of the week
    for (let i = 0; i < 7; i++) {
      const dayIndex = (calendarData.startDayOfWeek + i) % 7;
      result.push(dayNames[dayIndex]);
    }
    
    return result;
  }, [calendarData.startDayOfWeek]);
  
  const displayHeaders = weekdayHeaders.map((day, index) => {
    // Only show alternate headers for better spacing
    if (index % 2 === 1) {
      return <Text key={day} style={styles.headerText}>{day}</Text>;
    }
    return <View key={day} style={styles.headerCell} />;
  });
  
  // Handle day selection
  const handleDayPress = (day: number) => {
    const newSelectedDay = day === selectedDay ? null : day;
    setSelectedDay(newSelectedDay);
    
    if (onDaySelected) {
      if (newSelectedDay === null) {
        // If we're deselecting, pass null to the parent component
        onDaySelected(null, new Date());
      } else {
        // Pass the selected day and its date
        onDaySelected(day, calendarData.getDateForDay(day));
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {displayHeaders}
      </View>
      
      {calendarData.grid.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((day, colIndex) => (
            <View key={`cell-${rowIndex}-${colIndex}`} style={styles.cell}>
              {day !== null && (
                <TouchableOpacity
                activeOpacity={0.5}
                  onPress={() => handleDayPress(day)}
                  style={({ pressed }) => [
                    styles.pressable,
                    pressed && styles.pressed,
                  ]}
                >
                  <View 
                    style={[
                      styles.dayCell,
                      calendarData.hasWorkout(day) && styles.workoutDay,
                      calendarData.isToday(day) && styles.today,
                      selectedDay === day && showSelection && styles.selectedDay,
                    ]}
                  >
                    <Text 
                      style={[
                        styles.dayText,
                        calendarData.hasWorkout(day) && styles.workoutDayText,
                        selectedDay === day && styles.selectedDayText,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ))}

      {showLegend && (
        <View style={styles.bottomArea}>
          <View style={styles.legend}>
            <View style={styles.legendRow}>
              <View style={styles.legendCellFull}></View>
              <Text style={styles.legendText}>Workout</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendCellEmpty}></View>
              <Text style={styles.legendText}>No Workout</Text>
            </View>
          </View>
          <Text style={styles.legendText}>Tap to view a day's workout</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  pressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  dayCell: {
    width: '80%',
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.secondaryText,
  },
  legend: {
    gap: 8,
    marginLeft: 6,
  },
  legendCellFull: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  legendCellEmpty: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.secondaryText,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendText: {
    color: colors.secondaryText,
    fontSize: 12,
    fontWeight: '500',
  },
  bottomArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  workoutDay: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  today: {
    borderColor: colors.primaryText,
    borderWidth: 2,
  },
  selectedDay: {
    borderColor: colors.brand,
    borderWidth: 3,
    backgroundColor: 'rgba(68, 166, 153, 0.1)',
  },
  dayText: {
    fontSize: 12,
    color: colors.primaryText,
  },
  workoutDayText: {
    color: colors.primaryText,
    fontWeight: 'bold',
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
});

// Styles remain the same
export default ActivityCalendar;