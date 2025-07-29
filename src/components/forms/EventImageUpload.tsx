
import { useState, useEffect } from 'react';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Upload, Trash2 } from 'lucide-react';
import { EnhancedImage } from '@/components/ui/enhanced-image';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { deleteImageFromStorage, isSupabaseStorageUrl } from '@/utils/imageUtils';
import { TEXT } from '@/constants/text';

interface EventImageUploadProps {
  onImageChange: (image: string) => void;
  initialImage?: string;
}

const EventImageUpload = ({ onImageChange, initialImage }: EventImageUploadProps) => {
  const [imagePreview, setImagePreview] = useState<string>(initialImage || '');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialImage) {
      setImagePreview(initialImage);
    }
  }, [initialImage]);

  const validateAndProcessFile = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      toast.error('File size must be less than 4MB');
      return;
    }
    
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only PNG and JPG files are supported');
      return;
    }

    setUploading(true);
    
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('event-images')
        .upload(fileName, file);

      if (error) {
        toast.error(TEXT.ERRORS.imageUploadFailed);
        console.error('Upload error:', error);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('event-images')
        .getPublicUrl(data.path);

      const imageUrl = urlData.publicUrl;
      setImagePreview(imageUrl);
      onImageChange(imageUrl);
      toast.success(TEXT.NOTIFICATIONS.imageUploadSuccess);
      
    } catch (error) {
      toast.error(TEXT.ERRORS.imageUploadFailed);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (!uploading) {
      const files = e.dataTransfer.files;
      if (files && files[0]) {
        validateAndProcessFile(files[0]);
      }
    }
  };

  const handleRemoveImage = async () => {
    // Clean up storage if it's a Supabase storage URL
    if (imagePreview && isSupabaseStorageUrl(imagePreview)) {
      await deleteImageFromStorage(imagePreview);
    }
    
    setImagePreview('');
    onImageChange('');
  };

  return (
    <FormItem>
      <FormLabel>{TEXT.HARDCODED_ENGLISH.imageOptional}</FormLabel>
      <FormControl>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative">
                <EnhancedImage
                  src={imagePreview}
                  alt="Event preview"
                  aspectRatio={16 / 9}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 z-20"
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            <AspectRatio ratio={16 / 6}>
              <label 
                className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/25 bg-muted/50 hover:bg-muted'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-center">
                  <Upload className="w-5 h-5 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground font-semibold">
                    {uploading ? TEXT.LOADING.uploading : TEXT.BUTTONS.replaceImage}
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </AspectRatio>
            </div>
          ) : (
            <AspectRatio ratio={16 / 6}>
              <label 
                className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/10' 
                    : 'border-muted-foreground/25 bg-muted/50 hover:bg-muted'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center">
                  <Upload className={`w-8 h-8 mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">
                      {uploading ? TEXT.LOADING.uploading : TEXT.BUTTONS.clickToUpload}
                    </span> {!uploading && TEXT.MESSAGES.dragAndDrop}
                  </p>
                  <p className="text-xs text-muted-foreground">{TEXT.MESSAGES.fileFormat}</p>
                  <p className="text-xs text-muted-foreground">{TEXT.MESSAGES.optimalRatio}</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </AspectRatio>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};

export default EventImageUpload;
