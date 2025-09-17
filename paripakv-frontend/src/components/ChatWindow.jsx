import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ChatService from '../services/ChatService';
import WebSocketService from '../services/WebSocketService';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';
import { reloadResources } from 'i18next';

const ChatWindow = () => {
    const { otherUserId, productId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [typing, setTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const { otherUserName, productName, productImage } = location.state || {};
    const { currentUser, userId } = useAuth();

    // Debounced scroll to bottom
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }
    }, []);
    // Enhanced WebSocket connection with retry logic
    const connectWebSocket = useCallback(async () => {
        const token = Cookies.get('token');
        if (!token) {
            console.error('No auth token found');
            setConnectionStatus('disconnected');
            return;
        }

        try {
            setConnectionStatus('connecting');
            await WebSocketService.connect(token);
            setConnectionStatus('connected');
            setIsOnline(true);
            setRetryCount(0);

            WebSocketService.onMessageReceived((message) => {
                console.log('Received WebSocket message:', message);

                if (message.productId === productId &&
                    ((message.senderId === otherUserId && message.receiverId === userId) ||
                        (message.senderId === userId && message.receiverId === otherUserId))) {

                    setMessages(prev => {
                        const messageExists = prev.some(msg =>
                            msg.id === message.id ||
                            (msg.content === message.content &&
                                msg.senderId === message.senderId &&
                                Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 1000)
                        );

                        if (!messageExists) {
                            const newMessages = [...prev, message].sort((a, b) =>
                                new Date(a.timestamp) - new Date(b.timestamp)
                            );
                            return newMessages;
                        }
                        return prev;
                    });
                }
            });

            WebSocketService.onDisconnect(() => {
                setConnectionStatus('disconnected');
                setIsOnline(false);
                // Auto-reconnect with exponential backoff
                if (retryCount < 5) {
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        connectWebSocket();
                    }, delay);
                }
            });

        } catch (error) {
            console.error('WebSocket connection failed:', error);
            setConnectionStatus('disconnected');
            setIsOnline(false);

            // Retry connection
            if (retryCount < 5) {
                const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
                reconnectTimeoutRef.current = setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    connectWebSocket();
                }, delay);
            }
        }
    }, [otherUserId, productId, userId, retryCount]);

    useEffect(() => {
        if (otherUserId && productId && userId) {
            loadMessages();
            connectWebSocket();
        } else {
            setError('Missing required parameters');
            setLoading(false);
        }

        return () => {
            WebSocketService.disconnect();
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [otherUserId, productId, userId, connectWebSocket]);

    useEffect(() => {
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages, scrollToBottom]);

    // Auto-resize textarea with improved logic
    useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            const newHeight = Math.min(Math.max(textarea.scrollHeight, 44), 120);
            textarea.style.height = `${newHeight}px`;
        }
    }, [newMessage]);

    // Enhanced typing indicator
    const handleTyping = useCallback(() => {
        if (!typing) {
            setTyping(true);
            // Send typing indicator via WebSocket if connected
            if (connectionStatus === 'connected') {
                try {
                    WebSocketService.sendTypingIndicator(userId, otherUserId, productId, true);
                } catch (error) {
                    console.warn('Failed to send typing indicator:', error);
                }
            }
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
            if (connectionStatus === 'connected') {
                try {
                    WebSocketService.sendTypingIndicator(userId, otherUserId, productId, false);
                } catch (error) {
                    console.warn('Failed to stop typing indicator:', error);
                }
            }
        }, 1500);
    }, [typing, connectionStatus, userId, otherUserId, productId]);

    const loadMessages = async () => {
        try {
            setError(null);
            console.log('Loading messages for:', { otherUserId, productId, userId });

            const messageData = await ChatService.getMessages(otherUserId, productId);
            console.log('Loaded messages:', messageData);

            // Sort messages by timestamp to ensure proper order
            const sortedMessages = (messageData || []).sort((a, b) =>
                new Date(a.timestamp) - new Date(b.timestamp)
            );

            setMessages(sortedMessages);
            await ChatService.markAsRead(otherUserId, productId);
        } catch (error) {
            console.error('Error loading messages:', error);
            setError('Failed to load messages. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        const messageContent = newMessage.trim();
        const tempId = 'temp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const tempMessage = {
            id: tempId,
            content: messageContent,
            senderId: userId,
            receiverId: otherUserId,
            productId: productId,
            timestamp: new Date().toISOString(),
            isRead: false,
            senderName: currentUser?.name || 'You',
            status: 'sending'
        };

        try {
            setSending(true);
            setNewMessage('');
            setTyping(false);

            // Clear typing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Add temp message immediately for better UX
            setMessages(prev => [...prev, tempMessage]);

            console.log("Sending message from user:", userId, "to:", otherUserId);

            const sentMessage = await ChatService.sendMessage(
                userId,
                otherUserId,
                productId,
                messageContent
            );

            console.log('Message sent successfully:', sentMessage);

            // Update temp message with real message data
            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? { ...sentMessage, status: 'sent' } : msg
            ));

            // Send via WebSocket if connected
            if (connectionStatus === 'connected') {
                try {
                    WebSocketService.sendMessage(userId, otherUserId, productId, messageContent);
                } catch (wsError) {
                    console.warn('WebSocket send failed, but message was sent via REST:', wsError);
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);

            // Mark message as failed
            setMessages(prev => prev.map(msg =>
                msg.id === tempId ? { ...msg, status: 'failed' } : msg
            ));

            // Restore message content for retry
            setNewMessage(messageContent);
            setError('Failed to send message. Please try again.');

            // Auto-clear error after 5 seconds
            setTimeout(() => setError(null), 5000);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        } else {
            handleTyping();
        }
    };

    const formatMessageTime = (timestamp) => {
        try {
            if (!timestamp) return '';

            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';

            const now = new Date();
            const diffTime = now - date;
            const diffHours = diffTime / (1000 * 60 * 60);
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffHours < 1) {
                return 'now';
            } else if (diffHours < 24) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (diffDays < 7) {
                return date.toLocaleDateString([], { weekday: 'short' }) + ' ' +
                    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
                    ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    const retry = () => {
        setLoading(true);
        setError(null);
        setRetryCount(0);
        loadMessages();
        connectWebSocket();
    };

    const retryFailedMessage = (messageId) => {
        const failedMessage = messages.find(msg => msg.id === messageId);
        if (failedMessage) {
            setNewMessage(failedMessage.content);
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-300 border-t-green-600 mx-auto"></div>
                        <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-green-200 opacity-30 mx-auto"></div>
                    </div>
                    <div className="text-xl font-semibold text-green-800 mb-2">Loading conversation...</div>
                    <div className="text-sm text-green-600">Connecting to chat service</div>
                </div>
            </div>
        );
    }

    // Error State
    if (error && !messages.length) {
        return (
            <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-red-50 to-rose-50">
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-100 max-w-md">
                        <div className="text-red-500 text-6xl mb-6 animate-bounce">🚫</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-3">Connection Failed</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                            <button
                                onClick={retry}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/messages')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105"
                            >
                                Back to Messages
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Enhanced Header */}
            <div className="bg-white/95 backdrop-blur-xl border-b border-green-200/60 px-6 py-5 flex items-center space-x-4 flex-shrink-0 shadow-sm">
                <button
                    className="text-gray-400 hover:text-green-600 font-medium flex items-center space-x-2 transition-all duration-300 hover:scale-105 group p-2 rounded-xl hover:bg-green-50"
                    onClick={() => navigate('/messages')}
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform duration-300">←</span>
                    <span className="hidden sm:block text-sm">Back</span>
                </button>

                <div className="flex items-center space-x-4 flex-1">
                    <div className="relative">
                        <img
                            src={productImage || '/api/placeholder/56/56'}
                            alt={productName || 'Product'}
                            className="w-14 h-14 rounded-2xl object-cover border-3 border-green-200 shadow-lg ring-2 ring-green-100"
                            onError={(e) => {
                                e.target.src = '/api/placeholder/56/56';
                            }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-lg transition-colors duration-300 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'
                            }`}></div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-800 truncate text-lg">
                            {otherUserName || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-green-600 truncate font-medium">
                            {productName || 'Unknown Product'}
                        </p>
                        {typing && (
                            <div className="flex items-center space-x-1 mt-1">
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-xs text-emerald-600 ml-2">typing...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Enhanced Connection Status */}
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 ${connectionStatus === 'connected'
                    ? 'bg-emerald-100 text-emerald-700'
                    : connectionStatus === 'connecting'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'connected'
                        ? 'bg-emerald-500 animate-pulse'
                        : connectionStatus === 'connecting'
                            ? 'bg-amber-500 animate-bounce'
                            : 'bg-gray-400'
                        }`}></div>
                    <span className="text-xs font-semibold">
                        {connectionStatus === 'connected' ? 'Live' :
                            connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 mx-6 mt-4 rounded-xl animate-slide-down">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{error}</span>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-500 hover:text-red-700 font-bold text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-7xl mb-6 animate-bounce">💬</div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-3">Start the conversation</h3>
                            <p className="text-gray-500 text-lg">Send your first message about {productName || 'this product'}</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={message.id || `msg-${index}`}
                            className={`flex items-end space-x-3 animate-fade-in-up ${message.senderId === userId ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {message.senderId !== userId && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-green-100">
                                    {(otherUserName || 'U')[0].toUpperCase()}
                                </div>
                            )}

                            <div className="max-w-sm lg:max-w-md group">
                                <div
                                    className={`px-5 py-4 rounded-3xl break-words shadow-lg transition-all duration-300 hover:shadow-xl relative ${message.senderId === userId
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-lg'
                                        : 'bg-white text-gray-800 border border-green-100 rounded-bl-lg'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className={`text-xs font-medium ${message.senderId === userId
                                            ? 'text-green-100'
                                            : 'text-gray-500'
                                            }`}>
                                            {formatMessageTime(message.timestamp)}
                                        </span>
                                        {message.senderId === userId && (
                                            <span className="text-xs ml-3 flex items-center">
                                                {message.status === 'sending' ? (
                                                    <div className="animate-spin w-3 h-3 border border-green-200 border-t-white rounded-full"></div>
                                                ) : message.status === 'failed' ? (
                                                    <button
                                                        onClick={() => retryFailedMessage(message.id)}
                                                        className="text-red-200 hover:text-white transition-colors duration-200"
                                                        title="Click to retry"
                                                    >
                                                        ↻
                                                    </button>
                                                ) : (
                                                    <span className="text-green-200">✓</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {message.senderId === userId && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-lg ring-2 ring-blue-100">
                                    {(currentUser?.name || 'Y')[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Enhanced Input Section */}
            <div className="bg-white/95 backdrop-blur-xl border-t border-green-200/60 p-6 flex-shrink-0 shadow-lg">
                <div className="flex space-x-4 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="w-full border-2 border-green-200 rounded-3xl px-6 py-4 focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 resize-none transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-sm text-gray-800 placeholder-gray-400 font-medium"
                            rows="1"
                            disabled={sending}
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className={`p-4 rounded-3xl font-medium transition-all duration-300 transform shadow-lg flex-shrink-0 ${newMessage.trim() && !sending
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 shadow-green-200 active:scale-95'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {sending ? (
                            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                @keyframes slide-down {
                    from { 
                        opacity: 0; 
                        transform: translateY(-20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out;
                }
                .animate-slide-down {
                    animation: slide-down 0.3s ease-out;
                }
                .border-3 {
                    border-width: 3px;
                }
            `}</style>
        </div>
    );
};

export default ChatWindow;