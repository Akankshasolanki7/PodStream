import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import AuthLayout from './layout/AuthLayout'; // Assuming you have this layout
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login.jsx';
import Categories from './pages/Categories.jsx';
import Profile from './pages/Profile.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import DescriptionPage from './pages/DescriptionPage.jsx';
import AudioPlayer from './components/AudioPlayer/AudioPlayer.jsx';
import { AudioProvider } from './context/AudioContext.jsx';
import MiniPlayer from './components/AudioPlayer/MiniPlayer.jsx';

import axios from 'axios';
import { useDispatch } from 'react-redux';
import { authActions } from './store/auth.js';
import AddPodcast from './pages/AddPodcast.jsx';
import AllPodcasts from './pages/AllPodcasts.jsx';
import { API_BASE_URL } from './config/api.js';


const App = () => {
    const dispatch = useDispatch();
    
 useEffect(() => {
    
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/check-cookie`, {
          withCredentials: true
        });
        //  console.log("Server response:", res.data);
        if (res.data.message == true) {
          dispatch(authActions.login());
        }
      } catch (error) {
        // console.error('Cookie check failed:', error);
         console.error("Fetch error:", error);
      }
    };

    fetch();
  }, []);
  return (
    <AudioProvider>
      <div className=''>
        <Router>
          <Routes>
            {/* Main Layout with nested routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path='/categories' element={<Categories />} />
                <Route path='/profile' element={<Profile />} />
                  <Route path='/add-podcast' element={<AddPodcast />} />
                  <Route path='/all-podcasts' element={<AllPodcasts/>} />
                <Route path='/categories/:cat' element={<CategoriesPage />} />
                 <Route path='/description/:id' element={<DescriptionPage />} />
            </Route>

            {/* Auth Layout for signup */}
            <Route path='/' element={<AuthLayout />}>
              <Route path='/signup' element={<Signup />} />
               <Route path='/login' element={<Login />} />

            </Route>

          </Routes>

          {/* Global Mini Player */}
          <MiniPlayer />

        </Router>
      </div>
    </AudioProvider>
  );
};

export default App;
