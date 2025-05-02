// components/TabNavigation.jsx
import React from 'react';

export default function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="mb-6 border-b">
      <div className="flex">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'details'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
      </div>
    </div>
  );
}