import { Event as CustomEvent } from '@/types/event';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { EventsTable } from './EventsTable';
import { EventsPagination } from './EventsPagination';
import { TEXT } from '@/constants/text';

type TabState = 'pending' | 'approved' | 'rejected' | 'all';

interface EventsTabContentProps {
  activeTab: TabState;
  events: CustomEvent[];
  selectedEvents: string[];
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
  onToggleEventSelection: (eventId: string) => void;
  onToggleAllSelection: (events: CustomEvent[]) => void;
  onRowClick: (eventId: string, e: React.MouseEvent) => void;
  onEdit: (eventId: string) => void;
  onStateChange: (eventId: string, newState: 'Pending' | 'Approved' | 'Rejected') => Promise<void>;
  onPageChange: (page: number) => void;
}

export const EventsTabContent = ({
  activeTab,
  events,
  selectedEvents,
  pagination,
  onToggleEventSelection,
  onToggleAllSelection,
  onRowClick,
  onEdit,
  onStateChange,
  onPageChange
}: EventsTabContentProps) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg bg-gray-50">
        <div className="max-w-md mx-auto">
          {activeTab === 'pending' && (
            <>
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{TEXT.HARDCODED_ENGLISH.noPendingEvents}</h3>
              <p className="text-gray-500">{TEXT.HARDCODED_ENGLISH.noEventsWaitingForApproval}</p>
            </>
          )}
          {activeTab === 'approved' && (
            <>
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{TEXT.HARDCODED_ENGLISH.noApprovedEvents}</h3>
              <p className="text-gray-500">{TEXT.HARDCODED_ENGLISH.noApprovedEventsToDisplay}</p>
            </>
          )}
          {activeTab === 'rejected' && (
            <>
              <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{TEXT.HARDCODED_ENGLISH.noRejectedEvents}</h3>
              <p className="text-gray-500">{TEXT.HARDCODED_ENGLISH.noRejectedEventsToDisplay}</p>
            </>
          )}
          {activeTab === 'all' && (
            <>
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{TEXT.EVENTS.noEvents}</h3>
              <p className="text-gray-500">{TEXT.EVENTS.noEventsInSystem}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <EventsTable 
        events={events}
        selectedEvents={selectedEvents}
        onToggleEventSelection={onToggleEventSelection}
        onToggleAllSelection={onToggleAllSelection}
        onRowClick={onRowClick}
        onEdit={onEdit}
        onStateChange={onStateChange}
      />
      <EventsPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        itemsPerPage={100}
        onPageChange={onPageChange}
      />
    </>
  );
};