import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Tractor, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
    const query = useQuery();
    const token = query.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Check if token exists on component mount
    useEffect(() => {
        if (!token) {
            setMessage('Invalid or missing reset token. Please request a new password reset.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setMessage('Invalid or missing reset token. Please request a new password reset.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/reset-password`, {
                token,
                newPassword: password
            });
            alert(res.data);
            navigate('/login');
        } catch (err) {
            setMessage(err.response?.data || 'Reset failed. Please try again.');
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
                        className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 text-green-800 font-medium backdrop-blur-lg flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 flex items-center justify-center p-6 relative z-10">
                <div className="bg-gradient-to-br from-green-200 via-blue-50 to-yellow-400 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md border border-white hover:bg-white/85 transition-all duration-300">
                    <h2 className="text-3xl font-bold text-green-800 mb-3 text-center">Set New Password 🔑</h2>
                    <p className="text-sm text-green-700 mb-8 text-center">
                        Create a strong password to secure your Paripak account
                    </p>

                    {/* Enhanced alert message styling */}
                    {message && (
                        <div className={`p-4 rounded-xl mb-6 backdrop-blur-sm border transition-all duration-300 ${message.includes('success') || message.includes('successfully')
                            ? 'bg-green-100/80 text-green-800 border-green-300/50 shadow-sm'
                            : 'bg-red-100/80 text-red-800 border-red-300/50 shadow-sm'
                            }`}>
                            <div className="flex items-center gap-2">
                                {message.includes('success') || message.includes('successfully') ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
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
                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">New Password</label>
                            <div className="relative flex items-center group">
                                <Lock className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="Enter new password"
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-green-600/70 hover:text-green-700 transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-green-600">Password must be at least 6 characters long</p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="block text-sm font-semibold text-green-800">Confirm New Password</label>
                            <div className="relative flex items-center group">
                                <Lock className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 text-green-600/70 hover:text-green-700 transition-colors duration-200"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Password match indicator */}
                            {confirmPassword && (
                                <p className={`text-xs transition-colors duration-200 ${password === confirmPassword ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading || !token}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-600/20 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Updating Password...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Reset Password</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Additional footer links */}
                    <div className="mt-6 space-y-2">
                        <p className="text-sm text-center text-green-700">
                            Remember your password?{' '}
                            <Link to="/login" className="text-green-800 font-semibold hover:text-green-900 transition-colors duration-200">
                                Sign In
                            </Link>
                        </p>
                        <p className="text-sm text-center">
                            <Link to="/forgot-password" className="text-green-700 hover:text-green-800 transition-colors duration-200">
                                Need another reset link?
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}