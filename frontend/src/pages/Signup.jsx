import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import ErrorPage from './ErrorPage';

const Signup = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  const [Values, setValues] = useState({
    username: '',
    email: '',
    password: ''
  });

  const change = (e) => {
    const { name, value } = e.target;
    setValues({ ...Values, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/v1/sign-up',
        Values
      );
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <>
      <ToastContainer />
      {isLoggedIn ? (
        <ErrorPage />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
            <Link
              to="/"
              className="text-2xl font-extrabold text-green-700 text-center block"
            >
              Podstream
            </Link>

            <h2 className="text-lg text-gray-700 font-medium mt-6 mb-4 text-center">
              Create your account
            </h2>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="text-sm text-gray-600 font-medium"
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Enter your username"
                  value={Values.username}
                  onChange={change}
                  required
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="text-sm text-gray-600 font-medium"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  value={Values.email}
                  onChange={change}
                  required
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="text-sm text-gray-600 font-medium"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  value={Values.password}
                  onChange={change}
                  required
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
              </div>

              {/* Signup Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition duration-200"
              >
                Sign Up
              </button>

              {/* Login Link */}
              <p className="text-sm text-center text-gray-600 mt-2">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-green-700 font-semibold hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Signup;
