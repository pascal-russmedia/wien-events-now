import { Event as CustomEvent } from '@/types/event';
import { EventStateData } from '@/types/internalEvents';

export const transformEventData = (event: EventStateData): CustomEvent => ({
  id: event.id,
  name: event.name,
  subcategory: event.subcategory || undefined,
  category: event.category as CustomEvent['category'],
  description: event.description,
  region: event.region,
  subregion: event.subregion,
  host: event.host,
  address: event.address,
  state: event.state as CustomEvent['state'],
  popularityScore: event.popularity_score,
  trustScore: event.trust_score,
  dates: Array.isArray(event.dates) ? event.dates.map((date: any) => ({
    date: new Date(date.date),
    startTime: date.startTime,
    endTime: date.endTime
  })) : [{ date: new Date(), startTime: '', endTime: '' }],
  image: event.image,
  price: {
    type: event.price_type === 'free' ? 'Free' : 'Cost' as 'Free' | 'Cost',
    amount: event.price_amount || undefined
  },
  link: event.link,
  featured: event.featured,
  addedBy: event.added_by as CustomEvent['addedBy'],
  addedByEmail: event.added_by_email,
  created: new Date(event.created_at),
  updated: new Date(event.updated_at)
});

export const groupEventsByState = (events: CustomEvent[], showFutureEvents: boolean) => {
  return showFutureEvents ? { futureEvents: events, pastEvents: [] } : { futureEvents: [], pastEvents: events };
};