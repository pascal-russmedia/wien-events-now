import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { REGIONS, CATEGORIES, SUBCATEGORIES } from '@/types/event';
import { TEXT } from '@/constants/text';

interface ExportFiltersProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  region: string;
  setRegion: (region: string) => void;
  category: string;
  setCategory: (category: string) => void;
  subcategory: string;
  setSubcategory: (subcategory: string) => void;
  onSearch: () => void;
  loading: boolean;
}

// Flatten all regions and subregions for dropdown
const allRegionOptions = REGIONS.flatMap(region => {
  const options = [{ name: region.name, isSubregion: false }];
  if (region.subregions) {
    options.push(...region.subregions.map(sub => ({ 
      name: sub, 
      isSubregion: true 
    })));
  }
  return options;
});

export const ExportFilters = ({
  date,
  setDate,
  region,
  setRegion,
  category,
  setCategory,
  subcategory,
  setSubcategory,
  onSearch,
  loading
}: ExportFiltersProps) => {
  const subcategories = category && category !== 'all' ? SUBCATEGORIES[category] || [] : [];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{TEXT.PAGES.internal.export.date} *</label>
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-64 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : TEXT.PAGES.internal.export.pickDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Region Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Region *</label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={TEXT.FORMS.placeholders.selectRegionExport} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TEXT.FORMS.labels.allRegions}</SelectItem>
              {allRegionOptions.map((regionOption) => (
                <SelectItem 
                  key={regionOption.name} 
                  value={regionOption.name}
                  className={regionOption.isSubregion ? "pl-8 text-muted-foreground" : "font-medium"}
                >
                  {regionOption.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{TEXT.PAGES.internal.export.category} *</label>
          <Select value={category} onValueChange={(value) => {
            setCategory(value);
            // Reset subcategory when category changes
            setSubcategory('all');
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={TEXT.FORMS.placeholders.allCategories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TEXT.FORMS.labels.allCategories}</SelectItem>
              {CATEGORIES.map((categoryOption) => (
                <SelectItem key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{TEXT.PAGES.internal.export.subcategory}</label>
          <Select 
            value={subcategory} 
            onValueChange={setSubcategory}
            disabled={!category || category === 'all'}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder={TEXT.FORMS.placeholders.allSubcategories} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{TEXT.FORMS.labels.allSubcategories}</SelectItem>
              {subcategories.map((subcategoryOption) => (
                <SelectItem key={subcategoryOption} value={subcategoryOption}>
                  {subcategoryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button 
          onClick={onSearch}
          disabled={!date || !category || loading}
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          {TEXT.FORMS.buttons.search}
        </Button>
      </div>
    </div>
  );
};