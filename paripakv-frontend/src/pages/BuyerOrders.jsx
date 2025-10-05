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
    RefreshCw,
    Star,
    X,
    MessageSquare,
    Send,
    ClipboardList
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function BuyerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const token = Cookies.get("token");
    const { buyerId } = useParams();
    const navigate = useNavigate();

    const fetchOrders = async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            setError(null);

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/buyer/${buyerId}`, {
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

    const openReviewModal = (order) => {
        if (order.deliveryStatus !== 'DELIVERED') return;
        setSelectedOrder(order);
        setShowReviewModal(true);
        setReviewRating(0);
        setReviewComment('');
        setReviewError('');
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedOrder(null);
        setReviewRating(0);
        setReviewComment('');
        setReviewError('');
    };

    const handleStarClick = (rating) => {
        setReviewRating(rating);
    };

    const handleStarHover = (rating) => {
        setHoverRating(rating);
    };

    const handleStarLeave = () => {
        setHoverRating(0);
    };

    const submitReview = async () => {
        if (!reviewRating) {
            setReviewError('Please select a rating');
            return;
        }

        if (!reviewComment.trim()) {
            setReviewError('Please add a comment');
            return;
        }

        setSubmittingReview(true);
        setReviewError('');

        try {
            const reviewData = {
                orderId: selectedOrder.id,
                rating: reviewRating,
                comment: reviewComment.trim()
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/reviews`,
                reviewData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            // Success - close modal and show success message
            closeReviewModal();
            alert('Review submitted successfully!');

        } catch (err) {
            console.error("Error submitting review:", err);
            setReviewError(err.response?.data?.message || "Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
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

    const renderStars = (interactive = false) => {
        return [...Array(5)].map((_, index) => {
            const starValue = index + 1;
            const isActive = interactive
                ? (hoverRating || reviewRating) >= starValue
                : reviewRating >= starValue;

            return (
                <button
                    key={index}
                    type="button"
                    disabled={!interactive}
                    className={`transition-all duration-200 ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
                        }`}
                    onClick={() => interactive && handleStarClick(starValue)}
                    onMouseEnter={() => interactive && handleStarHover(starValue)}
                    onMouseLeave={() => interactive && handleStarLeave()}
                >
                    <Star
                        className={`w-8 h-8 transition-colors duration-200 ${isActive
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                </button>
            );
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
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
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
                                const isDelivered = order.deliveryStatus === 'DELIVERED';

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
                                        <div className="p-6 pt-0 space-y-3">
                                            <button
                                                onClick={() => navigate(`/order/${order.id}`)}
                                                className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => openReviewModal(order)}
                                                disabled={!isDelivered}
                                                className={`w-full inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${isDelivered
                                                        ? 'text-white bg-yellow-600 hover:bg-yellow-700 hover:scale-105'
                                                        : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Star className="w-4 h-4" />
                                                {isDelivered ? 'Add Review' : 'Review Available After Delivery'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <Star className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
                                    <p className="text-sm text-gray-600">Order #{selectedOrder.id?.slice(-8)}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeReviewModal}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Star Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Rate your experience
                                </label>
                                <div className="flex justify-center gap-2">
                                    {renderStars(true)}
                                </div>
                                <p className="text-center text-sm text-gray-500 mt-2">
                                    {reviewRating > 0 && (
                                        <>
                                            {reviewRating === 1 && "Poor"}
                                            {reviewRating === 2 && "Fair"}
                                            {reviewRating === 3 && "Good"}
                                            {reviewRating === 4 && "Very Good"}
                                            {reviewRating === 5 && "Excellent"}
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Share your thoughts
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        placeholder="Tell others about your experience with this order..."
                                        rows={4}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm"
                                        maxLength={500}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {reviewComment.length}/500 characters
                                </p>
                            </div>

                            {/* Error Message */}
                            {reviewError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <p className="text-sm">{reviewError}</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 flex gap-3">
                            <button
                                onClick={closeReviewModal}
                                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReview}
                                disabled={submittingReview || !reviewRating || !reviewComment.trim()}
                                className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            >
                                {submittingReview ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Submit Review
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}