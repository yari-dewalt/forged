import { create } from 'zustand';

type EditProfileState = {
  hasChanges: boolean;
  isValid: boolean;
  isLoading: boolean;
  handleSave: (() => void) | null;
  
  // Actions
  setEditProfileState: (state: {
    hasChanges: boolean;
    isValid: boolean;
    isLoading: boolean;
    handleSave: () => void;
  }) => void;
  resetEditProfileState: () => void;
};

export const useEditProfileStore = create<EditProfileState>((set) => ({
  hasChanges: false,
  isValid: true,
  isLoading: false,
  handleSave: null,
  
  setEditProfileState: (newState) => set(newState),
  
  resetEditProfileState: () => set({
    hasChanges: false,
    isValid: true,
    isLoading: false,
    handleSave: null
  })
}));
