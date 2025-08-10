import { useCallback, useEffect, useRef, useState } from 'react';
import type { IndustrialProcessingMode } from '../models/vision';
import type { CameraStatus } from '../services/cameraService';
import { getCameraStatus, setProcessingMode, startCamera, stopCamera, takeScreenshot } from '../services/cameraService';

export interface IndustrialCameraVM {
  isStreaming: boolean;
  loading: boolean;
  error: string | null;
  status: CameraStatus;
  currentMode: IndustrialProcessingMode;
  streamUrl: string;
  streamRefresh: number;
  checkCameraStatus: () => Promise<void>;
  startCamera: () => Promise<void>;
  stopCamera: () => Promise<void>;
  changeProcessingMode: (mode: IndustrialProcessingMode) => Promise<void>;
  takeScreenshot: () => Promise<string | null>;
}

export function useIndustrialCameraViewModel(initialMode: IndustrialProcessingMode = 'none'): IndustrialCameraVM {
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<IndustrialProcessingMode>(initialMode);
  const [status, setStatus] = useState<CameraStatus>({
    isConnected: false,
    isStreaming: false,
    temperature: 0,
    frameRate: 0,
    resolution: { width: 2048, height: 1536 },
    model: 'Alvium 1800 U-2050c',
    serialNumber: 'Unknown',
  });
  const [streamUrl, setStreamUrl] = useState('');
  const [streamRefresh, setStreamRefresh] = useState(0);
  const statusIntervalRef = useRef<number | null>(null);
  const streamIntervalRef = useRef<number | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      if (status.isConnected && !error) return;
      const result = await getCameraStatus();
      setStatus(result);
      if (!result.isConnected && !error?.includes('not detected')) {
        setError('Allied Vision Alvium 1800 U-2050c not detected. Please ensure camera is connected via USB 3.1.');
      } else if (result.isConnected && error?.includes('not detected')) {
        setError(null);
      }
    } catch (err) {
      setError('Backend camera service is not running. Please start the camera service.');
      setStatus(prev => ({ ...prev, isConnected: false, isStreaming: false }));
    }
  }, [error, status.isConnected]);

  useEffect(() => {
    checkStatus();
    statusIntervalRef.current = window.setInterval(checkStatus, 10000);
    return () => {
      if (statusIntervalRef.current) window.clearInterval(statusIntervalRef.current);
    };
  }, [checkStatus]);

  const start = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await startCamera({
        processingMode: currentMode,
        resolution: { width: status.resolution.width, height: status.resolution.height },
        frameRate: 30,
      });
      if (result.success) {
        setStreamUrl(result.streamUrl);
        setIsStreaming(true);
      } else {
        throw new Error(result.message || 'Failed to start camera');
      }
    } catch (err: any) {
      setError(`Failed to start camera: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [currentMode, status.resolution]);

  const stop = useCallback(async () => {
    try {
      setLoading(true);
      await stopCamera();
      setStreamUrl('');
      setIsStreaming(false);
    } catch (err) {
      // swallow
    } finally {
      setLoading(false);
    }
  }, []);

  const changeMode = useCallback(async (mode: IndustrialProcessingMode) => {
    if (!isStreaming) return;
    try {
      await setProcessingMode(mode);
      setCurrentMode(mode);
    } catch (err) {
      // ignore
    }
  }, [isStreaming]);

  const makeScreenshot = useCallback(async (): Promise<string | null> => {
    try {
      const blob = await takeScreenshot();
      return URL.createObjectURL(blob);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (isStreaming) {
      streamIntervalRef.current = window.setInterval(() => setStreamRefresh(Date.now()), 500);
    } else if (streamIntervalRef.current) {
      window.clearInterval(streamIntervalRef.current);
    }
    return () => {
      if (streamIntervalRef.current) window.clearInterval(streamIntervalRef.current);
    };
  }, [isStreaming]);

  useEffect(() => {
    // when external prop changes to initialMode later, optional support could be added
  }, []);

  return {
    isStreaming,
    loading,
    error,
    status,
    currentMode,
    streamUrl,
    streamRefresh,
    checkCameraStatus: checkStatus,
    startCamera: start,
    stopCamera: stop,
    changeProcessingMode: changeMode,
    takeScreenshot: makeScreenshot,
  };
}


