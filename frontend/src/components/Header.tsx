import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
export function Header() {
  return <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <AlertTriangleIcon className="mr-3 h-7 w-7" />
        <h1 className="text-2xl font-bold">
          Motorbike Violation Detection System
        </h1>
      </div>
    </header>;
}