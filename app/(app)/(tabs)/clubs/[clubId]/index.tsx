import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, Pressable, Image, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert, ActivityIndicator, FlatList, TouchableOpacity } from "react-native";
import { useState, useEffect, useRef } from "react";
import { colors } from "../../../../../constants/colors";
import IonIcon from "react-native-vector-icons/Ionicons";
import CachedAvatar from "../../../../../components/CachedAvatar";
import { useAuthStore } from "../../../../../stores/authStore";
import { fetchClubById, isClubMember, joinClub, leaveClub, getClubMembers } from "../../../../../utils/clubUtils";
import { supabase } from "../../../../../lib/supabase";
import { useMemo } from "react";
import Post from "../../../../../components/Post/Post";
import { useClubStore } from "../../../../../stores/clubStore";

// Define club data type to match Supabase structure
interface ClubData {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  creator_id: string;
  privacy_level: 'public' | 'private';
  member_count: number;
  created_at: string;
  updated_at: string;
  // Client-side properties
  isMember?: boolean;
  role?: 'admin' | 'moderator' | 'member';
}

export default function ClubPage() {
  const { clubId } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'posts' | 'members'>('chat');
  const { 
    currentClub: club, 
    clubMembers, 
    loading, 
    membersLoading, 
    membershipLoading: joiningClub,
    fetchClubById, 
    fetchClubMembers,
    joinClub, 
    leaveClub 
  } = useClubStore();

  // Fetch club data and check membership
  useEffect(() => {
    const loadClubData = async () => {
      try {
        // Use the store to fetch the club data
        const clubData = await fetchClubById(String(clubId), session?.user?.id);
        
        if (!clubData) {
          Alert.alert("Error", "Club not found");
          router.back();
          return;
        }
        
        // If chat tab is active and user is a member, fetch members
        if (activeTab === 'members' || (activeTab === 'chat' && clubData.isMember)) {
          fetchClubMembers(String(clubId));
        }
      } catch (error) {
        console.error("Error fetching club:", error);
        Alert.alert("Error", "Failed to load club information");
      }
    };
    
    loadClubData();
  }, [clubId, session]);
  
  // Handle joining/leaving the club
  const handleToggleMembership = async () => {
    if (!session?.user) {
      Alert.alert("Sign in required", "Please sign in to join this club");
      return;
    }
    
    try {
      if (club?.isMember) {
        // Leave the club using the store
        const success = await leaveClub(String(clubId), session.user.id);
        if (success) {
          Alert.alert("Success", `You have left ${club.name}`);
        }
      } else {
        // Join the club using the store
        const success = await joinClub(String(clubId), session.user.id);
        if (success) {
          Alert.alert("Success", `You have joined ${club?.name}`);
          
          // Refresh members list if viewing members tab
          if (activeTab === 'members') {
            fetchClubMembers(String(clubId));
          }
        }
      }
    } catch (error) {
      console.error("Error toggling membership:", error);
      Alert.alert("Error", "Failed to update membership");
    }
  };
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={styles.loadingText}>Loading club information...</Text>
      </View>
    );
  }
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return club?.isMember ? (
          <ChatTab />
        ) : (
          <View style={styles.tabContent}>
            <Text style={styles.placeholderText}>Join to access club chat</Text>
            <Text style={styles.subText}>Chat is only available to club members</Text>
            <TouchableOpacity
                activeOpacity={0.5} 
              style={styles.joinButton}
              onPress={handleToggleMembership}
              disabled={joiningClub}
            >
              {joiningClub ? (
                <ActivityIndicator size="small" color={colors.primaryText} />
              ) : (
                <Text style={styles.joinButtonText}>Join Club</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      case 'posts':
        return <PostsTab club={club} />;
      case 'members':
        return <MembersTab members={clubMembers} loading={membersLoading} />;
      default:
        return <PostsTab club={club} />;
    }
  };
  
  // Update tab logic to fetch members when switching to members tab
  const handleTabChange = (tab: 'chat' | 'posts' | 'members') => {
    setActiveTab(tab);
    
    // If switching to members tab and we haven't loaded members yet
    if (tab === 'members' && clubMembers.length === 0 && !membersLoading) {
      fetchClubMembers(String(clubId));
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Club Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* Club Icon */}
          <View style={styles.clubIconContainer}>
            {club?.avatar_url ? (
              <CachedAvatar
                path={club.avatar_url}
                size={50}
                style={styles.clubIcon}
              />
            ) : (
              <View style={styles.clubIcon}>
                <Text style={styles.clubInitial}>{club?.name.charAt(0) ?? ''}</Text>
              </View>
            )}
          </View>
          
          {/* Club Stats */}
          <View style={styles.clubStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{club?.member_count || 0}</Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {new Date(club?.created_at || '').getFullYear()}
              </Text>
              <Text style={styles.statLabel}>Founded</Text>
            </View>
          </View>
          
          {/* Membership Controls */}
          <View style={styles.membershipControls}>
            {/* Join Button */}
            {!club?.isMember && (
              <TouchableOpacity
                activeOpacity={0.5} 
                style={styles.joinButton}
                onPress={handleToggleMembership}
                disabled={joiningClub}
              >
                {joiningClub ? (
                  <ActivityIndicator size="small" color={colors.primaryText} />
                ) : (
                  <Text style={styles.joinButtonText}>Join</Text>
                )}
              </TouchableOpacity>
            )}
            
            {/* Leave Button */}
            {club?.isMember && club?.role !== 'admin' && (
              <TouchableOpacity
                activeOpacity={0.5} 
                style={styles.leaveButton}
                onPress={handleToggleMembership}
                disabled={joiningClub}
              >
                {joiningClub ? (
                  <ActivityIndicator size="small" color={colors.primaryText} />
                ) : (
                  <Text style={styles.leaveButtonText}>Leave</Text>
                )}
              </TouchableOpacity>
            )}
            
            {/* Role Badge */}
            {club?.role === 'admin' && (
              <View style={[styles.roleBadge, styles.adminBadge]}>
                <Text style={styles.roleBadgeText}>Admin</Text>
              </View>
            )}
            
            {club?.role === 'moderator' && (
              <View style={[styles.roleBadge, styles.modBadge]}>
                <Text style={styles.roleBadgeText}>Mod</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Club Description */}
        {club?.description && (
          <Text style={styles.clubDescription}>{club.description}</Text>
        )}
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabNav}>
        <TouchableOpacity
                activeOpacity={0.5} 
          style={[styles.tabButton, activeTab === 'chat' && styles.activeTabButton]}
          onPress={() => handleTabChange('chat')}
        >
          <Text 
            style={[styles.tabButtonText, activeTab === 'chat' && styles.activeTabText]}
          >
            Chat
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
                activeOpacity={0.5} 
          style={[styles.tabButton, activeTab === 'posts' && styles.activeTabButton]}
          onPress={() => handleTabChange('posts')}
        >
          <Text 
            style={[styles.tabButtonText, activeTab === 'posts' && styles.activeTabText]}
          >
            Posts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
                activeOpacity={0.5} 
          style={[styles.tabButton, activeTab === 'members' && styles.activeTabButton]}
          onPress={() => handleTabChange('members')}
        >
          <Text 
            style={[styles.tabButtonText, activeTab === 'members' && styles.activeTabText]}
          >
            Members
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const PostsTab = ({ club }) => {
  const { clubId } = useLocalSearchParams();
  const { session } = useAuthStore();
  const router = useRouter();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch club member posts
  const fetchClubPosts = async () => {
    try {
      setLoading(true);
      
      // Get all club members
      const { data: members, error: membersError } = await supabase
        .from('club_members')
        .select('user_id')
        .eq('club_id', clubId);
        
      if (membersError) throw membersError;
      
      if (!members || members.length === 0) {
        setPosts([]);
        return;
      }
      
      // Extract member IDs
      const memberIds = members.map(member => member.user_id);
      
      // Get posts from club members
      const { data: postsData, error: postsError } = await supabase
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
          post_media(id, storage_path, media_type, width, height, duration, order_index)
        `)
        .in('user_id', memberIds)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (postsError) throw postsError;
      
      if (postsData && session?.user) {
        const postIds = postsData.map(post => post.id);
        const { data: likes, error: likesError } = await supabase
          .from('post_likes') // Make sure this table name matches your schema
          .select('post_id')
          .eq('user_id', session.user.id)
          .in('post_id', postIds);
          
        // Create a set of post IDs the user has liked
        const likedPostIds = new Set((likes || []).map(like => like.post_id));
        
        // Format the data to match the Post component's expected format
        const formattedPosts = postsData.map(post => {
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
            likes: post.likes_count || 0,
            is_liked: likedPostIds.has(post.id)
          };
        });
        
        setPosts(formattedPosts);
      } else {
        // If there's no user logged in, we still format the posts but without the liked status
        const formattedPosts = postsData.map(post => ({
          id: post.id,
          user: {
            id: post.profiles?.[0]?.id,
            username: post.profiles?.[0]?.username,
            full_name: post.profiles?.[0]?.full_name,
            avatar_url: post.profiles?.[0]?.avatar_url
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
          likes: post.likes_count || 0,
          is_liked: false
        }));
        
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error("Error fetching club posts:", error);
      Alert.alert("Error", "Failed to load club posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Handle post deletion
  const handlePostDelete = (postId) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
  };
  
  // Create new post
  const handleNewPost = () => {
    router.push({
      pathname: `/editPost/new`,
      params: { clubId, returnTo: `/clubs/${clubId}` }
    });
  };
  
  // Load posts when component mounts
  useEffect(() => {
    fetchClubPosts();
  }, [clubId, session]);
  
  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchClubPosts();
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={[styles.subText, {marginTop: 16}]}>Loading posts...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.postsContainer}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Post 
            data={item}
            onDelete={handlePostDelete}
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.postsContent}
        ListEmptyComponent={
          <View style={styles.emptyPosts}>
            <IonIcon name="newspaper-outline" size={40} color={colors.secondaryText} />
            <Text style={styles.emptyPostsText}>No posts yet</Text>
            <Text style={styles.emptyPostsSubtext}>Club members haven't shared any posts yet</Text>
            {club?.isMember && (
              <TouchableOpacity
                activeOpacity={0.5} 
                style={styles.createFirstPostButton}
                onPress={handleNewPost}
              >
                <Text style={styles.createFirstPostText}>Create First Post</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
      />
      
      {/* New Post Button */}
      {club?.isMember && (
        <TouchableOpacity
                activeOpacity={0.5} 
          style={styles.newPostButton}
          onPress={handleNewPost}
        >
          <IonIcon name="create-outline" size={24} color={colors.primaryText} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const ChatTab = () => {
  const { clubId } = useLocalSearchParams();
  const { session } = useAuthStore();
  const scrollViewRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel(`club-messages-${clubId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'club_messages',
          filter: `club_id=eq.${clubId}`
        }, 
        payload => {
          // Add new message to state
          fetchMessageWithUser(payload.new);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [clubId]);
  
  // Fetch messages with user data
  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // First get messages
      const { data: messages, error: messagesError } = await supabase
        .from('club_messages')
        .select(`
          id, 
          content, 
          created_at, 
          user_id,
          club_id
        `)
        .eq('club_id', clubId)
        .order('created_at', { ascending: true })
        .limit(100);
        
      if (messagesError) throw messagesError;
      
      if (!messages || messages.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }
      
      // Then get profiles for these users
      const userIds = [...new Set(messages.map(msg => msg.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Combine the data
      const messagesWithProfiles = messages.map(message => {
        const profile = profiles?.find(p => p.id === message.user_id);
        return {
          ...message,
          profiles: profile || { id: message.user_id }
        };
      });
      
      setMessages(messagesWithProfiles);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  };
  
  // Also update the fetchMessageWithUser function for real-time updates:
  const fetchMessageWithUser = async (message) => {
    try {
      // Get user profile for this message
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url')
        .eq('id', message.user_id)
        .single();
        
      if (error) throw error;
      
      // Add message with user profile
      setMessages(current => [
        ...current, 
        { ...message, profiles: profile }
      ]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error("Error fetching message user:", error);
    }
  };
  
  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user) return;
    
    try {
      setSending(true);
      const messageContent = newMessage.trim();
      
      // Clear input immediately for better UX
      setNewMessage('');
      
      // Create optimistic message (message that will be shown immediately)
      const optimisticMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        content: messageContent,
        user_id: session.user.id,
        created_at: new Date().toISOString(),
        profiles: {
          id: session.user.id,
          name: session.user?.user_metadata?.name || session.user.email,
          username: session.user?.user_metadata?.username || session.user.email,
          avatar_url: session.user?.user_metadata?.avatar_url
        }
      };
      
      // Add to local state immediately (optimistic update)
      setMessages(current => [...current, optimisticMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Insert actual message
      const { error, data } = await supabase
        .from('club_messages')
        .insert({
          club_id: clubId,
          user_id: session.user.id,
          content: messageContent
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // If successful, replace optimistic message with real one
      if (data) {
        setMessages(current => 
          current.map(msg => 
            msg.id === optimisticMessage.id ? 
              { ...data, profiles: optimisticMessage.profiles } : 
              msg
          )
        );
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message");
      
      // Remove optimistic message if failed
      setMessages(current => 
        current.filter(msg => !msg.id.toString().startsWith('temp-'))
      );
    } finally {
      setSending(false);
    }
  };
  
  // Format message timestamp
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Check if message is from current user
  const isOwnMessage = (userId) => {
    return userId === session?.user?.id;
  };
  
  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.created_at).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    
    return Object.entries(groups).map(([date, msgs]) => ({
      date,
      messages: msgs
    }));
  }, [messages]);
  
  // Render chat day separator
  const renderDateSeparator = (date) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    let displayDate;
    if (date === today) displayDate = "Today";
    else if (date === yesterday) displayDate = "Yesterday";
    else displayDate = new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    return (
      <View style={styles.dateSeparator}>
        <Text style={styles.dateSeparatorText}>{displayDate}</Text>
      </View>
    );
  };

    // Group messages by user (consecutive messages)
  const groupMessagesByUser = (messages) => {
    const groups = [];
    let currentGroup = [];
    
    messages.forEach((message, index) => {
      if (index === 0) {
        // Start first group
        currentGroup.push(message);
      } else {
        const prevMessage = messages[index - 1];
        
        // If same user and within 5 minutes, add to current group
        const timeDiff = new Date(message.created_at).getTime() - 
                        new Date(prevMessage.created_at).getTime();
        const isWithinTimeWindow = timeDiff < 5 * 60 * 1000; // 5 minutes
        
        if (message.user_id === prevMessage.user_id && isWithinTimeWindow) {
          currentGroup.push(message);
        } else {
          // Start a new group
          groups.push([...currentGroup]);
          currentGroup = [message];
        }
      }
    });
    
    // Add the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  };

  // Format timestamp for message headers (like "Today at 2:30 PM")
  const formatFullTimestamp = (dateString) => {
    const date = new Date(dateString);
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    const messageDate = date.toLocaleDateString();
    
    let prefix;
    if (messageDate === today) {
      prefix = "Today at ";
    } else if (messageDate === yesterday) {
      prefix = "Yesterday at ";
    } else {
      prefix = date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + " at ";
    }
    
    return prefix + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={[styles.subText, {marginTop: 16}]}>Loading messages...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Messages List */}
      <ScrollView 
        style={styles.messagesContainer}
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyChat}>
            <IonIcon name="chatbubble-outline" size={40} color={colors.secondaryText} />
            <Text style={styles.emptyChatText}>No messages yet</Text>
            <Text style={styles.emptyChatSubtext}>Start the conversation!</Text>
          </View>
        ) : (
          // Group messages by date first
          groupedMessages.map(group => (
            <View key={group.date}>
              {renderDateSeparator(group.date)}
              
              {/* Then render each message group */}
              {groupMessagesByUser(group.messages).map((messageGroup, groupIndex) => (
                <View key={messageGroup[0].id} style={styles.discordMessageGroup}>
                  {/* User avatar (shown once per group) */}
                  <CachedAvatar
                    path={messageGroup[0].profiles?.avatar_url}
                    size={36}
                    initial={(messageGroup[0].profiles?.name || messageGroup[0].profiles?.username || "?").charAt(0)}
                    style={styles.discordAvatar}
                  />
                  
                  <View style={styles.discordMessageContent}>
                    {/* Username and timestamp (shown once per group) */}
                    <View style={styles.discordMessageHeader}>
                      <Text style={styles.discordUsername}>
                        {messageGroup[0].profiles?.name || messageGroup[0].profiles?.username || "Unknown User"}
                      </Text>
                      <Text style={styles.discordTimestamp}>
                        {formatFullTimestamp(messageGroup[0].created_at)}
                      </Text>
                    </View>
                    
                    {/* All messages from this user in sequence */}
                    {messageGroup.map((message, messageIndex) => (
                      <Text key={message.id} style={styles.discordMessageText}>
                        {message.content}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      
      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.secondaryText}
          multiline
        />
        <TouchableOpacity
                activeOpacity={0.5} 
          style={[
            styles.sendButton,
            (!newMessage.trim() || sending) && styles.disabledButton
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.primaryText} />
          ) : (
            <IonIcon name="send" size={20} color={colors.primaryText} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// Update the MembersTab to display actual members
const MembersTab = ({ members, loading }) => {
  if (loading) {
    return (
      <View style={styles.tabContent}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={[styles.subText, {marginTop: 16}]}>Loading members...</Text>
      </View>
    );
  }
  
  if (members.length === 0) {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.placeholderText}>No Members Found</Text>
        <Text style={styles.subText}>This club doesn't have any members yet</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 16, gap: 12}}>
      {members.map(member => (
        <View key={member.user_id} style={styles.memberItem}>
          <CachedAvatar
            path={member.profiles?.avatar_url}
            size={40}
            initial={(member.profiles?.name || member.profiles?.username || "?").charAt(0)}
            style={styles.memberAvatar}
          />
          
          <View style={styles.memberInfo}>
            <Text style={styles.memberName}>
              {member.profiles?.name || member.profiles?.username || "Unknown User"}
            </Text>
            {member.role !== 'member' && (
              <Text style={[
                styles.memberRole,
                member.role === 'admin' ? styles.adminRole : styles.modRole
              ]}>
                {member.role}
              </Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.primaryText,
    fontSize: 16,
  },
  header: {
    backgroundColor: colors.secondaryAccent,
    padding: 12,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clubIconContainer: {
    marginRight: 12,
  },
  clubIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubInitial: {
    color: colors.primaryText,
    fontSize: 20,
    fontWeight: 'bold',
  },
  clubStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  statDivider: {
    height: 24,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 15,
  },
  membershipControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: colors.brand,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  joinButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: colors.secondaryText,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  leaveButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: colors.brand,
  },
  modBadge: {
    backgroundColor: colors.secondaryText,
  },
  roleBadgeText: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  clubDescription: {
    marginTop: 12,
    color: colors.primaryText,
    fontSize: 14,
    lineHeight: 20,
  },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: colors.primaryAccent,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: colors.brand,
  },
  tabButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: 'bold',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 400,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  clubDescription: {
    marginTop: 12,
    color: colors.primaryText,
    fontSize: 14,
    lineHeight: 20,
  },
  joinButton: {
    backgroundColor: colors.brand,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: colors.secondaryText,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  leaveButtonText: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  adminBadge: {
    backgroundColor: colors.brand,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  modBadge: {
    backgroundColor: colors.secondaryAccent,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.primaryAccent,
    borderRadius: 8,
  },
  memberAvatar: {
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryText,
  },
  memberRole: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  adminRole: {
    color: colors.brand,
    fontWeight: 'bold',
  },
  modRole: {
    color: colors.brand,
    opacity: 0.8,
  },
  postsContainer: {
    flex: 1,
    position: 'relative',
  },
  postsContent: {
    paddingBottom: 80, // Space for FAB
  },
  postSeparator: {
    height: 1,
    backgroundColor: colors.background,
  },
  emptyPosts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyPostsText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyPostsSubtext: {
    color: colors.secondaryText,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  createFirstPostButton: {
    backgroundColor: colors.brand,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  createFirstPostText: {
    color: colors.primaryText,
    fontWeight: 'bold',
  },
  newPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  messagesContent: {
    paddingTop: 12,
    paddingBottom: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageWrapper: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  ownMessageBubble: {
    backgroundColor: colors.brand,
    borderTopRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.primaryAccent,
    borderTopLeftRadius: 4,
  },
  messageAvatar: {
    marginRight: 8,
    marginLeft: 8,
    alignSelf: 'flex-end',
  },
  messageUsername: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: colors.primaryText,
  },
  messageTime: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.primaryAccent,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.secondaryAccent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.primaryText,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.brand,
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyChatText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyChatSubtext: {
    color: colors.secondaryText,
    fontSize: 14,
    marginTop: 4,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    backgroundColor: colors.primaryAccent,
    color: colors.secondaryText,
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discordMessageGroup: {
    flexDirection: 'row',
    padding: 8,
    paddingVertical: 12,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(80, 80, 80, 0.2)',
  },
  discordAvatar: {
    marginRight: 12,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  discordMessageContent: {
    flex: 1,
    marginRight: 12,
  },
  discordMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  discordUsername: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginRight: 8,
  },
  discordTimestamp: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  discordMessageText: {
    fontSize: 15,
    color: colors.primaryText,
    marginVertical: 2,
    lineHeight: 20,
  },
});