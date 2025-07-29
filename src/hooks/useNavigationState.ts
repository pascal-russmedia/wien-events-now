import { useState, useEffect } from 'react';

type TabState = 'pending' | 'approved' | 'rejected' | 'all';

interface NavigationState {
  activeTab: TabState;
  currentPage: number;
  scrollPosition: number;
}

export const useNavigationState = (
  fetchEvents: (page: number, state?: string, showFutureEvents?: boolean) => void,
  fetchTabCounts: (showFutureEvents?: boolean) => void,
  loading: boolean
) => {
  const [activeTab, setActiveTab] = useState<TabState>('pending');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [pendingScrollPosition, setPendingScrollPosition] = useState<number | null>(null);

  // Save navigation state before leaving
  const saveNavigationState = (tab: TabState, page: number) => {
    const state: NavigationState = {
      activeTab: tab,
      currentPage: page,
      scrollPosition: window.scrollY
    };
    sessionStorage.setItem('internalManageState', JSON.stringify(state));
  };

  // Restore navigation state on return
  useEffect(() => {
    const restoreState = () => {
      const savedState = sessionStorage.getItem('internalManageState');
      if (savedState) {
        try {
          const { activeTab: savedTab, currentPage, scrollPosition } = JSON.parse(savedState);
          console.log('Restoring state:', { savedTab, currentPage, scrollPosition });
          
          // Mark as restoring to prevent duplicate fetches
          setIsRestoring(true);
          
          // Set the active tab first
          setActiveTab(savedTab);
          
          // Fetch the saved page and tab with future events (default)
          fetchEvents(currentPage, savedTab === 'all' ? undefined : savedTab, true);
          
          // Store the scroll position to restore after loading completes
          setPendingScrollPosition(scrollPosition);
          
          // Mark restoration complete after a brief delay
          setTimeout(() => setIsRestoring(false), 100);
        } catch (error) {
          console.error('Error restoring navigation state:', error);
          // Fallback to default behavior only if there's an error
          setActiveTab('pending');
          fetchEvents(1, 'pending', true);
        }
      } else {
        // No saved state - default to pending on initial load only
        fetchEvents(1, 'pending', true);
      }
      setIsInitialized(true);
    };

    if (!isInitialized) {
      restoreState();
      fetchTabCounts(true); // Initialize with future events
    }
  }, [fetchEvents, fetchTabCounts, isInitialized]);

  // Handle scroll restoration when loading completes
  useEffect(() => {
    if (!loading && pendingScrollPosition !== null && isInitialized) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          console.log('Restoring scroll to:', pendingScrollPosition);
          window.scrollTo({
            top: pendingScrollPosition,
            behavior: 'auto'
          });
          
          // Clear the pending scroll position and session storage
          setPendingScrollPosition(null);
          sessionStorage.removeItem('internalManageState');
        });
      });
    }
  }, [loading, pendingScrollPosition, isInitialized]);

  return {
    activeTab,
    setActiveTab,
    isInitialized,
    isRestoring,
    saveNavigationState
  };
};