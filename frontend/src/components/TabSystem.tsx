import React from 'react';
export function TabSystem({
  activeTab,
  setActiveTab,
  children
}) {
  return <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button onClick={() => setActiveTab('frames')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'frames' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Violation Frames
          </button>
          <button onClick={() => setActiveTab('list')} className={`px-6 py-3 text-sm font-medium ${activeTab === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Violations List
          </button>
        </nav>
      </div>
      <div className="p-6">{children}</div>
    </div>;
}