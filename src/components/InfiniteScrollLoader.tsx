import { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { TEXT } from '@/constants/text';

interface InfiniteScrollLoaderProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  className?: string;
}

export const InfiniteScrollLoader = ({
  onLoadMore,
  hasMore,
  loading,
  className = ''
}: InfiniteScrollLoaderProps) => {
  const observerRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading && !hasTriggered.current) {
      hasTriggered.current = true;
      onLoadMore();
      // Reset trigger after a short delay
      setTimeout(() => {
        hasTriggered.current = false;
      }, 1000);
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  if (!hasMore) {
    return (
      <div className={`text-center py-8 text-sm text-gray-500 ${className}`}>
        {TEXT.MESSAGES.reachedEndOfEvents}
      </div>
    );
  }

  return (
    <div className={`text-center py-8 ${className}`}>
      <div ref={observerRef} className="h-4" />
      
      {loading ? (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          {TEXT.LOADING.moreEvents}
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={onLoadMore}
          className="text-sm font-greta border-gray-300 hover:bg-volat-yellow hover:text-black"
        >
          {TEXT.BUTTONS.loadMoreEvents}
        </Button>
      )}
    </div>
  );
};