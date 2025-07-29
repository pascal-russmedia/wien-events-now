import { useState } from 'react';

interface PaginationState {
  page: number;
  totalCount: number;
  totalPages: number;
}

export const useEventPagination = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    totalCount: 0,
    totalPages: 0
  });

  const updatePagination = (page: number, totalCount: number, itemsPerPage: number) => {
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    setPagination({
      page,
      totalCount,
      totalPages
    });
  };

  return {
    pagination,
    updatePagination
  };
};