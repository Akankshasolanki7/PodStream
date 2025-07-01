import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import microphone from '../assets/microphone.png';
import { IoReorderThreeOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { FiLogOut, FiUser, FiSettings } from "react-icons/fi";
import { useSelector, useDispatch } from 'react-redux';
import { authActions } from '../store/auth';
import { API_BASE_URL } from '../config/api';

const Navbar = () => {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const user = useSelector((state) => state.auth.user);
    const role = useSelector((state) => state.auth.role);
    const [MobileNav, setMobileNav] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const navLinks = [
        {
            name: 'Home',
            path: '/',
        },
        {
            name: 'Categories',
            path: '/categories',
        },
        {
            name: 'All Podcasts',
            path: '/all-podcasts',
        },
    ];

    const closeMobileNav = () => setMobileNav(false);

    // Check if current path matches nav link
    const isActive = (path) => {
        return location.pathname === path;
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                dispatch(authActions.logout());
                navigate('/');
                setShowUserMenu(false);
                setMobileNav(false);
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if API call fails
            dispatch(authActions.logout());
            navigate('/');
            setShowUserMenu(false);
            setMobileNav(false);
        }
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (MobileNav && !event.target.closest('.mobile-nav')) {
                setMobileNav(false);
            }
            if (showUserMenu && !event.target.closest('.user-menu')) {
                setShowUserMenu(false);
            }
        };

        if (MobileNav || showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [MobileNav, showUserMenu]);

    return (
        <nav className='px-4 md:px-8 lg:px-12 py-4 relative bg-white shadow-sm border-b border-gray-100'>
            <div className='flex items-center justify-between max-w-7xl mx-auto'>
                <div className='logo brand-name w-2/6 flex items-center gap-3'>
                    <img src={microphone} alt="Podstream" className='h-10 w-10 object-contain'/>
                    <Link 
                        to='/' 
                        className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all'
                    >
                        Podstream
                    </Link>
                </div>
                
                <div className='hidden w-2/6 lg:flex items-center justify-center gap-6'>
                    {navLinks.map((items, i) => (
                        <Link 
                            key={i} 
                            to={items.path} 
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                                isActive(items.path) 
                                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                            }`}
                        >
                            {items.name}
                            {isActive(items.path) && (
                                <span className="block h-0.5 mt-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                            )}
                        </Link> 
                    ))}
                </div>
                
                <div className='hidden w-2/6 lg:flex items-center justify-end gap-4'>
                    {!isLoggedIn ? (
                        <>
                            <Link
                                to="/login"
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                                    isActive('/login')
                                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                        : 'text-gray-600 border border-gray-300 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                                }`}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className={`px-4 py-2 text-sm font-medium text-white rounded-full transition-all shadow-sm ${
                                    isActive('/signup')
                                        ? 'bg-gradient-to-r from-indigo-700 to-purple-700'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                }`}
                            >
                                Signup
                            </Link>
                        </>
                    ) : (
                        <div className="relative user-menu">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
                            >
                                <FiUser size={16} />
                                <span>{user?.username || 'User'}</span>
                                {role === 'admin' && (
                                    <span className="px-2 py-0.5 text-xs bg-yellow-400 text-yellow-900 rounded-full font-semibold">
                                        Admin
                                    </span>
                                )}
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <FiUser size={16} />
                                        Profile
                                    </Link>
                                    <Link
                                        to="/add-podcast"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <FiSettings size={16} />
                                        Add Podcast
                                    </Link>
                                    <hr className="my-1" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <FiLogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className='w-4/6 flex items-center justify-end lg:hidden z-[1000]'>
                    <button 
                        className={`text-3xl p-2 rounded-full transition-all duration-300 ${
                            MobileNav 
                                ? 'text-indigo-700 bg-indigo-100'
                                : 'text-gray-600 hover:bg-gray-100'
                        }`} 
                        onClick={() => setMobileNav(!MobileNav)}
                    >
                        {MobileNav ? <RxCross2 /> : <IoReorderThreeOutline />}
                    </button>
                </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className={`mobile-nav fixed top-0 left-0 w-full h-screen bg-white ${MobileNav ? "translate-y-0" : "translate-y-[-100%]"} transition-transform duration-300 ease-in-out z-50 flex flex-col items-center justify-center`}>
                <div className='absolute top-6 right-6'>
                    <button 
                        onClick={closeMobileNav} 
                        className='text-3xl text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors'
                    >
                        <RxCross2 />
                    </button>
                </div>
                
                <div className='h-full w-full flex flex-col items-center justify-center gap-1 px-6'>
                    {navLinks.map((items, i) => (
                        <Link 
                            key={i} 
                            to={items.path} 
                            className={`w-full text-center py-4 text-lg font-medium transition-colors duration-200 ${
                                isActive(items.path)
                                    ? 'text-indigo-700 bg-indigo-50/70 font-semibold'
                                    : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'
                            }`}
                            onClick={closeMobileNav}
                        >
                            {items.name}
                        </Link> 
                    ))}
                    
                    <div className='w-full border-t border-gray-100 my-4'></div>

                    <div className='w-full flex flex-col gap-2 mt-2'>
                        {!isLoggedIn ? (
                            <>
                                <Link
                                    to='/login'
                                    className={`w-full text-center py-3 text-lg font-medium rounded-lg transition-colors ${
                                        isActive('/login')
                                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                            : 'text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                                    onClick={closeMobileNav}
                                >
                                    Login
                                </Link>
                                <Link
                                    to='/signup'
                                    className={`w-full text-center py-3 text-lg font-medium text-white rounded-lg transition-all ${
                                        isActive('/signup')
                                            ? 'bg-gradient-to-r from-indigo-700 to-purple-700'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                    }`}
                                    onClick={closeMobileNav}
                                >
                                    Signup
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="w-full text-center py-2 text-sm text-gray-600">
                                    Welcome, {user?.username || 'User'}
                                    {role === 'admin' && (
                                        <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-yellow-900 rounded-full font-semibold">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <Link
                                    to='/profile'
                                    className="w-full text-center py-3 text-lg font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    onClick={closeMobileNav}
                                >
                                    Profile
                                </Link>
                                <Link
                                    to='/add-podcast'
                                    className="w-full text-center py-3 text-lg font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    onClick={closeMobileNav}
                                >
                                    Add Podcast
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-center py-3 text-lg font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;