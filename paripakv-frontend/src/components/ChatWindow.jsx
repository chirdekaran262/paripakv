import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ChatService from '../services/ChatService';
import WebSocketService from '../services/WebSocketService';
import Cookies from 'js-cookie';
import { useAuth } from '../context/AuthContext';

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
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { otherUserName, productName, productImage } = location.state || {};
    const { currentUser, userId } = useAuth();

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
        };
    }, [otherUserId, productId, userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea with smooth animation
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [newMessage]);

    // Handle typing indicator
    const handleTyping = () => {
        if (!typing) {
            setTyping(true);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
        }, 1000);
    };

    const connectWebSocket = async () => {
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

            WebSocketService.onMessageReceived((message) => {
                console.log('Received WebSocket message:', message);

                if (message.productId === productId &&
                    ((message.senderId === otherUserId && message.receiverId === userId) ||
                        (message.senderId === userId && message.receiverId === otherUserId))) {

                    setMessages(prev => {
                        const messageExists = prev.some(msg =>
                            msg.id === message.id ||
                            (msg.content === message.content &&
                                Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 1000)
                        );

                        if (!messageExists) {
                            return [...prev, message];
                        }
                        return prev;
                    });
                }
            });
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            setConnectionStatus('disconnected');
            setIsOnline(false);
        }
    };

    const loadMessages = async () => {
        try {
            setError(null);
            console.log('Loading messages for:', { otherUserId, productId, userId });

            const messageData = await ChatService.getMessages(otherUserId, productId);
            console.log('Loaded messages:', messageData);

            setMessages(messageData || []);
            await ChatService.markAsRead(otherUserId, productId);
        } catch (error) {
            console.error('Error loading messages:', error);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        const messageContent = newMessage.trim();
        const tempMessage = {
            id: 'temp-' + Date.now(),
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

            setMessages(prev => [...prev, tempMessage]);

            console.log("Sending message from user:", userId, "to:", otherUserId);

            const sentMessage = await ChatService.sendMessage(
                userId,
                otherUserId,
                productId,
                messageContent
            );

            console.log('Message sent successfully:', sentMessage);

            setMessages(prev => prev.map(msg =>
                msg.id === tempMessage.id ? { ...sentMessage, status: 'sent' } : msg
            ));

            if (connectionStatus === 'connected') {
                try {
                    WebSocketService.sendMessage(userId, otherUserId, productId, messageContent);
                } catch (wsError) {
                    console.warn('WebSocket send failed, but message was sent via REST:', wsError);
                }
            }

        } catch (error) {
            console.error('Error sending message:', error);

            setMessages(prev => prev.map(msg =>
                msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
            ));
            setNewMessage(messageContent);

            alert('Failed to send message. Please check your connection and try again.');
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatMessageTime = (timestamp) => {
        try {
            if (!timestamp) return '';

            const date = new Date(timestamp);
            const now = new Date();
            const diffTime = now - date;
            const diffHours = diffTime / (1000 * 60 * 60);

            if (diffHours < 24) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        loadMessages();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 mx-auto mb-6"></div>
                        <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-4 border-blue-400 opacity-20 mx-auto"></div>
                    </div>
                    <div className="text-lg font-medium text-slate-600 animate-pulse">Loading conversation...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-red-50 to-pink-50">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-100">
                        <div className="text-red-500 text-6xl mb-4 animate-bounce">⚠️</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h3>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <div className="flex space-x-4 justify-center">
                            <button
                                onClick={retry}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/messages')}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
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
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-green-500">
            {/* Modern Header with Glassmorphism */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-green-200/60 px-6 py-4 flex items-center space-x-4 flex-shrink-0 shadow-sm">
                <button
                    className="text-slate-400 hover:text-blue-600 font-medium flex items-center space-x-2 transition-all duration-200 hover:scale-105 group"
                    onClick={() => navigate('/messages')}
                >
                    <span className="text-xl group-hover:-translate-x-1 transition-transform duration-200">←</span>
                    <span className="hidden sm:block">Back</span>
                </button>

                <div className="flex items-center space-x-4 flex-1">
                    <div className="relative">
                        <img
                            src={productImage || '/default-product.png'}
                            alt={productName || 'Product'}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200/50 shadow-lg"
                            onError={(e) => {
                                e.target.src = '/default-product.png';
                            }}
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'
                            }`}></div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-800 truncate text-lg">
                            {otherUserName || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-blue-600 truncate font-medium">
                            {productName || 'Unknown Product'}
                        </p>
                        {typing && (
                            <p className="text-xs text-emerald-500 animate-pulse">
                                typing...
                            </p>
                        )}
                    </div>
                </div>

                {/* Enhanced Connection Status */}
                <div className="flex items-center space-x-2 bg-white/60 rounded-full px-3 py-2 backdrop-blur-sm">
                    <div className={`w-2 h-2 rounded-full shadow-sm ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
                        connectionStatus === 'connecting' ? 'bg-amber-400 animate-bounce' : 'bg-slate-400'
                        }`}></div>
                    <span className="text-xs text-slate-600 font-medium">
                        {connectionStatus === 'connected' ? 'Live' :
                            connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Enhanced Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4 animate-bounce">💬</div>
                            <h3 className="text-xl font-semibold text-slate-600 mb-2">Start the conversation</h3>
                            <p className="text-slate-400">Send your first message to begin chatting</p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={message.id || index}
                            className={`flex items-end space-x-2 animate-fade-in ${message.senderId === userId ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {message.senderId !== userId && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                    {(otherUserName || 'U')[0].toUpperCase()}
                                </div>
                            )}

                            <div className="max-w-xs lg:max-w-md group">
                                <div
                                    className={`px-4 py-3 rounded-2xl break-words shadow-lg transition-all duration-200 hover:shadow-xl ${message.senderId === userId
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                        : 'bg-white text-blue-600 border border-blue-`200/60 rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className={`text-xs ${message.senderId === userId
                                            ? 'text-blue-100'
                                            : 'text-blue-500'
                                            }`}>
                                            {formatMessageTime(message.timestamp)}
                                        </span>
                                        {message.senderId === userId && (
                                            <span className="text-xs text-blue-100 ml-2">
                                                {message.status === 'sending' ? (
                                                    <span className="animate-pulse">●</span>
                                                ) : message.status === 'failed' ? (
                                                    <span className="text-red-200">✗</span>
                                                ) : (
                                                    <span>✓</span>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {message.senderId === userId && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                    {(currentUser?.name || 'Y')[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Modern Input Section */}
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/60 p-4 flex-shrink-0 shadow-lg">
                <div className="flex space-x-3 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm text-slate-800 placeholder-slate-400"
                            rows="1"
                            disabled={sending}
                            style={{ maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className={`p-3 rounded-2xl font-medium transition-all duration-200 transform shadow-lg flex-shrink-0 ${newMessage.trim() && !sending
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-blue-200'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {sending ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default ChatWindow;