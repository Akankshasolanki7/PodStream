import React from 'react'
import { useState,useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import PodcastCard from '../components/PodcastCard/PodcastCard'

const CategoriesPage = () => {
    const {cat}=useParams()
      const [Podcasts, setPodcasts] = useState();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/category/${cat}`, {
          withCredentials: true,
        });
        setPodcasts(res.data.data);
      } catch (error) {
        console.error("Error fetching podcasts:", error);
      }
    };
    fetch();
  }, [cat]);
  return (
<div className="px-4 py-4 sm:px-6 lg:px-12 overflow-x-hidden w-full">
  <h1 className="text-xl sm:text-2xl font-semibold mb-4">{cat}</h1>
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
        <div key={i} className="w-full">
          <PodcastCard items={item} />
        </div>
      ))
    ) : (
      <p className="text-gray-600 col-span-full text-center">
        No podcasts available in this category.
      </p>
    )}
  </div>
</div>

  );
};
  

      
    

export default CategoriesPage
