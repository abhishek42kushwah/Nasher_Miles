import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error, token } = useSelector((state) => state.auth);

    useEffect(() => {
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [token, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ Work_Email: email, Password: password }));
    };

    return (
        <div className="w-full max-w-[480px] flex flex-col gap-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center size-10 shadow-sm overflow-hidden">
                    <img src="/d-tab-logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Enterprise ERP</h1>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base">
                    Please enter your credentials to access your dashboard.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Email Field */}
                <label className="flex flex-col gap-1.5">
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-normal">Email</span>
                    <div className="relative group">
                        <input
                            className="form-input flex w-full rounded-lg text-slate-900 dark:text-white dark:bg-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 focus:border-primary h-12 px-4 placeholder:text-slate-400 text-base font-normal transition-all"
                            placeholder="e.g. admin@company.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                    </div>
                </label>

                {/* Password Field */}
                <label className="flex flex-col gap-1.5">
                    <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold leading-normal">Password</span>
                    <div className="relative flex w-full items-stretch group">
                        <input
                            className="form-input flex w-full rounded-lg text-slate-900 dark:text-white dark:bg-slate-900 focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-200 dark:border-slate-700 focus:border-primary h-12 px-4 placeholder:text-slate-400 text-base font-normal transition-all"
                            placeholder="Enter your password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                        </div>
                    </div>
                </label>

                {/* Remember & Forgot Password */}
                <div className="flex items-center justify-between mt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input className="form-checkbox w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary/50 focus:ring-offset-0 cursor-pointer" type="checkbox" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Remember me</span>
                    </label>
                    <a className="text-sm font-bold text-primary hover:text-blue-700 transition-colors" href="#">Forgot password?</a>
                </div>

                {/* Login Button */}
                <button
                    disabled={isLoading}
                    className="mt-4 flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white text-base font-bold leading-normal tracking-wide transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                    type="submit"
                >
                    <span className="truncate">{isLoading ? 'Signing In...' : 'Sign In'}</span>
                    {!isLoading && <span className="material-symbols-outlined ml-2 text-sm font-bold">arrow_forward</span>}
                </button>
            </form>

            {/* Footer Note */}
            <div className="flex flex-col items-center gap-4 mt-4">
                <p className="text-slate-400 text-xs text-center max-w-xs leading-relaxed">
                    Protected by enterprise-grade security. <br />
                    By logging in, you agree to our <a className="underline hover:text-primary" href="/terms">Terms of Service</a> and <a className="underline hover:text-primary" href="/privacy">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
};

export default LoginForm;
