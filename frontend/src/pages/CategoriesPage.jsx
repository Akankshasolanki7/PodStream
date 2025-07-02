import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import PodcastCard from '../components/PodcastCard/PodcastCard'
import { API_BASE_URL } from '../config/api.js'

const CategoriesPage = () => {
    const { cat } = useParams()
    const [Podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryPodcasts = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Fetching podcasts for category:', cat);

                const res = await axios.get(`${API_BASE_URL}/category/${encodeURIComponent(cat)}`, {
                    withCredentials: true,
                });

                console.log('Category response:', res.data);

                if (res.data && res.data.data) {
                    setPodcasts(res.data.data);
                } else {
                    setPodcasts([]);
                }
            } catch (error) {
                console.error("Error fetching category podcasts:", error);
                setError(error.response?.data?.message || 'Failed to load podcasts');
                setPodcasts([]);
            } finally {
                setLoading(false);
            }
        };

        if (cat) {
            fetchCategoryPodcasts();
        }
    }, [cat]);
    return (
        <div className="px-4 py-4 sm:px-6 lg:px-12 overflow-x-hidden w-full">
            <h1 className="text-xl sm:text-2xl font-semibold mb-4 capitalize">
                {cat} Podcasts
            </h1>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-red-600 text-lg font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="
                    grid gap-4 sm:gap-6 md:gap-10
                    grid-cols-1
                    sm:grid-cols-2
                    md:grid-cols-3
                    lg:grid-cols-4
                    xl:grid-cols-5
                    2xl:grid-cols-6
                    px-0 py-4
                ">
                    {Podcasts && Podcasts.length > 0 ? (
                        Podcasts.map((item, i) => (
                            <div key={item._id || i} className="w-full">
                                <PodcastCard items={item} />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 text-lg">
                                No podcasts available in the <span className="font-semibold capitalize">{cat}</span> category yet.
                            </p>
                            <p className="text-gray-500 text-sm mt-2">
                                Be the first to upload a podcast in this category!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )

  );
};
  

      
    

export default CategoriesPage
