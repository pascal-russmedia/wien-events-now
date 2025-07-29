import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { CheckCircle, XCircle, Clock, CalendarDays, Users } from 'lucide-react';
import { TEXT } from '@/constants/text';

interface EventManagementControlsProps {
  showFutureEvents: boolean;
  setShowFutureEvents: (value: boolean) => void;
  addedByFilter: 'all' | 'Internal' | 'External';
  setAddedByFilter: (value: 'all' | 'Internal' | 'External') => void;
  selectedEvents: string[];
  totalEvents: number;
  filteredEventsCount: number;
  onBulkStateChange: (newState: 'Pending' | 'Approved' | 'Rejected') => void;
}

export const EventManagementControls = ({
  showFutureEvents,
  setShowFutureEvents,
  addedByFilter,
  setAddedByFilter,
  selectedEvents,
  totalEvents,
  filteredEventsCount,
  onBulkStateChange
}: EventManagementControlsProps) => {
  return (
    <>
      {/* Controls Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Event Management</h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-600" />
            <Select value={addedByFilter} onValueChange={(value) => setAddedByFilter(value as typeof addedByFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="External">External</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              {showFutureEvents ? 'Future Events' : 'Past Events'}
            </span>
            <Switch
              checked={showFutureEvents}
              onCheckedChange={setShowFutureEvents}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600 space-y-1">
          <p>Total events in database: {totalEvents}</p>
          <p>Filtered events: {filteredEventsCount}</p>
        </div>
        
        {/* Bulk Actions */}
        {selectedEvents.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{selectedEvents.length} selected</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {TEXT.HARDCODED_ENGLISH.bulkActions}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onBulkStateChange('Approved')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {TEXT.ACTIONS.setApproved}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStateChange('Rejected')}>
                  <XCircle className="w-4 h-4 mr-2" />
                  {TEXT.ACTIONS.setRejected}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onBulkStateChange('Pending')}>
                  <Clock className="w-4 h-4 mr-2" />
                  {TEXT.ACTIONS.setPending}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </>
  );
};