// src/chat/wsClient.js - Improved WebSocket client
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketManager {
    constructor() {
        this.client = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.isConnected = false;
        this.subscriptions = new Map();
        this.messageQueue = [];
    }

    connect() {
        if (this.client && this.client.active) {
            return Promise.resolve(this.client);
        }

        return new Promise((resolve, reject) => {
            const wsUrl = import.meta.env.VITE_API_URL;
            
            this.client = new Client({
                webSocketFactory: () => new SockJS(wsUrl/ws),
                reconnectDelay: this.reconnectDelay,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                debug: (str) => {
                    if (import.meta.env.DEV) {
                        console.log('STOMP Debug:', str);
                    }
                },
                onConnect: (frame) => {
                    console.log('Connected to WebSocket:', frame);
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    
                    // Process queued messages
                    this.processMessageQueue();
                    
                    // Restore subscriptions
                    this.restoreSubscriptions();
                    
                    resolve(this.client);
                },
                onStompError: (frame) => {
                    console.error('STOMP error:', frame);
                    this.isConnected = false;
                    reject(new Error(`STOMP error: ${frame.headers.message}`));
                },
                onWebSocketError: (error) => {
                    console.error('WebSocket error:', error);
                    this.isConnected = false;
                },
                onDisconnect: () => {
                    console.log('Disconnected from WebSocket');
                    this.isConnected = false;
                    this.attemptReconnect();
                }
            });

            this.client.activate();
        });
    }

    disconnect() {
        if (this.client && this.client.active) {
            this.client.deactivate();
        }
        this.isConnected = false;
        this.subscriptions.clear();
        this.messageQueue = [];
    }

    subscribe(destination, callback) {
        if (!this.client || !this.isConnected) {
            // Store subscription for later
            this.subscriptions.set(destination, callback);
            return null;
        }

        try {
            const subscription = this.client.subscribe(destination, callback);
            this.subscriptions.set(destination, callback);
            return subscription;
        } catch (error) {
            console.error('Error subscribing to:', destination, error);
            return null;
        }
    }

    unsubscribe(destination) {
        this.subscriptions.delete(destination);
    }

    publish(destination, body, headers = {}) {
        const message = { destination, body, headers };

        if (!this.client || !this.isConnected) {
            // Queue message for later
            this.messageQueue.push(message);
            return false;
        }

        try {
            this.client.publish(message);
            return true;
        } catch (error) {
            console.error('Error publishing message:', error);
            this.messageQueue.push(message);
            return false;
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            try {
                this.client.publish(message);
            } catch (error) {
                console.error('Error processing queued message:', error);
                // Put message back if it failed
                this.messageQueue.unshift(message);
                break;
            }
        }
    }

    restoreSubscriptions() {
        for (const [destination, callback] of this.subscriptions) {
            try {
                this.client.subscribe(destination, callback);
            } catch (error) {
                console.error('Error restoring subscription:', destination, error);
            }
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);

        setTimeout(() => {
            if (!this.isConnected) {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }
        }, delay);
    }

    getConnectionStatus() {
        if (!this.client) return 'Not initialized';
        if (this.isConnected) return 'Connected';
        if (this.client.active) return 'Connecting...';
        return 'Disconnected';
    }
}

// Singleton instance
const webSocketManager = new WebSocketManager();

export function makeStompClient() {
    return webSocketManager;
}

export function connectWebSocket() {
    return webSocketManager.connect();
}

export function disconnectWebSocket() {
    webSocketManager.disconnect();
}

export default webSocketManager;