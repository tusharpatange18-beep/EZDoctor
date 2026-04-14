import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/common/Toast';
import { loginUser } from '../api/auth';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast, toasts, removeToast } = useToast();

    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const API = import.meta.env.VITE_API_BASE;
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Login failed');
                setLoading(false);
                return;
            }

            login(data.token, data.user);
            showToast(`Welcome back, ${data.user.name}!`, 'success');

            setTimeout(() => {
                if (data.user.role === 'doctor') navigate('/doctor-dashboard');
                else if (data.user.role === 'admin') navigate('/admin');
                else navigate('/home');
            }, 600);
        } catch (err) {
            setError('Server error. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    // Quick demo login helpers
    const quickLogin = (email, password) => {
        setForm({ email, password });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back</h1>
                        <p className="text-sm text-gray-500 mt-1">Sign in to EZDoc</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Demo quick login */}
                    <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Demo Quick Login</p>
                        <div className="flex gap-2 mb-2">
                            <button
                                type="button"
                                onClick={() => quickLogin('patient@demo.com', 'demo123')}
                                className="flex-1 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg font-semibold hover:bg-orange-200 transition"
                            >
                                Patient Demo
                            </button>
                            <button
                                type="button"
                                onClick={() => quickLogin('doctor@demo.com', 'demo123')}
                                className="flex-1 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition"
                            >
                                Doctor Demo
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => { sessionStorage.clear(); window.location.reload(); }}
                            className="w-full py-1 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition font-medium border border-transparent hover:border-red-100"
                        >
                            Reset Session (clear stale login)
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition disabled:opacity-60 shadow-lg shadow-red-200 text-sm"
                        >
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-red-600 font-semibold hover:underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
