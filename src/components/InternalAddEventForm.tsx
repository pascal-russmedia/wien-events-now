
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CATEGORIES, REGIONS } from '@/types/event';
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

interface InternalAddEventFormProps {
  onSuccess: () => void;
  initialData?: Event;
  isEditing?: boolean;
}

// Create dynamic schema function that adjusts based on region selection
const createInternalEventFormSchema = (isViennaSelected: boolean) => {
  return z.object({
    name: z.string().min(1, TEXT.HARDCODED_ENGLISH.titleRequired).max(50, TEXT.HARDCODED_ENGLISH.titleMaxLength),
    category: z.enum(['Party & Musik', 'Familie & Freizeit', 'Sport & Outdoor', 'Kultur & Bühne']).optional().refine(val => val !== undefined, TEXT.HARDCODED_ENGLISH.categoryRequired),
    subcategory: z.string().optional(),
    description: z.string().min(1, TEXT.HARDCODED_ENGLISH.descriptionRequired).max(2000, TEXT.HARDCODED_ENGLISH.descriptionMaxLength),
    region: z.string().optional().refine(val => val !== undefined && val !== '', TEXT.HARDCODED_ENGLISH.regionRequired),
    subregion: z.string().optional(),
    city: isViennaSelected ? z.string().optional() : z.string().min(1, 'Ort ist erforderlich'),
    host: z.string().optional(),
    address: z.string().optional(),
    
    dates: z.array(z.object({
      date: z.date(),
      startTime: z.string().optional(),
      endTime: z.string().optional()
    })).min(1, 'At least one date is required').max(50, 'Maximum 50 dates allowed'),
    image: z.string().optional(),
    priceType: z.enum(['Free', 'Cost']),
    priceAmount: z.number().optional(),
    link: z.string().refine((val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Bitte geben Sie eine gültige URL ein').optional(),
    ticketLink: z.string().refine((val) => {
      if (!val || val === '') return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, 'Bitte geben Sie eine gültige URL ein').optional(),
    featured: z.boolean()
  }).refine((data) => {
    if (data.priceType === 'Cost' && (data.priceAmount === undefined || data.priceAmount === null)) {
      return false;
    }
    return true;
  }, {
    message: "Price amount is required when price type is Cost",
    path: ["priceAmount"]
  });
};

// Initial schema with city required
const internalEventFormSchema = createInternalEventFormSchema(false);

const InternalAddEventForm = ({ onSuccess, initialData, isEditing = false }: InternalAddEventFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const addEvent = async (eventData: any) => {
    try {
      console.log('Adding internal event with data:', eventData);
      
      // Default popularity score for internal events
      let finalPopularityScore = 0;
      if (eventData.image) {
        finalPopularityScore += 20;
      }
      if (eventData.featured) {
        finalPopularityScore += 5;
      }
      
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
          date: date.date.toISOString().split('T')[0],
          startTime: date.startTime,
          endTime: date.endTime
        })),
        price_type: eventData.price.type === 'Free' ? 'free' : 'cost',
        price_amount: eventData.price.amount,
        image: eventData.image,
        link: eventData.link,
        ticket_link: eventData.ticketLink,
        state: 'Approved', // Internal events are auto-approved
        added_by: 'Internal',
        added_by_email: user?.email || 'internal@system.com',
        trust_score: 100, // Internal events always get trust score 100
        popularity_score: finalPopularityScore,
        featured: eventData.featured || false
      };

      console.log('Database data to insert:', dbData);

      const { data: insertedEvent, error } = await supabase
        .from('events')
        .insert([dbData])
        .select('id')
        .single();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('Internal event inserted successfully with ID:', insertedEvent.id);

      // Trigger OpenAI scoring asynchronously (don't wait for it)
      try {
        console.log('Triggering OpenAI scoring for internal event:', insertedEvent.id);
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

      return insertedEvent.id;
    } catch (error) {
      console.error('Error in addEvent:', error);
      throw error;
    }
  };

  const updateEvent = async (eventId: string, eventData: any) => {
    try {
      console.log('Updating event with ID:', eventId);
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
          date: date.date.toISOString().split('T')[0],
          startTime: date.startTime,
          endTime: date.endTime
        })),
        price_type: eventData.price.type === 'Free' ? 'free' : 'cost',
        price_amount: eventData.price.amount,
        image: eventData.image,
        link: eventData.link,
        ticket_link: eventData.ticketLink,
        popularity_score: (eventData.image ? 20 : 0) + (eventData.featured ? 5 : 0),
        featured: eventData.featured || false,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('events')
        .update(dbData)
        .eq('id', eventId)
        .select('id')
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Event updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  };

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const form = useForm<z.infer<typeof internalEventFormSchema>>({
    resolver: zodResolver(internalEventFormSchema),
    defaultValues: {
      name: '',
      category: undefined,
      subcategory: '',
      description: '',
      region: undefined,
      subregion: '',
      city: '',
      host: '',
      address: '',
      dates: [],
      image: '',
      priceType: 'Free',
      priceAmount: undefined,
      link: '',
      ticketLink: '',
      featured: false
    }
  });

  // Watch form state for debugging and UI updates
  const watchedPriceType = form.watch('priceType');
  const watchedDates = form.watch('dates');
  const watchedRegion = form.watch('region');
  const watchedSubregion = form.watch('subregion');
  const watchedName = form.watch('name');
  const watchedCity = form.watch('city');
  const formState = form.formState;

  // Check if Wien is selected (either main region or any Wien subregion)
  const isViennaSelected = watchedRegion === 'Wien' || 
    (watchedSubregion && REGIONS.find(r => r.name === 'Wien')?.subregions?.includes(watchedSubregion));

  // Clear city field when Vienna is selected
  useEffect(() => {
    if (isViennaSelected) {
      form.setValue('city', '');
    }
  }, [isViennaSelected, form]);

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

  // Remove the auto-prefill logic for popularity score when image is uploaded

  console.log('Form state:', {
    isValid: formState.isValid,
    hasChanges: formState.isDirty,
    selectedDatesLength: watchedDates?.length || 0,
    shouldEnableSubmit: formState.isValid && (watchedDates?.length || 0) > 0,
    isEditing,
    errors: formState.errors
  });

  // Calculate if submit should be enabled
  const shouldEnableSubmit = formState.isValid && (watchedDates?.length || 0) > 0;

  // Reset form when editing data changes
  useEffect(() => {
    if (initialData && isEditing) {
      console.log('Resetting form with initial data:', initialData);
      
      const dates = Array.isArray(initialData.dates) ? initialData.dates.map((dateItem: any) => {
        const date = typeof dateItem === 'string' ? dateItem : dateItem.date;
        return {
          date: new Date(date),
          startTime: dateItem.startTime || '',
          endTime: dateItem.endTime || ''
        };
      }) : [];

      form.reset({
        name: initialData.name || '',
        category: initialData.category as any || 'Kultur & Bühne',
        subcategory: initialData.subcategory || '',
        description: initialData.description || '',
        region: initialData.region || 'Vorarlberg',
        subregion: initialData.subregion || '',
        city: initialData.city || '',
        host: initialData.host || '',
        address: initialData.address || '',
        dates: dates,
        image: initialData.image || '',
        priceType: (initialData.price?.type === 'Free' ? 'Free' : 'Cost') as any,
        priceAmount: initialData.price?.amount || undefined,
        link: initialData.link || '',
        ticketLink: initialData.ticketLink || '',
        featured: initialData.featured || false
      });
    }
  }, [initialData, isEditing, form]);

  const onSubmit = async (data: z.infer<typeof internalEventFormSchema>) => {
    console.log('Form submitted with data:', data);
    
    if (isSubmitting || showDuplicateModal) return;
    
    if (!user?.email) {
      toast({
        title: TEXT.HARDCODED_ENGLISH.authenticationRequired,
        description: TEXT.HARDCODED_ENGLISH.youMustBeLoggedIn,
        variant: "destructive"
      });
      return;
    }

    // Manual validation for city field when Wien is not selected
    const currentIsViennaSelected = data.region === 'Wien' || 
      (data.subregion && REGIONS.find(r => r.name === 'Wien')?.subregions?.includes(data.subregion));
    
    if (!currentIsViennaSelected && (!data.city || data.city.trim() === '')) {
      toast({
        title: "Validation Error",
        description: "Ort ist erforderlich wenn Wien nicht ausgewählt ist",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform form data to match the expected format
      const transformedData = {
        ...data,
        // Clear city field if Wien is selected to ensure null in database
        city: currentIsViennaSelected ? null : data.city,
        price: {
          type: data.priceType,
          amount: data.priceAmount
        },
        addedBy: 'Internal',
        addedByEmail: user.email,
        trustScore: 100
      };

      if (isEditing && initialData?.id) {
        await updateEvent(initialData.id, transformedData);
        
        toast({
          title: TEXT.HARDCODED_ENGLISH.eventUpdatedSuccessfully,
          description: TEXT.HARDCODED_ENGLISH.theEventHasBeenUpdated
        });
        
        navigate('/internal/manage');
      } else {
        const eventId = await addEvent(transformedData);
        
        toast({
          title: TEXT.HARDCODED_ENGLISH.eventCreatedSuccessfully,
          description: TEXT.MESSAGES.eventApprovedLive
        });
        
        onSuccess();
        navigate('/internal/manage');
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({
        title: isEditing ? TEXT.ERRORS.eventUpdateFailed : TEXT.ERRORS.eventCreateFailed,
        description: error.message || TEXT.ERRORS.tryAgainLater,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Group 1: Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.HARDCODED_ENGLISH.basicInformation}</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{TEXT.HARDCODED_ENGLISH.title}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={TEXT.FORMS.placeholders.eventTitle}
                      maxLength={50}
                      className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                      {...field} 
                    />
                  </FormControl>
                  <div className="text-sm text-muted-foreground">{field.value?.length || 0}/50</div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                category={form.watch('category')}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{TEXT.FORMS.fields.description}</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={TEXT.FORMS.placeholders.enterDetails}
                    />
                  </FormControl>
                  <div className={`text-sm mt-1 ${getTextLength(field.value || '') > 2000 ? 'text-destructive' : 'text-muted-foreground'}`}>{getTextLength(field.value || '')}/2000</div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <EventDateSelector
              selectedDates={form.watch('dates')?.filter((d): d is DateWithTimes => d.date !== undefined) || []}
              onDatesChange={(dates) => form.setValue('dates', dates)}
            />
            
            <EventImageUpload
              onImageChange={(imageUrl) => form.setValue('image', imageUrl)}
              initialImage={form.watch('image')}
            />

            <FormField
              control={form.control}
              name="link"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>{TEXT.FORMS.fields.eventWebsite}</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder={TEXT.FORMS.placeholders.eventWebsite} 
                      className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Group 2: Location */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.HARDCODED_ENGLISH.location}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="region"
                render={({ field, fieldState }) => {
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

                  const selectedSubregion = form.watch('subregion');
                  const selectedOption = allRegionOptions.find(option => 
                    selectedSubregion && option.isSubregion && option.name === selectedSubregion
                      ? true 
                      : !selectedSubregion && option.parentRegion === field.value && !option.isSubregion
                  );

                  return (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const option = allRegionOptions.find(opt => opt.name === value);
                          if (option) {
                            field.onChange(option.parentRegion);
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

              {!isViennaSelected && (
                <CitySelector control={form.control} watchedRegion={watchedRegion} watchedSubregion={form.watch('subregion')} />
              )}

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
                    <div className="text-sm text-muted-foreground">{field.value?.length || 0}/40</div>
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

          {/* Group 4: Additional Settings */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.HARDCODED_ENGLISH.additionalSettings}</h3>
            
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{TEXT.HARDCODED_ENGLISH.featuredEvent}</FormLabel>
                    <div className="text-sm text-muted-foreground">{TEXT.HARDCODED_ENGLISH.topEventDescription}</div>
                  </div>
                </FormItem>
              )}
            />
          </div>

          {/* Group 5: Submit */}
          <div className="space-y-6 pb-12">
            <Button 
              type="submit" 
              className="w-full bg-volat-yellow hover:bg-volat-yellow-dark text-black font-greta-bold"
              disabled={!shouldEnableSubmit || isSubmitting || showDuplicateModal}
            >
              {isSubmitting ? 
                (isEditing ? TEXT.ACTIONS.updating : TEXT.ACTIONS.creating) : 
                (isEditing ? TEXT.ACTIONS.updateEvent : TEXT.ACTIONS.createEvent)
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

export default InternalAddEventForm;
