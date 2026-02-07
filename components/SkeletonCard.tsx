import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-[#efebe9] overflow-hidden mb-6 animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-48 bg-[#f5f5f0]"></div>

      {/* Content Skeleton */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Meta Row */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-16 h-2 bg-[#f5f5f0] rounded"></div>
          <div className="w-1 h-1 rounded-full bg-[#f5f5f0]"></div>
          <div className="w-10 h-2 bg-[#f5f5f0] rounded"></div>
        </div>

        {/* Headline Skeleton */}
        <div className="space-y-2 mb-6">
          <div className="h-6 bg-[#f5f5f0] rounded w-full"></div>
          <div className="h-6 bg-[#f5f5f0] rounded w-4/5"></div>
        </div>

        {/* Summary Skeleton */}
        <div className="space-y-2 mb-8">
          <div className="h-3 bg-[#f5f5f0]/50 rounded w-full"></div>
          <div className="h-3 bg-[#f5f5f0]/50 rounded w-full"></div>
          <div className="h-3 bg-[#f5f5f0]/50 rounded w-2/3"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#f5f5f0]">
          <div className="h-4 w-16 bg-[#f5f5f0] rounded"></div>
          <div className="h-8 w-28 bg-[#f5f5f0] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
