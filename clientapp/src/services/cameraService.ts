// Service responsible for talking to backend camera endpoints
import type { IndustrialProcessingMode } from '../models/vision';

const BASE_URL = 'http://localhost:5241/api/camera';

export interface CameraStatus {
  isConnected: boolean;
  isStreaming: boolean;
  temperature: number;
  frameRate: number;
  resolution: { width: number; height: number };
  model: string;
  serialNumber: string;
}

export async function getCameraStatus(): Promise<CameraStatus> {
  const response = await fetch(`${BASE_URL}/status`);
  if (!response.ok) throw new Error('Failed to fetch camera status');
  return response.json();
}

export async function startCamera(params: {
  processingMode: IndustrialProcessingMode;
  resolution: { width: number; height: number };
  frameRate: number;
}): Promise<{ success: boolean; streamUrl: string; message?: string }> {
  const response = await fetch(`${BASE_URL}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const errorData = await safeJson(response);
    throw new Error(errorData?.message || `Failed to start camera: ${response.statusText}`);
  }
  return response.json();
}

export async function stopCamera(): Promise<void> {
  const response = await fetch(`${BASE_URL}/stop`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to stop camera');
}

export async function setProcessingMode(mode: IndustrialProcessingMode): Promise<void> {
  const response = await fetch(`${BASE_URL}/processing-mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!response.ok) throw new Error('Failed to change processing mode');
}

export async function takeScreenshot(): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/screenshot`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to take screenshot');
  return response.blob();
}

async function safeJson(response: Response): Promise<any | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}


