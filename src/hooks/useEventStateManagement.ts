import { useCallback } from 'react';
import { Event } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEventStateManagement = (
  events: Event[], 
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>
) => {
  const { toast } = useToast();

  const updateEventState = useCallback(async (eventId: string, newState: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      // Find the event to get its details for notification
      const eventToUpdate = events.find(event => event.id === eventId);
      
      const { error } = await supabase
        .from('events')
        .update({ 
          state: newState,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, state: newState, updated: new Date() }
          : event
      ));

      // Send status notification email for external events when moving from Pending to Approved/Rejected
      if (eventToUpdate && eventToUpdate.addedBy === 'External' && 
          (newState === 'Approved' || newState === 'Rejected')) {
        try {
          console.log('Sending status notification email for external event');
          const result = await supabase.functions.invoke('send-event-status-notification', {
            body: {
              eventId: eventId,
              eventName: eventToUpdate.name,
              email: eventToUpdate.addedByEmail,
              status: newState
            }
          });
          
          if (result.error) {
            console.error('Status notification email function error:', result.error);
          } else {
            console.log('Status notification email sent successfully');
          }
        } catch (emailError) {
          console.error('Failed to send status notification email:', emailError);
          // Don't fail the entire operation if email fails
        }
      }

      toast({
        title: "Success",
        description: `Event ${newState.toLowerCase()} successfully`,
      });

      return { data: null, error: null };
    } catch (error: any) {
      console.error('Error updating event state:', error);
      toast({
        title: "Error",
        description: "Failed to update event state",
        variant: "destructive",
      });
      return { data: null, error };
    }
  }, [events, setEvents, toast]);

  const updateEvent = useCallback(async (eventId: string, updatedEvent: Partial<Event>) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log('🔧 useEventStateManagement.updateEvent called:', {
      eventId,
      isMobile,
      updatedEventKeys: Object.keys(updatedEvent),
      userAgent: navigator.userAgent
    });

    try {
      // Transform the update data to match database schema
      const dbUpdateData: any = {};
      
      if (updatedEvent.name !== undefined) dbUpdateData.name = updatedEvent.name;
      if (updatedEvent.description !== undefined) dbUpdateData.description = updatedEvent.description;
      if (updatedEvent.category !== undefined) dbUpdateData.category = updatedEvent.category;
      if (updatedEvent.subcategory !== undefined) dbUpdateData.subcategory = updatedEvent.subcategory;
      if (updatedEvent.region !== undefined) dbUpdateData.region = updatedEvent.region;
      if (updatedEvent.subregion !== undefined) dbUpdateData.subregion = updatedEvent.subregion;
      if (updatedEvent.city !== undefined) dbUpdateData.city = updatedEvent.city;
      if (updatedEvent.address !== undefined) dbUpdateData.address = updatedEvent.address;
      if (updatedEvent.host !== undefined) dbUpdateData.host = updatedEvent.host;
      if (updatedEvent.link !== undefined) dbUpdateData.link = updatedEvent.link;
      if (updatedEvent.ticketLink !== undefined) dbUpdateData.ticket_link = updatedEvent.ticketLink;
      if (updatedEvent.image !== undefined) dbUpdateData.image = updatedEvent.image;
      if (updatedEvent.featured !== undefined) dbUpdateData.featured = updatedEvent.featured;
      if (updatedEvent.trustScore !== undefined) dbUpdateData.trust_score = updatedEvent.trustScore;
      if (updatedEvent.popularityScore !== undefined) dbUpdateData.popularity_score = updatedEvent.popularityScore;
      
      if (updatedEvent.dates !== undefined) {
        dbUpdateData.dates = updatedEvent.dates.map(date => ({
          date: date.date.toISOString(),
          startTime: date.startTime,
          endTime: date.endTime
        }));
      }
      
      if (updatedEvent.price !== undefined) {
        dbUpdateData.price_type = updatedEvent.price.type === 'Free' ? 'free' : 'cost';
        dbUpdateData.price_amount = updatedEvent.price.amount;
      }
      
      if (updatedEvent.state !== undefined) dbUpdateData.state = updatedEvent.state;

      dbUpdateData.updated_at = new Date().toISOString();

      console.log('🔧 Database update data prepared:', {
        eventId,
        dbUpdateData: { ...dbUpdateData, dates: dbUpdateData.dates ? `${dbUpdateData.dates.length} dates` : 'no dates' },
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      });

      const { error, data } = await supabase
        .from('events')
        .update(dbUpdateData)
        .eq('id', eventId)
        .select();

      console.log('🔧 Supabase update response:', {
        eventId,
        error,
        dataReturned: data ? `${data.length} records` : 'no data',
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      });

      if (error) {
        console.error('🔧 Supabase update error details:', error);
        throw error;
      }

      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, ...updatedEvent, updated: new Date() }
          : event
      ));

      console.log('🔧 Local state updated successfully');

      return { data: null, error: null };
    } catch (error: any) {
      console.error('🔧 Error in updateEvent:', error);
      return { data: null, error };
    }
  }, [setEvents]);

  return {
    updateEventState,
    updateEvent
  };
};