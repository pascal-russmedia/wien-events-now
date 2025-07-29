
import { Event } from '@/types/event';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'react-router-dom';
import { TEXT } from '@/constants/text';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { EnhancedImage } from '@/components/ui/enhanced-image';
import { formatPriceDisplay } from '@/utils/priceFormatter';

interface SearchEventCardProps {
  event: Event;
  className?: string;
}

const SearchEventCard = ({ event, className = '' }: SearchEventCardProps) => {
  const location = useLocation();
  
  const formatDate = (date: Date) => {
    return format(date, 'EEEE, dd. MMM', { locale: de });
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const placeholderImage = "/lovable-uploads/91d8857e-2051-49a1-9704-f2fbfcddfd58.png";

  // Show city if available, otherwise subregion, otherwise main region
  const displayRegion = event.city || event.subregion || event.region;

  // Extract original event ID from composite ID (remove date suffix)
  const getOriginalEventId = (id: string) => {
    // Handle composite IDs with date suffix (format: uuid-date)
    if (id.length > 36 && id.includes('-')) {
      const uuidPart = id.substring(0, 36);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(uuidPart)) {
        return uuidPart;
      }
    }
    return id; // Return original if not a composite ID
  };

  const handleClick = () => {
    // Save scroll position when navigating to event detail using our scroll restoration system
    const scrollPositions = JSON.parse(sessionStorage.getItem('scroll-positions') || '{}');
    scrollPositions[location.pathname + location.search] = {
      x: window.scrollX,
      y: window.scrollY
    };
    sessionStorage.setItem('scroll-positions', JSON.stringify(scrollPositions));
    console.log('SearchEventCard: Saved scroll position:', window.scrollY, 'for', location.pathname + location.search);
  };

  return (
    <Link to={`/event/${getOriginalEventId(event.id)}`} className="block" onClick={handleClick}>
      <Card className={`group hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-[360px] w-full ${className}`}>
        <div className="relative">
          <EnhancedImage
            src={event.image || placeholderImage}
            alt={event.name}
            aspectRatio={16 / 9}
            className="group-hover:scale-105 transition-transform duration-300 rounded-t-lg rounded-b-none"
          />
          
          {event.featured && (
            <Badge className="absolute top-3 left-3 bg-volat-yellow text-black font-greta-bold z-10 hover:bg-volat-yellow hover:text-black px-3 py-1 text-sm">
              {TEXT.EVENTS.top}
            </Badge>
          )}
        </div>

        <CardContent className="p-3 flex-1 flex flex-col">
          <div className="space-y-2 flex-1">
            {/* Date and Time */}
            <div className="text-xs font-greta text-gray-600">
              {formatDate(event.dates[0].date)}
              {event.startTime && (
                <span className="ml-2 font-greta-bold">
                  {formatTime(event.startTime)}
                </span>
              )}
            </div>
            
            {/* Category and Subcategory */}
            <div className="flex items-center gap-2 text-sm min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Badge variant="secondary" className="text-xs flex-shrink-0 bg-background-warm text-warm-text hover:bg-background-warm hover:text-warm-text">
                  {event.category}
                </Badge>
                {event.subcategory && (
                  <Badge variant="outline" className="text-xs text-warm-text truncate min-w-0 max-w-[200px] border-warm-text/30">
                    {event.subcategory}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Title with line breaks */}
            <h3 className="font-greta-bold text-lg text-black transition-colors leading-tight">
              <div className="font-bold line-clamp-2">
                {event.name}
              </div>
            </h3>
          </div>
          
          {/* Price and Region */}
          <div className="flex items-center justify-between pt-2 mt-auto border-t border-gray-100">
            <div className="text-sm text-black">
              {event.price.type === 'Free' ? (
                <span>{TEXT.EVENTS.free}</span>
              ) : (
                <span>{formatPriceDisplay(event.price.amount)}</span>
              )}
            </div>
            
            <div className="text-sm text-gray-500 font-greta truncate max-w-[180px]">
              {displayRegion}{event.host && ` • ${event.host}`}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default SearchEventCard;
