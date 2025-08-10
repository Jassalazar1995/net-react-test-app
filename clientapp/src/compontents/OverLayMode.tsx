import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, Maximize2 } from 'lucide-react';
import { useOpenSeadragon } from '../hooks/useOpenSeadragon';

declare global {
  interface Window {
    OpenSeadragon: any;
  }
}

export const OverlayMode: React.FC = () => {
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const startPointRef = useRef<any>(null);
  const previewLineRef = useRef<HTMLDivElement | null>(null);

  const isOSDLoaded = useOpenSeadragon();
  const [isLoading, setIsLoading] = useState(true);
  type MeasurementOverlayRefs = {
    lineSvg: SVGSVGElement;
    startDot: HTMLDivElement;
    endDot: HTMLDivElement;
    label: HTMLDivElement;
  };
  type Measurement = {
    id: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    distance: number;
    overlays: MeasurementOverlayRefs;
  };
  const [measurements, setMeasurements] = useState<Measurement[]>([]);

  useEffect(() => {
    if (!isOSDLoaded || !viewerContainerRef.current) return;

    const viewer = window.OpenSeadragon({
      element: viewerContainerRef.current,
      prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/4.1.0/images/',
      // Use the same demo image as other modes for consistency. Functionality takes priority.
      tileSources: 'https://openseadragon.github.io/example-images/duomo/duomo.dzi',
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
    });

    // Click to set start/end points
    viewer.addHandler('canvas-click', (event: any) => {
      event.preventDefaultAction = true;
      if (!viewerRef.current) return;

      const viewportPoint = viewer.viewport.pointFromPixel(event.position);

      if (!startPointRef.current) {
        startPointRef.current = viewportPoint;
        createPreviewLine();
        // Anchor preview overlay at start
        viewerRef.current.addOverlay({
          element: previewLineRef.current,
          location: new window.OpenSeadragon.Rect(viewportPoint.x, viewportPoint.y, 0, 0),
        });
      } else {
        const start = startPointRef.current;
        const end = viewportPoint;
        finalizeMeasurement(start, end);
        startPointRef.current = null;
        removePreviewLine();
      }
    });

    // Drag for live preview
    viewer.addHandler('canvas-drag', (event: any) => {
      if (!startPointRef.current || !viewerRef.current) return;
      const end = viewer.viewport.pointFromPixel(event.position);
      updatePreviewLine(startPointRef.current, end);
    });

    return () => {
      viewer.destroy();
    };
  }, [isOSDLoaded]);

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

    previewLineRef.current = line;
  };

  const updatePreviewLine = (start: any, end: any) => {
    if (!previewLineRef.current || !viewerRef.current) return;

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

    // Update overlay location to keep origin at start point
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

  const finalizeMeasurement = (start: any, end: any) => {
    if (!viewerRef.current) return;

    const svgNS = 'http://www.w3.org/2000/svg';

    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    // Create SVG dashed line that scales with viewport
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

    viewerRef.current.addOverlay({
      element: svg as unknown as HTMLElement,
      location: new window.OpenSeadragon.Rect(minX, minY, width, height),
    });

    // Start & end dots
    const makeDot = (color: string) => {
      const dot = document.createElement('div');
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.background = color;
      dot.style.borderRadius = '50%';
      return dot;
    };

    const startDot = makeDot('red');
    const endDot = makeDot('blue');
    viewerRef.current.addOverlay({
      element: startDot,
      location: new window.OpenSeadragon.Rect(start.x - 0.004, start.y - 0.004, 0.008, 0.008),
    });
    viewerRef.current.addOverlay({
      element: endDot,
      location: new window.OpenSeadragon.Rect(end.x - 0.004, end.y - 0.004, 0.008, 0.008),
    });

    // Distance label at midpoint
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

    viewerRef.current.addOverlay({
      element: label,
      location: new window.OpenSeadragon.Point(midX, midY),
    });

    const measurement: Measurement = {
      id: `m-${Date.now()}`,
      start: { x: start.x, y: start.y },
      end: { x: end.x, y: end.y },
      distance,
      overlays: {
        lineSvg: svg,
        startDot,
        endDot,
        label,
      },
    };
    setMeasurements((prev) => [...prev, measurement]);
  };

  const clearMeasurements = () => {
    if (!viewerRef.current) return;
    for (const m of measurements) {
      viewerRef.current.removeOverlay(m.overlays.lineSvg as unknown as HTMLElement);
      viewerRef.current.removeOverlay(m.overlays.startDot);
      viewerRef.current.removeOverlay(m.overlays.endDot);
      viewerRef.current.removeOverlay(m.overlays.label);
    }
    setMeasurements([]);
  };

  const deleteMeasurement = (id: string) => {
    if (!viewerRef.current) return;
    const m = measurements.find((mm) => mm.id === id);
    if (!m) return;
    viewerRef.current.removeOverlay(m.overlays.lineSvg as unknown as HTMLElement);
    viewerRef.current.removeOverlay(m.overlays.startDot);
    viewerRef.current.removeOverlay(m.overlays.endDot);
    viewerRef.current.removeOverlay(m.overlays.label);
    setMeasurements((prev) => prev.filter((mm) => mm.id !== id));
  };

  return (
    <div>
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={clearMeasurements}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-500 transition"
            >
              Clear Measurements
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
          <span className="text-blue-400">Click to start, click again to finalize measurement</span>
          <span>{measurements.length} measurement{measurements.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="bg-black rounded-lg overflow-hidden">
        <div ref={viewerContainerRef} style={{ height: '600px' }} />
      </div>

      {measurements.length > 0 && (
        <div className="mt-4 bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Measurements:</h3>
          <div className="max-h-40 overflow-y-auto">
            <ul className="text-sm text-gray-300 space-y-2">
              {measurements.map((m, idx) => (
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

export default OverlayMode;