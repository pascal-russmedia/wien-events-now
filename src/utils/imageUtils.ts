import { supabase } from '@/integrations/supabase/client';

/**
 * Extracts the file path from a Supabase storage URL
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    // Pattern: https://bdupjgeuxgpjnmjajmqq.supabase.co/storage/v1/object/public/event-images/filename.jpg
    const match = url.match(/\/storage\/v1\/object\/public\/event-images\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Deletes an image from Supabase storage using its URL
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<boolean> {
  try {
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) {
      console.warn('Could not extract file path from URL:', imageUrl);
      return false;
    }

    const { error } = await supabase.storage
      .from('event-images')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

/**
 * Checks if a URL is a Supabase storage URL for our event images
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('/storage/v1/object/public/event-images/');
}

/**
 * Checks if a URL is a base64 data URL
 */
export function isBase64DataUrl(url: string): boolean {
  return url.startsWith('data:image/');
}