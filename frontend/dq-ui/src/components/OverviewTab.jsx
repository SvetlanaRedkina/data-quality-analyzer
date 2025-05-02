import React from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

export default function OverviewTab({ result, onNavigateToDetails }) {
  // Utility function for safely accessing nested properties
  const safeGet = (obj, path, defaultValue = 0) => {
    return path.split('.').reduce((prev, curr) => {
      return (prev && prev[curr] !== undefined) ? prev[curr] : defaultValue;
    }, obj);
  };

  if (!result) return null;

  const { file_info, data_quality, column_analysis } = result;

  // Data preparation for Data Type Distribution chart
  const prepareDataTypeDistribution = () => {
    try {
      const typeCounts = {};
      
      // Count column types
      Object.values(column_analysis).forEach(column => {
        const type = column.data_type;
        const baseType = type.includes('int') || type.includes('float') ? 'numeric' :
                        type.includes('datetime') ? 'datetime' : 'string';
        
        typeCounts[baseType] = (typeCounts[baseType] || 0) + 1;
      });
      
      // Convert to array format for PieChart
      return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    } catch (error) {
      console.error("Error preparing data type distribution:", error);
      return [];
    }
  };

  // Data preparation for Issues Distribution chart
  const prepareIssuesDistribution = () => {
    try {
      // Simplified issues data - just missing values and duplicate rows
      const issues = [
        {
          name: 'Missing Values',
          value: safeGet(data_quality, 'missing_percentage', 0),
          tooltip: `${safeGet(data_quality, 'total_missing_values', 0).toLocaleString()} cells`
        }
      ];
      
      // Add duplicate rows percentage if any exist
      if (safeGet(data_quality, 'duplicate_rows', 0) > 0) {
        const duplicatePercentage = (safeGet(data_quality, 'duplicate_rows', 0) / safeGet(file_info, 'rows', 1)) * 100;
        issues.push({
          name: 'Duplicate Rows',
          value: duplicatePercentage,
          tooltip: `${safeGet(data_quality, 'duplicate_rows', 0).toLocaleString()} rows`
        });
      }
      
      return issues;
    } catch (error) {
      console.error("Error preparing issues distribution:", error);
      return [];
    }
  };

  // Prepare data for charts
  const dataTypeData = prepareDataTypeDistribution();
  const issuesData = prepareIssuesDistribution();

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Data Overview</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Data Type Distribution Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-medium mb-2">Data Type Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dataTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} columns`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Data Quality Overview Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-medium mb-2">Data Completeness</h4>
          <div className="h-64">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600">
                  {(100 - safeGet(data_quality, 'missing_percentage', 0)).toFixed(1)}%
                </div>
                <div className="mt-2 text-gray-500">Completeness Score</div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(100 - safeGet(data_quality, 'missing_percentage', 0))}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Issues Summary Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-medium mb-2">Issues Distribution</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={issuesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 'dataMax + 5']}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip
                  formatter={(value, name, props) => {
                    return [`${value.toFixed(2)}% (${props.payload.tooltip})`, 'Percentage'];
                  }}
                />
                <Legend />
                <Bar dataKey="value" name="Percentage (%)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Action Items Card */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-medium mb-2">Suggested Actions</h4>
          <ul className="space-y-2">
            {safeGet(data_quality, 'missing_percentage', 0) > 5 && (
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span>Address missing values ({safeGet(data_quality, 'missing_percentage', 0).toFixed(1)}% of data)</span>
                <button
                  className="ml-auto text-xs text-blue-600"
                  onClick={onNavigateToDetails}
                >
                  View Details
                </button>
              </li>
            )}
            {safeGet(data_quality, 'duplicate_rows', 0) > 0 && (
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span>Check {safeGet(data_quality, 'duplicate_rows', 0)} duplicate rows</span>
                <button
                  className="ml-auto text-xs text-blue-600"
                  onClick={onNavigateToDetails}
                >
                  View Details
                </button>
              </li>
            )}
            {Object.values(column_analysis).some(col =>
              (safeGet(col, 'leading_whitespace', 0) > 0 || safeGet(col, 'trailing_whitespace', 0) > 0)
            ) && (
              <li className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span>Clean whitespace issues in text columns</span>
                <button
                  className="ml-auto text-xs text-blue-600"
                  onClick={onNavigateToDetails}
                >
                  View Details
                </button>
              </li>
            )}
            {/* Fallback for when no issues are detected */}
            {safeGet(data_quality, 'missing_percentage', 0) <= 5 &&
             safeGet(data_quality, 'duplicate_rows', 0) === 0 &&
             !Object.values(column_analysis).some(col =>
              (safeGet(col, 'leading_whitespace', 0) > 0 || safeGet(col, 'trailing_whitespace', 0) > 0)
             ) && (
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>No major issues detected in your dataset</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}