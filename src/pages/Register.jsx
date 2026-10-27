import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/common/Toast';
import { registerUser } from '../api/auth';

const Register = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast, toasts, removeToast } = useToast();

    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { ok, data } = await registerUser(form);

            if (!ok) {
                setError(data.message || 'Registration failed');
                setLoading(false);
                return;
            }

            login(data.token, data.user);
            showToast('Account created! Redirecting...', 'success');

            setTimeout(() => {
                navigate(data.user.role === 'doctor' ? '/doctor-dashboard' : '/home');
            }, 800);
        } catch {
            setError('Server error. Please try again.');
        } finally {
            setLoading(false);
        }
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
                        <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
                        <p className="text-sm text-gray-500 mt-1">Join EZDoc Emergency Network</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div role="alert" className="mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                <input
                                    type="text"
                                    id="register-name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                <input
                                    type="email"
                                    id="register-email"
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
                            <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                <input
                                    type="password"
                                    id="register-password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Min 6 characters"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Role */}
                        <fieldset>
                            <legend className="block text-sm font-medium text-gray-700 mb-1">I am a...</legend>
                            <div className="grid grid-cols-2 gap-3">
                                {['patient', 'doctor'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        aria-pressed={form.role === r}
                                        onClick={() => setForm(prev => ({ ...prev, role: r }))}
                                        className={`py-3 rounded-xl border-2 font-semibold text-sm capitalize transition-all
                                            ${form.role === r
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-200 bg-white text-gray-500 hover:border-red-200'}`}
                                    >
                                        {r === 'patient' ? 'Patient' : 'Doctor'}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition disabled:opacity-60 shadow-lg shadow-red-200 text-sm"
                        >
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-red-600 font-semibold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
