// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
    Tractor, User, Package, LogOut, Edit2,
    Phone, CreditCard, Mail, Plus, Trash2, LoaderCircle
} from 'lucide-react';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [userListings, setUserListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
<<<<<<< HEAD

=======
    const baseUrl = "http://localhost:8089"
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
>>>>>>> new-feature
    useEffect(() => {
        const fetchProfile = async () => {
            const token = Cookies.get('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');

                const { data: userData } = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(userData);
<<<<<<< HEAD

=======
                console.log(userData)
>>>>>>> new-feature
                if (userData.role === 'FARMER') {
                    const { data: listings } = await axios.get(`${import.meta.env.VITE_API_URL}/listings/farmer`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const safeListings = Array.isArray(listings) ? listings : listings.listings || [];
                    setUserListings(safeListings);
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    Cookies.remove('token');
                    return navigate('/login');
                }
                setError(err.response?.data?.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);
<<<<<<< HEAD

=======
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };
>>>>>>> new-feature
    const handleLogout = () => {
        Cookies.remove('token');
        navigate('/login');
    };

    const handleDeleteListing = async (id) => {
        const token = Cookies.get('token');
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/listings/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserListings((prev) => prev.filter((l) => l.id !== id));
        } catch {
            alert('Could not delete listing');
        }
    };

    const handleEditListing = (id) => {
        navigate(`/listings/${id}/edit`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-yellow-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <LoaderCircle className="animate-spin text-green-700 w-12 h-12" />
                    <p className="text-green-800 font-medium">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-lime-200 to-yellow-100">
                <div className="text-center space-y-6 bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50">
                    <div className="text-6xl">🚫</div>
                    <p className="text-red-600 font-semibold text-lg">Not authenticated. Please login again.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md"
                    >
                        🔐 Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 flex flex-col">
            {/* Navbar */}
            <nav className="relative z-10 p-4 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold flex items-center gap-3">
                        <Tractor className="w-7 h-7 text-green-800" />
                        <span className="text-green-800">Paripak</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-all duration-300 text-red-600 font-medium backdrop-blur-lg flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" /> 🚪 Sign Out
                    </button>
                </div>
            </nav>

            {/* Content */}
            <div className="flex-1 p-6">
                <div className="max-w-5xl mx-auto space-y-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-green-800 text-center">👤 My Profile</h1>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-center font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Profile Card */}
                    <div className="bg-gradient-to-br from-green-50 via-white to-green-100 border border-green-200 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
                        <div className="flex flex-col lg:flex-row items-center gap-8">
                            <div className="relative">
<<<<<<< HEAD
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold text-4xl flex items-center justify-center shadow-xl ring-4 ring-white/50">
                                    {user.name?.[0]?.toUpperCase() || '👤'}
                                </div>
=======
                                {user.imageUrl ? (
                                    <img
                                        src={`${baseUrl}${user.imageUrl}`}
                                        alt={user.name}
                                        onClick={() => handleImageClick(`${baseUrl}${user.imageUrl}`)}
                                        className="w-32 h-32 rounded-full object-cover shadow-xl ring-4 ring-white/50"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white font-bold text-4xl flex items-center justify-center shadow-xl ring-4 ring-white/50">
                                        {user.name?.[0]?.toUpperCase() || '👤'}
                                    </div>
                                )}
                                {isModalOpen && (
                                    <div
                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
                                        onClick={closeModal}
                                    >
                                        <div
                                            className="relative w-full h-full max-w-6xl max-h-full flex items-center justify-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {/* Close Button */}
                                            <button
                                                className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                                                onClick={closeModal}
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>

                                            {/* Image Container */}
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <img
                                                    src={selectedImage}
                                                    alt="Full View"
                                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                                    style={{
                                                        maxHeight: 'calc(100vh - 80px)',
                                                        maxWidth: 'calc(100vw - 80px)'
                                                    }}
                                                />
                                            </div>


                                        </div>
                                    </div>
                                )}
>>>>>>> new-feature
                                <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </div>

<<<<<<< HEAD
=======

>>>>>>> new-feature
                            <div className="flex-1 text-center lg:text-left w-full">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold text-green-800 mb-2">👋 {user.name}</h2>
                                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                            <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full text-sm font-semibold shadow-md">
                                                🌾 {user.role}
                                            </span>
                                            <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-semibold shadow-md">
                                                📅 Member since {new Date(user.createdAt).getFullYear()}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        to="/profile/edit"
                                        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500 rounded-full">
                                                <Mail className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-blue-600 font-medium">📧 Email</p>
                                                <p className="text-blue-800 font-semibold break-all">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500 rounded-full">
                                                <Phone className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-purple-600 font-medium">📱 Mobile</p>
                                                <p className="text-purple-800 font-semibold">{user.mobile}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-500 rounded-full">
                                                <CreditCard className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-black font-medium">🆔 Aadhaar</p>
                                                <p className="text-black font-semibold">{user.aadhaar}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-white-50 to-emerald-100 border border-emerald-200 rounded-2xl p-4 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500 rounded-full">
                                                <Package className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-black font-medium">📦 Active Listings</p>
                                                <p className="text-black font-semibold text-xl">{userListings.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Listings Section */}
                    {user.role === 'FARMER' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <h3 className="text-2xl font-bold text-green-800">🌱 Your Listings</h3>
                                <Link
                                    to="/listings/new"
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> ➕ Add New Listing
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userListings.length > 0 ? (
                                    userListings.map((listing) => (
                                        <div
                                            key={listing.id}
                                            className="bg-gradient-to-br from-green-50 via-white to-green-100 border border-green-200 rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6"
                                        >
                                            <div className="text-center mb-4">
                                                <div className="text-4xl mb-2">🥬</div>
                                                <h4 className="text-xl font-bold text-green-800 mb-3">{listing.name}</h4>
                                            </div>

                                            <div className="space-y-3 text-green-700 mb-6">
                                                <div className="flex items-center justify-between bg-white/70 rounded-lg p-2">
                                                    <span className="font-medium">⚖️ Quantity:</span>
                                                    <span className="font-bold">{listing.quantityKg} kg</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-white/70 rounded-lg p-2">
                                                    <span className="font-medium">💰 Price:</span>
                                                    <span className="font-bold text-green-600">₹{listing.pricePerKg}/kg</span>
                                                </div>
                                                <div className="flex items-center justify-between bg-white/70 rounded-lg p-2">
                                                    <span className="font-medium">🏘️ Village:</span>
                                                    <span className="font-bold">{listing.villageName}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleEditListing(listing.id)}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md"
                                                >
                                                    <Edit2 className="w-4 h-4" /> ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteListing(listing.id)}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md"
                                                >
                                                    <Trash2 className="w-4 h-4" /> 🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center text-gray-600 py-12">
                                        <div className="text-6xl mb-4">📭</div>
                                        <p className="text-xl font-medium mb-2">No listings found</p>
                                        <p className="text-gray-500 mb-6">Start by creating your first listing!</p>
                                        <Link
                                            to="/listings/new"
                                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" /> ➕ Create First Listing
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}