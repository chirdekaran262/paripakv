import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Tractor, LogIn, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import googleIcon from '../assets/google.svg';
<<<<<<< HEAD

=======
import { useTranslation } from 'react-i18next';
>>>>>>> new-feature
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
<<<<<<< HEAD
=======
    const { t } = useTranslation();
>>>>>>> new-feature

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
<<<<<<< HEAD
            const res = await axios.post(`https://paripakv.onrender.com/users/login`, { email, password });
=======
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, { email, password });
>>>>>>> new-feature
            // Check if token exists in response
            if (!res.data) {
                throw new Error('Token not received from server');
            }

            login(res.data);
            navigate('/listings');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed. Please try again.');
        }
    };
    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/oauth2/authorization/google`;
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
<<<<<<< HEAD
                        <span className="text-green-800">Paripak</span>
=======
                        <span className="text-green-800">{t('appName')}</span>
>>>>>>> new-feature
                    </h1>
                    <Link
                        to="/register"
                        className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 text-green-800 font-medium backdrop-blur-lg"
                    >
<<<<<<< HEAD
                        Create Account
=======
                        {t('createAccount')}
>>>>>>> new-feature
                    </Link>
                </div>
            </nav>

            {/* Main content */}
            <div className="flex-1 bg-gradient-to-r from-green-600 via-lime-400 to-yellow-300 flex items-center justify-center p-6 relative z-10">
                <div className="bg-gradient-to-br from-green-200 via-blue-50 to-yellow-400 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md border border-white hover:bg-white/85 transition-all duration-300">
<<<<<<< HEAD
                    <h2 className="text-3xl font-bold text-green-800 mb-3 text-center">Welcome Back 👋</h2>
                    <p className="text-sm text-green-700 mb-8 text-center">Login to access your Paripak account</p>
=======
                    <h2 className="text-3xl font-bold text-green-800 mb-3 text-center">{t('welcome')} 👋</h2>
                    <p className="text-sm text-green-700 mb-8 text-center">{t('loginToAccount')}</p>
>>>>>>> new-feature

                    {/* Google button */}
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full bg-white/90 hover:bg-white hover:text-black border border-white/50 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm hover:shadow"
                    >
                        <img src={googleIcon} alt="Google" className="w-5 h-5" />
<<<<<<< HEAD
                        Continue with Google
=======
                        {t('continueWithGoogle')}
>>>>>>> new-feature
                    </button>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-green-400"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
<<<<<<< HEAD
                            <span className="px-4 bg-white  text-green-900 rounded-full">Or sign in with email</span>
=======
                            <span className="px-4 bg-white  text-green-900 rounded-full">{t('orRegisterWithEmail')}</span>
>>>>>>> new-feature
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-1.5">
<<<<<<< HEAD
                            <label className="block text-sm font-semibold text-green-800">Email Address</label>
=======
                            <label className="block text-sm font-semibold text-green-800">{t('email')}</label>
>>>>>>> new-feature
                            <div className="relative flex items-center group">
                                <Mail className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="you@paripak.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
<<<<<<< HEAD
                            <label className="block text-sm font-semibold text-green-800">Password</label>
=======
                            <label className="block text-sm font-semibold text-green-800">{t('password')}</label>
>>>>>>> new-feature
                            <div className="relative flex items-center group">
                                <Lock className="absolute left-3 text-green-600/70 w-5 h-5 group-hover:text-green-700 transition-colors duration-200" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 bg-white/60 hover:bg-white/80 focus:bg-white/95 border border-white/50 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-transparent outline-none placeholder-green-600/50 text-white-800 transition-all duration-200"
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-600/20 hover:shadow-xl"
                        >
                            <LogIn className="w-5 h-5" />
<<<<<<< HEAD
                            Sign In
=======
                            {t('signin')}
>>>>>>> new-feature
                        </button>
                    </form>

                    <div className="mt-6 space-y-2">
                        <p className="text-sm text-center text-green-700">
<<<<<<< HEAD
                            Don't have an account?{' '}
                            <Link to="/register" className="text-green-800 font-semibold hover:text-green-900 transition-colors duration-200">
                                Create Account
=======
                            {t('dontHaveAccount')}{' '}
                            <Link to="/register" className="text-green-800 font-semibold hover:text-green-900 transition-colors duration-200">
                                {t('createAccount')}
>>>>>>> new-feature
                            </Link>
                        </p>
                        <p className="text-sm text-center">
                            <Link to="/forgot-password" className="text-green-700 hover:text-green-800 transition-colors duration-200">
<<<<<<< HEAD
                                Forgot Password?
=======
                                {t('forgotPassword')}
>>>>>>> new-feature
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
