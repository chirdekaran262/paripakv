import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Tractor, LogIn, Plus, User, Menu, Bell, Settings, Home, Grid3X3, Info
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, logout, loading, userRole, userId } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (loading) return null;

    return (
        <nav className="sticky top-0 z-50 bg-gradient-to-br from-green-600 via-lime-100 to-yellow-200  backdrop-blur-xl border-b border-gray-200 shadow-sm ">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* LEFT SIDE - Logo Only */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-4 group">
                            <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-green-50 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <Tractor className="w-6 h-6 text-green-700" />
                                </div>
                                {/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full border-2 border-white shadow-sm"></div> */}
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-green-50 to-orange-500 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105">
                                    Paripakv
                                </h1>
                                <p className="text-sm text-gray-900 font-medium -mt-1">Farm to Market</p>
                            </div>
                        </Link>
                    </div>

                    {/* RIGHT SIDE - Everything Else */}
                    <div className="flex items-center space-x-6">

                        {/* Navigation Links - Desktop Only */}
                        {/* <div className="hidden lg:flex items-center space-x-2">
                            <Link
                                to="/"
                                className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
                            >
                                <Home className="w-4 h-4" />
                                <span>Products</span>
                            </Link>
                            <Link
                                to="/categories"
                                className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
                            >
                                <Grid3X3 className="w-4 h-4" />
                                <span>Categories</span>
                            </Link>
                            <Link
                                to="/how-it-works"
                                className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 font-medium"
                            >
                                <Info className="w-4 h-4" />
                                <span>How it Works</span>
                            </Link>
                        </div> */}

                        {/* User Actions & Profile Section */}
                        <div className="flex items-center space-x-4">

                            {/* Role-specific Actions */}
                            {isAuthenticated && (
                                <>
                                    <div className="hidden md:flex items-center space-x-3">
                                        {userRole === "BUYER" && (
                                            <Link
                                                to={`/buyer-orders/${userId}`}
                                                className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-full flex items-center space-x-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:text-black"
                                            >
                                                <span>📦</span>
                                                <span>My Orders</span>
                                            </Link>
                                        )}

                                        {userRole === "FARMER" && (
                                            <>
                                                <Link
                                                    to="/listings/new"
                                                    className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-full flex items-center space-x-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:text-black"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Add Listing</span>
                                                </Link>
                                                <Link
                                                    to="/orders/manage"
                                                    className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-full flex items-center space-x-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:text-black"
                                                >
                                                    <span>📦</span>
                                                    <span>Orders</span>
                                                </Link>
                                            </>
                                        )}

                                        {userRole === "TRANSPORTER" && (
                                            <>
                                                <Link
                                                    to="/transporter/orders"
                                                    className="bg-gradient-to-r from-green-700 via-lime-400 to-yellow-300 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-full flex items-center space-x-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:text-black"
                                                >
                                                    <span>🚛</span>
                                                    <span>Orders</span>
                                                </Link>
                                                <Link
                                                    to="/transporter/deliveries"
                                                    className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-full flex items-center space-x-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:text-black"
                                                >
                                                    <span>📋</span>
                                                    <span>Deliveries</span>
                                                </Link>
                                                <Link
                                                    to="/transporter/earnings"
                                                    className="bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 hover:from-amber-600 hover:to-orange-600 text-white px-5 py-2.5 rounded-full flex items-center space-x-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 hover:text-black"
                                                >
                                                    <span>💰</span>
                                                    <span>Earnings</span>
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    {/* Notifications Button */}
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-3 bg-blue-50 rounded-full hover:bg-white/40 transition-all duration-200 group"
                                    >
                                        <Bell className="w-5 h-5 text-gray-800 group-hover:text-green-700 transition-colors" />
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full border-2 border-white shadow-lg animate-pulse flex items-center justify-center">
                                            <span className="w-2 h-2 bg-white rounded-full"></span>
                                        </span>
                                    </button>
                                </>
                            )}

                            {/* Profile Dropdown or Login */}
                            {isAuthenticated ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className={`flex items-center space-x-2 bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-1 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${showDropdown ? 'ring-2 ring-green-300' : ''}`}
                                    >
                                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="hidden sm:block text-left">
                                            <p className="text-sm font-semibold leading-tight">Profile</p>
                                            <p className="text-xs text-green-100 capitalize leading-tight">
                                                {userRole?.toLowerCase()}
                                            </p>
                                        </div>
                                        <svg
                                            className={`w-4 h-4 text-white transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                                            {/* Header */}
                                            <div className="px-6 py-4 border-b border-gray-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                                        <User className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">Welcome back!</p>
                                                        <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold capitalize mt-1">
                                                            {userRole?.toLowerCase()} Account
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-150"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <span className="font-medium">My Profile</span>
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-150"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <Settings className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <span className="font-medium">Settings</span>
                                                </Link>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-gray-100 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center space-x-3 px-6 py-3 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-150"
                                                >
                                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                        <span className="text-red-600 text-lg">🚪</span>
                                                    </div>
                                                    <span className="font-medium">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2.5 rounded-full flex items-center space-x-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Sign In</span>
                                </Link>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="lg:hidden w-11 h-11 bg-gray-100 hover:bg-green-100 rounded-full flex items-center justify-center transition-all duration-200"
                            >
                                <Menu className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {menuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="px-6 py-6 space-y-4">
                        {/* Navigation Links */}
                        {/* <div className="space-y-2">
                            <Link
                                to="/"
                                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Home className="w-5 h-5" />
                                <span className="font-medium">Browse Products</span>
                            </Link>
                            <Link
                                to="/categories"
                                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Grid3X3 className="w-5 h-5" />
                                <span className="font-medium">Categories</span>
                            </Link>
                            <Link
                                to="/how-it-works"
                                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                <Info className="w-5 h-5" />
                                <span className="font-medium">How it Works</span>
                            </Link>
                        </div> */}

                        {isAuthenticated ? (
                            <>
                                {/* User Info */}
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Welcome back!</p>
                                            <div className="inline-flex items-center bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                                                {userRole?.toLowerCase()} Account
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Role-specific Actions */}
                                <div className="space-y-3">
                                    {userRole === "BUYER" && (
                                        <Link
                                            to={`/buyer-orders/${userId}`}
                                            className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl text-center font-semibold shadow-md"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            📦 My Orders
                                        </Link>
                                    )}

                                    {userRole === "FARMER" && (
                                        <>
                                            <Link
                                                to="/listings/new"
                                                className="block w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl text-center font-semibold shadow-md"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                ➕ Add Listing
                                            </Link>
                                            <Link
                                                to="/orders/manage"
                                                className="block w-full bg-white border-2 border-green-500 text-green-600 py-4 px-6 rounded-xl text-center font-semibold"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                📦 Manage Orders
                                            </Link>
                                        </>
                                    )}

                                    {userRole === "TRANSPORTER" && (
                                        <>
                                            <Link
                                                to="/transporter/orders"
                                                className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl text-center font-semibold shadow-md"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                🚛 Available Orders
                                            </Link>
                                            <Link
                                                to="/transporter/deliveries"
                                                className="block w-full bg-white border-2 border-blue-500 text-blue-600 py-4 px-6 rounded-xl text-center font-semibold"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                📋 My Deliveries
                                            </Link>
                                            <Link
                                                to="/transporter/earnings"
                                                className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-xl text-center font-semibold shadow-md"
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                💰 Earnings
                                            </Link>
                                        </>
                                    )}
                                </div>

                                {/* Profile Actions */}
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <Link
                                        to="/profile"
                                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">My Profile</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                                    >
                                        <span className="text-lg">🚪</span>
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl text-center font-semibold shadow-md"
                                onClick={() => setMenuOpen(false)}
                            >
                                🔐 Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}