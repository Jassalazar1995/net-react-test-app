import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, Maximize2, Play, Pause } from 'lucide-react';
import { useOpenSeadragon } from '../hooks/useOpenSeadragon';

declare global {
  interface Window {
    OpenSeadragon: any;
  }
}

type Measurement = {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  distance: number;
};

export const SequenceOverlayMode: React.FC = () => {
  const viewerElRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const startPointRef = useRef<any>(null);
  const previewLineRef = useRef<HTMLDivElement | null>(null);
  const currentOverlayElementsRef = useRef<Array<HTMLElement>>([]);

  const isOSDLoaded = useOpenSeadragon();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const currentPageRef = useRef(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tilesLoading, setTilesLoading] = useState(0);
  const playIntervalRef = useRef<any>(null);

  const [measurementsByPage, setMeasurementsByPage] = useState<Record<number, Measurement[]>>({});
  const measurementsByPageRef = useRef<Record<number, Measurement[]>>({});

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    measurementsByPageRef.current = measurementsByPage;
  }, [measurementsByPage]);

  const imageSources = [
    'https://openseadragon.github.io/example-images/duomo/duomo.dzi',
    'https://openseadragon.github.io/example-images/highsmith/highsmith.dzi',
  ];

  useEffect(() => {
    if (!isOSDLoaded || !viewerElRef.current) return;

    const viewer = window.OpenSeadragon({
      element: viewerElRef.current,
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
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: true,
      },
    });

    viewerRef.current = viewer;

    viewer.addHandler('open', () => {
      setIsLoading(false);
      setTotalPages(viewer.world.getItemCount());
      setTimeout(() => renderMeasurementsForPage(viewer.currentPage()), 0);
    });

    viewer.addHandler('page', (event: any) => {
      setCurrentPage(event.page);
      renderMeasurementsForPage(event.page);
    });

    viewer.addHandler('tile-loading', () => setTilesLoading((n: number) => n + 1));
    viewer.addHandler('tile-loaded', () => setTilesLoading((n: number) => Math.max(0, n - 1)));

    viewer.addHandler('canvas-click', (event: any) => {
      event.preventDefaultAction = true;
      const vpPoint = viewer.viewport.pointFromPixel(event.position);
      if (!startPointRef.current) {
        startPointRef.current = vpPoint;
        createPreviewLine();
        viewer.addOverlay({
          element: previewLineRef.current,
          location: new window.OpenSeadragon.Rect(vpPoint.x, vpPoint.y, 0, 0),
        });
      } else {
        const start = startPointRef.current;
        const end = vpPoint;
        const measurement = finalizeMeasurement(start, end);
        startPointRef.current = null;
        removePreviewLine();
        const pageIndex = currentPageRef.current;
        setMeasurementsByPage((prev) => {
          const list = prev[pageIndex] ? [...prev[pageIndex]] : [];
          list.push(measurement);
          return { ...prev, [pageIndex]: list };
        });
      }
    });

    viewer.addHandler('canvas-drag', (event: any) => {
      if (!startPointRef.current) return;
      const end = viewer.viewport.pointFromPixel(event.position);
      updatePreviewLine(startPointRef.current, end);
    });

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      viewer.destroy();
    };
  }, [isOSDLoaded]);

  const handlePlayPause = () => {
    if (!viewerRef.current) return;
    if (isPlaying) {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      playIntervalRef.current = setInterval(() => {
        const viewer = viewerRef.current;
        const next = (viewer.currentPage() + 1) % viewer.world.getItemCount();
        viewer.goToPage(next);
      }, 2000);
      setIsPlaying(true);
    }
  };

  const createPreviewLine = () => {
    const line = document.createElement('div');
    line.style.position = 'absolute';
    line.style.background = 'red';
    line.style.height = '2px';
    line.style.transformOrigin = '0 50%';
    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.color = 'white';
    label.style.background = 'rgba(0,0,0,0.5)';
    label.style.padding = '2px 4px';
    label.style.fontSize = '12px';
    label.style.borderRadius = '3px';
    label.style.top = '-20px';
    label.style.left = '50%';
    label.style.transform = 'translateX(-50%)';
    line.appendChild(label);
    previewLineRef.current = line as HTMLDivElement;
  };

  const updatePreviewLine = (start: any, end: any) => {
    if (!viewerRef.current || !previewLineRef.current) return;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const containerSize = viewerRef.current.viewport.getContainerSize();
    const widthPx = length * containerSize.x;
    const line = previewLineRef.current;
    line.style.width = `${widthPx}px`;
    line.style.transform = `rotate(${angleDeg}deg)`;
    const label = line.firstChild as HTMLDivElement;
    label.innerText = `${length.toFixed(2)} units`;
    viewerRef.current.updateOverlay(
      previewLineRef.current,
      new window.OpenSeadragon.Rect(start.x, start.y, length, 0)
    );
  };

  const removePreviewLine = () => {
    if (previewLineRef.current && viewerRef.current) {
      viewerRef.current.removeOverlay(previewLineRef.current);
      previewLineRef.current = null;
    }
  };

  const addOverlayElement = (el: HTMLElement, location: any) => {
    viewerRef.current.addOverlay({ element: el, location });
    currentOverlayElementsRef.current.push(el);
  };

  const finalizeMeasurement = (start: any, end: any): Measurement => {
    const svgNS = 'http://www.w3.org/2000/svg';
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.overflow = 'visible';

    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', `${start.x < end.x ? 0 : width}`);
    line.setAttribute('y1', `${start.y < end.y ? 0 : height}`);
    line.setAttribute('x2', `${start.x < end.x ? width : 0}`);
    line.setAttribute('y2', `${start.y < end.y ? height : 0}`);
    line.setAttribute('stroke', 'yellow');
    line.setAttribute('stroke-width', `${Math.max(width, height) * 0.02}`);
    line.setAttribute('stroke-dasharray', `${Math.max(width, height) * 0.05},${Math.max(width, height) * 0.05}`);
    svg.appendChild(line);

    addOverlayElement(svg as unknown as HTMLElement, new window.OpenSeadragon.Rect(minX, minY, width, height));

    const makeDot = (color: string) => {
      const dot = document.createElement('div');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.background = color;
      dot.style.borderRadius = '50%';
      return dot;
    };

    addOverlayElement(
      makeDot('red'),
      new window.OpenSeadragon.Rect(start.x - 0.004, start.y - 0.004, 0.008, 0.008)
    );
    addOverlayElement(
      makeDot('blue'),
      new window.OpenSeadragon.Rect(end.x - 0.004, end.y - 0.004, 0.008, 0.008)
    );

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    const label = document.createElement('div');
    label.style.background = 'rgba(0, 0, 0, 0.6)';
    label.style.color = 'white';
    label.style.padding = '2px 4px';
    label.style.borderRadius = '4px';
    label.style.fontSize = '12px';
    label.innerText = `${distance.toFixed(2)} units`;

    addOverlayElement(label, new window.OpenSeadragon.Point(midX, midY));

    return {
      id: `m-${Date.now()}`,
      start: { x: start.x, y: start.y },
      end: { x: end.x, y: end.y },
      distance,
    };
  };

  const clearCurrentOverlays = () => {
    if (!viewerRef.current) return;
    for (const el of currentOverlayElementsRef.current) {
      try {
        viewerRef.current.removeOverlay(el);
      } catch (_) { }
    }
    currentOverlayElementsRef.current = [];
  };

  const renderMeasurementsForPage = (pageIndex: number) => {
    if (!viewerRef.current) return;
    clearCurrentOverlays();
    const list = measurementsByPageRef.current[pageIndex] || [];
    for (const m of list) {
      finalizeMeasurement(m.start, m.end);
    }
  };

  const clearMeasurementsForCurrentPage = () => {
    setMeasurementsByPage((prev) => {
      const copy = { ...prev };
      copy[currentPage] = [];
      return copy;
    });
    clearCurrentOverlays();
  };

  const deleteMeasurement = (id: string) => {
    const pageIndex = currentPageRef.current;
    setMeasurementsByPage((prev) => {
      const copy = { ...prev };
      copy[pageIndex] = (copy[pageIndex] || []).filter((m) => m.id !== id);
      return copy;
    });
    setTimeout(() => renderMeasurementsForPage(pageIndex), 0);
  };

  const currentMeasurements = measurementsByPage[currentPage] || [];

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => viewerRef.current?.goToPage(Math.max(0, viewerRef.current.currentPage() - 1))}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition disabled:opacity-50"
              disabled={currentPage === 0}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="px-3 py-1 bg-gray-700 rounded">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => viewerRef.current?.goToPage(Math.min(totalPages - 1, viewerRef.current.currentPage() + 1))}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition disabled:opacity-50"
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight size={20} />
            </button>
            <button onClick={handlePlayPause} className="p-2 bg-blue-600 rounded hover:bg-blue-500 transition ml-2">
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={clearMeasurementsForCurrentPage}
              className="px-3 py-2 bg-red-600 rounded hover:bg-red-500 transition ml-2"
            >
              Clear This Image
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => viewerRef.current?.viewport.zoomBy(2)}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={() => viewerRef.current?.viewport.zoomTo(viewerRef.current.viewport.getMaxZoom())}
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
          {tilesLoading > 0 && <span className="text-blue-500">Loading {tilesLoading} tiles...</span>}
          <span className="text-blue-400">Click to start, click again to finalize measurement</span>
          <span>
            {currentMeasurements.length} measurement{currentMeasurements.length !== 1 ? 's' : ''} on this image
          </span>
        </div>
      </div>

      <div className="bg-black rounded-lg overflow-hidden">
        <div ref={viewerElRef} style={{ height: '600px' }} />
      </div>

      {currentMeasurements.length > 0 && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Measurements (Image {currentPage + 1}):</h3>
          <div className="max-h-40 overflow-y-auto">
            <ul className="text-sm text-gray-300 space-y-2">
              {currentMeasurements.map((m, idx) => (
                <li key={m.id} className="flex items-center justify-between group">
                  <span>
                    {idx + 1}. distance: {m.distance.toFixed(3)} units
                  </span>
                  <button
                    onClick={() => deleteMeasurement(m.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition text-sm px-2"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SequenceOverlayMode;


