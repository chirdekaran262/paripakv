import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, UserPlus, Mail, Lock, User, Phone, CreditCard } from 'lucide-react';
import googleIcon from '../assets/google.svg'; // Ensure this path is correct
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


    const { t } = useTranslation();
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(null);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();

            // Send all fields as JSON in a single "users" part
            formDataToSend.append(
                "users",
                new Blob([JSON.stringify(formData)], { type: "application/json" })
            );

            // Add file if exists
            if (profileImage) {
                formDataToSend.append("profileImage", profileImage);
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/register`,
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log(response.data);
            alert("🎉 Registration successful!");
            navigate("/login");
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                alert("❌ User already exists. Please login.");
                navigate("/login");
                return;
            } else if (err.response?.status === 400) {
                alert("❌ Invalid data. Please check your inputs.");
                return;
            }
            else if (err.response?.status === 500) {
                alert("❌ Server error. Please try again later.");
                return;
            }
            else if (err.message === "Network Error") {
                alert("❌ Network error. Please check your connection.");
                return;
            }
            else {
                alert("❌ Registration failed");
            }
        }
    };



    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
        console.log(window.location.href);
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 flex flex-col relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-lime-300 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navbar with glassmorphism */}
            <nav className="relative z-10 p-4 bg-white/10 backdrop-blur-lg border-b border-white/20 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        <Tractor className="w-7 h-7 text-green-800" />
                        <span className="text-green-800">{t('appName')}</span>
                    </h1>
                    <Link
                        to="/login"
                        className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 text-green-800 font-medium backdrop-blur-lg"
                    >
                        {t('signin')}
                    </Link>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="bg-gradient-to-br from-green-200 via-blue-50 to-yellow-400 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/50 hover:bg-white/85 transition-all duration-300">
                    <h2 className="text-3xl font-bold text-green-800 mb-3 text-center">{t('createAccount')} 🌾</h2>
                    <p className="text-sm text-green-700 mb-8 text-center">{t('')} Paripak as a Farmer, Buyer, or Transporter</p>

                    {/* Google button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white/90 hover:bg-white border border-white/50 text-white hover:text-black font-medium py-2.5 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow"
                    >
                        <img src={googleIcon} alt="Google" className="w-5 h-5" />
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

                    {/* Form inputs - update all input containers with this pattern */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('fullName')}</label>
                            <div className="relative flex items-center group">
                                <User className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('email')}</label>
                            <div className="relative flex items-center group">
                                <Mail className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="JohnDoe@example.com"
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('mobile')}</label>
                            <div className="relative flex items-center group">
                                <Phone className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>

                        {/* Aadhaar Number */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('aadhaar')}</label>
                            <div className="relative flex items-center group">
                                <CreditCard className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="text"
                                    name="aadhaar"
                                    value={formData.aadhaar}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="XXXX-XXXX-XXXX"
                                />
                            </div>
                        </div>

                        {/* Role Selection specific update */}
                        <div className="">
                            <label className="block text-sm font-semibold text-green-800">{t('')}</label>
                            <div className="relative flex items-center group">
                                <div className="absolute left-3 text-white-800 w-5 h-5 pointer-events-none">
                                    {formData.role === 'FARMER' && '🌾'}
                                    {formData.role === 'BUYER' && '🛒'}
                                    {formData.role === 'TRANSPORTER' && '🚛'}
                                </div>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-10 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none text-white-800 appearance-none transition-all duration-200"
                                    required
                                >
                                    <option value="FARMER" className="py-2 text-white-800">{t('farmer')}</option>
                                    <option value="BUYER" className="py-2 text-white-800">{t('buyer')}</option>
                                    <option value="TRANSPORTER" className="py-2 text-white-800">{t('transporter')}</option>
                                </select>
                                <div className="absolute right-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('password')}</label>
                            <div className="relative flex items-center">
                                <Lock className="absolute left-3 text-green-600/70 w-5 h-5" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('address')}</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="House No, Street"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Village */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('village')}</label>
                            <input
                                type="text"
                                name="village"
                                value={formData.village}
                                onChange={handleChange}
                                placeholder="Village Name"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* District */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('district')}</label>
                            <input
                                type="text"
                                name="district"
                                value={formData.district}
                                onChange={handleChange}
                                placeholder="District"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* State */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('state')}</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Pincode */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">{t('pincode')}</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="e.g. 400001"
                                className="w-full pl-4 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                required
                            />
                        </div>
                        {/* Profile Image Upload */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">Profile Image</label>
                            <div className="relative flex items-center group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setProfileImage(e.target.files[0])}
                                    className="w-full pl-3 pr-4 py-2.5 bg-white/60 hover:bg-white/80 
                 focus:bg-white/95 border border-white/50 rounded-xl 
                 focus:ring-2 focus:ring-green-500/30 focus:border-transparent 
                 outline-none text-green-800 transition-all duration-200 file:mr-4 
                 file:py-2 file:px-4 file:rounded-full file:border-0 
                 file:text-sm file:font-semibold file:bg-green-100 
                 file:text-green-700 hover:file:bg-green-200"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-600/20 hover:shadow-xl"

                        >
                            <UserPlus className="w-5 h-5" />
                            {t('createAccount')}
                        </button>
                    </form>

                    {/* Footer text */}
                    <p className="text-sm text-center mt-6 text-green-700">
                        Already have an account?{' '}
                        <Link to="/login" className="text-green-800 font-semibold hover:text-green-900 transition-colors duration-200">
                        </Link>
                        {t('alreadyHaveAccount')}{' '}
                        <Link to="/login" className="text-green-800 font-semibold hover:text-green-900 transition-colors duration-200">
                            {t('signin')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
