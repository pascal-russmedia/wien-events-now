import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { CalendarDays, Music, Users, Zap, Palette, Edit } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { CATEGORIES, SUBCATEGORIES } from '@/types/event';
import { useLocation, useNavigate } from 'react-router-dom';
import { TEXT } from '@/constants/text';

interface SearchFiltersProps {
  selectedCategory: string;
  selectedSubcategory: string;
  dateRange: DateRange | undefined;
  subcategoryCounts: {[key: string]: number};
  loadingSubcategoryCounts: boolean;
  onCategorySelect: (category: string) => void;
  onSubcategorySelect: (subcategory: string) => void;
  onDateRangeSelect: (range: DateRange | undefined) => void;
  onClearFilters: () => void;
}

export const SearchFilters = ({
  selectedCategory,
  selectedSubcategory,
  dateRange,
  subcategoryCounts,
  loadingSubcategoryCounts,
  onCategorySelect,
  onSubcategorySelect,
  onDateRangeSelect,
  onClearFilters
}: SearchFiltersProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
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
        return `${format(dateRange.from, 'dd.MM.', { locale: de })} - ${format(dateRange.to, 'dd.MM.', { locale: de })}`;
      } else {
        return format(dateRange.from, 'dd.MM.', { locale: de });
      }
    }
    return TEXT.FORMS.placeholders.selectDate;
  };

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
    const dayOfWeek = date.getDay();
    if (dayOfWeek >= 5) {
      return dayOfWeek === 5 ? date : friday;
    } else {
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      friday.setDate(date.getDate() + daysUntilFriday);
      return friday;
    }
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

  const handleQuickSelection = (type: 'today' | 'tomorrow' | 'weekend') => {
    const urlParams = new URLSearchParams(location.search);
    const today = new Date();

    urlParams.delete('date');
    urlParams.delete('selectedDate');
    urlParams.delete('startDate');
    urlParams.delete('endDate');

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
    navigate(`${location.pathname}?${urlParams.toString()}`);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setTempDateRange(range);
  };

  const handleConfirmDateSelection = () => {
    if (tempDateRange?.from) {
      const urlParams = new URLSearchParams(location.search);
      urlParams.delete('date');
      urlParams.delete('selectedDate');
      urlParams.delete('startDate');
      urlParams.delete('endDate');
      
      if (tempDateRange.to) {
        urlParams.set('startDate', format(tempDateRange.from, 'yyyy-MM-dd'));
        urlParams.set('endDate', format(tempDateRange.to, 'yyyy-MM-dd'));
      } else {
        urlParams.set('selectedDate', format(tempDateRange.from, 'yyyy-MM-dd'));
      }
      
      setIsCalendarOpen(false);
      navigate(`${location.pathname}?${urlParams.toString()}`);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const hasDateFilter = dateRange?.from;
  const hasCategoryFilter = selectedCategory;
  const hasFilters = hasDateFilter || hasCategoryFilter || selectedSubcategory;

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 w-full items-center">
        {/* Date Filter */}
        <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className={`text-xs sm:text-sm font-greta border-gray-300 px-3 py-2 h-8 flex-shrink-0 min-w-fit ${
                hasDateFilter ? 'bg-volat-yellow hover:bg-volat-yellow-dark text-black' : 'hover:bg-volat-yellow hover:text-black'
              }`}
            >
              <CalendarDays className="h-3 w-3 mr-1" />
              {getDateButtonText()}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-md">
            <div className="p-4 px-0 py-0">
              <DialogHeader className="mb-4">
                <DialogTitle>Datum wählen</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={() => handleQuickSelection('today')} className="text-xs font-greta hover:bg-volat-yellow hover:text-black">
                  Heute
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickSelection('tomorrow')} className="text-xs font-greta hover:bg-volat-yellow hover:text-black">
                  Morgen
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickSelection('weekend')} className="text-xs font-greta hover:bg-volat-yellow hover:text-black">
                  Wochenende
                </Button>
              </div>
              
              <div className="text-sm font-medium mb-2 text-gray-700 text-center">
                Ein Datum oder Zeitraum wählen
              </div>
              <div className="flex justify-center">
                <CalendarComponent 
                  mode="range" 
                  selected={tempDateRange} 
                  onSelect={handleDateRangeSelect} 
                  initialFocus 
                  locale={de} 
                  weekStartsOn={1} 
                  disabled={date => date < today} 
                  className="pointer-events-auto" 
                  classNames={{
                    day_selected: "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white rounded-none",
                    day_range_middle: "bg-black text-white hover:bg-black hover:text-white rounded-none",
                    day_range_start: "bg-black text-white hover:bg-black hover:text-white rounded-none",
                    day_range_end: "bg-black text-white hover:bg-black hover:text-white rounded-none",
                    day_today: "bg-transparent text-current [&[aria-selected=true]]:bg-black [&[aria-selected=true]]:text-white [&[aria-selected=true]]:rounded-none"
                  }}
                />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                {tempDateRange?.from && (
                  <Button variant="outline" size="sm" onClick={() => setTempDateRange(undefined)} className="flex-1 text-xs">
                    Zurücksetzen
                  </Button>
                )}
                <Button size="sm" onClick={handleConfirmDateSelection} disabled={!tempDateRange?.from} className="flex-1 text-xs bg-black text-white hover:bg-gray-800">
                  Bestätigen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Filter */}
        <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className={`text-xs sm:text-sm font-greta border-gray-300 px-3 py-2 h-8 flex-shrink-0 ${
                hasCategoryFilter ? 'bg-volat-yellow hover:bg-volat-yellow-dark text-black' : 'hover:bg-volat-yellow hover:text-black'
              }`}
            >
              {hasCategoryFilter ? (
                <span className="mr-1">{getCategoryIcon(selectedCategory)}</span>
              ) : (
                <Edit className="h-3 w-3 mr-1" />
              )}
              {selectedCategory || TEXT.FORMS.placeholders.selectCategory}
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-md">
            <div className="p-4">
              <DialogHeader className="mb-4">
                <DialogTitle>Kategorie wählen</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => onCategorySelect('')} 
                    className="text-sm font-greta hover:bg-volat-yellow hover:text-black border-gray-300 justify-start"
                  >
                    {TEXT.ALL_EVENTS.filters.allCategories}
                  </Button>
                {CATEGORIES.map(category => (
                  <Button 
                    key={category} 
                    variant="outline" 
                    onClick={() => onCategorySelect(category)} 
                    className="text-sm font-greta hover:bg-volat-yellow hover:text-black border-gray-300 justify-start"
                  >
                    <span className="mr-2">{getCategoryIcon(category)}</span>
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Subcategory Filter */}
        {selectedCategory && (
          <Dialog open={isSubcategoryOpen} onOpenChange={setIsSubcategoryOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className={`text-xs sm:text-sm font-greta border-gray-300 px-3 py-2 h-8 flex-shrink-0 ${
                  selectedSubcategory ? 'bg-volat-yellow hover:bg-volat-yellow-dark text-black' : 'hover:bg-volat-yellow hover:text-black'
                }`}
              >
                {selectedSubcategory || TEXT.FORMS.placeholders.selectSubcategory}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-md max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex-shrink-0">
                <DialogHeader className="mb-4">
                  <DialogTitle>{TEXT.ALL_EVENTS.filters.selectSubcategory}</DialogTitle>
                </DialogHeader>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2 pr-2 pb-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        onSubcategorySelect('');
                        setIsSubcategoryOpen(false);
                      }} 
                      className="text-sm font-greta hover:bg-volat-yellow hover:text-black border-gray-300 justify-start"
                    >
                      {TEXT.ALL_EVENTS.filters.allSubcategories}
                    </Button>
                  {loadingSubcategoryCounts ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-gray-500">{TEXT.ALL_EVENTS.filters.loadingSubcategories}</div>
                    </div>
                  ) : (
                    (SUBCATEGORIES[selectedCategory] || [])
                      .filter(subcategory => {
                        const count = subcategoryCounts[subcategory] || 0;
                        return count > 0;
                      })
                      .map(subcategory => {
                        const count = subcategoryCounts[subcategory] || 0;
                        return (
                          <Button 
                            key={subcategory} 
                            variant="outline" 
                            onClick={() => {
                              onSubcategorySelect(subcategory);
                              setIsSubcategoryOpen(false);
                            }} 
                            className="text-sm font-greta hover:bg-volat-yellow hover:text-black border-gray-300 justify-between"
                          >
                            <span>{subcategory}</span>
                            <span className="text-gray-500">({count})</span>
                          </Button>
                        );
                      })
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Clear Filters */}
        {hasFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters} 
            className="text-xs sm:text-sm font-greta border-gray-300 px-3 py-2 h-8 flex-shrink-0"
          >
            {TEXT.FORMS.placeholders.clearFilters}
          </Button>
        )}
      </div>
    </div>
  );
};