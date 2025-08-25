import { supabase } from '../lib/supabase';

/**
 * Get the public URL for an avatar image stored in Supabase Storage
 * @param path The path of the image in the 'avatars' bucket
 * @returns The complete public URL of the image
 */
export function getAvatarUrl(path: string | null): string | null {
  if (!path) return null;
  
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);
    
  return data.publicUrl;
}