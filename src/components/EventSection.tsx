
import { Event } from '@/types/event';
import EventCard from './EventCard';
import { TEXT } from '@/constants/text';

interface EventSectionProps {
  title: string;
  events: Event[];
  showAll?: boolean;
}

const EventSection = ({ title, events, showAll = false }: EventSectionProps) => {
  const displayEvents = showAll ? events : events.slice(0, 4);

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-headline text-black">
            {title}
          </h2>
          {!showAll && events.length > 4 && (
            <button className="text-volat-yellow-dark font-bold hover:underline">
              {TEXT.EVENTS.viewAll}
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event}
              className="animate-fade-in"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventSection;
