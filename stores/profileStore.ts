import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { createFollowNotification } from './notificationStore';

// Extend your existing ProfileData type
type ProfileData = {
  id: string;
  username: string | null;
  name?: string | null;
  bio?: string | null;
  avatar_url: string | null;
  weight_unit?: 'lbs' | 'kg' | null;
  date_of_birth?: string | null;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  created_at?: string;
  is_following?: boolean; // Whether the current user is following this profile
};

type ProfileState = {
  currentProfile: ProfileData | null;
  loading: boolean;
  isCurrentUser: boolean;
  error: string | null;
  followLoading: boolean;
  followedUsers: Set<string>; // Track globally followed users
  
  // Actions
  fetchProfile: (userId: string, currentUserId?: string | null, showLoading?: boolean) => Promise<void>;
  clearProfile: () => void;
  followUser: (targetUserId: string, currentUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string, currentUserId: string) => Promise<void>;
  checkIfFollowing: (targetUserId: string, currentUserId: string) => Promise<boolean>;
  updatePostsCount: (change: number) => void;
  updateCurrentProfile: (updatedProfile: Partial<ProfileData>) => void;
  initializeFollowedUsers: (currentUserId: string) => Promise<void>;
  isUserFollowed: (userId: string) => boolean;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  currentProfile: null,
  loading: false,
  isCurrentUser: false,
  error: null,
  followLoading: false,
  followedUsers: new Set(),
  
  fetchProfile: async (userId, currentUserId, showLoading = true) => {
    try {
      if (showLoading) {
        set({ loading: true, error: null });
      }
      
      // Check if this is the current user's profile
      const isOwnProfile = userId === currentUserId || userId === 'me';
      set({ isCurrentUser: isOwnProfile });
      
      // If 'me' is specified, use the current user ID
      const targetUserId = isOwnProfile && currentUserId ? currentUserId : userId;
      
      // Fetch profile data from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, name, bio, avatar_url, weight_unit, date_of_birth, followers_count, following_count, posts_count, created_at')
        .eq('id', targetUserId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        set({ error: error.message });
      } else {
        // Check if the current user follows this profile (if not viewing own profile)
        let isFollowing = false;
        if (!isOwnProfile && currentUserId) {
          isFollowing = await get().checkIfFollowing(targetUserId, currentUserId);
        }
        
        // Set the profile with the following status
        set({ 
          currentProfile: {
            ...data,
            is_following: isFollowing
          }
        });
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
      set({ error: 'Failed to fetch profile' });
    } finally {
      set({ loading: false });
    }
  },
  
  clearProfile: () => {
    set({ 
      currentProfile: null,
      isCurrentUser: false,
      error: null
    });
  },
  
  followUser: async (targetUserId, currentUserId) => {
    try {
      set({ followLoading: true });
      
      // First get the current user's profile data to use in the notification
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('username, name')
        .eq('id', currentUserId)
        .single();
        
      // Insert into follows table
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: targetUserId
        });
          
      if (error) {
        console.error('Error following user:', error);
        return;
      }
      
      // Update local state (optimistic update for follow status only)
      set(state => {
        const newFollowedUsers = new Set(state.followedUsers);
        newFollowedUsers.add(targetUserId);
        
        if (state.currentProfile && state.currentProfile.id === targetUserId) {
          return {
            followedUsers: newFollowedUsers,
            currentProfile: {
              ...state.currentProfile,
              is_following: true
            }
          };
        }
        return {
          followedUsers: newFollowedUsers
        };
      });
      
      // Refresh the profile data to get updated counts from the database
      if (get().currentProfile && get().currentProfile.id === targetUserId) {
        // Refresh the current profile to get updated follower count from database trigger
        await get().fetchProfile(targetUserId, currentUserId, false);
      }
      
      // Create follow notification
      try {
        await createFollowNotification(targetUserId, currentUserId);
      } catch (notificationError) {
        console.error('Error creating follow notification:', notificationError);
        // Don't fail the follow action if notification creation fails
      }
      
    } catch (error) {
      console.error('Error in follow user:', error);
    } finally {
      set({ followLoading: false });
    }
  },
  
  unfollowUser: async (targetUserId, currentUserId) => {
    try {
      set({ followLoading: true });
      
      // Delete from follows table
      const { error } = await supabase
        .from('follows')
        .delete()
        .match({
          follower_id: currentUserId,
          following_id: targetUserId
        });
        
      if (error) {
        console.error('Error unfollowing user:', error);
        return;
      }
      
      // Update local state (optimistic update for follow status only)
      set(state => {
        const newFollowedUsers = new Set(state.followedUsers);
        newFollowedUsers.delete(targetUserId);
        
        if (state.currentProfile && state.currentProfile.id === targetUserId) {
          return {
            followedUsers: newFollowedUsers,
            currentProfile: {
              ...state.currentProfile,
              is_following: false
            }
          };
        }
        return {
          followedUsers: newFollowedUsers
        };
      });
      
      // Refresh the profile data to get updated counts from the database
      if (get().currentProfile && get().currentProfile.id === targetUserId) {
        // Refresh the current profile to get updated follower count from database trigger
        await get().fetchProfile(targetUserId, currentUserId, false);
      }
      
    } catch (error) {
      console.error('Error in unfollow user:', error);
    } finally {
      set({ followLoading: false });
    }
  },
  
  checkIfFollowing: async (targetUserId, currentUserId) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .match({
          follower_id: currentUserId,
          following_id: targetUserId
        })
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is the "not found" error code
        console.error('Error checking follow status:', error);
        return false;
      }
      
      return !!data; // Returns true if the relationship exists
    } catch (error) {
      console.error('Error checking if following:', error);
      return false;
    }
  },
  
  updatePostsCount: (change) => {
    set(state => {
      if (state.currentProfile) {
        return {
          currentProfile: {
            ...state.currentProfile,
            posts_count: Math.max(0, (state.currentProfile.posts_count || 0) + change)
          }
        };
      }
      return state;
    });
  },

  updateCurrentProfile: (updatedProfile) => {
    set(state => {
      if (state.currentProfile) {
        return {
          currentProfile: {
            ...state.currentProfile,
            ...updatedProfile
          }
        };
      }
      return state;
    });
  },

  initializeFollowedUsers: async (currentUserId) => {
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId);
        
      if (error) {
        console.error('Error fetching followed users:', error);
        return;
      }
      
      const followedIds = new Set(data?.map(f => f.following_id) || []);
      set({ followedUsers: followedIds });
    } catch (error) {
      console.error('Error initializing followed users:', error);
    }
  },

  isUserFollowed: (userId) => {
    return get().followedUsers.has(userId);
  }
}));