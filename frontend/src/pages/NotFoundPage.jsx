import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-6 relative">
      {/* Glow ball */}
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-[480px] p-8 md:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl text-center space-y-6 flex flex-col items-center">
        {/* Animated warning icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="bg-brand-50 dark:bg-brand-950/20 p-4.5 rounded-3xl text-brand-600 dark:text-brand-400 shadow-md shadow-brand-500/5 border border-brand-100/50 dark:border-brand-900/30"
        >
          <ShieldAlert className="h-12 w-12 stroke-[1.5]" />
        </motion.div>

        {/* Big 404 Header */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tight text-slate-800 dark:text-white">
            404
          </h1>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">
            Route Destination Not Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            The link you attempted to navigate to does not exist or has been relocated by college server administrators.
          </p>
        </div>

        {/* Action Button redirects */}
        <div className="pt-2 w-full">
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all duration-200"
          >
            <Home className="h-4.5 w-4.5" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
