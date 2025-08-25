import { Stack, useLocalSearchParams, useNavigation, usePathname, useRouter } from 'expo-router';
import { colors } from '../../../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pressable, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../stores/authStore';
import { useProfileStore } from '../../../../stores/profileStore';

export default function WorkoutLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: `Workout`,
          }}
        />
        <Stack.Screen
          name="explore"
          options={{
            title: `Explore`,
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});