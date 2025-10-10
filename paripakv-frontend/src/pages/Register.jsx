import { useState, useEffect } from 'react';
import { Tractor, UserPlus, Mail, Lock, User, Phone, CreditCard, Eye, EyeOff, MapPin, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        mobile: '',
        aadhaar: '',
        role: 'FARMER',
        authProvider: 'LOCAL',
        address: '',
        village: '',
        district: '',
        state: '',
        pincode: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Location search states
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleChange = async (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Handle location suggestions for village
        if (name === "village" && value.length > 2) {
            setLocationLoading(true);
            try {
                const res = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=53cb118d16df41d0b048e5c954f567bb&q=${encodeURIComponent(value)}&limit=5&countrycode=in&language=en`);
                const data = await res.json();
                const villageSuggestions = data.results.map(result => ({
                    formatted: result.formatted,
                    components: result.components
                }));
                setSuggestions(villageSuggestions);
                setShowSuggestions(true);
            } catch (err) {
                console.error("Location fetch error:", err);
                setSuggestions([]);
            } finally {
                setLocationLoading(false);
            }
        }

        // Hide suggestions if input is too short
        if (name === "village" && value.length <= 2) {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        const components = suggestion.components;

        setFormData((prev) => ({
            ...prev,
            village: components.village || components.town || components.city || '',
            district: components.state_district || components.county || '',
            state: components.state || '',
            pincode: components.postcode || ''
        }));

        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const formDataToSend = new FormData();
            formDataToSend.append(
                "users",
                new Blob([JSON.stringify(formData)], { type: "application/json" })
            );

            if (profileImage) {
                formDataToSend.append("profileImage", profileImage);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/register`,
                formDataToSend,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setMessage(`🎉 ${response.data.message}`);

            // Navigate to login after success

            navigate('/login');

        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setMessage(`❌ ${err.response.data.message}`);
            } else if (err.message === "Network Error") {
                setMessage("❌ Network error. Please check your connection.");
            } else {
                setMessage("❌ Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.location-search-container')) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
        console.log(window.location.href);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 flex flex-col relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse" style={{ animationDelay: '2000ms' }}></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-lime-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse" style={{ animationDelay: '4000ms' }}></div>
            </div>

            {/* Navbar */}
            <Header />

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="bg-gradient-to-br from-green-200 via-blue-50 to-yellow-400 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/50 transition-all duration-300">
                    <h2 className="text-3xl font-bold text-green-600 mb-3 text-center">{t('createAccount')} 🌾</h2>
                    <p className="text-sm text-green-700 mb-8 text-center">Join Paripak as a Farmer, Buyer, or Transporter</p>

                    {/* Message display */}
                    {message && (
                        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded shadow-lg transition-all duration-300 ${message.startsWith("🎉") ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                            {message}
                        </div>
                    )}

                    {/* Google button */}
                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {t('continueWithGoogle')}
                    </button>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-green-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-green-700 rounded-full">{t('orRegisterWithEmail')}</span>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('fullName')}</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                    required
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('email')}</label>
                            <div className="relative flex items-center group">
                                <Mail className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                    required
                                    placeholder="john.doe@example.com"
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('mobile')}</label>
                            <div className="relative flex items-center group">
                                <Phone className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                    required
                                    placeholder="1234567890"
                                    pattern="[0-9]{10}"
                                />
                            </div>
                        </div>

                        {/* Aadhaar Number */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('aadhaar')}</label>
                            <div className="relative flex items-center group">
                                <CreditCard className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="text"
                                    name="aadhaar"
                                    value={formData.aadhaar}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                    required
                                    placeholder="XXXX-XXXX-XXXX"
                                    pattern="[0-9]{12}"
                                    maxLength="12"
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">Role</label>
                            <div className="relative flex items-center group">
                                <div className="absolute left-3 text-green-600 w-5 h-5 pointer-events-none z-10">
                                    {formData.role === 'FARMER' && '🌾'}
                                    {formData.role === 'BUYER' && '🛒'}
                                    {formData.role === 'TRANSPORTER' && '🚛'}
                                </div>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-10 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none text-green-600 appearance-none transition-all duration-200"
                                    required
                                >
                                    <option value="FARMER">{t('farmer')}</option>
                                    <option value="BUYER">{t('buyer')}</option>
                                    <option value="TRANSPORTER">{t('transporter')}</option>
                                </select>
                                <div className="absolute right-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Password with Toggle */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('password')}</label>
                            <div className="relative flex items-center group">
                                <Lock className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200 z-10" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-12 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                    required
                                    placeholder="••••••••"
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-green-600/70 hover:text-green-700 transition-colors duration-200 z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('address')}</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House No, Street"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Village with Location Search */}
                        <div className="space-y-1.5 location-search-container">
                            <label className="block text-sm font-semibold text-green-600">{t('village')}</label>
                            <div className="relative">
                                <div className="relative flex items-center group">
                                    <MapPin className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200 z-10" />
                                    <input
                                        type="text"
                                        name="village"
                                        value={formData.village}
                                        onChange={handleChange}
                                        placeholder="Start typing village name..."
                                        className="w-full pl-12 pr-10 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                        required
                                        autoComplete="off"
                                    />
                                    {locationLoading && (
                                        <Loader2 className="absolute right-3 w-5 h-5 text-green-600 animate-spin" />
                                    )}
                                </div>

                                {/* Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg border border-green-200 max-h-60 overflow-y-auto z-50">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors duration-150 border-b border-green-100 last:border-b-0 flex items-start gap-2"
                                            >
                                                <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                                                <span className="text-sm text-green-600">{suggestion.formatted}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* District */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('district')}</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder="District"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* State */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('state')}</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Pincode */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">{t('pincode')}</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="e.g. 400001"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-600 transition-all duration-200"
                                required
                                pattern="[0-9]{6}"
                                maxLength="6"
                            />
                        </div>

                        {/* Profile Image Upload */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-600">Profile Image</label>
                            <div className="relative flex items-center group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProfileImage(e.target.files[0])}
                                    className="w-full pl-3 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none text-green-600 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-600/20 hover:shadow-xl ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    {t('createAccount')}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer text */}
                    <p className="text-sm text-center mt-6 text-green-700">
                        {t('alreadyHaveAccount')}{' '}
                        <a href="/login" className="text-green-600 font-semibold hover:text-green-900 transition-colors duration-200">
                            {t('signin')}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}