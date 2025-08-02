import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "../components/Header";
import {
    ShoppingCart,
    Leaf,
    User,
    Calendar,
    MapPin,
    Weight,
    IndianRupee,
    Truck,
    Package,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Copy,
    Star,
    Shield,
    TrendingUp,
    RefreshCw,
    ExternalLink,
    MessageCircle,
    Navigation,
    Award,
    XCircle
} from "lucide-react";

export default function OrderDetailsBuyer() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [listing, setListing] = useState(null);
    const [farmer, setFarmer] = useState(null);
    const [transporter, setTransporter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const token = Cookies.get("token");

    const fetchOrderDetails = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            setError(null);

            const orderRes = await axios.get(`${import.meta.env.VITE_API_URL}/orders/getById?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const orderData = orderRes.data;
            setOrder(orderData);

            const listingRes = await axios.get(`${import.meta.env.VITE_API_URL}/listings/byId?id=${orderData.listingId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const listingData = listingRes.data;
            setListing(listingData);

            const farmerRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/productDetails?id=${listingData.farmerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFarmer(farmerRes.data);

            if (orderData.transporterId) {
                const transporterRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/productDetails?id=${orderData.transporterId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTransporter(transporterRes.data);
            } else {
                setTransporter(null);
            }
        } catch (err) {
            console.error("Failed to fetch order details:", err);
            setError(err.response?.data?.message || "Failed to load order details. Please try again.");
        } finally {
            setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id, token]);

    const copyOrderId = () => {
        navigator.clipboard.writeText(order.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleRefresh = () => {
        fetchOrderDetails(true);
    };

    const getStatusConfig = (status) => {
        const configs = {
            'CONFIRMED': {
                color: 'text-green-800 bg-green-50 border-green-300',
                icon: CheckCircle,
                description: 'Order confirmed by farmer'
            },
            'PENDING': {
                color: 'text-yellow-800 bg-yellow-100 border-yellow-300',
                icon: Clock,
                description: 'Waiting for farmer confirmation'
            },
            'REJECTED': {
                color: 'text-red-800 bg-red-50 border-red-300',
                icon: XCircle,
                description: 'Order rejected by farmer'
            },
            'CANCELLED': {
                color: 'text-gray-800 bg-gray-50 border-gray-300',
                icon: XCircle,
                description: 'Order has been cancelled'
            }
        };
        return configs[status?.toUpperCase()] || configs['PENDING'];
    };

    const getDeliveryStatusConfig = (status) => {
        const configs = {
            'DELIVERED': {
                color: 'text-green-800 bg-green-50 border-green-300',
                icon: CheckCircle,
                description: 'Successfully delivered'
            },
            'PICKED_UP': {
                color: 'text-blue-800 bg-blue-50 border-blue-300',
                icon: Package,
                description: 'Picked up by transporter'
            },
            'IN_TRANSIT': {
                color: 'text-purple-800 bg-purple-50 border-purple-300',
                icon: Truck,
                description: 'On the way to destination'
            },
            'PENDING': {
                color: 'text-yellow-800 bg-yellow-100 border-yellow-300',
                icon: Clock,
                description: 'Awaiting pickup'
            }
        };
        return configs[status?.toUpperCase()] || configs['PENDING'];
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-6">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 mx-auto"></div>
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto absolute top-0"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Order Details</h3>
                                <p className="text-gray-600">Please wait while we fetch your order information...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="h-10 w-10 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                                <p className="text-gray-600 mb-6">{error}</p>
                                <button
                                    onClick={handleRefresh}
                                    className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Data validation
    if (!order || !listing || !farmer) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-4">
                            <AlertCircle className="h-16 w-16 text-gray-500 mx-auto" />
                            <h2 className="text-2xl font-bold text-gray-800">Order Not Found</h2>
                            <p className="text-gray-600">Unable to load order details. Please check the order ID and try again.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const orderStatusConfig = getStatusConfig(order.status);
    const deliveryStatusConfig = getDeliveryStatusConfig(order.deliveryStatus);
    const StatusIcon = orderStatusConfig.icon;
    const DeliveryIcon = deliveryStatusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
            <Header />

            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-br from-green-100 via-blue-50 to-yellow-100 shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                                onClick={() => window.history.back()}
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                                <p className="text-gray-600 mt-1">Track and manage your agricultural order</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 border border-green-200"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Order ID Section */}
                    <div className="mt-6 flex items-center gap-3 p-4 bg-gradient-to-r from-green-100 to-emerald-500 to-yellow-500 rounded-2xl border border-green-200">
                        <Package className="w-6 h-6 text-green-700" />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-green-700">Order ID</span>
                            <code className="block font-mono text-lg font-bold text-green-900">
                                {order.id}
                            </code>
                        </div>
                        <button
                            onClick={copyOrderId}
                            className="p-2 bg-green-100 hover:bg-green-200 rounded-xl transition-all duration-200 hover:scale-105 border border-green-300"
                            title="Copy Order ID"
                        >
                            <Copy className="w-5 h-5 text-green-700" />
                        </button>
                        {copiedId && (
                            <span className="text-sm text-green-700 font-medium animate-pulse">
                                Copied! ✓
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Enhanced Status Overview */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-green-100 via-blue-50 to-yellow-100 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-blue-700" />
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2 ${orderStatusConfig.color}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {order.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Order Status</h3>
                        <p className="text-sm text-gray-600">{orderStatusConfig.description}</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 via-blue-50 to-yellow-100 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                                <Truck className="w-6 h-6 text-purple-700" />
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2 ${deliveryStatusConfig.color}`}>
                                <DeliveryIcon className="w-4 h-4 mr-1" />
                                {order.deliveryStatus?.replace('_', ' ') || "Pending"}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Delivery Status</h3>
                        <p className="text-sm text-gray-600">{deliveryStatusConfig.description}</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 via-blue-50 to-yellow-100 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                <IndianRupee className="w-6 h-6 text-green-700" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Total Amount</h3>
                        <p className="text-3xl font-bold text-gray-900 flex items-center">
                            ₹{order.totalPrice.toFixed(2)}
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Enhanced Main Content */}
                    <div className="lg:col-span-3">
                        {/* Product Details Card */}
                        <div className="bg-gradient-to-r from-green-50 via-blue-50 to-yellow-100 rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-500 p-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                                        <Leaf className="w-7 h-7 text-green-700" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-gray-900">{listing.name}</h2>
                                        <p className="text-green-700 font-medium">Fresh from {listing.villageName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200 bg-white-100">
                                            <div className="bg-yellow-100 w-10 h-10 rounded-xl flex items-center justify-center">
                                                <IndianRupee className="w-5 h-5 text-green-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Price per Kg</p>
                                                <p className="text-xl font-bold text-gray-900">₹{listing.pricePerKg}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200 bg-white-100">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Weight className="w-5 h-5 text-blue-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Quantity Ordered</p>
                                                <p className="text-xl font-bold text-gray-900">{order.quantityKg} kg</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200 bg-white-100">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-green-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Farm Location</p>
                                                <p className="text-xl font-bold text-gray-900">{listing.villageName}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200 bg-white-100">
                                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-purple-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Order Date</p>
                                                <p className="text-lg font-bold text-gray-900">
                                                    {new Date(order.orderDate).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quality Badges */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex flex-wrap gap-3">
                                        <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-300">
                                            <Leaf className="w-4 h-4 mr-2" />
                                            Fresh Produce
                                        </span>
                                        <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-300">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Quality Assured
                                        </span>
                                        <span className="inline-flex items-center px-4 py-2 bg-yellow-300 text-yellow-800 rounded-full text-sm font-medium border border-yellow-300 ">
                                            <Award className="w-4 h-4 mr-2" />
                                            Farm Direct
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div className="bg-gradient-to-r from-yellow-200 to-green-100 rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <Package className="w-5 h-5 text-blue-700" />
                                    </div>
                                    Order Summary
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Product Price ({order.quantityKg} kg × ₹{listing.pricePerKg})</span>
                                        <span className="font-semibold text-gray-900">₹{(order.quantityKg * listing.pricePerKg).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-gray-600">Delivery charges ({order.quantityKg} kg × ₹{listing.deliveryChargePerKg})</span>
                                        <span className="font-semibold text-gray-900">₹{(order.quantityKg * 5).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-t border-gray-100 gap-4">
                                        <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                        <span className="text-2xl font-bold text-green-700">₹{(order.totalPrice + (order.quantityKg * 5)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Order Timeline Card */}
                        <div className="bg-blue-50 rounded-3xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-indigo-700" />
                                    </div>
                                    Order Timeline
                                </h3>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Order Placed */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 border border-green-300">
                                            <CheckCircle className="w-5 h-5 text-green-700" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">Order Placed</h4>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.orderDate).toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Order Confirmed */}
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${['CONFIRMED'].includes(order.status?.toUpperCase())
                                            ? 'bg-green-100 border-green-300'
                                            : 'bg-gray-100 border-gray-300'
                                            }`}>
                                            <CheckCircle className={`w-5 h-5 ${['CONFIRMED'].includes(order.status?.toUpperCase())
                                                ? 'text-green-700'
                                                : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">Order Confirmed</h4>
                                            <p className="text-sm text-gray-600">
                                                {['CONFIRMED'].includes(order.status?.toUpperCase())
                                                    ? 'Farmer has confirmed your order'
                                                    : 'Awaiting farmer confirmation'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Picked Up */}
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus?.toUpperCase())
                                            ? 'bg-blue-100 border-blue-300'
                                            : 'bg-gray-100 border-gray-300'
                                            }`}>
                                            <Package className={`w-5 h-5 ${['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus?.toUpperCase())
                                                ? 'text-blue-700'
                                                : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">Picked Up</h4>
                                            <p className="text-sm text-gray-600">
                                                {['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus?.toUpperCase())
                                                    ? 'Order picked up by transporter'
                                                    : 'Awaiting pickup'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* In Transit */}
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${['IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus?.toUpperCase())
                                            ? 'bg-purple-100 border-purple-300'
                                            : 'bg-gray-100 border-gray-300'
                                            }`}>
                                            <Truck className={`w-5 h-5 ${['IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus?.toUpperCase())
                                                ? 'text-purple-700'
                                                : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">In Transit</h4>
                                            <p className="text-sm text-gray-600">
                                                {['IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus?.toUpperCase())
                                                    ? 'Your order is on the way'
                                                    : 'Awaiting dispatch'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Delivered */}
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${order.deliveryStatus?.toUpperCase() === 'DELIVERED'
                                            ? 'bg-green-100 border-green-300'
                                            : 'bg-gray-100 border-gray-300'
                                            }`}>
                                            <Package className={`w-5 h-5 ${order.deliveryStatus?.toUpperCase() === 'DELIVERED'
                                                ? 'text-green-700'
                                                : 'text-gray-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">Delivered</h4>
                                            <p className="text-sm text-gray-600">
                                                {order.deliveryStatus?.toUpperCase() === 'DELIVERED'
                                                    ? 'Order delivered successfully'
                                                    : 'Pending delivery'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Sidebar */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Farmer Contact Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                        <User className="w-6 h-6 text-green-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Farmer Details</h3>
                                        <p className="text-black text-sm">Direct from farm</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 bg-yellow-50">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User className="w-8 h-8 text-green-700" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">{farmer.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">Verified Farmer</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-xl border border-gray-200">
                                        <div className="flex items-center gap-3 ">
                                            <Phone className="w-5 h-5 text-gray-600" />
                                            <span className="text-gray-900 font-medium">{farmer.mobile}</span>
                                        </div>
                                        <a
                                            href={`tel:${farmer.mobile}`}
                                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-all duration-200 hover:scale-105 border border-green-300"
                                        >
                                            <Phone className="w-4 h-4 text-green-700" />
                                        </a>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 bg-yellow-100">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-600" />
                                            <span className="text-gray-900 font-medium text-sm">{farmer.email}</span>
                                        </div>
                                        <a
                                            href={`mailto:${farmer.email}`}
                                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-all duration-200 hover:scale-105 border border-green-300"
                                        >
                                            <Mail className="w-4 h-4 text-green-700" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transporter Contact Card */}
                        {transporter ? (
                            <div className="bg-yellow-50 rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                            <Truck className="w-6 h-6 text-blue-700" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Transport Partner</h3>
                                            <p className="text-blue-700 text-sm">Reliable delivery service</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Truck className="w-8 h-8 text-blue-700" />
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900">{transporter.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">Verified Transporter</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-gray-600" />
                                                <span className="text-gray-900 font-medium">{transporter.mobile}</span>
                                            </div>
                                            <a
                                                href={`tel:${transporter.mobile}`}
                                                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105 border border-blue-300"
                                            >
                                                <Phone className="w-4 h-4 text-blue-700" />
                                            </a>
                                        </div>

                                        <div className="flex items-center bg-yellow-100 justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-gray-600" />
                                                <span className="text-gray-900 font-medium text-sm">{transporter.email}</span>
                                            </div>
                                            <a
                                                href={`mailto:${transporter.email}`}
                                                className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105 border border-blue-300"
                                            >
                                                <Mail className="w-4 h-4 text-blue-700" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            <Truck className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Transport Assignment</h3>
                                            <p className="text-gray-700 text-sm">Pending assignment</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 text-center bg-yellow-50">
                                    <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="w-8 h-8 text-gray-400 animate-pulse" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Awaiting Assignment</h4>
                                    <p className="text-gray-600 mb-4">A transporter will be assigned to your order soon</p>
                                    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-300 animate-pulse">
                                        <Clock className="w-4 h-4 mr-2 text-yellow-800" />
                                        Processing...
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <MessageCircle className="w-5 h-5 text-purple-700" />
                                    </div>
                                    Quick Actions
                                </h3>
                            </div>

                            <div className="p-6 space-y-4">
                                <button className="w-full flex items-center justify-center gap-3 p-4 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-xl transition-all duration-200 hover:scale-105 border border-green-200">
                                    <MessageCircle className="w-5 h-5" />
                                    Contact Support
                                </button>

                                <button className="w-full flex items-center justify-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-xl transition-all duration-200 hover:scale-105 border border-blue-200">
                                    <Navigation className="w-5 h-5" />
                                    Track Location
                                </button>

                                <button className="w-full flex items-center justify-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium rounded-xl transition-all duration-200 hover:scale-105 border border-purple-200">
                                    <ExternalLink className="w-5 h-5" />
                                    View Receipt
                                </button>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-12 bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-green-700" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">Order Protected</h4>
                                <p className="text-sm text-gray-600">Your order is covered by our buyer protection policy</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200 border border-gray-300">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Need Help?
                            </button>

                            {order.deliveryStatus?.toUpperCase() === 'DELIVERED' && (
                                <button className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-200 border border-green-500">
                                    <Star className="w-4 h-4 mr-2" />
                                    Rate Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}