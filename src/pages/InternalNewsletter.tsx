
import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import InternalLayout from '@/components/auth/InternalLayout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, Copy, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types/event';
import { TEXT } from '@/constants/text';

interface NewsletterConfig {
  startDate: string;
  endDate: string;
  region: string;
  fridayCount: number;
  saturdayCount: number;
  sundayCount: number;
  template: 'standard' | 'compact' | 'detailed';
}

const InternalNewsletter = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<NewsletterConfig>({
    startDate: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), // Friday
    endDate: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'yyyy-MM-dd'), // Sunday
    region: 'Vorarlberg',
    fridayCount: 2,
    saturdayCount: 2,
    sundayCount: 1,
    template: 'standard'
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [htmlContent, setHtmlContent] = useState<string>('');

  const generateNewsletter = async () => {
    try {
      setLoading(true);
      
      // Fetch events for the date range
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('state', 'Approved')
        .gte('dates->0->>date', config.startDate)
        .lte('dates->0->>date', config.endDate)
        .eq('region', config.region)
        .order('popularity_score', { ascending: false });

      if (error) throw error;

      // Transform and group events by date
      const transformedEvents = data?.map(event => ({
        id: event.id,
        name: event.name,
        category: event.category as Event['category'],
        subcategory: event.subcategory || undefined,
        description: event.description,
        region: event.region,
        subregion: event.subregion,
        host: event.host,
        address: event.address,
        state: event.state as Event['state'],
        popularityScore: event.popularity_score,
        trustScore: event.trust_score,
        dates: Array.isArray(event.dates) ? event.dates.map((date: any) => ({
          date: new Date(date.date),
          startTime: date.startTime,
          endTime: date.endTime
        })) : [{ date: new Date(), startTime: '', endTime: '' }],
        image: event.image,
        price: {
          type: event.price_type === 'free' ? 'Free' : 'Cost' as 'Free' | 'Cost',
          amount: event.price_amount || undefined
        },
        link: event.link,
        featured: event.featured,
        addedBy: event.added_by as Event['addedBy'],
        addedByEmail: event.added_by_email,
        created: new Date(event.created_at),
        updated: new Date(event.updated_at)
      })) || [];

      // Group events by day and select top events
      const eventsByDay = groupEventsByDay(transformedEvents);
      const selectedEvents = selectTopEvents(eventsByDay);
      
      setEvents(selectedEvents);
      setHtmlContent(generateHtmlContent(selectedEvents));
      
    } catch (error) {
      console.error('Error generating newsletter:', error);
      toast({
        title: "Error",
        description: "Failed to generate newsletter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByDay = (events: Event[]) => {
    const friday = format(new Date(config.startDate), 'yyyy-MM-dd');
    const saturday = format(addDays(new Date(config.startDate), 1), 'yyyy-MM-dd');
    const sunday = format(addDays(new Date(config.startDate), 2), 'yyyy-MM-dd');

    return {
      friday: events.filter(event => 
        event.dates.some(date => format(date.date, 'yyyy-MM-dd') === friday)
      ),
      saturday: events.filter(event => 
        event.dates.some(date => format(date.date, 'yyyy-MM-dd') === saturday)
      ),
      sunday: events.filter(event => 
        event.dates.some(date => format(date.date, 'yyyy-MM-dd') === sunday)
      )
    };
  };

  const selectTopEvents = (eventsByDay: any) => {
    const usedEventIds = new Set<string>();
    const selectedEvents: Event[] = [];

    // Helper function to add unique events
    const addUniqueEvents = (dayEvents: Event[], count: number) => {
      const availableEvents = dayEvents.filter(event => !usedEventIds.has(event.id));
      const eventsToAdd = availableEvents.slice(0, count);
      eventsToAdd.forEach(event => {
        usedEventIds.add(event.id);
        selectedEvents.push(event);
      });
    };

    // Select events in priority order
    addUniqueEvents(eventsByDay.friday, config.fridayCount);
    addUniqueEvents(eventsByDay.saturday, config.saturdayCount);
    addUniqueEvents(eventsByDay.sunday, config.sundayCount);

    return selectedEvents;
  };

  const generateHtmlContent = (events: Event[]) => {
    return `
            ${events.map(event => `
                <div style="margin-bottom: 25px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; background: white;">
                    ${event.image ? `<img src="${event.image}" alt="${event.name}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
                    <div style="padding: 20px;">
                        <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 10px 0; color: #333;">${event.name}</h2>
                        <div style="color: #666; font-size: 14px; margin-bottom: 10px;">
                            📅 ${format(event.dates[0].date, 'EEEE, dd.MM.yyyy', { locale: de })}
                            ${event.dates[0].startTime ? ` • 🕐 ${event.dates[0].startTime}` : ''}
                            ${event.address ? ` • 📍 ${event.address}` : ` • 📍 ${event.region}${event.subregion ? `, ${event.subregion}` : ''}`}
                        </div>
                        <p style="color: #555; line-height: 1.5; margin-bottom: 15px;">${event.description.substring(0, 150)}${event.description.length > 150 ? '...' : ''}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #666;">${event.category}</span>
                            <span style="color: ${event.price.type === 'Free' ? '#28a745' : '#007bff'}; font-weight: bold;">
                                ${event.price.type === 'Free' ? 'Kostenlos' : event.price.amount ? `€${event.price.amount}` : 'Kostenpflichtig'}
                            </span>
                        </div>
                    </div>
                </div>
            `).join('')}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(htmlContent);
    toast({
      title: "Success",
      description: TEXT.NEWSLETTER.generator.copiedToClipboard,
    });
  };

  const downloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wohin-newsletter-${format(new Date(), 'yyyy-MM-dd')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: TEXT.NEWSLETTER.generator.downloadSuccess,
    });
  };

  useEffect(() => {
    generateNewsletter();
  }, []);

  return (
    <>
      <SEO 
        title="Newsletter | Wohin"
        description="Interner Newsletter Generator"
        noIndex={true}
      />
      <InternalLayout title={TEXT.NEWSLETTER.generator.title}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-semibold">{TEXT.NEWSLETTER.generator.title}</h2>
            </div>
            <p className="text-gray-600 mb-6">{TEXT.NEWSLETTER.generator.description}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>{TEXT.NEWSLETTER.generator.configuration}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">{TEXT.NEWSLETTER.generator.friday}</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={config.startDate}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          startDate: e.target.value,
                          endDate: format(addDays(new Date(e.target.value), 2), 'yyyy-MM-dd')
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">{TEXT.NEWSLETTER.generator.sunday}</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={config.endDate}
                        onChange={(e) => setConfig(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{TEXT.NEWSLETTER.generator.region}</Label>
                    <Select value={config.region} onValueChange={(value) => setConfig(prev => ({ ...prev, region: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vorarlberg">Vorarlberg</SelectItem>
                        <SelectItem value="Deutschland">Deutschland</SelectItem>
                        <SelectItem value="Schweiz">Schweiz</SelectItem>
                        <SelectItem value="Wien">Wien</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>{TEXT.NEWSLETTER.generator.eventsPerDay}</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <Label htmlFor="friday" className="text-sm">{TEXT.NEWSLETTER.generator.friday}</Label>
                        <Input
                          id="friday"
                          type="number"
                          min="0"
                          max="5"
                          value={config.fridayCount}
                          onChange={(e) => setConfig(prev => ({ ...prev, fridayCount: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="saturday" className="text-sm">{TEXT.NEWSLETTER.generator.saturday}</Label>
                        <Input
                          id="saturday"
                          type="number"
                          min="0"
                          max="5"
                          value={config.saturdayCount}
                          onChange={(e) => setConfig(prev => ({ ...prev, saturdayCount: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="sunday" className="text-sm">{TEXT.NEWSLETTER.generator.sunday}</Label>
                        <Input
                          id="sunday"
                          type="number"
                          min="0"
                          max="5"
                          value={config.sundayCount}
                          onChange={(e) => setConfig(prev => ({ ...prev, sundayCount: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button 
                      onClick={generateNewsletter}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {TEXT.NEWSLETTER.generator.loading}
                        </>
                      ) : (
                        TEXT.NEWSLETTER.generator.generateNewsletter
                      )}
                    </Button>
                  </div>

                  {htmlContent && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={copyToClipboard}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        {TEXT.NEWSLETTER.generator.copyToClipboard}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={downloadHtml}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {TEXT.NEWSLETTER.generator.downloadHtml}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>{TEXT.NEWSLETTER.generator.preview}</CardTitle>
                </CardHeader>
                <CardContent>
                  {htmlContent ? (
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={htmlContent}
                        className="w-full h-[600px]"
                        title="Newsletter Preview"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {TEXT.NEWSLETTER.generator.generateNewsletter}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
      </InternalLayout>
    </>
  );
};

export default InternalNewsletter;
