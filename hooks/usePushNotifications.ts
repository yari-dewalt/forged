import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import { supabase } from '../lib/supabase';
import BackgroundTaskManager from '../utils/backgroundTaskManager';

/**
 * Hook to initialize push notifications when user logs in
 */
export const usePushNotifications = () => {
  const { 
    initializePushNotifications, 
    disablePushNotifications, 
    pushNotificationsEnabled,
    pushToken,
    error 
  } = useNotificationStore();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Initialize push notifications when user signs in
          await initializePushNotifications();
          
          // Register background task for processing notifications
          const taskManager = BackgroundTaskManager.getInstance();
          await taskManager.registerBackgroundFetch();
        } else if (event === 'SIGNED_OUT') {
          // Remove push token when user signs out
          await disablePushNotifications();
          
          // Unregister background task
          const taskManager = BackgroundTaskManager.getInstance();
          await taskManager.unregisterBackgroundFetch();
        }
      }
    );

    // Initialize for already logged in users
    const initializeIfLoggedIn = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !pushNotificationsEnabled) {
        await initializePushNotifications();
        
        // Register background task
        const taskManager = BackgroundTaskManager.getInstance();
        await taskManager.registerBackgroundFetch();
      }
    };

    initializeIfLoggedIn();

    return () => {
      subscription.unsubscribe();
    };
  }, [initializePushNotifications, disablePushNotifications, pushNotificationsEnabled]);

  return {
    pushNotificationsEnabled,
    pushToken,
    error,
    initializePushNotifications,
    disablePushNotifications,
  };
};
