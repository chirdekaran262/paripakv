import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { makeStompClient } from "../chat/wsClient";
import { MessageCircle, ArrowLeft, Send, User } from "lucide-react";

export default function BuyerChatPage() {
    const { buyerId, farmerId, productId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [farmerInfo, setFarmerInfo] = useState(null);
    const stompRef = useRef(null);
    const messagesEndRef = useRef(null);

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUserId = storedUser?.id;
    const userRole = storedUser?.role;

    const apiBase = useMemo(
        () => import.meta.env.VITE_BACKEND_HTTP_URL || "http://localhost:8089",
        []
    );

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversation history and farmer info
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load conversation history
                const historyResponse = await fetch(
                    `${apiBase}/api/chat/history?productId=${productId}&buyerId=${buyerId}&farmerId=${farmerId}`,
                    { credentials: "include" }
                );

                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    setMessages(historyData);
                } else {
                    console.error('Failed to load chat history');
                }

                // Load farmer information
                const farmerResponse = await fetch(
                    `${apiBase}/api/users/${farmerId}`,
                    { credentials: "include" }
                );

                if (farmerResponse.ok) {
                    const farmerData = await farmerResponse.json();
                    setFarmerInfo(farmerData);
                }
            } catch (error) {
                console.error('Error loading chat data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [apiBase, productId, buyerId, farmerId]);

    // WebSocket connection
    useEffect(() => {
        if (!currentUserId) return;

        const client = makeStompClient();

        client.onConnect = () => {
            setConnectionStatus('Connected');

            // Subscribe to user's personal topic
            client.subscribe(`/topic/user.${currentUserId}`, (frame) => {
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
    }, [currentUserId, buyerId, farmerId, productId]);

    // Send message
    const send = () => {
        const content = text.trim();
        if (!content || !stompRef.current?.connected) return;

        const message = {
            productId,
            senderId: currentUserId,
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
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50">
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
                            <span className="text-gray-500">Product #{productId}</span>
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
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isMine = message.senderId === currentUserId;
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
        </div>
    );
}