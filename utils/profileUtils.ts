import { supabase } from '../lib/supabase';

export async function createProfileWithGoogleAvatar(user: any, googleUserInfo: any) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', fetchError);
      return { error: fetchError };
    }

    // If profile already exists, update it with Google avatar if it doesn't have one
    if (existingProfile) {
      if (!existingProfile.avatar_url && googleUserInfo?.photo) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: googleUserInfo.photo })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating profile with Google avatar:', updateError);
          return { error: updateError };
        }
      }
      return { data: existingProfile, error: null };
    }

    // Create new profile with Google information
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: googleUserInfo?.name || user.user_metadata?.full_name,
      avatar_url: googleUserInfo?.photo || user.user_metadata?.avatar_url,
      username: null, // Will be set during onboarding
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile with Google avatar:', insertError);
      return { error: insertError };
    }

    return { data: newProfile, error: null };
  } catch (error) {
    console.error('Unexpected error in createProfileWithGoogleAvatar:', error);
    return { error };
  }
}
