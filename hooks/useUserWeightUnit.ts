import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { getUserWeightUnit, WeightUnit } from '../utils/weightUtils';

/**
 * Hook to get the current user's preferred weight unit
 * @returns The user's preferred weight unit ('lbs' or 'kg')
 */
export function useUserWeightUnit(): WeightUnit {
  const { profile: authProfile } = useAuthStore();
  const { currentProfile } = useProfileStore();
  
  // Prefer authProfile (current user), fallback to currentProfile (viewed profile)
  const profile = authProfile || currentProfile;
  
  return getUserWeightUnit(profile);
}
