
import { useState, useEffect } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { EventFormData } from './eventFormSchema';
import { TEXT } from '@/constants/text';

interface EventPriceSectionProps {
  control: Control<EventFormData>;
  watchedPriceType: 'Free' | 'Cost';
}

const PriceAmountField = ({ control }: { control: Control<EventFormData> }) => {
  const [displayValue, setDisplayValue] = useState('');

  return (
    <FormField
      control={control}
      name="priceAmount"
      render={({ field, fieldState }) => {
        // Sync display value with field value when field changes externally
        useEffect(() => {
          if (field.value !== undefined) {
            setDisplayValue(field.value.toString().replace('.', ','));
          } else {
            setDisplayValue('');
          }
        }, [field.value]);

        return (
          <FormItem>
            <FormLabel>{TEXT.HARDCODED_ENGLISH.priceAmount}</FormLabel>
            <FormControl>
              <Input 
                type="text" 
                placeholder={TEXT.HARDCODED_ENGLISH.priceAmountPlaceholder}
                className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                onChange={(e) => {
                  let value = e.target.value;
                  // Convert dots to commas for decimal separator
                  value = value.replace(/\./g, ',');
                  // Only allow numbers, one comma, and up to 2 decimal places
                  const regex = /^\d*,?\d{0,2}$/;
                  
                  if (value === '' || regex.test(value)) {
                    setDisplayValue(value);
                    
                    if (value === '') {
                      field.onChange(undefined);
                    } else {
                      // Convert comma back to dot for number parsing
                      const numericValue = value.replace(',', '.');
                      // Update field value for any valid number, including trailing decimal
                      if (numericValue && numericValue !== '.') {
                        const parsedValue = parseFloat(numericValue);
                        if (!isNaN(parsedValue)) {
                          field.onChange(parsedValue);
                        }
                      }
                    }
                  }
                }}
                value={displayValue}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

const EventPriceSection = ({ control, watchedPriceType }: EventPriceSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="priceType"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{TEXT.HARDCODED_ENGLISH.priceType}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className={fieldState.error ? "border-destructive focus:ring-destructive" : ""}>
                  <SelectValue placeholder={TEXT.HARDCODED_ENGLISH.selectPriceType} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Free">{TEXT.HARDCODED_ENGLISH.free}</SelectItem>
                <SelectItem value="Cost">{TEXT.HARDCODED_ENGLISH.cost}</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {watchedPriceType === 'Cost' && (
        <>
          <PriceAmountField control={control} />
          <FormField
            control={control}
            name="ticketLink"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Link für Tickets (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="z.B. https://tickets.website.at"
                    className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  );
};

export default EventPriceSection;
