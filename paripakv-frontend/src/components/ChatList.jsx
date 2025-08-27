import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatService from '../services/ChatService';
import { useAuth } from '../context/AuthContext';

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const navigate = useNavigate();
    const { userId, currentUser, userRole } = useAuth();

    useEffect(() => {
        if (userId) {
            loadChats();
        }
    }, [userId]);

    const loadChats = async () => {
        try {
            setError(null);
            const chatData = await ChatService.getUserChats();
            console.log('Loaded chats:', chatData);
            setChats(chatData || []);
        } catch (error) {
            console.error('Error loading chats:', error);
            setError('Failed to load chats. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openChat = (chat) => {
        try {
            const otherUserId = userRole === 'FARMER' ? chat.buyerId : chat.farmerId;
            const otherUserName = userRole === 'FARMER' ? chat.buyerName : chat.farmerName;

            console.log("Current user role:", userRole);
            console.log("Other user ID:", otherUserId);
            console.log("Chat Data:", chat);

            if (!otherUserId || !chat.productId) {
                console.error('Missing required chat data:', { otherUserId, productId: chat.productId });
                alert('Unable to open chat. Missing required information.');
                return;
            }

            navigate(`/chat/${otherUserId}/${chat.productId}`, {
                state: {
                    otherUserName: otherUserName || 'Unknown User',
                    productName: chat.productName || 'Unknown Product',
                    productImage: chat.productImage
                }
            });
        } catch (error) {
            console.error('Error opening chat:', error);
            alert('Failed to open chat. Please try again.');
        }
    };

    const formatTime = (timestamp) => {
        try {
            if (!timestamp) return '';

            const date = new Date(timestamp);
            const now = new Date();
            const diffTime = now - date;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));

            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    const filteredChats = chats.filter(chat => {
        const otherUserName = userRole === 'FARMER' ? chat.buyerName : chat.farmerName;
        const matchesSearch = !searchQuery ||
            (otherUserName && otherUserName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (chat.productName && chat.productName.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter = activeFilter === 'all' ||
            (activeFilter === 'unread' && chat.unreadCount > 0) ||
            (activeFilter === 'recent' && new Date(chat.lastMessageAt) > new Date(Date.now() - 24 * 60 * 60 * 1000));

        return matchesSearch && matchesFilter;
    });

    const handleRetry = () => {
        setLoading(true);
        loadChats();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-green-50 to-emerald-100 flex justify-center items-center">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 mx-auto"></div>
                        <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-green-500 opacity-20 mx-auto"></div>
                    </div>
                    <div className="text-xl font-semibold text-amber-800 animate-pulse">Loading conversations...</div>
                    <div className="text-sm text-green-600 mt-2">Connecting you with farmers</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-70 via-amber-50 to-orange-50 flex justify-center items-center p-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center max-w-md w-full border border-red-200">
                    <div className="text-red-600 text-6xl mb-6 animate-bounce">⚠️</div>
                    <h3 className="text-2xl font-bold text-amber-900 mb-3">Connection Issue</h3>
                    <p className="text-amber-700 mb-6 leading-relaxed">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-yellow-300 to-yellow-400">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-amber-900">
                                Messages
                            </h1>
                            <p className="text-green-800 mt-2 font-medium">
                                {chats.length} conversation{chats.length !== 1 ? 's' : ''} • Connect with your agricultural community
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 backdrop-blur-sm rounded-2xl px-6 py-3 border border-green-200 shadow-lg">
                            <span className="text-3xl">🌾</span>
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-green-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search farmers, buyers, or products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-green-50 border-2 border-green-200 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-amber-900 placeholder-green-600"
                                />
                            </div>

                            {/* Filter Buttons */}
                            <div className="flex space-x-2">
                                {[
                                    { key: 'all', label: 'All', icon: '🌱' },
                                    { key: 'unread', label: 'New', icon: '🔔' },
                                    { key: 'recent', label: 'Recent', icon: '⏰' }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setActiveFilter(filter.key)}
                                        className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 ${activeFilter === filter.key
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-300'
                                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                            }`}
                                    >
                                        <span className="mr-2">{filter.icon}</span>
                                        <span className="hidden sm:inline">{filter.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat List */}
                <div className="bg-gradient-to-br from-green-400 to-yellow-200 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-200 overflow-hidden">
                    {filteredChats.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            {searchQuery || activeFilter !== 'all' ? (
                                <>
                                    <div className="text-6xl mb-6">🔍</div>
                                    <h3 className="text-2xl font-bold text-amber-800 mb-3">No matches found</h3>
                                    <p className="text-green-600 mb-6">Try adjusting your search or filters</p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setActiveFilter('all');
                                        }}
                                        className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
                                    >
                                        Clear Filters
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-8xl mb-6 animate-bounce">🌾</div>
                                    <h3 className="text-3xl font-bold text-amber-800 mb-4">No conversations yet</h3>
                                    <p className="text-green-700 text-lg mb-2">Start connecting with the farming community!</p>
                                    <p className="text-green-600 text-sm">
                                        Browse products to start chatting with {userRole === 'FARMER' ? 'buyers' : 'farmers'}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-green-100">
                            {filteredChats.map((chat, index) => {
                                const otherUserName = userRole === 'FARMER' ? chat.buyerName : chat.farmerName;
                                const isUnread = chat.unreadCount > 0;

                                return (
                                    <div
                                        key={`${chat.productId}-${chat.farmerId}-${chat.buyerId}`}
                                        className="group relative p-6 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer transition-all duration-300 transform hover:scale-[1.01] hover:shadow-lg"
                                        onClick={() => openChat(chat)}
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="flex items-center space-x-4">
                                            {/* Avatar Section */}
                                            <div className="relative flex-shrink-0">
                                                <div className="relative">
                                                    <img
                                                        src={chat.productImage || '/default-product.png'}
                                                        alt={chat.productName || 'Product'}
                                                        className={`w-16 h-16 rounded-2xl object-cover border-3 shadow-lg transition-all duration-300 ${isUnread
                                                            ? 'border-orange-400 ring-4 ring-orange-100'
                                                            : 'border-green-200 group-hover:border-green-400'
                                                            }`}
                                                        onError={(e) => {
                                                            e.target.src = '/default-product.png';
                                                        }}
                                                    />
                                                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                                                        {(otherUserName || 'U')[0].toUpperCase()}
                                                    </div>
                                                </div>

                                                {/* Online Status */}
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                                            </div>

                                            {/* Chat Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className={`text-lg font-bold truncate transition-colors duration-200 ${isUnread ? 'text-amber-900' : 'text-green-800 group-hover:text-amber-900'
                                                        }`}>
                                                        {otherUserName || 'Unknown User'}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                                                            {formatTime(chat.lastMessageAt)}
                                                        </span>
                                                        <div className="w-6 h-6 rounded-full bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                                                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-200">
                                                            🌾 {chat.productName || 'Unknown Product'}
                                                        </span>
                                                    </div>

                                                    {chat.lastMessage && (
                                                        <p className={`text-sm truncate leading-relaxed ${isUnread ? 'text-amber-800 font-medium' : 'text-green-700'
                                                            }`}>
                                                            {chat.lastMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status and Badges */}
                                            <div className="flex flex-col items-end space-y-2">
                                                {isUnread && (
                                                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full px-3 py-1 font-bold shadow-lg animate-pulse min-w-[24px] text-center">
                                                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-xs text-green-600 font-medium">Online</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/0 to-emerald-50/0 group-hover:via-green-50/60 group-hover:to-emerald-50/60 rounded-2xl transition-all duration-500 pointer-events-none opacity-0 group-hover:opacity-100"></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Statistics Footer */}
                {chats.length > 0 && (
                    <div className="mt-8 bg-gradient-to-br from-green-500 to-yellow-500 backdrop-blur-sm rounded-2xl p-6 border border-green-200 shadow-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                                <div className="text-2xl font-bold text-amber-800 group-hover:text-green-700 transition-colors duration-200">
                                    {chats.length}
                                </div>
                                <div className="text-sm text-green-700 font-medium">Total Chats</div>
                            </div>
                            <div className="group bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
                                <div className="text-2xl font-bold text-amber-800 group-hover:text-orange-600 transition-colors duration-200">
                                    {chats.filter(chat => chat.unreadCount > 0).length}
                                </div>
                                <div className="text-sm text-orange-700 font-medium">New Messages</div>
                            </div>
                            <div className="group bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                                <div className="text-2xl font-bold text-amber-800 group-hover:text-emerald-600 transition-colors duration-200">
                                    {chats.filter(chat => new Date(chat.lastMessageAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
                                </div>
                                <div className="text-sm text-emerald-700 font-medium">Recent Activity</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .group {
                    animation: slideInUp 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ChatList;