"use client";

import React from "react";

export default function SummaryCards({ result, selectedColumn, onSelectColumn }) {
  // Make sure result exists before trying to access properties
  if (!result) return null;

  // Extract key metrics from the result data
  const { filename, rows, columns, column_names } = result.file_info;
  const { total_missing_values, missing_percentage, duplicate_rows } = result.data_quality;

  // Determine card colors based on thresholds
  const getMissingColor = (percentage) => {
    if (percentage < 5) return "text-green-600";
    if (percentage < 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getDuplicateColor = (count) => {
    if (count === 0) return "text-green-600";
    if (count < rows * 0.05) return "text-yellow-600"; // Less than 5% of rows
    return "text-red-600";
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Data Summary</h3>
      
      {/* File info header with filename */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500">Analyzing file:</span>
        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
          {filename}
        </span>
      </div>
      
      {/* Main statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rows Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-500">Total Rows</div>
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H9a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div className="text-2xl font-bold">{rows.toLocaleString()}</div>
        </div>

        {/* Total Columns Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-500">Total Columns</div>
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div className="text-2xl font-bold">{columns}</div>
        </div>

        {/* Missing Values Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-500">Missing Values</div>
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className={`text-2xl font-bold ${getMissingColor(parseFloat(missing_percentage))}`}>
            {missing_percentage.toFixed(2)}%
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${getMissingColor(parseFloat(missing_percentage)).replace('text', 'bg')}`}
              style={{ width: `${Math.min(missing_percentage, 100)}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {total_missing_values.toLocaleString()} cells
          </div>
        </div>

        {/* Duplicate Rows Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <div className="text-sm text-gray-500">Duplicate Rows</div>
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
              <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div className={`text-2xl font-bold ${getDuplicateColor(duplicate_rows)}`}>
            {duplicate_rows.toLocaleString()}
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${getDuplicateColor(duplicate_rows).replace('text', 'bg')}`}
              style={{ width: `${Math.min((duplicate_rows / rows) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {((duplicate_rows / rows) * 100).toFixed(2)}% of rows
          </div>
        </div>
      </div>

      {/* Column names section - UPDATED to make columns selectable */}
      <div className="mt-6 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="font-medium">Column Names ({column_names.length})</div>
          {selectedColumn && (
            <button
              className="text-xs text-blue-600 hover:text-blue-800"
              onClick={() => onSelectColumn(null)}
            >
              Clear Selection
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {column_names.map((col, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded text-xs cursor-pointer ${
                selectedColumn === col
                  ? "bg-blue-100 text-blue-800 border border-blue-300"
                  : "bg-gray-100 text-gray-800"
              }`}
              onClick={() => onSelectColumn(col)}
            >
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}