import 'dotenv/config';

export default {
  expo: {
    name: "atlas",
    slug: "atlas",
    scheme: "atlas",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.atlasfitness.atlas",
      buildNumber: "16",
      supportsTablet: false,
      orientation: "portrait",
      infoPlist: {
        UIBackgroundModes: ["audio", "remote-notification", "fetch"],
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: ["VIBRATE", "WAKE_LOCK"],
      orientation: "portrait"
    },
    notification: {
      icon: "./assets/icon.png",
      color: "#ffffff",
      sounds: ["./assets/sounds/timer-complete.mp3"]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "7c929c51-fee3-4a00-afa9-7c90f95cd9e7"
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-screen-orientation",
        {
          initialOrientation: "PORTRAIT_UP"
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/icon.png",
          color: "#ffffff",
          sounds: ["./assets/sounds/timer-complete.mp3"]
        }
      ],
      [
        "expo-task-manager"
      ],
      [
        "expo-background-fetch"
      ]
    ]
  },
};
