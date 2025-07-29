
import { z } from 'zod';
import { TEXT } from '@/constants/text';

export const eventFormSchema = z.object({
  name: z.string().min(1, 'Title is required').max(45, 'Title must be max 45 characters'),
  category: z.enum(['Party & Musik', 'Familie & Freizeit', 'Sport & Outdoor', 'Kultur & Bühne']),
  subcategory: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(5000, 'Description must be max 5000 characters'),
  region: z.string().min(1, 'Region is required'),
  subregion: z.string().optional(),
  city: z.string().min(1, 'Ort ist erforderlich'),
  host: z.string().max(40, 'Host must be max 40 characters').optional(),
  address: z.string().optional(),
  popularityScore: z.number().min(0).max(100).optional(),
  
  dates: z.array(z.object({
    date: z.date(),
    startTime: z.string().optional(),
    endTime: z.string().optional()
  })).min(1, 'At least one date is required'),
  image: z.string().optional(),
  priceType: z.enum(['Free', 'Cost']),
  priceAmount: z.number().optional(),
  ticketLink: z.string().url().optional().or(z.literal('')),
  link: z.string().url().optional().or(z.literal('')),
  featured: z.boolean(),
  email: z.string().email('Gültige E-Mail ist erforderlich'),
  confirmAccuracy: z.boolean().refine(val => val === true, TEXT.HARDCODED_ENGLISH.confirmAccuracyRequired)
}).refine((data) => {
  if (data.priceType === 'Cost' && (data.priceAmount === undefined || data.priceAmount === null)) {
    return false;
  }
  return true;
}, {
  message: "Price amount is required when price type is Cost",
  path: ["priceAmount"]
});

export type EventFormData = z.infer<typeof eventFormSchema>;

export interface DateWithTimes {
  date: Date;
  startTime?: string;
  endTime?: string;
}
