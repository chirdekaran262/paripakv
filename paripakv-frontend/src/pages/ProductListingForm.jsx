import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
    Package,
    Weight,
    DollarSign,
    MapPin,
    Calendar,
    Loader2,
    CheckCircle,
    AlertCircle,
    Sparkles
} from "lucide-react";
import Header from "../components/Header";

export default function ProductListingForm() {
    const [listing, setListing] = useState({
        name: "",
        quantityKg: "",
        pricePerKg: "",
        villageName: "",
        AvailableDate: ""
    });

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const navigate = useNavigate();

    // Popular crop suggestions
    const popularCrops = [
        "🌾 Wheat", "🌽 Corn", "🍅 Tomato", "🥔 Potato", "🧅 Onion",
        "🥕 Carrot", "🥬 Cabbage", "🥒 Cucumber", "🌶️ Chili", "🍆 Eggplant"
    ];

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setListing((prev) => ({ ...prev, [name]: value }));

        if (name === "villageName" && value.length > 2) {
            setLocationLoading(true);
            try {
                const res = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
                    params: {
                        key: "53cb118d16df41d0b048e5c954f567bb",
                        q: value,
                        limit: 5,
                        countrycode: "in",
                        language: "en"
                    }
                });
                const villageSuggestions = res.data.results.map(result => result.formatted);
                setSuggestions(villageSuggestions);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Location fetch error:", err);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setLocationLoading(false);
            }
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setListing((prev) => ({ ...prev, villageName: suggestion }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleCropSuggestionClick = (crop) => {
        const cleanCrop = crop.split(' ').slice(1).join(' '); // Remove emoji
        setListing((prev) => ({ ...prev, name: cleanCrop }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = Cookies.get("token");

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/listings`, listing, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Success animation delay
            setTimeout(() => {
                alert("✅ Listing Created Successfully!");
                navigate("/");
            }, 1000);
        } catch (error) {
            console.error("Failed to create listing", error);
            alert(error.response?.data?.message || "❌ Failed to create listing");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300">
            <Header />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg">
                                <Package className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-green-800">
                                Create New Listing
                            </h1>
                            <Sparkles className="w-8 h-8 text-yellow-500" />
                        </div>
                        <p className="text-lg text-green-700 max-w-2xl mx-auto">
                            🌱 List your fresh produce and connect with buyers in your area.
                            Fill out the details below to get started!
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-gradient-to-br from-white via-green-50 to-white rounded-3xl shadow-2xl border border-green-200/50 backdrop-blur-sm p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Crop Name Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <Package className="w-5 h-5 text-white" />
                                    </div>
                                    <label className="text-xl font-bold text-green-800">
                                        🌾 What crop are you selling?
                                    </label>
                                </div>

                                <input
                                    type="text"
                                    name="name"
                                    value={listing.name}
                                    onChange={handleChange}
                                    placeholder="Enter crop name (e.g., Organic Tomatoes)"
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none transition-all duration-300 text-lg bg-white/80 backdrop-blur-sm shadow-inner"
                                />

                                {/* Popular Crops Suggestions */}
                                <div className="bg-green-50/50 rounded-2xl p-4 border border-green-200">
                                    <p className="text-sm font-medium text-green-700 mb-3">💡 Popular crops:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {popularCrops.map((crop, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleCropSuggestionClick(crop)}
                                                className="px-3 py-1 bg-white hover:bg-green-100 text-green-700 text-sm rounded-full border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md"
                                            >
                                                {crop}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Quantity & Price Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Quantity */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Weight className="w-5 h-5 text-white" />
                                        </div>
                                        <label className="text-xl font-bold text-green-800">
                                            ⚖️ Quantity Available
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="quantityKg"
                                            value={listing.quantityKg}
                                            onChange={handleChange}
                                            placeholder="100"
                                            min="1"
                                            required
                                            className="w-full px-6 py-4 pr-12 rounded-2xl border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all duration-300 text-lg bg-white/80 backdrop-blur-sm shadow-inner"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-600 font-semibold">kg</span>
                                    </div>
                                    <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-200">
                                        <p className="text-sm text-blue-700">💭 Enter the total quantity you have available for sale</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-white" />
                                        </div>
                                        <label className="text-xl font-bold text-green-800">
                                            💰 Price per Kilogram
                                        </label>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-semibold text-lg">₹</span>
                                        <input
                                            type="number"
                                            name="pricePerKg"
                                            value={listing.pricePerKg}
                                            onChange={handleChange}
                                            placeholder="25"
                                            min="1"
                                            required
                                            className="w-full pl-10 pr-16 py-4 rounded-2xl border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none transition-all duration-300 text-lg bg-white/80 backdrop-blur-sm shadow-inner"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-semibold">/kg</span>
                                    </div>
                                    <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-200">
                                        <p className="text-sm text-emerald-700">💡 Set a competitive price based on market rates</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <MapPin className="w-5 h-5 text-white" />
                                    </div>
                                    <label className="text-xl font-bold text-green-800">
                                        📍 Your Location
                                    </label>
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        name="villageName"
                                        value={listing.villageName}
                                        onChange={handleChange}
                                        placeholder="Start typing your village/city name..."
                                        required
                                        autoComplete="off"
                                        className="w-full px-6 py-4 pr-12 rounded-2xl border-2 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none transition-all duration-300 text-lg bg-white/80 backdrop-blur-sm shadow-inner"
                                    />
                                    {locationLoading && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                                        </div>
                                    )}

                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-20 w-full bg-white border-2 border-purple-200 rounded-2xl shadow-2xl mt-2 max-h-60 overflow-y-auto backdrop-blur-sm">
                                            {suggestions.map((suggestion, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="px-6 py-3 text-gray-800 hover:bg-purple-50 cursor-pointer transition-all duration-200 border-b border-purple-100 last:border-b-0 flex items-center gap-3"
                                                >
                                                    <MapPin className="w-4 h-4 text-purple-500" />
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-purple-50/50 rounded-xl p-3 border border-purple-200">
                                    <p className="text-sm text-purple-700">🗺️ We'll help buyers find your produce by showing your location</p>
                                </div>
                            </div>

                            {/* Available Date */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <label className="text-xl font-bold text-green-800">
                                        📅 When will it be available?
                                    </label>
                                </div>

                                <input
                                    type="date"
                                    name="AvailableDate"
                                    value={listing.AvailableDate}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-orange-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 focus:outline-none transition-all duration-300 text-lg bg-white/80 backdrop-blur-sm shadow-inner"
                                />

                                <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-200">
                                    <p className="text-sm text-orange-700">⏰ Choose the date when your produce will be ready for harvest/delivery</p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-8">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-bold text-xl py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Creating your listing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-6 h-6" />
                                            🚀 Create Listing
                                        </>
                                    )}
                                </button>

                                <div className="mt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 border border-green-200">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <AlertCircle className="w-5 h-5" />
                                        <p className="text-sm font-medium">
                                            💡 <strong>Pro Tip:</strong> High-quality photos and detailed descriptions help sell faster!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Success Message Preview */}
                    <div className="mt-8 text-center">
                        <p className="text-green-600 font-medium">
                            🎉 Ready to connect with buyers and grow your business?
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}