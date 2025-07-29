import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/types/event';
import { editEventSchema, EditEventFormData } from '@/components/forms/editEventSchema';
import { DateWithTimes } from '@/components/forms/eventFormSchema';

interface UseEditEventFormProps {
  initialData: Event;
  onSuccess: () => void;
}

export const useEditEventForm = ({ initialData, onSuccess }: UseEditEventFormProps) => {
  const { toast } = useToast();
  const [selectedDates, setSelectedDates] = useState<DateWithTimes[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datesChanged, setDatesChanged] = useState(false);
  const [imageChanged, setImageChanged] = useState(false);
  const [descriptionChanged, setDescriptionChanged] = useState(false);

  // Mobile debugging logs
  console.log('🔧 useEditEventForm initialized:', {
    eventId: initialData.id,
    eventName: initialData.name,
    userAgent: navigator.userAgent,
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  });

  // Convert initial data to form format
  const getFormDataFromEvent = (): EditEventFormData => {
    return {
      name: initialData.name,
      category: initialData.category,
      subcategory: initialData.subcategory || '',
      description: initialData.description,
      region: initialData.region,
      subregion: initialData.subregion || '',
      city: initialData.city || '',
      host: initialData.host || '',
      address: initialData.address || '',
      
      dates: initialData.dates,
      image: initialData.image || '',
      priceType: initialData.price.type,
      priceAmount: initialData.price.amount || undefined, // Convert null to undefined  
      link: initialData.link || '',
      ticketLink: initialData.ticketLink || '',
      confirmAccuracy: true // Default to checked for edit form
    };
  };

  const form = useForm<EditEventFormData>({
    resolver: zodResolver(editEventSchema),
    defaultValues: getFormDataFromEvent()
  });

  // Set initial values on mount
  useEffect(() => {
    if (initialData.dates) {
      const formattedDates = initialData.dates.map(date => ({
        date: date.date,
        startTime: date.startTime || '',
        endTime: date.endTime || ''
      }));
      setSelectedDates(formattedDates);
    }
    
    if (initialData.image) {
      setCurrentImage(initialData.image);
    }
  }, [initialData]);

  // Track changes in dates and image separately
  useEffect(() => {
    const originalDates = JSON.stringify(initialData.dates);
    const currentDates = JSON.stringify(selectedDates);
    setDatesChanged(originalDates !== currentDates);
  }, [selectedDates, initialData.dates]);

  useEffect(() => {
    const originalImage = initialData.image || '';
    setImageChanged(originalImage !== currentImage);
  }, [currentImage, initialData.image]);

  // Track changes in description separately
  useEffect(() => {
    const originalDescription = initialData.description;
    const currentDescription = form.getValues('description');
    setDescriptionChanged(originalDescription !== currentDescription);
  }, [form.watch('description'), initialData.description]);

  const watchedRegion = form.watch('region');
  const watchedSubregion = form.watch('subregion');
  const watchedCategory = form.watch('category');
  const watchedPriceType = form.watch('priceType');
  const watchedConfirmAccuracy = form.watch('confirmAccuracy');

  const handleDatesChange = (dates: DateWithTimes[]) => {
    console.log('🔧 handleDatesChange called:', { dates, isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) });
    setSelectedDates(dates);
    form.setValue('dates', dates);
    // Force trigger validation on mobile
    form.trigger('dates');
  };

  const handleImageChange = (image: string) => {
    console.log('🔧 handleImageChange called:', { image, isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) });
    setCurrentImage(image);
    form.setValue('image', image);
    form.trigger('image');
  };

  const handleDescriptionChange = (data: string) => {
    console.log('🔧 handleDescriptionChange called:', { dataLength: data.length, isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) });
    form.setValue('description', data);
    form.trigger('description'); // Trigger validation and mark as dirty
  };

  const onSubmit = async (data: EditEventFormData) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log('🔧 Form submission started:', {
      eventId: initialData.id,
      isMobile,
      isSubmitting,
      formIsValid: form.formState.isValid,
      hasAnyChanges: form.formState.isDirty || datesChanged || imageChanged || descriptionChanged,
      selectedDatesCount: selectedDates.length,
      confirmAccuracy: data.confirmAccuracy,
      shouldEnableSubmit: form.formState.isValid && 
        (form.formState.isDirty || datesChanged || imageChanged || descriptionChanged) && 
        selectedDates.length > 0 && 
        data.confirmAccuracy
    });

    if (isSubmitting) {
      console.log('🔧 Already submitting, returning early');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🔧 Setting RLS header:', { 'x-user-email': initialData.addedByEmail });
      // Determine new state: if current event is approved and we're editing, change to pending
      const newState = initialData.state === 'Approved' ? 'Pending' : initialData.state;

      // Convert dates with proper error handling for mobile
      const processedDates = selectedDates.map(dateItem => {
        try {
          // Ensure we have a valid Date object
          const dateObj = dateItem.date instanceof Date ? dateItem.date : new Date(dateItem.date);
          if (isNaN(dateObj.getTime())) {
            throw new Error(`Invalid date: ${dateItem.date}`);
          }
          return {
            date: dateObj.toISOString(),
            startTime: dateItem.startTime || '',
            endTime: dateItem.endTime || ''
          };
        } catch (error) {
          console.error('🔧 Date processing error:', error, dateItem);
          throw new Error(`Failed to process date: ${error}`);
        }
      });

      const updateData = {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory || null,
        description: data.description,
        region: data.region,
        subregion: data.subregion || null,
        city: data.city || null,
        host: data.host || null,
        address: data.address || null,
        
        dates: processedDates,
        image: currentImage || null,
        price_type: data.priceType === 'Free' ? 'free' : 'cost',
        price_amount: data.priceAmount || null,
        link: data.link || null,
        ticket_link: data.ticketLink || null,
        state: newState,
        updated_at: new Date().toISOString()
      };

      console.log('🔧 Update data prepared:', {
        eventId: initialData.id,
        updateData: { ...updateData, dates: `${processedDates.length} dates` },
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      });

      console.log('🔧 Sending update to Supabase...');
      
      // Create a new supabase client instance with the required header
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseWithHeaders = createClient(
        'https://bdupjgeuxgpjnmjajmqq.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkdXBqZ2V1eGdwam5tamFqbXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyODA5NDYsImV4cCI6MjA2Njg1Njk0Nn0.Mbe7loM3BaZQfLjEth5BwmDx1F2CjfRPIkbofatuWts',
        {
          global: {
            headers: {
              'x-user-email': initialData.addedByEmail
            }
          }
        }
      );
      
      const { error, data: result } = await supabaseWithHeaders
        .from('events')
        .update(updateData)
        .eq('id', initialData.id)
        .eq('added_by_email', initialData.addedByEmail)
        .select()
        .single();

      if (error) {
        console.error('🔧 Supabase update error:', error);
        throw error;
      }

      // Send status notification email for external events when moving from Approved to Pending
      if (initialData.addedBy === 'External' && initialData.state === 'Approved' && newState === 'Pending') {
        try {
          console.log('Sending status notification email for external event state change');
          await supabase.functions.invoke('send-event-status-notification', {
            body: {
              eventId: initialData.id,
              eventName: initialData.name,
              email: initialData.addedByEmail,
              status: 'Pending'
            }
          });
        } catch (emailError) {
          console.error('Failed to send status notification email:', emailError);
          // Don't fail the entire operation if email fails
        }
      }

      console.log('🔧 Update successful, calling onSuccess');
      onSuccess();
    } catch (error: any) {
      console.error('🔧 Error updating event:', error);
      
      // Enhanced mobile error handling
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const errorMessage = error.message || 'Failed to update event';
      
      console.log('🔧 Error details:', {
        error,
        errorMessage,
        isMobile,
        formState: form.formState,
        selectedDatesCount: selectedDates.length,
        confirmAccuracy: form.getValues('confirmAccuracy')
      });

      toast({
        title: "Error",
        description: isMobile ? `Mobile Error: ${errorMessage}` : errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('🔧 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  // Enable submit only if form is valid, has changes, dates exist, and confirmation is checked
  const hasAnyChanges = form.formState.isDirty || datesChanged || imageChanged || descriptionChanged;
  const shouldEnableSubmit = 
    form.formState.isValid && 
    hasAnyChanges && 
    selectedDates.length > 0 && 
    watchedConfirmAccuracy;

  // Debug submit button state on mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    console.log('🔧 Submit button state:', {
      shouldEnableSubmit,
      formIsValid: form.formState.isValid,
      hasAnyChanges,
      selectedDatesLength: selectedDates.length,
      confirmAccuracy: watchedConfirmAccuracy,
      isSubmitting,
      formErrors: form.formState.errors
    });
  }

  return {
    form,
    selectedDates,
    currentImage,
    isSubmitting,
    watchedRegion,
    watchedSubregion,
    watchedCategory,
    watchedPriceType,
    watchedConfirmAccuracy,
    shouldEnableSubmit,
    handleDatesChange,
    handleImageChange,
    handleDescriptionChange,
    onSubmit
  };
};