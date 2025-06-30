import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, 
  FiPause, 
  FiSkipBack, 
  FiSkipForward, 
  FiVolume2, 
  FiVolumeX,
  FiMaximize2,
  FiX,
  FiLoader
} from 'react-icons/fi';
import { useAudio } from '../../context/AudioContext';

const MiniPlayer = () => {
  const {
    currentPodcast,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    togglePlayPause,
    seekTo,
    setVolumeLevel,
    stopPodcast,
    formatTime,
    progress
  } = useAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentPodcast) return null;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolumeLevel(newVolume);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      >
        {/* Progress bar */}
        <div 
          className="w-full h-1 bg-gray-200 cursor-pointer"
          onClick={handleProgressClick}
        >
          <motion.div
            className="h-full bg-indigo-600"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          {/* Podcast Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={currentPodcast.frontImage}
                alt={currentPodcast.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/48x48/4f46e5/ffffff?text=🎵';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate text-sm">
                {currentPodcast.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {currentPodcast.user?.username || 'Unknown Artist'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Previous (placeholder) */}
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <FiSkipBack size={16} />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <FiLoader size={16} className="animate-spin" />
              ) : isPlaying ? (
                <FiPause size={16} />
              ) : (
                <FiPlay size={16} className="ml-0.5" />
              )}
            </button>

            {/* Next (placeholder) */}
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <FiSkipForward size={16} />
            </button>
          </div>

          {/* Time and Volume */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            {/* Time */}
            <div className="text-xs text-gray-500 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Volume */}
            <div className="relative">
              <button
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {volume === 0 ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
              </button>
              
              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                  >
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Expand (placeholder) */}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiMaximize2 size={16} />
            </button>

            {/* Close */}
            <button
              onClick={stopPodcast}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MiniPlayer;
