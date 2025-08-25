import { supabase } from '../lib/supabase';
import { createRoutineLikeNotification, createRoutineSaveNotification } from '../stores/notificationStore';

export interface RoutineLike {
  id: string;
  routine_id: string;
  user_id: string;
  created_at: string;
}

export interface RoutineStats {
  saveCount: number;
  usageCount: number;
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

/**
 * Like or unlike a routine
 */
export const toggleRoutineLike = async (routineId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user has already liked this routine
    const { data: existingLike, error: checkError } = await supabase
      .from('routine_likes')
      .select('id')
      .eq('routine_id', routineId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingLike) {
      // Unlike the routine
      const { error: deleteError } = await supabase
        .from('routine_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) throw deleteError;
      return false; // Now unliked
    } else {
      // Like the routine
      const { error: insertError } = await supabase
        .from('routine_likes')
        .insert({
          routine_id: routineId,
          user_id: userId
        });

      if (insertError) throw insertError;
      
      // Create notification for routine author (if not liking own routine)
      try {
        const { data: routine } = await supabase
          .from('routines')
          .select('user_id')
          .eq('id', routineId)
          .single();
          
        if (routine && routine.user_id !== userId) {
          await createRoutineLikeNotification(routine.user_id, userId, routineId);
        }
      } catch (notifError) {
        console.error('Error creating routine like notification:', notifError);
      }
      
      return true; // Now liked
    }
  } catch (error) {
    console.error('Error toggling routine like:', error);
    throw error;
  }
};

/**
 * Save or unsave a routine
 */
export const toggleRoutineSave = async (routineId: string, userId: string): Promise<boolean> => {
  try {
    // Check if user has already saved this routine
    const { data: existingSave, error: checkError } = await supabase
      .from('saved_routines')
      .select('id')
      .eq('routine_id', routineId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingSave) {
      // Unsave the routine
      const { error: deleteError } = await supabase
        .from('saved_routines')
        .delete()
        .eq('id', existingSave.id);

      if (deleteError) throw deleteError;
      return false; // Now unsaved
    } else {
      // Save the routine
      const { error: insertError } = await supabase
        .from('saved_routines')
        .insert({
          routine_id: routineId,
          user_id: userId
        });

      if (insertError) throw insertError;
      
      // Create notification for routine author (if not saving own routine)
      try {
        const { data: routine } = await supabase
          .from('routines')
          .select('user_id')
          .eq('id', routineId)
          .single();
          
        if (routine && routine.user_id !== userId) {
          await createRoutineSaveNotification(routine.user_id, userId, routineId);
        }
      } catch (notifError) {
        console.error('Error creating routine save notification:', notifError);
      }
      
      return true; // Now saved
    }
  } catch (error) {
    console.error('Error toggling routine save:', error);
    throw error;
  }
};

/**
 * Get routine statistics including like and save status for a user
 */
export const getRoutineStats = async (routineId: string, userId?: string): Promise<RoutineStats> => {
  try {
    // Get routine basic stats
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .select('save_count, usage_count, like_count')
      .eq('id', routineId)
      .single();

    if (routineError) throw routineError;

    let isLiked = false;
    let isSaved = false;

    if (userId) {
      // Check if user has liked this routine
      const { data: like, error: likeError } = await supabase
        .from('routine_likes')
        .select('id')
        .eq('routine_id', routineId)
        .eq('user_id', userId)
        .single();

      if (likeError && likeError.code !== 'PGRST116') {
        throw likeError;
      }

      isLiked = !!like;

      // Check if user has saved this routine
      const { data: save, error: saveError } = await supabase
        .from('saved_routines')
        .select('id')
        .eq('routine_id', routineId)
        .eq('user_id', userId)
        .single();

      if (saveError && saveError.code !== 'PGRST116') {
        throw saveError;
      }

      isSaved = !!save;
    }

    return {
      saveCount: routine.save_count || 0,
      usageCount: routine.usage_count || 0,
      likeCount: routine.like_count || 0,
      isLiked,
      isSaved
    };
  } catch (error) {
    console.error('Error getting routine stats:', error);
    throw error;
  }
};

/**
 * Get routines sorted by usage count (most used)
 */
export const getMostUsedRoutines = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select(`
        id,
        name,
        usage_count,
        like_count,
        save_count,
        is_official,
        user_id,
        original_creator_id,
        created_at,
        profiles!routines_user_id_fkey (
          username,
          avatar_url
        )
      `)
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting most used routines:', error);
    throw error;
  }
};

/**
 * Get routines sorted by like count (most liked)
 */
export const getMostLikedRoutines = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select(`
        id,
        name,
        usage_count,
        like_count,
        save_count,
        is_official,
        user_id,
        original_creator_id,
        created_at,
        profiles!routines_user_id_fkey (
          username,
          avatar_url
        )
      `)
      .order('like_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting most liked routines:', error);
    throw error;
  }
};

/**
 * Get official routines
 */
export const getOfficialRoutines = async (limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('routines')
      .select(`
        id,
        name,
        usage_count,
        like_count,
        save_count,
        is_official,
        user_id,
        original_creator_id,
        created_at,
        profiles!routines_user_id_fkey (
          username,
          avatar_url
        )
      `)
      .eq('is_official', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting official routines:', error);
    throw error;
  }
};
