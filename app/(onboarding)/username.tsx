import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useOnboardingStore } from '../../stores/onboardingStore';

export default function Username() {
  const router = useRouter();
  const { session, fetchProfile } = useAuthStore();
  const { setInOnboardingFlow } = useOnboardingStore();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null);
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameToCheck.toLowerCase())
        .maybeSingle();

      if (error) throw error;
      
      setIsAvailable(!data); // Available if no existing user found
    } catch (error) {
      console.error('Error checking username:', error);
      setIsAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    // Only allow alphanumeric characters and underscores
    const cleanText = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(cleanText);
    
    // Check availability after a short delay
    if (cleanText !== text) return; // Don't check if we had to clean the input
    
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(cleanText);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleContinue = async () => {
    if (!username || username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long');
      return;
    }

    if (isAvailable !== true) {
      Alert.alert('Username Unavailable', 'Please choose a different username');
      return;
    }

    if (!session?.user) {
      Alert.alert('Error', 'No user session found');
      return;
    }

    setLoading(true);
    try {
      // Set that we're actively in the onboarding flow
      setInOnboardingFlow(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          username: username.toLowerCase(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      router.push('/(onboarding)/personal-info');
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', 'Failed to save username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValidUsername = username.length >= 3 && isAvailable === true;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={styles.progressSection}>
            <Text style={[styles.progressLabel, styles.activeLabel]}>Username</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} style={styles.chevron} />
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Personal Info</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} style={styles.chevron} />
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Get Started</Text>
          </View>
        </View>

        <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create your username</Text>
          <Text style={styles.subtitle}>
            This is how other users will find and identify you
          </Text>
        </View>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.atSymbol}>@</Text>
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="your_username"
              placeholderTextColor={colors.secondaryText}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={30}
            />
            {!checking && isAvailable === true && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" style={styles.statusIcon} />
            )}
            {!checking && isAvailable === false && (
              <Ionicons name="close-circle" size={20} color="#F44336" style={styles.statusIcon} />
            )}
          </View>
          
          {/* Status Messages */}
          {username.length > 0 && username.length < 3 && (
            <Text style={styles.errorText}>Username must be at least 3 characters</Text>
          )}
          {isAvailable === false && (
            <Text style={styles.errorText}>Username is not available</Text>
          )}
          {isAvailable === true && (
            <Text style={styles.successText}>Username is available!</Text>
          )}
          
          <Text style={styles.helperText}>
            Use only letters, numbers, and underscores
          </Text>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
                activeOpacity={0.5} 
          style={[styles.continueButton, !isValidUsername && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={!isValidUsername || loading}
        >
            <>
              <Text style={[styles.continueButtonText, !isValidUsername && styles.continueButtonTextDisabled]}>
                Continue
              </Text>
            </>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  progressSection: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.brand,
    fontWeight: '500',
  },
  chevron: {
    marginHorizontal: 8,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 60,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryText,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryAccent,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.whiteOverlay,
    paddingHorizontal: 16,
    height: 52,
  },
  atSymbol: {
    fontSize: 16,
    color: colors.secondaryText,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primaryText,
    paddingVertical: 0,
  },
  statusIcon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.notification,
    marginTop: 8,
  },
  successText: {
    fontSize: 14,
    color: colors.success,
    marginTop: 8,
  },
  helperText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: colors.primaryAccent,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryText,
  },
  continueButtonTextDisabled: {
    color: colors.secondaryText,
  },
});
