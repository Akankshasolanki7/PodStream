// Skeleton for header/profile section
import React from 'react';
import SkeletonBase from './SkeletonBase';

const HeaderSkeleton = () => {
  return (
    <div className="w-full px-4 lg:px-12 py-4 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo section */}
        <div className="flex items-center gap-3">
          <SkeletonBase width="40px" height="40px" rounded="rounded-full" />
          <SkeletonBase width="120px" height="28px" />
        </div>
        
        {/* Navigation skeleton */}
        <div className="hidden md:flex items-center gap-6">
          <SkeletonBase width="60px" height="20px" />
          <SkeletonBase width="80px" height="20px" />
          <SkeletonBase width="70px" height="20px" />
          <SkeletonBase width="90px" height="20px" />
        </div>
        
        {/* Profile section */}
        <div className="flex items-center gap-3">
          <SkeletonBase width="32px" height="32px" rounded="rounded-full" />
          <SkeletonBase width="80px" height="20px" />
          <SkeletonBase width="24px" height="24px" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default HeaderSkeleton;
