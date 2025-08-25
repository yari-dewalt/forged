import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity } from "react-native";
import { colors } from "../../../../constants/colors";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { Ionicons as IonIcon } from '@expo/vector-icons';
import { useAuthStore } from "../../../../stores/authStore";
import CachedAvatar from "../../../../components/CachedAvatar";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RecentSearches() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load recent searches
  const loadRecentSearches = async () => {
    try {
      setLoading(true);
      const storedSearches = await AsyncStorage.getItem(`recentSearches_${session?.user?.id}`);
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error("Error loading recent searches:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clear all recent searches
  const clearAllRecentSearches = useCallback(async () => {
    try {
      await AsyncStorage.setItem(`recentSearches_${session?.user?.id}`, JSON.stringify([]));
      // Set a flag to indicate that recent searches were updated
      await AsyncStorage.setItem(`recentSearchesUpdated_${session?.user?.id}`, Date.now().toString());
      setRecentSearches([]);
    } catch (error) {
      console.error("Error clearing recent searches:", error);
    }
  }, [session?.user?.id]);

  // Remove a single item from recent searches
  const removeFromRecentSearches = useCallback(async (itemToRemove) => {
    try {
      const updatedSearches = recentSearches.filter(search => 
        !(search.id === itemToRemove.id && search.type === itemToRemove.type)
      );
      
      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem(
        `recentSearches_${session?.user?.id}`,
        JSON.stringify(updatedSearches)
      );
      // Set a flag to indicate that recent searches were updated
      await AsyncStorage.setItem(`recentSearchesUpdated_${session?.user?.id}`, Date.now().toString());
    } catch (error) {
      console.error("Error removing recent search:", error);
    }
  }, [recentSearches, session?.user?.id]);

  // Handle clicking on a search result
  const handleSearchResultClick = (item) => {
    // Navigate to user profile
    if (item.type === 'user') {
      router.push(`/profile/${item.id}`);
    }
  };

  // Load searches when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      loadRecentSearches();
    }
  }, [session?.user?.id]);

  // Register the clear function globally for the navbar - update on every render
  useEffect(() => {
    (global as any).clearAllRecentSearches = clearAllRecentSearches;

    // Cleanup when component unmounts
    return () => {
      (global as any).clearAllRecentSearches = null;
    };
  }, [clearAllRecentSearches]); // Include the function in dependencies

  // Render a recent search item
  const renderRecentSearchItem = (item, index) => (
    <TouchableOpacity
      activeOpacity={0.5}
      key={`${item.id}-${index}`}
      style={styles.recentSearchItem}
      onPress={() => handleSearchResultClick(item)}
    >
      {item.avatar_url ? (
        <CachedAvatar 
          path={item.avatar_url}
          size={44}
          style={styles.profileImage}
        />
      ) : (
        <View style={styles.profileImage}>
          <Text style={styles.iconInitial}>{(item.name || "?").charAt(0)}</Text>
        </View>
      )}
      <View style={styles.searchResultInfo}>
        <Text style={styles.recentSearchUsername}>{item.username || item.name}</Text>
        <Text style={styles.recentSearchName}>
          {item.name} · {item.follower_count || 0} followers
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.5} 
        onPress={(e) => {
          e.stopPropagation();
          removeFromRecentSearches(item);
        }}
        style={styles.closeButton}
      >
        <IonIcon name="close" size={20} color={colors.secondaryText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : recentSearches.length > 0 ? (
          <View style={styles.searchesContainer}>
            {recentSearches.map(renderRecentSearchItem)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <IonIcon name="time-outline" size={64} color={colors.secondaryText} />
            <Text style={styles.emptyTitle}>No recent searches</Text>
            <Text style={styles.emptySubtitle}>
              Your recent searches will appear here
            </Text>
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
  scrollView: {
    flex: 1,
  },
  searchesContainer: {
    padding: 16,
  },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    gap: 12,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondaryText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInitial: {
    fontSize: 18,
    color: colors.primaryText,
    fontWeight: 'bold',
  },
  searchResultInfo: {
    flex: 1,
  },
  recentSearchUsername: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryText,
    marginBottom: 4,
  },
  recentSearchName: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  closeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    marginTop: 8,
    textAlign: 'center',
  },
});
