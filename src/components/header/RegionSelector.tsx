
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { FRONTEND_REGIONS as REGIONS } from '@/types/event';
import { ChevronDown, MapPin } from 'lucide-react';

interface RegionSelectorProps {
  displayText: string;
  onRegionSelect: (regionName: string, subregion?: string) => void;
  variant: 'desktop' | 'mobile';
}

const RegionSelector = ({ displayText, onRegionSelect, variant }: RegionSelectorProps) => {
  // Flatten all regions and subregions for dropdown
  const allRegionOptions = REGIONS.flatMap(region => {
    const options = [{ name: region.name, isSubregion: false, parentRegion: region.name }];
    if (region.subregions) {
      options.push(...region.subregions.map(sub => ({ 
        name: sub, 
        isSubregion: true, 
        parentRegion: region.name 
      })));
    }
    return options;
  });

  if (variant === 'desktop') {
    return (
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 bg-transparent text-white hover:bg-white/20 hover:text-white px-4 py-2 h-8 text-base transition-all duration-200">
              <MapPin className="h-5 w-5 text-white" />
              {displayText}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-white border border-gray-200 shadow-lg z-50">
            {allRegionOptions.map((option) => (
              <DropdownMenuItem 
                key={option.name}
                onClick={() => onRegionSelect(
                  option.parentRegion,
                  option.isSubregion ? option.name : undefined
                )}
                className={option.isSubregion ? "pl-6 text-gray-600" : "font-medium"}
              >
                {option.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-center text-sm px-3 py-1.5 h-8 flex items-center gap-1 min-w-0 bg-transparent text-white hover:bg-white/20 hover:text-white transition-all duration-200">
            <MapPin className="h-4 w-4 text-white flex-shrink-0" />
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{displayText}</span>
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full bg-white border border-gray-200 shadow-lg z-50">
          {allRegionOptions.map((option) => (
            <DropdownMenuItem 
              key={option.name}
              onClick={() => onRegionSelect(
                option.parentRegion,
                option.isSubregion ? option.name : undefined
              )}
              className={option.isSubregion ? "pl-6 text-gray-600" : "font-medium"}
            >
              {option.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export { RegionSelector };
