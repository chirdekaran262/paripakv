import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "../components/Header";
import {
    CreditCard,
    IndianRupee,
    Leaf,
    MapPin,
    ShoppingCart,
    User,
    Mail,
    Phone,
    Calendar,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Truck,
    Star,
    Weight,
    DollarSign,
    AlertCircle,
    Copy,
    Shield,
    TrendingUp,
    RefreshCw,
    MessageCircle,
    Award
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [buyer, setBuyer] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);
    const [copiedId, setCopiedId] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const token = Cookies.get("token");

    const fetchOrderDetails = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);

            const orderRes = await axios.get(`${import.meta.env.VITE_API_URL}/orders/getById?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrder(orderRes.data);

            const [buyerRes, productRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/users/productDetails?id=${orderRes.data.buyerId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/listings/byId?id=${orderRes.data.listingId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setBuyer(buyerRes.data);
            setProduct(productRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const updateStatus = (newStatus, quantityKg) => {
        setStatusUpdating(true);
        setStatusMessage(null);

        axios.patch(`${import.meta.env.VITE_API_URL}/orders/${id}/status?status=${newStatus}&quantity=${quantityKg}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            setOrder((prev) => ({ ...prev, status: res.data.status }));
            setStatusMessage(`✅ Order ${newStatus.toLowerCase()} successfully`);
            setTimeout(() => setStatusMessage(null), 4000);
        }).catch(() => {
            setStatusMessage("❌ Failed to update order status. Please try again.");
            setTimeout(() => setStatusMessage(null), 4000);
        }).finally(() => setStatusUpdating(false));
    };

    const handleRefresh = () => {
        fetchOrderDetails(true);
    };

    const copyOrderId = () => {
        navigator.clipboard.writeText(order.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING': {
                color: 'text-yellow-800 bg-yellow-100 border-yellow-300',
                icon: AlertCircle,
                description: 'Awaiting your confirmation'
            },
            'CONFIRMED': {
                color: 'text-green-800 bg-green-50 border-green-300',
                icon: CheckCircle,
                description: 'Order confirmed successfully'
            },
            'REJECTED': {
                color: 'text-red-800 bg-red-50 border-red-300',
                icon: XCircle,
                description: 'Order has been rejected'
            },
            'DELIVERED': {
                color: 'text-blue-800 bg-blue-50 border-blue-300',
                icon: Truck,
                description: 'Order completed and delivered'
            }
        };
        return configs[status?.toUpperCase()] || configs['PENDING'];
    };

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
                                <p className="text-gray-600">Please wait while we fetch the information...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!order || !buyer || !product) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
                                <p className="text-gray-600 mb-6">We couldn't locate the order details you're looking for.</p>
                                <button
                                    onClick={() => navigate(-1)}
                                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
            <Header />

            {/* Enhanced Toast Notification */}
            {statusMessage && (
                <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right duration-300">
                    <div className={`px-6 py-4 rounded-xl shadow-2xl border-2 backdrop-blur-sm ${statusMessage.startsWith("✅")
                        ? "bg-emerald-50/95 text-emerald-800 border-emerald-300 shadow-emerald-200"
                        : "bg-red-50/95 text-red-800 border-red-300 shadow-red-200"
                        }`}>
                        <div className="flex items-center gap-2 font-medium">
                            {statusMessage}
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-br from-green-100 via-blue-50 to-yellow-100 shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                                <p className="text-gray-600 mt-1">Manage and track your agricultural orders</p>
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
                    <div className="mt-6 flex items-center gap-3 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border border-green-200">
                        <Package className="w-6 h-6 text-green-700" />
                        <div className="flex-1">
                            <span className="text-sm font-medium text-green-700">Order ID</span>
                            <code className="block font-mono text-lg font-bold text-green-900">
                                #{order.id}
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
                    <div className="bg-gradient-to-r from-green-50 via-blue-50 to-yellow-100 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                <ShoppingCart className="w-6 h-6 text-blue-700" />
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2 ${statusConfig.color}`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {order.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Order Status</h3>
                        <p className="text-sm text-gray-600">{statusConfig.description}</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 via-blue-50 to-yellow-100 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                                <Weight className="w-6 h-6 text-purple-700" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Quantity</h3>
                        <p className="text-3xl font-bold text-gray-900">{order.quantityKg} kg</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 via-blue-50 to-yellow-100 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                <IndianRupee className="w-6 h-6 text-green-700" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Total Amount</h3>
                        <p className="text-3xl font-bold text-gray-900">₹{order.totalPrice}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Enhanced Main Content */}
                    <div className="lg:col-span-3">
                        {/* Enhanced Order Summary Card */}
                        <div className="bg-gradient-to-r from-green-50 via-blue-50 to-yellow-100 rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <Package className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-white">Order Summary</h2>
                                        <p className="text-green-100 mt-1">Complete details of this order</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200">
                                            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                                                <Weight className="w-7 h-7 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Quantity Ordered</p>
                                                <p className="font-bold text-gray-900 text-2xl">{order.quantityKg} kg</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200">
                                            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                                                <IndianRupee className="w-7 h-7 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Amount</p>
                                                <p className="font-bold text-gray-900 text-3xl">₹{order.totalPrice}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200">
                                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Clock className="w-7 h-7 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Order Date</p>
                                                <p className="font-bold text-gray-900 text-xl">
                                                    {new Date().toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-gray-200">
                                            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <DollarSign className="w-7 h-7 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Price per kg</p>
                                                <p className="font-bold text-gray-900 text-xl">₹{product.pricePerKg}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Action Buttons */}
                                {order.status === "PENDING" && (
                                    <div className="mt-8 pt-8 border-t-2 border-gray-100">
                                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                                Order Actions Required
                                            </h3>
                                            <p className="text-gray-600 mb-6">Please review and take action on this pending order.</p>
                                            <div className="flex flex-col sm:flex-row gap-4">
                                                <button
                                                    onClick={() => updateStatus("CONFIRMED", order.quantityKg)}
                                                    disabled={statusUpdating}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-green-200"
                                                >
                                                    {statusUpdating ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                    ) : (
                                                        <CheckCircle className="w-5 h-5" />
                                                    )}
                                                    Confirm Order
                                                </button>
                                                <button
                                                    onClick={() => updateStatus("REJECTED", order.quantityKg)}
                                                    disabled={statusUpdating}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-red-200"
                                                >
                                                    {statusUpdating ? (
                                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                    ) : (
                                                        <XCircle className="w-5 h-5" />
                                                    )}
                                                    Reject Order
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Enhanced Product Details Card */}
                        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <Leaf className="w-7 h-7 text-green-800" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-green-800">{product.name}</h2>
                                        <p className="text-amber-100 mt-1 text-green-800">Fresh from {product.villageName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                                <Package className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Available Stock</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <p className="font-bold text-gray-900 text-xl">{product.quantityKg} kg</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                                                <p className="font-bold text-gray-900 text-xl">{product.villageName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                                <Calendar className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Available Date</p>
                                                <p className="font-bold text-gray-900 text-xl">{product.availableDate}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm">
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <IndianRupee className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Price per kg</p>
                                                <p className="font-bold text-gray-900 text-xl">₹{product.pricePerKg}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quality Badges */}
                                <div className="mt-8 pt-6 border-t border-amber-100">
                                    <div className="flex flex-wrap gap-3">
                                        <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-300">
                                            <Leaf className="w-4 h-4 mr-2" />
                                            Fresh Produce
                                        </span>
                                        <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-300">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Quality Assured
                                        </span>
                                        <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium border border-yellow-300">
                                            <Award className="w-4 h-4 mr-2" />
                                            Farm Direct
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Sidebar */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Enhanced Buyer Information Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 p-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Buyer Details</h3>
                                        <p className="text-blue-100 mt-1">Customer information</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <User className="w-8 h-8 text-blue-700" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">{buyer.name}</h4>
                                    <p className="text-sm text-gray-600 mt-1">Verified Buyer</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-5 h-5 text-gray-600" />
                                            <span className="text-gray-900 font-medium">{buyer.mobile}</span>
                                        </div>
                                        <a
                                            href={`tel:${buyer.mobile}`}
                                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-all duration-200 hover:scale-105 border border-green-300"
                                        >
                                            <Phone className="w-4 h-4 text-green-700" />
                                        </a>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-5 h-5 text-gray-600" />
                                            <span className="text-gray-900 font-medium text-sm">{buyer.email}</span>
                                        </div>
                                        <a
                                            href={`mailto:${buyer.email}`}
                                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-all duration-200 hover:scale-105 border border-green-300"
                                        >
                                            <Mail className="w-4 h-4 text-green-700" />
                                        </a>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-blue-100">
                                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-blue-200">
                                        Contact Buyer
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Order Timeline Card */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-indigo-700" />
                                    </div>
                                    Order Timeline
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">Track order progress</p>
                            </div>

                            <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 border border-green-300">
                                            <ShoppingCart className="w-5 h-5 text-green-700" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">Order Placed</h4>
                                            <p className="text-sm text-gray-600">Order created successfully</p>
                                            <p className="text-xs text-green-600 font-medium mt-1">
                                                {new Date().toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>

                                    {order.status !== "PENDING" && (
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${order.status === "CONFIRMED"
                                                ? "bg-green-100 border-green-300"
                                                : order.status === "REJECTED"
                                                    ? "bg-red-100 border-red-300"
                                                    : "bg-blue-100 border-blue-300"
                                                }`}>
                                                {order.status === "CONFIRMED" ? (
                                                    <CheckCircle className="w-5 h-5 text-green-700" />
                                                ) : order.status === "REJECTED" ? (
                                                    <XCircle className="w-5 h-5 text-red-700" />
                                                ) : (
                                                    <Truck className="w-5 h-5 text-blue-700" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">
                                                    Order {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                                                </h4>
                                                <p className="text-sm text-gray-600">Status updated by you</p>
                                                <p className={`text-xs font-medium mt-1 ${order.status === "CONFIRMED"
                                                    ? "text-green-600"
                                                    : order.status === "REJECTED"
                                                        ? "text-red-600"
                                                        : "text-blue-600"
                                                    }`}>
                                                    Recently
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === "PENDING" && (
                                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                                <div>
                                                    <p className="text-sm font-semibold text-amber-800">Action Required</p>
                                                    <p className="text-xs text-amber-600">Please confirm or reject this order</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {order.status === "CONFIRMED" && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 border border-blue-300">
                                                <Truck className="w-5 h-5 text-blue-700" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">Ready for Pickup</h4>
                                                <p className="text-sm text-gray-600">Awaiting transporter assignment</p>
                                                <p className="text-xs text-blue-600 font-medium mt-1">Next step</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

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

                            <div className="p-6 space-y-4 bg-gradient-to-br from-purple-50 to-pink-50">
                                <button className="w-full flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:scale-105 border border-gray-200 shadow-sm">
                                    <MessageCircle className="w-5 h-5" />
                                    Message Buyer
                                </button>

                                <button className="w-full flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:scale-105 border border-gray-200 shadow-sm">
                                    <Package className="w-5 h-5" />
                                    Update Inventory
                                </button>

                                <button className="w-full flex items-center justify-center gap-3 p-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-200 hover:scale-105 border border-gray-200 shadow-sm">
                                    <Truck className="w-5 h-5" />
                                    Arrange Pickup
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
                                <h4 className="font-bold text-gray-900">Seller Protection</h4>
                                <p className="text-sm text-gray-600">Your transactions are secure and protected</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200 border border-gray-300">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Support
                            </button>

                            {order.status === "CONFIRMED" && (
                                <button className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-200 border border-green-500">
                                    <Package className="w-4 h-4 mr-2" />
                                    Prepare Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}