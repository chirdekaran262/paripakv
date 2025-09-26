import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard, MessageCircle, Star, X, Eye, Calendar, AlertCircle, Award } from 'lucide-react';
import Cookies from 'js-cookie';
const FarmerInformation = ({ user, product, navigate }) => {
    const [showReviewsModal, setShowReviewsModal] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [loadingRating, setLoadingRating] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    const token = Cookies.get('token');
    const fetchAverageRating = async (farmerId) => {
        setLoadingRating(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/averagerating?farmerId=${farmerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rating = await response.json();
            setAverageRating(rating || 0);
        } catch (error) {
            console.error('Error fetching average rating:', error);
            setAverageRating(0);
        } finally {
            setLoadingRating(false);
        }
    };

    const fetchReviews = async (farmerId) => {
        setLoadingReviews(true);
        setReviewsError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/farmer/${farmerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reviewsData = await response.json();
            setReviews(reviewsData);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviewsError('Failed to load reviews. Please try again.');
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleViewReviews = () => {
        if (product?.farmerId) {
            setShowReviewsModal(true);
            fetchReviews(product.farmerId);
            fetchAverageRating(product.farmerId);
        }
    };

    const renderStars = (rating, size = 'w-4 h-4') => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center gap-0.5">
                {[...Array(fullStars)].map((_, index) => (
                    <Star key={`full-${index}`} className={`${size} text-yellow-400 fill-yellow-400`} />
                ))}
                {hasHalfStar && (
                    <div className="relative">
                        <Star className={`${size} text-gray-300 fill-gray-300`} />
                        <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                            <Star className={`${size} text-yellow-400 fill-yellow-400`} />
                        </div>
                    </div>
                )}
                {[...Array(emptyStars)].map((_, index) => (
                    <Star key={`empty-${index}`} className={`${size} text-gray-300 fill-gray-300`} />
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;

        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-700 bg-green-100 border-green-300';
        if (rating >= 4) return 'text-green-600 bg-green-50 border-green-200';
        if (rating >= 3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        if (rating >= 2) return 'text-orange-600 bg-orange-50 border-orange-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getRatingBadge = (rating) => {
        if (rating >= 4.5) return 'Excellent';
        if (rating >= 4) return 'Very Good';
        if (rating >= 3) return 'Good';
        if (rating >= 2) return 'Fair';
        return 'Needs Improvement';
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-green-600 p-2 rounded-xl">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Farmer Information</h3>
                        <p className="text-sm text-gray-500">Verified agricultural producer</p>
                    </div>
                </div>

                {user ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-medium">Name</span>
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <Mail className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-medium">Email</span>
                                    <p className="font-semibold text-gray-800 text-sm">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="bg-purple-100 p-2 rounded-lg">
                                    <Phone className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-medium">Mobile</span>
                                    <p className="font-semibold text-gray-800">{user.mobile}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="bg-yellow-100 p-2 rounded-lg">
                                    <CreditCard className="w-4 h-4 text-yellow-600" />
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 font-medium">Aadhaar</span>
                                    <p className="font-semibold text-gray-800">{user.aadhaar}</p>
                                </div>
                            </div>
                        </div>

                        {averageRating > 0 && (
                            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-100 p-2 rounded-lg">
                                        <Award className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {renderStars(averageRating, 'w-4 h-4')}
                                            <span className="font-bold text-gray-800">{averageRating.toFixed(1)}</span>
                                        </div>
                                        <p className={`text-xs font-medium px-2 py-1 rounded-full border ${getRatingColor(averageRating)}`}>
                                            {getRatingBadge(averageRating)} Rating
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 pt-2">
                            <button
                                onClick={() => product?.farmerId && navigate(`/chat/${product.farmerId}`)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4" />
                                Contact Farmer
                            </button>

                            <button
                                onClick={handleViewReviews}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" />
                                View Reviews & Ratings
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <User className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Farmer information not available</p>
                    </div>
                )}
            </div>

            {showReviewsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-xl">
                        <div className="bg-gray-50 p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-500 p-2 rounded-xl">
                                        <Star className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">Customer Reviews</h2>
                                        <p className="text-gray-500 text-sm">What customers are saying</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowReviewsModal(false)}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {averageRating > 0 && (
                                <div className="mt-4 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                    {loadingRating ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                                            <span className="text-gray-600">Loading rating...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-800">{averageRating.toFixed(1)}</div>
                                                    <div className="flex items-center gap-1">
                                                        {renderStars(averageRating, 'w-4 h-4')}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {reviews.length} reviews
                                                    </p>
                                                </div>
                                                <div className="ml-4">
                                                    <p className={`text-sm font-medium px-3 py-1 rounded-full border ${getRatingColor(averageRating)}`}>
                                                        {getRatingBadge(averageRating)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-4 max-h-96 overflow-y-auto">
                            {loadingReviews ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                        <p className="text-gray-600">Loading reviews...</p>
                                    </div>
                                </div>
                            ) : reviewsError ? (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Something went wrong</h3>
                                    <p className="text-gray-600 mb-4">{reviewsError}</p>
                                    <button
                                        onClick={() => fetchReviews(product.farmerId)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
                                    <p className="text-gray-600">
                                        This farmer hasn't received any reviews yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-500 p-2 rounded-xl">
                                                        <User className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-800">{review.buyerName}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {renderStars(review.rating, 'w-3 h-3')}
                                                            <span className="text-sm text-gray-600">{review.rating}/5</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(review.date || review.createdAt)}
                                                </div>
                                            </div>

                                            {review.productName && (
                                                <div className="mb-3">
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
                                                        {review.productName}
                                                    </span>
                                                </div>
                                            )}

                                            <p className="text-gray-700 text-sm leading-relaxed italic border-l-4 border-blue-200 pl-3 bg-blue-50 py-2 rounded-r-lg">
                                                "{review.comment || review.reviewText}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default FarmerInformation;