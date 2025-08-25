import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hasCompletedOnboarding } from '../utils/onboardingUtils';

type OnboardingState = {
  isOnboardingComplete: boolean;
  isLoading: boolean;
  isInOnboardingFlow: boolean; // Track if user is actively going through onboarding
  
  // Actions
  setOnboardingComplete: (complete: boolean) => void;
  setInOnboardingFlow: (inFlow: boolean) => void;
  checkOnboardingStatus: (profile: any) => Promise<void>;
  markOnboardingComplete: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
};

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isOnboardingComplete: false,
  isLoading: true,
  isInOnboardingFlow: false,
  
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
  
  setInOnboardingFlow: (inFlow) => set({ isInOnboardingFlow: inFlow }),
  
  checkOnboardingStatus: async (profile) => {
    set({ isLoading: true });
    
    try {
      // First check if user has completed required profile data
      const hasRequiredData = hasCompletedOnboarding(profile);
      console.warn(hasRequiredData);
      
      if (!hasRequiredData) {
        // If missing required data, onboarding is not complete
        set({ 
          isOnboardingComplete: false,
          isInOnboardingFlow: true, // Mark as in flow if they have incomplete data
        });
        await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      } else {
        // If has required data, check if they've seen the onboarding flow
        const storedStatus = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        const hasSeenOnboarding = storedStatus === 'true';
        
        if (!hasSeenOnboarding && hasRequiredData) {
          // They have the data but haven't seen onboarding - mark as complete
          // This handles users who already had accounts before onboarding was added
          await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
          set({ 
            isOnboardingComplete: true,
            isInOnboardingFlow: false 
          });
        } else {
          set({ 
            isOnboardingComplete: hasSeenOnboarding,
            isInOnboardingFlow: false 
          });
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to incomplete on error
      set({ 
        isOnboardingComplete: false,
        isInOnboardingFlow: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  markOnboardingComplete: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      set({ 
        isOnboardingComplete: true,
        isInOnboardingFlow: false 
      });
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  },
  
  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      set({ 
        isOnboardingComplete: false,
        isInOnboardingFlow: true 
      });
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  },
}));
