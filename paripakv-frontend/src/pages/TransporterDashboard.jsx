import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Cookies from "js-cookie";
import Header from "../components/Header";
import {
    MapPin,
    Truck,
    Timer,
    Package,
    Phone,
    User,
    CheckCircle,
    Clock,
    AlertCircle,
    RefreshCw,
    Navigation,
    Camera,
    Upload,
    Star,
    TrendingUp,
    Calendar,
    Route,
    Wallet,
    Bell,
    Filter,
    Search,
    ArrowRight,
    MessageCircle,
    FileText,
    Eye,
    MapIcon,
    IndianRupee,
    Weight,
    Home,
    UserCheck,
    Loader2,
    Award,
    BarChart3,
    Target,
    Activity,
    DollarSign,
    Zap
} from "lucide-react";
// import { reloadResources } from "i18next";

export default function TransporterDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadingProof, setUploadingProof] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [activeTab, setActiveTab] = useState("orders");
    const [transporterStats, setTransporterStats] = useState({
        totalDeliveries: 0,
        completedDeliveries: 0,
        activeDeliveries: 0,
        rating: 0,
        earnings: 0,
        thisMonthEarnings: 0,
        todayDeliveries: 0
    });
    const [buyerDetails, setBuyerDetails] = useState({});
    const [productDetails, setProductDetails] = useState({});
    const [farmerDetails, setFarmerDetails] = useState({});
    const { userId } = useAuth();
    const token = Cookies.get("token");
    const [selectedFile, setSelectedFile] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState("");

    // Enhanced fetch user details with caching
    const fetchUserDetails = useCallback(async (buyerId) => {
        if (buyerDetails[buyerId]) return buyerDetails[buyerId];

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/productDetails?id=${buyerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBuyerDetails(prev => ({ ...prev, [buyerId]: response.data }));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch buyer details:", error);
            return null;
        }
    }, [buyerDetails, token]);

    // Enhanced fetch product details with caching
    const fetchProductDetails = useCallback(async (listingId) => {
        if (productDetails[listingId]) return productDetails[listingId];

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/listings/byId?id=${listingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProductDetails(prev => ({ ...prev, [listingId]: response.data }));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch product details:", error);
            return null;
        }
    }, [productDetails, token]);
    // Enhanced fetch farmer details with caching
    const fetchFarmerDetails = useCallback(async (farmerId) => {
        if (farmerDetails[farmerId]) return farmerDetails[farmerId];

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/users/productDetails?id=${farmerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFarmerDetails(prev => ({ ...prev, [farmerId]: response.data }));
            return response.data;
        } catch (error) {
            console.error("Failed to fetch farmer details:", error);
            return null;
        }
    }, [farmerDetails, token]);

    // Enhanced fetch orders with related data
    const fetchOrders = useCallback(async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/transporter/getOrder`, {
                params: { transporterId: userId },
                headers: { Authorization: `Bearer ${token}` }
            });

            const ordersData = response.data || [];
            setOrders(ordersData);

            // Fetch related data for each order
            for (const order of ordersData) {
                if (order.buyerId) {
                    fetchUserDetails(order.buyerId);
                }
                if (order.listingId) {
                    const product = await fetchProductDetails(order.listingId);
                    if (product && product.farmerId) {
                        fetchFarmerDetails(product.farmerId);
                    }
                }
            }

            // Calculate enhanced stats
            const stats = calculateEnhancedStats(ordersData);
            setTransporterStats(stats);
        } catch (error) {
            console.error("Failed to fetch transporter orders:", error);
            showNotification("Failed to fetch orders", "error");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId, token, fetchUserDetails, fetchProductDetails, fetchFarmerDetails]);

    // Enhanced statistics calculation
    const calculateEnhancedStats = (ordersData) => {
        const total = ordersData.length;
        const completed = ordersData.filter(order => order.deliveryStatus === "DELIVERED").length;
        const active = ordersData.filter(order =>
            ["CONFIRMED", "PICKED_UP", "IN_TRANSIT"].includes(order.deliveryStatus)
        ).length;

        const today = new Date().toDateString();
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();

        const todayDeliveries = ordersData.filter(order =>
            order.deliveryTime && new Date(order.deliveryTime).toDateString() === today
        ).length;

        const thisMonthDeliveries = ordersData.filter(order => {
            if (!order.deliveryTime) return false;
            const deliveryDate = new Date(order.deliveryTime);
            return deliveryDate.getMonth() === thisMonth && deliveryDate.getFullYear() === thisYear;
        }).length;

        return {
            totalDeliveries: total,
            completedDeliveries: completed,
            activeDeliveries: active,
            rating: 4.7 + (completed * 0.01), // Dynamic rating based on completed deliveries
            earnings: completed * 275, // Base earnings
            thisMonthEarnings: thisMonthDeliveries * 275,
            todayDeliveries: todayDeliveries
        };
    };




    useEffect(() => {
        if (userId) {
            fetchOrders();
        }
    }, [userId, fetchOrders]);

    // Enhanced auto refresh with better UX
    useEffect(() => {
        const interval = setInterval(() => {
            if (!loading && !refreshing) {
                setRefreshing(true);
                fetchOrders();
            }
        }, 120000); // 2 minutes

        return () => clearInterval(interval);
    }, [loading, refreshing, fetchOrders]);

    // Enhanced pickup order function
    const pickupOrder = async (orderId) => {
        try {
            showNotification("Processing pickup request...", "info");

            await axios.post(`${import.meta.env.VITE_API_URL}/orders/transporter/${orderId}/pickup?transporterId=${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(prev => prev.map(order =>
                order.id === orderId ? {
                    ...order,
                    deliveryStatus: "PICKED_UP",
                    transporterId: userId,
                    pickupTime: new Date().toISOString()
                } : order
            ));

            showNotification("Order picked up successfully! 📦", "success");
        } catch (error) {
            console.error("Failed to pickup order:", error);
            showNotification("Failed to pickup order. Please try again.", "error");
        }
    };

    // Enhanced deliver order function
    const deliverOrder = async (orderId) => {
        try {
            showNotification("Processing delivery...", "info");

            await axios.post(`${import.meta.env.VITE_API_URL}/orders/transporter/${orderId}/deliver`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(prev => prev.map(order =>
                order.id === orderId ? {
                    ...order,
                    deliveryStatus: "DELIVERED",
                    deliveryTime: new Date().toISOString()
                } : order
            ));

            showNotification("Order delivered successfully! 🎉 Great job!", "success");

            // Recalculate stats
            const updatedOrders = orders.map(order =>
                order.id === orderId ? {
                    ...order,
                    deliveryStatus: "DELIVERED",
                    deliveryTime: new Date().toISOString()
                } : order
            );
            setTransporterStats(calculateEnhancedStats(updatedOrders));
        } catch (error) {
            console.error("Failed to deliver order:", error);
            showNotification("Failed to mark as delivered. Please try again.", "error");
        }
    };

    // Enhanced update order status function
    const updateOrderStatus = async (orderId, newStatus) => {
        if (newStatus === "PICKED_UP") {
            await pickupOrder(orderId);
        } else if (newStatus === "DELIVERED") {
            await deliverOrder(orderId);
        } else if (newStatus === "IN_TRANSIT") {
            try {
                showNotification("Updating order status...", "info");

                await axios.put(`${import.meta.env.VITE_API_URL}/orders/transporter/${orderId}/inTransit`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, deliveryStatus: "IN_TRANSIT" } : order
                ));

                showNotification("Order marked as in transit 🚛", "success");
            } catch (error) {
                console.error("Failed to mark order as in transit:", error);
                showNotification("Failed to update order status", "error");
            }
        }
    };

    // Enhanced upload delivery proof function
    const handleUploadProof = async (orderId, file) => {
        setUploadingProof(orderId);
        try {
            const formData = new FormData();
            formData.append('File', file); // matches your backend param

            await axios.post(
                `${import.meta.env.VITE_API_URL}/orders/${orderId}/proof`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            showNotification(`Uploading: ${percent}%`, "info");
                        }
                    }
                }
            );

            showNotification("✅ Delivery proof uploaded successfully! \nCheck Mail For OTP", "success");
            setShowUploadModal(false);
            setSelectedFile(null); // clear file after upload
            fetchOrders();
        } catch (error) {
            console.error("Failed to upload proof:", error);
            showNotification(error.response?.data?.message || "Failed to upload delivery proof", "error");
        } finally {
            setUploadingProof(null);
        }
    };

    async function sendOtp(orderId) {
        await axios.post(`${import.meta.env.VITE_API_URL}/orders/send-otp/${orderId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }

    async function verifyOtp(orderId, code) {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/orders/${orderId}/verify-otp`,
                { code: code },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return res.status === 200; // true if OTP is valid
        } catch (err) {
            return false; // false if OTP is invalid or request fails
        }
    }



    // Enhanced notification system
    const showNotification = (message, type = "success") => {
        const notification = document.createElement('div');
        const colors = {
            success: "bg-green-700 border-green-400",
            error: "bg-red-500 border-red-400",
            info: "bg-blue-500 border-blue-400",
            warning: "bg-yellow-500 border-yellow-400"
        };

        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl z-50 transform transition-all duration-300 border-l-4 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="flex-shrink-0">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '⚠️'}
                </div>
                <div class="text-sm font-medium">${message}</div>
            </div>
        `;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    };

    // Enhanced filtering with better search
    const filteredOrders = orders.filter(order => {
        const matchesFilter = statusFilter === "ALL" || order.deliveryStatus === statusFilter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            order.id.toString().toLowerCase().includes(searchLower) ||
            order.deliveryAddress?.toLowerCase().includes(searchLower) ||
            order.pickupLocation?.toLowerCase().includes(searchLower) ||
            productDetails[order.listingId]?.name?.toLowerCase().includes(searchLower) ||
            buyerDetails[order.buyerId]?.name?.toLowerCase().includes(searchLower);

        return matchesFilter && matchesSearch;
    });

    // Enhanced status colors and icons
    const getStatusInfo = (status) => {
        const statusMap = {
            "CONFIRMED": {
                color: "bg-blue-100 text-blue-800 border-blue-200",
                icon: Clock,
                bgColor: "bg-blue-50",
                description: "Ready for pickup"
            },
            "PICKED_UP": {
                color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                icon: Package,
                bgColor: "bg-yellow-50",
                description: "Order collected"
            },
            "IN_TRANSIT": {
                color: "bg-purple-100 text-purple-800 border-purple-200",
                icon: Truck,
                bgColor: "bg-purple-50",
                description: "On the way"
            },
            "DELIVERED": {
                color: "bg-green-100 text-green-800 border-green-200",
                icon: CheckCircle,
                bgColor: "bg-green-50",
                description: "Successfully delivered"
            },
            "CANCELLED": {
                color: "bg-red-100 text-red-800 border-red-200",
                icon: AlertCircle,
                bgColor: "bg-red-50",
                description: "Order cancelled"
            }
        };
        return statusMap[status] || statusMap["CONFIRMED"];
    };

    const getNextAction = (status) => {
        const actions = {
            "CONFIRMED": { text: "Pickup Order", nextStatus: "PICKED_UP", icon: Package, color: "bg-blue-600 hover:bg-blue-700" },
            "PICKED_UP": { text: "Start Journey", nextStatus: "IN_TRANSIT", icon: Truck, color: "bg-purple-600 hover:bg-purple-700" },
            "IN_TRANSIT": { text: "Mark Delivered", nextStatus: "DELIVERED", icon: CheckCircle, color: "bg-green-600 hover:bg-green-700" }
        };
        return actions[status];
    };

    // const handlePayment = async (orderId) => {
    //     try {
    //         const response = await fetch("http://localhost:8089/api/payment/create-order", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    //             body: JSON.stringify({ amount: 500 }) // Example amount
    //         });

    //         const order = await response.json();

    //         if (!window.Razorpay) {
    //             alert("Razorpay SDK not loaded!");
    //             return;
    //         }

    //         const options = {
    //             key: "rzp_test_12345", // your test key
    //             amount: order.amount,
    //             currency: order.currency,
    //             name: "My Ecommerce",
    //             description: "Order Payment",
    //             order_id: order.id,
    //             handler: function (response) {
    //                 alert("Payment Success: " + response.razorpay_payment_id);
    //             },
    //             prefill: {
    //                 name: "Test User",
    //                 email: "test@example.com",
    //                 contact: "9876543210",
    //             },
    //             theme: { color: "#3399cc" },
    //         };

    //         const rzp = new window.Razorpay(options);
    //         rzp.open();
    //     } catch (err) {
    //         console.error("Payment Error:", err);
    //     }
    // };
    const handlePayment = async (amount) => {
        try {
            // 1. Ask backend to create order
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ amount }) // Rs. 500
            });

            const orderData = await res.json();

            // 2. Initialize Razorpay checkout
            const options = {
                key: orderData.key,            // ✅ from backend
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.id,
                name: "Paripakv",
                description: "Crop Payment",
                handler: function (response) {
                    alert("Payment Success: " + response.razorpay_payment_id);
                    // optionally call /api/payment/verify here
                },
                prefill: {
                    name: "Farmer User",
                    email: "farmer@example.com",
                    contact: "9876543210"
                },
                theme: { color: "#05a11fff" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Payment Error:", err);
            alert("Payment failed, please try again");
        }
    };


    // Enhanced loading state
    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-green-200 rounded-full animate-spin border-t-green-600"></div>
                                    <Truck className="absolute inset-0 m-auto w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">Loading Dashboard</h3>
                                <p className="text-gray-600 text-center">Fetching your delivery information...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
                {/* Enhanced Dashboard Header */}
                <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-lime-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                    <Truck className="w-10 h-10" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold mb-2">Transporter Hub</h1>
                                    <p className="text-green-50 text-lg">Manage deliveries • Track performance • Earn rewards</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => { setRefreshing(true); fetchOrders(); }}
                                    disabled={refreshing}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                                    <span className="hidden sm:inline">
                                        {refreshing ? 'Syncing...' : 'Refresh'}
                                    </span>
                                </button>

                                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                    <Bell className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-green-100 font-medium">ALL TIME</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">{transporterStats.totalDeliveries}</p>
                                    <p className="text-sm text-green-100">Total Orders</p>
                                </div>
                            </div>

                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-green-100 font-medium">SUCCESS</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">{transporterStats.completedDeliveries}</p>
                                    <p className="text-sm text-green-100">Completed</p>
                                </div>
                            </div>

                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-green-100 font-medium">ACTIVE</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">{transporterStats.activeDeliveries}</p>
                                    <p className="text-sm text-green-100">In Progress</p>
                                </div>
                            </div>

                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <Star className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs text-green-100 font-medium">RATING</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold mb-1">{transporterStats.rating.toFixed(1)}</p>
                                    <p className="text-sm text-green-100">Performance</p>
                                </div>
                            </div>
                        </div>

                        {/* Earnings Summary */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <IndianRupee className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Total Earnings</h3>
                                        <p className="text-3xl font-bold">₹{transporterStats.earnings.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-green-100">This Month</p>
                                    <p className="text-xl font-semibold">₹{transporterStats.thisMonthEarnings.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-green-100">Today</p>
                                    <p className="text-xl font-semibold">{transporterStats.todayDeliveries} deliveries</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Enhanced Filters and Search */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by order ID, location, product, or buyer..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-700" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white min-w-[140px] text-gray-700"
                                    >
                                        <option value="ALL">All Status</option>
                                        <option value="CONFIRMED">Confirmed</option>
                                        <option value="PICKED_UP">Picked Up</option>
                                        <option value="IN_TRANSIT">In Transit</option>
                                        <option value="DELIVERED">Delivered</option>
                                    </select>
                                </div>

                                <div className="bg-green-100 rounded-xl p-2 flex items-center gap-1">
                                    <span className="text-sm text-gray-600">Found:</span>
                                    <span className="font-semibold text-green-800">{filteredOrders.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Orders List */}
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                            <div className="bg-gray-100 rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                                <Package className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Orders Found</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                {statusFilter === "ALL"
                                    ? "You haven't been assigned any deliveries yet. New opportunities will appear here when available."
                                    : `No orders found with status "${statusFilter.replace('_', ' ').toLowerCase()}".`
                                }
                            </p>
                            <div className="flex items-center justify-center gap-2 text-green-600">
                                <Zap className="w-5 h-5" />
                                <span className="font-medium">Ready to deliver when you are!</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredOrders.map((order) => {
                                const nextAction = getNextAction(order.deliveryStatus);
                                const statusInfo = getStatusInfo(order.deliveryStatus);
                                const product = productDetails[order.listingId];
                                const buyer = buyerDetails[order.buyerId];
                                const farmer = product ? farmerDetails[product.farmerId] : null;

                                return (
                                    <div
                                        key={order.id}
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                                    >
                                        {/* Enhanced Order Header */}
                                        <div className={`${statusInfo.bgColor} p-6 border-b border-gray-100`}>
                                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                                        <statusInfo.icon className="w-6 h-6 text-gray-700" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h2 className="text-xl font-bold text-gray-800">Order #{order.id.split('-')[0]}</h2>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                                {order.deliveryStatus.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            {new Date(order.orderDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">{statusInfo.description}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white rounded-xl p-3 shadow-sm">
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-800">Delivery Fee</p>
                                                            <p className="font-bold text-green-600 flex items-center gap-1">
                                                                <IndianRupee className="w-4 h-4" />
                                                                275
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {order.quantityKg && (
                                                        <div className="bg-white rounded-xl p-3 shadow-sm">
                                                            <div className="text-center">
                                                                <p className="text-xs text-gray-500">Weight</p>
                                                                <p className="font-bold text-blue-600 flex items-center gap-1">
                                                                    <Weight className="w-4 h-4" />
                                                                    {order.quantityKg} kg
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Order Content */}
                                        <div className="p-6">
                                            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                                                {/* Enhanced Pickup & Delivery Info */}
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                                                        <div className="bg-green-500 p-2 rounded-lg flex-shrink-0">
                                                            <MapPin className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="text-xs text-green-700 uppercase tracking-wide font-semibold">Pickup Location</p>
                                                                {farmer && (
                                                                    <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                                                                        {farmer.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="font-medium text-gray-800 text-sm break-words">
                                                                {product?.villageName || "Pickup location not specified"}
                                                            </p>
                                                            {farmer?.mobile && (
                                                                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                                                    <Phone className="w-3 h-3" />
                                                                    {farmer.mobile}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                        <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                                                            <Home className="w-4 h-4 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="text-xs text-blue-700 uppercase tracking-wide font-semibold">Delivery Address</p>
                                                                {buyer && (
                                                                    <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                                        {buyer.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="font-medium text-gray-800 text-sm break-words">
                                                                {order.deliveryAddress || "Delivery address not specified"}
                                                            </p>
                                                            {buyer?.mobile && (
                                                                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                                                    <Phone className="w-3 h-3" />
                                                                    {buyer.mobile}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Enhanced Order Details */}
                                                <div className="space-y-4">
                                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                            <Package className="w-4 h-4" />
                                                            Product Details
                                                        </h4>
                                                        <div className="space-y-3 text-sm">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Product:</span>
                                                                <span className="font-medium text-right text-gray-600">
                                                                    {product.name || "Loading..."}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Quantity:</span>
                                                                <span className="font-medium text-gray-600">
                                                                    {order.quantityKg ? `${order.quantityKg} kg` : "N/A"}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-gray-600">Order Value:</span>
                                                                <span className="font-bold text-green-600 text-lg">
                                                                    ₹{order.totalPrice?.toLocaleString() || "N/A"}
                                                                </span>
                                                            </div>
                                                            <div className="border-t border-gray-200 pt-2">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="text-gray-600 font-medium">Your Fee:</span>
                                                                    <span className="font-bold text-green-600 text-lg">₹275</span>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>


                                                </div>
                                            </div>

                                            {/* Enhanced Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                                                {nextAction && order.deliveryStatus !== "DELIVERED" && (
                                                    <button
                                                        onClick={() => updateOrderStatus(order.id, nextAction.nextStatus)}
                                                        className={`flex-1 ${nextAction.color} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
                                                    >
                                                        <nextAction.icon className="w-5 h-5" />
                                                        {nextAction.text}
                                                    </button>
                                                )}

                                                {order.deliveryStatus === "DELIVERED" && (
                                                    <div className="flex-1 bg-gradient-to-r from-green-500 to-emerald-100 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span>Completed Successfully</span>
                                                        <Award className="w-4 h-4" />
                                                    </div>
                                                )}

                                                {order.deliveryStatus === "IN_TRANSIT" && (
                                                    <button
                                                        onClick={() => { setSelectedOrder(order); setShowUploadModal(true); }}
                                                        className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                                    >
                                                        <Camera className="w-5 h-5" />
                                                        Upload Proof
                                                    </button>
                                                )}

                                                {order.deliveryStatus === "DELIVERED" && !order.isPaid && (
                                                    <button
                                                        onClick={() => handlePayment(order.totalPrice + 275)} // Pass complete order object
                                                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                                    >
                                                        💳 Pay Now ₹{order.totalPrice + 275}
                                                    </button>
                                                )}

                                                {order.deliveryStatus === "DELIVERED" && order.isPaid && (
                                                    <div className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span>Payment Completed</span>
                                                        <Award className="w-4 h-4" />
                                                    </div>
                                                )}

                                                {order.deliveryStatus === "IN_TRANSIT" && (
                                                    <>
                                                        {!selectedFile && !otpSent && !order.proofImageUrl ? (
                                                            // Step 1: File picker
                                                            <label className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl cursor-pointer">
                                                                <Camera className="w-5 h-5" />
                                                                Choose Proof
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        if (e.target.files[0]) {
                                                                            setSelectedFile(e.target.files[0]);
                                                                        }
                                                                    }}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        ) : !otpSent && !order.proofImageUrl ? (
                                                            // Step 2: Upload proof
                                                            <button
                                                                onClick={async () => {
                                                                    await handleUploadProof(order.id, selectedFile);
                                                                    // Send OTP after successful upload
                                                                    sendOtp()
                                                                    setOtpSent(true);

                                                                }}
                                                                className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                                                disabled={uploadingProof === order.id}
                                                            >
                                                                {uploadingProof === order.id ? "Uploading..." : "Upload Proof"}
                                                            </button>
                                                        ) : (
                                                            // Step 3: OTP Verification
                                                            <div className="flex gap-2 items-center">
                                                                <input
                                                                    type="text"
                                                                    maxLength={6}
                                                                    value={otpCode}
                                                                    onChange={(e) => setOtpCode(e.target.value)}
                                                                    className="border border-gray-300 rounded-lg px-3 py-2 text-center w-24 text-lg"
                                                                    placeholder="OTP"
                                                                />
                                                                <button
                                                                    onClick={async () => {
                                                                        const success = await verifyOtp(order.id, otpCode);
                                                                        if (success) {
                                                                            alert("Delivery verified!");
                                                                            showNotification("Delivery verified!");
                                                                            fetchOrders();
                                                                        } else {
                                                                            alert("Invalid OTP");
                                                                        }
                                                                    }}
                                                                    className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg"
                                                                >
                                                                    Verify
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                                    className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                                                >
                                                    <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                                                </button>

                                                {(order.deliveryAddress && order.pickupLocation) && (
                                                    <button
                                                        onClick={() => {
                                                            const origin = encodeURIComponent(order.pickupLocation);
                                                            const destination = encodeURIComponent(order.deliveryAddress);
                                                            window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');
                                                        }}
                                                        className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                                                    >
                                                        <Navigation className="w-5 h-5" />
                                                        Navigate
                                                    </button>
                                                )}
                                            </div>

                                            {selectedOrder?.id === order.id && (
                                                <div className="mt-6 pt-6 border-t border-gray-100 animate-in slide-in-from-top-2 duration-300 flex flex-col gap-6">
                                                    {/* Details Grid */}
                                                    <div className="grid md:grid-cols-2 gap-4">

                                                        {/* Farmer Details */}
                                                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
                                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                                                                <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2 text-green-800">
                                                                    <User className="w-4 h-4" />
                                                                    Farmer Details
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <p className="flex justify-between text-black">
                                                                        <span className="text-amber-700">Name:</span>
                                                                        <span className="font-medium">{farmer?.name || "Loading..."}</span>
                                                                    </p>
                                                                    <p className="flex justify-between text-black">
                                                                        <span className="text-amber-700">Phone:</span>
                                                                        <span className="font-medium">{farmer?.mobile || "N/A"}</span>
                                                                    </p>
                                                                    <p className="flex justify-between text-black">
                                                                        <span className="text-amber-700">Location:</span>
                                                                        <span className="font-medium text-right text-xs">
                                                                            {farmer?.address || "N/A"}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Buyer Details */}
                                                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-200">
                                                            <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 border border-rose-200">
                                                                <h4 className="font-semibold text-rose-800 mb-3 flex items-center gap-2 text-red-800">
                                                                    <User className="w-4 h-4" />
                                                                    Buyer Details
                                                                </h4>
                                                                <div className="space-y-2 text-sm">
                                                                    <p className="flex justify-between text-black">
                                                                        <span className="text-rose-700">Name:</span>
                                                                        <span className="font-medium">{buyer?.name || "Loading..."}</span>
                                                                    </p>
                                                                    <p className="flex justify-between text-black">
                                                                        <span className="text-rose-700">Phone:</span>
                                                                        <span className="font-medium">{buyer?.mobile || "N/A"}</span>
                                                                    </p>
                                                                    <p className="flex justify-between text-black">
                                                                        <span className="text-rose-700">Location:</span>
                                                                        <span className="font-medium text-right text-xs">
                                                                            {buyer?.address || "N/A"}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Trip Info */}
                                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                                                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                                                <Route className="w-4 h-4" />
                                                                Trip Info
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <p className="flex justify-between">
                                                                    <span className="text-blue-700">Distance:</span>
                                                                    <span className="font-medium text-gray-600">~25 km</span>
                                                                </p>
                                                                <p className="flex justify-between">
                                                                    <span className="text-blue-700">Est. Time:</span>
                                                                    <span className="font-medium text-gray-600">1.5 hours</span>
                                                                </p>
                                                                <p className="flex justify-between">
                                                                    <span className="text-blue-700">Route:</span>
                                                                    <span className="font-medium text-gray-600">Optimal</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Earnings Breakdown */}
                                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                                            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                                                <Wallet className="w-4 h-4" />
                                                                Earnings Breakdown
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                <p className="flex justify-between">
                                                                    <span className="text-green-700">Base Fee:</span>
                                                                    <span className="font-medium text-gray-600">₹200</span>
                                                                </p>
                                                                <p className="flex justify-between">
                                                                    <span className="text-green-700">Distance:</span>
                                                                    <span className="font-medium text-gray-600">₹50</span>
                                                                </p>
                                                                <p className="flex justify-between">
                                                                    <span className="text-green-700">Bonus:</span>
                                                                    <span className="font-medium text-gray-600">₹25</span>
                                                                </p>
                                                                <div className="border-t border-green-200 pt-2">
                                                                    <p className="flex justify-between font-semibold">
                                                                        <span className="text-green-800">Total:</span>
                                                                        <span className="text-green-800">₹275</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Timeline Section */}
                                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                                            <Clock className="w-4 h-4" />
                                                            Timeline
                                                        </h4>
                                                        <div className="space-y-2 text-xs">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                                <span className="text-gray-600">Ordered:</span>
                                                                <span className="font-medium text-gray-600">
                                                                    {new Date(order.orderDate).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {order.pickupTime && (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                                                                    <span className="text-gray-600">Picked up:</span>
                                                                    <span className="font-medium text-gray-600">
                                                                        {new Date(order.pickupTime).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {order.deliveryTime && (
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                                    <span className="text-gray-600">Delivered:</span>
                                                                    <span className="font-medium text-gray-600">
                                                                        {new Date(order.deliveryTime).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}


                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Enhanced Upload Modal */}
                {showUploadModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
                            <div className="text-center mb-6">
                                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                                    <Camera className="w-8 h-8 text-blue-600 mx-auto" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload Delivery Proof</h3>
                                <p className="text-gray-600">
                                    Take a photo as proof of delivery for Order #{selectedOrder.id.split('-')[0]}
                                </p>
                            </div>

                            <div className="mb-6">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files[0]) {
                                            handleUploadProof(selectedOrder.id, e.target.files[0]);
                                        }
                                    }}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors duration-200 text-center cursor-pointer"
                                    disabled={uploadingProof}
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Accepted formats: JPG, PNG, HEIC (Max 10MB)
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    disabled={uploadingProof}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                {uploadingProof && (
                                    <div className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats Footer */}
                <div className="bg-white border-t border-gray-200 py-4 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center gap-4">
                                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                                {refreshing && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>Syncing...</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <span>Orders today: {transporterStats.todayDeliveries}</span>
                                <span>Success rate: {transporterStats.totalDeliveries > 0 ? Math.round((transporterStats.completedDeliveries / transporterStats.totalDeliveries) * 100) : 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
