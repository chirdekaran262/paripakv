import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import {
    LoaderCircle,
    PackageOpen,
    Package,
    IndianRupee,
    Weight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Truck,
    Eye,
    Filter,
    Search,
    RefreshCw,
    TrendingUp,
    BarChart3,
    Calendar,
    User,
    ShoppingCart,
    ArrowRight,
    Star,
    MapPin
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function ManageOrders() {
    const { isAuthenticated, userRole } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const token = Cookies.get("token");

    const fetchOrders = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            setError(null);

            const response = await axios.get("http://localhost:8089/orders/farmerOrders", {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(response.data);
            setFilteredOrders(response.data);
        } catch (err) {
            setError("Error fetching orders. Please try again.");
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    };

    useEffect(() => {
        if (userRole === "FARMER") {
            fetchOrders();
        }
    }, [userRole]);

    // Filter and search functionality
    useEffect(() => {
        let filtered = orders;

        // Filter by status
        if (selectedFilter !== "ALL") {
            filtered = filtered.filter(order => order.status === selectedFilter);
        }

        // Search functionality
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredOrders(filtered);
    }, [orders, selectedFilter, searchTerm]);

    const handleRefresh = () => {
        fetchOrders(true);
    };

    const getStatusConfig = (status) => {
        const configs = {
            'PENDING': {
                color: 'text-yellow-800 bg-yellow-100 border-yellow-300',
                icon: AlertCircle,
                bgGradient: 'from-yellow-50 to-amber-50'
            },
            'CONFIRMED': {
                color: 'text-green-800 bg-green-50 border-green-300',
                icon: CheckCircle,
                bgGradient: 'from-green-50 to-emerald-50'
            },
            'REJECTED': {
                color: 'text-red-800 bg-red-50 border-red-300',
                icon: XCircle,
                bgGradient: 'from-red-50 to-rose-50'
            },
            'DELIVERED': {
                color: 'text-blue-800 bg-blue-50 border-blue-300',
                icon: Truck,
                bgGradient: 'from-blue-50 to-cyan-50'
            }
        };
        return configs[status?.toUpperCase()] || configs['PENDING'];
    };

    const getOrderStats = () => {
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'PENDING').length,
            confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
            rejected: orders.filter(o => o.status === 'REJECTED').length,
            totalRevenue: orders
                .filter(o => o.status === 'CONFIRMED' || o.status === 'DELIVERED')
                .reduce((sum, o) => sum + o.totalPrice, 0)
        };
        return stats;
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

    const getDeliveryStatus = () => {
        const deliveryStatus = orders.map(order => {
            const config = getDeliveryStatusConfig(order.deliveryStatus);
            return {
                ...order,
                deliveryStatusConfig: config
            };
        });
        return deliveryStatus;
    }

    if (!isAuthenticated || userRole !== "FARMER") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
                <Header />
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Unauthorized Access</h2>
                        <p className="text-gray-600">You need farmer access to view this page.</p>
                    </div>
                </div>
            </div>
        );
    }

    const stats = getOrderStats();

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
            <Header />

            {/* Enhanced Header Section */}
            <div className="bg-gradient-to-br from-green-100 via-blue-50 to-yellow-100 shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
                            <p className="text-gray-600">Track and manage all your agricultural orders</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="inline-flex items-center px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-xl transition-colors duration-200 disabled:opacity-50 border border-green-200"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                                {filteredOrders.length} of {orders.length} orders
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-6">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 mx-auto"></div>
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto absolute top-0"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Orders</h3>
                                <p className="text-gray-600">Please wait while we fetch your orders...</p>
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-6 max-w-md">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-10 h-10 text-red-600" />
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
                ) : (
                    <>
                        {/* Enhanced Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                        <Package className="w-6 h-6 text-blue-700" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Total Orders</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>

                            <div className="bg-gradient-to-r from-yellow-50 via-white to-yellow-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-yellow-700" />
                                    </div>
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Pending</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 via-white to-green-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-700" />
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Confirmed</h3>
                                <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
                            </div>

                            <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50 rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                                        <IndianRupee className="w-6 h-6 text-purple-700" />
                                    </div>
                                    <BarChart3 className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">Revenue</h3>
                                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Enhanced Filters and Search */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {['ALL', 'PENDING', 'CONFIRMED', 'REJECTED', 'DELIVERED'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setSelectedFilter(filter)}
                                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${selectedFilter === filter
                                                ? 'bg-green-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {filter === 'ALL' ? 'All Orders' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Orders Grid */}
                        {filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <PackageOpen className="w-10 h-10 text-gray-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {searchTerm || selectedFilter !== 'ALL' ? 'No matching orders found' : 'No orders yet'}
                                </h3>
                                <p className="text-gray-600 text-center max-w-md">
                                    {searchTerm || selectedFilter !== 'ALL'
                                        ? 'Try adjusting your search or filter criteria.'
                                        : 'When customers place orders for your products, they will appear here.'
                                    }
                                </p>
                                {(searchTerm || selectedFilter !== 'ALL') && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedFilter('ALL');
                                        }}
                                        className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors duration-200"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredOrders.map((order, index) => {
                                    const statusConfig = getStatusConfig(order.status);
                                    const StatusIcon = statusConfig.icon;
                                    const deliveryStatusConfig = getDeliveryStatusConfig(order.deliveryStatus);
                                    const DeliveryStatusIcon = deliveryStatusConfig.icon;
                                    return (
                                        <div
                                            key={order.id}
                                            className={`bg-gradient-to-br ${statusConfig.bgGradient} rounded-3xl shadow-sm border border-gray-200 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in`}
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            {/* Card Header */}
                                            <div className="p-6 border-b border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                            <Package className="w-5 h-5 text-gray-700" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">#{order.id.slice(0, 8)}</p>
                                                            <p className="text-xs text-gray-600">Order ID</p>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-2 ${statusConfig.color}`}>
                                                        <StatusIcon className="w-3 h-3 mr-1" />
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Weight className="w-4 h-4 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600">Quantity</p>
                                                            <p className="font-bold text-gray-900">{order.quantityKg} kg</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                            <IndianRupee className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-600">Amount</p>
                                                            <p className="font-bold text-gray-900">₹{order.totalPrice}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">                                                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <Calendar className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-600">Order Date</p>
                                                        <p className="font-semibold text-gray-900">
                                                            {new Date().toLocaleDateString('en-IN')}
                                                        </p>
                                                    </div>

                                                </div>

                                                    <div className="flex items-center gap-3 p-3 bg-white/70 rounded-xl">
                                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                            <MapPin className="w-4 h-4 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-600">Delivery Status</div>
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border-2 ${deliveryStatusConfig.color}`}>
                                                                <DeliveryStatusIcon className="w-3 h-3 mr-1" />
                                                                {order.deliveryStatus}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="p-6 pt-0">
                                                <button
                                                    onClick={() => navigate(`/orderDetails/${order.id}`)}
                                                    className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-xl border border-gray-200 transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md group"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Details
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                        }
                    </>
                )}
            </main>
        </div>
    );
}