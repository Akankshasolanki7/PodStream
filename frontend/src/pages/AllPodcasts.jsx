import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EnhancedPodcastCard from '../components/PodcastCard/EnhancedPodcastCard';
import LoadingSkeleton from '../components/UI/LoadingSkeleton';
import { API_BASE_URL } from '../config/api.js';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';

const AllPodcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/get-categories`);
        setCategories(res.data.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage,
          limit: 12,
          sortBy,
          sortOrder: 'desc'
        });

        if (searchTerm && searchTerm.trim()) {
          params.append('search', searchTerm.trim());
        }
        if (selectedCategory) {
          params.append('category', selectedCategory);
        }

        const res = await axios.get(`${API_BASE_URL}/get-podcasts?${params}`);

        if (res.data && res.data.data) {
          setPodcasts(res.data.data);
          setTotalPages(res.data.totalPages || 1);
        } else {
          setPodcasts([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Fetch podcasts error:', err);
        setError(err.response?.data?.message || 'Failed to load podcasts');
        setPodcasts([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search, immediate for other changes
    const delay = searchTerm ? 500 : 100;
    const debounceTimer = setTimeout(fetchPodcasts, delay);
    return () => clearTimeout(debounceTimer);
  }, [currentPage, searchTerm, selectedCategory, sortBy]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Podcasts</h1>
        <p className="text-gray-600">Discover amazing podcasts from our community</p>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 space-y-4"
      >
        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search podcasts..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          >
            <option value="createdAt">Latest</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid'
          ? "grid gap-6 grid-cols-[repeat(auto-fit,_minmax(18rem,_1fr))] justify-items-center"
          : "space-y-4"
        }>
          <LoadingSkeleton
            variant={viewMode === 'grid' ? 'card' : 'list'}
            count={6}
          />
        </div>
      ) : podcasts.length > 0 ? (
        <>
          <div className={viewMode === 'grid'
            ? "grid gap-6 grid-cols-[repeat(auto-fit,_minmax(18rem,_1fr))] justify-items-center"
            : "space-y-4"
          }>
            {podcasts.map((podcast, index) => (
              <motion.div
                key={podcast._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={viewMode === 'grid' ? "w-full max-w-[22rem]" : "w-full"}
              >
                <EnhancedPodcastCard
                  podcast={podcast}
                  variant={viewMode === 'grid' ? 'card' : 'list'}
                  onPlay={(podcast) => console.log('Play podcast:', podcast)}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-8"
            >
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 text-6xl mb-4">🎧</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm || selectedCategory ? 'No podcasts found' : 'No podcasts available'}
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'Be the first to upload a podcast!'
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default AllPodcasts;
