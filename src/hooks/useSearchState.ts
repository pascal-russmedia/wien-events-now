import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Event } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DateFilter {
  type: 'single' | 'range';
  date?: Date;
  startDate?: Date;
  endDate?: Date;
}

interface SearchFilters {
  region: string;
  category?: string;
  subcategory?: string;
  dateFilter?: DateFilter;
}

interface SearchData {
  events: Event[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}

const SEARCH_STATE_KEY = 'search-state';

export const useSearchState = (filters: SearchFilters | null) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log('🔎 useSearchState called with filters:', {
    filters,
    isNull: filters === null
  });
  
  const [data, setData] = useState<SearchData>({
    events: [],
    totalCount: 0,
    hasMore: true,
    currentPage: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const isInitializedRef = useRef(false);
  const lastFiltersRef = useRef<string>('');
  const pageSize = 32;

  // Create filter key for caching (only if filters exist)
  const filterKey = useMemo(() => {
    if (filters === null) {
      return 'null-filters';
    }
    const dateKey = filters.dateFilter ? 
      (filters.dateFilter.type === 'single' ? filters.dateFilter.date?.toISOString() : 
       `${filters.dateFilter.startDate?.toISOString()}-${filters.dateFilter.endDate?.toISOString()}`) : 
      'all';
    const key = `search-${filters.region}-${filters.category || 'all'}-${filters.subcategory || 'all'}-${dateKey}`;
    console.log('🔎 useSearchState filterKey:', key);
    return key;
  }, [filters]);

  // Save search state to sessionStorage
  const saveSearchState = useCallback((searchData: SearchData) => {
    try {
      const stateToSave = {
        [filterKey]: searchData,
        timestamp: Date.now()
      };
      sessionStorage.setItem(SEARCH_STATE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save search state:', error);
    }
  }, [filterKey]);

  // Load search state from sessionStorage
  const loadSearchState = useCallback((): SearchData | null => {
    try {
      const saved = sessionStorage.getItem(SEARCH_STATE_KEY);
      if (!saved) return null;
      
      const parsedState = JSON.parse(saved);
      const searchData = parsedState[filterKey];
      
      // Check if data is not too old (5 minutes)
      if (searchData && (Date.now() - parsedState.timestamp) < 5 * 60 * 1000) {
        return searchData;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to load search state:', error);
      return null;
    }
  }, [filterKey]);

  // Fetch events from API
  const fetchEvents = useCallback(async (reset = false) => {
    // Don't fetch if filters are null
    if (!filters) {
      console.log('🔎 fetchEvents: filters are null, skipping API call');
      return;
    }

    try {
      console.log('🔎 fetchEvents called:', {
        reset,
        filters: {
          region: filters.region,
          category: filters.category,
          subcategory: filters.subcategory,
          dateFilter: filters.dateFilter
        }
      });

      const isInitialLoad = reset || data.currentPage === 0;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 0 : data.currentPage;
      const offset = page * pageSize;

      // Prepare date filter parameters
      let singleDateFilter = null;
      let startDateFilter = null;
      let endDateFilter = null;

      if (filters.dateFilter) {
        if (filters.dateFilter.type === 'single' && filters.dateFilter.date) {
          const year = filters.dateFilter.date.getFullYear();
          const month = String(filters.dateFilter.date.getMonth() + 1).padStart(2, '0');
          const day = String(filters.dateFilter.date.getDate()).padStart(2, '0');
          singleDateFilter = `${year}-${month}-${day}`;
        } else if (filters.dateFilter.type === 'range' && filters.dateFilter.startDate && filters.dateFilter.endDate) {
          const startYear = filters.dateFilter.startDate.getFullYear();
          const startMonth = String(filters.dateFilter.startDate.getMonth() + 1).padStart(2, '0');
          const startDay = String(filters.dateFilter.startDate.getDate()).padStart(2, '0');
          startDateFilter = `${startYear}-${startMonth}-${startDay}`;
          
          const endYear = filters.dateFilter.endDate.getFullYear();
          const endMonth = String(filters.dateFilter.endDate.getMonth() + 1).padStart(2, '0');
          const endDay = String(filters.dateFilter.endDate.getDate()).padStart(2, '0');
          endDateFilter = `${endYear}-${endMonth}-${endDay}`;
        }
      }

      console.log('🔎 Making API call with:', {
        region_filter: filters.region || 'Vorarlberg',
        category_filter: filters.category || null,
        subcategory_filter: filters.subcategory || null,
        single_date_filter: singleDateFilter,
        start_date_filter: startDateFilter,
        end_date_filter: endDateFilter,
        limit_count: pageSize,
        offset_count: offset
      });

      const { data: apiData, error } = await supabase.rpc('get_expanded_future_events', {
        region_filter: filters.region || 'Vorarlberg',
        category_filter: filters.category || null,
        subcategory_filter: filters.subcategory || null,
        single_date_filter: singleDateFilter,
        start_date_filter: startDateFilter,
        end_date_filter: endDateFilter,
        limit_count: pageSize,
        offset_count: offset
      });

      if (error) throw error;

      const transformedEvents: Event[] = (apiData || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category as Event['category'],
        subcategory: item.subcategory || undefined,
        description: item.description,
        region: item.region,
        subregion: item.subregion,
        city: item.city,
        host: item.host,
        address: item.address,
        state: item.state as Event['state'],
        popularityScore: item.popularity_score,
        trustScore: item.trust_score,
        dates: [{
          date: new Date(item.event_date),
          startTime: item.start_time,
          endTime: item.end_time
        }],
        startTime: item.start_time,
        endTime: item.end_time,
        image: item.image,
        price: {
          type: item.price_type === 'free' ? 'Free' : 'Cost' as 'Free' | 'Cost',
          amount: item.price_amount || undefined
        },
        link: item.link,
        featured: item.featured,
        addedBy: item.added_by as Event['addedBy'],
        addedByEmail: item.added_by_email || '',
        created: new Date(item.created_at),
        updated: new Date(item.updated_at)
      }));

      const totalCount = apiData && apiData.length > 0 ? apiData[0].total_count : 0;

      const newData: SearchData = reset ? {
        events: transformedEvents,
        totalCount,
        hasMore: transformedEvents.length === pageSize,
        currentPage: 1
      } : {
        events: [...data.events, ...transformedEvents],
        totalCount,
        hasMore: transformedEvents.length === pageSize,
        currentPage: data.currentPage + 1
      };

      setData(newData);
      saveSearchState(newData);

    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters, data.currentPage, data.events, pageSize, toast, saveSearchState]);

  // Initialize data on filter change
  useEffect(() => {
    // Prevent duplicate calls for the same filter combination
    if (lastFiltersRef.current === filterKey) {
      return;
    }
    lastFiltersRef.current = filterKey;

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      
      // Try to load from cache first
      const cachedData = loadSearchState();
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
      } else {
        fetchEvents(true);
      }
    } else {
      // Filters changed, check cache for new filter combination
      const cachedData = loadSearchState();
      if (cachedData && cachedData.events.length > 0) {
        setData(cachedData);
        setLoading(false);
      } else {
        fetchEvents(true);
      }
    }
  }, [filterKey, loadSearchState, fetchEvents]);

  const loadMore = useCallback(() => {
    if (!loadingMore && data.hasMore) {
      fetchEvents();
    }
  }, [fetchEvents, loadingMore, data.hasMore]);

  const refetch = useCallback(() => {
    fetchEvents(true);
  }, [fetchEvents]);

  // Return early if filters are null (but after all hooks are called)
  if (filters === null) {
    console.log('🔎 useSearchState: filters are null, returning default state');
    return {
      events: [],
      totalCount: 0,
      loading: true,
      loadingMore: false,
      hasMore: false,
      loadMore: () => {},
      refetch: () => {}
    };
  }

  return {
    events: data.events,
    totalCount: data.totalCount,
    loading,
    loadingMore,
    hasMore: data.hasMore,
    loadMore,
    refetch
  };
};