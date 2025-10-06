import axios from "axios";
import Cookies from "js-cookie";

const API = `${import.meta.env.VITE_API_URL}`;

// Create axios instance with default config
const walletApi = axios.create({
    baseURL: API,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Add request interceptor to include token
walletApi.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle auth redirects
walletApi.interceptors.response.use(
    (response) => {
        // Check if response is HTML instead of JSON
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
            throw new Error('Invalid response format');
        }
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                Cookies.remove('token'); // Clear invalid token
                window.location.href = '/login';
                return Promise.reject(new Error('Please login to continue'));
            }
            // Handle other status codes
            const errorMessage = error.response.data?.message || error.response.data;
            switch (error.response.status) {
                case 404:
                    throw new Error('Resource not found');
                case 400:
                    if (errorMessage?.includes('Insufficient balance')) {
                        throw new Error('Insufficient balance');
                    }
                    throw new Error(errorMessage || 'Bad request');
                default:
                    throw new Error('Something went wrong');
            }
        }
        if (error.code === 'ERR_NETWORK') {
            throw new Error('Network error. Please check your connection');
        }
        return Promise.reject(error);
    }
);

// Add missing handleApiError function at the top
const handleApiError = (error) => {
    if (error.response) {
        const errorMessage = error.response.data?.message || error.response.data;
        switch (error.response.status) {
            case 401:
            case 403:
                Cookies.remove('token');
                throw new Error('Authentication required');
            case 404:
                throw new Error('Resource not found');
            case 400:
                if (errorMessage?.includes('Insufficient balance')) {
                    throw new Error('Insufficient balance');
                }
                throw new Error(errorMessage || 'Bad request');
            default:
                throw new Error('Something went wrong');
        }
    }
    if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your connection');
    }
    throw error;
};

// API functions
export const getWallet = async (userId) => {
    try {
        if (!userId) throw new Error('User ID is required');

        const response = await walletApi.get(`wallet/get`, {
            params: { userId },
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid wallet data received');
        }
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Wallet fetch error:', error);
        throw error;
    }
};

export const addMoney = async (userId, amount) => {
    try {
        const response = await walletApi.post('wallet/add', null, {
            params: {
                userId,
                amount: amount.toString() // Convert to string for BigDecimal
            }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const withdraw = async (userId, amount) => {
    try {
        const response = await walletApi.post('wallet/withdraw', null, {
            params: {
                userId,
                amount: amount.toString()
            }
        });
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Fix getTransactions function - was using undefined 'get'
export const getTransactions = async (userId) => {
    try {
        const response = await walletApi.get('walletTransactions/getTransactions', {
            params: { userId }
        });
        console.log('Transactions response:', response.data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Fix getReservedBalance function - was using undefined 'get'
export const getReservedBalance = async (userId) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const token = Cookies.get('token');
        if (!token) {
            throw new Error('Authentication required');
        }
        console.log('Fetching reserved balance for userId:', userId);
        const response = await walletApi.get(`walletReservation/get`, {
            params: { userId }
            ,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        // Validate response data
        const balance = Number(response.data);
        console.log('Reserved balance response:', response.data);
        if (isNaN(balance)) {
            throw new Error('Invalid balance data received');
        }

        return balance;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const transferAfterOtp = async (orderDetails) => {
    try {
        const response = await walletApi.post('wallet/transfer', orderDetails);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};


export const getReservedList = async (userId) => {
    try {
        const response = await walletApi.get(`/walletReservation/getList`, {
            params: { userId }
        });
        console.log('Reserved list response:', response.data);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};