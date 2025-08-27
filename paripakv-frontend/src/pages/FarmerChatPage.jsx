// pages/FarmerChatPage.jsx - Updated for your routing structure
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeStompClient } from "../chat/wsClient";
import { MessageCircle, Send, User, Package, Search, Clock, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function FarmerChatPage() {
    const { farmerId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);
    const stompRef = useRef(null);
    const messagesEndRef = useRef(null);

    const apiBase = import.meta.env.VITE_BACKEND_HTTP_URL || "http://localhost:8089";

    // Check authentication and authorization
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (user?.role !== "FARMER" && user?.id !== farmerId) {
            toast.error("Unauthorized access");
            navigate("/");
            return;
        }
    }, [isAuthenticated, user, farmerId, navigate]);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load all conversations
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const loadConversations = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${apiBase}/api/chat/conversations?farmerId=${farmerId}`,
                    { credentials: "include" }
                );

                if (response.ok) {
                    const data = await response.json();
                    setConversations(data);

                    // Auto-select first conversation if exists
                    if (data.length > 0 && !selectedConv) {
                        setSelectedConv(data[0]);
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Failed to load conversations:', errorText);
                    toast.error('Failed to load conversations');
                }
            } catch (error) {
                console.error('Error loading conversations:', error);
                setError('Failed to load conversations');
                toast.error('Failed to load conversations');
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
    }, [farmerId, isAuthenticated, user]);

    // Load messages when a conversation is selected
    useEffect(() => {
        if (!selectedConv || !isAuthenticated) return;

        const loadMessages = async () => {
            setMessagesLoading(true);
            try {
                const response = await fetch(
                    `${apiBase}/api/chat/history?farmerId=${farmerId}&buyerId=${selectedConv.buyerId}&productId=${selectedConv.productId}`,
                    { credentials: "include" }
                );

                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                } else {
                    console.error('Failed to load messages');
                    setMessages([]);
                    toast.error('Failed to load messages');
                }
            } catch (error) {
                console.error('Error loading messages:', error);
                setMessages([]);
                toast.error('Error loading messages');
            } finally {
                setMessagesLoading(false);
            }
        };

        loadMessages();
    }, [selectedConv, farmerId, isAuthenticated]);

    // WebSocket setup
    useEffect(() => {
        if (!user?.id || !isAuthenticated) return;

        const client = makeStompClient();

        client.onConnect = () => {
            setConnectionStatus('Connected');

            // Subscribe to farmer's personal topic
            client.subscribe(`/topic/user.${user.id}`, (frame) => {
                try {
                    const message = JSON.parse(frame.body);

                    // Update messages if it belongs to selected conversation
                    if (selectedConv &&
                        message.productId === selectedConv.productId &&
                        ((message.senderId === selectedConv.buyerId && message.receiverId === farmerId) ||
                            (message.senderId === farmerId && message.receiverId === selectedConv.buyerId))
                    ) {
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

                    // Update conversation list with new message
                    setConversations(prev => prev.map(conv => {
                        if (conv.buyerId === message.senderId && conv.productId === message.productId) {
                            return {
                                ...conv,
                                lastMessage: message.content,
                                lastMessageTime: message.createdAt,
                                unreadCount: conv.buyerId === selectedConv?.buyerId &&
                                    conv.productId === selectedConv?.productId ? 0 : (conv.unreadCount || 0) + 1
                            };
                        }
                        return conv;
                    }));
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
    }, [user?.id, selectedConv, farmerId, isAuthenticated]);

    // Send message
    const send = () => {
        const content = text.trim();
        if (!content || !stompRef.current?.connected || !selectedConv || !user) return;

        const message = {
            productId: selectedConv.productId,
            senderId: user.id,
            receiverId: selectedConv.buyerId,
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

            // Update conversation with new message
            setConversations(prev => prev.map(conv => {
                if (conv.buyerId === selectedConv.buyerId && conv.productId === selectedConv.productId) {
                    return {
                        ...conv,
                        lastMessage: content,
                        lastMessageTime: new Date().toISOString()
                    };
                }
                return conv;
            }));
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

    const selectConversation = (conv) => {
        setSelectedConv(conv);
        // Mark as read
        setConversations(prev => prev.map(c =>
            c.buyerId === conv.buyerId && c.productId === conv.productId
                ? { ...c, unreadCount: 0 }
                : c
        ));
    };

    // Filter conversations based on search term
    const filteredConversations = conversations.filter(conv =>
        conv.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.buyerId.toString().includes(searchTerm) ||
        conv.productId.toString().includes(searchTerm)
    );

    if (!isAuthenticated || loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading conversations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Conversations</h3>
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
        <div className="flex h-screen bg-gray-50">
            {/* Mobile header - visible only on small screens */}
            <div className="lg:hidden flex items-center gap-3 p-4 border-b bg-white shadow-sm absolute top-0 left-0 right-0 z-10">
                <button
                    onClick={() => navigate("/")}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <MessageCircle className="w-6 h-6 text-green-600" />
                <h1 className="font-semibold text-lg">Messages</h1>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 border-r bg-white shadow-sm flex flex-col lg:mt-0 mt-16">
                {/* Sidebar Header */}
                <div className="p-4 border-b bg-green-50">
                    <div className="hidden lg:flex items-center gap-3 mb-3">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                        <h2 className="font-semibold text-lg text-gray-800">Messages</h2>
                        <span className="ml-auto bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                            {conversations.length}
                        </span>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium">No conversations yet</p>
                            <p className="text-sm mt-1">Messages will appear here when buyers contact you</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv, idx) => (
                            <div
                                key={`${conv.buyerId}-${conv.productId}`}
                                onClick={() => selectConversation(conv)}
                                className={`p-4 cursor-pointer border-b hover:bg-gray-50 transition-colors ${selectedConv?.buyerId === conv.buyerId &&
                                        selectedConv?.productId === conv.productId
                                        ? "bg-green-50 border-r-4 border-r-green-600"
                                        : ""
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {conv.buyerName || `Buyer #${conv.buyerId}`}
                                            </h3>

                                            {conv.unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <Package className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500 truncate">
                                                {conv.productName || `Product #${conv.productId}`}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 truncate mb-1">
                                            {conv.lastMessage || "No messages yet"}
                                        </p>

                                        {conv.lastMessageTime && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-400">
                                                    {new Date(conv.lastMessageTime).toLocaleDateString()} {' '}
                                                    {new Date(conv.lastMessageTime).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Connection Status */}
                <div className="p-3 border-t bg-gray-50">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-green-500' :
                                connectionStatus === 'Connecting...' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                        <span className="text-xs text-gray-600">{connectionStatus}</span>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className="flex-1 flex flex-col lg:block hidden">
                {selectedConv ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b bg-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {selectedConv.buyerName || `Buyer #${selectedConv.buyerId}`}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Package className="w-3 h-3" />
                                        <span>{selectedConv.productName || `Product #${selectedConv.productId}`}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No messages in this conversation yet.</p>
                                    <p className="text-sm mt-1">Send a message to start the conversation!</p>
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
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <User className="w-4 h-4 text-blue-600" />
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
                                        placeholder="Type your message..."
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
                                <span>{connectionStatus}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
                        <div className="text-center">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium mb-2">Welcome to Your Messages</h3>
                            <p className="text-sm">Select a conversation from the sidebar to start chatting with buyers</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile chat overlay - visible when conversation is selected on mobile */}
            {selectedConv && (
                <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
                    {/* Mobile Chat Header */}
                    <div className="p-4 border-b bg-white shadow-sm flex items-center gap-3">
                        <button
                            onClick={() => setSelectedConv(null)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-semibold">
                                {selectedConv.buyerName || `Buyer #${selectedConv.buyerId}`}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Package className="w-3 h-3" />
                                <span>{selectedConv.productName || `Product #${selectedConv.productId}`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messagesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p className="font-medium">No messages yet.</p>
                                <p className="text-sm mt-1">Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message, index) => {
                                const isMine = message.senderId === user.id;
                                return (
                                    <div key={message.id || index} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`px-3 py-2 rounded-2xl max-w-[80%] ${isMine
                                                    ? "bg-green-600 text-white"
                                                    : "bg-white border shadow-sm"
                                                }`}
                                        >
                                            <p className="break-words">{message.content}</p>
                                            <div className={`text-xs mt-1 opacity-70 ${isMine ? "text-right" : "text-left"}`}>
                                                {new Date(message.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Mobile Input */}
                    <div className="p-4 border-t bg-white">
                        <div className="flex gap-2">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Type message..."
                            />
                            <button
                                onClick={send}
                                disabled={!text.trim() || !stompRef.current?.connected}
                                className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}