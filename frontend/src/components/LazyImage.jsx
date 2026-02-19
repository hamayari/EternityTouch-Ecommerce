import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, className, placeholder = '/placeholder.png' }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const imgRef = useRef();

  useEffect(() => {
    let observer;
    
    if (imgRef.current && imageSrc === placeholder) {
      observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(imgRef.current);
            }
          });
        },
        {
          rootMargin: '50px'
        }
      );
      
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (observer && observer.unobserve && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, imageSrc, placeholder]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};

export default LazyImage;
