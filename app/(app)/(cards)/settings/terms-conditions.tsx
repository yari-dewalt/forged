import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { colors } from '../../../../constants/colors';

export default function TermsAndConditionsScreen() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Terms and Conditions</Text>
          <Text style={styles.paragraph}>
            Last Updated: August 2, 2025
          </Text>
          
          <Text style={styles.paragraph}>
            Welcome to Atlas! These Terms and Conditions ("Terms") govern your use of the Atlas fitness application (the "App") operated by Atlas ("we," "us," or "our"). By accessing or using our App, you agree to be bound by these Terms.
          </Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By creating an account or using the App, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. Eligibility</Text>
          <Text style={styles.paragraph}>
            You must be at least 13 years old to use the App. If you are under 18, you must have permission from a parent or guardian. By using the App, you represent that you meet these age requirements.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            To access certain features, you must create an account. You are responsible for:
          </Text>
          <Text style={styles.bulletPoint}>• Providing accurate and complete information</Text>
          <Text style={styles.bulletPoint}>• Maintaining the security of your account credentials</Text>
          <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
          <Text style={styles.bulletPoint}>• Notifying us immediately of any unauthorized use</Text>

          <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree to use the App only for lawful purposes and in accordance with these Terms. You shall not:
          </Text>
          <Text style={styles.bulletPoint}>• Use the App for any illegal or unauthorized purpose</Text>
          <Text style={styles.bulletPoint}>• Post false, misleading, or harmful content</Text>
          <Text style={styles.bulletPoint}>• Harass, threaten, or harm other users</Text>
          <Text style={styles.bulletPoint}>• Violate any intellectual property rights</Text>
          <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>
          <Text style={styles.bulletPoint}>• Use automated systems to access the App</Text>
          <Text style={styles.bulletPoint}>• Share inappropriate or offensive content</Text>

          <Text style={styles.sectionTitle}>5. User Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of content you post to the App ("User Content"). By posting User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content within the App.
          </Text>
          <Text style={styles.paragraph}>
            You represent that you have all necessary rights to post your User Content and that it does not violate any third-party rights or these Terms.
          </Text>

          <Text style={styles.sectionTitle}>6. Health and Fitness Disclaimer</Text>
          <Text style={styles.paragraph}>
            The App provides fitness and health-related information for educational purposes only. This information is not intended as medical advice, diagnosis, or treatment. You should:
          </Text>
          <Text style={styles.bulletPoint}>• Consult with a healthcare professional before starting any fitness program</Text>
          <Text style={styles.bulletPoint}>• Use the App at your own risk</Text>
          <Text style={styles.bulletPoint}>• Stop exercising immediately if you experience pain or discomfort</Text>
          <Text style={styles.bulletPoint}>• Not rely solely on the App for health or fitness decisions</Text>

          <Text style={styles.sectionTitle}>7. Privacy and Data</Text>
          <Text style={styles.paragraph}>
            Your privacy is important to us. Our collection and use of your information is governed by our Privacy Policy, which forms part of these Terms. By using the App, you consent to the collection and use of your information as described in our Privacy Policy.
          </Text>

          <Text style={styles.sectionTitle}>8. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            The App and all its content, features, and functionality are owned by Atlas and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works based on our content without permission.
          </Text>

          <Text style={styles.sectionTitle}>9. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            The App may integrate with third-party services (such as health apps, social media platforms, or payment processors). We are not responsible for the content, privacy practices, or terms of these third-party services.
          </Text>

          <Text style={styles.sectionTitle}>10. Suspension and Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any other reason. Upon termination, your right to use the App will cease immediately.
          </Text>

          <Text style={styles.sectionTitle}>11. Disclaimers</Text>
          <Text style={styles.paragraph}>
            The App is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the App will be uninterrupted, error-free, or secure.
          </Text>

          <Text style={styles.sectionTitle}>12. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the fullest extent permitted by law, Atlas shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or related to your use of the App.
          </Text>

          <Text style={styles.sectionTitle}>13. Indemnification</Text>
          <Text style={styles.paragraph}>
            You agree to indemnify and hold harmless Atlas and its employees, directors, and agents from any claims, damages, or expenses arising out of your use of the App or violation of these Terms.
          </Text>

          <Text style={styles.sectionTitle}>14. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where Atlas is based, without regard to conflict of law principles.
          </Text>

          <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms in the App and updating the "Last Updated" date. Your continued use of the App after changes constitutes acceptance of the new Terms.
          </Text>

          <Text style={styles.sectionTitle}>16. Severability</Text>
          <Text style={styles.paragraph}>
            If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.
          </Text>

          <Text style={styles.sectionTitle}>17. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms, please contact us at:
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
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 15,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 22,
    marginBottom: 8,
    marginLeft: 15,
  },
});
