import React from 'react';
import { ExternalLinkIcon } from 'lucide-react';
export function ViolationsTable({
  violations
}) {
  return <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              License Plate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              People Count
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {violations.map(violation => <tr key={violation.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {violation.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {violation.licensePlate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${violation.peopleCount > 2 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {violation.peopleCount}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {violation.timestamp}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {violation.confidence}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <a href={violation.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center">
                  View <ExternalLinkIcon className="ml-1 h-4 w-4" />
                </a>
              </td>
            </tr>)}
        </tbody>
      </table>
    </div>;
}