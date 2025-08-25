import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '../../../../constants/colors';

export default function PrivacyPolicyScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            Last Updated: August 2, 2025
          </Text>
          
          <Text style={styles.paragraph}>
            Atlas ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Atlas fitness application (the "App"). Please read this Privacy Policy carefully.
          </Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          
          <Text style={styles.subsectionTitle}>1.1 Personal Information</Text>
          <Text style={styles.paragraph}>
            We may collect the following personal information that you voluntarily provide:
          </Text>
          <Text style={styles.bulletPoint}>• Name (optional)</Text>
          <Text style={styles.bulletPoint}>• Email address (required for account creation)</Text>
          <Text style={styles.bulletPoint}>• Date of birth (optional)</Text>
          <Text style={styles.bulletPoint}>• Profile information and preferences</Text>
          <Text style={styles.bulletPoint}>• Location data (optional, when implemented)</Text>
          <Text style={styles.bulletPoint}>• Contact information (optional, when implemented)</Text>

          <Text style={styles.subsectionTitle}>1.2 Health and Fitness Data</Text>
          <Text style={styles.paragraph}>
            With your explicit consent, we may collect:
          </Text>
          <Text style={styles.bulletPoint}>• Workout data and exercise logs</Text>
          <Text style={styles.bulletPoint}>• Health data from connected devices and smartwatches (when implemented)</Text>
          <Text style={styles.bulletPoint}>• Fitness metrics and progress information</Text>

          <Text style={styles.subsectionTitle}>1.3 Device Information</Text>
          <Text style={styles.paragraph}>
            We automatically collect certain device information, including:
          </Text>
          <Text style={styles.bulletPoint}>• Device type, operating system, and version</Text>
          <Text style={styles.bulletPoint}>• IP address and general location information</Text>
          <Text style={styles.bulletPoint}>• App usage data and analytics</Text>
          <Text style={styles.bulletPoint}>• Crash reports and performance data</Text>

          <Text style={styles.subsectionTitle}>1.4 Media and Content</Text>
          <Text style={styles.paragraph}>
            When you choose to share content, we collect:
          </Text>
          <Text style={styles.bulletPoint}>• Photos and videos you upload or capture using the camera</Text>
          <Text style={styles.bulletPoint}>• Posts, comments, and other user-generated content</Text>
          <Text style={styles.bulletPoint}>• Workout routines and exercise data</Text>

          <Text style={styles.sectionTitle}>2. Device Permissions</Text>
          <Text style={styles.paragraph}>
            The App may request the following permissions:
          </Text>
          <Text style={styles.bulletPoint}>• Camera: To take photos and videos for posts</Text>
          <Text style={styles.bulletPoint}>• Photo Library: To select and upload media content</Text>
          <Text style={styles.bulletPoint}>• Location Services: To provide location-based features (optional)</Text>
          <Text style={styles.bulletPoint}>• Contacts: To help you connect with friends (optional, when implemented)</Text>
          <Text style={styles.bulletPoint}>• Health Data: To integrate with health and fitness apps (when implemented)</Text>

          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use collected information for the following purposes:
          </Text>
          <Text style={styles.bulletPoint}>• Provide, operate, and maintain the App</Text>
          <Text style={styles.bulletPoint}>• Create and manage your account</Text>
          <Text style={styles.bulletPoint}>• Process and display your workout data and posts</Text>
          <Text style={styles.bulletPoint}>• Connect you with other users and fitness communities</Text>
          <Text style={styles.bulletPoint}>• Send notifications and updates</Text>
          <Text style={styles.bulletPoint}>• Improve our services and develop new features</Text>
          <Text style={styles.bulletPoint}>• Ensure security and prevent fraud</Text>
          <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>

          <Text style={styles.sectionTitle}>4. Information Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With other users as part of the social features of the App</Text>
          <Text style={styles.bulletPoint}>• With service providers who assist in operating the App</Text>
          <Text style={styles.bulletPoint}>• When required by law or legal process</Text>
          <Text style={styles.bulletPoint}>• To protect the rights, property, or safety of Atlas, our users, or others</Text>
          <Text style={styles.bulletPoint}>• In connection with a business transaction (merger, acquisition, etc.)</Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
          </Text>

          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
          </Text>

          <Text style={styles.sectionTitle}>7. Your Rights and Choices</Text>
          <Text style={styles.paragraph}>
            Depending on your jurisdiction, you may have the following rights:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal information</Text>
          <Text style={styles.bulletPoint}>• Correct inaccurate or incomplete information</Text>
          <Text style={styles.bulletPoint}>• Delete your personal information</Text>
          <Text style={styles.bulletPoint}>• Restrict or object to processing</Text>
          <Text style={styles.bulletPoint}>• Data portability</Text>
          <Text style={styles.bulletPoint}>• Withdraw consent for optional data collection</Text>

          <Text style={styles.sectionTitle}>8. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            The App is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information promptly.
          </Text>

          <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
          </Text>

          <Text style={styles.sectionTitle}>10. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            The App may contain links to third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </Text>

          <Text style={styles.sectionTitle}>11. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy in the App and updating the "Last Updated" date. Your continued use of the App after changes constitutes acceptance of the updated policy.
          </Text>

          <Text style={styles.sectionTitle}>12. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </Text>
          <Text style={styles.paragraph}>
            Email: atlasfitbusiness@gmail.com
          </Text>
          <Text style={styles.paragraph}>
            We will respond to your inquiries within a reasonable timeframe.
          </Text>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginTop: 20,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.primaryText,
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.primaryText,
    marginBottom: 8,
    paddingLeft: 10,
  },
});
