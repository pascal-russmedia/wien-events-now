import { useState, useMemo } from 'react';
import { Event } from '@/types/event';

export const useEventFilters = (events: Event[]) => {
  const [showFutureEvents, setShowFutureEvents] = useState(true);
  const [addedByFilter, setAddedByFilter] = useState<'all' | 'Internal' | 'External'>('all');

  // Helper function to check if an event has future dates (including today)
  const hasUpcomingDates = (eventDates: Event['dates']) => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return eventDates.some(eventDate => {
      const eventDateStart = new Date(eventDate.date);
      const eventDateStartOfDay = new Date(eventDateStart.getFullYear(), eventDateStart.getMonth(), eventDateStart.getDate());
      return eventDateStartOfDay >= todayStart;
    });
  };

  // Apply all filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Future/past filter
      const isFuture = hasUpcomingDates(event.dates);
      const passesTimeFilter = showFutureEvents ? isFuture : !isFuture;
      
      // Added by filter
      const passesAddedByFilter = addedByFilter === 'all' || event.addedBy === addedByFilter;
      
      return passesTimeFilter && passesAddedByFilter;
    });
  }, [events, showFutureEvents, addedByFilter]);

  // Filter events by state for tabs
  const getEventsByState = (state: string) => {
    if (state === 'all') return filteredEvents;
    return filteredEvents.filter(event => event.state === state);
  };

  return {
    showFutureEvents,
    setShowFutureEvents,
    addedByFilter,
    setAddedByFilter,
    filteredEvents,
    getEventsByState
  };
};