
import { Event } from '@/types/event';
import EventCard from './EventCard';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { TEXT } from '@/constants/text';

interface HorizontalEventSectionProps {
  title: string;
  events: Event[];
  showViewAll?: boolean;
  maxEvents?: number;
}

const HorizontalEventSection = ({ title, events, showViewAll = true, maxEvents = 10 }: HorizontalEventSectionProps) => {
  const navigate = useNavigate();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const displayEvents = events.slice(0, maxEvents);
  
  // Create a unique key for this section's scroll position
  const scrollKey = `horizontal-scroll-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const handleViewAll = () => {
    navigate('/search');
  };

  // Set up scroll position saving and restoration
  useEffect(() => {
    if (!scrollAreaRef.current) return;

    const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollContainer) return;

    // Restore scroll position
    const savedScrollPosition = sessionStorage.getItem(scrollKey);
    if (savedScrollPosition) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        scrollContainer.scrollLeft = parseInt(savedScrollPosition, 10);
      });
    }

    // Set up scroll listener to save position
    const handleScroll = () => {
      sessionStorage.setItem(scrollKey, scrollContainer.scrollLeft.toString());
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    
    // Cleanup function
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [scrollKey, displayEvents.length]); // Add displayEvents.length as dependency to re-run when events change

  return (
    <section className="py-12 bg-gray-50/50">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-[28px] md:text-4xl font-headline text-black mb-6 md:mb-8">
            {title}
          </h2>
        )}
        
        <ScrollArea ref={scrollAreaRef} className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 pb-4">
            {displayEvents.length > 0 ? (
              displayEvents.map((event) => (
                <div key={event.id} className="flex-none">
                  <EventCard event={event} />
                </div>
              ))
            ) : (
              <div className="flex-none">
                <div className="h-[340px] w-[266px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="font-greta-bold text-xl text-black mb-2">
                      No events today
                    </h3>
                    <p className="text-sm text-gray-600 font-greta">
                      Check back later for new events
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* View All Card */}
            {showViewAll && displayEvents.length > 0 && (
              <div className="flex-none">
                <div 
                  onClick={handleViewAll}
                  className="h-[340px] w-[266px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-volat-yellow transition-colors cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">👀</div>
                    <h3 className="font-greta-bold text-xl text-black mb-2">
                      {TEXT.HARDCODED_ENGLISH.viewAllEvents}
                    </h3>
                    <Button 
                      className="bg-black text-white hover:bg-gray-800 font-greta-bold mt-4 pointer-events-none"
                    >
                      {TEXT.HARDCODED_ENGLISH.viewAll}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="h-3" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default HorizontalEventSection;
