import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from "expo-constants";
import * as Sentry from '@sentry/react-native';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || "";
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || "";

// Add error tracking for missing credentials
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase credentials');
  Sentry.captureException(error, {
    tags: { component: 'supabase', critical: 'true' },
    extra: { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseAnonKey,
      constants: Constants.expoConfig?.extra
    }
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
