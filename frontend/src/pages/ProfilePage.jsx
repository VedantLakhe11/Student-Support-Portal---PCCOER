import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  User, Mail, Shield, Clock, Sparkles, Lock, UserCheck, Zap, Edit,
  Send, KeyRound, Award, GraduationCap, Building2, Terminal
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  // Safe fallback if local state is clearing
  const activeUser = user || JSON.parse(localStorage.getItem('user'));

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: activeUser?.name || '',
    prn: activeUser?.prn || '',
    dept: activeUser?.dept || '',
    year: activeUser?.year || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

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

  const handleUpdateProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error('Name cannot be empty');

    try {
      setUpdatingProfile(true);
      const res = await updateProfile(profileForm);
      if (res.success) {
        toast.success('Account profile updated successfully!');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Failed to update account attributes.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    try {
      setUpdatingPassword(true);
      const res = await updateProfile({ password: passwordForm.newPassword });
      if (res.success) {
        toast.success('Security password updated successfully!');
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Failed to update security password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-12 text-left">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-805 dark:text-white">
          My Account Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
          Review, modify, and protect your campus credentials and authentication parameters.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Avatar and main details */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-6 shadow-sm">
          <div className="relative inline-block mx-auto">
            <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-orange-500/20 border-4 border-white dark:border-slate-950">
              {getInitials(activeUser?.name)}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2 rounded-full border-2 border-white dark:border-slate-950">
              <UserCheck className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-850 dark:text-white leading-tight">
              {activeUser?.name}
            </h3>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-full border dark:border-slate-850 inline-block">
              {activeUser?.role} account
            </span>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 stroke-[1.8] text-slate-400 shrink-0" />
              <span className="truncate">{activeUser?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Terminal className="h-4 w-4 stroke-[1.8] text-slate-400 shrink-0" />
              <span>PRN: {activeUser?.prn || 'Not Registered'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 stroke-[1.8] text-slate-400 shrink-0" />
              <span>Dept: {activeUser?.dept || 'Engineering Department'}</span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 stroke-[1.8] text-slate-400 shrink-0" />
              <span>Year: {activeUser?.year || 'Alumni / Staff'}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Forms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Form 1: Profile Attributes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-slate-850 dark:text-white border-b dark:border-slate-800 pb-3 flex items-center gap-2">
              <Edit className="h-5 w-5 text-orange-500" />
              Update Account Attributes
            </h3>

            <form onSubmit={handleUpdateProfileSubmit} className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Display Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-orange-500"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Academic PRN</label>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-orange-500"
                  value={profileForm.prn}
                  onChange={(e) => setProfileForm({ ...profileForm, prn: e.target.value })}
                  placeholder="e.g. 72011234F"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Department Branch</label>
                <select
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
                  value={profileForm.dept}
                  onChange={(e) => setProfileForm({ ...profileForm, dept: e.target.value })}
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                  <option value="Civil">Civil Engineering</option>
                  <option value="E&TC">Electronics & Telecommunication</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Classroom Year / Info</label>
                <input
                  type="text"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-orange-500"
                  value={profileForm.year}
                  onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })}
                  placeholder="e.g. BE Computer or Alumni Class 2024"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors flex items-center gap-2"
                >
                  {updatingProfile ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Save Attributes <Send className="h-3.5 w-3.5" /></>}
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Password Security */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-extrabold text-slate-850 dark:text-white border-b dark:border-slate-800 pb-3 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-indigo-500" />
              Change Security Password
            </h3>

            <form onSubmit={handleUpdatePasswordSubmit} className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-orange-500"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-xs outline-none focus:border-orange-500"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors flex items-center gap-2"
                >
                  {updatingPassword ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Commit Security Reset <KeyRound className="h-3.5 w-3.5" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
