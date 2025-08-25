import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UserProfile = {
  id: string;
  username: string | null;
  name?: string | null;
  bio?: string | null;
  avatar_url: string | null;
  weight_unit?: 'lbs' | 'kg' | null;
  date_of_birth?: string | null;
};

type AuthState = {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  
  // Actions
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (updatedProfile: UserProfile) => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  
  setSession: (session) => set({ session }),
  
  setLoading: (loading) => set({ loading }),
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
  
  fetchProfile: async () => {
    const { session } = get();
    if (!session?.user) {
      set({ profile: null });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, name, bio, avatar_url, weight_unit, date_of_birth")
        .eq("id", session.user.id)
        .single();
      
      if (error) throw error;

      const profileWithId = data.id ? data : { ...data, id: session.user.id };
      
      set({ profile: profileWithId });
    } catch (error) {
      console.error("Error fetching profile:", error);
      set({ profile: null });
    }
  },

  updateProfile: (updatedProfile: UserProfile) => {
    set({ profile: updatedProfile });
  },
}));