import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import PushNotificationService from './pushNotificationService';

const BACKGROUND_FETCH_TASK = 'background-fetch-push-notifications';

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('Background task: Processing push notifications...');
    
    const pushService = PushNotificationService.getInstance();
    await pushService.processQueuedNotifications();
    
    // Also clean up old notifications periodically
    await pushService.cleanupOldNotifications();
    
    console.log('Background task: Push notifications processed successfully');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class BackgroundTaskManager {
  private static instance: BackgroundTaskManager;
  
  static getInstance(): BackgroundTaskManager {
    if (!BackgroundTaskManager.instance) {
      BackgroundTaskManager.instance = new BackgroundTaskManager();
    }
    return BackgroundTaskManager.instance;
  }

  /**
   * Register background fetch task
   */
  async registerBackgroundFetch(): Promise<void> {
    try {
      // Check if already registered
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
          minimumInterval: 60 * 5, // 5 minutes minimum interval
          stopOnTerminate: false, // Continue after app is terminated
          startOnBoot: true, // Start when device boots
        });
        
        console.log('Background fetch task registered successfully');
      }
    } catch (error) {
      console.error('Error registering background fetch task:', error);
    }
  }

  /**
   * Unregister background fetch task
   */
  async unregisterBackgroundFetch(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
      
      if (isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
        console.log('Background fetch task unregistered successfully');
      }
    } catch (error) {
      console.error('Error unregistering background fetch task:', error);
    }
  }

  /**
   * Check background fetch status
   */
  async getBackgroundFetchStatus(): Promise<BackgroundFetch.BackgroundFetchStatus> {
    return await BackgroundFetch.getStatusAsync();
  }

  /**
   * Set minimum background fetch interval
   */
  async setBackgroundFetchInterval(intervalMs: number): Promise<void> {
    try {
      await BackgroundFetch.setMinimumIntervalAsync(intervalMs);
    } catch (error) {
      console.error('Error setting background fetch interval:', error);
    }
  }
}

export default BackgroundTaskManager;
