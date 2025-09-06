import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../constants/colors';
import { useAuthStore } from '../../../../stores/authStore';
import { supabase } from '../../../../lib/supabase';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { profile: authProfile, session, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [hideSuggestedUsers, setHideSuggestedUsers] = useState(false);
  const [hideSuggestionsForUser, setHideSuggestionsForUser] = useState(false);

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    if (!session?.user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_private, hide_from_suggestions, hide_suggestions_for_user')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;

      setPrivateProfile(data.is_private || false);
      setHideSuggestedUsers(data.hide_from_suggestions || false);
      setHideSuggestionsForUser(data.hide_suggestions_for_user || false);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      // Optionally show a toast or subtle error indication
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySetting = async (field: string, value: boolean) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', session.user.id);

      if (error) throw error;

      // Update local profile state
      if (updateProfile && authProfile) {
        updateProfile({
          ...authProfile,
          [field]: value,
        });
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      // Optionally show a toast or subtle error indication
    }
  };

  const handlePrivateProfileToggle = (value: boolean) => {
    // Optimistically update the UI immediately
    setPrivateProfile(value);
    
    // Save to database in the background (fire and forget)
    updatePrivacySetting('is_private', value);
  };

  const handleHideSuggestedUsersToggle = (value: boolean) => {
    // Optimistically update the UI immediately
    setHideSuggestedUsers(value);
    
    // Save to database in the background (fire and forget)
    updatePrivacySetting('hide_from_suggestions', value);
  };

  const handleHideSuggestionsForUserToggle = (value: boolean) => {
    // Optimistically update the UI immediately
    setHideSuggestionsForUser(value);
    
    // Save to database in the background (fire and forget)
    updatePrivacySetting('hide_suggestions_for_user', value);
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.primaryText} />
              <View style={styles.settingTextContent}>
                <Text style={styles.settingText}>Private Profile</Text>
                <Text style={styles.settingDescription}>
                  Only people you approve can see your posts and profile details
                </Text>
              </View>
            </View>
            <Switch
              value={privateProfile}
              onValueChange={handlePrivateProfileToggle}
              trackColor={{ false: '#767577', true: colors.brand }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discovery</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="eye-off-outline" size={22} color={colors.primaryText} />
              <View style={styles.settingTextContent}>
                <Text style={styles.settingText}>Hide from Suggestions</Text>
                <Text style={styles.settingDescription}>
                  Don't show your profile in suggested users for others
                </Text>
              </View>
            </View>
            <Switch
              value={hideSuggestedUsers}
              onValueChange={handleHideSuggestedUsersToggle}
              trackColor={{ false: '#767577', true: colors.brand }}
              thumbColor={'#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingItem, styles.lastSettingItem]}>
            <View style={styles.settingTextContainer}>
              <Ionicons name="people-outline" size={22} color={colors.primaryText} />
              <View style={styles.settingTextContent}>
                <Text style={styles.settingText}>Hide Suggestions</Text>
                <Text style={styles.settingDescription}>
                  Don't show suggested people to follow in your feed
                </Text>
              </View>
            </View>
            <Switch
              value={hideSuggestionsForUser}
              onValueChange={handleHideSuggestionsForUserToggle}
              trackColor={{ false: '#767577', true: colors.brand }}
              thumbColor={'#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

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
  section: {
    marginBottom: 24,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.secondaryText,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteOverlayLight,
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: colors.primaryText,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 18,
  },
});
