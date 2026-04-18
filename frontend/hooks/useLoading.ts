'use client';

import { useState, useEffect } from 'react';

export function useLoading(minLoadingTime: number = 2000) {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    
    const handleLoad = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        setIsReady(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }, remainingTime);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [minLoadingTime]);

  return { isLoading, isReady };
}
