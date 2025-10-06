import React, { useState } from "react";
import { addMoney } from "../../services/walletApi";
import { PlusCircle, Loader } from "lucide-react";

const AddMoneyForm = ({ userId }) => {
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
            await addMoney(userId, amount);
            setAmount("");
            // You might want to add a success toast here
        } catch (err) {
            setError(err.message || "Failed to add money");
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
                        placeholder="Enter Amount"
                        className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        disabled={loading}
                        min="1"
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        <PlusCircle className="w-5 h-5" />
                        <span>Add Money</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default AddMoneyForm;
