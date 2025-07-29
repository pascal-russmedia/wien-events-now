import { useMemo } from 'react';
import { useHomePageEvents } from '@/hooks/useHomePageEvents';
import { LoadingScreen } from '@/components/ui/loading-screen';
import EventCard from '@/components/EventCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { TEXT } from '@/constants/text';
import { SEO } from '@/components/SEO';

const EmbedHighlightsToday = () => {
  // Get current region from URL params or default to Vorarlberg
  const urlParams = new URLSearchParams(window.location.search);
  const region = urlParams.get('region') || 'Vorarlberg';
  
  const { events, loading } = useHomePageEvents(region);

  // Filter events for highlights of the day (today's events)
  const highlightsOfDay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventDate = new Date(event.dates[0].date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-[200px] bg-white">
        <LoadingScreen 
          message={TEXT.LOADING.events} 
          variant="spinner"
          size="sm"
          className="py-8"
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50/50 p-4">
      <SEO 
        title="Event Widget | Wohin"
        description="Eingebettete Event Widget"
        noIndex={true}
      />
      <div className="max-w-full">
        <h2 className="text-xl md:text-2xl font-headline text-black mb-4">
          Highlights des Tages
        </h2>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 pb-4">
            {highlightsOfDay.length > 0 ? (
              highlightsOfDay.map((event) => (
                <div key={event.id} className="flex-none">
                  <div className="transform scale-90 origin-top-left">
                    <EventCard event={event} />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-none">
                <div className="h-[300px] w-[240px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-3xl mb-3">📅</div>
                    <h3 className="font-greta-bold text-lg text-black mb-2">
                      No events today
                    </h3>
                    <p className="text-sm text-gray-600 font-greta">
                      Check back later for new events
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default EmbedHighlightsToday;