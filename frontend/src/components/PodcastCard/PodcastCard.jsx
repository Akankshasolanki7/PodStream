import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { playerActions } from '../../store/player';
import { getImageUrl, getAudioUrl } from '../../utils/urlHelpers.js';

const PodcastCard = ({ items }) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handlePlay = (e) => {
    if (!isLoggedIn) return;
    e.preventDefault();
    e.stopPropagation();
    console.log("Play button clicked:", items);

    dispatch(playerActions.setDiv());
    dispatch(playerActions.changeImage(getImageUrl(items.frontImage)));
    dispatch(playerActions.changeSong(getAudioUrl(items.audioFile)));
  };

  const toggleExpansion = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const toggleDescription = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFullDescription(!showFullDescription);
  };

  const truncateText = (text, limit) => {
    if (!text) return '';
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  };

  return (
    <>
  <div className="mx-auto min-w-[18rem] sm:min-w-[18rem] px-2">
      <div
        className={`bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden backdrop-blur-sm bg-white/95 ${
          isExpanded
            ? 'z-50 fixed inset-4 sm:inset-6 max-w-3xl mx-auto my-auto flex flex-col'
            : 'h-80 sm:h-96'
        }`}
      >
        {/* Close button for expanded view */}
        {isExpanded && (
          <button
            onClick={toggleExpansion}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <Link
          to={`/description/${items._id}`}
          className="block h-full"
          onClick={(e) => isExpanded && e.preventDefault()}
        >
          <div className={`h-full flex ${isExpanded ? 'sm:flex-row flex-col' : 'flex-col'}`}>
            {/* Image Container */}
            <div
              className={`relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden ${
                isExpanded ? 'sm:w-1/2 w-full sm:h-full h-48' : 'w-full h-32 sm:h-40'
              } flex items-center justify-center p-2`}
            >
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse" />
              )}
              <img
                src={getImageUrl(items.frontImage)}
                alt="Podcast Thumbnail"
                className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                } ${!isExpanded ? 'group-hover:scale-105' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/400x300/e2e8f0/64748b?text=No+Image';
                  setImageLoaded(true);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {!isExpanded && (
                <button
                  onClick={toggleExpansion}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </button>
              )}
              {isLoggedIn && (
                <button
                  onClick={handlePlay}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200">
                    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </button>
              )}
            </div>

            {/* Content Container */}
            <div
              className={`flex-1 p-4 flex flex-col justify-between ${
                isExpanded ? 'overflow-y-auto max-h-[calc(100vh-12rem)] sm:max-h-full' : ''
              }`}
            >
              {/* Category Badge */}
              {items.category && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200/50">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {items.category.categoryName || 'Uncategorized'}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3
                className={`font-bold text-gray-900 leading-tight mb-2 ${
                  isExpanded ? 'text-xl' : 'text-sm sm:text-base'
                }`}
              >
                {isExpanded
                  ? items.title || 'Untitled Podcast'
                  : truncateText(items.title || 'Untitled Podcast', 50)}
              </h3>

              {/* Description */}
              <div className="flex-1 mb-1">
                <p
                  className={`text-gray-600 leading-relaxed ${
                    isExpanded ? 'text-base' : 'text-xs sm:text-sm'
                  }`}
                >
                  {isExpanded
                    ? showFullDescription
                      ? items.description || 'No description available'
                      : truncateText(items.description || 'No description available', 130)
                    : truncateText(items.description || 'No description available', 40)}
                </p>
                {((isExpanded && items.description?.length > 200) ||
                  (!isExpanded && items.description?.length > 80)) && (
                  <button
                    onClick={isExpanded ? toggleDescription : toggleExpansion}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium mt-1 transition-colors duration-200"
                  >
                    {isExpanded ? (showFullDescription ? 'Show Less' : 'Read More') : 'Read More'}
                  </button>
                )}
              </div>

              {/* Additional Info in Expanded View */}
              {isExpanded && (
                <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Duration: Available on play</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0v16a1 1 0 001 1h8a1 1 0 001-1V4"
                      />
                    </svg>
                    <span>Added recently</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className={`space-y-2 ${isExpanded ? 'space-y-3' : ''}`}>
                <button
                  onClick={handlePlay}
                  className={`w-full flex items-center justify-center gap-2 font-semibold transition-all duration-200 ${
                    isExpanded ? 'py-3 px-4 text-base' : 'py-2 px-3 text-xs sm:text-sm'
                  } rounded-xl ${
                    isLoggedIn
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!isLoggedIn}
                >
                  <svg
                    className={`${isExpanded ? 'w-5 h-5' : 'w-4 h-4'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {isLoggedIn ? 'Play Now' : 'Login to Play'}
                </button>

                {isExpanded && (
                  <button
                    onClick={() => window.open(`/description/${items._id}`, '_blank')}
                    className="w-full py-2.5 px-4 bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-700 font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>

      {/* Backdrop for expanded view */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleExpansion}
        />
      )}
    </>
  );
};

export default PodcastCard;