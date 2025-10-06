import React, { useEffect, useState } from "react";
import { LockIcon, Loader, AlertCircle, ChevronDown, Package } from "lucide-react";
import { getReservedBalance, getReservedList } from "../../services/walletApi";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import PropTypes from 'prop-types';

const ReservedBalance = ({ userId }) => {
    const [reserved, setReserved] = useState(0);
    const [reservedList, setReservedList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();
    const token = Cookies.get('token');

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError('Please login to view reserved balance');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const [balanceData, listData] = await Promise.all([
                    getReservedBalance(userId),
                    getReservedList(userId)
                ]);

                setReserved(Number(balanceData) || 0);
                setReservedList(Array.isArray(listData) ? listData : []);
            } catch (err) {
                console.error('Reserved balance error:', err);
                setError(err.message || 'Failed to fetch reserved balance');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId, token]);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
                <div className="flex items-center justify-center">
                    <Loader className="w-6 h-6 animate-spin text-blue-600" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2 text-red-600 justify-center">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <LockIcon className="w-5 h-5" />
                        <span>Reserved Balance</span>
                    </h2>
                    <p className="text-sm text-white/90 mt-1">Amount locked for active orders</p>
                </div>
                {reservedList.length > 0 && (
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <ChevronDown className={`w-5 h-5 text-white transform transition-transform duration-200 
                            ${showDetails ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <p className="text-3xl font-bold text-white">
                    ₹{reserved.toLocaleString('en-IN', {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2
                    })}
                </p>
            </div>

            {showDetails && reservedList.length > 0 && (
                <div className="mt-4 space-y-3">
                    <div className="border-t border-white/20 pt-4">
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {reservedList.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white/20 backdrop-blur-sm rounded-lg p-3 hover:bg-white/30 transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Package className="w-4 h-4 text-white" />
                                            <div>
                                                <p className="text-sm font-medium text-white">
                                                    Order #{item.orderId?.slice(0, 8)}
                                                </p>
                                                <p className="text-xs text-white/80">
                                                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-white">
                                            ₹{Number(item.amount).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

ReservedBalance.propTypes = {
    userId: PropTypes.string.isRequired
};

export default ReservedBalance;
