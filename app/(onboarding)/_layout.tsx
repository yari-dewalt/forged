import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="username" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="weight-unit" />
      <Stack.Screen name="workout-experience" />
      <Stack.Screen name="referral-source" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
