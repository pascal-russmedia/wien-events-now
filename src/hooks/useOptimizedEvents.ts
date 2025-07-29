import { useMemo } from 'react';
import { Event } from '@/types/event';
import { useEvents } from './useEvents';
import { startOfDay, isAfter } from 'date-fns';

interface UseOptimizedEventsProps {
  region: string;
  category?: string;
  dateFilter?: {
    type: 'single' | 'range';
    date?: Date;
    startDate?: Date;
    endDate?: Date;
  };
}

export const useOptimizedEvents = ({ region, category, dateFilter }: UseOptimizedEventsProps) => {
  const { events, loading } = useEvents();

  const optimizedEvents = useMemo(() => {
    if (loading) return [];
    
    const today = startOfDay(new Date());
    
    // Pre-filter events by region and state for better performance
    const baseFilteredEvents = events.filter(event => {
      // State filter
      if (event.state !== 'Approved') return false;
      
      // Region filter
      if (event.region !== region && event.subregion !== region) return false;
      
      // Category filter
      if (category && event.category !== category) return false;
      
      return true;
    });

    // Create event instances for each future date
    const eventInstances: Event[] = [];
    
    for (const event of baseFilteredEvents) {
      for (const dateItem of event.dates) {
        const eventDate = startOfDay(new Date(dateItem.date));
        
        // Skip past events
        if (!isAfter(eventDate, today) && eventDate.getTime() !== today.getTime()) continue;
        
        // Apply date filter if provided
        if (dateFilter) {
          if (dateFilter.type === 'single' && dateFilter.date) {
            const targetDate = startOfDay(dateFilter.date);
            if (eventDate.getTime() !== targetDate.getTime()) continue;
          } else if (dateFilter.type === 'range' && dateFilter.startDate && dateFilter.endDate) {
            const startDate = startOfDay(dateFilter.startDate);
            const endDate = startOfDay(dateFilter.endDate);
            if (eventDate < startDate || eventDate > endDate) continue;
          }
        }
        
        eventInstances.push({
          ...event,
          dates: [dateItem],
          id: `${event.id}-${dateItem.date.toISOString()}`
        });
      }
    }
    
    // Sort by date (earliest first), then by popularity score (highest first)
    return eventInstances.sort((a, b) => {
      const dateA = new Date(a.dates[0].date).getTime();
      const dateB = new Date(b.dates[0].date).getTime();
      
      // First sort by date
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      
      // If dates are the same, sort by popularity score (descending)
      const popularityA = a.popularityScore || 0;
      const popularityB = b.popularityScore || 0;
      return popularityB - popularityA;
    });
  }, [events, loading, region, category, dateFilter]);

  return {
    events: optimizedEvents,
    loading
  };
};