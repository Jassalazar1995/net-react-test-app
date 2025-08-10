import { useRef, useEffect, useState, useCallback } from 'react';

interface UseWebcamOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  autoStart?: boolean;
}

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  error: string | null;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  takeScreenshot: () => string | null;
  stream: MediaStream | null;
}

export const useWebcam = ({
  width = 640,
  height = 480,
  facingMode = 'user',
  autoStart = false
}: UseWebcamOptions = {}): UseWebcamReturn => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountedRef = useRef(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startWebcam = useCallback(async () => {
    try {
      console.log('Starting webcam...');
      setError(null);
      setIsStreaming(false);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode
        },
        audio: false
      });

      console.log('Media stream obtained:', mediaStream);
      console.log('Video tracks:', mediaStream.getVideoTracks());

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Use a more reliable approach with multiple event listeners
        const handleCanPlay = async () => {
          if (!mountedRef.current) return;
          console.log('Video can play');
          try {
            await video.play();
            console.log('Video playing successfully');
            if (mountedRef.current) {
              setIsStreaming(true);
            }
            // Clean up event listeners
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          } catch (playError) {
            console.error('Error playing video:', playError);
            if (mountedRef.current) {
              setError('Failed to start video playback');
            }
          }
        };

        const handleLoadedMetadata = async () => {
          if (!mountedRef.current) return;
          console.log('Video metadata loaded');
          try {
            await video.play();
            console.log('Video playing successfully');
            if (mountedRef.current) {
              setIsStreaming(true);
            }
            // Clean up event listeners
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          } catch (playError) {
            console.error('Error playing video:', playError);
            if (mountedRef.current) {
              setError('Failed to start video playback');
            }
          }
        };

        // Add event listeners (ensure we remove the exact same handlers later)
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        // Also try immediate play with a small delay to allow for stream setup
        setTimeout(async () => {
          if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
            console.log('Video ready state is good, trying to play immediately');
            try {
              await video.play();
              console.log('Video playing successfully (immediate)');
              setIsStreaming(true);
              // Clean up event listeners
              video.removeEventListener('canplay', handleCanPlay);
              video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            } catch (playError) {
              console.log('Immediate play failed, waiting for events:', playError);
            }
          }
        }, 100);
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      if (err instanceof Error) {
        setError(`Failed to access webcam: ${err.message}`);
      } else {
        setError('Failed to access webcam: Unknown error');
      }
    }
  }, [width, height, facingMode]);

  const stopWebcam = useCallback(() => {
    console.log('Stopping webcam...');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      const video = videoRef.current;
      video.srcObject = null;
      // Note: event listeners are removed in the start handlers after play
    }
    setIsStreaming(false);
  }, [stream]);

  const takeScreenshot = useCallback((): string | null => {
    if (!videoRef.current || !isStreaming) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [isStreaming]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      startWebcam();
    }
  }, [autoStart, startWebcam]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (stream && stream.active) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    isStreaming,
    error,
    startWebcam,
    stopWebcam,
    takeScreenshot,
    stream
  };
};