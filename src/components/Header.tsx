
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { FRONTEND_REGIONS as REGIONS } from '@/types/event';
import { ChevronDown, Plus, MapPin } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TEXT } from '@/constants/text';
import { RegionSelector } from './header/RegionSelector';
import { HeaderLogo } from './header/HeaderLogo';
import { AddEventButton } from './header/AddEventButton';

// Global region state to persist across pages
let globalRegionState = {
  region: 'Vorarlberg',
  subregion: ''
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial region from URL params, localStorage, or global state
  const getInitialRegion = () => {
    const urlParams = new URLSearchParams(location.search);
    const regionParam = urlParams.get('region');
    const subregionParam = urlParams.get('subregion');
    
    // First priority: URL parameters
    if (regionParam) {
      const result = { region: regionParam, subregion: subregionParam || '' };
      // Update global state
      globalRegionState = result;
      // Save to localStorage
      localStorage.setItem('selectedRegion', JSON.stringify(result));
      return result;
    }
    
    // Second priority: localStorage
    try {
      const saved = localStorage.getItem('selectedRegion');
      if (saved) {
        const parsed = JSON.parse(saved);
        globalRegionState = parsed;
        return parsed;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    
    // Third priority: global state
    if (globalRegionState.region !== 'Vorarlberg' || globalRegionState.subregion) {
      return globalRegionState;
    }
    
    // Final fallback: Vorarlberg
    return { region: 'Vorarlberg', subregion: '' };
  };

  const [selectedRegion, setSelectedRegion] = useState<string>(() => getInitialRegion().region);
  const [selectedSubregion, setSelectedSubregion] = useState<string>(() => getInitialRegion().subregion);

  // Sync state when URL changes (e.g., back button, direct navigation)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const regionParam = urlParams.get('region');
    const subregionParam = urlParams.get('subregion');
    
    // Only update if URL has region parameters and they're different from current state
    if (regionParam && (regionParam !== selectedRegion || subregionParam !== selectedSubregion)) {
      setSelectedRegion(regionParam);
      setSelectedSubregion(subregionParam || '');
      
      // Update global state and localStorage
      globalRegionState = { region: regionParam, subregion: subregionParam || '' };
      localStorage.setItem('selectedRegion', JSON.stringify(globalRegionState));
    }
  }, [location.search, selectedRegion, selectedSubregion]);

  // Reset region to Vorarlberg when on home page
  useEffect(() => {
    if (location.pathname === '/') {
      setSelectedRegion('Vorarlberg');
      setSelectedSubregion('');
      
      // Update global state and localStorage
      globalRegionState = { region: 'Vorarlberg', subregion: '' };
      localStorage.setItem('selectedRegion', JSON.stringify(globalRegionState));
    }
  }, [location.pathname]);

  const handleRegionSelect = (regionName: string, subregion?: string) => {
    setSelectedRegion(regionName);
    setSelectedSubregion(subregion || '');
    
    // Update global state
    globalRegionState = { region: regionName, subregion: subregion || '' };
    
    // Save to localStorage
    localStorage.setItem('selectedRegion', JSON.stringify(globalRegionState));
    
    // Always navigate to search page when region is selected
    // Preserve existing search filters when changing region
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('region', regionName);
    if (subregion) {
      urlParams.set('subregion', subregion);
    } else {
      urlParams.delete('subregion');
    }
    navigate(`/search?${urlParams.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    navigate('/');
    // Force scroll to top immediately and smoothly
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  // Show only subregion if selected, otherwise show main region
  const displayText = selectedSubregion || selectedRegion;

  return (
    <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-[7px]">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <HeaderLogo onClick={handleLogoClick} />
          
          <RegionSelector 
            displayText={displayText}
            onRegionSelect={handleRegionSelect}
            variant="desktop"
          />

          <AddEventButton />
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-2">
            <HeaderLogo onClick={handleLogoClick} size="small" />
            
            <RegionSelector 
              displayText={displayText}
              onRegionSelect={handleRegionSelect}
              variant="mobile"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
