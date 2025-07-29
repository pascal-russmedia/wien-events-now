import { useNavigate } from 'react-router-dom';
import InternalLayout from '@/components/auth/InternalLayout';
import { SEO } from '@/components/SEO';
import { useInternalEventsGrouped } from '@/hooks/useInternalEventsGrouped';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle, XCircle, CalendarDays, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BulkActions } from '@/components/internal/BulkActions';
import { EventsTabContent } from '@/components/internal/EventsTabContent';
import { EventSearchModal } from '@/components/internal/EventSearchModal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Event as CustomEvent } from '@/types/event';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TEXT } from '@/constants/text';

type TabState = 'pending' | 'approved' | 'rejected' | 'all';

const InternalManage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, loading, fetchEvents } = useInternalEventsGrouped();
  const [activeTab, setActiveTab] = useState<TabState>('pending');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showFutureEvents, setShowFutureEvents] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Get current events and counts based on future/past filter and tab
  const currentEvents = showFutureEvents ? data.futureEvents : data.pastEvents;
  const currentCounts = showFutureEvents ? data.counts.future : data.counts.past;
  
  // Filter events by active tab - events are already filtered by the database function
  const filteredEvents = currentEvents;

  // Use real pagination data
  const pagination = data.pagination;


  // Initial fetch
  useEffect(() => {
    fetchEvents(showFutureEvents, activeTab, currentPage);
  }, [fetchEvents, showFutureEvents, activeTab, currentPage]);

  const handleTabChange = (tab: TabState) => {
    setActiveTab(tab);
    setSelectedEvents([]);
    setCurrentPage(1);
  };

  // Handle pagination changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedEvents([]);
  };

  // Handle future/past filter change
  const handleFutureEventsChange = (checked: boolean) => {
    setShowFutureEvents(checked);
    setSelectedEvents([]);
    setCurrentPage(1);
    fetchEvents(checked, activeTab, 1);
  };

  const handleStateChange = async (eventId: string, newState: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      // Find the event to get its details for notification
      const currentEvents = [...data.futureEvents, ...data.pastEvents];
      const eventToUpdate = currentEvents.find(event => event.id === eventId);
      
      const { error } = await supabase
        .from('events')
        .update({ 
          state: newState,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (error) throw error;

      // Send status notification email for external events when moving to Approved/Rejected
      if (eventToUpdate && eventToUpdate.addedBy === 'External' && 
          (newState === 'Approved' || newState === 'Rejected')) {
        try {
          console.log('Sending status notification email for external event');
          await supabase.functions.invoke('send-event-status-notification', {
            body: {
              eventId: eventId,
              eventName: eventToUpdate.name,
              email: eventToUpdate.addedByEmail,
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

      // Refresh the data
      await fetchEvents(showFutureEvents, activeTab, currentPage);
    } catch (error: any) {
      console.error('Error updating event state:', error);
      toast({
        title: "Error",
        description: "Failed to update event state",
        variant: "destructive",
      });
    }
  };

  const handleBulkStateChange = async (newState: 'Pending' | 'Approved' | 'Rejected') => {
    let allSuccessful = true;
    const currentEvents = [...data.futureEvents, ...data.pastEvents];
    
    for (const eventId of selectedEvents) {
      try {
        const eventToUpdate = currentEvents.find(event => event.id === eventId);
        
        const { error } = await supabase
          .from('events')
          .update({ 
            state: newState,
            updated_at: new Date().toISOString()
          })
          .eq('id', eventId);

        if (error) throw error;

        // Send status notification email for external events when moving to Approved/Rejected
        if (eventToUpdate && eventToUpdate.addedBy === 'External' && 
            (newState === 'Approved' || newState === 'Rejected')) {
          try {
            console.log('Sending status notification email for external event');
            await supabase.functions.invoke('send-event-status-notification', {
              body: {
                eventId: eventId,
                eventName: eventToUpdate.name,
                email: eventToUpdate.addedByEmail,
                status: newState
              }
            });
          } catch (emailError) {
            console.error('Failed to send status notification email:', emailError);
            // Don't fail the entire operation if email fails
          }
        }
      } catch (error: any) {
        console.error('Error updating event state:', error);
        allSuccessful = false;
      }
    }
    
    setSelectedEvents([]);
    
    if (allSuccessful) {
      toast({
        title: "Success",
        description: `Events ${newState.toLowerCase()} successfully`,
      });
      // Only refresh if all state changes were successful
      await fetchEvents(showFutureEvents, activeTab, currentPage);
    } else {
      toast({
        title: "Error",
        description: "Some events failed to update",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (eventId: string) => {
    navigate(`/internal/manage/edit/${eventId}`);
  };

  const handleRowClick = (eventId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on checkbox or action buttons
    if ((e.target as HTMLElement).closest('input, button, [role="button"]')) {
      return;
    }
    handleEdit(eventId);
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const toggleAllSelection = (events: CustomEvent[]) => {
    const eventIds = events.map(e => e.id);
    const allSelected = eventIds.every(id => selectedEvents.includes(id));
    
    if (allSelected) {
      setSelectedEvents(prev => prev.filter(id => !eventIds.includes(id)));
    } else {
      setSelectedEvents(prev => [...prev, ...eventIds.filter(id => !prev.includes(id))]);
    }
  };

  return (
    <>
      <SEO 
        title="Event Management | Wohin"
        description="Interne Event Management Tools"
        noIndex={true}
      />
      <InternalLayout title={TEXT.PAGES.internal.manage.eventManagement}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {/* Future/Past Filter */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">{TEXT.PAGES.internal.manage.eventManagement}</h2>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSearchModal(true)}
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Suche
                </Button>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    {showFutureEvents ? TEXT.PAGES.internal.manage.futureEvents : TEXT.PAGES.internal.manage.pastEvents}
                  </span>
                  <Switch
                    checked={showFutureEvents}
                    onCheckedChange={handleFutureEventsChange}
                  />
                </div>
              </div>
            </div>

            <BulkActions 
              selectedEvents={selectedEvents}
              onBulkStateChange={handleBulkStateChange}
            />

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">{TEXT.PAGES.internal.manage.loadingEvents}</p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TabState)} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {TEXT.PAGES.internal.manage.pending} ({currentCounts.pending})
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {TEXT.PAGES.internal.manage.approved} ({currentCounts.approved})
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    {TEXT.PAGES.internal.manage.rejected} ({currentCounts.rejected})
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {TEXT.PAGES.internal.manage.all} ({currentCounts.total})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <EventsTabContent
                    activeTab={activeTab}
                    events={filteredEvents}
                    selectedEvents={selectedEvents}
                    pagination={pagination}
                    onToggleEventSelection={toggleEventSelection}
                    onToggleAllSelection={toggleAllSelection}
                    onRowClick={handleRowClick}
                    onEdit={handleEdit}
                    onStateChange={handleStateChange}
                    onPageChange={handlePageChange}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
      
      <EventSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
      </InternalLayout>
    </>
  );
};

export default InternalManage;