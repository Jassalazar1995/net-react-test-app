import { ChevronLeft, ChevronRight, ZoomIn, Maximize2, Play, Pause } from 'lucide-react';
// SequenceMode.tsx
// Displays a sequence of images in OpenSeadragon with slideshow and navigation controls.
import { useEffect, useRef, useState } from 'react';
import { useOpenSeadragon } from '../hooks/useOpenSeadragon';

declare global {
  interface Window {
    OpenSeadragon: any;
  }
}

// Sequence Mode Component
export const SequenceMode: React.FC = () => {
  // viewerRef holds the DOM node for the viewer
  // viewerInstance holds the OpenSeadragon instance
  // isOSDLoaded tracks if OpenSeadragon is ready
  // currentPage, totalPages, isPlaying, tilesLoading manage slideshow state
  // playIntervalRef manages the slideshow timer
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);
  const isOSDLoaded = useOpenSeadragon();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tilesLoading, setTilesLoading] = useState(0);
  const playIntervalRef = useRef<any>(null);

  const imageSources = [
    'https://openseadragon.github.io/example-images/duomo/duomo.dzi',
    'https://openseadragon.github.io/example-images/highsmith/highsmith.dzi',
  ];

  useEffect(() => {
    // Initialize OpenSeadragon in sequence mode and set up event handlers
    if (!isOSDLoaded || !viewerRef.current) return;

    viewerInstance.current = window.OpenSeadragon({
      element: viewerRef.current,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      sequenceMode: true,
      tileSources: imageSources,
      showReferenceStrip: true,
      referenceStripScroll: 'horizontal',
      animationTime: 0.5,
      visibilityRatio: 0.5,
      minZoomLevel: 0.5,
      maxZoomLevel: 10,
      showNavigator: true,
      navigatorPosition: 'TOP_RIGHT',
    });

    viewerInstance.current.addHandler('open', () => {
      setIsLoading(false);
      setTotalPages(viewerInstance.current.world.getItemCount());
    });

    viewerInstance.current.addHandler('page', (event: any) => {
      setCurrentPage(event.page);
    });

    viewerInstance.current.addHandler('tile-loading', () => {
      setTilesLoading(prev => prev + 1);
    });

    viewerInstance.current.addHandler('tile-loaded', () => {
      setTilesLoading(prev => Math.max(0, prev - 1));
    });

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
      if (viewerInstance.current) {
        viewerInstance.current.destroy();
      }
    };
  }, [isOSDLoaded]);

  const handlePlayPause = () => {
    // Starts or stops the slideshow playback
    if (isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      playIntervalRef.current = setInterval(() => {
        if (viewerInstance.current) {
          const current = viewerInstance.current.currentPage();
          const next = (current + 1) % viewerInstance.current.world.getItemCount();
          viewerInstance.current.goToPage(next);
        }
      }, 2000);
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => viewerInstance.current?.goToPage(viewerInstance.current.currentPage() - 1)}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition disabled:opacity-50"
              disabled={currentPage === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1 bg-gray-700 rounded">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => viewerInstance.current?.goToPage(viewerInstance.current.currentPage() + 1)}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition disabled:opacity-50"
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-2 bg-blue-600 rounded hover:bg-blue-500 transition ml-2"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => viewerInstance.current?.viewport.zoomBy(2)}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => viewerInstance.current?.viewport.zoomTo(viewerInstance.current.viewport.getMaxZoom())}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition"
              title="Zoom to 1:1"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-sm text-gray-400">
          <span className={`${isLoading ? 'text-yellow-500' : 'text-green-500'}`}>
            {isLoading ? '● Loading...' : '● Ready'}
          </span>
          {tilesLoading > 0 && (
            <span className="text-blue-500">Loading {tilesLoading} tiles...</span>
          )}
        </div>
      </div>

      <div className="bg-black rounded-lg overflow-hidden">
        <div ref={viewerRef} style={{ height: '600px' }} />
      </div>
    </div>
  );
};
