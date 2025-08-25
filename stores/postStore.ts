import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { checkIfUserLikedPost } from '../utils/postUtils';

export const usePostStore = create((set, get) => ({
  trendingPosts: [],
  postsLoading: false,
  postsError: null,
  
  // Fetch trending posts based on likes, comments, and recency
  fetchTrendingPosts: async () => {
    try {
      set({ postsLoading: true, postsError: null });
      
      const { session } = useAuthStore.getState();
      
      // Get posts with their like counts, comment counts, and user info
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          description,
          title,
          created_at,
          likes_count,
          user_id,
          workout_id,
          profiles:user_id(id, username, avatar_url, full_name),
          post_likes(count),
          post_comments(count),
          post_media(id, storage_path, media_type, width, height, duration, order_index)
        `)
        .order('created_at', { ascending: false })
        .limit(15);
        
      if (error) throw error;
      
      if (data) {
        // Transform the data to match your Post component's expected format
        const formattedPosts = await Promise.all(data.map(async post => {
          // Check if current user has liked this post
          let hasLiked = false;
          if (session?.user?.id) {
            hasLiked = await checkIfUserLikedPost(post.id, session.user.id);
          }
          
          // Calculate hotness score
          const likeCount = post.post_likes?.[0]?.count || 0;
          const commentCount = post.post_comments?.[0]?.count || 0;
          const hotnessScore = calculateHotnessScore(
            likeCount,
            commentCount,
            post.created_at
          );
          
          // Handle profiles data (could be array or single object)
          const profileData = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
          
          return {
            id: post.id,
            user: {
              id: profileData?.id,
              username: profileData?.username,
              full_name: profileData?.full_name,
              avatar_url: profileData?.avatar_url
            },
            createdAt: post.created_at,
            title: post.title,
            text: post.description,
            workout_id: post.workout_id,
            media: post.post_media ? post.post_media.map(media => ({
              id: media.id,
              type: media.media_type,
              uri: media.storage_path.startsWith('http') 
                ? media.storage_path 
                : `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-content/${media.storage_path}`,
              width: media.width,
              height: media.height,
              duration: media.duration,
              order_index: media.order_index
            })).sort((a, b) => a.order_index - b.order_index) : [],
            likes: post.likes_count || likeCount,
            is_liked: hasLiked,
            comments: [],
            hotness_score: hotnessScore
          };
        }));
        
        // Sort by hotness score
        formattedPosts.sort((a, b) => b.hotness_score - a.hotness_score);
        
        set({ trendingPosts: formattedPosts });
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      set({ postsError: error.message });
    } finally {
      set({ postsLoading: false });
    }
  },
  
  // For home feed when user has seen all followed posts
  fetchSuggestedPosts: async () => {
    // Similar to fetchTrendingPosts but with different criteria
    // This will be implemented similarly to trending posts
    // but can be tuned differently for the home feed
  }
}));

// Calculate a "hotness" score for posts based on engagement and recency
const calculateHotnessScore = (likes: number, comments: number, createdAt: string) => {
  const postDate = new Date(createdAt);
  const now = new Date();
  const ageInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
  
  // Simple algorithm: (likes*1.5 + comments*3) / (ageInHours + 2)^1.4
  // This prioritizes recent posts with high engagement
  const score = (likes * 1.5 + comments * 3) / Math.pow(ageInHours + 2, 1.4);
  
  return score;
};