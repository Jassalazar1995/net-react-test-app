import { useState } from 'react';
import { Link } from 'react-router-dom';
import WebcamView from '../compontents/WebcamView';

// Mock data interfaces
interface FocusPoint {
  x: number;
  y: number;
  z: number;
}

interface CornerPoint {
  x: number;
  y: number;
}

interface ClassificationResult {
  index: number;
  category: number;
  length: number;
  width: number;
  area: number;
  angle: number;
  centerRectX: number;
  centerRectY: number;
}

const IrisUI = () => {
  // State for various controls
  const [xPos, setXPos] = useState('0.00');
  const [yPos, setYPos] = useState('0.00');
  const [zPos, setZPos] = useState('0.00');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isBrightOnly, setIsBrightOnly] = useState(false);
  const [selectedSettingsTab, setSelectedSettingsTab] = useState(0);
  const [selectedResultsTab, setSelectedResultsTab] = useState(0);

  // Mock data
  const focusPoints: FocusPoint[] = [
    { x: 10.5, y: 20.3, z: 5.2 },
    { x: 15.2, y: 25.1, z: 5.1 },
  ];

  const cornerPoints: CornerPoint[] = [
    { x: 0.0, y: 0.0 },
    { x: 100.0, y: 0.0 },
    { x: 100.0, y: 100.0 },
    { x: 0.0, y: 100.0 },
  ];

  const classificationResults: ClassificationResult[] = [
    { index: 1, category: 1, length: 2.5, width: 1.2, area: 3.0, angle: 45, centerRectX: 50.2, centerRectY: 75.1 },
    { index: 2, category: 2, length: 3.1, width: 0.8, area: 2.48, angle: 90, centerRectX: 60.5, centerRectY: 80.3 },
  ];

  const settingsTabs = ['Manual Controls', 'Autofocus', 'Scanning', 'Classification', 'Hardware'];
  const resultsTabs = ['Focus/Corners', 'Classification'];

  return (
    <div className="min-h-screen bg-[#242424] text-white">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Defect Analyzer - IrisUI</h1>
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
              <h3 className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 font-semibold">Manual Controls</h3>
              <div className="p-4">
                <div className="grid grid-cols-9 grid-rows-7 gap-1 h-64">

                  {/* Position Controls */}
                  <div className="col-span-2 col-start-3 row-span-3 space-y-1">
                    <input
                      type="text"
                      value={xPos}
                      onChange={(e) => setXPos(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-sm"
                      placeholder="X Position"
                    />
                    <input
                      type="text"
                      value={yPos}
                      onChange={(e) => setYPos(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-sm"
                      placeholder="Y Position"
                    />
                    <input
                      type="text"
                      value={zPos}
                      onChange={(e) => setZPos(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-600 rounded px-2 py-1 text-sm"
                      placeholder="Z Position"
                    />
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded text-sm transition-colors">
                      SET XYZ
                    </button>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded text-sm transition-colors">
                      HOME
                    </button>
                  </div>

                  {/* Live Mode Controls */}
                  <div className="col-span-2 col-start-8 row-span-3 space-y-1">
                    <button
                      onClick={() => setIsLiveMode(!isLiveMode)}
                      className={`w-full py-1 px-2 rounded text-sm transition-colors ${isLiveMode ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                    >
                      {isLiveMode ? 'STOP LIVE' : 'START LIVE'}
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 px-2 rounded text-sm transition-colors">
                      REFRESH
                    </button>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isBrightOnly}
                        onChange={(e) => setIsBrightOnly(e.target.checked)}
                        className="rounded"
                      />
                      <span>Bright Only</span>
                    </label>
                  </div>

                  {/* Movement Controls */}
                  {/* Z Controls */}
                  <button className="col-start-1 row-start-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">Z+</button>
                  <button className="col-start-1 row-start-3 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">Z++</button>
                  <button className="col-start-1 row-start-5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">Z-</button>
                  <button className="col-start-1 row-start-6 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">Z--</button>

                  {/* Y Controls */}
                  <button className="col-start-6 row-start-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">↑</button>
                  <button className="col-start-6 row-start-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors">↑↑↑</button>
                  <button className="col-start-6 row-start-5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">↓</button>
                  <button className="col-start-6 row-start-6 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors">↓↓↓</button>

                  {/* X Controls */}
                  <button className="col-start-4 row-start-4 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors">←←←</button>
                  <button className="col-start-5 row-start-4 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">←</button>
                  <button className="col-start-7 row-start-4 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors">→</button>
                  <button className="col-start-8 row-start-4 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs font-bold transition-colors">→→→</button>

                  {/* Additional Controls */}
                  <button className="col-span-2 col-start-3 row-start-5 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs transition-colors">
                    AUTO FOCUS
                  </button>
                  <button className="col-span-2 col-start-8 row-start-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors">
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
                      onClick={() => setSelectedSettingsTab(index)}
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
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors">
                          RELOAD ALL RULES
                        </button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
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
                        <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs transition-colors">
                          LOAD CAMERA
                        </button>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs transition-colors">
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
              <h3 className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 font-semibold">Console</h3>
              <div className="p-4 h-20 overflow-y-auto">
                <div className="text-xs text-green-400 font-mono space-y-1">
                  <div>[INFO] System initialized</div>
                  <div>[INFO] Camera connected</div>
                  <div>[INFO] Ready for operation</div>
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
                  <WebcamView
                    width={640}
                    height={480}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Third Column - Process and Results */}
          <div className="col-span-4 space-y-4">

            {/* Process */}
            <div className="bg-[#1a1a1a] border border-gray-600 rounded-lg">
              <h3 className="bg-[#2a2a2a] px-4 py-2 border-b border-gray-600 font-semibold">Process</h3>
              <div className="p-4 space-y-2">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors">
                  START SCAN
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors">
                  CLASSIFY
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors">
                  ANALYZE
                </button>
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
                      onClick={() => setSelectedResultsTab(index)}
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
                                <tr key={index} className="border-t border-gray-600">
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
                                <tr key={index} className="border-t border-gray-600">
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
                              <tr key={index} className="border-t border-gray-600 hover:bg-[#3a3a3a]">
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

export default IrisUI;