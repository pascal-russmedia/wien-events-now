
import React, { useState } from 'react';
import InternalLayout from '@/components/auth/InternalLayout';
import { ExportFilters } from '@/components/export/ExportFilters';
import { ExportTable } from '@/components/export/ExportTable';
import { ExportForProductModal } from '@/components/export/ExportForProductModal';
import { useExportEvents } from '@/hooks/useExportEvents';
import { useToast } from '@/hooks/use-toast';
import { TEXT } from '@/constants/text';
import { SEO } from '@/components/SEO';

const InternalExport = () => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [region, setRegion] = useState('Vorarlberg');
  const [category, setCategory] = useState('all');
  const [subcategory, setSubcategory] = useState('all');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { events, loading, searchEvents, exportToCSV } = useExportEvents();
  const { toast } = useToast();

  const handleSearch = () => {
    if (!date || !category) {
      toast({
        title: TEXT.PAGES.internal.manage.missingFilters,
        description: TEXT.PAGES.internal.manage.selectDateCategory,
        variant: "destructive",
      });
      return;
    }

    setHasSearched(true);
    searchEvents({
      date,
      region: region === 'all' ? undefined : region,
      category: category === 'all' ? undefined : category,
      subcategory: subcategory === 'all' ? undefined : subcategory
    });
  };

  // Select all events when new search results come in
  React.useEffect(() => {
    if (events.length > 0) {
      setSelectedEvents(events.map(event => event.id));
    }
  }, [events]);

  const handleEventSelect = (eventId: string, selected: boolean) => {
    if (selected) {
      setSelectedEvents(prev => [...prev, eventId]);
    } else {
      setSelectedEvents(prev => prev.filter(id => id !== eventId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedEvents(events.map(event => event.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleDownloadCSV = () => {
    const selectedEventData = events.filter(event => selectedEvents.includes(event.id));
    exportToCSV(selectedEventData);
  };

  const handleExportForProduct = () => {
    if (selectedEvents.length === 0) {
      toast({
        title: TEXT.PAGES.internal.manage.noEventsSelected,
        description: TEXT.PAGES.internal.manage.selectAtLeastOne,
        variant: "destructive",
      });
      return;
    }
    setShowExportModal(true);
  };

  // Create date string for passing to table to avoid timezone issues
  const searchDateString = date ? (() => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })() : '';


  return (
    <>
      <SEO 
        title="Export | Wohin"
        description="Interne Export Tools"
        noIndex={true}
      />
      <InternalLayout title={TEXT.PAGES.internal.export.dataExport}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">{TEXT.PAGES.internal.export.eventExport}</h2>
            
            <ExportFilters
              date={date}
              setDate={setDate}
              region={region}
              setRegion={setRegion}
              category={category}
              setCategory={setCategory}
              subcategory={subcategory}
              setSubcategory={setSubcategory}
              onSearch={handleSearch}
              loading={loading}
            />

            {loading && (
              <div className="text-center py-8 mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">{TEXT.PAGES.internal.manage.searchingEvents}</p>
              </div>
            )}

            {!loading && events.length > 0 && (
              <div className="mt-6">
                <ExportTable
                  events={events}
                  selectedEvents={selectedEvents}
                  onEventSelect={handleEventSelect}
                  onSelectAll={handleSelectAll}
                  onDownloadCSV={handleDownloadCSV}
                  onExportForProduct={handleExportForProduct}
                  searchDateString={searchDateString}
                />
              </div>
            )}

            {!loading && events.length === 0 && hasSearched && (
              <div className="text-center py-8 mt-6">
                <p className="text-gray-500">{TEXT.PAGES.internal.manage.noEventsFound}</p>
              </div>
            )}
          </div>
        </div>

        <ExportForProductModal
          open={showExportModal}
          onOpenChange={setShowExportModal}
          events={events.filter(event => selectedEvents.includes(event.id))}
          searchDateString={searchDateString}
        />
      </div>
      </InternalLayout>
    </>
  );
};

export default InternalExport;
