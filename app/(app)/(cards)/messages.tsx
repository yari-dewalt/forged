// app/(app)/(modals)/messages.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors } from '../../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.comingSoonContainer}>
        <Ionicons name="chatbubbles-outline" size={80} color={colors.secondaryText} />
        <Text style={styles.comingSoonTitle}>Messages</Text>
        <Text style={styles.comingSoonSubtitle}>Coming Soon</Text>
        <Text style={styles.comingSoonDescription}>
          Send direct messages, share workouts, and connect with other Atlas users. 
          This feature will be available in a future update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoonContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  comingSoonTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginTop: 20,
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 18,
    color: colors.brand,
    fontWeight: '600',
    marginBottom: 20,
  },
  comingSoonDescription: {
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
  },
});
