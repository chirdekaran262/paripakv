import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = import.meta.env.VITE_API_URL + '/api';

class ChatService {
    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000, // 10 second timeout
        });

        // Add auth interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = Cookies.get('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Add response interceptor for error handling
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error.response?.data || error.message);

                // Handle specific error cases
                if (error.response?.status === 401) {
                    // Unauthorized - redirect to login
                    Cookies.remove('token');
                    window.location.href = '/login';
                } else if (error.response?.status === 403) {
                    throw new Error('Access denied');
                } else if (error.response?.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                } else if (error.code === 'ECONNABORTED') {
                    throw new Error('Request timeout. Please check your connection.');
                }

                return Promise.reject(error);
            }
        );
    }

    async sendMessage(senderId, receiverId, productId, content) {
        try {
            console.log('Sending message:', {
                senderId,
                receiverId,
                productId,
                content: content.substring(0, 50) + '...'
            });

            // Validate inputs
            if (!senderId || !receiverId || !productId || !content?.trim()) {
                throw new Error('Missing required message data');
            }

            const response = await this.api.post('/chat/send', {
                senderId,
                receiverId,
                productId,
                content: content.trim()
            });

            console.log('Message sent successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);

            // Re-throw with user-friendly message
            if (error.message.includes('Missing required')) {
                throw error;
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Failed to send message. Please try again.');
            }
        }
    }

    async getMessages(otherUserId, productId) {
        try {
            console.log('Fetching messages for:', { otherUserId, productId });

            if (!otherUserId || !productId) {
                throw new Error('Missing required parameters for fetching messages');
            }

            const response = await this.api.get(`/chat/messages/${otherUserId}/${productId}`);
            console.log('Fetched messages:', response.data?.length || 0, 'messages');

            return response.data || [];
        } catch (error) {
            console.error('Error fetching messages:', error);

            if (error.response?.status === 404) {
                // No messages found - return empty array
                return [];
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Failed to load messages. Please try again.');
            }
        }
    }

    async getUserChats() {
        try {
            console.log('Fetching user chats');
            const response = await this.api.get('/chat/chats');
            console.log('Fetched chats:', response.data?.length || 0, 'chats');

            return response.data || [];
        } catch (error) {
            console.error('Error fetching chats:', error);

            if (error.response?.status === 404) {
                // No chats found - return empty array
                return [];
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Failed to load chats. Please try again.');
            }
        }
    }

    async markAsRead(otherUserId, productId) {
        try {
            if (!otherUserId || !productId) {
                console.warn('Missing parameters for markAsRead:', { otherUserId, productId });
                return;
            }

            await this.api.post(`/chat/mark-read/${otherUserId}/${productId}`);
            console.log('Messages marked as read successfully');
        } catch (error) {
            console.error('Error marking messages as read:', error);
            // Don't throw error for marking as read - it's not critical
        }
    }

    async getUnreadCount() {
        try {
            const response = await this.api.get('/chat/unread-count');
            return response.data || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0; // Return 0 on error instead of throwing
        }
    }

    // Utility method to validate UUID format
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    // Method to refresh auth token if needed
    async refreshToken() {
        try {
            const response = await this.api.post('/auth/refresh');
            const newToken = response.data.token;
            Cookies.set('token', newToken, { expires: 7 });
            return newToken;
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }
}

export default new ChatService();