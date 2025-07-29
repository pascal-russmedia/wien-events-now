import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useState, useCallback } from 'react';

interface EnhancedImageProps {
  src: string;
  alt: string;
  aspectRatio?: number;
  className?: string;
  rounded?: boolean;
}

const EnhancedImage = ({ 
  src, 
  alt, 
  aspectRatio = 16 / 9, 
  className = "", 
  rounded = true 
}: EnhancedImageProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useBlur, setUseBlur] = useState(false);
  const containerClasses = `relative overflow-hidden bg-muted ${rounded ? 'rounded-lg' : ''} ${className}`;

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const ratio = img.naturalWidth / img.naturalHeight;
    const targetRatio = aspectRatio;
    
    // Only use blur if aspect ratio difference is significant (more than 10%)
    const ratioMatch = Math.abs(ratio - targetRatio) < (targetRatio * 0.1);
    setUseBlur(!ratioMatch);
    setImageLoaded(true);
  }, [aspectRatio]);

  return (
    <AspectRatio ratio={aspectRatio} className={containerClasses}>
      {/* Only show blurred background if needed and image is loaded */}
      {useBlur && imageLoaded && (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-3xl scale-110"
          style={{ backgroundImage: `url(${src})` }}
        />
      )}
      
      {/* Main image */}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        loading="lazy" // Add lazy loading for performance
        className={`absolute inset-0 w-full h-full relative z-10 transition-opacity duration-200 ${
          useBlur ? 'object-contain' : 'object-cover'
        } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      
      {/* Loading placeholder - only shown until image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </AspectRatio>
  );
};

export { EnhancedImage };