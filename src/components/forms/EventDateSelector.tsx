
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TimeInput } from '@/components/ui/time-input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateWithTimes } from './eventFormSchema';
import { TEXT } from '@/constants/text';

interface EventDateSelectorProps {
  selectedDates: DateWithTimes[];
  onDatesChange: (dates: DateWithTimes[]) => void;
}

const EventDateSelector = ({ selectedDates, onDatesChange }: EventDateSelectorProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Get today's date to allow selecting today and future dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addDate = (date: Date | undefined) => {
    if (date && !selectedDates.some(d => d.date.toDateString() === date.toDateString())) {
      if (selectedDates.length >= 50) {
        // Don't add more than 50 dates
        return;
      }
      // Create a new date at noon to avoid timezone issues
      const safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      const newDates = [...selectedDates, { date: safeDate, startTime: '', endTime: '' }];
      onDatesChange(newDates);
      setIsCalendarOpen(false);
    }
  };

  const removeDate = (dateToRemove: Date) => {
    const newDates = selectedDates.filter(dateItem => dateItem.date.toDateString() !== dateToRemove.toDateString());
    onDatesChange(newDates);
  };

  const updateDateTime = (date: Date, field: 'startTime' | 'endTime', value: string) => {
    const newDates = selectedDates.map(dateItem => 
      dateItem.date.toDateString() === date.toDateString() 
        ? { ...dateItem, [field]: value }
        : dateItem
    );
    onDatesChange(newDates);
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Datum</FormLabel>
      <div className="space-y-4">
        {selectedDates.map((dateItem, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{format(dateItem.date, 'PPP', { locale: de })}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDate(dateItem.date)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{TEXT.FORMS.startTimeOptional}</label>
                <TimeInput
                  value={dateItem.startTime || ''}
                  onChange={(e) => updateDateTime(dateItem.date, 'startTime', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{TEXT.FORMS.endTimeOptional}</label>
                <TimeInput
                  value={dateItem.endTime || ''}
                  onChange={(e) => updateDateTime(dateItem.date, 'endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              disabled={selectedDates.length >= 50}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDates.length >= 50 ? TEXT.MESSAGES.maximumDatesReached : TEXT.BUTTONS.addDate}
              <Plus className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              onSelect={addDate}
              disabled={(date) => date < today}
              initialFocus
              locale={de}
              weekStartsOn={1}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>
      <FormMessage />
    </FormItem>
  );
};

export default EventDateSelector;
