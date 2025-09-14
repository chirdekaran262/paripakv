<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { use, useEffect, useState } from "react";
>>>>>>> new-feature
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Filter, MapPin, Calendar, Package, IndianRupee, Heart, Star, Eye, MessageCircle, ShoppingCart, Sparkles, TrendingUp, Users, Leaf, Award } from 'lucide-react';
import Cookies from 'js-cookie';
import Header from "../components/Header";
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD

export default function ProductListingList() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

=======
import { useTranslation } from "react-i18next";
export default function ProductListingList() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
>>>>>>> new-feature
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ village: '', name: '' });
    const [imageErrorMap, setImageErrorMap] = useState({});
    const [favorites, setFavorites] = useState(new Set());
<<<<<<< HEAD

=======
    const baseUrl = "http://localhost:8089"
    const userId = useAuth().userId;
>>>>>>> new-feature
    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = Cookies.get('token');

                const params = new URLSearchParams();
                if (filters.village) params.append('village', filters.village);
                if (filters.name) params.append('name', filters.name);

<<<<<<< HEAD
                const url = `https://paripakv.onrender.com/listings${params.toString() ? `?${params.toString()}` : ''}`;
=======
                const url = `${import.meta.env.VITE_API_URL}/listings${params.toString() ? `?${params.toString()}` : ''}`;
>>>>>>> new-feature
                const response = await axios.get(url, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (Array.isArray(response.data)) {
                    setListings(response.data);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setError(error.response?.data?.message || error.message);
                setListings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [filters]);

    const toggleFavorite = (id) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });
    };

    const handleImageError = (itemId) => {
        setImageErrorMap(prev => ({ ...prev, [itemId]: true }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
            <Header />

            {/* Hero Section with TransporterDashboard color scheme */}
            <div className="bg-gradient-to-r from-green-500 via-blue-10 to-yellow-500 text-white border-b border-white/10 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="bg-green p-4 rounded-2xl backdrop-blur-sm">
                                <Leaf className="w-10 h-10" />
                            </div>
                            <div className="text-yellow-200">
<<<<<<< HEAD
                                <h1 className="text-4xl md:text-6xl font-bold mb-2">Fresh Farm Products</h1>
                                <p className="text-green-50 text-lg">Connect directly with local farmers • Fresh produce • Support community</p>
=======
                                <h1 className="text-4xl md:text-6xl font-bold mb-2">{t('freshFarmProducts')}</h1>
                                <p className="text-green-50 text-lg">{t('connectMessage')}</p>
>>>>>>> new-feature
                            </div>
                        </div>

                        {/* Stats Grid matching TransporterDashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <div className="bg-gradient-to-r from-green-50 via-blue-10 to-yellow-300 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg text-center text-green-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Package className="w-5 h-5" />
                                    </div>
<<<<<<< HEAD
                                    <span className="text-xs text-green-600 font-medium">FRESH</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">{listings.length}</p>
                                    <p className="text-sm font-medium text-green-800">Available Products</p>
=======
                                    <span className="text-xs text-green-600 font-medium">Fresh</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">{listings.length}</p>
                                    <p className="text-sm font-medium text-green-800">{t('availableProducts')}</p>
>>>>>>> new-feature
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 via-blue-10 to-yellow-300 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg text-center text-green-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-green-600 font-medium">NETWORK</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">500+</p>
<<<<<<< HEAD
                                    <p className="text-sm font-medium text-green-800">Local Farmers</p>
=======
                                    <p className="text-sm font-medium text-green-800">{t('localFarmers')}</p>
>>>>>>> new-feature
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 via-blue-10 to-yellow-300 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg text-center text-green-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-green-600 font-medium">COVERAGE</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">50+</p>
<<<<<<< HEAD
                                    <p className="text-sm font-medium text-green-800">Villages Connected</p>
=======
                                    <p className="text-sm font-medium text-green-800">{t('villagesConnected')}</p>
>>>>>>> new-feature
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 ">
                {/* Filters Section matching TransporterDashboard style */}
                <div className="bg-gradient-to-r from-yellow-200 to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-green-200 p-3 rounded-xl">
                            <Filter className="w-6 h-6 text-green-700" />
                        </div>
<<<<<<< HEAD
                        <h2 className="text-2xl font-bold text-gray-800">Find Fresh Products</h2>
=======
                        <h2 className="text-2xl font-bold text-gray-800">{t('findFreshProducts')}</h2>
>>>>>>> new-feature
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
<<<<<<< HEAD
                                placeholder="Search by village name..."
=======
                                placeholder={t('searchByVillage')}
>>>>>>> new-feature
                                value={filters.village}
                                onChange={(e) => setFilters({ ...filters, village: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                        </div>

                        <div className="relative flex-1 max-w-md">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
<<<<<<< HEAD
                                placeholder="Filter by product name..."
=======
                                placeholder={t('filterByName')}
>>>>>>> new-feature
                                value={filters.name}
                                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                        </div>

                        <div className="bg-green-100 rounded-xl p-2 flex items-center gap-1">
<<<<<<< HEAD
                            <span className="text-sm text-gray-600">Found:</span>
=======
                            <span className="text-sm text-gray-600">{t('found')}:</span>
>>>>>>> new-feature
                            <span className="font-semibold text-green-800">{listings.length}</span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center space-x-4">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Loading State matching TransporterDashboard */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
                                    <Leaf className="absolute inset-0 m-auto w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Loading Fresh Products</h3>
                                <p className="text-gray-600 text-center">Connecting with local farmers...</p>
                            </div>
                        </div>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Products Found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            No products match your current filters. Try adjusting your search or check back later for fresh arrivals.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-medium">Fresh products arriving daily!</span>
                        </div>
                    </div>
                ) : (
                    /* Product Grid */
                    <div className="space-y-6">
                        {listings.map((item, index) => (
                            <div
                                key={item.id || index}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                            >
<<<<<<< HEAD
=======

>>>>>>> new-feature
                                {/* Product Header */}
                                <div className="bg-green-100 p-6 border-b border-gray-100">
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-3 rounded-xl shadow-sm">
                                                <Package className="w-6 h-6 text-green-700" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-green-300 text-green-900 border-green-500">
                                                        Fresh Available
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    {item.villageName || "Local Farm"}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">Farm fresh and organic</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="bg-white rounded-xl p-3 shadow-sm">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">Price per kg</p>
                                                    <p className="font-bold text-green-600 flex items-center gap-1">
                                                        <IndianRupee className="w-4 h-4" />
                                                        {item.pricePerKg}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white rounded-xl p-3 shadow-sm">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">Available</p>
                                                    <p className="font-bold text-blue-600 flex items-center gap-1">
                                                        <Package className="w-4 h-4" />
                                                        {item.quantityKg} kg
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Content */}
                                <div className="p-6">
                                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                                        {/* Product Image */}
                                        <div className="relative h-64 overflow-hidden rounded-xl bg-gray-50">
                                            {imageErrorMap[item.id] ? (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-lime-100">
                                                    <div className="text-center">
                                                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-600 to-lime-600 rounded-full flex items-center justify-center shadow-lg">
                                                            <Leaf className="w-10 h-10 text-white" />
                                                        </div>
                                                        <p className="text-green-800 font-bold text-lg">{item.name}</p>
                                                        <p className="text-green-700 text-sm">Farm Fresh Product</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
<<<<<<< HEAD
                                                    src={item.imageUrl || "./assets/vegetable.png"}
=======
                                                    src={item.images?.[0]?.imageUrl ? `${baseUrl}${item.images[0].imageUrl}` : "./assets/vegetable.png"}
>>>>>>> new-feature
                                                    alt={item.name}
                                                    onError={() => handleImageError(item.id)}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    loading="lazy"
                                                />
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-4 left-4">
                                                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                    <Sparkles className="w-3 h-3" />
                                                    Fresh
                                                </div>
                                            </div>

                                            {item.quantityKg < 10 && (
                                                <div className="absolute top-4 right-4">
                                                    <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                                        Limited Stock
                                                    </div>
                                                </div>
                                            )}

                                            {/* Favorite Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(item.id);
                                                }}
                                                className={`absolute bottom-4 right-4 p-2 rounded-full transition-all ${favorites.has(item.id)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white/90 text-red-500 hover:bg-red-500 hover:text-white'
                                                    }`}
                                            >
                                                <Heart className={`w-4 h-4 ${favorites.has(item.id) ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>

                                        {/* Product Details */}
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
                                                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                    <Package className="w-4 h-4" />
                                                    Product Information
                                                </h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Quantity Available:</span>
                                                        <span className="font-medium text-gray-800">{item.quantityKg} kg</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Price per kg:</span>
                                                        <span className="font-bold text-green-600">₹{item.pricePerKg}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Total Value:</span>
                                                        <span className="font-bold text-green-600 text-lg">
                                                            ₹{(item.quantityKg * item.pricePerKg).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="border-t border-gray-200 pt-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-600">Location:</span>
                                                            <span className="font-medium text-gray-800">{item.villageName || "Local Farm"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                                                    ))}
                                                </div>
                                                <span className="text-sm text-gray-600">4.{Math.floor(Math.random() * 9) + 1} (Farm Rating)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/productDetails/${item.id}`)}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-lime-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                        >
                                            <ShoppingCart className="w-5 h-5" />
                                            View Details & Buy
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (isAuthenticated) {
<<<<<<< HEAD
                                                    item?.farmerId
                                                        ? navigate(`/chat/${item.farmerId}`)
                                                        : setError("Farmer contact information not available");
=======
                                                    if (item?.farmerId) {
                                                        navigate(`/chat/${item.farmerId}/${item.id}`, {
                                                            state: {
                                                                otherUserName: item.farmerName,
                                                                productName: item.name,
                                                                productImage: item.images?.[0]?.imageUrl ? `${baseUrl}${item.images[0].imageUrl}` : null
                                                            }
                                                        });

                                                    } else {
                                                        setError("Farmer contact information not available");
                                                    }
>>>>>>> new-feature
                                                } else {
                                                    navigate("/login");
                                                }
                                            }}
                                            className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                                        >
                                            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
<<<<<<< HEAD
                                            {isAuthenticated ? 'Contact Farmer' : 'Login to Contact'}
=======
                                            {isAuthenticated ? "Contact Farmer" : "Login to Contact"}
>>>>>>> new-feature
                                        </button>

                                        <button
                                            onClick={() => navigate(`/productDetails/${item.id}`)}
                                            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-700 to-cyan-700 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                        >
                                            <Eye className="w-5 h-5" />
                                            Quick View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Stats */}
            <div className="bg-white border-t border-gray-200 py-4 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                            <span>Fresh products updated daily</span>
                            <div className="flex items-center gap-2 text-green-600">
                                <Leaf className="w-4 h-4" />
                                <span>100% Organic guarantee</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Products available: {listings.length}</span>
                            <span>Farmers connected: 500+</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}