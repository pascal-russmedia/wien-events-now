
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Event, CreateEventData } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const { toast } = useToast();

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const fetchEvents = useCallback(async (forceRefresh = false) => {
    // Skip fetch if data is fresh (unless forced)
    const now = Date.now();
    if (!forceRefresh && events.length > 0 && (now - lastFetch) < CACHE_DURATION) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch only approved events from today and future - exclude added_by_email for security
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          id, name, category, subcategory, description, region, subregion, host, address, 
          state, popularity_score, trust_score, dates, image, price_type, 
          price_amount, link, featured, added_by, created_at, updated_at
        `)
        .eq('state', 'Approved')
        .gte('dates->0->>date', todayString)
        .order('dates->0->>date', { ascending: true });

      if (error) throw error;

      // Transform the data to match our Event interface
      const transformedEvents = data?.map(event => ({
        id: event.id,
        name: event.name,
        category: event.category as Event['category'],
        subcategory: event.subcategory || undefined,
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
        addedByEmail: '', // Hidden for security
        created: new Date(event.created_at),
        updated: new Date(event.updated_at)
      })) || [];

      setEvents(transformedEvents);
      setLastFetch(now);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [events.length, lastFetch, toast]);

  const addEvent = async (eventData: CreateEventData) => {
    try {
      console.log('Adding event with data:', eventData);
      
      // Helper function to normalize price amount
      const normalizePriceAmount = (amount: any): number | null => {
        if (!amount) return null;
        if (typeof amount === 'object' && 'value' in amount && amount.value === 'undefined') return null;
        if (typeof amount === 'number') return amount;
        return null;
      };
      
      // Transform the data to match the database schema (let DB generate ID)
      const dbData = {
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        subcategory: eventData.subcategory || null,
        region: eventData.region,
        subregion: eventData.subregion,
        address: eventData.address,
        host: eventData.host,
        dates: eventData.dates.map(date => ({
          date: date.date.toISOString().split('T')[0], // Store only date part (YYYY-MM-DD)
          startTime: date.startTime,
          endTime: date.endTime
        })),
        price_type: eventData.price.type === 'Free' ? 'free' : 'cost',
        price_amount: normalizePriceAmount(eventData.price.amount),
        image: eventData.image,
        link: eventData.link,
        state: eventData.state || 'Pending',
        added_by: eventData.addedBy,
        added_by_email: eventData.addedByEmail,
        trust_score: eventData.trustScore || null,
        popularity_score: eventData.popularityScore,
        featured: eventData.featured || false
      };

      console.log('Database data to insert:', dbData);

      // Insert and get the generated ID back
      const { data: insertedEvent, error } = await supabase
        .from('events')
        .insert([dbData])
        .select('id')
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Event inserted successfully with ID:', insertedEvent.id);

      // Send confirmation email for external submissions using the generated ID
      if (eventData.addedBy === 'External') {
        try {
          console.log('Sending confirmation email for external event');
          const result = await supabase.functions.invoke('send-event-confirmation', {
            body: {
              eventId: insertedEvent.id,
              eventName: eventData.name,
              email: eventData.addedByEmail
            }
          });
          
          if (result.error) {
            console.error('Email function error:', result.error);
          } else {
            console.log('Confirmation email sent successfully');
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the entire operation if email fails
        }
      }

      return { data: null, error: null };
    } catch (error: any) {
      console.error('Error adding event:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    events,
    loading,
    fetchEvents,
    addEvent,
    refetch: () => fetchEvents(true) // Force refresh on manual refetch
  }), [events, loading, fetchEvents, addEvent]);
};
