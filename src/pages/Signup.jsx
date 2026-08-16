import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ── Client-side validation ──
        if (!form.name.trim()) {
            toast.warning('Full name is required');
            return;
        }
        if (form.name.trim().length < 2) {
            toast.warning('Name must be at least 2 characters');
            return;
        }
        if (!form.email.trim()) {
            toast.warning('Email address is required');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            toast.warning('Please enter a valid email address');
            return;
        }
        if (!form.password) {
            toast.warning('Password is required');
            return;
        }
        if (form.password.length < 6) {
            toast.warning('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/signup', form);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
            toast.success(`Account created. Welcome, ${data.name}`);
            navigate('/home');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* Left brand panel */}
            <div className="hidden lg:flex lg:w-2/5 bg-slate-900 flex-col justify-between p-12">
                <span className="text-white text-lg font-bold tracking-tight">DevManager</span>
                <div>
                    <h2 className="text-white text-3xl font-bold leading-snug mb-4">
                        Get started in<br />under a minute.
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Create your account and immediately start managing your items
                        with secure, token-based authentication.
                    </p>
                </div>
                <p className="text-slate-600 text-xs">WebDev Backend Course &copy; 2026</p>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-sm">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
                        <p className="text-slate-500 text-sm mt-1">Fill in the details below to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Full name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                required
                                autoComplete="name"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Minimum 6 characters"
                                required
                                autoComplete="new-password"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
