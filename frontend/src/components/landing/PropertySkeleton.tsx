"use client";

import React from 'react';

export const PropertySkeleton = () => {
  return (
    <div className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-200/60 shadow-sm animate-pulse flex flex-col h-full">
      {/* Image Container Skeleton */}
      <div className="relative h-72 w-full bg-slate-200">
        <div className="absolute top-5 left-5 z-10">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full">
            <div className="w-3.5 h-3.5 bg-blue-200 rounded-full" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="p-8 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="h-7 w-3/4 bg-slate-200 rounded" />
          <div className="h-5 w-10 bg-amber-50 rounded-lg" />
        </div>
        
        <div className="h-4 w-1/2 bg-slate-200 rounded mb-8" />

        {/* Footer Skeleton */}
        <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-12 bg-slate-100 rounded mt-1" />
          </div>

          <div className="h-10 w-28 bg-blue-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

export const PropertiesGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
      {Array.from({ length: count }).map((_, i) => (
        <PropertySkeleton key={i} />
      ))}
    </div>
  );
};

