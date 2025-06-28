import React from 'react';
import { useSelector } from 'react-redux';
import InputPodcast from '../components/AddPodcast/InputPodcast';
import ErrorPage from './ErrorPage'; // ✅ Import ErrorPage

const AddPodcast = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  return (
    <div>
      {isLoggedIn ? <InputPodcast /> : <ErrorPage />} {/* ✅ Conditionally render */}
    </div>
  );
};

export default AddPodcast;
