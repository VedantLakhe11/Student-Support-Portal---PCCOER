import React from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  User,
  Mail,
  Shield,
  Clock,
  Sparkles,
  Lock,
  UserCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { user } = useAuth();

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          My Account Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review your credentials, security settings, and registration parameters.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* LEFT CARD: Avatar initials and primary details */}
        <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-5 shadow-sm">
          <div className="relative inline-block mx-auto">
            <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-brand-500/25 border-4 border-white dark:border-slate-950">
              {getInitials(user?.name)}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-950">
              <UserCheck className="h-4 w-4" />
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {user?.name}
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800 inline-block">
              {user?.role} Account
            </span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3.5 text-left text-xs">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Mail className="h-4 w-4 stroke-[1.8]" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Shield className="h-4 w-4 stroke-[1.8]" />
              <span>Role Permissions: Standard {user?.role} rights</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Account details card and security rules */}
        <div className="md:col-span-8 space-y-6">
          {/* Detailed fields card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              General Account Attributes
            </h3>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Complete Name
                </span>
                <span className="block font-semibold text-slate-700 dark:text-slate-200 text-sm mt-1">
                  {user?.name}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  College Contact Email
                </span>
                <span className="block font-semibold text-slate-700 dark:text-slate-200 text-sm mt-1">
                  {user?.email}
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Registration Category
                </span>
                <span className="block font-semibold text-slate-700 dark:text-slate-200 text-sm mt-1 capitalize">
                  {user?.role} (UniResolve Node)
                </span>
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Verification Node
                </span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 inline-block font-extrabold mt-1">
                  SECURE PASS VALID
                </span>
              </div>
            </div>
          </div>

          {/* Security alerts notice */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-rose-500" />
              Credential & Session Privacy
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Your session tokens are securely signed using JWT standards and hashed passwords utilizing industry standard bcrypt. Keep your credentials secret. Always make sure to sign out if using campus public computers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
