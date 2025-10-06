import React from "react";
import { Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import WalletDashboard from "../components/wallet/WalletDashboard";
import TransactionsList from "../components/wallet/TransactionsList";
import AddMoneyForm from "../components/wallet/AddMoneyForm";
import WithdrawForm from "../components/wallet/WithdrawForm";
import ReservedBalance from "../components/wallet/ReservedBalance";

const WalletPage = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin">Loading...</div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-400 to-yellow-500">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid lg:grid-cols-5 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-3 space-y-6">
                            <WalletDashboard userId={currentUser.id} />

                            <div className="grid sm:grid-cols-2 gap-6">
                                {currentUser.role === "BUYER" && (
                                    <div className="bg-white p-6 rounded-xl shadow-lg">
                                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Money</h2>
                                        <AddMoneyForm userId={currentUser.id} />
                                    </div>
                                )}

                                {(currentUser.role === "FARMER" ||
                                    currentUser.role === "TRANSPORTER" ||
                                    currentUser.role === "BUYER") && (
                                        <div className="bg-white p-6 rounded-xl shadow-lg">
                                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Withdraw Funds</h2>
                                            <WithdrawForm userId={currentUser.id} />
                                        </div>
                                    )}
                            </div>

                            {currentUser.role === "BUYER" && (
                                <ReservedBalance userId={currentUser.id} />
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-2">
                            <TransactionsList userId={currentUser.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
