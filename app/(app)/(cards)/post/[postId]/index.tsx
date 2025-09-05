import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../../../../lib/supabase';
import Post from '../../../../../components/Post/Post';
import { colors } from '../../../../../constants/colors';
import PostSkeleton from '../../../../../components/Post/PostSkeleton';
import { checkIfUserLikedPost } from '../../../../../utils/postUtils';
import { useAuthStore } from '../../../../../stores/authStore';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const { session } = useAuthStore();

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
        .eq('id', postId)
        .single();
      
      if (error) {
        throw error;
      }

      if (data) {
        // Fetch the profile data separately
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, full_name')
          .eq('id', data.user_id)
          .single();
        
        if (profileError) {
          console.log('Profile fetch error:', profileError);
        }

        let hasLiked = false;
        if (session?.user?.id) {
          hasLiked = await checkIfUserLikedPost(data.id, session.user.id);
        }

        // Transform the post data to match the Post component's expected format
        const formattedPost = {
          id: data.id,
          user: {
            id: profileData?.id,
            username: profileData?.username,
            full_name: profileData?.full_name,
            avatar_url: profileData?.avatar_url
          },
          createdAt: data.created_at,
          title: data.title,
          text: data.description,
          workout_id: data.workout_id,
          media: data.post_media ? data.post_media.map(media => ({
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
          likes: data.likes_count || (data.post_likes?.[0]?.count || 0),
          is_liked: hasLiked,
          comments: []
        };
        
        setPost(formattedPost);
      } else {
        setPost(null);
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.message || 'Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {isLoading ? (
          <PostSkeleton />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
                activeOpacity={0.5} 
              style={styles.retryButton}
              onPress={fetchPost}
            >
              <Text style={styles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : post ? (
          <Post data={post} onDelete={(postId) => {
            // Navigate back after deletion
            router.back();
          }} />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Post not found</Text>
            <TouchableOpacity
                activeOpacity={0.5} 
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 70,
    backgroundColor: colors.secondaryAccent,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 24, // Same width as back button for centering
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.notification,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
  },
});