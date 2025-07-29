import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

export interface SimilarEvent {
  id: string;
  name: string;
  event_date: string;
  region: string;
  subregion: string | null;
  city: string;
  host: string | null;
  address: string | null;
  similarity_score: number;
}

export const useDuplicateDetection = (
  name: string,
  region: string,
  city: string
) => {
  const [similarEvents, setSimilarEvents] = useState<SimilarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldSearch, setShouldSearch] = useState(false);

  // Debounce the search trigger
  const debouncedName = useDebounce(name, 500);
  const debouncedRegion = useDebounce(region, 500);
  const debouncedCity = useDebounce(city, 500);

  // Check if all required fields are filled
  useEffect(() => {
    const allFieldsFilled = 
      debouncedName.trim() !== '' && 
      debouncedRegion.trim() !== '' && 
      debouncedCity.trim() !== '';
    
    setShouldSearch(allFieldsFilled);
  }, [debouncedName, debouncedRegion, debouncedCity]);

  // Perform the search when conditions are met
  useEffect(() => {
    if (!shouldSearch) {
      setSimilarEvents([]);
      return;
    }

    const searchSimilarEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('search_similar_events', {
          event_name: debouncedName,
          event_region: debouncedRegion,
          event_city: debouncedCity
        });

        if (error) {
          console.error('Error searching similar events:', error);
          setSimilarEvents([]);
        } else {
          setSimilarEvents(data || []);
        }
      } catch (error) {
        console.error('Error searching similar events:', error);
        setSimilarEvents([]);
      } finally {
        setLoading(false);
      }
    };

    searchSimilarEvents();
  }, [shouldSearch, debouncedName, debouncedRegion, debouncedCity]);

  return {
    similarEvents,
    loading,
    hasSimilarEvents: similarEvents.length > 0
  };
};