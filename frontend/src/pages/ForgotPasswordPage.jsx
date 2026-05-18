import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Clipboard } from 'lucide-react';
import toast from 'react-hot-toast';

const forgotSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid campus email address' }).min(1, { message: 'Email is required' }),
});

const ForgotPasswordPage = () => {
  const { requestForgotPassword } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [resetCode, setResetCode] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await requestForgotPassword(data.email);

      if (res.success) {
        toast.success('Reset code generated successfully!');
        if (res.code) {
          setResetCode({ code: res.code, email: data.email });
        }
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Could not submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCodeToClipboard = () => {
    if (resetCode) {
      navigator.clipboard.writeText(resetCode.code);
      toast.success('Reset code copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-6 relative font-sans">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[450px] p-8 md:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 select-none">
          <img src="/pccoerimg.jpeg" alt="PCCOER Logo" className="h-10 w-10 rounded-full object-cover" />
          <div className="flex flex-col">
            <span className="font-black text-lg text-slate-900 dark:text-white leading-tight">PCCOER</span>
            <span className="text-[9px] text-orange-500 font-bold uppercase tracking-widest leading-none mt-0.5">CampusCare</span>
          </div>
        </Link>

        {/* Form content */}
        {!resetCode ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Recover Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your college email address to request a security reset code.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg disabled:opacity-75"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Request Reset Code
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="w-full text-center space-y-6">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="h-8 w-8 animate-bounce-slow" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Code Generated!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A secure password recovery code has been generated for your account. Copy it below to reset.
              </p>
            </div>

            {/* Code presentation card */}
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-between gap-4">
              <div className="text-left font-mono">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Reset Security Code</span>
                <span className="text-xl font-bold tracking-widest text-slate-800 dark:text-white select-all">{resetCode.code}</span>
              </div>
              <button
                onClick={copyCodeToClipboard}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:scale-105 transition-all shadow-sm"
              >
                <Clipboard className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => navigate('/reset-password', { state: { email: resetCode.email, code: resetCode.code } })}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg"
            >
              Proceed to Reset
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="w-full mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/40 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-orange-500 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
