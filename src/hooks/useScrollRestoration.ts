import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollPosition {
  x: number;
  y: number;
}

const SCROLL_RESTORATION_KEY = 'scroll-positions';

export const useScrollRestoration = () => {
  const location = useLocation();
  const restoreTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Save scroll position for current route
  const saveScrollPosition = () => {
    const scrollPositions = getStoredScrollPositions();
    scrollPositions[location.pathname + location.search] = {
      x: window.scrollX,
      y: window.scrollY
    };
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
  };

  // Get stored scroll positions
  const getStoredScrollPositions = (): Record<string, ScrollPosition> => {
    try {
      const stored = sessionStorage.getItem(SCROLL_RESTORATION_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  // Clear scroll position for current route
  const clearScrollPosition = () => {
    const scrollPositions = getStoredScrollPositions();
    delete scrollPositions[location.pathname + location.search];
    sessionStorage.setItem(SCROLL_RESTORATION_KEY, JSON.stringify(scrollPositions));
  };

  // Restore scroll position on mount/route change
  useLayoutEffect(() => {
    const key = location.pathname + location.search;
    const scrollPositions = getStoredScrollPositions();
    const savedPosition = scrollPositions[key];
    
    console.log('useScrollRestoration: Checking for saved position for', key);
    console.log('useScrollRestoration: Saved position:', savedPosition);
    console.log('useScrollRestoration: All stored positions:', scrollPositions);
    
    if (savedPosition) {
      // Clear timeout if component unmounts before restoration
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
      }
      
      // Use a series of checks to ensure content is ready
      let attempts = 0;
      const maxAttempts = 50; // Increased attempts
      
      const attemptRestore = () => {
        attempts++;
        
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxScrollY = documentHeight - windowHeight;
        
        console.log(`useScrollRestoration: Attempt ${attempts}/${maxAttempts}:`, {
          documentHeight,
          windowHeight,
          maxScrollY,
          targetY: savedPosition.y,
          currentScrollY: window.scrollY
        });
        
        // Check if content is loaded and target position is reachable
        if (savedPosition.y <= maxScrollY || attempts >= maxAttempts) {
          console.log('useScrollRestoration: Restoring scroll to:', savedPosition.y);
          
          // Force scroll immediately
          document.documentElement.scrollTop = savedPosition.y;
          document.body.scrollTop = savedPosition.y;
          window.scrollTo({
            top: savedPosition.y,
            left: savedPosition.x,
            behavior: 'instant'
          });
          
          console.log('useScrollRestoration: Scroll restored, actual position:', window.scrollY);
          
          // Clear the saved position after successful restoration
          clearScrollPosition();
        } else {
          // Content not ready, try again
          console.log('useScrollRestoration: Content not ready, retrying...');
          restoreTimeoutRef.current = setTimeout(attemptRestore, 50);
        }
      };
      
      // Start restoration immediately
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          attemptRestore();
        });
      });
    } else {
      console.log('useScrollRestoration: No saved position found for', key);
    }
    
    return () => {
      if (restoreTimeoutRef.current) {
        clearTimeout(restoreTimeoutRef.current);
      }
    };
  }, [location.pathname, location.search]);

  return {
    saveScrollPosition,
    clearScrollPosition
  };
};