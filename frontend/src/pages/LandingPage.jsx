import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Clock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 overflow-hidden flex flex-col">
      {/* Header bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-brand-600 to-indigo-500 p-2.5 rounded-xl text-white shadow-md shadow-brand-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            UniResolve
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-xl transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main hero segment */}
      <main className="flex-1 flex flex-col justify-center relative px-6 z-10 max-w-7xl mx-auto w-full py-12 md:py-24">
        {/* Glow rings in background */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

        <div className="grid md:grid-cols-12 gap-12 items-center">
          {/* Left Hero copy */}
          <div className="md:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/60 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 border border-brand-200/40 dark:border-brand-900/30 text-xs font-bold uppercase tracking-wider"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              Smarter Campus Resolution
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-white leading-[1.1]"
            >
              Resolving Campus Issues{' '}
              <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
                Instantly & Safely.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-xl"
            >
              UniResolve is a state-of-the-art campus ticket system. Submit utility, facility, or Wi-Fi complaints with images, track resolution live on a modern dashboard, and let college admins resolve them efficiently.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/register"
                className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl shadow-brand-500/25 hover:shadow-2xl transition-all duration-200 text-base"
              >
                File a Complaint
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-350 font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 text-base"
              >
                Admin Panel
              </Link>
            </motion.div>
          </div>

          {/* Right Hero Graphic: Glass Cards */}
          <div className="md:col-span-5 relative flex justify-center items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-[380px] p-6 rounded-3xl border border-white/20 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl relative"
            >
              {/* Floating Ticket Stat overlay */}
              <div className="absolute -left-6 top-10 bg-emerald-500 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-xs font-bold animate-pulse-slow">
                <CheckCircle className="h-4 w-4" />
                Ticket Resolved in 2 hrs!
              </div>

              {/* Second floating overlay */}
              <div className="absolute -right-6 bottom-12 bg-amber-500 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 text-xs font-bold">
                <Clock className="h-4 w-4" />
                Action: In Progress
              </div>

              {/* Sample Ticket preview inside card */}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Live Ticket Preview
                </span>
                <div className="h-28 rounded-2xl bg-gradient-to-tr from-brand-100 to-indigo-100/50 dark:from-slate-800 dark:to-brand-950/20 border border-slate-200/50 dark:border-slate-800/40 flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <ShieldCheck className="h-10 w-10 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
                    Chemistry Lab AC Leaking
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    AC unit in room 201 is leaking water on electrical power plug socket. Urgent resolution needed.
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-[10px] bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                    Electricity
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    2 mins ago
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer segment */}
      <footer className="py-6 border-t border-slate-200/40 dark:border-slate-900/60 mt-auto px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <p>© 2026 UniResolve Inc. Built for digital campus administration.</p>
          <div className="flex gap-4 mt-2 sm:mt-0 font-medium">
            <span className="hover:text-brand-500 cursor-pointer">Security Standards</span>
            <span className="hover:text-brand-500 cursor-pointer">Privacy Guidelines</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
