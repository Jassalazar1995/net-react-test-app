import React from 'react';
import { useWebcam } from '../hooks/useWebcam';

/**
 * WebcamView Component
 * 
 * A React component that provides webcam functionality with the following features:
 * - Live video feed from laptop's webcam
 * - Start/Stop camera controls
 * - Screenshot capture with automatic download
 * - Error handling for camera access issues
 * - Responsive design that fits container
 * 
 * @param width - Desired video width (default: 640)
 * @param height - Desired video height (default: 480)
 * @param className - Additional CSS classes
 * @param facingMode - Camera facing mode: 'user' (front) or 'environment' (back)
 */
interface WebcamViewProps {
  width?: number;
  height?: number;
  className?: string;
  facingMode?: 'user' | 'environment';
}

const WebcamView: React.FC<WebcamViewProps> = ({ 
  width = 640, 
  height = 480, 
  className = "",
  facingMode = 'user'
}) => {
  const { videoRef, isStreaming, error, startWebcam, stopWebcam, takeScreenshot } = useWebcam({
    width,
    height,
    facingMode,
    autoStart: true  // Re-enable auto-start now that StrictMode is disabled
  });

  return (
    <div className={`relative ${className}`}>
      {error ? (
        <div className="bg-red-900/20 border-2 border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 mb-2">⚠️ Camera Error</div>
          <div className="text-sm text-red-300 mb-4">{error}</div>
          <button
            onClick={startWebcam}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            Retry Camera Access
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={width}
            height={height}
            className="w-full h-full object-cover rounded-lg bg-black"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
            onLoadedData={() => console.log('Video data loaded')}
            onPlay={() => console.log('Video started playing')}
            onError={(e) => console.error('Video error:', e)}
          />
          
          {/* Show start button overlay when not streaming */}
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <button
                onClick={startWebcam}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                📹 Start Camera
              </button>
            </div>
          )}
          
          {/* Camera controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
              {isStreaming ? (
                <span className="text-green-400">● LIVE</span>
              ) : (
                <span className="text-yellow-400">● READY</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const screenshot = takeScreenshot();
                  if (screenshot) {
                    // Create a download link for the screenshot
                    const link = document.createElement('a');
                    link.download = `screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
                    link.href = screenshot;
                    link.click();
                  }
                }}
                disabled={!isStreaming}
                className="px-3 py-1 rounded text-xs transition-colors bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                title="Take Screenshot"
              >
                📷
              </button>
              <button
                onClick={isStreaming ? stopWebcam : startWebcam}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  isStreaming 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isStreaming ? 'Stop' : 'Start'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WebcamView;