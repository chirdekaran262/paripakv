// pages/chatPage.jsx - Updated for your routing structure
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeStompClient } from "../chat/wsClient";
import { MessageCircle, ArrowLeft, Send, User, Package, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
export default function ChatPage() {
    const { buyerId, farmerId, productId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [farmerInfo, setFarmerInfo] = useState(null);
    const [productInfo, setProductInfo] = useState(null);
    const [error, setError] = useState(null);
    const stompRef = useRef(null);
    const messagesEndRef = useRef(null);
    const token = Cookies.get('token');
    const apiBase = useMemo(
        () => import.meta.env.VITE_BACKEND_HTTP_URL || "http://localhost:8089",
        []
    );

    // Check authentication and authorization
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (user?.role !== "BUYER" && user?.id !== buyerId) {
            toast.error("Unauthorized access");
            navigate("/");
            return;
        }
    }, [isAuthenticated, user, buyerId, navigate]);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load initial data
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const loadInitialData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Load conversation history

                const historyResponse = await axios.get(`${apiBase}/api/chat/history?productId=${productId}&buyerId=${buyerId}&farmerId=${farmerId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setMessages(historyData);
                } else {
                    console.error('Failed to load chat history');
                    toast.error('Failed to load chat history');
                }

                // Load farmer information
                try {
                    const farmerResponse = await axios.get(
                        `${apiBase}/api/users/${farmerId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (farmerResponse.status === 200) {
                        const farmerData = farmerResponse.data;
                        setFarmerInfo(farmerData);
                    }
                } catch (err) {
                    console.error('Error loading farmer info:', err);
                }

                // Load product information
                try {
                    const productResponse = await axios.get(
                        `${apiBase}/api/products/${productId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (productResponse.status === 200) {
                        const productData = productResponse.data;
                        setProductInfo(productData);
                    }
                } catch (err) {
                    console.error('Error loading product info:', err);
                }

            } catch (error) {
                console.error('Error loading chat data:', error);
                setError('Failed to load chat data');
                toast.error('Failed to load chat data');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [apiBase, productId, buyerId, farmerId, isAuthenticated, user]);

    // WebSocket connection
    useEffect(() => {
        if (!user?.id || !isAuthenticated) return;

        const client = makeStompClient();

        client.onConnect = () => {
            setConnectionStatus('Connected');

            // Subscribe to user's personal topic
            client.subscribe(`/topic/user.${user.id}`, (frame) => {
                try {
                    const message = JSON.parse(frame.body);

                    // Check if message belongs to this conversation
                    const belongsToConversation =
                        message.productId === productId &&
                        ((message.senderId === buyerId && message.receiverId === farmerId) ||
                            (message.senderId === farmerId && message.receiverId === buyerId));

                    if (belongsToConversation) {
                        setMessages((prev) => {
                            // Prevent duplicate messages
                            const messageExists = prev.some(m =>
                                m.id === message.id ||
                                (m.content === message.content &&
                                    m.senderId === message.senderId &&
                                    Math.abs(new Date(m.createdAt) - new Date(message.createdAt)) < 1000)
                            );

                            if (!messageExists) {
                                return [...prev, message];
                            }
                            return prev;
                        });
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });
        };

        client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            setConnectionStatus('Connection Error');
            toast.error('Connection error occurred');
        };

        client.onDisconnect = () => {
            setConnectionStatus('Disconnected');
        };

        client.activate();
        stompRef.current = client;

        return () => {
            if (client.active) {
                client.deactivate();
            }
        };
    }, [user?.id, buyerId, farmerId, productId, isAuthenticated]);

    // Send message
    const send = () => {
        const content = text.trim();
        if (!content || !stompRef.current?.connected || !user) return;

        const message = {
            productId,
            senderId: user.id,
            receiverId: farmerId,
            content,
        };

        try {
            stompRef.current.publish({
                destination: "/app/chat.send",
                body: JSON.stringify(message),
            });

            // Optimistically add message to UI
            const optimisticMessage = {
                ...message,
                id: `temp-${Date.now()}`,
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, optimisticMessage]);
            setText("");
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    if (!isAuthenticated || loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Chat</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                    </div>

                    <div>
                        <h2 className="font-semibold text-lg">
                            {farmerInfo?.name || `Farmer #${farmerId}`}
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-500">
                                {productInfo?.name || `Product #${productId}`}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                {connectionStatus}
                            </span>
                        </div>
                    </div>
                </div>

                <MessageCircle className="w-6 h-6 text-green-600" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">No messages yet</p>
                        <p className="text-sm mt-1">Start the conversation with {farmerInfo?.name || 'the farmer'}!</p>

                        {/* Quick message templates for first message */}
                        <div className="mt-6 space-y-2 max-w-md mx-auto">
                            <p className="text-sm font-medium text-gray-700">Quick message templates:</p>
                            {[
                                `Hi! I'm interested in your ${productInfo?.name || 'product'}. Is it still available?`,
                                "What's the minimum order quantity?",
                                "Can you provide more details about quality and freshness?",
                                "Are you willing to negotiate on bulk orders?"
                            ].map((template, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setText(template)}
                                    className="block w-full text-left p-2 text-xs bg-green-50 hover:bg-green-100 rounded border text-green-800"
                                >
                                    {template}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isMine = message.senderId === user.id;
                        const showTime = index === 0 ||
                            new Date(message.createdAt) - new Date(messages[index - 1]?.createdAt) > 60000;

                        return (
                            <div key={message.id || index}>
                                {showTime && (
                                    <div className="text-center text-xs text-gray-400 my-4">
                                        {new Date(message.createdAt).toLocaleString()}
                                    </div>
                                )}

                                <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                    <div className={`flex items-end gap-2 max-w-[75%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                                        {!isMine && (
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-gray-600" />
                                            </div>
                                        )}

                                        <div
                                            className={`px-4 py-3 rounded-2xl ${isMine
                                                ? "bg-green-600 text-white rounded-br-md"
                                                : "bg-white border shadow-sm rounded-bl-md"
                                                }`}
                                        >
                                            <p className="break-words">{message.content}</p>
                                            <div className={`text-xs mt-1 ${isMine ? "text-green-100" : "text-gray-400"}`}>
                                                {new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full border rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                            placeholder={`Message ${farmerInfo?.name || 'farmer'}...`}
                            rows="1"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                            }}
                        />
                    </div>

                    <button
                        onClick={send}
                        disabled={!text.trim() || !stompRef.current?.connected}
                        className="px-4 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                    </button>
                </div>

                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' :
                            connectionStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                        <span>{connectionStatus}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}