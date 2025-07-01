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
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/check-cookie`, {
          withCredentials: true
        });

        if (res.data.message === true) {
          // Get user details if authenticated
          try {
            const userRes = await axios.get(`${API_BASE_URL}/user-details`, {
              withCredentials: true
            });

            if (userRes.data && userRes.data.data) {
              dispatch(authActions.login({
                user: userRes.data.data,
                role: userRes.data.data.role || 'user'
              }));
            } else {
              dispatch(authActions.login());
            }
          } catch (userError) {
            console.error("User details fetch error:", userError);
            dispatch(authActions.login()); // Fallback to basic login
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        dispatch(authActions.logout()); // Ensure clean state on error
      }
    };

    checkAuth();
  }, [dispatch]);
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
