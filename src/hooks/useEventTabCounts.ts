import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TabCounts {
  pending: number;
  approved: number;
  rejected: number;
  all: number;
}

export const useEventTabCounts = () => {
  const [tabCounts, setTabCounts] = useState<TabCounts>({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0
  });

  const fetchTabCounts = useCallback(async (showFutureEvents: boolean = true) => {
    try {
      // Helper function to add date filter to query
      const addDateFilter = (query: any) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        
        if (showFutureEvents) {
          // For future events, we need to check if any date in the dates array is >= today
          return query.gte('dates->0->>date', todayStart);
        } else {
          // For past events, we need to check if all dates in the dates array are < today
          return query.lt('dates->0->>date', todayStart);
        }
      };

      // Create base queries
      let pendingQuery = supabase.from('events').select('*', { count: 'exact', head: true }).eq('state', 'Pending');
      let approvedQuery = supabase.from('events').select('*', { count: 'exact', head: true }).eq('state', 'Approved');
      let rejectedQuery = supabase.from('events').select('*', { count: 'exact', head: true }).eq('state', 'Rejected');
      let allQuery = supabase.from('events').select('*', { count: 'exact', head: true });

      // Apply date filters
      pendingQuery = addDateFilter(pendingQuery);
      approvedQuery = addDateFilter(approvedQuery);
      rejectedQuery = addDateFilter(rejectedQuery);
      allQuery = addDateFilter(allQuery);

      // Fetch counts for each state
      const [pendingResult, approvedResult, rejectedResult, allResult] = await Promise.all([
        pendingQuery,
        approvedQuery,
        rejectedQuery,
        allQuery
      ]);

      setTabCounts({
        pending: pendingResult.count || 0,
        approved: approvedResult.count || 0,
        rejected: rejectedResult.count || 0,
        all: allResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching tab counts:', error);
    }
  }, []);

  return {
    tabCounts,
    fetchTabCounts
  };
};