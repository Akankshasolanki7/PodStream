import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiPause, FiHeart, FiShare2, FiMoreHorizontal, FiUser, FiClock, FiEye, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../config/api';
import { useAudio } from '../../context/AudioContext';

const EnhancedPodcastCard = ({
  podcast,
  showStats = true,
  variant = 'card' // 'card', 'list', 'featured'
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(podcast?.likes?.length || 0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    playPodcast,
    pausePodcast,
    isPlaying,
    isCurrentPodcast,
    isLoading: audioLoading
  } = useAudio();

  const isPodcastPlaying = isCurrentPodcast(podcast) && isPlaying;
  const isPodcastLoading = isCurrentPodcast(podcast) && audioLoading;

  const handlePlay = async (e) => {
    e.stopPropagation();

    if (isPodcastPlaying) {
      pausePodcast();
    } else {
      try {
        await playPodcast(podcast);
      } catch (error) {
        toast.error('Failed to play podcast');
      }
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/like-podcast/${podcast._id}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error('Failed to like podcast');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: podcast.title,
          text: podcast.description,
          url: window.location.href
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views?.toString() || '0';
  };

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4"
      >
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={podcast.frontImage}
              alt={podcast.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/64x64/4f46e5/ffffff?text=🎵';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlay}
                disabled={isPodcastLoading}
                className="text-white opacity-0 hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {isPodcastLoading ? (
                  <FiLoader size={20} className="animate-spin" />
                ) : isPodcastPlaying ? (
                  <FiPause size={20} />
                ) : (
                  <FiPlay size={20} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{podcast.title}</h3>
            <p className="text-sm text-gray-600 truncate">{podcast.description}</p>
            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center">
                <FiUser size={12} className="mr-1" />
                {podcast.user?.username || 'Unknown'}
              </span>
              {podcast.duration && (
                <span className="flex items-center">
                  <FiClock size={12} className="mr-1" />
                  {formatDuration(podcast.duration)}
                </span>
              )}
              {showStats && (
                <span className="flex items-center">
                  <FiEye size={12} className="mr-1" />
                  {formatViews(podcast.views)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors ${
                isLiked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            >
              <FiShare2 size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium mb-2">
                Featured
              </span>
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{podcast.title}</h3>
              <p className="text-white text-opacity-90 text-sm line-clamp-3">{podcast.description}</p>
            </div>
            
            <div className="w-20 h-20 rounded-lg overflow-hidden ml-4 flex-shrink-0">
              <img
                src={podcast.frontImage}
                alt={podcast.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80x80/ffffff/4f46e5?text=🎵';
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-white text-opacity-80">
              <span className="flex items-center">
                <FiUser size={14} className="mr-1" />
                {podcast.user?.username || 'Unknown'}
              </span>
              {showStats && (
                <span className="flex items-center">
                  <FiEye size={14} className="mr-1" />
                  {formatViews(podcast.views)}
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlay}
              disabled={isPodcastLoading}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-3 transition-all disabled:opacity-50"
            >
              {isPodcastLoading ? (
                <FiLoader size={20} className="animate-spin" />
              ) : isPodcastPlaying ? (
                <FiPause size={20} />
              ) : (
                <FiPlay size={20} />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={podcast.frontImage}
          alt={podcast.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200/4f46e5/ffffff?text=🎵';
          }}
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlay}
            disabled={isPodcastLoading}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 opacity-0 hover:opacity-100 transition-all duration-300 disabled:opacity-50"
          >
            {isPodcastLoading ? (
              <FiLoader size={24} className="text-indigo-600 animate-spin" />
            ) : isPodcastPlaying ? (
              <FiPause size={24} className="text-indigo-600" />
            ) : (
              <FiPlay size={24} className="text-indigo-600 ml-1" />
            )}
          </motion.button>
        </div>

        {/* Category badge */}
        {podcast.category && (
          <div className="absolute top-3 left-3">
            <span className="bg-indigo-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              {podcast.category.categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{podcast.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{podcast.description}</p>
        
        {/* Meta info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="flex items-center">
            <FiUser size={14} className="mr-1" />
            {podcast.user?.username || 'Unknown'}
          </span>
          {podcast.duration && (
            <span className="flex items-center">
              <FiClock size={14} className="mr-1" />
              {formatDuration(podcast.duration)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlay}
              disabled={isPodcastLoading}
              className={`flex items-center space-x-1 transition-colors ${
                isPodcastPlaying ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
              }`}
            >
              {isPodcastLoading ? (
                <FiLoader size={16} className="animate-spin" />
              ) : isPodcastPlaying ? (
                <FiPause size={16} />
              ) : (
                <FiPlay size={16} />
              )}
              <span className="text-xs">
                {isPodcastPlaying ? 'Pause' : 'Play'}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              disabled={isLoading}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <FiHeart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-xs">{likeCount}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="text-gray-400 hover:text-blue-500 transition-colors"
            >
              <FiShare2 size={16} />
            </motion.button>
          </div>

          {showStats && (
            <span className="flex items-center text-xs text-gray-500">
              <FiEye size={12} className="mr-1" />
              {formatViews(podcast.views)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedPodcastCard;
