'use client';
import { useState } from 'react';
import TabNavigation from './TabNavigation';
import OverviewTab from './OverviewTab';
import SummaryCards from './SummaryCards';
import ColumnAnalysisGrid from './ColumnAnalysisGrid';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // Default to 'overview' tab

  const handleFileChange = (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      // Check if it's a CSV file
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        setFile(null);
      } else {
        setFile(selectedFile);
        setError(null);
        // Reset results when a new file is selected
        setResult(null);
      }
    }
  };

  const handleColumnSelect = (columnName) => {
    if (selectedColumn === columnName) {
      setSelectedColumn(null);
    } else {
      setSelectedColumn(columnName);
      // When a column is selected, switch to details tab
      setActiveTab('details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file first');
      return;
    }
    // Start upload
    setIsUploading(true);
    setError(null);
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    try {
      // Call FastAPI endpoint
      const response = await fetch('http://localhost:8000/upload-csv/', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      // Parse response
      const data = await response.json();
      setResult(data);
      setActiveTab('overview'); // Switch to overview tab after successful upload
    } catch (err) {
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  // Function to render the active tab content
  const renderTabContent = () => {
    if (!result) return null;
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            result={result}
            onNavigateToDetails={() => setActiveTab('details')}
          />
        );
      case 'details':
        return (
          <>
            <SummaryCards 
              result={result}
              selectedColumn={selectedColumn}
              onSelectColumn={handleColumnSelect}
            /> 
            <ColumnAnalysisGrid 
              result={result}
              selectedColumn={selectedColumn}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload CSV File</h2>
      <form onSubmit={handleSubmit}>
        {/* File upload form - unchanged */}
        <div className="mb-4">
          <label 
            htmlFor="csv-upload"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select a CSV file to analyze
          </label>
          <input 
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 
            file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 
            hover:file:bg-blue-100"
          />
        </div>
        
        {file && (
          <div className="mb-4 p-2 bg-green-50 text-green-700 rounded flex items-center">
            <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path 
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            File selected: <span className="font-medium">{file.name}</span>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={!file || isUploading}
        >
          {isUploading ? 'Analyzing...' : 'Analyze CSV'}
        </button>
      </form>
      
      {result && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Analysis Results:</h3>
          {/* Tab Navigation - only shown when results are available */}
          <TabNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          {/* Tab Content */}
          {renderTabContent()}
          {/* Raw JSON Data (keep this for debugging) */}
          <div className="mt-4">
            <details>
              <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                View Raw JSON Data
              </summary>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}