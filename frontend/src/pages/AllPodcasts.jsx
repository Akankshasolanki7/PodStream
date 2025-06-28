import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PodcastCard from '../components/PodcastCard/PodcastCard';

const AllPodcasts = () => {
  const [Podcasts, setPodcasts] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get('http://localhost:5000/api/v1/get-podcasts');
    //   console.log(res.data.data); // Check this
      setPodcasts(res.data.data);
    };
    fetch();
  }, []);

return (
  <>
<div className="w-full px-4 sm:px-6 lg:px-12 py-6 grid gap-6 grid-cols-[repeat(auto-fit,_minmax(18rem,_1fr))] justify-items-center">
  {Podcasts && Podcasts.map((items, i) => (
    <div key={i} className="w-full max-w-[22rem]">
      <PodcastCard items={items} />
    </div>
  ))}
</div>


  </>
);
}

export default AllPodcasts;
