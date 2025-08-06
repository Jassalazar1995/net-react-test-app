import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * AlliedVisionCameraView Component
 * 
 * A React component that provides Allied Vision Alvium 1800 U-1240m camera functionality:
 * - Backend-streamed video feed from industrial camera
 * - Real-time OpenCV image processing via backend
 * - Edge detection, contour analysis, and other CV operations
 * - Screenshot capture with processed images
 * - Multiple processing modes for defect analysis
 * - 12.22MP resolution support (4128x2968)
 */
interface AlliedVisionCameraViewProps {
  width?: number;
  height?: number;
  className?: string;
  processingMode?: 'none' | 'edges' | 'contours' | 'threshold' | 'blur' | 'defect_detection';
}

interface CameraStatus {
  isConnected: boolean;
  isStreaming: boolean;
  temperature: number;
  frameRate: number;
  resolution: { width: number; height: number };
  model: string;
  serialNumber: string;
}

const AlliedVisionCameraView: React.FC<AlliedVisionCameraViewProps> = ({ 
  width = 1024, 
  height = 768, 
  className = "",
  processingMode = 'none'
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState(processingMode);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>({
    isConnected: false,
    isStreaming: false,
    temperature: 0,
    frameRate: 0,
    resolution: { width: 2048, height: 1536 },
    model: 'Alvium 1800 U-2050c',
    serialNumber: 'Unknown'
  });
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [streamRefresh, setStreamRefresh] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();
  const streamIntervalRef = useRef<NodeJS.Timeout>();

  // Check camera connection status
  const checkCameraStatus = useCallback(async () => {
    try {
      // Skip frequent checks if camera is already connected and working
      if (cameraStatus.isConnected && !error) {
        console.log('Camera stable, skipping status check');
        return;
      }
      
      const response = await fetch('http://localhost:5241/api/camera/status');
      if (response.ok) {
        const status = await response.json();
        setCameraStatus(status);
        if (!status.isConnected && !error?.includes('not detected')) {
          setError('Allied Vision Alvium 1800 U-2050c not detected. Please ensure camera is connected via USB 3.1.');
        } else if (status.isConnected && error?.includes('not detected')) {
          setError(null);
        }
      } else {
        throw new Error('Backend camera service unavailable');
      }
    } catch (err) {
      console.error('Error checking camera status:', err);
      setError('Backend camera service is not running. Please start the camera service.');
      setCameraStatus(prev => ({ ...prev, isConnected: false, isStreaming: false }));
    }
  }, [error, cameraStatus.isConnected]);

  // Initialize camera status checking
  useEffect(() => {
    checkCameraStatus();
    // Check status every 10 seconds instead of 3 seconds to reduce API calls
    intervalRef.current = setInterval(checkCameraStatus, 10000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkCameraStatus]);

  const startCamera = useCallback(async () => {
    try {
      console.log('Starting Allied Vision Alvium 1800 U-1240m camera...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5241/api/camera/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processingMode: currentMode,
          resolution: { width: cameraStatus.resolution.width, height: cameraStatus.resolution.height },
          frameRate: 30 // Max for this resolution
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to start camera: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setStreamUrl(result.streamUrl);
        setIsStreaming(true);
        console.log('Allied Vision camera started successfully');
      } else {
        throw new Error(result.message || 'Failed to start camera');
      }
      
    } catch (err) {
      console.error('Error starting Allied Vision camera:', err);
      if (err instanceof Error) {
        setError(`Failed to start camera: ${err.message}`);
      } else {
        setError('Failed to start camera: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, [currentMode, cameraStatus.resolution]);

  const stopCamera = useCallback(async () => {
    try {
      console.log('Stopping Allied Vision camera...');
      setLoading(true);
      
      const response = await fetch('http://localhost:5241/api/camera/stop', {
        method: 'POST'
      });

      if (response.ok) {
        setStreamUrl('');
        setIsStreaming(false);
        console.log('Allied Vision camera stopped successfully');
      }
    } catch (err) {
      console.error('Error stopping camera:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const changeProcessingMode = useCallback(async (newMode: string) => {
    if (!isStreaming) return;
    
    try {
      const response = await fetch('http://localhost:5241/api/camera/processing-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: newMode })
      });

      if (response.ok) {
        setCurrentMode(newMode as any);
        console.log(`Processing mode changed to: ${newMode}`);
      }
    } catch (err) {
      console.error('Error changing processing mode:', err);
    }
  }, [isStreaming]);

  const takeScreenshot = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch('http://localhost:5241/api/camera/screenshot', {
        method: 'POST'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }
      return null;
    } catch (err) {
      console.error('Error taking screenshot:', err);
      return null;
    }
  }, []);

  // Update processing mode when prop changes
  useEffect(() => {
    if (currentMode !== processingMode) {
      changeProcessingMode(processingMode);
    }
  }, [processingMode, currentMode, changeProcessingMode]);

  // Stream refresh effect - updates the stream every 500ms when streaming
  useEffect(() => {
    if (isStreaming) {
      streamIntervalRef.current = setInterval(() => {
        setStreamRefresh(Date.now());
      }, 500); // Update every 500ms for smooth live feed
    } else {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    }

    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, [isStreaming]);

  return (
    <div className={`relative ${className}`}>
      {error ? (
        <div className="bg-red-900/20 border-2 border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 mb-2">⚠️ Allied Vision Camera Error</div>
          <div className="text-sm text-red-300 mb-4">{error}</div>
          <div className="space-x-2">
            <button
              onClick={checkCameraStatus}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Retry Connection
            </button>
            {cameraStatus.isConnected && (
              <button
                onClick={startCamera}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:bg-blue-800"
              >
                {loading ? 'Starting...' : 'Start Camera'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Camera stream display */}
          {isStreaming && streamUrl ? (
            <img
              ref={imgRef}
              src={`${streamUrl}&t=${streamRefresh}`}
              alt="Allied Vision Alvium 1800 U-2050c Stream"
              className="w-full h-full object-contain rounded-lg bg-black"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              onError={() => setError('Stream connection lost')}
              key={streamRefresh} // Force re-render with each update
            />
          ) : (
            <div 
              className="w-full h-full bg-black rounded-lg flex items-center justify-center"
              style={{ width: width, height: height }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">📹</div>
                <div className="text-gray-400 mb-2 text-lg font-semibold">{cameraStatus.model}</div>
                <div className="text-sm text-gray-500 mb-4">
                  12.22MP • 1/1.7" • C-Mount • USB 3.1 • Monochrome
                </div>
                {cameraStatus.serialNumber !== 'Unknown' && (
                  <div className="text-xs text-gray-600 mb-4">S/N: {cameraStatus.serialNumber}</div>
                )}
                {!isStreaming && cameraStatus.isConnected && (
                  <button
                    onClick={startCamera}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors disabled:bg-blue-800"
                  >
                    {loading ? '🔄 Starting...' : '🏭 Start Industrial Camera'}
                  </button>
                )}
                {!cameraStatus.isConnected && (
                  <div className="text-red-400 text-sm">Camera not detected</div>
                )}
              </div>
            </div>
          )}
          
          {/* Camera status overlay */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
              <div className="flex items-center space-x-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${cameraStatus.isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-white font-medium">{cameraStatus.model}</span>
              </div>
              <div className="text-gray-300 space-y-1">
                <div>Status: {cameraStatus.isStreaming ? 'STREAMING' : cameraStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED'}</div>
                <div>Resolution: {cameraStatus.resolution.width}×{cameraStatus.resolution.height}</div>
                {cameraStatus.frameRate > 0 && <div>Frame Rate: {cameraStatus.frameRate.toFixed(1)} fps</div>}
                <div>Processing: {currentMode}</div>
                {cameraStatus.temperature > 0 && <div>Temp: {cameraStatus.temperature.toFixed(1)}°C</div>}
                {cameraStatus.serialNumber !== 'Unknown' && <div>S/N: {cameraStatus.serialNumber}</div>}
              </div>
            </div>
          </div>
          
          {/* Camera controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
              {isStreaming ? (
                <span className="text-green-400">● LIVE (Industrial: {currentMode})</span>
              ) : cameraStatus.isConnected ? (
                <span className="text-yellow-400">● READY</span>
              ) : (
                <span className="text-red-400">● DISCONNECTED</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  const screenshot = await takeScreenshot();
                  if (screenshot) {
                    const link = document.createElement('a');
                    link.download = `alvium-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
                    link.href = screenshot;
                    link.click();
                    URL.revokeObjectURL(screenshot);
                  }
                }}
                disabled={!isStreaming}
                className="px-3 py-1 rounded text-xs transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                title="Take High-Resolution Screenshot (12.22MP)"
              >
                📷
              </button>
              <button
                onClick={isStreaming ? stopCamera : startCamera}
                disabled={!cameraStatus.isConnected || loading}
                className={`px-3 py-1 rounded text-xs transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed ${
                  isStreaming 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {loading ? '⏳' : isStreaming ? 'Stop' : 'Start'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AlliedVisionCameraView;