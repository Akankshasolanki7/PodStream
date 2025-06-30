import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { authActions } from '../../store/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogOut } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/api.js';
import HeaderSkeleton from '../Skeletons/HeaderSkeleton';

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/user-details`, {
          withCredentials: true,
        });
        setUserData(res.data.data);
      } catch (error) {
        console.error("Error fetching user details:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(authActions.logout());
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {isLoading ? (
        <HeaderSkeleton />
      ) : userData ? (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-md border-b border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              {/* Left side - App Logo/Brand */}
       

              {/* Right side - User Controls */}
           
         
              
                <div className="flex items-center justify-between ml-4 flex-1">
                   <div className="flex items-center justify-between ml-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium mr-4">
                    {userData.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-slate-800">{userData.username}</p>
                    <p className="text-xs text-slate-500">{userData.email}</p>
                  </div>
                  </div>
             
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="ml-4 flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <FiLogOut className="text-base" />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="h-20 bg-white border-b border-slate-100"></div>
      )}
    </header>
  );
};

export default Header;