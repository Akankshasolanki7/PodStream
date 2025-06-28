import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PodcastCard from '../PodcastCard/PodcastCard';

const YourPodcasts = () => {
  const [Podcasts, setPodcasts] = useState();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/v1/get-user-podcasts', {
          withCredentials: true,
        });
        setPodcasts(res.data.data);
      } catch (error) {
        console.error("Error fetching podcasts:", error);
      }
    };
    fetch();
  }, []);

  return (
    <div className='w-full min-h-screen overflow-x-hidden bg-white'>
      {/* Header */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold md:font-bold'>Your Podcasts</h1>
          <Link
            to='/add-podcast'
            className='px-4 py-2 bg-zinc-800 text-white font-semibold rounded-full'
          >
            Add Podcast
          </Link>
        </div>
      </div>

      {/* Podcast Cards */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {Podcasts && Podcasts.map((items, i) => (
            <div key={i}>
            <PodcastCard items={items} />{' '}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YourPodcasts;
