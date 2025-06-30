// Skeleton for audio player
import React from 'react';
import SkeletonBase from './SkeletonBase';

const AudioPlayerSkeleton = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <SkeletonBase width="48px" height="48px" rounded="rounded-md" />
          <div className="min-w-0 space-y-1">
            <SkeletonBase width="120px" height="16px" />
            <SkeletonBase width="80px" height="12px" />
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-4 px-6">
          <SkeletonBase width="32px" height="32px" rounded="rounded-full" />
          <SkeletonBase width="40px" height="40px" rounded="rounded-full" />
          <SkeletonBase width="32px" height="32px" rounded="rounded-full" />
        </div>
        
        {/* Progress and volume */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <SkeletonBase width="100px" height="4px" rounded="rounded-full" />
          <SkeletonBase width="24px" height="24px" rounded="rounded-md" />
          <SkeletonBase width="24px" height="24px" rounded="rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerSkeleton;
