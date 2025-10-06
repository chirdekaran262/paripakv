import React, { useEffect, useState } from "react";
import { getTransactions } from "../../services/walletApi";
import PropTypes from 'prop-types';
import { ArrowUpCircle, ArrowDownCircle, Loader, Receipt } from 'lucide-react';

const TransactionsList = ({ userId }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Format transaction data helper
    const formatTransaction = (tx) => ({
        id: tx.id,
        amount: Number(tx.amount),
        description: tx.description,
        timestamp: tx.createdAt,
        type: tx.type.toLowerCase(), // Convert DEBIT/CREDIT to lowercase
        user: tx.user
    });

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const data = await getTransactions(userId);
                // Validate and format the data
                if (Array.isArray(data)) {
                    const formattedTransactions = data.map(formatTransaction);
                    setTransactions(formattedTransactions);
                } else {
                    setTransactions([]);
                    setError('Invalid data format received');
                }
            } catch (err) {
                setError(err.message || 'Failed to load transactions');
                setTransactions([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchTransactions();
        }
    }, [userId]);
    console.log("transactions", transactions)
    // Ensure transactions is always treated as an array
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8 bg-white rounded-xl shadow-xl">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-800 rounded-xl border-2 border-red-200 shadow-lg">
                <p className="font-semibold text-base">{error}</p>
            </div>
        );
    }

    if (safeTransactions.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-xl shadow-lg border border-gray-200">
                <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-800 font-semibold text-lg">No transactions yet</p>
                <p className="text-gray-500 mt-2">Your transaction history will appear here</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-t-xl">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Transaction History
                </h3>
            </div>

            <ul className="divide-y divide-gray-200">
                {safeTransactions.map((tx, i) => (
                    <li key={tx.id || i}
                        className="p-5 hover:bg-gray-50 transition-all duration-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${tx.type === 'credit' || tx.type === 'CREDIT'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                    {tx.type === 'credit' || tx.type === 'CREDIT'
                                        ? <ArrowUpCircle className="w-6 h-6" />
                                        : <ArrowDownCircle className="w-6 h-6" />
                                    }
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {tx.description || 'Unknown Transaction'}
                                    </p>
                                    <p className="text-gray-600">
                                        {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'No date'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-xl font-bold ${tx.type === 'credit' || tx.type === 'CREDIT'
                                        ? 'text-green-700'
                                        : 'text-red-700'
                                    }`}>
                                    {tx.type === 'credit' || tx.type === 'CREDIT' ? '+' : '-'}
                                    ₹{(tx.amount || 0).toLocaleString('en-IN')}
                                </span>
                                <span className={`text-sm ${tx.type === 'credit' || tx.type === 'CREDIT'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}>
                                    {tx.type === 'credit' || tx.type === 'CREDIT' ? 'Received' : 'Sent'}
                                </span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

TransactionsList.propTypes = {
    userId: PropTypes.string.isRequired
};

export default TransactionsList;
