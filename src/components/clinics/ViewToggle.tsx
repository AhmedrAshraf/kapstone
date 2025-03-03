import React from 'react';
import { Grid, List, Map } from 'lucide-react';

type ViewMode = 'grid' | 'list' | 'map';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-white rounded-lg shadow-sm border p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded-md transition-colors ${
          currentView === 'grid'
            ? 'bg-kapstone-sage text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Grid view"
      >
        <Grid className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded-md transition-colors ${
          currentView === 'list'
            ? 'bg-kapstone-sage text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="List view"
      >
        <List className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('map')}
        className={`p-2 rounded-md transition-colors ${
          currentView === 'map'
            ? 'bg-kapstone-sage text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Map view"
      >
        <Map className="h-5 w-5" />
      </button>
    </div>
  );
}