import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, value, onChange, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSafari, setIsSafari] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const internalRef = ref || inputRef;

    useEffect(() => {
      // Detect Safari browser
      const userAgent = navigator.userAgent.toLowerCase();
      const safari = userAgent.includes('safari') && !userAgent.includes('chrome');
      setIsSafari(safari);
    }, []);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      // For Safari, always set to 00:00 if no value, even when focused
      if (isSafari && !value) {
        setTimeout(() => {
          if (e.target) {
            e.target.value = '00:00';
          }
        }, 0);
      }
      
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // For Safari, if user didn't enter anything and it's still 00:00, treat as empty
      if (isSafari && e.target.value === '00:00' && !value) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: '' }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // For Safari, only trigger onChange if the value is different from 00:00 placeholder
      if (isSafari) {
        // If user changes from 00:00 to something else, that's a real change
        if (e.target.value !== '00:00') {
          onChange(e);
        }
        // If user clears the field or sets it back to 00:00, treat as empty
        else if (value && e.target.value === '00:00') {
          const syntheticEvent = {
            ...e,
            target: { ...e.target, value: '' }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      } else {
        onChange(e);
      }
    };

    // Display value logic for Safari
    const getDisplayValue = () => {
      if (isSafari && !value) {
        return '00:00';
      }
      return value;
    };

    // Check if we should show placeholder styling
    const isShowingPlaceholder = isSafari && !value;

    return (
      <div className="relative">
        <Input
          {...props}
          ref={internalRef}
          type="time"
          value={getDisplayValue()}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            // For Safari placeholder state, use muted text color in all states
            isShowingPlaceholder && "text-muted-foreground",
            className
          )}
          step="60"
        />
      </div>
    );
  }
);

TimeInput.displayName = "TimeInput";

export { TimeInput };