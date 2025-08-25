import React, { createContext, useContext, useRef, useCallback } from 'react';
import { ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface ScrollVisibilityContextType {
  registerScrollListener: (listener: (scrollY: number) => void) => () => void;
  getCurrentScrollY: () => number;
}

const ScrollVisibilityContext = createContext<ScrollVisibilityContextType | null>(null);

interface ScrollVisibilityProviderProps {
  children: React.ReactNode;
}

export const ScrollVisibilityProvider: React.FC<ScrollVisibilityProviderProps> = ({ children }) => {
  const scrollListeners = useRef<Set<(scrollY: number) => void>>(new Set());
  const currentScrollY = useRef(0);

  const registerScrollListener = useCallback((listener: (scrollY: number) => void) => {
    scrollListeners.current.add(listener);
    
    // Return unregister function
    return () => {
      scrollListeners.current.delete(listener);
    };
  }, []);

  const getCurrentScrollY = useCallback(() => {
    return currentScrollY.current;
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    currentScrollY.current = scrollY;
    
    // Notify all listeners
    scrollListeners.current.forEach(listener => {
      listener(scrollY);
    });
  }, []);

  const contextValue: ScrollVisibilityContextType = {
    registerScrollListener,
    getCurrentScrollY,
  };

  return (
    <ScrollVisibilityContext.Provider value={contextValue}>
      {React.isValidElement(children) && children.type === ScrollView
        ? React.cloneElement(children, {
            onScroll: handleScroll,
            scrollEventThrottle: 16,
          })
        : children}
    </ScrollVisibilityContext.Provider>
  );
};

export const useScrollVisibility = () => {
  const context = useContext(ScrollVisibilityContext);
  if (!context) {
    throw new Error('useScrollVisibility must be used within a ScrollVisibilityProvider');
  }
  return context;
};
