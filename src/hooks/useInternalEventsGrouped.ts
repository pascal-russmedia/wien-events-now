import { useState, useCallback } from 'react';
import { Event as CustomEvent } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { useEventStateManagement } from './useEventStateManagement';
import { GroupedEventsData } from '@/types/internalEvents';
import { InternalEventsService } from '@/services/internalEventsService';
import { transformEventData } from '@/utils/eventTransformers';

export const useInternalEventsGrouped = () => {
  const [data, setData] = useState<GroupedEventsData>({
    futureEvents: [],
    pastEvents: [],
    counts: {
      future: { pending: 0, approved: 0, rejected: 0, total: 0 },
      past: { pending: 0, approved: 0, rejected: 0, total: 0 }
    },
    pagination: {
      page: 1,
      totalPages: 1,
      totalCount: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Get all events for state management
  const allEvents = [...data.futureEvents, ...data.pastEvents];
  const setAllEvents = useCallback((events: CustomEvent[]) => {
    // Group events by future/past when setting
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureEvents = events.filter(event => 
      event.dates.some(eventDate => {
        const dateOnly = new Date(typeof eventDate.date === 'string' ? eventDate.date : eventDate.date);
        dateOnly.setHours(0, 0, 0, 0);
        return dateOnly >= today;
      })
    );

    const pastEvents = events.filter(event => 
      !event.dates.some(eventDate => {
        const dateOnly = new Date(typeof eventDate.date === 'string' ? eventDate.date : eventDate.date);
        dateOnly.setHours(0, 0, 0, 0);
        return dateOnly >= today;
      })
    );

    setData(prev => ({
      ...prev,
      futureEvents,
      pastEvents
    }));
  }, []);

  const { updateEventState, updateEvent } = useEventStateManagement(allEvents, setAllEvents);

  const fetchEvents = useCallback(async (showFutureEvents: boolean = true, activeTab: string = 'all', page: number = 1) => {
    try {
      setLoading(true);
      
      const result = await InternalEventsService.fetchEventsByState(showFutureEvents, activeTab, page);

      if (!result || result.length === 0) {
        setData({
          futureEvents: [],
          pastEvents: [],
          counts: {
            future: { pending: 0, approved: 0, rejected: 0, total: 0 },
            past: { pending: 0, approved: 0, rejected: 0, total: 0 }
          },
          pagination: {
            page: 1,
            totalPages: 1,
            totalCount: 0
          }
        });
        return;
      }

      // Filter out null events (when no events match the state but we have count info)
      const validEvents = result.filter(event => event.id !== null);
      
      // Transform the data
      const transformedEvents = validEvents.map(transformEventData);

      // Get counts from the first result row (they're the same for all rows)
      const firstResult = result[0];
      const counts = {
        future: showFutureEvents ? {
          pending: Number(firstResult.pending_count || 0),
          approved: Number(firstResult.approved_count || 0),
          rejected: Number(firstResult.rejected_count || 0),
          total: Number(firstResult.total_count || 0)
        } : { pending: 0, approved: 0, rejected: 0, total: 0 },
        past: !showFutureEvents ? {
          pending: Number(firstResult.pending_count || 0),
          approved: Number(firstResult.approved_count || 0),
          rejected: Number(firstResult.rejected_count || 0),
          total: Number(firstResult.total_count || 0)
        } : { pending: 0, approved: 0, rejected: 0, total: 0 }
      };

      // Calculate pagination info for current state
      const currentStateTotal = Number(firstResult.current_state_total || 0);
      const currentStatePages = Number(firstResult.current_state_pages || 1);
      
      console.log('Transformed events:', { transformedEvents, counts, currentStateTotal, currentStatePages });
      
      setData({
        futureEvents: showFutureEvents ? transformedEvents : [],
        pastEvents: !showFutureEvents ? transformedEvents : [],
        counts,
        pagination: {
          page,
          totalPages: currentStatePages,
          totalCount: currentStateTotal
        }
      });
      
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    data,
    loading,
    fetchEvents,
    updateEventState,
    updateEvent,
    refetch: (showFutureEvents: boolean = true, activeTab: string = 'all', page: number = 1) => fetchEvents(showFutureEvents, activeTab, page)
  };
};