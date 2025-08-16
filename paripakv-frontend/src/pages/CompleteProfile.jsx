import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Tractor, Phone, CreditCard, MapPin, Building, Flag, Hash, UserCheck, ArrowRight } from 'lucide-react';
import Cookies from 'js-cookie';

export default function CompleteProfile() {
    const [formData, setFormData] = useState({
        mobile: '',
        aadhaar: '',
        address: '',
        village: '',
        district: '',
        state: '',
        pincode: '',
        role: 'FARMER' // Changed from role to userRole to match backend
    });
    const [profileImage, setProfileImage] = useState(null);


    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const token = Cookies.get("token");


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        console.log('Submitting profile with token:', token);


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

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/users/complete-profile`,
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );


            setMessage('Profile completed successfully! Redirecting...');
            alert('Profile completed successfully! Redirecting...');
            setTimeout(() => {
                navigate('/listings');
                window.location.reload(); // Reload to ensure the new profile is reflected
            }, 1500);
        } catch (err) {
            console.error('Profile update error:', err);
            setMessage(err.response?.data?.message || err.response?.data || 'Profile update failed. Please try again.');
            alert("Profile update failed. Please try again.")
        } finally {
            setIsLoading(false);
        }
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
                        <span className="text-green-800">Paripak</span>
                    </h1>
                    <Link
                        to="/login"
                        className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 text-green-800 font-medium backdrop-blur-lg"
                    >
                        Sign Out
                    </Link>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="bg-gradient-to-br from-green-200 via-blue-50 to-yellow-400 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-lg border border-white hover:bg-white/85 transition-all duration-300">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <UserCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-green-800 mb-3">Complete Your Profile 📋</h2>
                        <p className="text-sm text-green-700">
                            We need a few more details to set up your Paripak account
                        </p>
                    </div>

                    {/* Enhanced alert message styling */}
                    {message && (
                        <div className={`p-4 rounded-xl mb-6 backdrop-blur-sm border transition-all duration-300 ${message.includes('successfully') || message.includes('success')
                            ? 'bg-green-100/80 text-green-800 border-green-300/50 shadow-sm'
                            : 'bg-red-100/80 text-red-800 border-red-300/50 shadow-sm'
                            }`}>
                            <div className="flex items-center gap-2">
                                {message.includes('successfully') || message.includes('success') ? (
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                )}
                                <span className="font-medium text-sm">{message}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Mobile Number */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">Mobile Number</label>
                            <div className="relative flex items-center group">
                                <Phone className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="tel"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-800 transition-all duration-200"
                                    required
                                    placeholder="1234567890"
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit mobile number"
                                />
                            </div>
                        </div>

                        {/* Aadhaar Number */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">Aadhaar Number</label>
                            <div className="relative flex items-center group">
                                <CreditCard className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="text"
                                    name="aadhaar"
                                    value={formData.aadhaar}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-800 transition-all duration-200"
                                    required
                                    placeholder="XXXX-XXXX-XXXX"
                                    pattern="[0-9]{12}"
                                    title="Please enter a valid 12-digit Aadhaar number"
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">Select Role</label>
                            <div className="relative flex items-center group">
                                <div className="absolute left-3 text-green-800 w-5 h-5 pointer-events-none">
                                    {formData.role === 'FARMER' && '🌾'}
                                    {formData.role === 'BUYER' && '🛒'}
                                    {formData.role === 'TRANSPORTER' && '🚛'}
                                </div>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-10 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none text-green-800 appearance-none transition-all duration-200"
                                    required
                                >
                                    <option value="FARMER" className="py-2 text-green-800">Farmer</option>
                                    <option value="BUYER" className="py-2 text-green-800">Buyer</option>
                                    <option value="TRANSPORTER" className="py-2 text-green-800">Transporter</option>
                                </select>
                                <div className="absolute right-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">Address</label>
                            <div className="relative flex items-center group">
                                <MapPin className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-800 transition-all duration-200"
                                    required
                                    placeholder="House No, Street Name"
                                />
                            </div>
                        </div>

                        {/* Village and District - Two columns */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-green-800">Village</label>
                                <div className="relative flex items-center group">
                                    <Building className="absolute left-3 text-green-600/70 w-4 h-4 group-hover:text-green-700 transition-colors duration-200" />
                                    <input
                                        type="text"
                                        name="village"
                                        value={formData.village}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-800 transition-all duration-200"
                                        required
                                        placeholder="Village"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-green-800">District</label>
                                <div className="relative flex items-center group">
                                    <Building className="absolute left-3 text-green-600/70 w-4 h-4 group-hover:text-green-700 transition-colors duration-200" />
                                    <input
                                        type="text"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-800 transition-all duration-200"
                                        required
                                        placeholder="District"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* State and Pincode - Two columns */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-green-800">State</label>
                                <div className="relative flex items-center group">
                                    <Flag className="absolute left-3 text-green-600/70 w-4 h-4 group-hover:text-green-700 transition-colors duration-200" />
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-800 transition-all duration-200"
                                        required
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-green-800">Pincode</label>
                                <div className="relative flex items-center group">
                                    <Hash className="absolute left-3 text-green-600/70 w-4 h-4 group-hover:text-green-700 transition-colors duration-200" />
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-green-800 transition-all duration-200"
                                        required
                                        placeholder="400001"
                                        pattern="[0-9]{6}"
                                        title="Please enter a valid 6-digit pincode"
                                    />
                                </div>
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
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-600/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 mt-8"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Completing Profile...</span>
                                </>
                            ) : (
                                <>
                                    <UserCheck className="w-5 h-5" />
                                    <span>Complete Profile</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Progress indicator */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-green-600/80">
                            Step 2 of 2 - Complete your profile to access all features
                        </p>
                        <div className="w-full bg-green-200/50 rounded-full h-2 mt-2">
                            <div className="bg-green-600 h-2 rounded-full w-full transition-all duration-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}