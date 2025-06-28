import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from '../store/auth';
import ErrorPage from './ErrorPage';

const Login = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [Values, setValues] = useState({
    email: '',
    password: '',
  });

  const change = (e) => {
    const { name, value } = e.target;
    setValues({ ...Values, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/v1/sign-in',
        Values,
        { withCredentials: true }
      );
      dispatch(authActions.login());
      navigate('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
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
              Login to your account
            </h2>

            <div className="space-y-4">
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
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Enter your email"
                  value={Values.email}
                  onChange={change}
                  required
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
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  placeholder="Enter your password"
                  value={Values.password}
                  onChange={change}
                  required
                />
              </div>

              {/* Login Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-lg transition duration-200"
              >
                Login
              </button>

              {/* Signup Link */}
              <p className="text-sm text-center text-gray-600 mt-2">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-green-700 font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
