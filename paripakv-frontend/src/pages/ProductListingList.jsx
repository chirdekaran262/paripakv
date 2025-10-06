import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import {
    Leaf, Package, Users, MapPin, Filter, Search, Shield,
    TrendingUp, Truck, Heart, Share2, Loader, AlertCircle,
    Info, ChevronDown, IndianRupee, Sparkles, Star, ShoppingCart, MessageCircle, Eye
} from "lucide-react";
import axios from "axios";
import Cookies from 'js-cookie';

export default function ProductListingList() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ village: '', name: '' });
    const [imageErrorMap, setImageErrorMap] = useState({});
    const [favorites, setFavorites] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const baseUrl = import.meta.env.VITE_API_URL
    const userId = useAuth().userId;
    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters]);

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                setIsLoading(true);
                setError(null);
                const token = Cookies.get('token');

                const params = new URLSearchParams();
                if (debouncedFilters.village) params.append('village', debouncedFilters.village);
                if (debouncedFilters.name) params.append('name', debouncedFilters.name);


                const url = `${import.meta.env.VITE_API_URL}/listings${params.toString() ? `?${params.toString()}` : ''}`;
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
                setIsLoading(false);
            }
        };

        fetchListings();
    }, [debouncedFilters]);

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

    const renderContent = () => {
        if (isLoading && page === 1) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl shadow-md">
                    <Loader className="w-10 h-10 text-green-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Loading fresh products...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 rounded-2xl p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to load products</h3>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={() => setPage(1)}
                        className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        if (listings.length === 0) {
            return (
                <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">No Products Found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search filters or check back later</p>
                    <button
                        onClick={() => setFilters({ village: '', name: '' })}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* ...existing product cards mapping... */}
                </div>

                {hasMore && (
                    <div className="text-center pt-4">
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={loadingMore}
                            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loadingMore ? (
                                <span className="flex items-center gap-2">
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Loading more...
                                </span>
                            ) : (
                                'Load More Products'
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-300">
            <Header />

            {/* Hero Section - Similar to Help.jsx */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                            <Leaf className="w-12 h-12" />
                        </div>
                        <h1 className="text-5xl font-bold">Fresh Farm Products</h1>
                    </div>
                    <p className="text-xl text-green-100 max-w-3xl mx-auto">
                        {t('connectMessage')}
                    </p>
                </div>
            </div>

            {/* Stats Section - Elevated like Help.jsx */}
            <div className="max-w-6xl mx-auto px-4 -mt-10">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-green-600 text-white p-2 rounded-lg">
                                    <Package className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-green-700 font-medium">FRESH</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mb-1">{listings.length}</p>
                            <p className="text-sm text-gray-600">{t('availableProducts')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-blue-600 text-white p-2 rounded-lg">
                                    <Users className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-blue-700 font-medium">NETWORK</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mb-1">500+</p>
                            <p className="text-sm text-gray-600">{t('localFarmers')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-3">
                                <div className="bg-yellow-700 text-white p-2 rounded-lg">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span className="text-xs text-amber-1300 font-medium">COVERAGE</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-800 mb-1">50+</p>
                            <p className="text-sm text-gray-600">{t('villagesConnected')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Search Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Filter className="w-6 h-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">{t('findFreshProducts')}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('searchByVillage')}
                                value={filters.village}
                                onChange={(e) => setFilters({ ...filters, village: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('filterByName')}
                                value={filters.name}
                                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                        <div className="bg-green-100 rounded-xl p-2 flex items-center justify-between">
                            <span className="text-gray-600">Found:</span>
                            <span className="text-green-700 font-bold text-lg">{listings.length}</span>
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
                                                    src={item.images?.[0]?.imageUrl ? `${item.images[0].imageUrl}` : "./assets/vegetable.png"}
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
                                                } else {
                                                    navigate("/login");
                                                }
                                            }}
                                            className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                                        >
                                            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            {isAuthenticated ? "Contact Farmer" : "Login to Contact"}
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

            {/* Features Section - Like Help.jsx */}
            {/* <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6"> */}
            {/*
                            { icon: Shield, title: 'Verified Products', desc: '100% Quality Guarantee' },
                            { icon: TrendingUp, title: 'Best Prices', desc: 'Direct from Farmers' },
                            { icon: Truck, title: 'Fast Delivery', desc: 'Professional Transport' },
                            { icon: Users, title: 'Large Network', desc: '500+ Farmers' }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all">
                                <div className="bg-green-100 w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center">
                                    <feature.icon className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Stats - Keep existing but styled like Help.jsx */}
            <div className="bg-white border-t border-gray-200 py-6">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                            <span>Fresh products updated daily</span>
                            <div className="flex items-center gap-2 text-green-600">
                                <Leaf className="w-4 h-4" />
                                <span>100% Organic guarantee</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Available Products: {listings.length}</span>
                            <span>Connected Farmers: 500+</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}