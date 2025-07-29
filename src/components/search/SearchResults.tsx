import { Event } from '@/types/event';
import SearchEventCard from '@/components/SearchEventCard';
import { InfiniteScrollLoader } from '@/components/InfiniteScrollLoader';
import { Button } from '@/components/ui/button';
import { TEXT } from '@/constants/text';

interface SearchResultsProps {
  events: Event[];
  totalCount: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onShowAllEvents: () => void;
}

export const SearchResults = ({
  events,
  totalCount,
  hasMore,
  loadingMore,
  onLoadMore,
  onShowAllEvents
}: SearchResultsProps) => {
  return (
    <>
      {/* Results Count */}
      <div className="mb-3">
        <p className="text-sm font-greta text-gray-600">
          {totalCount} {TEXT.PAGES.search.resultsCount}
        </p>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map(event => (
              <SearchEventCard 
                key={event.id} 
                event={event} 
                className="animate-fade-in" 
              />
            ))}
          </div>
          
          {/* Infinite Scroll Loader */}
          <InfiniteScrollLoader 
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            loading={loadingMore}
            className="mt-8"
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-2xl font-greta-bold text-gray-800 mb-2">{TEXT.EVENTS.noEventsFoundSearch}</h3>
          <p className="text-gray-600 font-greta mb-6">
            {TEXT.EVENTS.adjustFilters}
          </p>
          <Button 
            onClick={onShowAllEvents} 
            className="bg-volat-yellow hover:bg-volat-yellow-dark text-black font-greta-bold"
          >
            {TEXT.ALL_EVENTS.viewAll.button}
          </Button>
        </div>
      )}
    </>
  );
};