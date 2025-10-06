import React, { useState } from "react";
import {
    Wallet, ArrowDownCircle, PlusCircle, CreditCard,
    BarChart3, History, Shield, Sparkles, TrendingUp,
    Lock, Zap, CheckCircle, Bell, DollarSign
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import WalletDashboard from "../components/wallet/WalletDashboard";
import TransactionsList from "../components/wallet/TransactionsList";
import AddMoneyForm from "../components/wallet/AddMoneyForm";
import WithdrawForm from "../components/wallet/WithdrawForm";
import ReservedBalance from "../components/wallet/ReservedBalance";

const WalletPage = () => {
    const { currentUser, loading } = useAuth();
    const [activeSection, setActiveSection] = useState('dashboard');

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-300 flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-lg flex items-center gap-3">
                    <div className="w-6 h-6 border-3 border-green-600 border-r-transparent rounded-full animate-spin" />
                    <span className="text-lg font-medium text-gray-700">Loading wallet...</span>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Role-based colors matching Help page
    const roleColors = {
        FARMER: {
            bg: 'bg-green-500',
            hover: 'hover:bg-green-600',
            light: 'bg-green-50',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            gradient: 'from-green-600 to-emerald-700'
        },
        BUYER: {
            bg: 'bg-blue-500',
            hover: 'hover:bg-blue-600',
            light: 'bg-blue-50',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            gradient: 'from-blue-600 to-indigo-700'
        },
        TRANSPORTER: {
            bg: 'bg-red-500',
            hover: 'hover:bg-red-600',
            light: 'bg-red-50',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            gradient: 'from-red-600 to-orange-700'
        }
    };

    const colors = roleColors[currentUser.role] || roleColors.BUYER;

    const sections = [
        { id: 'dashboard', name: 'Dashboard', icon: Wallet },
        ...(currentUser.role === "BUYER" ? [{ id: 'add', name: 'Add Money', icon: PlusCircle }] : []),
        ...((currentUser.role === "FARMER" || currentUser.role === "TRANSPORTER" || currentUser.role === "BUYER")
            ? [{ id: 'withdraw', name: 'Withdraw', icon: ArrowDownCircle }]
            : []),
        { id: 'history', name: 'History', icon: History }
    ];

    const features = [
        {
            icon: Shield,
            title: 'Secure Transactions',
            desc: 'Bank-grade security for all your payments'
        },
        {
            icon: Zap,
            title: 'Instant Processing',
            desc: 'Quick transfers in real-time'
        },
        {
            icon: CreditCard,
            title: 'Multiple Methods',
            desc: 'UPI, cards, net banking supported'
        },
        {
            icon: CheckCircle,
            title: 'Transaction History',
            desc: 'Complete records of all activities'
        }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-md p-6">
                            <WalletDashboard userId={currentUser.id} />
                        </div>
                        {currentUser.role === "BUYER" && (
                            <ReservedBalance userId={currentUser.id} />
                        )}
                    </div>
                );

            case 'add':
                if (currentUser.role !== "BUYER") return null;
                return (
                    <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 ${colors.iconBg} rounded-xl`}>
                                <PlusCircle className={`w-6 h-6 ${colors.iconColor}`} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Add Money to Wallet</h2>
                        </div>
                        <AddMoneyForm userId={currentUser.id} />
                    </div>
                );

            case 'withdraw':
                if (!["FARMER", "TRANSPORTER", "BUYER"].includes(currentUser.role)) return null;
                return (
                    <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 ${colors.iconBg} rounded-xl`}>
                                <ArrowDownCircle className={`w-6 h-6 ${colors.iconColor}`} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Withdraw Funds</h2>
                        </div>
                        <WithdrawForm userId={currentUser.id} />
                    </div>
                );

            case 'history':
                return (
                    <div className="bg-white rounded-2xl shadow-md">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                        </div>
                        <TransactionsList userId={currentUser.id} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-300">
            <Header />

            {/* Hero Section */}
            <div className={`bg-gradient-to-r ${colors.gradient} text-white py-16`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-4">
                            <Wallet className="w-5 h-5" />
                            <span className="font-medium">Digital Wallet</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Manage Your Wallet</h1>
                        <p className="text-xl opacity-90">
                            Simple and secure way to handle your transactions
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold">₹{currentUser?.walletBalance || '0'}</div>
                            <div className="opacity-90 text-sm mt-1">Available Balance</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold">{currentUser?.transactions?.length || '0'}</div>
                            <div className="opacity-90 text-sm mt-1">Total Transactions</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold">₹2,340</div>
                            <div className="opacity-90 text-sm mt-1">Reserved</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                <div className="bg-white rounded-xl shadow-lg p-2">
                    <div className="flex flex-wrap gap-2">
                        {sections.map((section) => {
                            const SectionIcon = section.icon;
                            const isActive = activeSection === section.id;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${isActive
                                            ? `${colors.bg} text-white shadow-md`
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <SectionIcon className="w-5 h-5" />
                                    {section.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {renderContent()}
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Wallet Features
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Everything you need for secure transactions
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, i) => {
                            const FeatureIcon = feature.icon;
                            return (
                                <div
                                    key={i}
                                    className={`bg-gradient-to-b ${colors.light} rounded-2xl p-6 text-center hover:shadow-lg transition-shadow`}
                                >
                                    <div className={`${colors.iconBg} w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center shadow-md`}>
                                        <FeatureIcon className={`w-8 h-8 ${colors.iconColor}`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-800 text-gray-300 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-sm">
                        🌾 Paripakv - Secure Agricultural Transactions
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;