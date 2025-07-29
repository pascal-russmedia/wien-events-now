import { supabase } from '@/integrations/supabase/client';
import { EventStateData } from '@/types/internalEvents';

export class InternalEventsService {
  static async fetchEventsByState(
    showFutureEvents: boolean, 
    stateFilter: string = 'all', 
    page: number = 1
  ): Promise<EventStateData[]> {
    const functionName = showFutureEvents ? 'get_future_events_by_state' : 'get_past_events_by_state';
    
    console.log('Fetching events by state:', { showFutureEvents, stateFilter, page, functionName });
    
    const { data: result, error } = await supabase.rpc(functionName, {
      state_filter: stateFilter,
      page_number: page,
      page_size: 100
    });

    console.log('Supabase query result:', { result, error, functionName });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Raw events data:', result);
    console.log('Number of events fetched:', result?.length || 0);

    return result || [];
  }
}