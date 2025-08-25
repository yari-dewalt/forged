//import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '../lib/supabase';
import { GOOGLE_CONFIG } from '../config/googleConfig';
import { Alert } from 'react-native';

// Temporarily disable Google Sign-In for Expo Go testing
const GOOGLE_SIGNIN_DISABLED = true;

// Configure Google Sign-In (only if not disabled)
if (!GOOGLE_SIGNIN_DISABLED) {
  GoogleSignin.configure({
    webClientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
  });
}

export async function signInWithGoogle() {
  // Temporarily disabled for Expo Go testing
  if (GOOGLE_SIGNIN_DISABLED) {
    Alert.alert(
      'Google Sign-In Disabled', 
      'Google Sign-In is temporarily disabled for Expo Go testing. Please use email/password authentication.',
      [{ text: 'OK' }]
    );
    return { data: null, error: new Error('Google Sign-In temporarily disabled'), googleUserInfo: null };
  }

  try {
    // Check if device supports Google Play services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get the user's ID token
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;
    
    if (!idToken) {
      throw new Error('No ID token received from Google');
    }
    
    // Create a Google credential with the token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      console.error('Supabase Google auth error:', error);
      throw error;
    }

    // Return both auth data and Google user info for avatar handling
    return { data, error: null, googleUserInfo: userInfo.data };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    return { data: null, error, googleUserInfo: null };
  }
}

export async function signOutGoogle() {
  if (GOOGLE_SIGNIN_DISABLED) {
    // Just sign out from Supabase when Google is disabled
    await supabase.auth.signOut();
    return;
  }

  try {
    await GoogleSignin.signOut();
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Google Sign-Out error:', error);
  }
}

// Get user's Google profile information
export async function getGoogleUserInfo() {
  if (GOOGLE_SIGNIN_DISABLED) {
    return null;
  }

  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo;
  } catch (error) {
    console.error('Error getting Google user info:', error);
    return null;
  }
}
