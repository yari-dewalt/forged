import { View, Text, FlatList, StyleSheet, Pressable, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { colors } from '../../../../../constants/colors';
import { supabase } from '../../../../../lib/supabase';
import { useAuthStore } from '../../../../../stores/authStore';
import CachedImage from '../../../../../components/CachedImage';

export default function ClubsScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuthStore();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Function to fetch user's clubs
  const fetchUserClubs = async () => {
    try {
      setLoading(true);
      
      // Get clubs the user is a member of
      const { data: memberships, error: membershipError } = await supabase
        .from('club_members')
        .select('club_id, role')
        .eq('user_id', userId);
        
      if (membershipError) throw membershipError;
      
      if (!memberships || memberships.length === 0) {
        setClubs([]);
        setLoading(false);
        return;
      }
      
      const clubIds = memberships.map(m => m.club_id);
      
      // Get club details
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('*')
        .in('id', clubIds);
        
      if (clubError) throw clubError;
      
      // Combine club data with membership roles
      const clubsWithRole = clubData.map(club => {
        const membership = memberships.find(m => m.club_id === club.id);
        return {
          ...club,
          role: membership?.role || 'member',
          joined: true
        };
      });
      
      setClubs(clubsWithRole);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      Alert.alert('Error', 'Failed to load clubs. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Function to join/leave a club
  const toggleClubMembership = async (clubId, isCurrentlyJoined) => {
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in to join clubs');
      return;
    }
    
    try {
      if (isCurrentlyJoined) {
        // Leave club
        const { error } = await supabase
          .from('club_members')
          .delete()
          .eq('club_id', clubId)
          .eq('user_id', session.user.id);
          
        if (error) throw error;
        
        // Update local state
        setClubs(prevClubs => 
          prevClubs.map(club => 
            club.id === clubId 
              ? { ...club, joined: false, member_count: Math.max(0, club.member_count - 1) }
              : club
          )
        );
      } else {
        // Join club
        const { error } = await supabase
          .from('club_members')
          .insert({
            club_id: clubId,
            user_id: session.user.id,
            role: 'member'
          });
          
        if (error) throw error;
        
        // Update local state
        setClubs(prevClubs => 
          prevClubs.map(club => 
            club.id === clubId 
              ? { ...club, joined: true, member_count: club.member_count + 1 }
              : club
          )
        );
      }
    } catch (error) {
      console.error('Error toggling club membership:', error);
      Alert.alert('Error', 'Failed to update club membership.');
    }
  };
  
  // Initial data load
  useEffect(() => {
    fetchUserClubs();
  }, [userId]);
  
  // Pull-to-refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserClubs();
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading clubs...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={clubs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <TouchableOpacity
                activeOpacity={0.5} 
            style={styles.clubItem}
            onPress={() => router.push(`/clubs/${item.id}`)}
          >
            <View style={styles.clubHeader}>
              <View style={styles.clubImageContainer}>
                {item.avatar_url ? (
                  <CachedImage 
                    path={item.avatar_url}
                    style={styles.clubImage}
                    fallback={
                      <View style={[styles.clubImage, styles.clubImagePlaceholder]}>
                        <Text style={styles.clubInitial}>
                          {item.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    }
                  />
                ) : (
                  <View style={[styles.clubImage, styles.clubImagePlaceholder]}>
                    <Text style={styles.clubInitial}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.clubInfo}>
                <Text style={styles.clubName}>{item.name}</Text>
                <Text style={styles.memberCount}>
                  {item.member_count} {item.member_count === 1 ? 'member' : 'members'}
                </Text>
                {item.role !== 'member' && (
                  <Text style={styles.roleTag}>{item.role}</Text>
                )}
              </View>
              
              {session?.user?.id !== userId ? (
                <TouchableOpacity
                activeOpacity={0.5} 
                  style={[styles.joinButton, item.joined && styles.joinedButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleClubMembership(item.id, item.joined);
                  }}
                >
                  <Text style={[
                    styles.joinButtonText, 
                    item.joined && styles.joinedButtonText
                  ]}>
                    {item.joined ? 'Joined' : 'Join'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            
            <Text style={styles.clubDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {userId === session?.user?.id 
                ? "You haven't joined any clubs yet" 
                : "This user hasn't joined any clubs yet"}
            </Text>
            {userId === session?.user?.id && (
              <TouchableOpacity
                activeOpacity={0.5} 
                style={styles.discoverButton}
                onPress={() => router.push('/clubs')}
              >
                <Text style={styles.discoverButtonText}>Discover Clubs</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

// Updated styles to include new elements
const styles = StyleSheet.create({
  // Existing styles...
  clubImageContainer: {
    width: 60,
    height: 60,
  },
  clubImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  clubImagePlaceholder: {
    backgroundColor: colors.secondaryAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clubInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.brand,
  },
  roleTag: {
    fontSize: 12,
    color: colors.brand,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  joinedButtonText: {
    color: colors.brand,
  },
  discoverButton: {
    backgroundColor: colors.brand,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 16,
  },
  discoverButtonText: {
    color: colors.primaryText,
    fontWeight: 'bold',
    fontSize: 14,
  }
});