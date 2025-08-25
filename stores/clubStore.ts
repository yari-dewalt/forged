import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Define club data type
type ClubData = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  creator_id: string;
  privacy_level: 'public' | 'private';
  member_count: number;
  created_at: string;
  updated_at: string;
  // Client-side properties
  isMember?: boolean;
  role?: 'admin' | 'moderator' | 'member';
};

// Define club member type
type ClubMember = {
  user_id: string;
  role: string;
  joined_at: string;
  profiles: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
};

type ClubState = {
  currentClub: ClubData | null;
  clubMembers: ClubMember[];
  loading: boolean;
  membersLoading: boolean;
  error: string | null;
  membershipLoading: boolean;
  
  // Actions
  fetchClubById: (clubId: string, userId?: string | null) => Promise<ClubData | null>;
  fetchClubMembers: (clubId: string) => Promise<void>;
  clearClub: () => void;
  joinClub: (clubId: string, userId: string) => Promise<boolean>;
  leaveClub: (clubId: string, userId: string) => Promise<boolean>;
  isClubMember: (clubId: string, userId: string) => Promise<boolean>;
  updateClub: (clubId: string, updates: Partial<ClubData>) => Promise<void>;
};

export const useClubStore = create<ClubState>((set, get) => ({
  currentClub: null,
  clubMembers: [],
  loading: false,
  membersLoading: false,
  error: null,
  membershipLoading: false,
  
  fetchClubById: async (clubId, userId) => {
    try {
      set({ loading: true, error: null });
      
      console.log('Fetching club:', clubId);
      
      // Fetch club data from Supabase
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', clubId)
        .single();
        
      if (error) {
        console.error('Error fetching club:', error);
        set({ error: error.message });
        return null;
      }
      
      // Check if user is a member of this club
      let isMember = false;
      let role = null;
      
      if (userId) {
        const { data: memberData, error: memberError } = await supabase
          .from('club_members')
          .select('role')
          .match({ club_id: clubId, user_id: userId })
          .single();
          
        if (!memberError && memberData) {
          isMember = true;
          role = memberData.role;
        }
      }
      
      // Set the club with membership status
      const clubWithStatus: ClubData = {
        ...data,
        isMember,
        role: role as 'admin' | 'moderator' | 'member' | undefined
      };
      
      set({ currentClub: clubWithStatus });
      
      return clubWithStatus;
    } catch (error) {
      console.error('Error in club fetch:', error);
      set({ error: 'Failed to fetch club' });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  
  fetchClubMembers: async (clubId) => {
    try {
      set({ membersLoading: true });
      
      // Fetch club members with their profiles
      const { data, error } = await supabase
        .from('club_members')
        .select(`
          user_id,
          role,
          joined_at,
          profiles(id, username, name, avatar_url)
        `)
        .eq('club_id', clubId)
        .order('role', { ascending: true });
        
      if (error) {
        console.error('Error fetching club members:', error);
        set({ error: error.message });
        return;
      }
      
      set({ clubMembers: data || [] });
    } catch (error) {
      console.error('Error in fetch club members:', error);
      set({ error: 'Failed to fetch club members' });
    } finally {
      set({ membersLoading: false });
    }
  },
  
  clearClub: () => {
    set({ 
      currentClub: null,
      clubMembers: [],
      error: null
    });
  },
  
  joinClub: async (clubId, userId) => {
    try {
      set({ membershipLoading: true });
      
      // Insert into club_members table
      const { error } = await supabase
        .from('club_members')
        .insert({
          club_id: clubId,
          user_id: userId,
          role: 'member'
        });
        
      if (error) {
        console.error('Error joining club:', error);
        return false;
      }
      
      // Update local state (optimistic update)
      set(state => {
        if (state.currentClub) {
          return {
            currentClub: {
              ...state.currentClub,
              member_count: state.currentClub.member_count + 1,
              isMember: true,
              role: 'member'
            }
          };
        }
        return state;
      });
      
      return true;
    } catch (error) {
      console.error('Error in join club:', error);
      return false;
    } finally {
      set({ membershipLoading: false });
    }
  },
  
  leaveClub: async (clubId, userId) => {
    try {
      set({ membershipLoading: true });
      
      // Delete from club_members table
      const { error } = await supabase
        .from('club_members')
        .delete()
        .match({
          club_id: clubId,
          user_id: userId
        });
        
      if (error) {
        console.error('Error leaving club:', error);
        return false;
      }
      
      // Update local state (optimistic update)
      set(state => {
        if (state.currentClub) {
          return {
            currentClub: {
              ...state.currentClub,
              member_count: Math.max(0, state.currentClub.member_count - 1),
              isMember: false,
              role: undefined
            }
          };
        }
        return state;
      });
      
      return true;
    } catch (error) {
      console.error('Error in leave club:', error);
      return false;
    } finally {
      set({ membershipLoading: false });
    }
  },
  
  isClubMember: async (clubId, userId) => {
    try {
      const { data, error } = await supabase
        .from('club_members')
        .select('role')
        .match({
          club_id: clubId,
          user_id: userId
        })
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is the "not found" error code
        console.error('Error checking membership status:', error);
        return false;
      }
      
      return !!data; // Returns true if the relationship exists
    } catch (error) {
      console.error('Error checking if club member:', error);
      return false;
    }
  },
  
  updateClub: async (clubId, updates) => {
    try {
      set({ loading: true });
      
      const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', clubId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating club:', error);
        set({ error: error.message });
        return;
      }
      
      // Update the current club with new data while preserving membership status
      set(state => {
        if (state.currentClub) {
          return {
            currentClub: {
              ...data,
              isMember: state.currentClub.isMember,
              role: state.currentClub.role
            }
          };
        }
        return state;
      });
    } catch (error) {
      console.error('Error in update club:', error);
      set({ error: 'Failed to update club' });
    } finally {
      set({ loading: false });
    }
  }
}));