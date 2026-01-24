
import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 animate-pulse">
      {/* Image Skeleton matching NewsCard h-48 */}
      <div className="w-full h-48 bg-gray-200"></div>
      
      {/* Content Skeleton matching p-5 padding */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Meta Row */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-12 h-2 bg-gray-200 rounded"></div>
          <div className="w-1 h-1 rounded-full bg-gray-100"></div>
          <div className="w-8 h-2 bg-gray-200 rounded"></div>
        </div>

        {/* Headline Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-full"></div>
          <div className="h-6 bg-gray-200 rounded w-4/5"></div>
        </div>

        {/* Summary Skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-full"></div>
          <div className="h-3 bg-gray-100 rounded w-3/4"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-auto flex items-center justify-between">
           <div className="h-3 w-16 bg-gray-100 rounded"></div>
           <div className="h-8 w-24 bg-gray-100 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
