import  { useEffect, useState } from 'react';

// useOpenSeadragon.ts
// Custom React hook to dynamically load the OpenSeadragon library and track its loaded state.

export const useOpenSeadragon = () => {
  // Returns true when OpenSeadragon is loaded and available on window
  const [isOSDLoaded, setIsOSDLoaded] = useState(false);

  useEffect(() => {
    // If OpenSeadragon is already loaded, set state and return
    if (window.OpenSeadragon) {
      setIsOSDLoaded(true);
      return;
    }

    const script = document.createElement('script');
    // Dynamically inject OpenSeadragon script if not present
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/openseadragon.min.js';
    script.async = true;
    script.onload = () => setIsOSDLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script if OpenSeadragon was not loaded
      if (!window.OpenSeadragon) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return isOSDLoaded;
};