import React from 'react';

interface QueryResultProps {
  result: any;
}

const QueryResult: React.FC<QueryResultProps> = ({ result }) => {
  // If result is null or undefined, show a placeholder
  if (!result) {
    return (
      <div className="text-gray-400 text-lg">
        No results to display.
      </div>
    );
  }

  // Handle raw text or JSON (e.g., error messages or raw data)
  if (typeof result === 'string' || (result && result.message)) {
    return (
      <pre className="text-base bg-gray-800 p-6 rounded-lg overflow-x-auto">
        {typeof result === 'string' ? result : result.message}
      </pre>
    );
  }

  // Handle table data (e.g., { columns: [], rows: [] })
  if (result.columns && result.rows) {
    return (
      <div className="w-full max-h-[500px] overflow-auto rounded-lg">
        <table className="min-w-full bg-gray-800">
          <thead>
            <tr>
              {result.columns.map((column: string, index: number) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-base font-semibold text-gray-200 bg-gray-700 sticky top-0 z-10"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex}>
                {row.map((cell: any, cellIndex: number) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 text-base text-gray-300 whitespace-normal break-words max-w-[300px]"
                  >
                    {cell !== null && cell !== undefined ? cell.toString() : '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Handle chart data (placeholder for now)
  if (result.chart) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <p className="text-gray-400 text-lg">
          Chart rendering is not yet implemented. Data: {JSON.stringify(result.chart)}
        </p>
      </div>
    );
  }

  // Fallback for unknown result types
  return (
    <pre className="text-base bg-gray-800 p-6 rounded-lg overflow-x-auto max-h-[500px]">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
};

export default QueryResult;