import React, { useRef, useEffect, useState, useCallback } from 'react';

// Declare opencv-ts types for global access
declare global {
  interface Window {
    cv: any;
  }
}

/**
 * OpenCVWebcamView Component
 * 
 * A React component that provides webcam functionality with OpenCV.js processing:
 * - Live video feed from laptop's webcam
 * - Real-time OpenCV image processing
 * - Edge detection, contour analysis, and other CV operations
 * - Screenshot capture with processed images
 * - Multiple processing modes for defect analysis
 */
interface OpenCVWebcamViewProps {
  width?: number;
  height?: number;
  className?: string;
  facingMode?: 'user' | 'environment';
  processingMode?: 'none' | 'edges' | 'contours' | 'threshold' | 'blur';
}

const OpenCVWebcamView: React.FC<OpenCVWebcamViewProps> = ({
  width = 640,
  height = 480,
  className = "",
  facingMode = 'user',
  processingMode = 'none'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isOpenCVReady, setIsOpenCVReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [currentMode, setCurrentMode] = useState(processingMode);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize OpenCV loading locally first, then CDN fallbacks
  useEffect(() => {
    let cancelled = false;

    const sources = [
      { scriptUrl: '/opencv/opencv.js', locateBase: '/opencv/' },
      { scriptUrl: 'https://docs.opencv.org/4.x/opencv.js', locateBase: 'https://docs.opencv.org/4.x/' },
      { scriptUrl: 'https://cdn.jsdelivr.net/npm/opencv.js@1.2.1/opencv.js', locateBase: 'https://cdn.jsdelivr.net/npm/opencv.js@1.2.1/' },
      { scriptUrl: 'https://unpkg.com/opencv.js@1.2.1/opencv.js', locateBase: 'https://unpkg.com/opencv.js@1.2.1/' },
    ];

    const loadFrom = (scriptUrl: string, locateBase: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-opencv]') as HTMLScriptElement | null;
        if (existing) existing.remove();

        (window as any).cv = (window as any).cv || {};
        (window as any).cv.locateFile = (file: string) => `${locateBase}${file}`;
        (window as any).cv.onRuntimeInitialized = () => {
          if (!cancelled) {
            setIsOpenCVReady(true);
            setError(null);
            resolve();
          }
        };

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-opencv', 'true');
        script.onerror = () => reject(new Error(`Failed to load ${scriptUrl}`));
        document.head.appendChild(script);

        // Timeout fallback
        setTimeout(() => {
          if (!window.cv || !window.cv.getBuildInformation) {
            reject(new Error('OpenCV initialization timeout'));
          }
        }, 10000);
      });
    };

    const initOpenCV = async () => {
      try {
        if (window.cv?.getBuildInformation) {
          if (!cancelled) setIsOpenCVReady(true);
          return;
        }

        let lastError: unknown = null;
        for (const src of sources) {
          try {
            await loadFrom(src.scriptUrl, src.locateBase);
            console.log(`OpenCV loaded from: ${src.scriptUrl}`);
            return;
          } catch (err) {
            console.warn(err);
            lastError = err;
          }
        }
        if (!cancelled) setError('Failed to load OpenCV.js');
        console.error('OpenCV load failed from all sources:', lastError);
      } catch (err) {
        console.error('Failed to initialize OpenCV:', err);
        if (!cancelled) setError('Failed to initialize OpenCV');
      }
    };

    initOpenCV();
    return () => {
      cancelled = true;
    };
  }, []);

  // Process video frame with OpenCV
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
      // Re-schedule until metadata is available
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0);

      if (currentMode !== 'none' && isOpenCVReady && window.cv) {
        const cv = window.cv;
        // Get image data for OpenCV processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const src = cv.matFromImageData(imageData);
        let dst = new cv.Mat();

        switch (currentMode) {
        case 'edges':
          // Canny edge detection
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
          cv.Canny(dst, dst, 50, 150);
          cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
          break;

        case 'contours':
          // Find and draw contours
          let gray = new cv.Mat();
          cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
          cv.threshold(gray, gray, 120, 255, cv.THRESH_BINARY);

          let contours = new cv.MatVector();
          let hierarchy = new cv.Mat();
          cv.findContours(gray, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

          dst = src.clone();
          for (let i = 0; i < contours.size(); i++) {
            let color = new cv.Scalar(0, 255, 0, 255); // Green contours
            cv.drawContours(dst, contours, i, color, 2);
          }

          gray.delete();
          contours.delete();
          hierarchy.delete();
          break;

        case 'threshold':
          // Binary threshold
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
          cv.threshold(dst, dst, 127, 255, cv.THRESH_BINARY);
          cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
          break;

        case 'blur':
          // Gaussian blur
          let ksize = new cv.Size(15, 15);
          cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
          break;

        default:
          dst = src.clone();
        }

        // Draw processed image back to canvas
        cv.imshow(canvas, dst);

        // Clean up
        src.delete();
        dst.delete();
      }
    } catch (err) {
      console.error('OpenCV processing error:', err);
    }

    // Continue processing
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isOpenCVReady, isStreaming, currentMode]);

  const startWebcam = useCallback(async () => {
    try {
      console.log('Starting OpenCV webcam...');
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode
        },
        audio: false
      });

      console.log('Media stream obtained for OpenCV processing');

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        setStream(mediaStream);

        const playVideo = async () => {
          try {
            await video.play();
            console.log('OpenCV video playing successfully');
            setIsStreaming(true);
            if (isOpenCVReady) processFrame();
          } catch (playError) {
            console.error('Error playing video:', playError);
            setError('Failed to start video playback');
          }
        };

        if (video.readyState >= 2) {
          playVideo();
        } else {
          const tryPlay = () => {
            if (video.readyState >= 2) {
              playVideo();
              video.removeEventListener('loadedmetadata', tryPlay);
              video.removeEventListener('canplay', tryPlay);
            }
          };
          video.addEventListener('loadedmetadata', tryPlay);
          video.addEventListener('canplay', tryPlay);
        }
      }
    } catch (err) {
      console.error('Error accessing webcam for OpenCV:', err);
      if (err instanceof Error) {
        setError(`Failed to access webcam: ${err.message}`);
      } else {
        setError('Failed to access webcam: Unknown error');
      }
    }
  }, [width, height, facingMode, isOpenCVReady, processFrame]);

  const stopWebcam = useCallback(() => {
    console.log('Stopping OpenCV webcam...');

    // Stop animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, [stream]);

  const takeScreenshot = useCallback((): string | null => {
    if (!canvasRef.current) {
      return null;
    }
    return canvasRef.current.toDataURL('image/jpeg', 0.8);
  }, []);

  // Start processing when OpenCV is ready and video is streaming
  useEffect(() => {
    if (isOpenCVReady && isStreaming) {
      processFrame();
    }
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpenCVReady, isStreaming, processFrame]);

  // Update processing mode
  useEffect(() => {
    setCurrentMode(processingMode);
  }, [processingMode]);

  return (
    <div className={`relative ${className}`}>
      {error ? (
        <div className="bg-red-900/20 border-2 border-red-600 rounded-lg p-4 text-center">
          <div className="text-red-400 mb-2">⚠️ OpenCV Error</div>
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
          {/* Hidden video element for capturing frames */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ display: 'none' }}
          />

          {/* Canvas for OpenCV processing and display */}
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full h-full object-cover rounded-lg bg-black"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />

          {/* Debug overlay bottom-right */}
          <div className="absolute bottom-4 right-4 text-[11px] text-gray-300 bg-black/50 rounded px-2 py-1">
            <div>cv: {String(isOpenCVReady)}</div>
            <div>video: {videoRef.current?.videoWidth || 0}×{videoRef.current?.videoHeight || 0}</div>
            <div>mode: {currentMode}</div>
          </div>

          {/* Show start button overlay when not streaming */}
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <div className="text-center">
                <button
                  onClick={startWebcam}
                  disabled={!isOpenCVReady}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mb-2"
                >
                  🔬 Start OpenCV Camera
                </button>
                <div className="text-sm text-gray-400">
                  {isOpenCVReady ? 'OpenCV Ready' : 'Loading OpenCV...'}
                </div>
              </div>
            </div>
          )}

          {/* Camera controls overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
              {isStreaming ? (
                <span className="text-green-400">● LIVE (OpenCV: {currentMode})</span>
              ) : (
                <span className="text-yellow-400">● READY</span>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const screenshot = takeScreenshot();
                  if (screenshot) {
                    const link = document.createElement('a');
                    link.download = `opencv-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`;
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
                disabled={!isOpenCVReady}
                className={`px-3 py-1 rounded text-xs transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed ${isStreaming
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

export default OpenCVWebcamView;