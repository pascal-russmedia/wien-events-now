import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Loader2 } from 'lucide-react';
import { Event } from '@/types/event';
import { useToast } from '@/hooks/use-toast';
import { TEXT } from '@/constants/text';
import { supabase } from '@/integrations/supabase/client';
interface ExportForProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  events: Event[];
  searchDateString: string;
}
const PRODUCTS = [{
  value: 'VN',
  label: 'VN'
}, {
  value: 'NEUE',
  label: 'NEUE'
}];
export const ExportForProductModal = ({
  open,
  onOpenChange,
  events,
  searchDateString
}: ExportForProductModalProps) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [smartExportEnabled, setSmartExportEnabled] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const {
    toast
  } = useToast();
  const handleExport = async () => {
    if (!selectedProduct) {
      toast({
        title: TEXT.VALIDATION_MESSAGES.missingSelection,
        description: TEXT.VALIDATION_MESSAGES.pleaseSelectProduct,
        variant: "destructive"
      });
      return;
    }
    setIsProcessing(true);
    try {
      let processedEvents = events;

      // If Smart Export is enabled for VN product, summarize descriptions
      if (selectedProduct === 'VN' && smartExportEnabled) {
        toast({
          title: "Processing descriptions...",
          description: "Using AI to summarize event descriptions. This may take a moment."
        });
        const descriptions = events.map(event => event.description);
        const {
          data,
          error
        } = await supabase.functions.invoke('openai-summarize-descriptions', {
          body: {
            descriptions
          }
        });
        if (error) {
          console.error('Error summarizing descriptions:', error);
          toast({
            title: "Warning",
            description: "AI summarization failed. Using original descriptions.",
            variant: "destructive"
          });
        } else {
          // Replace descriptions with summarized versions
          processedEvents = events.map((event, index) => ({
            ...event,
            description: data.summarizedDescriptions[index] || event.description
          }));
          toast({
            title: "Descriptions summarized",
            description: "AI has optimized the event descriptions."
          });
        }
      }

      // Generate Tagged Text content with Windows CRLF line endings
      const taggedTextContent = generateTaggedText(processedEvents, selectedProduct, searchDateString);

      // Create UTF-16 LE encoded buffer without BOM
      const buffer = new ArrayBuffer(taggedTextContent.length * 2);
      const view = new DataView(buffer);
      for (let i = 0; i < taggedTextContent.length; i++) {
        const charCode = taggedTextContent.charCodeAt(i);
        // Write as little-endian UTF-16 (no BOM)
        view.setUint16(i * 2, charCode, true); // true = little-endian
      }

      // Create and download Tagged Text file with UTF-16 LE encoding (without BOM)
      const blob = new Blob([buffer], {
        type: 'text/plain; charset=utf-16le'
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedProduct}_events_${searchDateString}.txt`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: TEXT.EXPORT.success,
        description: TEXT.EXPORT.successDescription.replace('{product}', selectedProduct).replace('{count}', events.length.toString())
      });

      // Reset form and close modal
      setSelectedProduct('');
      setSmartExportEnabled(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "An error occurred during export. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const generateTaggedText = (events: Event[], product: string, dateString: string) => {
    // Generate product-specific header with different color schemes
    // Using Windows CRLF line endings (\r\n) for proper InDesign compatibility
    const colorName = product === 'VN' ? 'VN-Turquoise-real' : 'NEUE-Color';
    const colorCMYK = product === 'VN' ? '0.6,0,0.3,0' : '0,1,1,0.17';

    // Different 1VeranstKopf styles for VN vs NEUE
    const veranstKopfStyle = product === 'VN' ? `<dps:1VeranstKopf=<Nextstyle:1VeranstKopf><cc:Paper><ct:Black><cs:8.000000><clig:0><ccase:All Caps><pfli:2.834645><cl:9.000000><clang:German\\: Reformed><psb:1.672440><psa:7.313385><cu:1><cf:AntennaCond><pmaws:2.500000><pmiws:0.500000><prac:${colorName}><pras:12.000000><prao:-2.834646><prbc:${colorName}><prbs:8.503937><praon:1><pragc:None><prbgc:None><cuc:${colorName}><cugc:None><cuoff:-1.000000><cut:100.000000><cuwoff:8.000000><cstrikegc:None><pwa:Left><ruotpg:0><cres:0>>` : `<dps:1VeranstKopf=<Nextstyle:1VeranstKopf><ct:Ultra><cc:${colorName}><cu:1><cuc:${colorName}><cuwoff:0><cut:100.000000><cs:10.000000><clig:0><ccase:All Caps><pfli:0><cl:11.000000><clang:German\\: Reformed><psb:1.5><psa:1><cf:Kleine Sans Ultra><pmaws:2.500000><pmiws:0.500000><prac:None><pras:12.000000><prbo:1><prbc:${colorName}><prbs:1.000000><prbon:1><praon:0><pragc:None><prbgc:None><cugc:None><cstrikegc:None><pwa:Left><ruotpg:0><cres:0>>`;
    // Different styles for VN vs NEUE
    const veranstaltungenStyle = product === 'VN' ? `<dps:1Veranstaltungen=<Nextstyle:1Veranstaltungen><ct:Regular><cs:8.000000><clig:0><pli:5.669291><pfli:-5.669292><cl:9.000000><clang:German\\: Reformed><psa:2.834645><cf:AntennaCond><pmaws:2.500000><pmiws:0.500000><pragc:None><prbgc:None><cugc:None><cstrikegc:None><pwa:Left><ruotpg:0><cres:0>>` : `<dps:1Veranstaltungen=<Nextstyle:1Veranstaltungen><ct:Regular><cs:8.000000><clig:0><pli:5.669291><pfli:-5.669292><cl:9.000000><clang:German\\: Reformed><psa:2.834645><cf:Gotham><pmaws:2.500000><pmiws:0.500000><pragc:None><prbgc:None><cugc:None><cstrikegc:None><pwa:Left><ruotpg:0><cres:0>>`;
    const ortStyle = product === 'NEUE' ? `<dps:Ort=<Nextstyle:Ort><ct:Regular><cs:8.000000><clig:0><pli:5.669291><pfli:-5.669292><cl:9.000000><clang:German\\: Reformed><psa:2.834645><cf:Gotham><pmaws:2.500000><pmiws:0.500000><pragc:None><prbgc:None><cugc:None><cstrikegc:None><pwa:Left><ruotpg:0><cres:0>>` : '';
    const header = `<UNICODE-WIN>\r\n<vsn:5><fset:InDesign-Roman><ctable:=<Paper:COLOR:CMYK:Process:0,0,0,0><${colorName}:COLOR:CMYK:Process:${colorCMYK}><Black:COLOR:CMYK:Process:0,0,0,1>>\r\n${veranstKopfStyle}\r\n${veranstaltungenStyle}\r\n${ortStyle ? ortStyle + '\r\n' : ''}`;

    // Group events by subcategory, falling back to main category if no subcategory exists
    const eventsBySubcategory = events.reduce((acc, event) => {
      const subcategory = event.subcategory || event.category;
      if (!acc[subcategory]) {
        acc[subcategory] = [];
      }
      acc[subcategory].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    // Generate content for each subcategory
    const content = Object.entries(eventsBySubcategory).map(([subcategory, subcategoryEvents]) => {
      const categoryHeader = `<pstyle:1VeranstKopf>${subcategory}\r\n`;
      let eventsContent = '';
      if (product === 'NEUE') {
        // For NEUE: Group by city within each subcategory
        const eventsByCity = subcategoryEvents.reduce((acc, event) => {
          const city = event.city || event.subregion || event.region || 'Andere';
          if (!acc[city]) {
            acc[city] = [];
          }
          acc[city].push(event);
          return acc;
        }, {} as Record<string, Event[]>);
        eventsContent = Object.entries(eventsByCity).map(([city, cityEvents]) => {
          // City header for NEUE (only show if not 'Vorarlberg' and different from subcategory)
          const cityHeader = city !== 'Vorarlberg' && city !== subcategory ? `<pstyle:Ort>${city}\r\n` : '';
          const cityEventsContent = cityEvents.map(event => {
            // Find the matching date for this search
            const matchingDate = event.dates.find(dateItem => {
              const eventDateString = dateItem.date.toISOString().split('T')[0];
              return eventDateString === dateString;
            }) || event.dates[0];

            // Format time for NEUE
            let timeString = '';
            if (matchingDate?.startTime) {
              // Remove :00 for full hours (e.g., 20:00 becomes 20)
              const formattedTime = matchingDate.startTime.replace(':00', '');
              timeString = `${formattedTime} ${TEXT.EXPORT.timeFormats.hour}`;
            }

            // For NEUE: host, title, time (comma separated, period at end) - no location field
            const hostPrefix = event.host ? `${event.host}, ` : '';
            const parts = [`<pstyle:1Veranstaltungen>${hostPrefix}<ct:Bold>${event.name}<ct:>`, timeString].filter(part => part.trim() !== '');
            return parts.join(', ') + '.';
          }).join('\r\n');
          return cityHeader + cityEventsContent;
        }).join('\r\n');
      } else {
        // For VN: Keep existing logic without city grouping
        eventsContent = subcategoryEvents.map(event => {
          // Find the matching date for this search
          const matchingDate = event.dates.find(dateItem => {
            const eventDateString = dateItem.date.toISOString().split('T')[0];
            return eventDateString === dateString;
          }) || event.dates[0];

          // Format time for VN
          let timeString = '';
          if (matchingDate?.startTime) {
            timeString = ` ${TEXT.EXPORT.timeFormats.start} ${matchingDate.startTime} ${TEXT.EXPORT.timeFormats.hour}.`;
            if (matchingDate?.endTime && matchingDate.endTime !== matchingDate.startTime) {
              timeString = ` ${TEXT.EXPORT.timeFormats.timeRange.replace('{start}', matchingDate.startTime).replace('{end}', matchingDate.endTime)}.`;
            }
          }

          // Format location for VN
          const vnLocation = event.city || event.subregion || event.region;
          let locationString = '';
          if (vnLocation !== 'Vorarlberg') {
            locationString = `Ort: <ct:Bold>${vnLocation}`;
            if (event.host) {
              locationString += `, <ct:>${event.host}`;
            }
            locationString += '.';
          } else if (event.host) {
            locationString = `<ct:Bold>${event.host}.`;
          }

          // Clean description (strip HTML tags)
          let description = event.description.replace(/<[^>]*>/g, '');

          // Add link if available
          let linkString = '';
          if (event.link) {
            linkString = ` ${event.link}`;
          }
          return `<pstyle:1Veranstaltungen><ct:Bold>${event.name}: <ct:>${description}${timeString} ${locationString}${linkString}`;
        }).join('\r\n');
      }
      return categoryHeader + eventsContent;
    }).join('\r\n');
    return header + content;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{TEXT.EXPORT.title}</DialogTitle>
          <DialogDescription>
            {TEXT.EXPORT.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product">{TEXT.EXPORT.product} *</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder={TEXT.EXPORT.selectProduct} />
              </SelectTrigger>
              <SelectContent>
                {PRODUCTS.map(product => <SelectItem key={product.value} value={product.value}>
                    {product.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct === 'VN' && <div className="flex items-center space-x-2">
              <Checkbox id="smart-export" checked={smartExportEnabled} onCheckedChange={checked => setSmartExportEnabled(checked === true)} />
              <Label htmlFor="smart-export" className="text-sm font-normal">Smart Export (BETA) - OpenAI kürzt und verbessert die Beschreibung</Label>
            </div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {TEXT.EXPORT.cancel}
          </Button>
          <Button onClick={handleExport} disabled={isProcessing} className="flex items-center gap-2">
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isProcessing ? 'Processing...' : TEXT.EXPORT.exportButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};