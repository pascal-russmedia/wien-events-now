
import { Event } from '@/types/event';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Helper function to format event dates for display
export const formatEventDates = (dates: Event['dates']) => {
  const sortedDates = dates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (sortedDates.length === 0) return 'No dates';
  if (sortedDates.length === 1) {
    const date = format(new Date(sortedDates[0].date), 'dd. MMM yyyy', { locale: de });
    return date;
  }
  
  if (sortedDates.length <= 3) {
    return sortedDates.map(d => 
      format(new Date(d.date), 'dd. MMM', { locale: de })
    ).join(', ');
  }
  
  const firstTwo = sortedDates.slice(0, 2).map(d => 
    format(new Date(d.date), 'dd. MMM', { locale: de })
  ).join(', ');
  
  return `${firstTwo}, +${sortedDates.length - 2} more...`;
};

// Helper function to strip markdown and HTML and truncate description
export const formatDescription = (description: string) => {
  const withoutHtml = description
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  
  const plainText = withoutHtml
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/>\s/g, '')
    .replace(/[-*+]\s/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;
};

export const formatDate = (date: Date) => {
  return format(date, 'dd. MMM yyyy', { locale: de });
};

// Helper function to get text length from HTML content (consistent with RichTextEditor)
export const getTextLength = (html: string) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent?.length || 0;
};
