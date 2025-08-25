import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import { useNotificationStore } from '../stores/notificationStore';
import { usePushNotifications } from '../hooks/usePushNotifications';
import * as ScreenOrientation from 'expo-screen-orientation';
import { colors } from '../constants/colors';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://7456d7b9593f113d7583ca613e794adc@o4509906536759296.ingest.us.sentry.io/4509906537611264',

  // Enable debug mode in development
  debug: __DEV__,
  
  // Capture uncaught exceptions and unhandled promise rejections
  enableAutoSessionTracking: true,
  
  // Capture startup crashes and performance data
  enableNativeCrashHandling: true,
  enableAutoPerformanceTracing: true,
  
  // Sample rate for performance monitoring (1.0 = 100%)
  tracesSampleRate: 1.0,
  
  // Sample rate for profiling (0.1 = 10%)
  profilesSampleRate: 0.1,

  // Adds more context data to events
  sendDefaultPii: true,
  
  // Capture console logs as breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === 'console') {
      return breadcrumb;
    }
    return breadcrumb;
  },

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    // Add React Navigation integration for better error context
    Sentry.reactNativeTracingIntegration(),
  ],

  // Environment
  environment: __DEV__ ? 'development' : 'production',
  
  // Release tracking
  release: '1.0.0',

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// Root layout component
export default Sentry.wrap(function RootLayout() {
  // Get state and actions from auth store
  const { session, loading, setSession, setLoading, fetchProfile, profile } = useAuthStore();
  const { isOnboardingComplete, isLoading: onboardingLoading, isInOnboardingFlow, checkOnboardingStatus } = useOnboardingStore();
  const { fetchNotifications, subscribeToNotifications } = useNotificationStore();
  
  // Initialize push notifications
  usePushNotifications();
  
  const segments = useSegments();
  const router = useRouter();

  // Check if the path is in different groups
  const inAppGroup = segments[0] === '(app)';
  const inAuthGroup = segments[0] === '(auth)';
  const inOnboardingGroup = segments[0] === '(onboarding)';
  const inLegalGroup = segments[0] === '(legal)';

  useEffect(() => {
    // Lock screen orientation to portrait
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
      .catch(error => {
        console.error('Failed to lock screen orientation:', error);
        Sentry.captureException(error, {
          tags: { component: 'RootLayout', action: 'lockScreenOrientation' }
        });
      });

    // Setup auth state listener
    const initializeAuth = async () => {
      try {
        Sentry.addBreadcrumb({
          message: 'Starting auth initialization',
          level: 'info',
          category: 'auth'
        });

        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        Sentry.addBreadcrumb({
          message: `Initial session: ${initialSession ? 'found' : 'not found'}`,
          level: 'info',
          category: 'auth'
        });
        
        // If we have a session, fetch the profile
        if (initialSession?.user) {
          await fetchProfile();
          Sentry.addBreadcrumb({
            message: 'Profile fetched successfully',
            level: 'info',
            category: 'auth'
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        Sentry.captureException(error, {
          tags: { 
            component: 'RootLayout', 
            action: 'initializeAuth',
            critical: 'true'
          },
          extra: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, updatedSession) => {
        setSession(updatedSession);
        
        if (updatedSession?.user) {
          await fetchProfile();
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Check onboarding status when profile changes
  useEffect(() => {
    if (!loading && session?.user && profile !== undefined) {
      console.log('Checking onboarding status...');
      checkOnboardingStatus(profile);
    }
  }, [profile, loading, session, checkOnboardingStatus]);

  // Setup notification subscription when user is authenticated
  useEffect(() => {
    if (session?.user?.id) {
      // Fetch initial notifications
      fetchNotifications();
      
      // Subscribe to real-time notifications
      const unsubscribe = subscribeToNotifications(session.user.id);
      
      // Clean up subscription
      return () => unsubscribe();
    }
  }, [session?.user?.id, fetchNotifications, subscribeToNotifications]);

  // Handle routing based on auth state and onboarding status
  useEffect(() => {
    if (loading) return; // Only check auth loading
    
    // If onboarding is loading but only when we have a session
    if (session && onboardingLoading) return;

    // Allow legal pages to be accessed from anywhere
    if (inLegalGroup) return;

    if (!session) {
      // No session - redirect to auth (but allow legal pages)
      if (!inAuthGroup) {
        router.replace('/(auth)/auth');
      }
    } else {
      // Has session - check onboarding status
      if (!isOnboardingComplete || isInOnboardingFlow) {
        // Needs onboarding or is currently in the flow
        if (!inOnboardingGroup) {
          router.replace('/(onboarding)/welcome');
        }
      } else {
        // Onboarding complete and not in flow - redirect to app
        if (!inAppGroup) {
          router.replace('/(app)/(tabs)/home');
        }
      }
    }
  }, [session, segments, loading, onboardingLoading, isOnboardingComplete, isInOnboardingFlow]);

  // Show loading indicator while checking auth or onboarding (only when we have a session)
  if (loading || (session && onboardingLoading)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  // No need for Context.Provider when using Zustand
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(legal)" />
      <Stack.Screen name="(onboarding)" />
    </Stack>
  );
});