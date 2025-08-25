import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../../../constants/colors";
import { Ionicons } from "@expo/vector-icons";

export default function Clubs() {
  return (
    <View style={styles.container}>
      <View style={styles.comingSoonContainer}>
        <Ionicons name="people-outline" size={80} color={colors.secondaryText} />
        <Text style={styles.comingSoonTitle}>Clubs</Text>
        <Text style={styles.comingSoonSubtitle}>Coming Soon</Text>
        <Text style={styles.comingSoonDescription}>
          Join fitness clubs, share workouts with friends, and stay motivated together. 
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