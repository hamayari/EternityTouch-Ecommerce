/**
 * Optimize Cloudinary image URLs for better performance
 * Adds automatic format, quality, and size transformations
 */

export const optimizeImageUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary')) {
    return url; // Return original if not a Cloudinary URL
  }

  const {
    width = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'scale',
    fetchFormat = 'auto'
  } = options;

  // Insert transformations before /upload/
  const transformations = `w_${width},q_${quality},f_${format},c_${crop},f_${fetchFormat}`;
  
  return url.replace('/upload/', `/upload/${transformations}/`);
};

/**
 * Get optimized image URL for different use cases
 */
export const getOptimizedImage = {
  // Thumbnail (small preview)
  thumbnail: (url) => optimizeImageUrl(url, { width: 150, quality: 80 }),
  
  // Product card (medium size)
  card: (url) => optimizeImageUrl(url, { width: 400, quality: 85 }),
  
  // Product detail (large size)
  detail: (url) => optimizeImageUrl(url, { width: 800, quality: 90 }),
  
  // Hero/Banner (full width)
  hero: (url) => optimizeImageUrl(url, { width: 1920, quality: 85 }),
};

/**
 * Preload critical images
 */
export const preloadImage = (url) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
};
