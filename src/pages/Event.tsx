import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import Header from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Calendar, Clock, MapPin, Euro, ExternalLink, ArrowLeft, House, Navigation } from 'lucide-react';
import { TEXT } from '@/constants/text';
import { Event } from '@/types/event';
import { EnhancedImage } from '@/components/ui/enhanced-image';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPriceDisplay } from '@/utils/priceFormatter';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import NewsletterSection from '@/components/NewsletterSection';
import { SEO } from '@/components/SEO';
const EventPage = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllDates, setShowAllDates] = useState(false);
  const {
    toast
  } = useToast();

  // Fetch the specific event directly from database
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);

        // Query the specific event by ID - optimized with maybeSingle and reduced fields
        const {
          data,
          error
        } = await supabase.from('events').select(`
            id, name, category, subcategory, description, region, subregion, city, host, address, 
            dates, image, price_type, price_amount, link, ticket_link, featured
          `).eq('id', id).eq('state', 'Approved').maybeSingle();
        if (error) {
          throw error;
        }
        if (!data) {
          setEvent(null);
          return;
        }

        // Transform the data to match our Event interface
        const transformedEvent: Event = {
          id: data.id,
          name: data.name,
          category: data.category as Event['category'],
          subcategory: data.subcategory || undefined,
          description: data.description,
          region: data.region,
          subregion: data.subregion,
          city: data.city,
          host: data.host || '',
          address: data.address,
          state: 'Approved' as Event['state'],
          popularityScore: 0,
          trustScore: 0,
          dates: Array.isArray(data.dates) ? data.dates.map((date: any) => ({
            date: new Date(date.date),
            startTime: date.startTime,
            endTime: date.endTime
          })) : [{
            date: new Date(),
            startTime: '',
            endTime: ''
          }],
          image: data.image,
          price: {
            type: data.price_type === 'free' ? 'Free' : 'Cost' as 'Free' | 'Cost',
            amount: data.price_amount || undefined
          },
          link: data.link,
          ticketLink: data.ticket_link,
          featured: data.featured,
          addedBy: 'External' as Event['addedBy'],
          addedByEmail: '',
          created: new Date(),
          updated: new Date()
        };
        setEvent(transformedEvent);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error",
          description: "Failed to fetch event details",
          variant: "destructive"
        });
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, toast]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const handleBackClick = () => {
    // Check if there's a previous page in history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to home page if no previous history
      navigate('/');
    }
  };
  const handleRouteClick = (address: string) => {
    const encodedAddress = encodeURIComponent(address);

    // Try to open native maps app
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      if (isIOS) {
        // Try Apple Maps first on iOS
        const appleMapsUrl = `maps://maps.apple.com/?q=${encodedAddress}`;
        window.location.href = appleMapsUrl;

        // Fallback to Google Maps if Apple Maps doesn't open
        setTimeout(() => {
          window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
        }, 1000);
      } else {
        // Try Google Maps app on Android
        const googleMapsApp = `geo:0,0?q=${encodedAddress}`;
        window.location.href = googleMapsApp;

        // Fallback to web Google Maps
        setTimeout(() => {
          window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
        }, 1000);
      }
    } else {
      // Desktop - open web Google Maps
      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    }
  };

  // Function to render markdown/HTML content
  const renderDescription = (description: string) => {
    return <div className="prose prose-lg max-w-none">
        <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{
        p: ({
          children
        }) => <p className="text-lg font-greta text-gray-700 leading-relaxed mb-4">{children}</p>,
        h1: ({
          children
        }) => <h1 className="text-3xl font-greta-bold text-gray-900 mb-3 mt-4 first:mt-0">{children}</h1>,
        h2: ({
          children
        }) => <h2 className="text-2xl font-greta-bold text-gray-900 mb-2 mt-3">{children}</h2>,
        h3: ({
          children
        }) => <h3 className="text-xl font-greta-bold text-gray-900 mb-2 mt-3">{children}</h3>,
        h4: ({
          children
        }) => <h4 className="text-lg font-greta-bold text-gray-900 mb-2 mt-2">{children}</h4>,
        h5: ({
          children
        }) => <h5 className="text-base font-greta-bold text-gray-900 mb-1 mt-2">{children}</h5>,
        h6: ({
          children
        }) => <h6 className="text-sm font-greta-bold text-gray-900 mb-1 mt-2">{children}</h6>,
        ul: ({
          children
        }) => <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2 ml-4">{children}</ul>,
        ol: ({
          children
        }) => <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2 ml-4">{children}</ol>,
        li: ({
          children
        }) => <li className="font-greta text-lg leading-relaxed">{children}</li>,
        strong: ({
          children
        }) => <strong className="font-greta-bold text-gray-900">{children}</strong>,
        em: ({
          children
        }) => <em className="font-greta italic">{children}</em>,
        a: ({
          children,
          href
        }) => <a href={href} className="text-blue-600 hover:text-blue-800 underline font-medium" target="_blank" rel="noopener noreferrer">{children}</a>,
        br: () => <br className="mb-2" />,
        blockquote: ({
          children
        }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-4">{children}</blockquote>,
        code: ({
          children
        }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
        pre: ({
          children
        }) => <pre className="bg-gray-100 p-4 rounded-lg overflow-auto mb-4">{children}</pre>
      }}>
          {description}
        </ReactMarkdown>
      </div>;
  };
  if (loading) {
    return <div className="min-h-screen bg-white">
        <Header />
        <LoadingScreen message={TEXT.LOADING.event} variant="spinner" size="md" className="py-20" />
      </div>;
  }
  if (!event) {
    return <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-greta-bold">{TEXT.PAGES.event.notFound}</h1>
          <p className="text-gray-600 mt-2">{TEXT.PAGES.event.notFoundSubtitle}</p>
          <p className="text-sm text-gray-500 mt-2">Event ID: {id}</p>
          <Button onClick={handleBackClick} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {TEXT.FORMS.buttons.back}
          </Button>
        </div>
      </div>;
  }
  const formatDate = (date: Date) => {
    return format(date, 'EEEE, dd. MMM yyyy', {
      locale: de
    });
  };
  return <div className="min-h-screen bg-white">
      <SEO 
        title={`${event.name} | Wohin`}
        description={`${event.description.substring(0, 160)}...`}
        ogImage={event.image || "/lovable-uploads/3161e3d7-ec62-433a-bfe4-45f2790ef8d4.png"}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button onClick={handleBackClick} variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {TEXT.FORMS.buttons.back}
          </Button>

          {/* Event Image */}
          <div className="mb-8 relative">
            <EnhancedImage src={event.image || "/lovable-uploads/91d8857e-2051-49a1-9704-f2fbfcddfd58.png"} alt={event.name} aspectRatio={16 / 9} />
            {event.featured && <div className="absolute top-4 left-4 z-10">
                <div className="inline-flex items-center rounded-full border-0 px-3 py-1 text-sm font-semibold bg-volat-yellow text-black shadow-lg">
                  {TEXT.EVENTS.top}
                </div>
              </div>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Title and Category - Always first */}
            <div className="lg:col-span-3 order-1">
              <div className="flex items-start gap-4 mb-2">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-headline text-black mb-4">
                    {event.name}
                  </h1>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-background-warm text-warm-text hover:bg-background-warm hover:text-warm-text">
                      {event.category}
                    </Badge>
                    {event.subcategory && <Badge variant="outline" className="text-xs text-warm-text whitespace-nowrap border-warm-text/30">
                        {event.subcategory}
                      </Badge>}
                  </div>
                </div>
              </div>
            </div>

            {/* Description - Last on mobile, first column on desktop */}
            <div className="lg:col-span-2 order-3 lg:order-2">
              <div className="prose max-w-none mb-8">
                {renderDescription(event.description)}
              </div>
            </div>

            {/* Sidebar - Second on mobile, third column on desktop */}
            <div className="space-y-6 order-2 lg:order-3">
              {/* Event Details Card */}
              <div className="bg-background-warm rounded-lg p-6">
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-6 w-6 text-warm-text mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-warm-text">{TEXT.PAGES.event.date}</div>
                      {(() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      // First, sort all dates in ascending order
                      const sortedDates = [...event.dates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                      // Separate future/today and past dates from sorted array
                      const futureDates = sortedDates.filter(dateItem => {
                        const eventDate = new Date(dateItem.date);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate >= today;
                      });
                      const pastDates = sortedDates.filter(dateItem => {
                        const eventDate = new Date(dateItem.date);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate < today;
                      });

                      // Determine which dates to show
                      let datesToShow;
                      let showButton = false;
                      if (showAllDates) {
                        // Show all dates when "Alle anzeigen" was clicked (already sorted)
                        datesToShow = sortedDates;
                      } else {
                        if (futureDates.length === 0) {
                          // Only past dates - show up to 6 most recent past dates
                          datesToShow = pastDates.slice(-6);
                          showButton = pastDates.length > 6;
                        } else {
                          // Has future dates - show up to 6 future dates
                          datesToShow = futureDates.slice(0, 6);
                          showButton = futureDates.length > 6 || pastDates.length > 0;
                        }
                      }
                      return <>
                            {datesToShow.map((dateItem, index) => <div key={index} className={`${dateItem.startTime ? 'mb-3' : 'mb-2'} last:mb-0`}>
                                <div className="font-greta text-sm text-warm-text">
                                  {formatDate(dateItem.date)}
                                </div>
                                {dateItem.startTime && <div className="font-greta text-sm text-warm-text">
                                    {dateItem.startTime.substring(0, 5)}
                                    {dateItem.endTime && ` - ${dateItem.endTime.substring(0, 5)}`}
                                  </div>}
                              </div>)}
                            {showButton && !showAllDates && <button onClick={() => setShowAllDates(true)} className="text-sm text-warm-text/80 hover:text-warm-text underline font-greta-medium transition-colors text-right w-full">Alle Termine anzeigen</button>}
                          </>;
                    })()}
                    </div>
                  </div>

                  {event.host && <div className="flex items-start gap-3">
                      <House className="h-6 w-6 text-warm-text mt-1" />
                      <div>
                        <div className="font-semibold text-sm text-warm-text">{TEXT.FORMS.labels.host}</div>
                        <div className="font-greta text-sm text-warm-text">
                          {event.host}
                        </div>
                      </div>
                    </div>}

                  <div className="flex items-start gap-3">
                    <MapPin className="h-6 w-6 text-warm-text mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-warm-text">{TEXT.PAGES.event.location}</div>
                      <div className="font-greta text-sm text-warm-text">
                        {(() => {
                        // Priority logic: subregion + city > region + city > region + subregion > region only
                        if (event.subregion && event.city) {
                          return `${event.subregion}, ${event.city}`;
                        } else if (event.city) {
                          return `${event.region}, ${event.city}`;
                        } else if (event.subregion) {
                          return `${event.region}, ${event.subregion}`;
                        } else {
                          return event.region;
                        }
                      })()}
                      </div>
                      {event.address && <div className="font-greta text-sm text-warm-text mt-1">
                          {event.address}
                        </div>}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Euro className="h-6 w-6 text-warm-text mt-1" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-warm-text">{TEXT.PAGES.event.price}</div>
                      <div className="font-greta text-sm text-warm-text flex items-center justify-between">
                        <span>{event.price.type === 'Free' ? TEXT.EVENTS.free : formatPriceDisplay(event.price.amount)}</span>
                        {event.ticketLink && event.price.type === 'Cost' && <button onClick={() => window.open(event.ticketLink, '_blank')} className="text-sm text-warm-text/80 hover:text-warm-text underline font-greta-medium transition-colors">
                            Tickets kaufen
                          </button>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {(event.address || event.city) && <Button variant="outline" className="w-full" onClick={() => {
                // Build location string: "address, city" if both exist, otherwise just city
                const locationString = event.address && event.city ? `${event.address}, ${event.city}` : event.address || event.city!;
                handleRouteClick(locationString);
              }}>
                    <Navigation className="mr-2 h-4 w-4" />
                    Route planen
                  </Button>}
                
                <Button variant="outline" className="w-full" onClick={async () => {
                const shareData = {
                  title: event.name,
                  url: window.location.href
                };

                // Check if native sharing is available (mobile devices)
                if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                  try {
                    await navigator.share(shareData);
                  } catch (error) {
                    // User cancelled the share or error occurred
                    console.log('Share cancelled or failed');
                  }
                } else {
                  // Fallback for desktop: copy to clipboard
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied!",
                      description: "Event link has been copied to your clipboard."
                    });
                  } catch (error) {
                    // Fallback if clipboard API is not available
                    toast({
                      title: "Share link",
                      description: window.location.href,
                      variant: "default"
                    });
                  }
                }
              }}>
                  {TEXT.PAGES.event.shareEvent}
                </Button>

                {event.link && <Button className="w-full bg-volat-yellow hover:bg-volat-yellow-dark text-black font-greta-bold" onClick={() => window.open(event.link, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {TEXT.PAGES.event.visitWebsite}
                  </Button>}
              </div>

            </div>
          </div>
        </div>
      </main>
      
      <NewsletterSection />
    </div>;
};
export default EventPage;