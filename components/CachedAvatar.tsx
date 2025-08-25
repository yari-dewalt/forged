import { useState, useEffect } from "react";
import { StyleSheet, Image, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Ionicons as IonIcon } from '@expo/vector-icons';

interface Props {
  path: string | null;
  size?: number;
  style?: object;
  fallbackIconName?: string;
  fallbackIconColor?: string;
}

export default function CachedAvatar({ 
  path, 
  size = 26, 
  style = {}, 
  fallbackIconName = "person-circle",
  fallbackIconColor = "#888"
}: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const avatarSize = { height: size, width: size };

  useEffect(() => {
    let isMounted = true;
    
    if (path) {
      setLoading(true);
      downloadImage(path).then(url => {
        if (isMounted) {
          setAvatarUrl(url);
          setLoading(false);
        }
      });
    } else {
      setAvatarUrl(null);
    }
    
    return () => {
      isMounted = false;
    };
  }, [path]);

  async function downloadImage(path: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) {
        throw error;
      }

      return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.readAsDataURL(data);
        fr.onload = () => {
          resolve(fr.result as string);
        };
        fr.onerror = () => {
          reject(new Error("Failed to convert image to data URL"));
        };
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  }

  if (loading) {
    return (
      <View style={[avatarSize, styles.avatar, style]}>
        {/* You could add a loading indicator here */}
      </View>
    );
  }

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[avatarSize, styles.avatar, style]}
      />
    );
  }

  return (
      <Image
        source={{ uri: `https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg` }}
        style={[avatarSize, styles.avatar, style]}
      />
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    overflow: "hidden",
  },
});