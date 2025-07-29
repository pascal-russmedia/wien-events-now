
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { TEXT } from '@/constants/text';

interface EventDate {
  date: Date;
  startTime?: string;
  endTime?: string;
}

interface EventDateManagerProps {
  dates: EventDate[];
  onChange: (dates: EventDate[]) => void;
}

const EventDateManager: React.FC<EventDateManagerProps> = ({ dates, onChange }) => {
  const addDate = () => {
    const newDate = {
      date: new Date(),
      startTime: '',
      endTime: ''
    };
    onChange([...dates, newDate]);
  };

  const removeDate = (index: number) => {
    const newDates = dates.filter((_, i) => i !== index);
    onChange(newDates);
  };

  const updateDate = (index: number, field: keyof EventDate, value: any) => {
    const newDates = [...dates];
    if (field === 'date') {
      newDates[index] = { ...newDates[index], [field]: new Date(value) };
    } else {
      newDates[index] = { ...newDates[index], [field]: value };
    }
    onChange(newDates);
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Event Dates
          <Button type="button" onClick={addDate} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {TEXT.BUTTONS.addDate}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dates.map((dateItem, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Date {index + 1}</h4>
              {dates.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeDate(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor={`date-${index}`}>Date</Label>
                <Input
                  id={`date-${index}`}
                  type="date"
                  value={formatDateForInput(dateItem.date)}
                  onChange={(e) => updateDate(index, 'date', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor={`start-time-${index}`}>{TEXT.FORMS.startTimeOptional}</Label>
                <Input
                  id={`start-time-${index}`}
                  type="time"
                  value={dateItem.startTime || ''}
                  onChange={(e) => updateDate(index, 'startTime', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor={`end-time-${index}`}>{TEXT.FORMS.endTimeOptional}</Label>
                <Input
                  id={`end-time-${index}`}
                  type="time"
                  value={dateItem.endTime || ''}
                  onChange={(e) => updateDate(index, 'endTime', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        
        {dates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>{TEXT.MESSAGES.noDatesAdded}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventDateManager;
