import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CATEGORIES, FRONTEND_REGIONS as REGIONS } from '@/types/event';
import { TEXT } from '@/constants/text';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types/event';
import { supabase } from '@/integrations/supabase/client';
import RichTextEditor from './RichTextEditor';
import EventDateSelector from './forms/EventDateSelector';
import EventImageUpload from './forms/EventImageUpload';
import EventPriceSection from './forms/EventPriceSection';
import { SubcategorySelector } from './forms/SubcategorySelector';
import { CitySelector } from './forms/CitySelector';
import { eventFormSchema, EventFormData, DateWithTimes } from './forms/eventFormSchema';
import { getTextLength } from '@/utils/eventFormatters';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';
import { DuplicateEventsModal } from './DuplicateEventsModal';
import * as z from 'zod';

interface AddEventFormProps {
  onSuccess: () => void;
  initialData?: Event;
  isEditing?: boolean;
}

// Create a dynamic schema based on editing mode and form type
const createEventFormSchema = (isEditing: boolean, isInternal: boolean = false) => {
  const baseSchema = {
    name: z.string().min(1, TEXT.HARDCODED_ENGLISH.titleRequired).max(50, TEXT.HARDCODED_ENGLISH.titleMaxLength),
    category: z.enum(['Party & Musik', 'Familie & Freizeit', 'Sport & Outdoor', 'Kultur & Bühne']),
    subcategory: z.string().optional(),
    description: z.string().min(1, TEXT.HARDCODED_ENGLISH.descriptionRequired).max(2000, TEXT.HARDCODED_ENGLISH.descriptionMaxLength),
    region: z.string().min(1, TEXT.HARDCODED_ENGLISH.regionRequired),
    subregion: z.string().optional(),
    city: z.string().min(1, 'Ort ist erforderlich'),
    host: z.string().optional(),
    address: z.string().optional(),
    
    dates: z.array(z.object({
      date: z.date(),
      startTime: z.string().optional(),
      endTime: z.string().optional()
    })).min(1, 'At least one date is required').max(30, 'Maximum 30 dates allowed'),
    image: z.string().optional(),
    priceType: z.enum(['Free', 'Cost']),
    priceAmount: z.number().optional(),
    ticketLink: z.string().refine((val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Bitte geben Sie eine gültige URL ein').optional(),
    link: z.string().refine((val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Bitte geben Sie eine gültige URL ein').optional(),
    confirmAccuracy: z.boolean().refine(val => val === true, TEXT.HARDCODED_ENGLISH.confirmAccuracyRequired)
  };

  // Add internal-only fields
  if (isInternal) {
    Object.assign(baseSchema, {
      popularityScore: z.number().min(0).max(100).optional(),
      featured: z.boolean(),
    });
  }

  // For editing, email is optional, for adding it's required
  if (isEditing) {
    return z.object({
      ...baseSchema,
      email: z.string().optional()
    }).refine((data) => {
      if (data.priceType === 'Cost' && (data.priceAmount === undefined || data.priceAmount === null)) {
        return false;
      }
      return true;
    }, {
      message: "Price amount is required when price type is Cost",
      path: ["priceAmount"]
    });
  } else {
    return z.object({
      ...baseSchema,
      email: z.string().email('Gültige E-Mail ist erforderlich')
    }).refine((data) => {
      if (data.priceType === 'Cost' && (data.priceAmount === undefined || data.priceAmount === null)) {
        return false;
      }
      return true;
    }, {
      message: "Price amount is required when price type is Cost",
      path: ["priceAmount"]
    });
  }
};

const AddEventForm = ({ onSuccess, initialData, isEditing = false }: AddEventFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const addEvent = async (eventData: any) => {
    try {
      console.log('Adding event with data:', eventData);
      
      // Transform the data to match the database schema (let DB generate ID)
      const dbData = {
        name: eventData.name,
        description: eventData.description,
        category: eventData.category,
        subcategory: eventData.subcategory || null,
        region: eventData.region,
        subregion: eventData.subregion,
        city: eventData.city,
        address: eventData.address,
        host: eventData.host,
        dates: eventData.dates.map((date: any) => ({
          date: date.date.toISOString().split('T')[0], // Store only date part (YYYY-MM-DD)
          startTime: date.startTime,
          endTime: date.endTime
        })),
        price_type: eventData.price.type === 'Free' ? 'free' : 'cost',
        price_amount: eventData.price.amount,
        image: eventData.image,
        link: eventData.link,
        ticket_link: eventData.ticketLink || null,
        state: eventData.state || 'Pending',
        added_by: eventData.addedBy,
        added_by_email: eventData.addedByEmail,
        trust_score: eventData.trustScore || null,
        popularity_score: eventData.image ? 20 : 0,
        featured: eventData.featured || false
      };

      console.log('Database data to insert:', dbData);

      // Insert and get the generated ID back
      const { data: insertedEvent, error } = await supabase
        .from('events')
        .insert([dbData])
        .select('id')
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Event inserted successfully with ID:', insertedEvent.id);

      // Send confirmation email for external submissions using the generated ID
      if (eventData.addedBy === 'External') {
        try {
          console.log('Sending confirmation email for external event');
          const result = await supabase.functions.invoke('send-event-confirmation', {
            body: {
              eventId: insertedEvent.id,
              eventName: eventData.name,
              email: eventData.addedByEmail
            }
          });
          
          if (result.error) {
            console.error('Email function error:', result.error);
          } else {
            console.log('Confirmation email sent successfully');
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the entire operation if email fails
        }
      }

      // Trigger OpenAI scoring asynchronously (don't wait for it)
      try {
        console.log('Triggering OpenAI scoring for event:', insertedEvent.id);
        supabase.functions.invoke('openai-scoring', {
          body: {
            eventId: insertedEvent.id,
            eventData: {
              name: eventData.name,
              description: eventData.description,
              category: eventData.category,
              subcategory: eventData.subcategory,
              region: eventData.region,
              subregion: eventData.subregion,
              city: eventData.city,
              host: eventData.host,
              address: eventData.address,
              dates: eventData.dates,
              price: eventData.price,
              image: eventData.image,
              link: eventData.link,
              ticketLink: eventData.ticketLink
            }
          }
        }).then((result) => {
          if (result.error) {
            console.error('OpenAI scoring error:', result.error);
          } else {
            console.log('OpenAI scoring completed successfully');
          }
        }).catch((error) => {
          console.error('Failed to trigger OpenAI scoring:', error);
        });
      } catch (error) {
        console.error('Error triggering OpenAI scoring:', error);
        // Don't fail the entire operation if scoring fails
      }

      return { data: null, error: null };
    } catch (error: any) {
      console.error('Error adding event:', error);
      return { data: null, error };
    }
  };
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDates, setSelectedDates] = useState<DateWithTimes[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  
  // Determine context: internal form or regular add
  const isInternalForm = location.pathname === '/internal/add';
  
  // Create dynamic schema based on editing mode and form type
  const formSchema = createEventFormSchema(isEditing, isInternalForm);
  
  // Convert initial data to form format
  const getInitialFormData = () => {
    if (!initialData) {
      const baseData = {
        name: '',
        category: undefined,
        subcategory: '',
        description: '',
        region: '',
        subregion: '',
        city: '',
        host: '',
        address: '',
        dates: [],
        image: '',
        priceType: 'Free' as const,
        priceAmount: undefined,
        ticketLink: '',
        link: '',
        email: '',
        confirmAccuracy: false
      };
      
      // Add internal-only fields
      if (isInternalForm) {
        return {
          ...baseData,
          popularityScore: undefined,
          featured: false,
        };
      }
      
      return baseData;
    }

    const baseData = {
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
      priceAmount: initialData.price.amount,
      ticketLink: (initialData as any).ticketLink || '',
      link: initialData.link || '',
      email: initialData.addedByEmail,
      confirmAccuracy: false // Always start unchecked for editing
    };
    
    // Add internal-only fields
    if (isInternalForm) {
      return {
        ...baseData,
        popularityScore: initialData.popularityScore,
        featured: initialData.featured,
      };
    }
    
    return baseData;
  };
  
  const form = useForm<EventFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialFormData(),
    mode: 'onChange' // This will trigger validation on every change
  });

  // Set initial data when editing
  useEffect(() => {
    if (initialData) {
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
    }
  }, [initialData]);

  // Watch for form changes to enable/disable submit button
  useEffect(() => {
    if (!isEditing) return;

    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change' && name) {
        console.log('Form field changed:', name, value);
        setHasChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isEditing]);

  // Also watch for any form value changes by comparing current values with initial values
  useEffect(() => {
    if (!isEditing || !initialData) return;

    const currentValues = form.getValues();
    const initialValues = getInitialFormData();
    
    // Check if any field has changed from its initial value
    const fieldsChanged = Object.keys(currentValues).some(key => {
      const currentValue = currentValues[key as keyof EventFormData];
      const initialValue = initialValues[key as keyof EventFormData];
      
      // Special handling for different types
      if (key === 'dates') {
        return JSON.stringify(selectedDates) !== JSON.stringify(initialData.dates || []);
      }
      if (key === 'image') {
        return currentImage !== (initialData.image || '');
      }
      
      return currentValue !== initialValue;
    });

    if (fieldsChanged) {
      console.log('Form values changed from initial:', { currentValues, initialValues });
      setHasChanges(true);
    }
  }, [form.watch(), isEditing, initialData, selectedDates, currentImage]);

  // Watch for image changes
  useEffect(() => {
    if (isEditing && currentImage !== (initialData?.image || '')) {
      console.log('Image changed:', currentImage, 'vs', initialData?.image);
      setHasChanges(true);
    }
  }, [currentImage, initialData?.image, isEditing]);

  // Watch for dates changes
  useEffect(() => {
    if (isEditing && JSON.stringify(selectedDates) !== JSON.stringify(initialData?.dates || [])) {
      console.log('Dates changed:', selectedDates, 'vs', initialData?.dates);
      setHasChanges(true);
    }
  }, [selectedDates, initialData?.dates, isEditing]);

  const watchedRegion = form.watch('region');
  const watchedCategory = form.watch('category');
  const watchedPriceType = form.watch('priceType');
  const watchedConfirmAccuracy = form.watch('confirmAccuracy');
  const watchedName = form.watch('name');
  const watchedCity = form.watch('city');
  
  // Duplicate detection
  const { similarEvents, loading: loadingDuplicates, hasSimilarEvents } = useDuplicateDetection(
    watchedName || '',
    watchedRegion || '',
    watchedCity || ''
  );

  // Show duplicate modal when similar events are found
  useEffect(() => {
    if (hasSimilarEvents && !isEditing) {
      setShowDuplicateModal(true);
    }
  }, [hasSimilarEvents, isEditing]);
  
  const selectedRegionData = REGIONS.find(r => r.name === watchedRegion);

  const handleDatesChange = (dates: DateWithTimes[]) => {
    setSelectedDates(dates);
    form.setValue('dates', dates);
    if (isEditing) {
      console.log('Dates manually changed:', dates);
      setHasChanges(true);
    }
  };

  const handleImageChange = (image: string) => {
    setCurrentImage(image);
    form.setValue('image', image, { 
      shouldValidate: true,
      shouldDirty: true 
    });
    if (isEditing) {
      console.log('Image manually changed:', image);
      setHasChanges(true);
    }
  };

  const handleDescriptionChange = (data: string) => {
    form.setValue('description', data, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true 
    });
    if (isEditing) {
      console.log('Description manually changed:', data);
      setHasChanges(true);
    }
  };

  const updateEvent = async (data: EventFormData) => {
    if (!initialData?.id) return;

    try {
      // Determine new state: if current event is approved and we're editing, change to pending
      const newState = initialData.state === 'Approved' ? 'Pending' : initialData.state;

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
        ...(isInternalForm && {
          popularity_score: (data as any).popularityScore || null,
          featured: (data as any).featured || false,
        }),
        dates: selectedDates.map(date => ({
          date: date.date.toISOString().split('T')[0], // Store only date part (YYYY-MM-DD)
          startTime: date.startTime,
          endTime: date.endTime
        })),
        image: currentImage || null,
        price_type: data.priceType === 'Free' ? 'free' : 'cost',
        price_amount: data.priceAmount || null,
        link: data.link || null,
        ticket_link: data.ticketLink || null,
        state: newState,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', initialData.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  const onSubmit = async (data: EventFormData) => {
    if (isSubmitting || showDuplicateModal) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Submitting form data:', data);
      console.log('Is editing:', isEditing);
      console.log('Is internal form:', isInternalForm);
      console.log('Current user:', user);
      
      if (isEditing) {
        // Update existing event
        await updateEvent(data);
        onSuccess();
      } else {
        // Create new event
        const eventData = {
          name: data.name,
          category: data.category,
          subcategory: data.subcategory || undefined,
          description: data.description,
          region: data.region,
          subregion: data.subregion || null,
          city: data.city || null,
          host: data.host || null,
          address: data.address || null,
          ...(isInternalForm && {
            popularityScore: (data as any).popularityScore || null,
            featured: (data as any).featured || false,
          }),
          dates: selectedDates,
          image: currentImage || null,
          price: {
            type: data.priceType,
            amount: data.priceAmount || undefined
          },
          link: data.link || null,
          ticketLink: data.ticketLink || null,
          addedBy: isInternalForm ? 'Internal' as const : 'External' as const,
          addedByEmail: isInternalForm && user?.email ? user.email : data.email,
          state: isInternalForm ? 'Approved' as const : 'Pending' as const
        };

        console.log('Creating event with data:', eventData);

        const result = await addEvent(eventData);

        if (result.error) {
          console.error('Error from addEvent:', result.error);
          toast({
            title: "Error",
            description: result.error.message || "Failed to submit event",
            variant: "destructive",
          });
          return;
        }

        console.log('Event added successfully:', result.data);

        // For internal forms, show toast and navigate
        if (isInternalForm) {
          toast({
            title: "Success",
            description: "Event submitted successfully!",
          });
          navigate('/internal/manage');
        } else {
          // For external forms, navigate to home with success parameter
          navigate('/?showSuccess=true');
        }
      }
    } catch (error: any) {
      console.error('Error submitting event:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'submit'} event`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid and has required fields
  const isFormValid = selectedDates.length > 0 && watchedConfirmAccuracy;
  
  // For editing: enable submit only if form is valid AND has changes
  // For adding: enable submit only if form is valid and form validation passes
  const shouldEnableSubmit = isEditing ? 
    (isFormValid && hasChanges && form.formState.isValid) : 
    (isFormValid && form.formState.isValid);

  console.log('Form state:', {
    isValid: form.formState.isValid,
    hasChanges,
    selectedDatesLength: selectedDates.length,
    shouldEnableSubmit,
    isEditing,
    confirmAccuracy: watchedConfirmAccuracy,
    errors: form.formState.errors
  });

  return (
    <div className="max-w-4xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Group 1: Event Details */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.FORMS.sections.eventDetails}</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{TEXT.FORMS.fields.title}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={TEXT.FORMS.placeholders.eventTitle}
                      maxLength={50} 
                      className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                      {...field} 
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">{field.value?.length || 0}/50 {TEXT.LIMITS.titleCharacters}</div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{TEXT.FORMS.fields.category}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={fieldState.error ? "border-destructive focus:ring-destructive" : ""}>
                          <SelectValue placeholder={TEXT.FORMS.placeholders.selectCategory} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SubcategorySelector 
                control={form.control} 
                category={watchedCategory} 
              />
            </div>

            <FormField
              control={form.control}
              name="dates"
              render={() => (
                <EventDateSelector
                  selectedDates={selectedDates}
                  onDatesChange={handleDatesChange}
                />
              )}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field, fieldState }) => {
                console.log('Link field state:', { error: fieldState.error, value: field.value, isDirty: fieldState.isDirty, isTouched: fieldState.isTouched });
                return (
                  <FormItem>
                    <FormLabel>{TEXT.FORMS.fields.eventWebsite}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={TEXT.FORMS.placeholders.eventWebsite} 
                        className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{TEXT.FORMS.fields.enterDetails}</FormLabel>
                  <RichTextEditor
                    value={field.value}
                    onChange={handleDescriptionChange}
                    placeholder={TEXT.FORMS.placeholders.enterDetails}
                  />
                  <div className={`text-sm mt-1 ${getTextLength(field.value || '') > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>{getTextLength(field.value || '')}/2000 {TEXT.LIMITS.descriptionCharacters}</div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <EventImageUpload 
                  onImageChange={handleImageChange}
                  initialImage={currentImage}
                />
              )}
            />
          </div>

          {/* Group 2: Location */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.FORMS.sections.location}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region"
                render={({ field, fieldState }) => {
                  // Flatten all regions and subregions for dropdown
                  const allRegionOptions = REGIONS.flatMap(region => {
                    const options = [{ name: region.name, isSubregion: false, parentRegion: region.name }];
                    if (region.subregions) {
                      options.push(...region.subregions.map(sub => ({ 
                        name: sub, 
                        isSubregion: true, 
                        parentRegion: region.name 
                      })));
                    }
                    return options;
                  });

                  // Find the selected option - prefer subregion if available, otherwise parent region
                  const selectedSubregion = form.watch('subregion');
                  const selectedOption = allRegionOptions.find(option => 
                    selectedSubregion && option.isSubregion && option.name === selectedSubregion
                      ? true 
                      : !selectedSubregion && option.parentRegion === field.value && !option.isSubregion
                  );

                  return (
                    <FormItem>
                      <FormLabel>{TEXT.FORMS.fields.region}</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const option = allRegionOptions.find(opt => opt.name === value);
                          if (option) {
                            // Always store the parent region in the field
                            field.onChange(option.parentRegion);
                            // Store the actual selected value separately for subregion field
                            if (option.isSubregion) {
                              form.setValue('subregion', option.name);
                            } else {
                              form.setValue('subregion', '');
                            }
                          }
                        }} 
                        value={selectedOption?.name || field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={fieldState.error ? "border-destructive focus:ring-destructive" : ""}>
                            <SelectValue placeholder={TEXT.FORMS.placeholders.selectRegion} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allRegionOptions.map((option) => (
                            <SelectItem 
                              key={option.name} 
                              value={option.name}
                              className={option.isSubregion ? "pl-12 text-gray-600" : "font-medium"}
                            >
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <CitySelector control={form.control} watchedRegion={watchedRegion} watchedSubregion={form.watch('subregion')} />

              <FormField
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{TEXT.FORMS.fields.eventAddress}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={TEXT.FORMS.placeholders.eventAddress} 
                        className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="host"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>{TEXT.FORMS.fields.eventHost}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={TEXT.FORMS.placeholders.eventHost} 
                        maxLength={40}
                        className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">{field.value?.length || 0}/40 {TEXT.LIMITS.hostCharacters}</div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Group 3: Pricing */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.FORMS.sections.pricing}</h3>
            <EventPriceSection
              control={form.control}
              watchedPriceType={watchedPriceType}
            />
          </div>

          {/* Group 4: Contact */}
          {!isEditing && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.FORMS.sections.contactInformation}</h3>
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => {
                  console.log('Email field state:', { error: fieldState.error, value: field.value, isDirty: fieldState.isDirty, isTouched: fieldState.isTouched });
                  return (
                    <FormItem>
                      <FormLabel>{TEXT.FORMS.labels.email}</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder={TEXT.FORMS.placeholders.yourEmail} 
                          className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          )}

          {/* Group 5: Confirmation and Submit */}
          <div className="space-y-6 pb-12">
            <FormField
              control={form.control}
              name="confirmAccuracy"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      {TEXT.MESSAGES.consentMessage}
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-volat-yellow hover:bg-volat-yellow-dark text-black"
              disabled={!shouldEnableSubmit || isSubmitting || showDuplicateModal}
            >
              {isSubmitting ? 
                (isEditing ? TEXT.ACTIONS.updating : TEXT.ACTIONS.submitting) : 
                (isEditing ? TEXT.ACTIONS.updateEvent : TEXT.ACTIONS.submitEvent)
              }
            </Button>
          </div>
        </form>
      </Form>
      
      <DuplicateEventsModal
        open={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        similarEvents={similarEvents}
      />
    </div>
  );
};

export default AddEventForm;
