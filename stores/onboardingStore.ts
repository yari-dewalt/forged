import { create } from 'zustand';

type OnboardingState = {
  isOnboardingComplete: boolean;
  isLoading: boolean;
  isInOnboardingFlow: boolean; // Track if user is actively going through onboarding
  
  // Actions
  setOnboardingComplete: (complete: boolean) => void;
  setInOnboardingFlow: (inFlow: boolean) => void;
  checkOnboardingStatus: (profile: any) => void;
  markOnboardingComplete: () => void;
  resetOnboarding: () => void;
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  isOnboardingComplete: false,
  isLoading: true,
  isInOnboardingFlow: false,
  
  setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
  
  setInOnboardingFlow: (inFlow) => set({ isInOnboardingFlow: inFlow }),
  
  checkOnboardingStatus: (profile) => {
    set({ isLoading: true });
    
    try {
      // Simple check: if profile has onboarding_completed = true, they're done
      const isComplete = profile?.onboarding_completed === true;
      
      set({ 
        isOnboardingComplete: isComplete,
        isInOnboardingFlow: !isComplete, // If not complete, they're in flow
        isLoading: false
      });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to incomplete on error
      set({ 
        isOnboardingComplete: false,
        isInOnboardingFlow: true,
        isLoading: false
      });
    }
  },
  
  markOnboardingComplete: () => {
    set({ 
      isOnboardingComplete: true,
      isInOnboardingFlow: false 
    });
  },
  
  resetOnboarding: () => {
    set({ 
      isOnboardingComplete: false,
      isInOnboardingFlow: true 
    });
  },
}));
