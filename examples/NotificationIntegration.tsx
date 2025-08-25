// Example of how to integrate notifications into existing components

// In your Post component where users can like posts:
import { createPostLikeNotification } from '../stores/notificationStore';

const handleLikePost = async (postId: string, postAuthorId: string, currentUserId: string) => {
  try {
    // Your existing like logic here...
    const result = await likePost(postId, currentUserId);
    
    // The notification is automatically created in the likePost function
    // No additional code needed here!
    
    return result;
  } catch (error) {
    console.error('Error liking post:', error);
  }
};

// In your Follow button component:
import { createFollowNotification } from '../stores/notificationStore';

const handleFollowUser = async (targetUserId: string, currentUserId: string) => {
  try {
    // Your existing follow logic here...
    await followUser(targetUserId, currentUserId);
    
    // The notification is automatically created in the followUser function
    // No additional code needed here!
    
  } catch (error) {
    console.error('Error following user:', error);
  }
};

// In your Comment component:
import { createPostCommentNotification, createCommentReplyNotification } from '../stores/notificationStore';

const handleAddComment = async (postId: string, text: string, parentId?: string) => {
  try {
    // Your existing comment logic here...
    const comment = await addComment(postId, session.user.id, text, parentId);
    
    // The notification is automatically created in the addComment function
    // No additional code needed here!
    
    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
  }
};

// In your Routine component for likes and saves:
import { toggleRoutineLike, toggleRoutineSave } from '../utils/routineUtils';

const handleToggleRoutineLike = async (routineId: string, userId: string) => {
  try {
    const isLiked = await toggleRoutineLike(routineId, userId);
    // Notification is automatically created in toggleRoutineLike
    return isLiked;
  } catch (error) {
    console.error('Error toggling routine like:', error);
  }
};

const handleToggleRoutineSave = async (routineId: string, userId: string) => {
  try {
    const isSaved = await toggleRoutineSave(routineId, userId);
    // Notification is automatically created in toggleRoutineSave
    return isSaved;
  } catch (error) {
    console.error('Error toggling routine save:', error);
  }
};

// In your main app component to set up real-time notifications:
import { useNotificationStore } from '../stores/notificationStore';
import { useAuthStore } from '../stores/authStore';

export default function App() {
  const { session } = useAuthStore();
  const { subscribeToNotifications, fetchNotifications } = useNotificationStore();
  
  useEffect(() => {
    if (session?.user?.id) {
      // Fetch initial notifications
      fetchNotifications();
      
      // Subscribe to real-time updates
      const unsubscribe = subscribeToNotifications(session.user.id);
      
      return () => {
        unsubscribe();
      };
    }
  }, [session?.user?.id]);
  
  // Your app content...
}
