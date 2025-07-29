import { Event as CustomEvent } from '@/types/event';

export interface GroupedEventsData {
  futureEvents: CustomEvent[];
  pastEvents: CustomEvent[];
  counts: {
    future: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
    past: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
  };
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
}

export interface EventStateData {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  region: string;
  subregion: string;
  host: string;
  address: string;
  state: string;
  popularity_score: number;
  trust_score: number;
  dates: any;
  image: string;
  price_type: string;
  price_amount: number;
  link: string;
  featured: boolean;
  added_by: string;
  added_by_email: string;
  created_at: string;
  updated_at: string;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_count: number;
  current_state_total: number;
  current_state_pages: number;
}