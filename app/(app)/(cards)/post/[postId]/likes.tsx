import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Pressable, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons as IonIcon } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../../../../lib/supabase';
import CachedAvatar from '../../../../../components/CachedAvatar';
import UserListSkeleton from '../../../../../components/UserListSkeleton';
import { colors } from '../../../../../constants/colors';
import { useAuthStore } from '../../../../../stores/authStore';
import { useProfileStore } from '../../../../../stores/profileStore';

export default function PostLikesScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [likes, setLikes] = useState([]);
  const [filteredLikes, setFilteredLikes] = useState([]);
  const [error, setError] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const { session } = useAuthStore();
  const { followUser, unfollowUser } = useProfileStore();

  useEffect(() => {
    if (postId) {
      fetchLikes();
    }
  }, [postId]);

  const fetchLikes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('post_likes')
        .select(`
          user_id,
          created_at,
          profiles!inner(
            id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      setLikes(data || []);
      setFilteredLikes(data || []);
      
      // Fetch follow status for each user
      if (session?.user?.id && data?.length > 0) {
        const userIds = data.map((like: any) => like.profiles.id).filter((id: string) => id !== session.user.id);
        
        if (userIds.length > 0) {
          const { data: followData, error: followError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', session.user.id)
            .in('following_id', userIds);
          
          if (!followError && followData) {
            const followingSet = new Set(followData.map(f => f.following_id));
            setFollowingUsers(followingSet);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
      setError(err.message || 'Failed to load likes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowToggle = async (userId: string) => {
    if (!session?.user?.id || userId === session.user.id) return;
    
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const isCurrentlyFollowing = followingUsers.has(userId);
    
    // Optimistic update
    if (isCurrentlyFollowing) {
      setFollowingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } else {
      setFollowingUsers(prev => new Set([...prev, userId]));
    }
    
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId, session.user.id);
      } else {
        await followUser(userId, session.user.id);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert optimistic update on error
      if (isCurrentlyFollowing) {
        setFollowingUsers(prev => new Set([...prev, userId]));
      } else {
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredLikes(likes);
    } else {
      const filtered = likes.filter((like: any) => 
        like.profiles.username.toLowerCase().includes(query.toLowerCase()) ||
        (like.profiles.full_name && like.profiles.full_name.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredLikes(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredLikes(likes);
  };

  const renderLike = ({ item }) => {
    const isOwnProfile = session?.user?.id === item.profiles.id;
    const isFollowing = followingUsers.has(item.profiles.id);
    const hasFullName = item.profiles.name && item.profiles.name.trim() !== '';
    
    return (
      <TouchableOpacity
                activeOpacity={0.5} 
        style={styles.likeItem}
        onPress={() => router.push(`/profile/${item.profiles.id}`)}
      >
        <CachedAvatar 
          path={item.profiles.avatar_url} 
          size={44} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {item.profiles.username}
          </Text>
          {hasFullName && (
            <Text style={styles.fullName}>{item.profiles.name}</Text>
          )}
        </View>
        
        {!isOwnProfile && (
          <TouchableOpacity
                activeOpacity={0.5}
            style={[
              styles.followButton,
              isFollowing && styles.followingButton
            ]}
            onPress={(e) => {
              e.stopPropagation(); // Prevent navigation to profile
              handleFollowToggle(item.profiles.id);
            }}
          >
            <Text style={[
              styles.followButtonText,
              isFollowing && styles.followingButtonText
            ]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <UserListSkeleton count={8} showFollowButton={true} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
                activeOpacity={0.5} 
          style={styles.retryButton}
          onPress={fetchLikes}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {filteredLikes.length === 0 && !isLoading ? (
        <TouchableOpacity
                activeOpacity={0.5} style={styles.emptyContainer} onPress={Keyboard.dismiss}>
          {searchQuery.length > 0 ? (
            <>
              <IonIcon name="search-outline" size={64} color={colors.secondaryText} />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try searching with a different username</Text>
            </>
          ) : likes.length === 0 ? (
            <>
              <IonIcon name="heart-outline" size={64} color={colors.secondaryText} />
              <Text style={styles.emptyText}>No likes yet</Text>
              <Text style={styles.emptySubtext}>Be the first to like this post!</Text>
            </>
          ) : null}
        </TouchableOpacity>
      ) : (
        <FlatList
          data={filteredLikes}
          renderItem={renderLike}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
          ListHeaderComponent={
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <IonIcon name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  placeholderTextColor={colors.secondaryText}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                activeOpacity={0.5} onPress={clearSearch} style={styles.clearButton}>
                    <IonIcon name="close-circle" size={20} color={colors.secondaryText} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: colors.primaryText,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  listContainer: {
    paddingTop: 16,
  },
  likeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  followButton: {
    width: 100,
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: colors.secondaryAccent,
  },
  followButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '600',
  },
  followingButtonText: {
    color: colors.primaryText,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryAccent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primaryText,
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});
