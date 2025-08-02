import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {
    Loader2,
    PackageCheck,
    Eye,
    Tractor,
    IndianRupee,
    Weight,
    User2,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    Truck,
    Package,
    AlertCircle,
    RefreshCw
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { ClipboardList } from 'lucide-react';

export default function BuyerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const token = Cookies.get("token");
    const { buyerId } = useParams();
    const navigate = useNavigate();

    const fetchOrders = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            setError(null);

            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/orders/buyer/${buyerId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(response.data);
        } catch (err) {
            console.error("Error fetching buyer orders:", err);
            setError(err.response?.data?.message || "Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!token || !buyerId) return;
        fetchOrders();
    }, [token, buyerId]);

    const handleRefresh = () => {
        fetchOrders(true);
    };

    const getOrderStatusConfig = (status) => {
        const configs = {
            'CONFIRMED': {
                color: 'bg-green-50 text-green-800 border-green-300',
                icon: CheckCircle,
            },
            'PENDING': {
                color: 'bg-yellow-50 text-yellow-800 border-yellow-300',
                icon: Clock,
            },
            'REJECTED': {
                color: 'bg-red-50 text-red-800 border-red-300',
                icon: XCircle,
            },
            'CANCELLED': {
                color: 'bg-gray-50 text-gray-800 border-gray-300',
                icon: XCircle,
            }
        };
        return configs[status?.toUpperCase()] || configs['PENDING'];
    };

    const getDeliveryStatusConfig = (status) => {
        const configs = {
            'DELIVERED': {
                color: 'bg-green-50 text-green-800 border-green-300',
                icon: CheckCircle,
            },
            'PICKED_UP': {
                color: 'bg-blue-50 text-blue-800 border-blue-300',
                icon: Package,
            },
            'IN_TRANSIT': {
                color: 'bg-purple-50 text-purple-800 border-purple-300',
                icon: Truck,
            },
            'PENDING': {
                color: 'bg-yellow-50 text-yellow-800 border-yellow-300',
                icon: Clock,
            }
        };
        return configs[status?.toUpperCase()] || configs['PENDING'];
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
                <Header />
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-6">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 mx-auto"></div>
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto absolute top-0"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Your Orders</h3>
                                <p className="text-gray-600">Please wait while we fetch your order history...</p>
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
                <div className="max-w-6xl mx-auto px-4 py-12">
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

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 ">
            <Header />

            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-br from-green-100 via-blue-50 to-yellow-100 shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                <ClipboardList className="w-6 h-6 text-green-700" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                                <p className="text-gray-600 mt-1">Track the status of your crop orders below</p>
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
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {orders.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[50vh]">
                        <div className="text-center space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                <ClipboardList className="h-10 w-10 text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
                                <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start exploring fresh produce from local farmers!</p>
                                <button
                                    onClick={() => navigate('/listings')}
                                    className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-200"
                                >
                                    <Tractor className="w-4 h-4 mr-2" />
                                    Browse Products
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Order Statistics */}
                        <div className="grid md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-green-100 via-blue-50 to-orange-200 rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                        <ClipboardList className="w-6 h-6 text-blue-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-400 rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {orders.filter(order => order.status === 'CONFIRMED').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="inline-flex items-center px-4 py-2 bg-yellow-300 text-yellow-800 rounded-2xl text-sm font-medium border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-amber-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {orders.filter(order => order.status === 'PENDING').length}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-purple-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Delivered</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {orders.filter(order => order.deliveryStatus === 'DELIVERED').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orders.map((order, idx) => {
                                const orderStatusConfig = getOrderStatusConfig(order.status);
                                const deliveryStatusConfig = getDeliveryStatusConfig(order.deliveryStatus);
                                const OrderStatusIcon = orderStatusConfig.icon;
                                const DeliveryStatusIcon = deliveryStatusConfig.icon;

                                return (
                                    <div
                                        key={idx}
                                        className="bg-gradient-to-br from-green-200 via-blue-50 to-yellow-200 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Card Header */}
                                        <div className="bg-gradient-to-r from-yellow-400 to-via-blue-300 to-green-200 p-6 border-b border-gray-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-300 rounded-xl flex items-center justify-center">
                                                        <Tractor className="w-5 h-5 text-green-700" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-sm">Order #{order.id?.slice(-8) || 'N/A'}</h3>
                                                        <p className="text-xs text-gray-600">ID: {order.listingId || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Status Badges */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${orderStatusConfig.color}`}>
                                                    <OrderStatusIcon className="w-3 h-3 mr-1" />
                                                    {order.status}
                                                </span>
                                                {order.deliveryStatus && (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${deliveryStatusConfig.color}`}>
                                                        <DeliveryStatusIcon className="w-3 h-3 mr-1" />
                                                        {order.deliveryStatus.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl border border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <Weight className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm font-medium text-gray-600">Quantity</span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">{order.quantityKg} kg</span>
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl border border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <IndianRupee className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm font-medium text-gray-600">Total Amount</span>
                                                    </div>
                                                    <span className="font-bold text-green-700">₹{order.totalPrice.toFixed(2)}</span>
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-xl border border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <Calendar className="w-4 h-4 text-gray-600" />
                                                        <span className="text-sm font-medium text-gray-600">Order Date</span>
                                                    </div>
                                                    <span className="font-bold text-gray-900">{formatDate(order.orderDate)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="p-6 pt-0">
                                            <button
                                                onClick={() => navigate(`/order/${order.id}`)}
                                                className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}