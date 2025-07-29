import { useState, useCallback } from 'react';
import { Event } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ITEMS_PER_PAGE = 100;

export const useEventDataFetching = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = useCallback(async (page: number = 1, stateFilter?: string, showFutureEvents: boolean = true, searchQuery?: string) => {
    try {
      setLoading(true);
      
      console.log('Fetching events from Supabase...', { page, stateFilter, searchQuery });
      
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE - 1;
      
      // Build the query - using simple approach for now 
      let query = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      // Apply date filter - simple approach checking first date
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
      
      if (showFutureEvents) {
        // For future events, include today and future dates (>= today)
        query = query.gte('dates->0->>date', todayStart);
      } else {
        // For past events, only dates before today (< today)
        query = query.lt('dates->0->>date', todayStart);
      }
      
      // Apply state filter if provided
      if (stateFilter && stateFilter !== 'all') {
        console.log('Applying state filter:', stateFilter);
        query = query.eq('state', stateFilter.charAt(0).toUpperCase() + stateFilter.slice(1));
      }
      
      // Apply search filter if provided
      if (searchQuery && searchQuery.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`);
      }
      
      // Apply pagination last
      query = query.range(startIndex, endIndex);

      const { data, error, count } = await query;

      console.log('Supabase query result:', { data, error, count });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw events data:', data);
      console.log('Number of events fetched:', data?.length || 0);

      // Transform the data and apply client-side filtering for multiple dates
      let transformedEvents = data?.map(event => {
        return {
          id: event.id,
          name: event.name,
          subcategory: event.subcategory || undefined,
          category: event.category as Event['category'],
          description: event.description,
          region: event.region,
          subregion: event.subregion,
          host: event.host,
          address: event.address,
          state: event.state as Event['state'],
          popularityScore: event.popularity_score,
          trustScore: event.trust_score,
          dates: Array.isArray(event.dates) ? event.dates.map((date: any) => ({
            date: new Date(date.date),
            startTime: date.startTime,
            endTime: date.endTime
          })) : [{ date: new Date(), startTime: '', endTime: '' }],
          image: event.image,
          price: {
            type: event.price_type === 'free' ? 'Free' : 'Cost' as 'Free' | 'Cost',
            amount: event.price_amount || undefined
          },
          link: event.link,
          featured: event.featured,
          addedBy: event.added_by as Event['addedBy'],
          addedByEmail: event.added_by_email,
          created: new Date(event.created_at),
          updated: new Date(event.updated_at)
        };
      }) || [];

      // Apply proper date filtering on client side for multiple dates
      const today_date = new Date();
      today_date.setHours(0, 0, 0, 0);
      
      transformedEvents = transformedEvents.filter(event => {
        const hasUpcomingDate = event.dates.some(eventDate => {
          const dateOnly = new Date(eventDate.date);
          dateOnly.setHours(0, 0, 0, 0);
          return dateOnly >= today_date;
        });
        
        return showFutureEvents ? hasUpcomingDate : !hasUpcomingDate;
      });

      console.log('Transformed and filtered events:', transformedEvents);
      setEvents(transformedEvents);
      
      return { events: transformedEvents, totalCount: count || 0 };
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Check console for details.",
        variant: "destructive",
      });
      return { events: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    events,
    setEvents,
    loading,
    fetchEvents
  };
};