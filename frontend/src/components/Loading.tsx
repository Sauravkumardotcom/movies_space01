import React from 'react';
import { Loader } from 'lucide-react';

interface SkeletonLoaderProps {
  count?: number;
  columns?: number;
}

export function SkeletonLoader({ count = 10, columns = 5 }: SkeletonLoaderProps = {}): JSX.Element {
  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }[columns] || `grid-cols-${columns}`;

  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="h-8 bg-slate-800 rounded skeleton animate-pulse w-1/4"></div>

      {/* Grid of skeleton cards */}
      <div className={`grid ${gridColsClass} sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-lg overflow-hidden bg-slate-900">
            <div className="aspect-video bg-slate-800 skeleton animate-pulse"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 bg-slate-800 rounded skeleton animate-pulse"></div>
              <div className="h-3 bg-slate-800 rounded skeleton animate-pulse w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      <p className="mt-3 text-slate-400">Loading...</p>
    </div>
  );
}
