import PushNotificationService from './pushNotificationService';
import {
  sendPostLikePushNotification,
  sendFollowPushNotification,
  sendRoutineLikePushNotification,
  sendRoutineSavePushNotification,
  sendCommentLikePushNotification,
  sendCommentReplyPushNotification,
  sendPostCommentPushNotification,
} from './pushNotificationHelpers';

/**
 * Test utilities for push notifications
 * Use these functions to test your push notification system
 */

export const testPushNotifications = {
  /**
   * Test a post like notification
   */
  async testPostLike(recipientId: string, actorId: string, postId: string) {
    console.log('Testing post like notification...');
    await sendPostLikePushNotification(recipientId, actorId, postId);
    console.log('Post like notification queued');
  },

  /**
   * Test a follow notification
   */
  async testFollow(recipientId: string, actorId: string) {
    console.log('Testing follow notification...');
    await sendFollowPushNotification(recipientId, actorId);
    console.log('Follow notification queued');
  },

  /**
   * Test a routine like notification
   */
  async testRoutineLike(recipientId: string, actorId: string, routineId: string) {
    console.log('Testing routine like notification...');
    await sendRoutineLikePushNotification(recipientId, actorId, routineId);
    console.log('Routine like notification queued');
  },

  /**
   * Test a routine save notification
   */
  async testRoutineSave(recipientId: string, actorId: string, routineId: string) {
    console.log('Testing routine save notification...');
    await sendRoutineSavePushNotification(recipientId, actorId, routineId);
    console.log('Routine save notification queued');
  },

  /**
   * Test a comment like notification
   */
  async testCommentLike(recipientId: string, actorId: string, commentId: string) {
    console.log('Testing comment like notification...');
    await sendCommentLikePushNotification(recipientId, actorId, commentId);
    console.log('Comment like notification queued');
  },

  /**
   * Test a comment reply notification
   */
  async testCommentReply(recipientId: string, actorId: string, commentId: string) {
    console.log('Testing comment reply notification...');
    await sendCommentReplyPushNotification(recipientId, actorId, commentId);
    console.log('Comment reply notification queued');
  },

  /**
   * Test a post comment notification
   */
  async testPostComment(recipientId: string, actorId: string, postId: string, commentId: string) {
    console.log('Testing post comment notification...');
    await sendPostCommentPushNotification(recipientId, actorId, postId, commentId);
    console.log('Post comment notification queued');
  },

  /**
   * Process all queued notifications immediately (for testing)
   */
  async processQueue() {
    console.log('Processing notification queue...');
    const pushService = PushNotificationService.getInstance();
    await pushService.processQueuedNotifications();
    console.log('Queue processed');
  },

  /**
   * Test multiple notifications to see batching in action
   */
  async testBatching(recipientId: string, actorIds: string[], postId: string) {
    console.log('Testing notification batching...');
    
    // Send multiple like notifications rapidly
    for (const actorId of actorIds) {
      await sendPostLikePushNotification(recipientId, actorId, postId);
      // Small delay to simulate real-world timing
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Queued ${actorIds.length} like notifications for batching`);
    console.log('Wait 30 seconds then call processQueue() to see batched result');
  },

  /**
   * Clean up test data
   */
  async cleanup() {
    console.log('Cleaning up test notifications...');
    const pushService = PushNotificationService.getInstance();
    await pushService.cleanupOldNotifications();
    console.log('Cleanup complete');
  },
};

// Export for easy testing in development
if (__DEV__) {
  // Make test functions available globally in development
  (global as any).testPushNotifications = testPushNotifications;
  console.log('Push notification test utilities available as global.testPushNotifications');
}

export default testPushNotifications;
