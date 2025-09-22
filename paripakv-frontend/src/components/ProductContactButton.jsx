// ProductContactButton.jsx - Component for product listing page
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, Phone, Mail } from "lucide-react";

export default function ProductContactButton({ product, farmer, className = "" }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const currentUser = storedUser?.id ? storedUser : null;
    const isBuyer = currentUser?.role === "BUYER";

    const handleContactClick = async () => {
        if (!currentUser) {
            // Redirect to login if not authenticated
            navigate("/login", {
                state: {
                    redirectTo: `/product/${product.id}`,
                    message: "Please login to contact the farmer"
                }
            });
            return;
        }

        if (!isBuyer) {
            alert("Only buyers can contact farmers");
            return;
        }

        setIsLoading(true);

        try {
            // Optional: Create an initial conversation or just navigate
            const apiBase = import.meta.env.VITE_BACKEND_HTTP_URL || "http://localhost:8089";

            // You might want to create an initial conversation record
            await fetch(`${apiBase}/api/chat/start-conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    productId: product.id,
                    farmerId: farmer.id,
                    buyerId: currentUser.id
                })
            });

            // Navigate to chat page
            navigate(`/chat/${currentUser.id}/${farmer.id}/${product.id}`);
        } catch (error) {
            console.error('Error starting conversation:', error);
            // Still navigate to chat even if API fails
            navigate(`/chat/${currentUser.id}/${farmer.id}/${product.id}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePhoneClick = () => {
        if (farmer.phone) {
            window.open(`tel:${farmer.phone}`, '_self');
        }
    };

    const handleEmailClick = () => {
        if (farmer.email) {
            window.open(`mailto:${farmer.email}?subject=Inquiry about ${product.name}`, '_self');
        }
    };

    if (!currentUser) {
        return (
            <div className={`space-y-3 ${className}`}>
                <button
                    onClick={handleContactClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    <MessageCircle className="w-5 h-5" />
                    Login to Contact Farmer
                </button>
            </div>
        );
    }

    if (!isBuyer) {
        return (
            <div className={`p-4 bg-gray-100 rounded-lg text-center ${className}`}>
                <p className="text-gray-600">Only buyers can contact farmers</p>
            </div>
        );
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Primary Contact Button */}
            <button
                onClick={handleContactClick}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Starting Chat...
                    </>
                ) : (
                    <>
                        <MessageCircle className="w-5 h-5" />
                        Chat with Farmer
                    </>
                )}
            </button>

            {/* Alternative Contact Methods */}
            <div className="flex gap-2">
                {farmer.phone && (
                    <button
                        onClick={handlePhoneClick}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        title={`Call ${farmer.phone}`}
                    >
                        <Phone className="w-4 h-4" />
                        <span className="hidden sm:inline">Call</span>
                    </button>
                )}

                {farmer.email && (
                    <button
                        onClick={handleEmailClick}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        title={`Email ${farmer.email}`}
                    >
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Email</span>
                    </button>
                )}
            </div>

            {/* Farmer Info Card */}
            <div className="bg-gray-50 rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-800 mb-2">Farmer Information</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-gray-800">{farmer.name || 'Not provided'}</span>
                    </div>

                    {farmer.location && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600">Location:</span>
                            <span className="text-gray-800">{farmer.location}</span>
                        </div>
                    )}

                    {farmer.experience && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600">Experience:</span>
                            <span className="text-gray-800">{farmer.experience} years</span>
                        </div>
                    )}

                    {farmer.rating && (
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-600">Rating:</span>
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <span
                                        key={i}
                                        className={`text-sm ${i < Math.floor(farmer.rating)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                    >
                                        ★
                                    </span>
                                ))}
                                <span className="ml-1 text-gray-600">({farmer.rating}/5)</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Message Templates */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-700 font-medium mb-2">Quick message ideas:</p>
                <ul className="text-xs text-blue-600 space-y-1">
                    <li>• "Hi! I'm interested in your {product.name}. Is it still available?"</li>
                    <li>• "What's the minimum order quantity for this product?"</li>
                    <li>• "Can you provide more details about the quality and freshness?"</li>
                    <li>• "Are you willing to negotiate on the price for bulk orders?"</li>
                </ul>
            </div>
        </div>
    );
}