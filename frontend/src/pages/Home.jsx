import React, { useState } from 'react';
import headphone from "../assets/headphone.png";
import { FiArrowRight, FiPlay, FiHeadphones, FiMic, FiTrendingUp } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Home = () => {
  const [hoveredPodcast, setHoveredPodcast] = useState(null);

  const featuredPodcasts = [
    {
      id: 1,
      title: "The Daily Insight",
      host: "Sarah Johnson",
      category: "News",
      duration: "32 min",
      listeners: "1.2M",
      cover: "https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2022/02/Podcast-cover-art_featured.jpg?w=1250&h=1120&crop=1"
    },
    {
      id: 2,
      title: "Tech Talk Today",
      host: "Mark Chen",
      category: "Technology",
      duration: "45 min",
      listeners: "850K",
      cover: "https://podcast.adobe.com/Header_images_19_f01aa128d6.png"
    },
    {
      id: 3,
      title: "Mindful Moments",
      host: "Emma Wilson",
      category: "Wellness",
      duration: "28 min",
      listeners: "1.5M",
      cover: "https://lh4.googleusercontent.com/6yAy_wLfsCSD3yNarxHtOTHdGI-FWV4aaq7Jx9U_rlQbWZOGfI-IhQw7w94JZbNd1iHSdC5cSUkejyej9iBpCjFmoAM2mVs91S2VIORECYvYK-IetOhEIfauHtFr5pOkl79PuZ-jTmw-zLE2uEh1cno"
    }
  ];

  const categories = [
    { name: "Business", icon: <FiTrendingUp className="text-2xl" />, count: 324 },
    { name: "Comedy", icon: <FiMic className="text-2xl" />, count: 156 },
    { name: "Health", icon: <FiHeadphones className="text-2xl" />, count: 278 },
    { name: "Technology", icon: <FiTrendingUp className="text-2xl" />, count: 198 },
    { name: "Education", icon: <FiMic className="text-2xl" />, count: 145 },
    { name: "Entertainment", icon: <FiHeadphones className="text-2xl" />, count: 312 }
  ];

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-purple-50">

      {/* Hero Section */}
      <section className="min-h-[80vh] px-4 sm:px-6 md:px-12 lg:px-24 flex flex-col justify-center relative overflow-hidden py-8 sm:py-8">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-800 leading-tight">
              Create & listen to the <br /> 
              <span className="flex items-end mt-4">
                P<span className="relative">
                  <img 
                    src={headphone} 
                    alt="headphone" 
                    className="h-10 sm:h-12 md:h-16 lg:h-20 mx-2 animate-float" 
                  />
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></span>
                </span>dcast
              </span>
            </h1>
          </motion.div>

          <motion.div 
            className="mt-6 sm:mt-8 flex flex-col lg:flex-row items-start justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="w-full lg:w-1/2 mt-1 lg:mt-0">
              <p className="text-lg sm:text-xl md:text-2xl font-medium text-gray-700">
                Listen to the most popular podcasts on just one platform — 
                <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Podstream</span>
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full mt-6 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center">
                Start Listening <FiArrowRight className="ml-2" />
              </button>
            </div>
            
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium max-w-md">
                Discover our collection of over <span className="font-bold text-indigo-600">2000+</span> podcasts across various categories
              </p>
            </div>
          </motion.div>
        </div>

        {/* Decorative Blobs */}
        <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-purple-100 opacity-30 blur-xl"></div>
        <div className="absolute bottom-1/4 right-20 w-24 h-24 rounded-full bg-indigo-100 opacity-30 blur-xl"></div>
      </section>

      {/* Featured Podcasts */}
      <section className="py-10 px-4 sm:px-6 md:px-12 lg:px-24 bg-white bg-opacity-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">Featured Podcasts</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Handpicked shows you don't want to miss</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPodcasts.map((podcast) => (
              <motion.div
                key={podcast.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: podcast.id * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                onMouseEnter={() => setHoveredPodcast(podcast.id)}
                onMouseLeave={() => setHoveredPodcast(null)}
              >
                <div className="relative">
                  <img 
                    src={podcast.cover} 
                    alt={podcast.title} 
                    className="w-full h-56 sm:h-64 object-cover"
                  />
                  {hoveredPodcast === podcast.id && (
                    <motion.div 
                      className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <button className="bg-white rounded-full p-4 text-indigo-600 shadow-lg">
                        <FiPlay className="text-xl" />
                      </button>
                    </motion.div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{podcast.title}</h3>
                      <p className="text-indigo-600">{podcast.host}</p>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
                      {podcast.category}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <span>{podcast.duration}</span>
                    <span>{podcast.listeners} listeners</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-24 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">Browse Categories</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Find podcasts that match your interests</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center"
              >
                <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 mr-4">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count} podcasts</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6">Ready to start your podcast journey?</h2>
            <p className="text-base sm:text-lg text-indigo-100 mb-8">Join thousands of listeners discovering amazing content every day</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg">
                Sign Up Free
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                Browse Podcasts
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
