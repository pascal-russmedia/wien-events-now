import { useMemo, useState, useEffect, useRef } from 'react';
import { Event, CATEGORIES } from '@/types/event';
import EventCard from './EventCard';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Calendar, Edit, Music, Users, Zap, Palette, ArrowRight, CalendarDays } from 'lucide-react';
import { TEXT } from '@/constants/text';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
interface AllEventsSectionProps {
  events: Event[];
  currentRegion: string;
  maxEvents?: number;
}
const AllEventsSection = ({
  events,
  currentRegion,
  maxEvents = 12
}: AllEventsSectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Create a unique key for this section's scroll position
  const scrollKey = 'horizontal-scroll-all-events';

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
  }, [scrollKey, events.length]); // Add events.length as dependency to re-run when events change

  const getPreviousSaturday = (date: Date) => {
    const saturday = new Date(date);
    saturday.setDate(date.getDate() - 1); // Yesterday for Sunday
    return saturday;
  };

  const getWeekendDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (dayOfWeek === 0) {
      // Sunday - show current weekend (yesterday Saturday to today Sunday)
      return {
        start: getPreviousSaturday(today),
        end: today
      };
    } else if (dayOfWeek >= 5) {
      // Friday (5) or Saturday (6) - show current weekend (today to next Sunday)
      return {
        start: today,
        end: getNextSunday(today)
      };
    } else {
      // Monday-Thursday - show upcoming weekend (next Friday to next Sunday)
      return {
        start: getNextFriday(today),
        end: getNextSunday(today)
      };
    }
  };
  const getNextFriday = (date: Date) => {
    const friday = new Date(date);
    const daysUntilFriday = (5 - date.getDay() + 7) % 7;
    friday.setDate(date.getDate() + daysUntilFriday);
    return friday;
  };
  const getNextSunday = (date: Date) => {
    const sunday = new Date(date);
    const daysUntilSunday = (7 - date.getDay()) % 7;
    if (daysUntilSunday === 0 && date.getDay() !== 0) {
      sunday.setDate(date.getDate() + 7);
    } else {
      sunday.setDate(date.getDate() + daysUntilSunday);
    }
    return sunday;
  };
  const handleFilterClick = (filterType: 'date' | 'category', filterValue: string) => {
    const urlParams = new URLSearchParams();
    if (filterType === 'date') {
      urlParams.set('date', filterValue);
    } else if (filterType === 'category') {
      urlParams.set('category', filterValue);
    }
    navigate(`/search?${urlParams.toString()}`);
  };
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
  };
  const handleConfirmDateSelection = () => {
    if (dateRange?.from) {
      const urlParams = new URLSearchParams();
      urlParams.set('startDate', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) {
        urlParams.set('endDate', format(dateRange.to, 'yyyy-MM-dd'));
      } else {
        // If only one date is selected, use it as selectedDate
        urlParams.set('selectedDate', format(dateRange.from, 'yyyy-MM-dd'));
      }
      setIsCalendarOpen(false);
      navigate(`/search?${urlParams.toString()}`);
    }
  };
  const handleQuickSelection = (type: 'today' | 'tomorrow' | 'weekend') => {
    const urlParams = new URLSearchParams();
    const today = new Date();
    if (type === 'today') {
      urlParams.set('selectedDate', format(today, 'yyyy-MM-dd'));
    } else if (type === 'tomorrow') {
      const tomorrow = addDays(today, 1);
      urlParams.set('selectedDate', format(tomorrow, 'yyyy-MM-dd'));
    } else if (type === 'weekend') {
      // If it's Sunday, use today as single date filter
      if (today.getDay() === 0) {
        urlParams.set('selectedDate', format(today, 'yyyy-MM-dd'));
      } else {
        const weekend = getWeekendDates();
        urlParams.set('startDate', format(weekend.start, 'yyyy-MM-dd'));
        urlParams.set('endDate', format(weekend.end, 'yyyy-MM-dd'));
      }
    }
    setIsCalendarOpen(false);
    navigate(`/search?${urlParams.toString()}`);
  };
  const handleWeekendSelect = () => {
    const today = new Date();
    const urlParams = new URLSearchParams();
    
    // If it's Sunday, use today as single date filter
    if (today.getDay() === 0) {
      urlParams.set('selectedDate', format(today, 'yyyy-MM-dd'));
    } else {
      const weekend = getWeekendDates();
      urlParams.set('startDate', format(weekend.start, 'yyyy-MM-dd'));
      urlParams.set('endDate', format(weekend.end, 'yyyy-MM-dd'));
    }
    navigate(`/search?${urlParams.toString()}`);
  };
  const handleViewAll = () => {
    navigate('/search');
  };
  const getCategoryIcon = (category: string) => {
    const iconMap: {
      [key: string]: React.ReactNode;
    } = {
      'Party & Musik': <Music className="h-3 w-3" />,
      'Familie & Freizeit': <Users className="h-3 w-3" />,
      'Sport & Outdoor': <Zap className="h-3 w-3" />,
      'Kultur & Bühne': <Palette className="h-3 w-3" />
    };
    return iconMap[category] || <Music className="h-3 w-3" />;
  };
  const getDateButtonText = () => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, 'dd.MM.', {
          locale: de
        })} - ${format(dateRange.to, 'dd.MM.', {
          locale: de
        })}`;
      } else {
        return format(dateRange.from, 'dd.MM.', {
          locale: de
        });
      }
    }
    return '';
  };

  // Get today's date for date restrictions
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mobile categories (only show first 2)
  const mobileCategories = CATEGORIES.slice(0, 2);
  const displayEvents = events.slice(0, maxEvents);
  return <section className="py-12 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <h2 className="text-[28px] md:text-4xl font-headline text-black mb-6 md:mb-8">
          {TEXT.ALL_EVENTS.title.replace('{region}', '')}
          <span className="text-volat-yellow">{currentRegion}</span>
        </h2>
        
        {/* Date Filters Row */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 w-full">
            <Button variant="outline" onClick={() => handleFilterClick('date', 'today')} className="text-xs sm:text-sm hover:bg-volat-yellow hover:text-black border-gray-300 px-3 py-2 h-8 flex-shrink-0">
              {TEXT.ALL_EVENTS.filters.today}
            </Button>
            <Button variant="outline" onClick={() => handleFilterClick('date', 'this-week')} className="text-xs sm:text-sm hover:bg-volat-yellow hover:text-black border-gray-300 px-3 py-2 h-8 flex-shrink-0">
              {TEXT.ALL_EVENTS.filters.tomorrow}
            </Button>
            <Button variant="outline" onClick={handleWeekendSelect} className="text-xs sm:text-sm hover:bg-volat-yellow hover:text-black border-gray-300 px-3 py-2 h-8 flex-shrink-0">
              {TEXT.ALL_EVENTS.filters.weekend}
            </Button>
            <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-xs sm:text-sm hover:bg-volat-yellow hover:text-black border-gray-300 px-3 py-2 h-8 flex-shrink-0 min-w-fit">
                  <CalendarDays className="h-3 w-3" />
                  {getDateButtonText()}
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90vw] max-w-md">
                <div className="p-6 px-0 py-0">
                  <DialogHeader className="mb-4">
                    <DialogTitle>{TEXT.ALL_EVENTS.filters.selectDate}</DialogTitle>
                  </DialogHeader>
                  
                  {/* Quick Selection Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => handleQuickSelection('today')} className="text-xs hover:bg-volat-yellow hover:text-black">
                      {TEXT.ALL_EVENTS.filters.today}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleQuickSelection('tomorrow')} className="text-xs hover:bg-volat-yellow hover:text-black">
                      {TEXT.ALL_EVENTS.filters.tomorrow}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleQuickSelection('weekend')} className="text-xs hover:bg-volat-yellow hover:text-black">
                      {TEXT.ALL_EVENTS.filters.weekend}
                    </Button>
                  </div>
                  
                  <div className="text-sm font-medium mb-2 text-gray-700 text-center">
                    {TEXT.ALL_EVENTS.filters.selectDateRange}
                  </div>
                  <div className="flex justify-center">
                    <CalendarComponent mode="range" selected={dateRange} onSelect={handleDateRangeSelect} initialFocus locale={de} weekStartsOn={1} disabled={date => date < today} className="pointer-events-auto" classNames={{
                    day_selected: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white rounded-none",
                    day_range_middle: "bg-black text-white hover:bg-black hover:text-white rounded-none",
                    day_range_start: "bg-black text-white hover:bg-black hover:text-white rounded-none",
                    day_range_end: "bg-black text-white hover:bg-black hover:text-white rounded-none",
                    day_today: "bg-transparent text-current [&[aria-selected=true]]:bg-black [&[aria-selected=true]]:text-white [&[aria-selected=true]]:rounded-none"
                  }} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                    {dateRange?.from && <Button variant="outline" size="sm" onClick={() => {
                    setDateRange(undefined);
                  }} className="flex-1 text-xs">
                        {TEXT.ALL_EVENTS.filters.reset}
                      </Button>}
                    <Button size="sm" onClick={handleConfirmDateSelection} disabled={!dateRange?.from} className="flex-1 text-xs bg-black text-white hover:bg-gray-800">
                      {TEXT.ALL_EVENTS.filters.confirm}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Category Filters Row */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 w-full">
            {/* Desktop: Show all categories */}
            <div className="hidden sm:flex flex-wrap gap-2 w-full">
              {CATEGORIES.map(category => <Button key={category} variant="outline" onClick={() => handleFilterClick('category', category)} className="text-xs sm:text-sm hover:bg-volat-yellow hover:text-black border-gray-300 px-3 py-2 h-8 flex-shrink-0">
                  <span className="mr-1">{getCategoryIcon(category)}</span>
                  {category}
                </Button>)}
            </div>

            {/* Mobile: Show only first 2 categories + edit button */}
            <div className="flex sm:hidden gap-2 w-full">
              {mobileCategories.map(category => <Button key={category} variant="outline" onClick={() => handleFilterClick('category', category)} className="text-xs hover:bg-volat-yellow hover:text-black border-gray-300 px-2 py-2 h-8 flex-shrink-0">
                  <span className="mr-1">{getCategoryIcon(category)}</span>
                  {category}
                </Button>)}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="text-xs hover:bg-volat-yellow hover:text-black border-gray-300 px-3 py-2 h-8 flex-shrink-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90vw] max-w-md">
                  <div className="p-4">
                    <DialogHeader className="mb-4">
                      <DialogTitle>{TEXT.ALL_EVENTS.filters.selectCategory}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-2">
                      <Button variant="outline" onClick={() => {
                      navigate('/search');
                    }} className="text-sm hover:bg-volat-yellow hover:text-black border-gray-300 justify-start">
                        {TEXT.ALL_EVENTS.filters.allCategories}
                      </Button>
                      {CATEGORIES.map(category => <Button key={category} variant="outline" onClick={() => {
                      handleFilterClick('category', category);
                    }} className="text-sm hover:bg-volat-yellow hover:text-black border-gray-300 justify-start">
                          <span className="mr-2">{getCategoryIcon(category)}</span>
                          {category}
                        </Button>)}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* Events Horizontal Scroll */}
        <ScrollArea ref={scrollAreaRef} className="w-full whitespace-nowrap">
          <div className="flex w-max space-x-4 pb-4">
            {displayEvents.length > 0 ? displayEvents.map(event => <div key={event.id} className="flex-none">
                  <EventCard event={event} />
                </div>) : <div className="flex-none">
                <div className="h-[340px] w-[266px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📅</div>
                    <h3 className="font-bold text-xl text-black mb-2">
                      {TEXT.ALL_EVENTS.noEvents.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {TEXT.ALL_EVENTS.noEvents.description}
                    </p>
                  </div>
                </div>
              </div>}
            
            {/* View All Events Card */}
            {displayEvents.length > 0 && <div className="flex-none">
                <div onClick={handleViewAll} className="h-[340px] w-[266px] bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 hover:border-volat-yellow transition-colors cursor-pointer">
                  <div className="text-center">
                    <div className="text-4xl mb-4">👀</div>
                    <h3 className="font-bold text-xl text-black mb-2">
                      {TEXT.ALL_EVENTS.viewAll.title}
                    </h3>
                    <Button className="bg-black text-white hover:bg-gray-800 mt-4 pointer-events-none">
                      {TEXT.ALL_EVENTS.viewAll.button}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>}
          </div>
          <ScrollBar orientation="horizontal" className="h-3" />
        </ScrollArea>
        
        {/* View All Events Button */}
        <div className="flex justify-center mt-8">
          <button 
            onClick={handleViewAll}
            className="text-lg font-black text-black hover:text-volat-yellow transition-colors flex items-center gap-2"
          >
            {TEXT.ALL_EVENTS.viewAll.discover}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>;
};
export default AllEventsSection;