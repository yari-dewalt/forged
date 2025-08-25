# Routine Tracking Enhancement Summary

## Overview
This update enhances the routine system to support tracking original creators, usage counts, and likes. The terminology has been changed from "copying" to "saving" routines to better reflect the user experience.

## Database Schema Changes

### New Columns Added to `routines` table:
- `original_creator_id`: UUID reference to the original creator (preserved when routine is saved/copied)
- `usage_count`: Integer tracking how many times the routine has been used to start a workout
- `like_count`: Integer tracking how many users have liked the routine  
- `is_official`: Boolean flag for routines created by fitness professionals

### New Table: `routine_likes`
- Tracks individual user likes for routines
- Prevents duplicate likes per user
- Automatically updates routine like_count via triggers

### Database Triggers
- `increment_routine_usage()`: Automatically increments usage_count when a workout is saved with a routine_id
- `update_routine_like_count()`: Automatically updates like_count when likes are added/removed

## Code Changes

### 1. Database Migration
- **File**: `/database_migrations/add_routine_tracking_support.sql`
- **Purpose**: Adds all new columns, tables, triggers, and RLS policies
- **Features**: 
  - Automatic usage counting via triggers
  - Like counting via triggers
  - Proper indexing for performance
  - Row Level Security policies

### 2. Explore Routines Page
- **File**: `/app/(app)/(tabs)/workout/explore.tsx`
- **Changes**:
  - Updated to fetch new routine fields (original_creator_id, usage_count, like_count, is_official)
  - Changed `cloneRoutine()` to `saveRoutineToUserCollection()`
  - Preserves original creator when saving routines
  - Updated routine processing to include new fields

### 3. Routine Detail Page
- **File**: `/app/(app)/(cards)/routine/[routineId]/index.tsx`
- **Changes**:
  - Updated to fetch new routine fields
  - Changed `handleCopyRoutine()` to `handleSaveRoutine()`
  - Added original creator profile fetching
  - Updated terminology from "Copy" to "Save"
  - Preserves original creator when saving routines

### 4. Routine Store
- **File**: `/stores/routineStore.ts`
- **Changes**:
  - Updated routine fetching to include new fields
  - Fixed TypeScript date arithmetic error
  - Enhanced routine data structure

### 5. Routine Utils
- **File**: `/utils/routineUtils.ts` (NEW)
- **Purpose**: Centralized utility functions for routine operations
- **Features**:
  - `toggleRoutineLike()`: Like/unlike routines
  - `getRoutineStats()`: Get comprehensive routine statistics
  - `getMostUsedRoutines()`: Fetch routines sorted by usage
  - `getMostLikedRoutines()`: Fetch routines sorted by likes
  - `getOfficialRoutines()`: Fetch official routines

## Key Features

### 1. Original Creator Tracking
- When a user saves a routine, the original creator is preserved
- Supports attribution even through multiple saves/copies
- Displays both current owner and original creator

### 2. Usage Counting
- Automatically increments when a workout is started from a routine
- Triggered by workout saves with `routine_id` field
- No manual intervention required

### 3. Like System
- Users can like/unlike routines
- Prevents duplicate likes
- Real-time count updates via database triggers

### 4. Enhanced Terminology
- Changed "Copy Routine" to "Save Routine"
- Updated all user-facing text to use "save" instead of "copy"
- More intuitive user experience

## Usage Count Implementation

The usage count is automatically incremented when:
1. A user starts a workout from a routine
2. The workout is saved to the database
3. The `routine_id` field is populated in the workout record
4. Database trigger automatically increments the routine's `usage_count`

## Automatic Usage Count Increment

### How it works:
1. When a workout is started from a routine, the `routineId` is stored in the active workout
2. When the workout is saved to the database, the `routine_id` field is populated
3. A database trigger (`increment_routine_usage()`) automatically increments the routine's `usage_count`
4. This happens transparently without any manual intervention required

### Key Changes Made:
- **Type Fix**: Changed `routineId` from `number` to `string` in the workout store to match UUID type
- **Database Trigger**: The migration includes a trigger that automatically increments usage_count when workouts are saved
- **Logging**: Added console logging to track when routine usage should be incremented

### Code Flow:
```typescript
// 1. User starts workout from routine
startNewWorkout({ routineId: "uuid-string", name: "Routine Name", ... })

// 2. Workout is saved to database
saveWorkoutToDatabase() → INSERT INTO workouts (routine_id, ...)

// 3. Database trigger fires automatically
CREATE TRIGGER trigger_increment_routine_usage
  AFTER INSERT ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION increment_routine_usage();

// 4. Usage count is incremented
UPDATE routines SET usage_count = usage_count + 1 WHERE id = NEW.routine_id;
```

### Verification:
- Check console logs when saving workouts to see routine_id tracking
- Query the database to verify usage_count increments after workout saves
- The increment only happens if `routine_id` is not null in the workout record

## Next Steps

To implement the category subpages with actual functionality:

1. **Official Routines Page**: Use `getOfficialRoutines()` from routineUtils
2. **Most Liked Page**: Use `getMostLikedRoutines()` from routineUtils  
3. **Most Used Page**: Use `getMostUsedRoutines()` from routineUtils
4. **Search Community**: Implement search functionality with filters

## Migration Instructions

1. Run the database migration: `add_routine_tracking_support.sql`
2. Update your app code with the modified files
3. Test the new functionality:
   - Save a routine and verify original creator is preserved
   - Start a workout from a routine and verify usage count increments
   - Like/unlike routines and verify counts update

## Benefits

- **Better Attribution**: Original creators are always credited
- **Usage Analytics**: Track which routines are most effective
- **Social Features**: Like system encourages community engagement
- **Improved UX**: "Save" terminology is more intuitive than "copy"
- **Data Integrity**: Automatic counting via database triggers prevents inconsistencies
