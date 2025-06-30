// Skeleton for podcast cards
import React from 'react';
import SkeletonBase from './SkeletonBase';

const PodcastCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="mx-auto min-w-[18rem] sm:min-w-[18rem] px-2">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg h-80 sm:h-96 overflow-hidden">
            {/* Image skeleton */}
            <div className="w-full h-32 sm:h-40 bg-gradient-to-br from-gray-50 to-gray-100 p-2">
              <SkeletonBase 
                width="100%" 
                height="100%" 
                rounded="rounded-lg"
                className="bg-gray-300"
              />
            </div>
            
            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <SkeletonBase width="80%" height="20px" />
              
              {/* Description lines */}
              <div className="space-y-2">
                <SkeletonBase width="100%" height="14px" />
                <SkeletonBase width="90%" height="14px" />
                <SkeletonBase width="70%" height="14px" />
              </div>
              
              {/* Category and button row */}
              <div className="flex justify-between items-center pt-2">
                <SkeletonBase width="60px" height="24px" rounded="rounded-full" />
                <SkeletonBase width="80px" height="36px" rounded="rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default PodcastCardSkeleton;
