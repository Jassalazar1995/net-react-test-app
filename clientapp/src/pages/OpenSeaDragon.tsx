import React, { useState } from 'react';
// OpenSeaDragon.tsx
// Main entry for the OpenSeadragon demo app, providing navigation between modes and a home page description.
import { Layers, Grid, Home, GitCompare, Edit3 } from 'lucide-react';
import { SequenceMode } from '../compontents/SequenceMode';
import { ComparisonMode } from '../compontents/ComparisonMode';
import { OverlayMode } from '../compontents/OverLayMode';
import { SequenceOverlayMode } from '../compontents/SequenceOverlayMode';

declare global {
  interface Window {
    OpenSeadragon: any;
  }
}

// Main Navigation Component
const Navigation: React.FC<{ currentPage: string; setCurrentPage: (page: string) => void }> = ({ currentPage, setCurrentPage }) => {
  // Navigation bar for switching between Home, Sequence, Comparison, and Overlay modes
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex gap-2">
        <button
          onClick={() => setCurrentPage('home')}
          className={`px-4 py-2 rounded flex items-center gap-2 transition ${currentPage === 'home' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          <Home size={16} />
          Home
        </button>
        <button
          onClick={() => setCurrentPage('sequence')}
          className={`px-4 py-2 rounded flex items-center gap-2 transition ${currentPage === 'sequence' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          <Grid size={16} />
          Sequence Mode
        </button>
        <button
          onClick={() => setCurrentPage('sequenceOverlay')}
          className={`px-4 py-2 rounded flex items-center gap-2 transition ${currentPage === 'sequenceOverlay' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          <Edit3 size={16} />
          Sequence + Measure
        </button>
        <button
          onClick={() => setCurrentPage('comparison')}
          className={`px-4 py-2 rounded flex items-center gap-2 transition ${currentPage === 'comparison' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          <GitCompare size={16} />
          Comparison Mode
        </button>
        <button
          onClick={() => setCurrentPage('overlay')}
          className={`px-4 py-2 rounded flex items-center gap-2 transition ${currentPage === 'overlay' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
        >
          <Edit3 size={16} />
          Overlay Mode
        </button>
      </div>
    </div>
  );
};

// Home Page Component
const HomePage: React.FC = () => {
  // Simple home page with descriptions of each mode
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome to OpenSeadragon Demo</h2>
      <p className="text-gray-300 mb-6">
        This demo showcases three different modes of OpenSeadragon, a powerful viewer for high-resolution zoomable images.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 p-4 rounded">
          <Grid className="text-blue-500 mb-2" size={32} />
          <h3 className="font-semibold text-lg mb-2">Sequence Mode</h3>
          <p className="text-gray-300 text-sm">
            Navigate through multiple images like a slideshow with playback controls and reference strip.
          </p>
        </div>

        <div className="bg-gray-700 p-4 rounded">
          <GitCompare className="text-green-500 mb-2" size={32} />
          <h3 className="font-semibold text-lg mb-2">Comparison Mode</h3>
          <p className="text-gray-300 text-sm">
            View two images side-by-side with synchronized panning and zooming for detailed comparison.
          </p>
        </div>

        <div className="bg-gray-700 p-4 rounded">
          <Edit3 className="text-purple-500 mb-2" size={32} />
          <h3 className="font-semibold text-lg mb-2">Overlay Mode</h3>
          <p className="text-gray-300 text-sm">
            Add annotations and overlays to images with interactive elements and drawing capabilities.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-700 rounded">
        <h3 className="font-semibold mb-2">Sample Images Used:</h3>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Duomo - Cathedral architecture</li>
          <li>• Highsmith - High-resolution artwork</li>
        </ul>
      </div>
    </div>
  );
};

// Main App Component
const OpenSeadragonDemo: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Layers className="text-blue-500" />
            OpenSeadragon Demo
          </h1>
          <p className="text-gray-400">Interactive gigapixel image viewer with multiple modes</p>
        </div>

        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {currentPage === 'home' && <HomePage />}
        {currentPage === 'sequence' && <SequenceMode />}
        {currentPage === 'sequenceOverlay' && <SequenceOverlayMode />}
        {currentPage === 'comparison' && <ComparisonMode />}
        {currentPage === 'overlay' && <OverlayMode />}
      </div>
    </div>
  );
};

export default OpenSeadragonDemo;