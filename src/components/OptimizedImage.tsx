import { ImgHTMLAttributes, useState } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string | any; // Allow both string and image objects from imports
  alt: string;
  width?: string | number;
  height?: string | number;
  priority?: boolean;
  sizes?: string;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false, 
  sizes,
  className,
  ...props 
}: OptimizedImageProps) => {
  // Handle both string URLs and image objects from imports
  const getImageSrc = (source: string | any): string => {
    // If it's a string URL, return it directly
    if (typeof source === 'string') {
      return source;
    }
    
    // If it's an image import object, extract the URL
    if (source && typeof source === 'object') {
      // Vite returns { default: url } for image imports
      if (source.default && typeof source.default === 'string') {
        return source.default;
      }
      // Sometimes it's { src: url }
      if (source.src && typeof source.src === 'string') {
        return source.src;
      }
      // Fallback: convert object to string
      return String(source);
    }
    
    // Last resort: convert to string
    return String(source);
  };

  const imageSrc = getImageSrc(src);
  const [imgSrc, setImgSrc] = useState(imageSrc);
  const [hasError, setHasError] = useState(false);

  // Generate responsive srcset for local images
  const generateSrcSet = (originalSrc: string) => {
    // For external images (Supabase, Unsplash), return null to use original
    if (originalSrc.includes('supabase.co') || originalSrc.includes('unsplash.com')) {
      return null;
    }
    
    // For local images, generate responsive sizes
    if (originalSrc.startsWith('/assets/') || originalSrc.includes('/assets/')) {
      // Hero images need larger sizes
      if (originalSrc.includes('hero-')) {
        return `${originalSrc}?w=640&format=webp 640w, ${originalSrc}?w=1024&format=webp 1024w, ${originalSrc}?w=1920&format=webp 1920w`;
      }
      // Category images need medium sizes
      if (originalSrc.includes('category')) {
        return `${originalSrc}?w=400&format=webp 400w, ${originalSrc}?w=800&format=webp 800w`;
      }
      // Product thumbnails and logos need small sizes
      if (originalSrc.includes('products/') || originalSrc.includes('logo')) {
        return `${originalSrc}?w=200&format=webp 200w, ${originalSrc}?w=400&format=webp 400w`;
      }
    }
    return null;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Use a data URL for a simple gray placeholder
      setImgSrc('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3EImage unavailable%3C/text%3E%3C/svg%3E');
    }
  };

  const srcSet = generateSrcSet(imageSrc);

  return (
    <img
      src={imgSrc}
      srcSet={srcSet || undefined}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      width={width}
      height={height}
      sizes={sizes}
      onError={handleError}
      {...(priority && { fetchpriority: "high" })}
      {...props}
    />
  );
};

export default OptimizedImage;