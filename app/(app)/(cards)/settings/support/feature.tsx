import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, Linking, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../../constants/colors';

// Global variable to store the current handleSend function and state
let currentHandleSend: (() => void) | null = null;
let currentHasText: boolean = false;

export const getSendHandler = () => currentHandleSend;
export const getHasText = () => currentHasText;

export default function FeatureRequestScreen() {
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please describe the feature before sending.');
      return;
    }

    const subject = 'Feature Request - Atlas App';
    const body = message.trim();
    const emailUrl = `mailto:atlasfitbusiness@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(emailUrl);
      // Clear the message after opening email
      setMessage('');
      Alert.alert('Success', 'Your feature request has been opened in your email app.');
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert('Error', 'Unable to open email app. Please try again.');
    }
  };

  useEffect(() => {
    // Set the current handleSend function and text state when component mounts
    currentHandleSend = handleSend;
    currentHasText = message.trim().length > 0;
    
    // Clear it when component unmounts
    return () => {
      currentHandleSend = null;
      currentHasText = false;
    };
  }, [message]); // Include message in dependency array so it updates when message changes

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false
        }} 
      />
      
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Describe your feature idea..."
                placeholderTextColor={colors.secondaryText}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                autoFocus
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primaryText,
    paddingTop: 0,
    paddingHorizontal: 0,
  },
});
