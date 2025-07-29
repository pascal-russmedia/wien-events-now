
import { useEventDataFetching } from './useEventDataFetching';
import { useEventPagination } from './useEventPagination';
import { useEventTabCounts } from './useEventTabCounts';
import { useEventStateManagement } from './useEventStateManagement';

export const useInternalEvents = () => {
  const { events, setEvents, loading, fetchEvents: fetchEventsData } = useEventDataFetching();
  const { pagination, updatePagination } = useEventPagination();
  const { tabCounts, fetchTabCounts } = useEventTabCounts();
  const { updateEventState, updateEvent } = useEventStateManagement(events, setEvents);

  const fetchEvents = async (page: number = 1, stateFilter?: string, showFutureEvents: boolean = true, searchQuery?: string) => {
    const { events: fetchedEvents, totalCount } = await fetchEventsData(page, stateFilter, showFutureEvents, searchQuery);
    updatePagination(page, totalCount, 100);
  };

  return {
    events,
    loading,
    pagination,
    tabCounts,
    fetchEvents,
    fetchTabCounts,
    updateEventState,
    updateEvent,
    refetch: (stateFilter?: string, showFutureEvents?: boolean, searchQuery?: string) => fetchEvents(pagination.page, stateFilter, showFutureEvents, searchQuery)
  };
};
