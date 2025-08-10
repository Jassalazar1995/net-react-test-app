// Shared vision domain models and enums used across Views and ViewModels

export interface FocusPoint {
  x: number;
  y: number;
  z: number;
}

export interface CornerPoint {
  x: number;
  y: number;
}

export interface ClassificationResult {
  index: number;
  category: number;
  length: number;
  width: number;
  area: number;
  angle: number;
  centerRectX: number;
  centerRectY: number;
}

// Processing modes for OpenCV-based pipeline
export type OpenCvProcessingMode = 'none' | 'edges' | 'contours' | 'threshold' | 'blur';

// Industrial camera may support additional modes on the backend
export type IndustrialProcessingMode = OpenCvProcessingMode | 'defect_detection';


