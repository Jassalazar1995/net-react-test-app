import { useOpenSeadragon } from '../hooks/useOpenSeadragon';
// ComparisonMode.tsx
// Displays two OpenSeadragon viewers side-by-side for image comparison, with optional sync.
import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, Maximize2 } from 'lucide-react';

export const ComparisonMode: React.FC = () => {
  // viewer1Ref and viewer2Ref hold DOM nodes for each viewer
  // viewer1Instance and viewer2Instance hold OpenSeadragon instances
  // isOSDLoaded tracks if OpenSeadragon is ready
  // isLoading tracks if viewers are loading
  // isSynced toggles whether viewers are synchronized
  const viewer1Ref = useRef<HTMLDivElement>(null);
  const viewer2Ref = useRef<HTMLDivElement>(null);
  const viewer1Instance = useRef<any>(null);
  const viewer2Instance = useRef<any>(null);
  const isOSDLoaded = useOpenSeadragon();
  const [isLoading, setIsLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(true);

  useEffect(() => {
    // Initialize both viewers and set up sync when loaded
    if (!isOSDLoaded || !viewer1Ref.current || !viewer2Ref.current) return;

    // Initialize first viewer
    viewer1Instance.current = window.OpenSeadragon({
      element: viewer1Ref.current,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      tileSources: 'https://openseadragon.github.io/example-images/duomo/duomo.dzi',
      showNavigator: true,
      navigatorPosition: 'TOP_RIGHT',
    });

    // Initialize second viewer
    viewer2Instance.current = window.OpenSeadragon({
      element: viewer2Ref.current,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      tileSources: 'https://openseadragon.github.io/example-images/highsmith/highsmith.dzi',
      showNavigator: true,
      navigatorPosition: 'TOP_LEFT',
    });

    // Wait for both viewers to be ready
    let viewer1Ready = false;
    let viewer2Ready = false;

    viewer1Instance.current.addHandler('open', () => {
      viewer1Ready = true;
      if (viewer1Ready && viewer2Ready) {
        setIsLoading(false);
        setupSync();
      }
    });

    viewer2Instance.current.addHandler('open', () => {
      viewer2Ready = true;
      if (viewer1Ready && viewer2Ready) {
        setIsLoading(false);
        setupSync();
      }
    });

    return () => {
      viewer1Instance.current?.destroy();
      viewer2Instance.current?.destroy();
    };
  }, [isOSDLoaded]);

  const setupSync = () => {
    // Sets up event handlers to synchronize pan/zoom between viewers
    if (!viewer1Instance.current || !viewer2Instance.current || !isSynced) return;

    const syncViewers = (leader: any, follower: any) => {
      let syncing = false;
      
      leader.addHandler('zoom', () => {
        if (!syncing && isSynced) {
          syncing = true;
          follower.viewport.zoomTo(leader.viewport.getZoom());
          syncing = false;
        }
      });
      
      leader.addHandler('pan', () => {
        if (!syncing && isSynced) {
          syncing = true;
          follower.viewport.panTo(leader.viewport.getCenter());
          syncing = false;
        }
      });
    };

    syncViewers(viewer1Instance.current, viewer2Instance.current);
    syncViewers(viewer2Instance.current, viewer1Instance.current);
  };

  const toggleSync = () => {
    // Toggles synchronization and re-syncs positions if needed
    setIsSynced(!isSynced);
    if (!isSynced) {
      // Re-sync current positions
      const center = viewer1Instance.current?.viewport.getCenter();
      const zoom = viewer1Instance.current?.viewport.getZoom();
      if (center && zoom) {
        viewer2Instance.current?.viewport.panTo(center);
        viewer2Instance.current?.viewport.zoomTo(zoom);
      }
    }
  };

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Comparing: Duomo vs Highsmith</span>
            <button
              onClick={toggleSync}
              className={`px-4 py-2 rounded transition ${
                isSynced ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {isSynced ? 'Synced' : 'Independent'}
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                viewer1Instance.current?.viewport.zoomBy(2);
                if (isSynced) viewer2Instance.current?.viewport.zoomBy(2);
              }}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => {
                const maxZoom = viewer1Instance.current?.viewport.getMaxZoom();
                viewer1Instance.current?.viewport.zoomTo(maxZoom);
                if (isSynced) viewer2Instance.current?.viewport.zoomTo(maxZoom);
              }}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition"
              title="Zoom to 1:1"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4 text-sm text-gray-400">
          <span className={`${isLoading ? 'text-yellow-500' : 'text-green-500'}`}>
            {isLoading ? '● Loading viewers...' : '● Both viewers ready'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="bg-gray-800 p-2 text-center text-sm">Image 1: Duomo</div>
          <div ref={viewer1Ref} style={{ height: '550px' }} />
        </div>
        <div className="bg-black rounded-lg overflow-hidden">
          <div className="bg-gray-800 p-2 text-center text-sm">Image 2: Highsmith</div>
          <div ref={viewer2Ref} style={{ height: '550px' }} />
        </div>
      </div>
    </div>
  );
};