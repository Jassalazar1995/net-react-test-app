import { Link } from 'react-router-dom';
import OpenCVWebcamView from '../compontents/OpenCVWebcamView';
import { useIrisViewModel } from '../viewmodels/useIrisViewModel';

const IrisUICV = () => {
  const {
    xPos, yPos, zPos,
    isLiveMode, isBrightOnly,
    selectedSettingsTab, selectedResultsTab,
    processingMode,
    consoleMessages, manualControlsDisabled,
    focusPoints, cornerPoints, classificationResults,
    setXPos, setYPos, setZPos,
    setIsLiveMode, setIsBrightOnly,
    setSelectedSettingsTab, setSelectedResultsTab,
    setProcessingMode,
    handleManualControl,
    clearConsole,
    log,
    consoleEndRef,
  } = useIrisViewModel('none');

  const settingsTabs = ['Manual Controls', 'Autofocus', 'Scanning', 'Classification', 'Hardware'];
  const resultsTabs = ['Focus/Corners', 'Classification'];

  return (
    <div className="min-h-screen bg-[#242424] text-white">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Defect Analyzer - IrisUI with OpenCV</h1>
          <Link
            to="/"
            className="bg-[#646cff] hover:bg-[#535bf2] text-white px-4 py-2 rounded transition-colors duration-200"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Main Layout - 3 columns */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">

          {/* First Column - Controls and Settings */}
          <div className="col-span-4 space-y-4">

            {/* Manual Controls */}
            <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg">
              <div className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 flex justify-between items-center">
                <h3 className="font-semibold">Manual Controls</h3>
                <div className={`flex items-center space-x-2 ${manualControlsDisabled ? 'text-yellow-400' : 'text-green-400'}`}>
                  <div className={`w-2 h-2 rounded-full ${manualControlsDisabled ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                  <span className="text-xs">{manualControlsDisabled ? 'BUSY' : 'READY'}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-9 grid-rows-7 gap-1 h-64">

                  {/* Position Controls */}
                  <div className="col-span-2 col-start-3 row-span-3 space-y-1">
                    <input
                      type="text"
                      value={xPos}
                      onChange={(e) => {
                        setXPos(e.target.value);
                        if (e.target.value !== xPos) {
                          log(`X position changed to: ${e.target.value}`, 'INFO');
                        }
                      }}
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-sm"
                      placeholder="X Position"
                    />
                    <input
                      type="text"
                      value={yPos}
                      onChange={(e) => {
                        setYPos(e.target.value);
                        if (e.target.value !== yPos) {
                          log(`Y position changed to: ${e.target.value}`, 'INFO');
                        }
                      }}
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-sm"
                      placeholder="Y Position"
                    />
                    <input
                      type="text"
                      value={zPos}
                      onChange={(e) => {
                        setZPos(e.target.value);
                        if (e.target.value !== zPos) {
                          log(`Z position changed to: ${e.target.value}`, 'INFO');
                        }
                      }}
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-sm"
                      placeholder="Z Position"
                    />
                    <button
                      onClick={() => handleManualControl(`Position set to X:${xPos}, Y:${yPos}, Z:${zPos}`, true, 'SUCCESS')}
                      disabled={manualControlsDisabled}
                      className={`w-full py-1 px-2 rounded text-sm transition-colors ${manualControlsDisabled
                          ? 'bg-blue-800 text-blue-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                      SET XYZ
                    </button>
                    <button
                      onClick={() => handleManualControl('Moving to home position', true)}
                      disabled={manualControlsDisabled}
                      className={`w-full py-1 px-2 rounded text-sm transition-colors ${manualControlsDisabled
                          ? 'bg-green-800 text-green-300 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                      HOME
                    </button>
                  </div>

                  {/* Live Mode Controls */}
                  <div className="col-span-2 col-start-8 row-span-3 space-y-1">
                    <button
                      onClick={() => {
                        const newLiveMode = !isLiveMode;
                        setIsLiveMode(newLiveMode);
                        log(`Live mode ${newLiveMode ? 'started' : 'stopped'}`, newLiveMode ? 'SUCCESS' : 'WARN');
                      }}
                      className={`w-full py-1 px-2 rounded text-sm transition-colors ${isLiveMode ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                    >
                      {isLiveMode ? 'STOP LIVE' : 'START LIVE'}
                    </button>
                    <button
                      onClick={() => log('Camera feed refreshed', 'INFO')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-sm transition-colors"
                    >
                      REFRESH
                    </button>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isBrightOnly}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsBrightOnly(checked);
                          log(`Bright Only mode ${checked ? 'enabled' : 'disabled'}`, 'INFO');
                        }}
                        className="rounded"
                      />
                      <span>Bright Only</span>
                    </label>
                  </div>

                  {/* Movement Controls */}
                  {/* Z Controls */}
                  <button
                    onClick={() => handleManualControl('Z axis moved up (small step)', false)}
                    disabled={manualControlsDisabled}
                    className={`col-start-1 row-start-2 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    Z+
                  </button>
                  <button
                    onClick={() => handleManualControl('Z axis moved up (large step)', true)}
                    disabled={manualControlsDisabled}
                    className={`col-start-1 row-start-3 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    Z++
                  </button>
                  <button
                    onClick={() => handleManualControl('Z axis moved down (small step)', false)}
                    disabled={manualControlsDisabled}
                    className={`col-start-1 row-start-5 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    Z-
                  </button>
                  <button
                    onClick={() => handleManualControl('Z axis moved down (large step)', true)}
                    disabled={manualControlsDisabled}
                    className={`col-start-1 row-start-6 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    Z--
                  </button>

                  {/* Y Controls */}
                  <button
                    onClick={() => handleManualControl('Y axis moved up (small step)', false)}
                    disabled={manualControlsDisabled}
                    className={`col-start-6 row-start-2 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleManualControl('Y axis moved up (large step)', true)}
                    disabled={manualControlsDisabled}
                    className={`col-start-6 row-start-1 rounded text-xs font-bold transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    ↑↑↑
                  </button>
                  <button
                    onClick={() => handleManualControl('Y axis moved down (small step)', false)}
                    disabled={manualControlsDisabled}
                    className={`col-start-6 row-start-5 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleManualControl('Y axis moved down (large step)', true)}
                    disabled={manualControlsDisabled}
                    className={`col-start-6 row-start-6 rounded text-xs font-bold transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    ↓↓↓
                  </button>

                  {/* X Controls */}
                  <button
                    onClick={() => handleManualControl('X axis moved left (large step)', true)}
                    disabled={manualControlsDisabled}
                    className={`col-start-4 row-start-4 rounded text-xs font-bold transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    ←←←
                  </button>
                  <button
                    onClick={() => handleManualControl('X axis moved left (small step)', false)}
                    disabled={manualControlsDisabled}
                    className={`col-start-5 row-start-4 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    ←
                  </button>
                  <button
                    onClick={() => handleManualControl('X axis moved right (small step)', false)}
                    disabled={manualControlsDisabled}
                    className={`col-start-7 row-start-4 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    →
                  </button>
                  <button
                    onClick={() => handleManualControl('X axis moved right (large step)', true)}
                    disabled={manualControlsDisabled}
                    className={`col-start-8 row-start-4 rounded text-xs font-bold transition-colors ${manualControlsDisabled
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                  >
                    →→→
                  </button>

                  {/* Additional Controls */}
                  <button
                      onClick={() => handleManualControl('Auto focus initiated', true, 'SUCCESS')}
                    disabled={manualControlsDisabled}
                    className={`col-span-2 col-start-3 row-start-5 rounded text-xs transition-colors ${manualControlsDisabled
                        ? 'bg-orange-800 text-orange-300 cursor-not-allowed'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                  >
                    AUTO FOCUS
                  </button>
                  <button
                      onClick={() => log('Image saved to disk', 'SUCCESS')}
                    className="col-span-2 col-start-8 row-start-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors"
                  >
                    SAVE IMAGE
                  </button>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg flex-1">
              <h3 className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 font-semibold">Settings</h3>
              <div className="p-4">
                {/* Tab Headers */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {settingsTabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedSettingsTab(index);
                        log(`Settings tab changed to: ${tab}`, 'INFO');
                      }}
                      className={`px-3 py-1 text-xs rounded transition-colors ${selectedSettingsTab === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-3">
                  {selectedSettingsTab === 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      <label className="text-xs">δX:</label>
                      <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="0.1" />
                      <label className="text-xs">ΔX:</label>
                      <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="1.0" />
                      <label className="text-xs">δY:</label>
                      <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="0.1" />
                      <label className="text-xs">ΔY:</label>
                      <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="1.0" />
                      <label className="text-xs">δZ:</label>
                      <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="0.01" />
                      <label className="text-xs">ΔZ:</label>
                      <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="0.1" />
                    </div>
                  )}
                  {selectedSettingsTab === 1 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <label className="text-xs">Coarse Span:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="2.0" />
                        <label className="text-xs">Fine Span:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="0.5" />
                      </div>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2 text-xs">
                          <input type="checkbox" className="rounded" />
                          <span>Bright Only Focus</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs">
                          <input type="checkbox" className="rounded" />
                          <span>Continuous Focus</span>
                        </label>
                      </div>
                    </div>
                  )}
                  {selectedSettingsTab === 2 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <label className="text-xs">Left:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="0" />
                        <label className="text-xs">Right:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="100" />
                        <label className="text-xs">Top:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="0" />
                        <label className="text-xs">Bottom:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="100" />
                      </div>
                      <div className="space-y-1">
                        <label className="flex items-center space-x-2 text-xs">
                          <input type="checkbox" className="rounded" />
                          <span>Bright Only Scan</span>
                        </label>
                        <label className="flex items-center space-x-2 text-xs">
                          <input type="checkbox" className="rounded" />
                          <span>Continuous Scan</span>
                        </label>
                      </div>
                    </div>
                  )}
                  {selectedSettingsTab === 3 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <label className="text-xs">Bright Threshold:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="128" />
                        <label className="text-xs">Dark Threshold:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="64" />
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => log('All classification rules reloaded', 'SUCCESS')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          RELOAD ALL RULES
                        </button>
                        <button
                          onClick={() => log('Bright classification rules loaded', 'SUCCESS')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          LOAD BRIGHT RULES
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedSettingsTab === 4 && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <label className="text-xs">FoV Height:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="480" />
                        <label className="text-xs">FoV Width:</label>
                        <input type="text" className="bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-xs" defaultValue="640" />
                      </div>
                      <div className="space-y-1">
                        <button
                          onClick={() => log('Camera loaded successfully', 'SUCCESS')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          LOAD CAMERA
                        </button>
                        <button
                          onClick={() => log('Configuration saved', 'SUCCESS')}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs transition-colors"
                        >
                          SAVE CONFIG AS
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Console */}
            <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg h-32">
              <div className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 flex justify-between items-center">
                <h3 className="font-semibold">Console</h3>
                    <button
                      onClick={clearConsole}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="p-4 h-20 overflow-y-auto">
                <div className="text-xs font-mono space-y-1">
                  {consoleMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`${message.includes('[INFO]') ? 'text-green-400' :
                          message.includes('[WARN]') ? 'text-yellow-400' :
                            message.includes('[ERROR]') ? 'text-red-400' :
                              message.includes('[SUCCESS]') ? 'text-blue-400' :
                                'text-gray-300'
                        }`}
                    >
                      {message}
                    </div>
                  ))}
                  <div ref={consoleEndRef} />
                </div>
              </div>
            </div>
          </div>

          {/* Second Column - Image Display */}
          <div className="col-span-4">
            <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg h-full">
              <h3 className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 font-semibold">Current View</h3>
              <div className="p-4 h-full flex items-center justify-center">
                <div className="w-full h-96">
                  <OpenCVWebcamView
                    width={640}
                    height={480}
                    className="w-full h-full"
                    processingMode={processingMode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Third Column - Process and Results */}
          <div className="col-span-4 space-y-4">

            {/* Process */}
            <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg">
              <h3 className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 font-semibold">OpenCV Processing</h3>
              <div className="p-4 space-y-3">
                {/* Processing Mode Selection */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Processing Mode:</label>
                  <select
                    value={processingMode}
                       onChange={(e) => {
                      const newMode = e.target.value as any;
                      setProcessingMode(newMode);
                      log(`Processing mode changed to: ${newMode}`, 'INFO');
                    }}
                    className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="none">Original (No Processing)</option>
                    <option value="edges">Edge Detection (Canny)</option>
                    <option value="contours">Contour Detection</option>
                    <option value="threshold">Binary Threshold</option>
                    <option value="blur">Gaussian Blur</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <button
                  onClick={() => log('Scan started', 'SUCCESS')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
                >
                  START SCAN
                </button>
                <button
                  onClick={() => log('Classification process initiated', 'SUCCESS')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                >
                  CLASSIFY
                </button>
                <button
                  onClick={() => log('Analysis started', 'SUCCESS')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                >
                  ANALYZE
                </button>

                {/* Processing Info */}
                <div className="bg-[#2a2a2a] rounded p-3">
                  <div className="text-sm text-gray-300 mb-2">Current Mode: <span className="text-blue-400">{processingMode}</span></div>
                  <div className="text-xs text-gray-400">
                    {processingMode === 'none' && 'Showing original camera feed'}
                    {processingMode === 'edges' && 'Detecting edges using Canny algorithm'}
                    {processingMode === 'contours' && 'Finding and highlighting object contours'}
                    {processingMode === 'threshold' && 'Converting to binary black/white image'}
                    {processingMode === 'blur' && 'Applying Gaussian blur filter'}
                  </div>
                </div>

                <div className="bg-[#2a2a2a] rounded p-2">
                  <div className="text-sm text-gray-300 mb-1">Progress:</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg flex-1">
              <h3 className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 font-semibold">Results</h3>
              <div className="p-4">
                {/* Tab Headers */}
                <div className="flex gap-1 mb-4">
                  {resultsTabs.map((tab, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedResultsTab(index);
                        log(`Results tab changed to: ${tab}`, 'INFO');
                      }}
                      className={`px-3 py-1 text-xs rounded transition-colors ${selectedResultsTab === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {selectedResultsTab === 0 && (
                    <div className="space-y-4">
                      {/* Focus Points */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Focus Points:</h4>
                        <div className="bg-[#2a2a2a] rounded overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-[#3a3a3a]">
                              <tr>
                                <th className="px-2 py-1 text-left">X pos</th>
                                <th className="px-2 py-1 text-left">Y pos</th>
                                <th className="px-2 py-1 text-left">Z pos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {focusPoints.map((point, index) => (
                                <tr
                                  key={index}
                                   onClick={() => log(`Focus point selected: X:${point.x}, Y:${point.y}, Z:${point.z}`, 'INFO')}
                                  className="border-t border-gray-600 hover:bg-[#3a3a3a] cursor-pointer"
                                >
                                  <td className="px-2 py-1">{point.x}</td>
                                  <td className="px-2 py-1">{point.y}</td>
                                  <td className="px-2 py-1">{point.z}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Corner Points */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Scan Corner Points:</h4>
                        <div className="bg-[#2a2a2a] rounded overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-[#3a3a3a]">
                              <tr>
                                <th className="px-2 py-1 text-left">X pos</th>
                                <th className="px-2 py-1 text-left">Y pos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cornerPoints.map((point, index) => (
                                <tr
                                  key={index}
                                   onClick={() => log(`Corner point selected: X:${point.x}, Y:${point.y}`, 'INFO')}
                                  className="border-t border-gray-600 hover:bg-[#3a3a3a] cursor-pointer"
                                >
                                  <td className="px-2 py-1">{point.x}</td>
                                  <td className="px-2 py-1">{point.y}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedResultsTab === 1 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Classification Results:</h4>
                      <div className="bg-[#2a2a2a] rounded overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-[#3a3a3a]">
                            <tr>
                              <th className="px-2 py-1 text-left">Code</th>
                              <th className="px-2 py-1 text-left">Length</th>
                              <th className="px-2 py-1 text-left">Width</th>
                              <th className="px-2 py-1 text-left">Area</th>
                              <th className="px-2 py-1 text-left">Angle</th>
                            </tr>
                          </thead>
                          <tbody>
                            {classificationResults.map((result, index) => (
                              <tr
                                key={index}
                                 onClick={() => log(`Classification result selected: Code ${result.category.toString().padStart(2, '0')}, Area: ${result.area}`, 'INFO')}
                                className="border-t border-gray-600 hover:bg-[#3a3a3a] cursor-pointer"
                              >
                                <td className="px-2 py-1">{result.category.toString().padStart(2, '0')}</td>
                                <td className="px-2 py-1">{result.length}</td>
                                <td className="px-2 py-1">{result.width}</td>
                                <td className="px-2 py-1">{result.area}</td>
                                <td className="px-2 py-1">{result.angle}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrisUICV;