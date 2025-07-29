import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import InternalLayout from '@/components/auth/InternalLayout';
import { SEO } from '@/components/SEO';
import EventDateSelector from '@/components/forms/EventDateSelector';
import EventImageUpload from '@/components/forms/EventImageUpload';
import EventPriceSection from '@/components/forms/EventPriceSection';
import { SubcategorySelector } from '@/components/forms/SubcategorySelector';
import { CitySelector } from '@/components/forms/CitySelector';
import { useInternalEvents } from '@/hooks/useInternalEvents';
import { Event, CATEGORIES, REGIONS } from '@/types/event';
import { TEXT } from '@/constants/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/RichTextEditor';
import { supabase } from '@/integrations/supabase/client';
import { DateWithTimes } from '@/components/forms/eventFormSchema';
import { getTextLength } from '@/utils/eventFormatters';

const eventSchema = z.object({
  name: z.string().min(1, TEXT.HARDCODED_ENGLISH.titleRequired).max(50, TEXT.HARDCODED_ENGLISH.titleMaxLength),
  category: z.enum(['Party & Musik', 'Familie & Freizeit', 'Sport & Outdoor', 'Kultur & Bühne']).optional().refine(val => val !== undefined, TEXT.HARDCODED_ENGLISH.categoryRequired),
  subcategory: z.string().optional(),
  description: z.string().min(1, TEXT.HARDCODED_ENGLISH.descriptionRequired).max(2000, TEXT.HARDCODED_ENGLISH.descriptionMaxLength),
  region: z.string().optional().refine(val => val !== undefined && val !== '', TEXT.HARDCODED_ENGLISH.regionRequired),
  subregion: z.string().optional(),
  city: z.string().optional(),
  host: z.string().optional(),
  address: z.string().optional(),
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
  priceType: z.enum(['Free', 'Cost']),
  priceAmount: z.number().optional(),
  featured: z.boolean(),
  popularityScore: z.number().min(0).max(100).optional(),
  trustScore: z.number().optional(),
}).refine((data) => {
  if (data.priceType === 'Cost' && (data.priceAmount === undefined || data.priceAmount === null)) {
    return false;
  }
  return true;
}, {
  message: "Price amount is required when price type is Cost",
  path: ["priceAmount"]
});

type EventFormData = z.infer<typeof eventSchema>;

const InternalEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateEvent } = useInternalEvents();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventDates, setEventDates] = useState<DateWithTimes[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: '',
      category: 'Party & Musik',
      subcategory: '',
      description: '',
      region: '',
      subregion: '',
      city: '',
      host: '',
      address: '',
      link: '',
      ticketLink: '',
      priceType: 'Free',
      priceAmount: 0,
      featured: false,
      popularityScore: 0,
    },
  });

  // Fetch the specific event by ID
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching event:', error);
          return;
        }

        if (data) {
          // Transform the data to match our Event interface
          const transformedEvent: Event = {
            id: data.id,
            name: data.name,
            subcategory: data.subcategory || undefined,
            category: data.category as Event['category'],
            description: data.description,
            region: data.region,
            subregion: data.subregion,
            city: data.city,
            host: data.host,
            address: data.address,
            state: data.state as Event['state'],
            popularityScore: data.popularity_score,
            trustScore: data.trust_score,
            dates: Array.isArray(data.dates) ? data.dates.map((date: any) => ({
              date: new Date(date.date),
              startTime: date.startTime,
              endTime: date.endTime
            })) : [{ date: new Date(), startTime: '', endTime: '' }],
            image: data.image,
            price: {
              type: data.price_type === 'free' ? 'Free' : 'Cost' as 'Free' | 'Cost',
              amount: data.price_amount || undefined
            },
            link: data.link,
            ticketLink: data.ticket_link,
            featured: data.featured,
            addedBy: data.added_by as Event['addedBy'],
            addedByEmail: data.added_by_email,
            created: new Date(data.created_at),
            updated: new Date(data.updated_at)
          };

          setEvent(transformedEvent);
          setEventDates(transformedEvent.dates || []);
          setCurrentImage(transformedEvent.image || '');
          
          // Populate form with event data
            form.reset({
              name: transformedEvent.name,
              category: transformedEvent.category,
              subcategory: transformedEvent.subcategory || '',
              description: transformedEvent.description,
              region: transformedEvent.region,
              subregion: transformedEvent.subregion || '',
              city: transformedEvent.city || '',
              host: transformedEvent.host || '',
              address: transformedEvent.address || '',
              link: transformedEvent.link || '',
              ticketLink: transformedEvent.ticketLink || '',
              priceType: transformedEvent.price.type,
              priceAmount: transformedEvent.price.amount || 0,
              featured: transformedEvent.featured,
              popularityScore: transformedEvent.popularityScore || 0,
              trustScore: transformedEvent.trustScore || 0,
            });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error",
          description: "Failed to fetch event details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, form, toast]);

  const handleImageChange = (image: string) => {
    if (event) {
      setEvent({ ...event, image });
    }
  };

  const onSubmit = async (data: EventFormData) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    console.log('🔧 Internal edit form submission started:', {
      eventId: event?.id,
      isMobile,
      eventDatesLength: eventDates.length,
      formData: data,
      userAgent: navigator.userAgent
    });

    if (!event) {
      console.log('🔧 No event found, returning early');
      return;
    }

    if (eventDates.length === 0) {
      console.log('🔧 No event dates, showing error toast');
      toast({
        title: "Error",
        description: "Please add at least one date for the event",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Calculate new popularity score if featured status changed
      let newPopularityScore = data.popularityScore || 0;
      
      // If event was not featured before but is now featured, add 5 points
      if (!event.featured && data.featured) {
        newPopularityScore += 5;
      }
      // If event was featured before but is no longer featured, subtract 5 points
      else if (event.featured && !data.featured) {
        newPopularityScore = Math.max(0, newPopularityScore - 5);
      }

      const updatedEvent = {
        ...event,
        name: data.name,
        category: data.category,
        subcategory: data.subcategory === "" ? null : data.subcategory,
        description: data.description,
        region: data.region,
        subregion: data.subregion === "" ? null : data.subregion,
        city: data.city === "" ? null : data.city,
        host: data.host === "" ? null : data.host,
        address: data.address === "" ? null : data.address,
        link: data.link === "" ? null : data.link,
        ticketLink: data.ticketLink === "" ? null : data.ticketLink,
        price: {
          type: data.priceType,
          amount: data.priceType === 'Cost' ? data.priceAmount : undefined,
        },
        featured: data.featured,
        popularityScore: newPopularityScore,
        trustScore: data.trustScore,
        dates: eventDates,
        image: currentImage || event.image,
      };

      console.log('🔧 About to call updateEvent with:', {
        eventId: event.id,
        updatedEvent: { ...updatedEvent, dates: `${updatedEvent.dates.length} dates` },
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      });

      await updateEvent(event.id, updatedEvent);
      
      console.log('🔧 updateEvent completed successfully');
      
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    } catch (error) {
      console.error('🔧 Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    } finally {
      console.log('🔧 Setting saving to false');
      setSaving(false);
    }
  };

  const handleStateChange = async (newState: 'Pending' | 'Approved' | 'Rejected') => {
    if (!event) return;
    
    setSaving(true);
    try {
      // First save any pending form changes
      const formData = form.getValues();
      const updatedEvent = {
        ...event,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory === "" ? null : formData.subcategory,
        description: formData.description,
        region: formData.region,
        subregion: formData.subregion === "" ? null : formData.subregion,
        city: formData.city === "" ? null : formData.city,
        host: formData.host === "" ? null : formData.host,
        address: formData.address === "" ? null : formData.address,
        link: formData.link === "" ? null : formData.link,
        ticketLink: formData.ticketLink === "" ? null : formData.ticketLink,
        price: {
          type: formData.priceType,
          amount: formData.priceType === 'Cost' ? formData.priceAmount : undefined,
        },
        featured: formData.featured,
        popularityScore: formData.popularityScore,
        dates: eventDates,
        image: event.image,
        state: newState,
      };

      await updateEvent(event.id, updatedEvent);
      setEvent({ ...event, state: newState });

      // Send status notification email for external events when moving to Approved/Rejected
      if (event.addedBy === 'External' && (newState === 'Approved' || newState === 'Rejected')) {
        try {
          console.log('Sending status notification email for external event from internal edit');
          await supabase.functions.invoke('send-event-status-notification', {
            body: {
              eventId: event.id,
              eventName: updatedEvent.name,
              email: event.addedByEmail,
              status: newState
            }
          });
        } catch (emailError) {
          console.error('Failed to send status notification email:', emailError);
          // Don't fail the entire operation if email fails
        }
      }
      
      toast({
        title: "Success",
        description: `Event ${newState.toLowerCase()} successfully`,
      });
    } catch (error) {
      console.error('Error updating event state:', error);
      toast({
        title: "Error",
        description: "Failed to update event state",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'Pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200"><Clock className="w-3 h-3 mr-1" />{TEXT.STATES.pending}</Badge>;
      case 'Approved':
        return <Badge variant="outline" className="text-green-600 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />{TEXT.STATES.approved}</Badge>;
      case 'Rejected':
        return <Badge variant="outline" className="text-red-600 border-red-200"><XCircle className="w-3 h-3 mr-1" />{TEXT.STATES.rejected}</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  if (loading) {
    return (
      <InternalLayout title="Edit Event">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">{TEXT.LOADING.event}</p>
        </div>
      </InternalLayout>
    );
  }

  if (!event) {
    return (
      <InternalLayout title="Edit Event">
        <div className="text-center py-8">
          <p className="text-gray-500">{TEXT.MESSAGES.eventNotFound}</p>
          <Button onClick={() => navigate('/internal/manage')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {TEXT.BUTTONS.backToEvents}
          </Button>
        </div>
      </InternalLayout>
    );
  }

  return (
    <>
      <SEO 
        title="Event bearbeiten | Wohin"
        description="Internes Tool zum Bearbeiten von Events"
        noIndex={true}
      />
      <InternalLayout title="Edit Event">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/internal/manage')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStateBadge(event.state)}
                <span className="text-sm text-gray-500">
                  Created {new Intl.DateTimeFormat('en-US').format(event.created)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Group 1: Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-foreground border-b pb-2">{TEXT.HARDCODED_ENGLISH.basicInformation}</h3>
                  
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
                    selectedDates={eventDates}
                    onDatesChange={setEventDates}
                  />
                  
                  <EventImageUpload
                    onImageChange={(imageUrl) => {
                      setCurrentImage(imageUrl);
                      handleImageChange(imageUrl);
                    }}
                    initialImage={currentImage || event?.image}
                  />

                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://example.com" 
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
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {allRegionOptions.map((option) => (
                                  <SelectItem 
                                    key={option.name} 
                                    value={option.name}
                                    className={option.isSubregion ? "pl-8 text-muted-foreground" : "font-medium"}
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

                     <CitySelector 
                       control={form.control} 
                       watchedRegion={form.watch('region')} 
                       watchedSubregion={form.watch('subregion')} 
                     />

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
                    watchedPriceType={form.watch('priceType')}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={event.state === 'Pending' || saving}
                        onClick={() => handleStateChange('Pending')}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 justify-start"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {TEXT.ACTIONS.setPending}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={event.state === 'Approved' || saving}
                        onClick={() => handleStateChange('Approved')}
                        className="text-green-600 border-green-200 hover:bg-green-50 justify-start"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {TEXT.ACTIONS.setApproved}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={event.state === 'Rejected' || saving}
                        onClick={() => handleStateChange('Rejected')}
                        className="text-red-600 border-red-200 hover:bg-red-50 justify-start"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {TEXT.ACTIONS.setRejected}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Event Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <FormLabel>{TEXT.HARDCODED_ENGLISH.featuredEvent}</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="text-sm text-muted-foreground">
                      {TEXT.HARDCODED_ENGLISH.topEventDescription}
                    </div>

                    <FormField
                      control={form.control}
                      name="popularityScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{TEXT.HARDCODED_ENGLISH.popularityScoreOptional}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              max="100"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {TEXT.HARDCODED_ENGLISH.popularityScoreDescription}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="trustScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{TEXT.HARDCODED_ENGLISH.trustScoreOptional}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number" 
                              min="0" 
                              max="100"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <div className="text-sm text-muted-foreground">
                            {TEXT.HARDCODED_ENGLISH.trustScoreDescription}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>


                <Card>
                  <CardHeader>
                    <CardTitle>Submission Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Added by:</span> {event.addedByEmail}
                    </div>
                    <div>
                      <span className="font-medium">Source:</span> {event.addedBy}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Intl.DateTimeFormat('en-US').format(event.created)}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {new Intl.DateTimeFormat('en-US').format(event.updated)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/internal/manage')}
              >
                {TEXT.FORMS.cancel}
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : TEXT.FORMS.save}
              </Button>
            </div>

          </form>
        </Form>
        
        {/* Bottom spacing */}
        <div className="h-48"></div>
      </div>
      </InternalLayout>
    </>
  );
};

export default InternalEditEvent;