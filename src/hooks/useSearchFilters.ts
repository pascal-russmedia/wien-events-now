import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import { format, parseISO, addDays } from 'date-fns';
import { SUBCATEGORIES } from '@/types/event';
import { supabase } from '@/integrations/supabase/client';

interface DateFilter {
  type: 'single' | 'range';
  date?: Date;
  startDate?: Date;
  endDate?: Date;
}

export const useSearchFilters = (currentRegion: string) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [subcategoryCounts, setSubcategoryCounts] = useState<{[key: string]: number}>({});
  const [loadingSubcategoryCounts, setLoadingSubcategoryCounts] = useState(false);

  console.log('🔍 useSearchFilters render:', {
    currentRegion,
    selectedCategory,
    selectedSubcategory,
    filtersInitialized,
    locationSearch: location.search
  });

  // Parse URL parameters to get initial filter state
  const initialFilters = useMemo(() => {
    const urlParams = new URLSearchParams(location.search);
    const dateParam = urlParams.get('date');
    const categoryParam = urlParams.get('category');
    const subcategoryParam = urlParams.get('subcategory');
    const selectedDateParam = urlParams.get('selectedDate');
    const startDateParam = urlParams.get('startDate');
    const endDateParam = urlParams.get('endDate');

    let initialDateFilter = undefined;
    let initialSelectedDate = 'all';
    let initialDateRange = undefined;

    if (dateParam === 'today') {
      initialSelectedDate = 'today';
      const today = new Date();
      initialDateRange = { from: today, to: undefined };
      initialDateFilter = { type: 'single' as const, date: today };
    } else if (dateParam === 'this-week') {
      initialSelectedDate = 'tomorrow';
      const tomorrow = addDays(new Date(), 1);
      initialDateRange = { from: tomorrow, to: undefined };
      initialDateFilter = { type: 'single' as const, date: tomorrow };
    } else if (selectedDateParam) {
      initialSelectedDate = 'custom';
      const date = parseISO(selectedDateParam);
      initialDateRange = { from: date, to: undefined };
      initialDateFilter = { type: 'single' as const, date };
    } else if (startDateParam && endDateParam) {
      initialSelectedDate = 'custom';
      const startDate = parseISO(startDateParam);
      const endDate = parseISO(endDateParam);
      initialDateRange = { from: startDate, to: endDate };
      initialDateFilter = { type: 'range' as const, startDate, endDate };
    }

    return {
      category: categoryParam || '',
      subcategory: subcategoryParam || '',
      selectedDate: initialSelectedDate,
      dateRange: initialDateRange,
      dateFilter: initialDateFilter
    };
  }, [location.search]);

  // Set filters from URL params
  useEffect(() => {
    console.log('🔍 useSearchFilters initialFilters effect:', { initialFilters });
    
    setSelectedCategory(initialFilters.category);
    setSelectedSubcategory(initialFilters.subcategory);
    setSelectedDate(initialFilters.selectedDate);
    setDateRange(initialFilters.dateRange);

    // Clear subcategory if category changes and subcategory is not valid for new category
    if (initialFilters.category && initialFilters.subcategory) {
      const validSubcategories = SUBCATEGORIES[initialFilters.category] || [];
      if (!validSubcategories.includes(initialFilters.subcategory)) {
        setSelectedSubcategory('');
      }
    }

    console.log('🔍 useSearchFilters setting filtersInitialized to true');
    setFiltersInitialized(true);
  }, [initialFilters]);

  // Fetch subcategory counts with dedicated edge function
  const fetchSubcategoryCounts = async () => {
    if (!selectedCategory) {
      setSubcategoryCounts({});
      return;
    }

    setLoadingSubcategoryCounts(true);
    const counts: {[key: string]: number} = {};
    const availableSubcategories = SUBCATEGORIES[selectedCategory] || [];

    try {
      const { data, error } = await supabase.functions.invoke('get-subcategory-counts', {
        body: {
          region_filter: currentRegion,
          category_filter: selectedCategory,
          single_date_filter: initialFilters.dateFilter?.type === 'single' ? format(initialFilters.dateFilter.date, 'yyyy-MM-dd') : null,
          start_date_filter: initialFilters.dateFilter?.type === 'range' ? format(initialFilters.dateFilter.startDate, 'yyyy-MM-dd') : null,
          end_date_filter: initialFilters.dateFilter?.type === 'range' ? format(initialFilters.dateFilter.endDate, 'yyyy-MM-dd') : null,
        }
      });

      if (error) {
        console.error('Error fetching subcategory counts:', error);
        // Fallback: show all subcategories as available
        availableSubcategories.forEach(subcategory => {
          counts[subcategory] = 1;
        });
      } else {
        const subcategoryCounts = data?.subcategoryCounts || {};
        
        // Set counts for all available subcategories
        availableSubcategories.forEach(subcategory => {
          counts[subcategory] = subcategoryCounts[subcategory] || 0;
        });
      }
    } catch (error) {
      console.error('Error fetching subcategory counts:', error);
      // Fallback: show all subcategories as available
      availableSubcategories.forEach(subcategory => {
        counts[subcategory] = 1;
      });
    }

    setSubcategoryCounts(counts);
    setLoadingSubcategoryCounts(false);
  };

  // Fetch subcategory counts when category or filters change
  useEffect(() => {
    if (selectedCategory && filtersInitialized) {
      fetchSubcategoryCounts();
    }
  }, [selectedCategory, currentRegion, initialFilters.dateFilter, filtersInitialized]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    const urlParams = new URLSearchParams(location.search);
    if (category) {
      urlParams.set('category', category);
    } else {
      urlParams.delete('category');
    }
    urlParams.delete('subcategory');
    navigate(`${location.pathname}?${urlParams.toString()}`);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    const urlParams = new URLSearchParams(location.search);
    if (subcategory) {
      urlParams.set('subcategory', subcategory);
    } else {
      urlParams.delete('subcategory');
    }
    navigate(`${location.pathname}?${urlParams.toString()}`);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedDate('all');
    const urlParams = new URLSearchParams(location.search);
    urlParams.delete('category');
    urlParams.delete('subcategory');
    urlParams.delete('date');
    urlParams.delete('selectedDate');
    urlParams.delete('startDate');
    urlParams.delete('endDate');
    navigate(`${location.pathname}?${urlParams.toString()}`);
  };

  return {
    selectedCategory,
    selectedSubcategory,
    selectedDate,
    dateRange,
    subcategoryCounts,
    loadingSubcategoryCounts,
    filtersInitialized,
    dateFilter: initialFilters.dateFilter,
    handleCategorySelect,
    handleSubcategorySelect,
    handleDateRangeSelect,
    handleClearFilters
  };
};