import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "../components/Header";
import {
    Leaf,
    Calendar,
    IndianRupee,
    MapPin,
    User,
    Mail,
    Phone,
    CreditCard,
    ShoppingCart,
    Package,
    Star,
    Heart,
    MessageCircle,
    Truck,
    Shield,
    Clock,
    Award,
    Users,
    ArrowLeft,
    Plus,
    Minus,
    Edit3,
    Save,
    X,
    CheckCircle,
    AlertCircle,
    Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Navigation, Pagination } from 'swiper/modules';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { userRole, currUserAddress, userId } = useAuth();

    // Order-related states
    const [orderQuantity, setOrderQuantity] = useState(6); // Start with 6 to meet minimum
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const baseUrl = "http://localhost:8089"


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };


    useEffect(() => {
        const fetchDetails = async () => {
            const token = Cookies.get("token");
            if (!token) {
                setError("Unauthorized");
                setLoading(false);
                return;
            }

            try {
                const productRes = await axios.get(`${import.meta.env.VITE_API_URL}/listings/byId`, {
                    params: { id },
                    headers: { Authorization: `Bearer ${token}` },
                });

                const productData = productRes.data;
                setProduct(productData);

                const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/productDetails`, {
                    params: { id: productData.farmerId },
                    headers: { Authorization: `Bearer ${token}` },
                });

                setUser(userRes.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load product or user details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    useEffect(() => {
        if (currUserAddress) {
            setDeliveryAddress(currUserAddress);
        }
    }, [currUserAddress]);

    const placeOrder = async () => {
        const token = Cookies.get("token");
        if (!token || !product) return;

        if (orderQuantity < 1 || orderQuantity > product.quantityKg) {
            toast.error("Invalid quantity selected.");
            return;
        }
        if (orderQuantity <= 5) {
            toast.error("Please order more than 5 kg for better pricing.");
            return;
        }

        setPlacingOrder(true);
        setOrderSuccess(null);

        const orderPayload = {
            listingId: product.id,
            quantityKg: orderQuantity,
            totalPrice: product.pricePerKg * orderQuantity,
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderPayload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("🎉 Order placed successfully!");
            setOrderSuccess("Order placed successfully!");
            setOrderPlaced(true);
        } catch (error) {
            console.error("Order failed:", error);
            toast.error("❌ Failed to place order.");
        } finally {
            setPlacingOrder(false);
        }
    };

    const handleUpdateAddress = async () => {
        const token = Cookies.get("token");
        if (!token) {
            toast.error("Unauthorized");
            return;
        }

        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/users/${userId}/address`,
                { address: deliveryAddress },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Address updated successfully!");
            setIsEditingAddress(false);
        } catch (error) {
            console.error("Failed to update address", error);
            toast.error("Failed to update address.");
        }
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
                <Header />
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-green-200">
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
                                <Leaf className="absolute inset-0 m-auto w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Loading Product Details</h3>
                            <p className="text-gray-600 text-center">Fetching fresh information...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center space-x-4 shadow-lg">
                        <AlertCircle className="w-6 h-6" />
                        <span className="font-medium">{error}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const totalPrice = orderQuantity * product.pricePerKg;
    const isOutOfStock = product.quantityKg <= 0;
    const isLowStock = product.quantityKg < 10;

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
            <Header />

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-200"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Products
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                    {/* Product Image Section */}
                    <div className="space-y-6">
                        {/* Image Container */}
                        <div className="relative h-72 sm:h-80 md:h-96 lg:h-[500px] overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-200">
                            <div className="w-full h-full">
                                {product.images?.length > 0 ? (
                                    <Swiper
                                        modules={[Navigation, Pagination]}
                                        navigation
                                        pagination={{ clickable: true }}
                                        className="w-full h-full rounded-xl shadow-lg"
                                    >
                                        {product.images.map((img) => (
                                            <SwiperSlide key={img.id}>
                                                <img
                                                    src={`${baseUrl}${img.imageUrl}`}
                                                    alt={product.name}
                                                    onClick={() => handleImageClick(`${baseUrl}${img.imageUrl}`)}
                                                    onError={(e) => (e.target.src = "./assets/vegetable.png")}
                                                    className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105 duration-300"
                                                    loading="lazy"
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                ) : (
                                    <img
                                        src="./assets/vegetable.png"
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Improved Modal */}
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

                                            {/* Optional: Image Navigation for Multiple Images */}
                                            {product.images?.length > 1 && (
                                                <>
                                                    <button
                                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const currentIndex = product.images.findIndex(img => `${baseUrl}${img.imageUrl}` === selectedImage);
                                                            const prevIndex = currentIndex > 0 ? currentIndex - 1 : product.images.length - 1;
                                                            setSelectedImage(`${baseUrl}${product.images[prevIndex].imageUrl}`);
                                                        }}
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const currentIndex = product.images.findIndex(img => `${baseUrl}${img.imageUrl}` === selectedImage);
                                                            const nextIndex = currentIndex < product.images.length - 1 ? currentIndex + 1 : 0;
                                                            setSelectedImage(`${baseUrl}${product.images[nextIndex].imageUrl}`);
                                                        }}
                                                    >
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}

                                            {/* Image Counter */}
                                            {product.images?.length > 1 && (
                                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                                    {product.images.findIndex(img => `${baseUrl}${img.imageUrl}` === selectedImage) + 1} / {product.images.length}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="absolute top-4 left-4 space-y-2 z-10">
                                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 shadow-lg">
                                    <Sparkles className="w-4 h-4" />
                                    Fresh
                                </div>
                                {isLowStock && !isOutOfStock && (
                                    <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                                        Limited Stock
                                    </div>
                                )}
                                {isOutOfStock && (
                                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                                        Out of Stock
                                    </div>
                                )}
                            </div>

                            {/* Favorite Button */}
                            <button
                                onClick={toggleFavorite}
                                className={`absolute top-4 right-4 p-2 sm:p-3 rounded-full transition-all duration-200 shadow-lg ${isFavorite
                                    ? 'bg-red-500 text-white shadow-red-200'
                                    : 'bg-white text-red-500 hover:bg-red-500 hover:text-white shadow-gray-200'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>

                            {/* Rating */}
                            <div className="absolute bottom-4 left-4 bg-white rounded-lg p-2 sm:p-3 shadow-lg border border-gray-100">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                                    ))}
                                    <span className="text-sm font-medium text-gray-700 ml-1">4.8</span>
                                </div>
                            </div>
                        </div>

                        {/* Product Stats */}
                        <div className="grid grid-cols-3 gap-4 sm:gap-6">
                            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-lg border border-gray-100">
                                <Package className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                <p className="text-xs sm:text-sm text-gray-600">Available</p>
                                <p className="font-bold text-gray-800">{product.quantityKg} kg</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-lg border border-gray-100">
                                <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                                <p className="text-xs sm:text-sm text-gray-600">Rating</p>
                                <p className="font-bold text-gray-800">4.8/5</p>
                            </div>
                            <div className="bg-white rounded-xl p-3 sm:p-4 text-center shadow-lg border border-gray-100">
                                <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs sm:text-sm text-gray-600">Orders</p>
                                <p className="font-bold text-gray-800">120+</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{product.name}</h1>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                                        <MapPin className="w-4 h-4" />
                                        {product.villageName}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Price per kg</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-green-600 flex items-center gap-1">
                                        <IndianRupee className="w-5 h-5" />
                                        {product.pricePerKg}
                                    </p>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                    <div className="flex items-center gap-2 text-sm text-green-700">
                                        <Calendar className="w-4 h-4" />
                                        Available Date
                                    </div>
                                    <p className="font-medium text-green-800">{product.availableDate}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                    <div className="flex items-center gap-2 text-sm text-blue-700">
                                        <Package className="w-4 h-4" />
                                        Total Value
                                    </div>
                                    <p className="font-medium text-blue-800">₹{(product.quantityKg * product.pricePerKg).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-green-200">
                                    <Leaf className="w-3 h-3" />
                                    Organic
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-blue-200">
                                    <Shield className="w-3 h-3" />
                                    Farm Fresh
                                </span>
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-yellow-200">
                                    <Award className="w-3 h-3" />
                                    Premium Quality
                                </span>
                            </div>
                        </div>

                        {/* Farmer Information */}
                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-green-100 p-2 rounded-lg border border-green-200">
                                    <User className="w-5 h-5 text-green-700" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Farmer Information</h3>
                            </div>

                            {user ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">Name:</span>
                                            <span className="font-medium text-gray-800">{user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">Email:</span>
                                            <span className="font-medium text-gray-800">{user.email}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">Mobile:</span>
                                            <span className="font-medium text-gray-800">{user.mobile}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <CreditCard className="w-4 h-4 text-gray-500" />
                                            <span className="text-gray-600">Aadhaar:</span>
                                            <span className="font-medium text-gray-800">{user.aadhaar}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic text-sm">Farmer information not available</p>
                            )}

                            {/* Contact Button */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => product?.farmerId && navigate(`/chat/${product.farmerId}`)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    Contact Farmer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {userRole === "BUYER" && (
                    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 mt-8 grid md:grid-cols-2 gap-8">
                        <div>

                            {!orderPlaced ? (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-green-100 p-2 rounded-lg border border-green-200">
                                            <ShoppingCart className="w-5 h-5 text-green-700" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800">Place Order</h3>
                                    </div>

                                    {isOutOfStock ? (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                            <p className="text-red-700 font-semibold">This product is currently out of stock</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Quantity Selection */}
                                            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                                                <div className="flex items-center justify-between mb-4">
                                                    <label className="text-gray-700 font-medium">Quantity (kg)</label>
                                                    <div className="text-sm text-red-500">
                                                        Min: 6 kg • Max: {product.quantityKg} kg
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setOrderQuantity(Math.max(6, orderQuantity - 1))}
                                                        className="bg-black border-2 border-gray-300 rounded-lg p-2 hover:bg-gray-50 hover:border-red-400 hover:text-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={orderQuantity <= 6}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>

                                                    <input
                                                        type="number"
                                                        min="6"
                                                        max={product.quantityKg}
                                                        value={orderQuantity}
                                                        onChange={(e) => {
                                                            const value = Math.max(6, Math.min(product.quantityKg, Number(e.target.value)));
                                                            setOrderQuantity(value);
                                                        }}
                                                        className="w-20 text-center py-2 border-2 border-gray-300 rounded-lg focus:ring-2 text-white-800 focus:ring-green-500 focus:border-green-500 font-medium"
                                                    />

                                                    <button
                                                        onClick={() => setOrderQuantity(Math.min(product.quantityKg, orderQuantity + 1))}
                                                        className="bg-black border-2 border-gray-300 rounded-lg p-2 hover:bg-gray-50 hover:border-green-400   hover:text-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={orderQuantity >= product.quantityKg}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {orderQuantity < 6 && (
                                                    <p className="text-orange-600 text-sm mt-2 bg-orange-50 p-2 rounded border border-orange-200">
                                                        ⚠️ Minimum order quantity is 6 kg for better pricing
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price Summary */}
                                            <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-green-700">Unit Price:</span>
                                                    <span className="font-medium text-green-800">₹{product.pricePerKg}/kg</span>
                                                </div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-green-700">Quantity:</span>
                                                    <span className="font-medium text-green-800">{orderQuantity} kg</span>
                                                </div>
                                                <div className="border-t border-green-200 pt-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-lg font-semibold text-green-800">Total Amount:</span>
                                                        <span className="text-2xl font-bold text-green-700">₹{totalPrice.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Button */}
                                            <button
                                                onClick={placeOrder}
                                                disabled={placingOrder || orderQuantity < 6}
                                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none border border-green-500 disabled:border-gray-400"
                                            >
                                                {placingOrder ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                                                        Placing Order...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-5 h-5" />
                                                        Place Order - ₹{totalPrice.toLocaleString()}
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-green-800 mb-2">Order Placed Successfully!</h3>
                                    <p className="text-gray-600">Your order has been confirmed and will be processed soon.</p>
                                </div>
                            )}
                        </div>
                        {/* Address Section */}
                        <div className="mt-6 pt-6 border-gray-200 border p-5 rounded-xl bg-yellow-50">
                            <div className="flex items-center gap-2 mb-4">
                                <Truck className="w-5 h-5 text-gray-600" />
                                <h4 className="font-semibold text-gray-800">Delivery Address</h4>
                            </div>

                            {isEditingAddress ? (
                                <div className="space-y-4">
                                    <textarea
                                        rows="3"
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        placeholder="Enter your complete delivery address"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-white-800"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleUpdateAddress}
                                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-md border border-green-500"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Address
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeliveryAddress(currUserAddress || "");
                                                setIsEditingAddress(false);
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-md border border-gray-300"
                                        >
                                            <X className="w-4 h-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
                                        <p className="text-gray-800">
                                            {currUserAddress || "No address available. Please add your delivery address."}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsEditingAddress(true)}
                                        className="bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-green-400 text-gray-700 py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        {currUserAddress ? 'Update Address' : 'Add Address'}
                                    </button>
                                    <div>
                                        <p className="text-xm text-gray-500 mt-2 text-red-400 border border-red-200 rounded-lg p-2">
                                            Your order will be delivered to this address. Please ensure it is accurate.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div className="mt-8 grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-blue-200 backdrop-blur-sm shadow-xl text-center">
                        <Truck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-2">Free Delivery</h4>
                        <p className="text-sm text-gray-600">On orders above ₹500</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center">
                        <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-800 mb-2">Quality Guarantee</h4>
                        <p className="text-sm text-gray-600">100% fresh and organic</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 backdrop-blur-sm rounded-xl p-4 border border-pink-200 shadow-xl text-center">
                        <Clock className="w-8 h-8 text-red-600 mx-auto mb-3 " />
                        <h4 className="font-semibold text-gray-800 mb-2">Quick Delivery</h4>
                        <p className="text-sm text-gray-600">Same day or next day</p>
                    </div>
                </div>
            </div>
        </div>
    );
}