import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { AddPageHeader } from '@/components/header/AddPageHeader';
import EditEventForm from '@/components/EditEventForm';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TEXT } from '@/constants/text';
import { SEO } from '@/components/SEO';

const EditEvent = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();
  
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyAndLoadEvent = async () => {
      if (!id || !email) {
        toast({
          title: "Invalid Link",
          description: "The edit link is invalid or incomplete.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const { data: eventData, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Database error:', error);
          toast({
            title: "Error",
            description: "Failed to load event details.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (!eventData) {
          toast({
            title: TEXT.PAGES.event.notFound,
            description: TEXT.MESSAGES.eventDoesNotExist,
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Check if email matches
        if (eventData.added_by_email.toLowerCase() !== email.toLowerCase()) {
          toast({
            title: "Access Denied",
            description: "You are not authorized to edit this event.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Allow editing for Pending and Approved events only
        if (!['Pending', 'Approved'].includes(eventData.state)) {
          toast({
            title: "Cannot Edit",
            description: "This event is no longer editable.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Transform the data to match our Event interface
        const transformedEvent: Event = {
          id: eventData.id,
          name: eventData.name,
          category: eventData.category as Event['category'],
          description: eventData.description,
          region: eventData.region,
          subregion: eventData.subregion,
          city: eventData.city,
          host: eventData.host,
          address: eventData.address,
          state: eventData.state as Event['state'],
          popularityScore: eventData.popularity_score,
          trustScore: eventData.trust_score,
          dates: Array.isArray(eventData.dates) ? eventData.dates.map((date: any) => ({
            date: new Date(date.date),
            startTime: date.startTime,
            endTime: date.endTime
          })) : [{ date: new Date(), startTime: '', endTime: '' }],
          image: eventData.image,
          price: {
            type: eventData.price_type === 'free' ? 'Free' : 'Cost' as 'Free' | 'Cost',
            amount: eventData.price_amount || undefined
          },
          link: eventData.link,
          ticketLink: eventData.ticket_link,
          featured: eventData.featured,
          addedBy: eventData.added_by as Event['addedBy'],
          addedByEmail: eventData.added_by_email,
          created: new Date(eventData.created_at),
          updated: new Date(eventData.updated_at)
        };

        setEvent(transformedEvent);
        setVerified(true);
      } catch (error) {
        console.error('Error loading event:', error);
        toast({
          title: "Error",
          description: TEXT.MESSAGES.failedToLoadEvent,
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoadEvent();
  }, [id, email, navigate, toast]);

  const handleUpdateSuccess = () => {
    // Navigate to home with edit success parameter instead of showing toast
    navigate('/?showEditSuccess=true');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AddPageHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!verified || !event) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Event bearbeiten | Wohin"
        description="Bearbeite dein Event"
        noIndex={true}
      />
      <AddPageHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-headline text-black mb-4">
              {TEXT.PAGES.internal.manage.editYourEvent}
            </h1>
            <p className="text-lg font-greta text-gray-600 mb-4">
              {TEXT.PAGES.internal.manage.makeChanges}
            </p>
            <div className="flex justify-center">
              {getStateBadge(event.state)}
            </div>
          </div>
          
          <EditEventForm 
            initialData={event}
            onSuccess={handleUpdateSuccess}
          />
        </div>
      </main>
    </div>
  );
};

export default EditEvent;