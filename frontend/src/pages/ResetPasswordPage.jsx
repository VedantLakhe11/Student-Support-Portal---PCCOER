import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ArrowLeft, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import toast from 'react-hot-toast';

const resetSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid campus email address' }).min(1, { message: 'Email is required' }),
  code: z.string().min(1, { message: 'Security reset code is required' }),
  password: z.string().min(6, { message: 'New Password must be at least 6 characters' }),
});

const ResetPasswordPage = () => {
  const { requestResetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  // Pre-fill parameters if arriving from the forgot-password flow
  const initialEmail = location.state?.email || '';
  const initialCode = location.state?.code || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: initialEmail,
      code: initialCode,
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await requestResetPassword(data.email, data.code, data.password);

      if (res.success) {
        toast.success('Your password has been successfully updated!');
        navigate('/login', { replace: true });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Failed to update password. Please verify the reset code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-6 relative font-sans">
      {/* Glow ball */}
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[450px] p-8 md:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 select-none">
          <img src="/pccoerimg.jpeg" alt="PCCOER Logo" className="h-10 w-10 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="font-black text-lg text-slate-900 dark:text-white leading-tight">PCCOER</span>
            <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest leading-none mt-0.5">CampusCare</span>
          </div>
        </Link>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Reset Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit your security token to define a new password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          {/* Email */}
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
                  errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                } rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-orange-500/20`}
                placeholder="you@college.edu"
                {...register('email')}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <span className="block text-[11px] text-red-500 font-bold mt-1 text-left">{errors.email.message}</span>
            )}
          </div>

          {/* Reset Security Code */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
              Reset Token Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Key className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                className={`w-full bg-white dark:bg-slate-900/60 border ${
                  errors.code ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                } rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-orange-500/20 font-mono tracking-widest`}
                placeholder="TOKENCODE"
                {...register('code')}
                disabled={loading}
              />
            </div>
            {errors.code && (
              <span className="block text-[11px] text-red-500 font-bold mt-1 text-left">{errors.code.message}</span>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                className={`w-full bg-white dark:bg-slate-900/60 border ${
                  errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                } rounded-2xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-4 focus:ring-orange-500/20`}
                placeholder="••••••••"
                {...register('password')}
                disabled={loading}
              />
            </div>
            {errors.password && (
              <span className="block text-[11px] text-red-500 font-bold mt-1 text-left">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg disabled:opacity-75"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Update Password
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="w-full mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/40 text-center">
          <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Recovery
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
