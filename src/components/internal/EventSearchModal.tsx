import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/utils/eventFormatters';
// Define a flexible search result type to handle database results
interface SearchResult {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  region: string;
  subregion?: string;
  host?: string;
  address?: string;
  state: string;
  popularity_score?: number;
  trust_score?: number;
  dates: any;
  image?: string;
  price_type: string;
  price_amount?: number;
  link?: string;
  featured: boolean;
  added_by: string;
  added_by_email: string;
  created_at: string;
  updated_at: string;
}
interface EventSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchFormData {
  title: string;
  email: string;
}

export const EventSearchModal = ({ isOpen, onClose }: EventSearchModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchData, setSearchData] = useState<SearchFormData>({ title: '', email: '' });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleInputChange = (field: keyof SearchFormData, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
  };

  const isSearchEnabled = searchData.title.trim().length > 0 || searchData.email.trim().length > 0;

  const handleSearch = async () => {
    if (!isSearchEnabled) return;

    setLoading(true);
    setHasSearched(true);

    try {
      let query = supabase.from('events').select('*');

      // Build search conditions with AND logic when both fields are provided
      if (searchData.title.trim() && searchData.email.trim()) {
        // Both fields provided - use AND logic
        query = query
          .ilike('name', `%${searchData.title.trim()}%`)
          .ilike('added_by_email', `%${searchData.email.trim()}%`);
      } else if (searchData.title.trim()) {
        // Only title provided
        query = query.ilike('name', `%${searchData.title.trim()}%`);
      } else if (searchData.email.trim()) {
        // Only email provided
        query = query.ilike('added_by_email', `%${searchData.email.trim()}%`);
      }

      // Order by newest first and limit results to 200
      query = query.order('created_at', { ascending: false }).limit(200);

      const { data, error } = await query;

      if (error) throw error;

      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching events:', error);
      toast({
        title: "Fehler",
        description: "Fehler beim Suchen der Events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (eventId: string) => {
    navigate(`/internal/manage/edit/${eventId}`);
    onClose();
  };

  const resetForm = () => {
    setSearchData({ title: '', email: '' });
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getStateVariant = (state: string) => {
    switch (state) {
      case 'Pending':
        return 'outline';
      case 'Approved':
        return 'default';
      case 'Rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getFirstEventDate = (dates: any) => {
    if (!dates || !Array.isArray(dates) || dates.length === 0) return '-';
    const firstDate = dates[0];
    if (firstDate && firstDate.date) {
      return formatDate(new Date(firstDate.date));
    }
    return '-';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Event Suche</DialogTitle>
          <DialogDescription>
            Suchen Sie nach Events anhand von Titel oder E-Mail-Adresse. Mindestens ein Feld muss ausgefüllt werden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={searchData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Event-Titel eingeben..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Von (E-Mail)</Label>
              <Input
                id="email"
                value={searchData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="E-Mail-Adresse eingeben..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              disabled={!isSearchEnabled || loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Suchen
            </Button>
            {hasSearched && (
              <Button variant="outline" onClick={resetForm}>
                Zurücksetzen
              </Button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="flex-1 overflow-hidden flex flex-col mt-4">
            <div className="mb-2">
              <span className="text-sm text-muted-foreground">
                {searchResults.length} Events gefunden
              </span>
            </div>
            
            <div className="flex-1 overflow-auto border rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Von</TableHead>
                    <TableHead>Region</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Keine Events gefunden
                      </TableCell>
                    </TableRow>
                  ) : (
                    searchResults.map((event) => (
                      <TableRow
                        key={event.id}
                        onClick={() => handleResultClick(event.id)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {event.name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {event.category}
                          {event.subcategory && (
                            <div className="text-muted-foreground">{event.subcategory}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {getFirstEventDate(event.dates)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStateVariant(event.state)}>
                            {event.state}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[150px] truncate">
                          {event.added_by_email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {event.region}
                          {event.subregion && event.subregion !== event.region && (
                            <div className="text-muted-foreground">{event.subregion}</div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};