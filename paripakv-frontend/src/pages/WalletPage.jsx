import React from "react";
import { Wallet, ArrowDownCircle, PlusCircle } from "lucide-react";
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex items-center space-x-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Loading...</span>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-200 to-yellow-100">
            <Header />
            <div className="py-10 px-4 sm:px-6 lg:px-8 bg-transparent">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Page Header */}
                    <div className="bg-white backdrop-blur-sm p-8 rounded-3xl shadow-md border border-gray-200">
                        <div className="flex items-center space-x-5">
                            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-inner">
                                <Wallet className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-gray-900 text-4xl font-bold">My Wallet</h1>
                                <p className="text-gray-500 mt-2 text-lg">Manage your funds and transactions</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Wallet Dashboard */}
                            <div className="transform hover:scale-[1.02] transition-transform duration-300">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-3xl shadow-lg">
                                    <WalletDashboard userId={currentUser.id} />
                                </div>
                            </div>

                            {/* Action Cards */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                {currentUser.role === "BUYER" && (
                                    <div className="bg-white backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center space-x-4 mb-6">
                                            <div className="p-3 bg-emerald-100 rounded-xl">
                                                <PlusCircle className="w-6 h-6 text-emerald-600" />
                                            </div>
                                            <h2 className="text-gray-900 text-2xl font-bold">Add Money</h2>
                                        </div>
                                        <AddMoneyForm userId={currentUser.id} />
                                    </div>
                                )}

                                {(currentUser.role === "FARMER" ||
                                    currentUser.role === "TRANSPORTER" ||
                                    currentUser.role === "BUYER") && (
                                        <div className="bg-white backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="flex items-center space-x-4 mb-6">
                                                <div className="p-3 bg-blue-100 rounded-xl">
                                                    <ArrowDownCircle className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <h2 className="text-gray-900 text-2xl font-bold">Withdraw</h2>
                                            </div>
                                            <WithdrawForm userId={currentUser.id} />
                                        </div>
                                    )}
                            </div>

                            {/* Reserved Balance */}
                            {currentUser.role === "BUYER" && (
                                <div className="transform transition-all duration-300 hover:-translate-y-1">
                                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-1 rounded-3xl shadow-lg">
                                        <ReservedBalance userId={currentUser.id} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="lg:col-span-4">
                            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200 sticky top-8">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-gray-900 text-xl font-bold">Recent Transactions</h2>
                                </div>
                                <TransactionsList userId={currentUser.id} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
