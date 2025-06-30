// Base skeleton component with shimmer animation
import React from 'react';

const SkeletonBase = ({ 
  width = '100%', 
  height = '20px', 
  className = '', 
  rounded = 'rounded-md',
  animate = true 
}) => {
  return (
    <div
      className={`bg-gray-200 ${rounded} ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{ width, height }}
    >
      {animate && (
        <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer" />
      )}
    </div>
  );
};

export default SkeletonBase;
