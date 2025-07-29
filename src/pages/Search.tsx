import { useMemo } from 'react';
import Header from '@/components/Header';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSearchState } from '@/hooks/useSearchState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResults } from '@/components/search/SearchResults';
import { TEXT } from '@/constants/text';
import { SEO } from '@/components/SEO';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useScrollRestoration();
  
  // Get current region from URL params
  const currentRegion = useMemo(() => {
    const urlParams = new URLSearchParams(location.search);
    const regionParam = urlParams.get('region');
    const subregionParam = urlParams.get('subregion');
    if (subregionParam) {
      return subregionParam;
    }
    return regionParam || 'Vorarlberg';
  }, [location.search]);

  // Use search filters hook
  const {
    selectedCategory,
    selectedSubcategory,
    dateRange,
    subcategoryCounts,
    loadingSubcategoryCounts,
    filtersInitialized,
    dateFilter,
    handleCategorySelect,
    handleSubcategorySelect,
    handleDateRangeSelect,
    handleClearFilters
  } = useSearchFilters(currentRegion);

  console.log('📄 Search component render:', {
    currentRegion,
    selectedCategory,
    selectedSubcategory,
    filtersInitialized,
    dateFilter,
    locationSearch: location.search
  });

  // Use search state hook - only when filters are initialized
  const searchFilters = useMemo(() => {
    if (!filtersInitialized) {
      return null; // Don't create filters until initialized
    }
    return {
      region: currentRegion,
      category: selectedCategory || undefined,
      subcategory: selectedSubcategory || undefined,
      dateFilter: dateFilter
    };
  }, [currentRegion, selectedCategory, selectedSubcategory, dateFilter, filtersInitialized]);

  // Only call useSearchState when filters are ready
  const searchResult = useSearchState(searchFilters);

  // Don't render content until filters are initialized to prevent wrong API calls
  if (!filtersInitialized) {
    console.log('📄 Search component: filters not initialized yet, showing loading');
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <LoadingScreen message={TEXT.LOADING.default} variant="spinner" size="md" className="py-20" />
      </div>
    );
  }

  const {
    events,
    totalCount,
    loading,
    loadingMore,
    hasMore,
    loadMore
  } = searchResult;

  const handleShowAllEvents = () => {
    handleClearFilters();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <LoadingScreen message={TEXT.LOADING.events} variant="spinner" size="md" className="py-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="Finde dein Event in Vorarlberg | Wohin"
        description="Alle Veranstaltungen in Vorarlberg im Überblick: Party, Musik, Sport, Kultur, Outdoor und mehr. Jetzt gezielt nach deinem Event suchen!"
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-[28px] md:text-4xl font-headline text-black mb-2 md:mb-3">
            Events in <span className="text-volat-yellow">{currentRegion}</span>
          </h1>
        </div>

        {/* Filters */}
        <SearchFilters
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          dateRange={dateRange}
          subcategoryCounts={subcategoryCounts}
          loadingSubcategoryCounts={loadingSubcategoryCounts}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          onDateRangeSelect={handleDateRangeSelect}
          onClearFilters={handleClearFilters}
        />

        {/* Results */}
        <SearchResults
          events={events}
          totalCount={totalCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          onShowAllEvents={handleShowAllEvents}
        />
      </main>
    </div>
  );
};
export default Search;