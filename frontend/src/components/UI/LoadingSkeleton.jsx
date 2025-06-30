import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ 
  variant = 'card', 
  count = 1, 
  className = '',
  animate = true 
}) => {
  const shimmerAnimation = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  };

  const SkeletonCard = () => (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="relative">
        {/* Image skeleton */}
        <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
          {animate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              {...shimmerAnimation}
            />
          )}
        </div>
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div className="h-6 bg-gray-200 rounded relative overflow-hidden">
            {animate && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                {...shimmerAnimation}
              />
            )}
          </div>
          
          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 relative overflow-hidden">
              {animate && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...shimmerAnimation}
                />
              )}
            </div>
            <div className="h-4 bg-gray-200 rounded w-1/2 relative overflow-hidden">
              {animate && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...shimmerAnimation}
                />
              )}
            </div>
          </div>
          
          {/* Meta info */}
          <div className="flex items-center justify-between pt-2">
            <div className="h-4 bg-gray-200 rounded w-20 relative overflow-hidden">
              {animate && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...shimmerAnimation}
                />
              )}
            </div>
            <div className="h-4 bg-gray-200 rounded w-16 relative overflow-hidden">
              {animate && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...shimmerAnimation}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SkeletonList = () => (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
          {animate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              {...shimmerAnimation}
            />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4 relative overflow-hidden">
            {animate && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                {...shimmerAnimation}
              />
            )}
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2 relative overflow-hidden">
            {animate && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                {...shimmerAnimation}
              />
            )}
          </div>
        </div>
        
        {/* Action */}
        <div className="w-8 h-8 bg-gray-200 rounded relative overflow-hidden">
          {animate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              {...shimmerAnimation}
            />
          )}
        </div>
      </div>
    </div>
  );

  const SkeletonText = () => (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className={`h-4 bg-gray-200 rounded relative overflow-hidden ${
            index === count - 1 ? 'w-3/4' : 'w-full'
          }`}
        >
          {animate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              {...shimmerAnimation}
            />
          )}
        </div>
      ))}
    </div>
  );

  const SkeletonProfile = () => (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full relative overflow-hidden">
          {animate && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              {...shimmerAnimation}
            />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-gray-200 rounded w-1/3 relative overflow-hidden">
            {animate && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                {...shimmerAnimation}
              />
            )}
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2 relative overflow-hidden">
            {animate && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                {...shimmerAnimation}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="text-center space-y-2">
            <div className="h-8 bg-gray-200 rounded relative overflow-hidden">
              {animate && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...shimmerAnimation}
                />
              )}
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto relative overflow-hidden">
              {animate && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  {...shimmerAnimation}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Bio */}
      <SkeletonText count={3} />
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return <SkeletonCard />;
      case 'list':
        return <SkeletonList />;
      case 'text':
        return <SkeletonText />;
      case 'profile':
        return <SkeletonProfile />;
      default:
        return <SkeletonCard />;
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
