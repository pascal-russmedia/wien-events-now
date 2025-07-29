import { useMemo, useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import HorizontalEventSection from '@/components/HorizontalEventSection';
import AllEventsSection from '@/components/AllEventsSection';
import NewsletterSection from '@/components/NewsletterSection';
import AddEventSuccessModal from '@/components/AddEventSuccessModal';
import EditEventSuccessModal from '@/components/EditEventSuccessModal';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useHomePageEvents } from '@/hooks/useHomePageEvents';
import { TEXT } from '@/constants/text';
import { Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Event } from '@/types/event';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { SEO } from '@/components/SEO';
const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useScrollRestoration(); // Enable scroll position restoration
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);

  // Get current selected region from URL params or default to Vorarlberg
  const getCurrentRegion = () => {
    const urlParams = new URLSearchParams(location.search);
    const regionParam = urlParams.get('region');
    const subregionParam = urlParams.get('subregion');
    if (subregionParam) {
      return subregionParam;
    }
    return regionParam || 'Vorarlberg';
  };
  const currentRegion = getCurrentRegion();
  const {
    events,
    loading
  } = useHomePageEvents(currentRegion);

  // Check for success modal parameters and reset region selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    let shouldCleanUrl = false;
    if (urlParams.get('showSuccess') === 'true') {
      setShowSuccessModal(true);
      urlParams.delete('showSuccess');
      shouldCleanUrl = true;
    }
    if (urlParams.get('showEditSuccess') === 'true') {
      setShowEditSuccessModal(true);
      urlParams.delete('showEditSuccess');
      shouldCleanUrl = true;
    }

    // Reset region selection to Vorarlberg when on home page
    if (urlParams.get('region') || urlParams.get('subregion')) {
      urlParams.delete('region');
      urlParams.delete('subregion');
      shouldCleanUrl = true;
    }

    // Clean up URL parameters if any were found
    if (shouldCleanUrl) {
      const newSearch = urlParams.toString();
      const newUrl = newSearch ? `/?${newSearch}` : '/';
      navigate(newUrl, {
        replace: true
      });
    }
  }, [location.search, navigate]);
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };
  const handleCloseEditModal = () => {
    setShowEditSuccessModal(false);
  };

  // Events are already expanded and filtered server-side, just use them directly
  const filteredEvents = events;

  // Filter events for highlights of the day (today's events)
  const highlightsOfDay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.dates[0].date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
  }, [filteredEvents]);

  // Filter events for highlights of the week (next 7 days excluding today)
  // Maximum 1 event per weekday (Mon-Thu), maximum 3 per weekend day (Fri-Sun)
  const highlightsOfWeek = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Filter events for next 7 days
    const weekEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.dates[0].date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate > today && eventDate <= nextWeek;
    });

    // Group events by day and apply limits
    const eventsByDay = new Map<string, Event[]>();
    weekEvents.forEach(event => {
      const eventDate = new Date(event.dates[0].date);
      const dateKey = eventDate.toISOString().split('T')[0];
      if (!eventsByDay.has(dateKey)) {
        eventsByDay.set(dateKey, []);
      }
      eventsByDay.get(dateKey)!.push(event);
    });
    const result: Event[] = [];
    eventsByDay.forEach((dayEvents, dateKey) => {
      const date = new Date(dateKey);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Sort events by popularity score (highest first)
      const sortedDayEvents = dayEvents.sort((a, b) => {
        const popularityA = a.popularityScore || 0;
        const popularityB = b.popularityScore || 0;
        return popularityB - popularityA;
      });

      // Apply limits based on day type
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Sun, Fri, Sat
      const maxEvents = isWeekend ? 3 : 1;
      result.push(...sortedDayEvents.slice(0, maxEvents));
    });

    // Sort final result by date, then by popularity
    return result.sort((a, b) => {
      const dateA = new Date(a.dates[0].date).getTime();
      const dateB = new Date(b.dates[0].date).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      const popularityA = a.popularityScore || 0;
      const popularityB = b.popularityScore || 0;
      return popularityB - popularityA;
    });
  }, [filteredEvents]);

  // All events from selected region with day-based limits, excluding highlights of the week
  const allEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get IDs of events already shown in highlights of the week
    const highlightEventIds = new Set(highlightsOfWeek.map(event => event.id));

    // Filter out events already in highlights and exclude today's events
    const availableEvents = filteredEvents.filter(event => {
      if (highlightEventIds.has(event.id)) return false;

      // Exclude today's events
      const eventDate = new Date(event.dates[0].date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() !== today.getTime();
    });

    // Group events by day and apply limits
    const eventsByDay = new Map<string, Event[]>();
    availableEvents.forEach(event => {
      const eventDate = new Date(event.dates[0].date);
      const dateKey = eventDate.toISOString().split('T')[0];
      if (!eventsByDay.has(dateKey)) {
        eventsByDay.set(dateKey, []);
      }
      eventsByDay.get(dateKey)!.push(event);
    });
    const result: Event[] = [];
    eventsByDay.forEach((dayEvents, dateKey) => {
      const date = new Date(dateKey);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Sort events by popularity score (highest first)
      const sortedDayEvents = dayEvents.sort((a, b) => {
        const popularityA = a.popularityScore || 0;
        const popularityB = b.popularityScore || 0;
        return popularityB - popularityA;
      });

      // Apply limits based on day type
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Sun, Fri, Sat
      const maxEvents = isWeekend ? 3 : 1;
      result.push(...sortedDayEvents.slice(0, maxEvents));
    });

    // Sort final result by date, then by popularity
    return result.sort((a, b) => {
      const dateA = new Date(a.dates[0].date).getTime();
      const dateB = new Date(b.dates[0].date).getTime();
      if (dateA !== dateB) {
        return dateA - dateB;
      }
      const popularityA = a.popularityScore || 0;
      const popularityB = b.popularityScore || 0;
      return popularityB - popularityA;
    });
  }, [filteredEvents, highlightsOfWeek]);
  if (loading) {
    return <div className="min-h-screen bg-white">
        <Header />
        <main>
          <HeroSection />
          <LoadingScreen message={TEXT.LOADING.events} variant="spinner" size="md" className="py-20" />
        </main>
      </div>;
  }
  return <div className="min-h-screen bg-white">
      <SEO 
        title="Wohin in Vorarlberg"
        description="Aktuelle Events, Konzerte, Kultur & Ausgehtipps in Vorarlberg & der Bodenseeregion – jetzt entdecken, was am Wochenende los ist."
      />
      <Header />
      
      <main>
        <HeroSection />
        
        {/* Always show Highlights of the Day section */}
        <HorizontalEventSection title={TEXT.EVENTS.highlightsDay} events={highlightsOfDay} maxEvents={12} />
        
        {/* Always show Highlights of the Week section */}
        <HorizontalEventSection title={TEXT.EVENTS.highlightsWeek} events={highlightsOfWeek} maxEvents={12} />
        
        {/* All Events section with filters */}
        <AllEventsSection events={allEvents} currentRegion={currentRegion} maxEvents={12} />
        
        <NewsletterSection />
        
        {/* Create an Event Section */}
        <section className="py-16 bg-volat-yellow">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-[36px] md:text-4xl font-headline text-black mb-3 md:mb-4 animate-fade-in">
              {TEXT.CREATE_EVENT.headline}
            </h2>
            <p className="text-lg font-greta mb-8 max-w-2xl mx-auto text-slate-950">
              {TEXT.CREATE_EVENT.subtitle}
            </p>
            <a href="/add" className="inline-flex items-center gap-2 border-2 border-black text-black hover:bg-black hover:text-white font-greta-bold px-6 py-2 rounded-md text-base transition-colors">
              <Plus className="h-5 w-5" />
              {TEXT.HARDCODED_ENGLISH.addEvent}
            </a>
          </div>
        </section>
      </main>

      <AddEventSuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} />
      
      <EditEventSuccessModal isOpen={showEditSuccessModal} onClose={handleCloseEditModal} />
    </div>;
};
export default Index;