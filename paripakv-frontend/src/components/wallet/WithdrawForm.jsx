import React, { useState } from "react";
import { withdraw } from "../../services/walletApi";
import { CreditCard, Loader } from "lucide-react";

const WithdrawForm = ({ userId }) => {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        try {
            setLoading(true);
            setError("");
            await withdraw(userId, amount);
            setAmount("");
            // Add success toast here
        } catch (err) {
            setError(err.message || "Failed to process withdrawal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Withdraw Amount"
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={loading}
                        min="1"
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <CreditCard className="w-5 h-5" />
                        <span>Withdraw</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default WithdrawForm;
