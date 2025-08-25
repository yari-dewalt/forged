# Push Notification System

This document outlines the comprehensive push notification system implemented for your fitness app.

## Features

✅ **Smart Batching**: Multiple similar notifications are automatically combined to avoid spam  
✅ **User Preferences**: Users can control which notifications they receive  
✅ **Background Processing**: Notifications are processed even when the app is closed  
✅ **Real-time Integration**: Works seamlessly with your existing in-app notification system  
✅ **Error Handling**: Graceful fallbacks and proper error handling  

## Setup Required

### 1. Get Expo Project ID

You need to add your Expo project ID to the push notification service:

1. Run `expo whoami` to see your username
2. Run `expo config` to see your project slug
3. Your project ID is typically `@your-username/your-slug`
4. Update `utils/pushNotificationService.ts` line 58:

```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-actual-project-id', // Replace this
});
```

### 2. Database Migration

Run the database migration to add push notification support:

```sql
-- Run the SQL in: database_migrations/add_push_notifications_support.sql
```

### 3. Test the System

The system includes testing utilities. In development, you can use:

```javascript
// Test a single notification
global.testPushNotifications.testPostLike('recipient-id', 'actor-id', 'post-id');

// Process the queue manually (normally happens automatically)
global.testPushNotifications.processQueue();

// Test batching with multiple notifications
global.testPushNotifications.testBatching('recipient-id', ['actor1-id', 'actor2-id'], 'post-id');
```

## How It Works

### 1. Notification Flow

1. **Action occurs** (like, comment, follow, etc.)
2. **In-app notification created** (existing system)
3. **Push notification queued** (new system)
4. **Background task processes queue** every 5 minutes
5. **Smart batching** combines similar notifications
6. **Push notification sent** to device

### 2. Smart Batching

The system automatically batches similar notifications to prevent spam:

- **Individual**: "John liked your post"
- **Batched**: "John and 3 others liked your post"

Batching rules:
- Groups notifications of the same type for the same content
- 5-minute batching window
- Updates existing batched notifications with new actors

### 3. User Settings

Users can control notifications in Settings → Notifications:
- **Push Notifications**: Master toggle for all push notifications
- **Individual Settings**: Control specific notification types (likes, comments, follows, etc.)

### 4. Background Processing

The system uses Expo's background fetch to process notifications even when the app is closed:
- Runs every 5 minutes minimum
- Processes queued notifications
- Cleans up old notification data

## Notification Types Supported

All notification types from your existing system:

1. **Post Like**: When someone likes your post
2. **Follow**: When someone follows you  
3. **Routine Like**: When someone likes your routine
4. **Routine Save**: When someone saves your routine
5. **Comment Like**: When someone likes your comment
6. **Comment Reply**: When someone replies to your comment
7. **Post Comment**: When someone comments on your post

## Files Added/Modified

### New Files:
- `utils/pushNotificationService.ts` - Core push notification service
- `utils/pushNotificationHelpers.ts` - Helper functions for each notification type
- `utils/backgroundTaskManager.ts` - Background task management
- `utils/pushNotificationTesting.ts` - Testing utilities
- `hooks/usePushNotifications.ts` - React hook for push notifications
- `database_migrations/add_push_notifications_support.sql` - Database schema

### Modified Files:
- `stores/notificationStore.ts` - Added push notification state and integration
- `app/_layout.tsx` - Added push notification initialization
- `app/(app)/(cards)/settings/notifications.tsx` - Added push notification toggle
- `app.json` - Added notification permissions and configuration
- `package.json` - Added push notification dependencies

## Testing Checklist

1. **Setup**:
   - [ ] Update project ID in pushNotificationService.ts
   - [ ] Run database migration
   - [ ] Install new dependencies (`npm install`)

2. **Basic Testing**:
   - [ ] Enable push notifications in Settings
   - [ ] Test single notification using test utilities
   - [ ] Verify notification appears on device
   - [ ] Test disabling push notifications

3. **Advanced Testing**:
   - [ ] Test notification batching with multiple rapid notifications
   - [ ] Test background processing (close app, wait 5+ minutes)
   - [ ] Test different notification types
   - [ ] Test user preference filtering

4. **Production Testing**:
   - [ ] Test on physical device (push notifications don't work on simulator)
   - [ ] Test with app in background/closed
   - [ ] Verify notification tapping opens correct screen
   - [ ] Check notification badge counts

## Production Considerations

1. **Expo Push Service**: For production, consider upgrading to Expo's paid push service for higher delivery rates
2. **Error Monitoring**: Add error tracking for failed push notifications
3. **Analytics**: Track notification delivery rates and click-through rates
4. **A/B Testing**: Test different notification copy and timing
5. **Rate Limiting**: Consider additional rate limiting for high-volume users

## Troubleshooting

### Notifications Not Sending
1. Check push token is registered: Look in `profiles.push_token` column
2. Verify project ID is correct in pushNotificationService.ts
3. Check notification queue: Query `push_notifications` table
4. Review error logs in `push_notifications.error_message`

### Notifications Not Received
1. Ensure device allows notifications for the app
2. Test on physical device (not simulator)
3. Check notification settings in app
4. Verify background fetch is working

### Batching Issues
1. Check `push_notifications.batch_key` for grouping
2. Verify timing window (30 seconds processing delay)
3. Review `batch_count` column for aggregation

## Next Steps

1. **Set up your Expo project ID**
2. **Run the database migration**
3. **Test the system with the testing utilities**
4. **Deploy and monitor delivery rates**
5. **Iterate on notification copy and timing based on user feedback**
