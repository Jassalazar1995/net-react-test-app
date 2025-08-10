import { useEffect, useMemo, useRef, useState } from 'react';
import type { ClassificationResult, CornerPoint, FocusPoint, OpenCvProcessingMode } from '../models/vision';

export interface IrisViewModelState {
  xPos: string;
  yPos: string;
  zPos: string;
  isLiveMode: boolean;
  isBrightOnly: boolean;
  selectedSettingsTab: number;
  selectedResultsTab: number;
  processingMode: OpenCvProcessingMode;
  consoleMessages: string[];
  manualControlsDisabled: boolean;
  focusPoints: FocusPoint[];
  cornerPoints: CornerPoint[];
  classificationResults: ClassificationResult[];
}

export interface IrisViewModel extends IrisViewModelState {
  setXPos: (value: string) => void;
  setYPos: (value: string) => void;
  setZPos: (value: string) => void;
  setIsLiveMode: (value: boolean) => void;
  setIsBrightOnly: (value: boolean) => void;
  setSelectedSettingsTab: (index: number) => void;
  setSelectedResultsTab: (index: number) => void;
  setProcessingMode: (mode: OpenCvProcessingMode) => void;
  handleManualControl: (action: string, isLargeStep?: boolean, messageType?: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS') => void;
  clearConsole: () => void;
  consoleEndRef: React.RefObject<HTMLDivElement | null>;
  log: (message: string, type?: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS') => void;
}

export function useIrisViewModel(initialMode: OpenCvProcessingMode = 'none'): IrisViewModel {
  const [xPos, setXPos] = useState('0.00');
  const [yPos, setYPos] = useState('0.00');
  const [zPos, setZPos] = useState('0.00');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isBrightOnly, setIsBrightOnly] = useState(false);
  const [selectedSettingsTab, setSelectedSettingsTab] = useState(0);
  const [selectedResultsTab, setSelectedResultsTab] = useState(0);
  const [processingMode, setProcessingMode] = useState<OpenCvProcessingMode>(initialMode);
  const [consoleMessages, setConsoleMessages] = useState<string[]>([
    '[INFO] System initialized',
    '[INFO] Camera connected',
    '[INFO] Ready for operation',
  ]);
  const [manualControlsDisabled, setManualControlsDisabled] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const focusPoints: FocusPoint[] = useMemo(() => (
    [
      { x: 10.5, y: 20.3, z: 5.2 },
      { x: 15.2, y: 25.1, z: 5.1 },
    ]
  ), []);

  const cornerPoints: CornerPoint[] = useMemo(() => (
    [
      { x: 0.0, y: 0.0 },
      { x: 100.0, y: 0.0 },
      { x: 100.0, y: 100.0 },
      { x: 0.0, y: 100.0 },
    ]
  ), []);

  const classificationResults: ClassificationResult[] = useMemo(() => (
    [
      { index: 1, category: 1, length: 2.5, width: 1.2, area: 3.0, angle: 45, centerRectX: 50.2, centerRectY: 75.1 },
      { index: 2, category: 2, length: 3.1, width: 0.8, area: 2.48, angle: 90, centerRectX: 60.5, centerRectY: 80.3 },
    ]
  ), []);

  const logToConsole = (message: string, type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${type}] ${timestamp} - ${message}`;
    setConsoleMessages(prev => [...prev, formattedMessage].slice(-50));
  };

  const handleManualControl = (action: string, isLargeStep = false, messageType: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO') => {
    if (manualControlsDisabled) {
      logToConsole('Manual controls are busy, please wait...', 'WARN');
      return;
    }
    logToConsole(action, messageType);
    setManualControlsDisabled(true);
    const disableDuration = isLargeStep ? 1000 : 500;
    logToConsole(`Manual controls locked for ${disableDuration}ms`, 'WARN');
    setTimeout(() => {
      setManualControlsDisabled(false);
      logToConsole('Manual controls unlocked', 'SUCCESS');
    }, disableDuration);
  };

  const clearConsole = () => {
    setConsoleMessages([]);
    logToConsole('Console cleared', 'INFO');
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleMessages]);

  return {
    xPos,
    yPos,
    zPos,
    isLiveMode,
    isBrightOnly,
    selectedSettingsTab,
    selectedResultsTab,
    processingMode,
    consoleMessages,
    manualControlsDisabled,
    focusPoints,
    cornerPoints,
    classificationResults,
    setXPos,
    setYPos,
    setZPos,
    setIsLiveMode,
    setIsBrightOnly,
    setSelectedSettingsTab,
    setSelectedResultsTab,
    setProcessingMode,
    handleManualControl,
    clearConsole,
    log: (message, type) => logToConsole(message, type),
    consoleEndRef,
  };
}


