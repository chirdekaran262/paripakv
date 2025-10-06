import React, { useEffect, useState } from "react";
import { getWallet, getReservedBalance } from "../../services/walletApi";
import { Wallet, IndianRupee, TrendingUp, AlertCircle, Loader } from "lucide-react";
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const WalletDashboard = ({ userId }) => {
    const [wallet, setWallet] = useState({ balance: 0, reserved: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setError('User ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const [walletData, reservedData] = await Promise.all([
                    getWallet(userId),
                    getReservedBalance(userId)
                ]);

                // Validate wallet data
                if (!walletData || typeof walletData.balance === 'undefined') {
                    throw new Error('Invalid wallet data received');
                }

                setWallet({
                    balance: Number(walletData.balance) || 0,
                    reserved: Number(reservedData) || 0
                });
            } catch (err) {
                console.error('Wallet fetch error:', err);
                if (err.message === 'Authentication required') {
                    navigate('/login');
                    return;
                }
                setError(err.message || 'Failed to fetch wallet data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, navigate]);

    if (loading) {
        return (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center justify-center space-x-3">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-gray-600 font-medium">Loading your wallet...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Wallet className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Wallet Overview</h2>
                        <p className="text-white/80">Manage your funds</p>
                    </div>
                </div>
                <div className="bg-emerald-400/20 px-4 py-1 rounded-full backdrop-blur-sm">
                    <span className="text-emerald-50 text-sm font-medium">Active</span>
                </div>
            </div>

            {/* Main Balance Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 font-medium">Total Balance</span>
                    <TrendingUp className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="flex items-baseline space-x-2">
                    <IndianRupee className="w-8 h-8 text-white/90" />
                    <span className="text-4xl font-bold text-white tracking-tight">
                        {wallet.balance.toLocaleString('en-IN', {
                            maximumFractionDigits: 2
                        })}
                    </span>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="gap-4">
                {/* <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
                    <p className="text-white/80 text-sm mb-1 font-medium">Available Balance</p>
                    <p className="text-2xl font-bold text-white">
                        ₹{(wallet.balance - wallet.reserved).toLocaleString('en-IN')}
                    </p>
                    <p className="text-white/60 text-xs mt-1">Ready to use</p>
                </div> */}

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-colors">
                    <p className="text-white/80 text-sm mb-1 font-medium">Reserved Amount</p>
                    <p className="text-2xl font-bold text-white">
                        ₹{wallet.reserved.toLocaleString('en-IN')}
                    </p>
                    <p className="text-white/60 text-xs mt-1">Locked in orders</p>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-white/60 text-sm text-center">
                    Last updated: {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
};

WalletDashboard.propTypes = {
    userId: PropTypes.string.isRequired
};

export default WalletDashboard;
