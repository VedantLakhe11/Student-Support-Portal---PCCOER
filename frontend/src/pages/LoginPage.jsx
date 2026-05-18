import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. Zod Validation Schema
const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid campus email address' })
    .min(1, { message: 'Email is required' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. React Hook Form hook
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Get redirect target (defaults to /dashboard)
  const from = location.state?.from?.pathname || '/dashboard';

  // Handle Login Submissions
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await login(data.email, data.password);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-6 relative font-sans">
      {/* Background glow ball */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none" />

      {/* Main glass visual panel */}
      <div className="w-full max-w-[460px] p-8 md:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {/* Brand identity logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 select-none">
          <img
            src="/pccoerimg.jpeg"
            alt="PCCOER Logo"
            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
          />
          <div className="flex flex-col">
            <span className="font-black text-lg text-slate-900 dark:text-white leading-tight">
              PCCOER
            </span>
            <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest leading-none mt-0.5">
              CampusCare
            </span>
          </div>
        </Link>

        {/* Headings */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your university account portal
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          {/* Email input field */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
              Campus Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                className={`w-full bg-white dark:bg-slate-900/60 border ${
                  errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500/20 focus:border-orange-500'
                } rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-4`}
                placeholder="you@college.edu"
                {...register('email')}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <span className="block text-[11px] text-red-500 font-bold mt-1.5 text-left">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password input field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] font-bold text-orange-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full bg-white dark:bg-slate-900/60 border ${
                  errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500/20 focus:border-orange-500'
                } rounded-2xl py-3 pl-11 pr-11 text-sm outline-none transition-all focus:ring-4`}
                placeholder="••••••••"
                {...register('password')}
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
            {errors.password && (
              <span className="block text-[11px] text-red-500 font-bold mt-1.5 text-left">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200 mt-2"
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
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-orange-500 font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
