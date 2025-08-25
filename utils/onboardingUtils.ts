/**
 * Utility functions for onboarding management
 */

export const REQUIRED_ONBOARDING_FIELDS = ['username', 'weight_unit'] as const;

/**
 * Check if a user profile has all required onboarding data
 */
export const hasCompletedOnboarding = (profile: any): boolean => {
  if (!profile) return false;
  
  return REQUIRED_ONBOARDING_FIELDS.every(field => {
    const value = profile[field];
    return value !== null && value !== undefined && value !== '';
  });
};

/**
 * Get missing required fields from a profile
 */
export const getMissingOnboardingFields = (profile: any): string[] => {
  if (!profile) return [...REQUIRED_ONBOARDING_FIELDS];
  
  return REQUIRED_ONBOARDING_FIELDS.filter(field => {
    const value = profile[field];
    return value === null || value === undefined || value === '';
  });
};

/**
 * Check if onboarding should be shown based on profile and stored preference
 */
export const shouldShowOnboarding = (profile: any, hasSeenOnboarding: boolean): boolean => {
  // If they haven't completed the required fields, always show onboarding
  if (!hasCompletedOnboarding(profile)) {
    return true;
  }
  
  // If they have the required fields but haven't seen the onboarding flow,
  // we can skip it (for existing users who had accounts before onboarding was added)
  return false;
};
