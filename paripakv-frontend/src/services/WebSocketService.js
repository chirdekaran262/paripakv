import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.messageCallbacks = [];
        this.connectionPromise = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.maxReconnectDelay = 30000; // Max 30 seconds
        this.heartbeatInterval = null;
        this.userId = null;
    }

    connect(token) {
        // If already connecting, return existing promise
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        // If already connected, return resolved promise
        if (this.connected && this.stompClient) {
            return Promise.resolve();
        }

        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                console.log('Connecting to WebSocket...');

                // Extract user ID from token if possible
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        this.userId = payload.sub || payload.userId;
                    } catch (e) {
                        console.warn('Could not extract user ID from token');
                    }
                }

                const socket = new SockJS('http://localhost:8089/ws');
                this.stompClient = Stomp.over(socket);

                // Configure STOMP client
                this.stompClient.configure({
                    connectHeaders: {
                        'Authorization': `Bearer ${token}`
                    },
                    debug: (str) => {
                        console.debug('STOMP Debug:', str);
                    },
                    reconnectDelay: this.reconnectDelay,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    onConnect: (frame) => {
                        console.log('Connected to WebSocket:', frame);
                        this.connected = true;
                        this.reconnectAttempts = 0;
                        this.connectionPromise = null;

                        // Subscribe to personal message queue
                        this.stompClient.subscribe('/user/queue/messages', (message) => {
                            try {
                                const messageData = JSON.parse(message.body);
                                console.log('Received WebSocket message:', messageData);
                                this.messageCallbacks.forEach(callback => {
                                    try {
                                        callback(messageData);
                                    } catch (callbackError) {
                                        console.error('Error in message callback:', callbackError);
                                    }
                                });
                            } catch (parseError) {
                                console.error('Error parsing WebSocket message:', parseError);
                            }
                        });

                        // Start heartbeat
                        this.startHeartbeat();

                        resolve();
                    },
                    onDisconnect: (frame) => {
                        console.log('Disconnected from WebSocket:', frame);
                        this.connected = false;
                        this.connectionPromise = null;
                        this.stopHeartbeat();

                        // Attempt reconnection if not manually disconnected
                        if (this.reconnectAttempts < this.maxReconnectAttempts) {
                            this.scheduleReconnect(token);
                        }
                    },
                    onStompError: (frame) => {
                        console.error('STOMP error:', frame);
                        this.connected = false;
                        this.connectionPromise = null;
                        this.stopHeartbeat();

                        if (this.reconnectAttempts === 0) {
                            // Only reject on first connection attempt
                            reject(new Error(`WebSocket connection failed: ${frame.headers.message}`));
                        } else {
                            // For reconnection attempts, just log and try again
                            this.scheduleReconnect(token);
                        }
                    },
                    onWebSocketError: (error) => {
                        console.error('WebSocket error:', error);
                        this.connected = false;
                        this.connectionPromise = null;

                        if (this.reconnectAttempts === 0) {
                            reject(error);
                        }
                    }
                });

                // Activate the connection
                this.stompClient.activate();

            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                this.connectionPromise = null;
                reject(error);
            }
        });

        return this.connectionPromise;
    }

    scheduleReconnect(token) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect(token).catch(error => {
                console.error('Reconnection failed:', error);
            });
        }, delay);
    }

    startHeartbeat() {
        this.stopHeartbeat(); // Clear any existing heartbeat

        this.heartbeatInterval = setInterval(() => {
            if (this.connected && this.stompClient) {
                try {
                    // Send a ping message to keep connection alive
                    this.stompClient.publish({
                        destination: '/app/ping',
                        body: JSON.stringify({ timestamp: Date.now() })
                    });
                } catch (error) {
                    console.warn('Heartbeat failed:', error);
                }
            }
        }, 30000); // Send heartbeat every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    sendMessage(senderId, receiverId, productId, content) {
        if (!this.connected || !this.stompClient) {
            console.warn('WebSocket not connected, cannot send message');
            throw new Error('WebSocket not connected');
        }

        if (!receiverId || !productId || !content?.trim()) {
            throw new Error('Missing required message parameters');
        }

        try {
            const messageData = {
                senderId,
                receiverId,
                productId,
                content: content.trim(),
                timestamp: new Date().toISOString()
            };

            console.log('Sending WebSocket message:', messageData);

            this.stompClient.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(messageData)
            });

        } catch (error) {
            console.error('Error sending WebSocket message:', error);
            throw error;
        }
    }

    onMessageReceived(callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }

        this.messageCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            const index = this.messageCallbacks.indexOf(callback);
            if (index > -1) {
                this.messageCallbacks.splice(index, 1);
            }
        };
    }

    disconnect() {
        console.log('Disconnecting WebSocket...');

        this.stopHeartbeat();
        this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection

        if (this.stompClient) {
            try {
                this.stompClient.deactivate();
            } catch (error) {
                console.error('Error during WebSocket disconnect:', error);
            }
            this.stompClient = null;
        }

        this.connected = false;
        this.connectionPromise = null;
        this.messageCallbacks = [];
        this.userId = null;
    }

    isConnected() {
        return this.connected && this.stompClient && this.stompClient.connected;
    }

    getConnectionStatus() {
        if (this.connectionPromise) {
            return 'connecting';
        } else if (this.connected) {
            return 'connected';
        } else {
            return 'disconnected';
        }
    }

    // Method to manually trigger reconnection
    reconnect(token) {
        this.disconnect();
        this.reconnectAttempts = 0;
        return this.connect(token);
    }
}

export default new WebSocketService();