import { z } from 'zod';
import { TEXT } from '@/constants/text';

// Edit event schema - email is not required
export const editEventSchema = z.object({
  name: z.string().min(1, 'Title is required').max(50, 'Title must be max 50 characters'),
  category: z.enum(['Party & Musik', 'Familie & Freizeit', 'Sport & Outdoor', 'Kultur & Bühne']),
  subcategory: z.string().optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be max 2000 characters'),
  region: z.string().min(1, 'Region is required'),
  subregion: z.string().optional(),
  city: z.string().min(1, 'Ort ist erforderlich'),
  host: z.string().optional(),
  address: z.string().optional(),
  
  dates: z.array(z.object({
    date: z.date(),
    startTime: z.string().optional(),
    endTime: z.string().optional()
  })).min(1, 'At least one date is required').max(30, 'Maximum 30 dates allowed'),
  image: z.string().optional(),
  priceType: z.enum(['Free', 'Cost']),
  priceAmount: z.number().optional(),
  link: z.string().refine((val) => {
    if (!val || val === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Bitte geben Sie eine gültige URL ein').optional(),
  ticketLink: z.string().refine((val) => {
    if (!val || val === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, 'Bitte geben Sie eine gültige URL ein').optional(),
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

export type EditEventFormData = z.infer<typeof editEventSchema>;