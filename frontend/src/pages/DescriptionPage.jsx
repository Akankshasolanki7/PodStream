
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DescriptionPage = () => {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`http://localhost:5000/api/v1/get-podcast/${id}`, {
        withCredentials: true,
      });
      setPodcast(res.data.data);
    };
    fetch();
  }, [id]);

  if (!podcast) {
    return (
      <div className="text-center py-20 text-gray-600 text-lg animate-pulse">Loading podcast...</div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-20 py-8 sm:py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">

        {/* 🎧 Image Section */}
        <div className="w-full md:w-[320px] flex justify-center md:justify-start">
          <div className="w-full max-w-[300px] h-[250px] bg-white rounded-xl overflow-hidden shadow-xl transition-transform duration-300 hover:scale-105">
            <img
              src={`http://localhost:5000/${podcast.frontImage}`}
              alt={podcast.title}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* ✍️ Text Section */}
        <div className="w-full flex-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-4 transition-colors duration-300 hover:text-indigo-600">
            {podcast.title}
          </h1>

          {/* ✅ Constrained Description */}
          <div className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6 bg-slate-50 p-4 rounded-md border border-slate-200 shadow-sm max-h-60 overflow-auto whitespace-pre-wrap">
            {podcast.description}
          </div>

          <div className="inline-block bg-gradient-to-r from-emerald-200 to-teal-200 text-emerald-900 border border-emerald-300 rounded-full px-4 py-1 text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300">
            {podcast.category?.categoryName}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPage;
