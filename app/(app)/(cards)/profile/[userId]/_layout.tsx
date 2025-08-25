import { Stack, useLocalSearchParams, useNavigation, usePathname, useRouter } from 'expo-router';
import { colors } from '../../../../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../../stores/authStore';
import { useProfileStore } from '../../../../../stores/profileStore';

export default function ProfileLayout() {
  const { userId } = useLocalSearchParams();
  const pathname = usePathname();
  const [header, setHeader] = useState('Profile');
  const [lastProcessedUserId, setLastProcessedUserId] = useState(null);
  
  // Get auth state from auth store
  const { profile: authProfile, session } = useAuthStore();
  
  // Get profile state from profile store
  const { 
    currentProfile, 
    loading, 
    error,
    fetchProfile,
  } = useProfileStore();
  
  // When the userId param changes, fetch the profile data
  useEffect(() => {
    console.log(`userId param: ${userId}, pathname: ${pathname}`);
    
    // Extract userId from pathname as a fallback
    const pathSegments = pathname.split('/');
    const pathUserId = pathSegments[pathSegments.indexOf('profile') + 1];
    
    const effectiveUserId = pathUserId;
    
    if (effectiveUserId && effectiveUserId !== lastProcessedUserId) {
      const currentUserId = authProfile?.id || session?.user?.id;
      fetchProfile(effectiveUserId as string, currentUserId);
      setLastProcessedUserId(effectiveUserId);
    }

    if (authProfile?.id === effectiveUserId) {
      fetchProfile(authProfile.id, authProfile.id);
    }
    
    return () => {
      if (!pathname.includes('/profile/')) {
        setLastProcessedUserId(null);
      }
    };
  }, [userId, pathname, authProfile?.id, session?.user?.id]);
  
  // Update header based on pathname and profile data
  useEffect(() => {
    const segments = pathname.split('/');
    const currentScreen = segments[segments.length - 1];
    
    switch (currentScreen) {
      case 'followers':
        setHeader('Followers');
        break;
      case 'following':
        setHeader('Following');
        break;
      case 'posts':
        setHeader('Posts');
        break;
      case 'activity':
        setHeader('Activity');
        break;
      case 'clubs':
        setHeader('Clubs');
        break;
      case 'edit':
        setHeader('Edit');
        break;
      case 'settings':
        setHeader('Settings');
        break;
      case 'workouts':
        setHeader('Workouts');
        break;
      case 'routines':
        setHeader('Routines');
        break;
      default:
        // When on the main profile page, use the profile data for the header
        if (currentProfile) {
          const displayName = currentProfile.name || currentProfile.username || 'Profile';
          if (currentProfile.id === authProfile?.id) {
            setHeader('Profile');
          } else {
            setHeader(displayName);
          }
        } else if (loading) {
          setHeader('Loading...');
        } else if (error) {
          setHeader('Profile');
        } else {
          setHeader(userId as string || 'Profile');
        }
        break;
    }
  }, [pathname, currentProfile, loading, error]);
  
  return (
    <View style={styles.container}>
      {/* Loading indicator that only shows during initial load */}      
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: `Profile`,
          }}
        />
        <Stack.Screen
          name="followers"
          options={{
            title: 'Followers',
          }}
        />
        <Stack.Screen
          name="following"
          options={{
            title: 'Following',
          }}
        />
        <Stack.Screen
          name="workouts"
          options={{
            title: 'Workouts',
          }}
        />
        <Stack.Screen
          name="posts"
          options={{
            title: 'Posts',
          }}
        />
        <Stack.Screen
          name="activity"
          options={{
            title: 'Activity',
          }}
        />
        <Stack.Screen
          name="edit"
          options={{
            title: 'Edit',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
          }}
        />
        <Stack.Screen
          name="routines"
          options={{
            title: `Routines`,
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    backgroundColor: colors.secondaryAccent,
    height: 110,
  },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.secondaryAccent,
    position: 'relative',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'absolute',
    left: 0,
    right: 0,
  },
  headerAvatar: {
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryText,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  headerButton: {
    padding: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  }
});