import { useState, useEffect, useMemo, useCallback } from 'react';
import { Event } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CachedData {
  events: Event[];
  region: string;
  timestamp: number;
}

const CACHE_KEY = 'home-page-events-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useHomePageEvents = (region: string = 'Vorarlberg') => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Helper functions for cache management
  const getCachedData = (): CachedData | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const data: CachedData = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }
      
      // Check if region matches
      if (data.region !== region) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error reading cache:', error);
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
  };

  const setCachedData = (events: Event[]) => {
    try {
      const cacheData: CachedData = {
        events,
        region,
        timestamp: Date.now()
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  const fetchEvents = useCallback(async (forceRefresh = false) => {
    // Try to use cached data first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        console.log('Using cached home page events for region:', region);
        setEvents(cachedData.events);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      console.log('Fetching fresh home page events for region:', region);
      
      const { data, error } = await supabase.rpc('get_home_page_events', {
        region_filter: region
      });

      if (error) throw error;

      // Transform the expanded data to match our Event interface
      const transformedEvents = data?.map(event => ({
        id: event.id,
        name: event.name,
        category: event.category as Event['category'],
        subcategory: event.subcategory || undefined,
        description: event.description,
        region: event.region,
        subregion: event.subregion,
        city: event.city,
        host: event.host,
        address: event.address,
        state: event.state as Event['state'],
        popularityScore: event.popularity_score,
        trustScore: 0, // Default value since not returned by function
        dates: [{
          date: new Date(event.event_date),
          startTime: event.start_time,
          endTime: event.end_time
        }],
        image: event.image,
        price: {
          type: event.price_type === 'free' ? 'Free' : 'Cost' as 'Free' | 'Cost',
          amount: event.price_amount || undefined
        },
        link: event.link,
        featured: event.featured,
        addedBy: 'External' as Event['addedBy'], // Default value since not returned by function
        addedByEmail: '', // Hidden for security
        created: new Date(event.created_at),
        updated: new Date(event.updated_at)
      })) || [];

      setEvents(transformedEvents);
      setCachedData(transformedEvents);
    } catch (error) {
      console.error('Error fetching home page events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [region, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    events,
    loading,
    refetch: () => fetchEvents(false),
    forceRefresh: () => fetchEvents(true)
  }), [events, loading, fetchEvents]);
};