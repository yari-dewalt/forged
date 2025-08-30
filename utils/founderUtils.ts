// Founder user IDs for auto-following new users
export const FOUNDER_USER_IDS = [
  // Add the actual founder user IDs here
  // Example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  // These should be replaced with the actual Supabase user IDs of the founders
  '48501e5b-2e50-4187-b2cc-3b8ad20e1fa1', // Yari
  '6106f9a5-c78e-4d1d-85eb-b37a50f1ae6e', // Elijah
  '2f883a74-65f8-4890-81fe-0d2e4c1241a5', // Zoey
];

// Function to auto-follow all founders when a new user signs up
export async function autoFollowFounders(newUserId: string): Promise<void> {
  const { supabase } = await import('../lib/supabase');
  
  try {
    // Create follow relationships for all founders
    const followData = FOUNDER_USER_IDS.map(founderId => ({
      follower_id: newUserId,
      following_id: founderId,
      created_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('follows')
      .insert(followData);

    if (error) {
      console.error('Error auto-following founders:', error);
    } else {
      console.log(`Successfully auto-followed ${FOUNDER_USER_IDS.length} founders for user ${newUserId}`);
    }
  } catch (error) {
    console.error('Error in autoFollowFounders:', error);
  }
}
