import React, { useState } from 'react';
import { Sprout, ShoppingCart, Truck, CheckCircle, User, Package, CreditCard, MapPin, Bell, Shield } from 'lucide-react';
import Header from '../components/Header';

export default function Help() {
    const [activeRole, setActiveRole] = useState('farmer');

    const roles = [
        { id: 'farmer', name: 'For Farmers', icon: Sprout, color: 'green' },
        { id: 'buyer', name: 'For Buyers', icon: ShoppingCart, color: 'blue' },
        { id: 'transporter', name: 'For Transporters', icon: Truck, color: 'orange' }
    ];

    const farmerSteps = [
        {
            icon: User,
            title: 'Create Your Profile',
            description: 'Sign up using Google or email. Complete your farmer profile with farm details and location.'
        },
        {
            icon: Package,
            title: 'List Your Crops',
            description: 'Add your agricultural products with photos, prices, quantities, and quality details.'
        },
        {
            icon: Bell,
            title: 'Receive Orders',
            description: 'Get instant notifications when buyers place orders for your products.'
        },
        {
            icon: CreditCard,
            title: 'Get Paid Securely',
            description: 'Receive payments directly through Razorpay - fast, secure, and transparent.'
        },
        {
            icon: Truck,
            title: 'Coordinate Pickup',
            description: 'Verified transporters collect your products and deliver to buyers.'
        },
        {
            icon: CheckCircle,
            title: 'Delivery Confirmed',
            description: 'Get notified when delivery is verified with photo proof and OTP.'
        }
    ];

    const buyerSteps = [
        {
            icon: User,
            title: 'Register as Buyer',
            description: 'Quick sign-up with Google or email to access the marketplace.'
        },
        {
            icon: Package,
            title: 'Browse Products',
            description: 'Explore fresh agricultural products directly from verified farmers.'
        },
        {
            icon: ShoppingCart,
            title: 'Place Your Order',
            description: 'Select products, specify quantities, and place orders with ease.'
        },
        {
            icon: CreditCard,
            title: 'Secure Payment',
            description: 'Pay online using Razorpay - credit/debit cards, UPI, net banking supported.'
        },
        {
            icon: MapPin,
            title: 'Track Delivery',
            description: 'Monitor your order status and get updates via email notifications.'
        },
        {
            icon: CheckCircle,
            title: 'Verify & Confirm',
            description: 'Verify delivery with OTP and photo proof for complete transparency.'
        }
    ];

    const transporterSteps = [
        {
            icon: User,
            title: 'Join as Transporter',
            description: 'Register with your vehicle and delivery service details.'
        },
        {
            icon: Bell,
            title: 'Get Pickup Requests',
            description: 'Receive notifications for available pickup and delivery jobs.'
        },
        {
            icon: MapPin,
            title: 'Accept & Navigate',
            description: 'Accept requests and get farmer location for product pickup.'
        },
        {
            icon: Truck,
            title: 'Pickup Products',
            description: 'Collect products from farmers and begin delivery to buyers.'
        },
        {
            icon: CheckCircle,
            title: 'Complete Delivery',
            description: 'Upload photo proof and get OTP from buyer for verification.'
        },
        {
            icon: CreditCard,
            title: 'Receive Payment',
            description: 'Get your delivery fees credited securely after successful delivery.'
        }
    ];

    const stepsMap = {
        farmer: farmerSteps,
        buyer: buyerSteps,
        transporter: transporterSteps
    };

    const features = [
        {
            icon: Shield,
            title: 'Secure & Verified',
            description: 'All transactions protected with Razorpay. OTP and photo verification for deliveries.'
        },
        {
            icon: Bell,
            title: 'Real-Time Updates',
            description: 'Email notifications at every step - order placed, pickup, delivery confirmation.'
        },
        {
            icon: CreditCard,
            title: 'Instant Payments',
            description: 'Fast, transparent online payments. No waiting, no middlemen delays.'
        },
        {
            icon: MapPin,
            title: 'End-to-End Tracking',
            description: 'Track your orders from listing to delivery with complete transparency.'
        }
    ];

    const colorClasses = {
        green: {
            bg: 'bg-green-500',
            light: 'bg-green-50',
            border: 'border-green-500',
            text: 'text-green-600',
            hover: 'hover:bg-green-600'
        },
        blue: {
            bg: 'bg-blue-500',
            light: 'bg-blue-50',
            border: 'border-blue-500',
            text: 'text-blue-600',
            hover: 'hover:bg-blue-600'
        },
        orange: {
            bg: 'bg-red-500',
            light: 'bg-red-50',
            border: 'border-red-500',
            text: 'text-red-600',
            hover: 'hover:bg-red-600'
        }
    };

    const activeColor = roles.find(r => r.id === activeRole)?.color || 'emerald';
    const colors = colorClasses[activeColor];

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-yellow-300">
            <Header />
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">How Paripakv Works</h1>
                    <p className="text-xl text-green-100 max-w-3xl mx-auto">
                        Connecting farmers, buyers, and transporters in a seamless agricultural marketplace.
                        Simple, secure, and efficient.
                    </p>
                </div>
            </div>

            {/* Role Selection */}
            <div className="max-w-6xl mx-auto px-4 -mt-8">
                <div className="bg-white rounded-2xl shadow-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
                        {roles.map((role) => {
                            const RoleIcon = role.icon;
                            const isActive = activeRole === role.id;
                            const roleColors = colorClasses[role.color];

                            return (
                                <button
                                    key={role.id}
                                    onClick={() => setActiveRole(role.id)}
                                    className={`p-6 rounded-xl transition-all duration-300 ${isActive
                                        ? `${roleColors.bg} text-white shadow-lg scale-105`
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    <RoleIcon className="w-10 h-10 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold">{role.name}</h3>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <div className="max-w-6xl mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">
                        Your Journey with Paripakv
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Follow these simple steps to get started
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stepsMap[activeRole].map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                            <div
                                key={index}
                                className="bg-green-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`${colors.bg} ${colors.hover} text-white rounded-full p-3 flex-shrink-0 transition-colors`}>
                                        <StepIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center mb-2">
                                            <span className={`${colors.text} font-bold text-sm mr-2`}>
                                                STEP {index + 1}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-800 mb-4">
                            Why Choose Paripakv?
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Built with trust, transparency, and technology
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => {
                            const FeatureIcon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="bg-green-100 text-green-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                        <FeatureIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 py-16 px-4">
                <div className="max-w-4xl mx-auto text-center text-white">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Transform Agriculture?
                    </h2>
                    <p className="text-xl text-green-100 mb-8">
                        Join thousands of farmers, buyers, and transporters already using Paripakv
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg" onClick={() => Navigate('/')}>
                            Get Started Now
                        </button>
                        <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-green-600 transition-colors">
                            Watch Demo
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-800 text-gray-300 py-8 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-sm">
                        🌾 Paripakv - Transforming India's Agricultural Supply Chain with Technology
                    </p>
                    <p className="text-xs mt-2 text-gray-400">
                        Created by Karan Chirde | chirdekaran262@gmail.com
                    </p>
                </div>
            </div>
        </div>
    );
}