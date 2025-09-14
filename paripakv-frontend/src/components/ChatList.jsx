import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatService from '../services/ChatService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);
    const navigate = useNavigate();
    const { userId, currentUser, userRole } = useAuth();

    // Memoized filtered chats for better performance
    const filteredChats = useMemo(() => {
        if (!chats.length) return [];

        return chats.filter(chat => {
            // Ensure chat has required data
            if (!chat || !chat.productId) return false;

            const otherUserName = userRole === 'FARMER' ? chat.buyerName : chat.farmerName;

            // Search filter
            const matchesSearch = !searchQuery.trim() ||
                (otherUserName && otherUserName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (chat.productName && chat.productName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

            // Status filter
            let matchesFilter = true;
            if (activeFilter === 'unread') {
                matchesFilter = chat.unreadCount > 0;
            } else if (activeFilter === 'recent') {
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                matchesFilter = chat.lastMessageAt && new Date(chat.lastMessageAt) > oneDayAgo;
            }

            return matchesSearch && matchesFilter;
        }).sort((a, b) => {
            // Sort by last message time, most recent first
            const aTime = new Date(a.lastMessageAt || 0);
            const bTime = new Date(b.lastMessageAt || 0);
            return bTime - aTime;
        });
    }, [chats, searchQuery, activeFilter, userRole]);

    // Statistics calculation
    const stats = useMemo(() => {
        const total = chats.length;
        const unread = chats.filter(chat => chat.unreadCount > 0).length;
        const recent = chats.filter(chat => {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return chat.lastMessageAt && new Date(chat.lastMessageAt) > oneDayAgo;
        }).length;

        return { total, unread, recent };
    }, [chats]);

    const loadChats = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) setRefreshing(true);
            setError(null);

            const chatData = await ChatService.getUserChats();
            console.log('Loaded chats:', chatData);

            // Validate and filter chat data
            const validChats = (chatData || []).filter(chat =>
                chat && chat.productId && (chat.farmerId || chat.buyerId)
            );

            setChats(validChats);
        } catch (error) {
            console.error('Error loading chats:', error);
            setError('Failed to load conversations. Please check your connection.');
        } finally {
            setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            loadChats();
        } else {
            setError('Please log in to view your conversations');
            setLoading(false);
        }
    }, [userId, loadChats]);

    const openChat = useCallback((chat) => {
        try {
            if (!chat || !chat.productId) {
                console.error('Invalid chat data:', chat);
                setError('Unable to open chat. Invalid conversation data.');
                return;
            }

            const otherUserId = userRole === 'FARMER' ? chat.buyerId : chat.farmerId;
            const otherUserName = userRole === 'FARMER' ? chat.buyerName : chat.farmerName;

            console.log("Opening chat:", {
                currentUserRole: userRole,
                otherUserId,
                productId: chat.productId
            });

            if (!otherUserId) {
                console.error('Missing other user ID:', { userRole, chat });
                setError('Unable to identify conversation partner.');
                return;
            }

            // Clear any existing errors
            setError(null);

            navigate(`/chat/${otherUserId}/${chat.productId}`, {
                state: {
                    otherUserName: otherUserName || 'Unknown User',
                    productName: chat.productName || 'Unknown Product',
                    productImage: chat.productImage || null
                }
            });
        } catch (error) {
            console.error('Error opening chat:', error);
            setError('Failed to open conversation. Please try again.');
        }
    }, [userRole, navigate]);

    const formatTime = useCallback((timestamp) => {
        try {
            if (!timestamp) return '';

            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';

            const now = new Date();
            const diffTime = now - date;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));

            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes}m`;
            if (diffHours < 24) return `${diffHours}h`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    }, []);

    const handleRetry = useCallback(() => {
        setLoading(true);
        setError(null);
        loadChats();
    }, [loadChats]);

    const handleRefresh = useCallback(() => {
        loadChats(true);
    }, [loadChats]);

    const clearFilters = useCallback(() => {
        setSearchQuery('');
        setActiveFilter('all');
    }, []);

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-green-300 border-t-green-600 mx-auto"></div>
                        <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-green-200 opacity-20 mx-auto"></div>
                    </div>
                    <div className="text-2xl font-bold text-green-800 mb-2">Loading Conversations</div>
                    <div className="text-sm text-green-600">Connecting you with the farming community...</div>
                </div>
            </div>
        );
    }

    // Error State
    if (error && !chats.length) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex justify-center items-center p-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center max-w-md w-full border border-red-200">
                    <div className="text-red-500 text-6xl mb-6">🚫</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">Connection Issue</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-300 to-green-500">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-green-800 mb-2">
                                Farm Conversations
                            </h1>
                            <p className="text-green-600 font-medium flex items-center space-x-2">
                                <span>{stats.total} conversation{stats.total !== 1 ? 's' : ''}</span>
                                <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                                <span>Connect with {userRole === 'FARMER' ? 'buyers' : 'farmers'}</span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Refresh conversations"
                            >
                                <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                            <div className="bg-gradient-to-br from-green-100 to-emerald-100 backdrop-blur-sm rounded-2xl p-4 border border-green-200 shadow-lg">
                                <span className="text-3xl">🌾</span>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-gradient-to-r from-yellow-500 to-green-500 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-green-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Bar */}
                            <Link className="pl-4 pr-4 py-4 bg-green-500 border-2 border-green-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-green-800 placeholder-green-500" to="/">GoTo Home</Link>
                            <div className="flex-1 relative">
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder={`Search ${userRole === 'FARMER' ? 'buyers' : 'farmers'}, products, or messages...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-green-50/80 border-2 border-green-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-green-800 placeholder-green-500"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex space-x-2">
                                {[
                                    { key: 'all', label: 'All', count: stats.total },
                                    { key: 'unread', label: 'New', count: stats.unread },
                                    { key: 'recent', label: 'Today', count: stats.recent }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setActiveFilter(filter.key)}
                                        className={`px-4 py-3 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${activeFilter === filter.key
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-300'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                    >
                                        <span>{filter.label}</span>
                                        {filter.count > 0 && (
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${activeFilter === filter.key
                                                ? 'bg-white/20 text-white'
                                                : 'bg-green-200 text-green-800'
                                                }`}>
                                                {filter.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center justify-between animate-slide-down">
                        <span className="font-medium">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-500 hover:text-red-700 font-bold text-xl leading-none"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* Chat List */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-200 overflow-hidden">
                    {filteredChats.length === 0 ? (
                        <div className="text-center py-20 px-6">
                            {searchQuery.trim() || activeFilter !== 'all' ? (
                                <div className="animate-fade-in">
                                    <div className="text-6xl mb-6">🔍</div>
                                    <h3 className="text-2xl font-bold text-green-800 mb-3">No matches found</h3>
                                    <p className="text-green-600 mb-8 max-w-md mx-auto leading-relaxed">
                                        No conversations match your current search or filter criteria.
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-fade-in">
                                    <div className="text-8xl mb-8">🌾</div>
                                    <h3 className="text-3xl font-bold text-green-800 mb-4">No conversations yet</h3>
                                    <p className="text-green-600 text-lg mb-2 max-w-lg mx-auto leading-relaxed">
                                        Start connecting with the agricultural community to buy and sell fresh produce!
                                    </p>
                                    <p className="text-green-500 text-sm">
                                        Browse products to start chatting with {userRole === 'FARMER' ? 'buyers interested in your crops' : 'farmers selling fresh produce'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-green-100 max-h-[70vh] overflow-y-auto">
                            {filteredChats.map((chat, index) => {
                                const otherUserName = userRole === 'FARMER' ? chat.buyerName : chat.farmerName;
                                const isUnread = chat.unreadCount > 0;

                                return (
                                    <div
                                        key={`${chat.productId}-${chat.farmerId}-${chat.buyerId}-${index}`}
                                        className="bg-gradient-to-r from-yellow-400 to-green-200 group relative p-6 hover:bg-gradient-to-r hover:from-green-50/60 hover:to-emerald-50/60 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] animate-slide-up"
                                        onClick={() => openChat(chat)}
                                        style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                                    >
                                        <div className=" flex items-center space-x-4">
                                            {/* Product Image & User Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={chat.productImage || '/api/placeholder/64/64'}
                                                    alt={chat.productName || 'Product'}
                                                    className={`w-16 h-16 rounded-2xl object-cover shadow-lg transition-all duration-300 border-2 ${isUnread
                                                        ? 'border-orange-400 ring-4 ring-orange-100 shadow-orange-200'
                                                        : 'border-green-200 group-hover:border-green-400 group-hover:shadow-green-200'
                                                        }`}
                                                    onError={(e) => {
                                                        e.target.src = '/api/placeholder/64/64';
                                                    }}
                                                />
                                                {/* User Initial Badge */}
                                                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg border-2 border-white">
                                                    {(otherUserName || 'U')[0].toUpperCase()}
                                                </div>
                                                {/* Online Status */}
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                                            </div>

                                            {/* Chat Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`text-lg font-bold truncate transition-colors duration-200 ${isUnread ? 'text-green-900' : 'text-green-800'
                                                        }`}>
                                                        {otherUserName || 'Unknown User'}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                                        <span className="text-xs text-green-600 font-medium">
                                                            {formatTime(chat.lastMessageAt)}
                                                        </span>
                                                        <div className="w-5 h-5 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                                                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {/* Product Badge */}
                                                    <div className="inline-flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold border border-green-200">
                                                        <span>🌾</span>
                                                        <span>{chat.productName || 'Unknown Product'}</span>
                                                    </div>

                                                    {/* Last Message */}
                                                    {chat.lastMessage && (
                                                        <p className={`text-sm truncate leading-relaxed ${isUnread ? 'text-green-800 font-medium' : 'text-green-600'
                                                            }`}>
                                                            {chat.lastMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status and Badges */}
                                            <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                                                {isUnread && (
                                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full px-2.5 py-1 font-bold shadow-lg min-w-[24px] text-center">
                                                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                                    <span className="text-xs text-green-600 font-medium">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Statistics Footer */}
                {chats.length > 0 && (
                    <div className="mt-8 bg-gradient-to-br from-green-100 to-emerald-100 backdrop-blur-sm rounded-3xl p-6 border border-green-200 shadow-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="text-center group">
                                <div className="bg-gradient-to-r from-green-400 to-yellow-300 text-white shadow-lg shadow-green-300 rounded-2xl p-6">
                                    <div className="text-3xl font-bold text-green-700 mb-1">
                                        {stats.total}
                                    </div>
                                    <div className="text-sm text-green-600 font-medium">Total Conversations</div>
                                </div>
                            </div>
                            <div className="text-center group">
                                <div className="bg-gradient-to-r from-green-400 to-yellow-300 rounded-2xl p-6 shadow-sm group-hover:shadow-md transition-shadow duration-200 border border-orange-100">
                                    <div className="text-3xl font-bold text-orange-600 mb-1">
                                        {stats.unread}
                                    </div>
                                    <div className="text-sm text-orange-600 font-medium">New Messages</div>
                                </div>
                            </div>
                            <div className="text-center group">
                                <div className="bg-gradient-to-r from-green-400 to-yellow-300 rounded-2xl p-6 shadow-sm group-hover:shadow-md transition-shadow duration-200 border border-emerald-100">
                                    <div className="text-3xl font-bold text-emerald-600 mb-1">
                                        {stats.recent}
                                    </div>
                                    <div className="text-sm text-emerald-600 font-medium">Today's Activity</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ChatList;