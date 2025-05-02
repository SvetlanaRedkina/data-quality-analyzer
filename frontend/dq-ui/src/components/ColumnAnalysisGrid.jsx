import React from "react";

 

export default function ColumnAnalysisGrid({ result, selectedColumn }) {

    if (!result) return null;

 

    const columnAnalysis = result.column_analysis;

   

    // If no column is selected, show a message

    if (!selectedColumn) {

        return (

            <div className="mb-6 mt-6">

                <h3 className="text-lg font-semibold mb-3">Column Information</h3>

                <div className="bg-white rounded-lg border shadow-sm p-4 text-center text-gray-500">

                    Select a column above to see detailed information

                </div>

            </div>

        );

    }

 

    // Get the analysis for the selected column

    const analysis = columnAnalysis[selectedColumn];

   

    // Determine the data type category

    const isNumeric = analysis.data_type.includes('int') || analysis.data_type.includes('float');

    const isDateTime = analysis.data_type.includes('datetime');

    const isString = !isNumeric && !isDateTime;

 

    return (

        <div className="mb-6 mt-6">

            <h3 className="text-lg font-semibold mb-3">Column Information</h3>

            <div className="bg-white rounded-lg border shadow-sm p-4">

                <h4 className="font-medium text-lg mb-4">{selectedColumn}</h4>

               

                {/* Basic Information - Common for all data types */}

                <div className="mb-6">

                    <h5 className="font-medium mb-2">Basic Information</h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="border rounded p-3">

                            <div className="text-sm text-gray-500 mb-1">Data Type</div>

                            <div className="font-medium">{analysis.data_type}</div>

                        </div>

                        <div className="border rounded p-3">

                            <div className="text-sm text-gray-500 mb-1">Null Values</div>

                            <div className="font-medium">

                                {analysis.null_count}

                                <span className="text-xs text-gray-400 ml-1">

                                    ({analysis.null_percentage.toFixed(1)}%)

                                </span>

                            </div>

                        </div>

                        <div className="border rounded p-3">

                            <div className="text-sm text-gray-500 mb-1">Unique Values</div>

                            <div className="font-medium">{analysis.unique_values}</div>

                        </div>

                    </div>

                </div>

               

                {/* Data Quality Issues Section */}

                <div className="mb-6">

                    <h5 className="font-medium mb-2">Data Quality Issues</h5>

                    <div className="border rounded p-4">

                        {/* Numeric Quality Issues */}

                        {isNumeric && (

                            <ul className="space-y-2">

                                {analysis.zeroes_count > 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>

                                        <span className="text-sm">

                                            Contains <span className="font-medium">{analysis.zeroes_count}</span> zero values

                                            ({((analysis.zeroes_count / (result.file_info.rows - analysis.null_count)) * 100).toFixed(1)}%)

                                        </span>

                                    </li>

                                )}

                                {analysis.negative_count > 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>

                                        <span className="text-sm">

                                            Contains <span className="font-medium">{analysis.negative_count}</span> negative values

                                            ({((analysis.negative_count / (result.file_info.rows - analysis.null_count)) * 100).toFixed(1)}%)

                                        </span>

                                    </li>

                                )}

                                {analysis.null_count > 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>

                                        <span className="text-sm">

                                            Missing values: <span className="font-medium">{analysis.null_count}</span>

                                            ({analysis.null_percentage.toFixed(1)}%)

                                        </span>

                                    </li>

                                )}

                                {analysis.null_count === 0 && analysis.negative_count === 0 && analysis.zeroes_count === 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>

                                        <span className="text-sm">No common numeric issues detected</span>

                                    </li>

                                )}

                            </ul>

                        )}

 

                        {/* String Quality Issues */}

                        {isString && (

                            <ul className="space-y-2">

                                {analysis.empty_strings > 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>

                                        <span className="text-sm">

                                            Contains <span className="font-medium">{analysis.empty_strings}</span> empty strings

                                        </span>

                                    </li>

                                )}

                                {analysis.leading_whitespace > 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>

                                        <span className="text-sm">

                                            Contains <span className="font-medium">{analysis.leading_whitespace}</span> values with leading whitespace

                                        </span>

                                    </li>

                                )}

                                {analysis.trailing_whitespace > 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>

                                        <span className="text-sm">

                                            Contains <span className="font-medium">{analysis.trailing_whitespace}</span> values with trailing whitespace

                                        </span>

                                    </li>

                                )}

                                {analysis.null_count > 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>

                                        <span className="text-sm">

                                            Missing values: <span className="font-medium">{analysis.null_count}</span>

                                            ({analysis.null_percentage.toFixed(1)}%)

                                        </span>

                                    </li>

                                )}

                                {analysis.null_count === 0 && analysis.empty_strings === 0 &&

                                analysis.leading_whitespace === 0 && analysis.trailing_whitespace === 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>

                                        <span className="text-sm">No common string issues detected</span>

                                    </li>

                                )}

                            </ul>

                        )}

 

                        {/* DateTime Quality Issues */}

                        {isDateTime && (

                            <ul className="space-y-2">

                                {analysis.null_count > 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>

                                        <span className="text-sm">

                                            Missing dates: <span className="font-medium">{analysis.null_count}</span>

                                            ({analysis.null_percentage.toFixed(1)}%)

                                        </span>

                                    </li>

                                )}

                                {/* You can add more date-specific checks here */}

                                {analysis.null_count === 0 && (

                                    <li className="flex items-center">

                                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>

                                        <span className="text-sm">No common date issues detected</span>

                                    </li>

                                )}

                            </ul>

                        )}

                    </div>

                </div>

               

                {/* Numeric Data Type Specific Information */}

                {isNumeric && (

                    <div className="mb-6">

                        <h5 className="font-medium mb-2">Numeric Statistics</h5>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Minimum</div>

                                <div className="font-medium">{analysis.min}</div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Maximum</div>

                                <div className="font-medium">{analysis.max}</div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Mean</div>

                                <div className="font-medium">{analysis.mean.toFixed(2)}</div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Median</div>

                                <div className="font-medium">{analysis.median.toFixed(2)}</div>

                            </div>

                        </div>

                    </div>

                )}

 

                 {/* Advanced Numeric Statistics */}

                 {isNumeric && (

                    <div className="mb-6">

                    <h5 className="font-medium mb-2">Advanced Numeric Statistics</h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="border rounded p-3">

                            <div className="text-sm text-gray-500 mb-1">Standard Deviation</div>

                            <div className="font-medium">{analysis.std.toFixed(2)}</div>

                        </div>

                        <div className="border rounded p-3">

                            <div className="text-sm text-gray-500 mb-1">Zero Values</div>

                            <div className="font-medium">

                                {analysis.zeroes_count}

                            </div>

                        </div>

                        <div className="border rounded p-3">

                            <div className="text-sm text-gray-500 mb-1">Negative Values</div>

                            <div className="font-medium">{analysis.negative_count}

                            </div>

                        </div>

                    </div>

                </div>

                )}

               

                {/* String Data Type Specific Information */}

                {isString && analysis.min_length !== undefined && (

                    <div className="mb-6">

                        <h5 className="font-medium mb-2">String Statistics</h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Min Length</div>

                                <div className="font-medium">{analysis.min_length}</div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Max Length</div>

                                <div className="font-medium">{analysis.max_length}</div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Average Length</div>

                                <div className="font-medium">{analysis.avg_length.toFixed(1)}</div>

                            </div>

                        </div>

                    </div>

                )}

 

                {/* Advanced String Statistics */}

                {isString && analysis.min_length !== undefined && (

                    <div className="mb-6">

                        <h5 className="font-medium mb-2">String Composition Analysis</h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Numeric Strings</div>

                                <div className="font-medium">

                                    {analysis.numeric_strings}

                                </div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Alphabetic Strings</div>

                                <div className="font-medium">

                                    {analysis.alphabetic_strings}

                                </div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Alphanumeric Strings</div>

                                <div className="font-medium">

                                    {analysis.alphanumeric_strings}

                                </div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">With Special Characters</div>

                                <div className="font-medium">

                                    {analysis.with_special_characters}

                                </div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Empty Strings</div>

                                <div className="font-medium">

                                    {analysis.empty_strings}

                                </div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Whitespace Issues</div>

                                <div className="font-medium">

                                    Leading: {analysis.leading_whitespace}, Trailing: {analysis.trailing_whitespace}

                                </div>

                            </div>

                        </div>

                    </div>

                )}

               

                {/* DateTime Data Type Specific Information */}

                {isDateTime && analysis.min_date !== undefined && (

                    <div className="mb-6">

                        <h5 className="font-medium mb-2">Date Statistics</h5>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Earliest Date</div>

                                <div className="font-medium">{analysis.min_date}</div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Latest Date</div>

                                <div className="font-medium">{analysis.max_date}</div>

                            </div>

                            <div className="border rounded p-3">

                                <div className="text-sm text-gray-500 mb-1">Date Range (days)</div>

                                <div className="font-medium">{analysis.date_range_days}</div>

                            </div>

                        </div>

                    </div>

                )}

               

                {/* Top Values Section */}

                {analysis.top_values && (

                    <div className="mb-6">

                        <h5 className="font-medium mb-2">Most Frequent Values</h5>

                        <div className="border rounded overflow-hidden">

                            <table className="min-w-full divide-y divide-gray-200">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                            Value

                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                            Count

                                        </th>

                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                            Percentage

                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">

                                    {Object.entries(analysis.top_values).map(([value, count], index) => (

                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>

                                            <td className="px-6 py-2 text-sm font-medium text-gray-900">

                                                {value}

                                            </td>

                                            <td className="px-6 py-2 text-sm text-gray-500">

                                                {count}

                                            </td>

                                            <td className="px-6 py-2 text-sm text-gray-500">

                                                {((count / (result.file_info.rows - analysis.null_count)) * 100).toFixed(1)}%

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

}