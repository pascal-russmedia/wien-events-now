import { Event } from '@/types/event';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Package } from 'lucide-react';
import { formatDescription } from '@/utils/eventFormatters';
import { TEXT } from '@/constants/text';

interface ExportTableProps {
  events: Event[];
  selectedEvents: string[];
  onEventSelect: (eventId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDownloadCSV: () => void;
  onExportForProduct: () => void;
  searchDateString: string;
}

export const ExportTable = ({ events, selectedEvents, onEventSelect, onSelectAll, onDownloadCSV, onExportForProduct, searchDateString }: ExportTableProps) => {
  const allSelected = selectedEvents.length === events.length;
  const someSelected = selectedEvents.length > 0;
  return (
    <div className="space-y-4">
      {/* Export Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedEvents.length} of {events.length} events selected
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onDownloadCSV} 
            disabled={selectedEvents.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {TEXT.HARDCODED_ENGLISH.downloadAsCsv}
          </Button>
          <Button onClick={onExportForProduct} disabled={selectedEvents.length === 0} className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            {TEXT.HARDCODED_ENGLISH.exportForProduct}
          </Button>
        </div>
      </div>

      {/* Compact Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all events"
                />
              </TableHead>
              <TableHead>{TEXT.EXPORT.table.event}</TableHead>
              <TableHead>{TEXT.EXPORT.table.category}</TableHead>
              <TableHead>{TEXT.EXPORT.table.location}</TableHead>
              <TableHead>{TEXT.EXPORT.table.date}</TableHead>
              <TableHead>{TEXT.EXPORT.table.price}</TableHead>
              <TableHead>{TEXT.EXPORT.table.popularityScore}</TableHead>
              <TableHead>{TEXT.EXPORT.table.host}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const isSelected = selectedEvents.includes(event.id);
              return (
              <TableRow 
                key={event.id} 
                className="h-16 cursor-pointer hover:bg-muted/50" 
                onClick={() => window.open(`/event/${event.id}`, '_blank')}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onEventSelect(event.id, checked as boolean)}
                    aria-label={`Select ${event.name}`}
                  />
                </TableCell>
                <TableCell className="max-w-xs">
                  <div>
                    <div className="font-medium text-sm truncate">{event.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {formatDescription(event.description)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="text-xs truncate max-w-full w-fit">{event.category}</Badge>
                    {event.subcategory && (
                      <Badge variant="outline" className="text-xs text-gray-500 truncate max-w-full w-fit">{event.subcategory}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{event.subregion || event.region}</div>
                  {event.address && (
                    <div className="text-xs text-muted-foreground truncate max-w-32">
                      {event.address}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {(() => {
                    // Find the date that matches the search date
                    const matchingDate = event.dates.find(dateItem => {
                      const eventDateString = dateItem.date.toISOString().split('T')[0];
                      return eventDateString === searchDateString;
                    });
                    
                    const dateToShow = matchingDate || event.dates[0];
                    
                    return (
                      <div>
                        <div className="font-medium">
                          {dateToShow?.date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        {(dateToShow?.startTime || dateToShow?.endTime) && (
                          <div className="text-xs">
                            {dateToShow.startTime && dateToShow.endTime 
                              ? `${dateToShow.startTime} - ${dateToShow.endTime}`
                              : dateToShow.startTime || dateToShow.endTime
                            }
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </TableCell>
                <TableCell className="text-sm">
                  <Badge variant={event.price.type === 'Free' ? 'secondary' : 'outline'} className="text-xs">
                    {event.price.type === 'Free' ? 'Free' : `€${event.price.amount}`}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium">
                  {event.popularityScore || 0}
                </TableCell>
                <TableCell className="text-sm">
                  {event.host || '-'}
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};