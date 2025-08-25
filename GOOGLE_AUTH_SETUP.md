# Google Authentication Setup Guide

This guide will help you set up Google authentication for your Atlas app.

## Prerequisites

1. Google Cloud Console account
2. Supabase project with authentication enabled

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google+ API
   - Google Sign-In API

## Step 2: Create OAuth 2.0 Credentials

1. Navigate to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Create the following client IDs:

### Web Application Client ID
- Application type: Web application
- Name: "Atlas Web Client"
- Authorized redirect URIs: Add your Supabase redirect URL
  - Format: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

### Android Client ID (if building for Android)
- Application type: Android
- Package name: Your app's package name (from app.json)
- SHA-1 certificate fingerprint: Get from your development keystore

### iOS Client ID (if building for iOS)
- Application type: iOS
- Bundle ID: Your app's bundle identifier (from app.json)

## Step 3: Configure Supabase

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Enable Google as a provider
4. Add your Web Client ID and Client Secret from Google Cloud Console

## Step 4: Update Configuration

1. Open `config/googleConfig.ts`
2. Replace the placeholder values with your actual client IDs:

```typescript
export const GOOGLE_CONFIG = {
  webClientId: 'your-actual-web-client-id.apps.googleusercontent.com',
  iosClientId: 'your-actual-ios-client-id.apps.googleusercontent.com', // Optional
};
```

## Step 5: Platform-Specific Setup

### Android
1. Add your development SHA-1 fingerprint to Google Console
2. For production, add your release keystore SHA-1

### iOS
1. Add your bundle ID to Google Console
2. Download the GoogleService-Info.plist file
3. Add it to your iOS project

## Step 6: Test Authentication

1. Run your app
2. Try signing up/in with Google
3. Check that the user's Google avatar is automatically set as their profile picture

## Features Implemented

- ✅ Google Sign-In for both signup and login
- ✅ Automatic profile creation with Google avatar
- ✅ Seamless integration with existing auth flow
- ✅ Error handling and user feedback

## Troubleshooting

**Common Issues:**
1. "Sign in failed" - Check your client IDs match exactly
2. "Developer error" - Ensure SHA-1 fingerprint is correct for Android
3. Profile not created - Check Supabase RLS policies allow profile creation
4. Avatar not set - Verify Google profile has a public photo

**Getting SHA-1 fingerprint:**
```bash
# For debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release keystore
keytool -list -v -keystore your-release-key.keystore -alias your-key-alias
```
