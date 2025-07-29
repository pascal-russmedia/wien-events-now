import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Edit, CheckCircle, XCircle, Clock, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatEventDates, formatDescription, formatDate } from '@/utils/eventFormatters';
import { TEXT } from '@/constants/text';

interface EventsTableProps {
  events: Event[];
  selectedEvents: string[];
  onToggleEventSelection: (eventId: string) => void;
  onToggleAllSelection: (events: Event[]) => void;
  onRowClick: (eventId: string, e: React.MouseEvent) => void;
  onEdit: (eventId: string) => void;
  onStateChange: (eventId: string, newState: 'Pending' | 'Approved' | 'Rejected') => void;
}

export const EventsTable = ({ 
  events, 
  selectedEvents, 
  onToggleEventSelection, 
  onToggleAllSelection, 
  onRowClick, 
  onEdit, 
  onStateChange 
}: EventsTableProps) => {
  const allCurrentlySelected = events.length > 0 && events.every(event => selectedEvents.includes(event.id));

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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 p-2">
              <Checkbox
                checked={allCurrentlySelected}
                onCheckedChange={() => onToggleAllSelection(events)}
              />
            </TableHead>
            <TableHead className="w-52 p-2">{TEXT.HARDCODED_ENGLISH.eventName}</TableHead>
            <TableHead className="w-32 p-2">{TEXT.HARDCODED_ENGLISH.categoryTable}</TableHead>
            <TableHead className="w-32 p-2">{TEXT.HARDCODED_ENGLISH.locationTable}</TableHead>
            <TableHead className="w-36 p-2">{TEXT.HARDCODED_ENGLISH.eventDates}</TableHead>
            <TableHead className="w-24 p-2">{TEXT.HARDCODED_ENGLISH.state}</TableHead>
            <TableHead className="w-24 p-2">{TEXT.HARDCODED_ENGLISH.addedBy}</TableHead>
            <TableHead className="w-32 p-2">{TEXT.HARDCODED_ENGLISH.emailTable}</TableHead>
            <TableHead className="w-32 p-2">{TEXT.HARDCODED_ENGLISH.created}</TableHead>
            <TableHead className="w-20 p-2">{TEXT.HARDCODED_ENGLISH.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow 
              key={event.id}
              className={cn(
                "cursor-pointer hover:bg-muted/50 h-10",
                selectedEvents.includes(event.id) && "bg-muted/30"
              )}
              onClick={(e) => onRowClick(event.id, e)}
            >
              <TableCell onClick={(e) => e.stopPropagation()} className="p-2">
                <Checkbox
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => onToggleEventSelection(event.id)}
                />
              </TableCell>
              <TableCell className="p-2">
                <div className="w-52">
                  <div className="font-medium text-sm truncate">{event.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {formatDescription(event.description)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="p-2">
                <div className="w-32">
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="text-xs truncate max-w-full w-fit">{event.category}</Badge>
                    {event.subcategory && (
                      <Badge variant="outline" className="text-xs text-gray-500 truncate max-w-full w-fit">{event.subcategory}</Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="p-2">
                <div className="w-32 text-sm truncate">{event.subregion || event.region}</div>
              </TableCell>
              <TableCell className="p-2">
                <div className="w-36 text-sm">
                  {formatEventDates(event.dates)}
                </div>
              </TableCell>
              <TableCell className="p-2">
                <div className="w-24">{getStateBadge(event.state)}</div>
              </TableCell>
              <TableCell className="p-2">
                <div className="w-24">
                  <Badge variant={event.addedBy === 'Internal' ? 'default' : 'secondary'} className="text-xs">
                    {event.addedBy}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="p-2">
                <div className="w-32 text-sm truncate">{event.addedByEmail}</div>
              </TableCell>
              <TableCell className="p-2">
                <div className="w-32 text-sm">{formatDate(event.created)}</div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()} className="p-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(event.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      {TEXT.ACTIONS.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStateChange(event.id, 'Approved')}
                      disabled={event.state === 'Approved'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {TEXT.ACTIONS.setApproved}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStateChange(event.id, 'Rejected')}
                      disabled={event.state === 'Rejected'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {TEXT.ACTIONS.setRejected}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStateChange(event.id, 'Pending')}
                      disabled={event.state === 'Pending'}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {TEXT.ACTIONS.setPending}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};