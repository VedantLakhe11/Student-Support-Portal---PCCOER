import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect target (defaults to /dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  // Handle Login Submissions
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Basic Validations
    if (!email || !password) {
      return toast.error('Please enter all credentials');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      const res = await login(email, password);

      if (res.success) {
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(from, { replace: true });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('An unexpected login error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-6 relative">
      {/* Background glow ball */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main glass visual panel */}
      <div className="w-full max-w-[450px] p-8 md:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {/* Brand identity logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 select-none">
          <img
            src="/pccoerimg.jpeg"
            alt="PCCOER Logo"
            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight">
              PCCOER
            </span>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5">
              Support Portal
            </span>
          </div>
        </Link>

        {/* Headings */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your campus management system
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Email input field */}
          <div>
            <label className="custom-label">Campus Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                required
                className="custom-input pl-11"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password input field */}
          <div>
            <label className="custom-label">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="custom-input pl-11 pr-11"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/25 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200 mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Helper footer */}
        <p className="text-sm text-slate-500 dark:text-slate-450 mt-8">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
