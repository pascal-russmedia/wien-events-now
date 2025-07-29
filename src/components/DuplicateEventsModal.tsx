import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { SimilarEvent } from "@/hooks/useDuplicateDetection";

interface DuplicateEventsModalProps {
  open: boolean;
  onClose: () => void;
  similarEvents: SimilarEvent[];
}

export const DuplicateEventsModal = ({
  open,
  onClose,
  similarEvents
}: DuplicateEventsModalProps) => {
  const handleEventClick = (eventId: string) => {
    window.open(`/event/${eventId}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Hinweis: Ähnliches Event gefunden
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Wir haben ähnliche Events in der Datenbank gefunden. Bitte überprüfen Sie, 
            ob Ihr Event bereits existiert:
          </p>
          
          <div className="space-y-3">
            {similarEvents.map((event) => (
              <div
                key={`${event.id}-${event.event_date}`}
                className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleEventClick(event.id)}
              >
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground hover:text-primary">
                    {event.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.event_date), 'dd.MM.yyyy', { locale: de })}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.city}, {event.subregion || event.region}
                    </div>
                    
                    {event.host && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {event.host}
                      </div>
                    )}
                  </div>
                  
                  {event.address && (
                    <p className="text-sm text-muted-foreground">
                      {event.address}
                    </p>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Ähnlichkeit: {Math.round(event.similarity_score * 100)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Schließen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};