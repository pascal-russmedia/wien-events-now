import { useState, useCallback } from 'react';
import { Event, REGIONS } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExportFilters {
  date: Date;
  region: string;
  category?: string;
  subcategory?: string;
}

export const useExportEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchEvents = useCallback(async (filters: ExportFilters) => {
    try {
      setLoading(true);
      
      // Use local date string to avoid timezone issues
      const year = filters.date.getFullYear();
      const month = String(filters.date.getMonth() + 1).padStart(2, '0');
      const day = String(filters.date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      console.log('Selected date:', filters.date, 'formatted as:', dateString);
      
      // Use the new database function for export search
      const { data, error } = await supabase.rpc('get_export_events', {
        search_date: dateString,
        region_filter: filters.region === 'all' ? null : filters.region,
        category_filter: filters.category === 'all' ? null : filters.category,
        subcategory_filter: filters.subcategory === 'all' ? null : filters.subcategory
      });

      if (error) throw error;

      // Transform the data to match Event interface
      const transformedEvents: Event[] = data?.map(event => ({
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
        popularityScore: event.popularity_score || 0,
        trustScore: event.trust_score,
        dates: Array.isArray(event.dates) ? event.dates.map((date: any) => ({
          date: new Date(date.date),
          startTime: date.startTime,
          endTime: date.endTime
        })) : [],
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
      })) || [];

      console.log('Final transformed events:', transformedEvents);
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error searching events:', error);
      toast({
        title: "Error",
        description: "Failed to search events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const exportToCSV = useCallback((events: Event[]) => {
    const headers = [
      'Name', 'Category', 'Subcategory', 'Region', 'Host', 'Address', 
      'Date', 'Start Time', 'End Time', 'Price Type', 'Price Amount',
      'Popularity Score', 'Link', 'Added By'
    ];

    const csvData = events.map(event => [
      event.name,
      event.category,
      event.subcategory || '',
      event.subregion || event.region,
      event.host || '',
      event.address || '',
      event.dates[0]?.date.toLocaleDateString() || '',
      event.dates[0]?.startTime || '',
      event.dates[0]?.endTime || '',
      event.price.type,
      event.price.amount || '',
      event.popularityScore || 0,
      event.link || '',
      event.addedBy
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `events_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Events exported to CSV successfully",
    });
  }, [toast]);

  return {
    events,
    loading,
    searchEvents,
    exportToCSV
  };
};