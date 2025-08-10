import React from 'react';
import { useIndustrialCameraViewModel } from '../viewmodels/useIndustrialCameraViewModel';
import type { IndustrialProcessingMode } from '../models/vision';

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
  processingMode?: IndustrialProcessingMode;
}

const AlliedVisionCameraView: React.FC<AlliedVisionCameraViewProps> = ({ 
  width = 1024, 
  height = 768, 
  className = "",
  processingMode = 'none'
}) => {
  const {
    isStreaming,
    loading,
    error,
    status: cameraStatus,
    currentMode,
    streamUrl,
    streamRefresh,
    checkCameraStatus,
    startCamera,
    stopCamera,
    takeScreenshot,
  } = useIndustrialCameraViewModel(processingMode);

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
              src={`${streamUrl}&t=${streamRefresh}`}
              alt="Allied Vision Alvium 1800 U-2050c Stream"
              className="w-full h-full object-contain rounded-lg bg-black"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
              onError={() => {/* handled by backend polling, ignore render error */}}
              key={streamRefresh}
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