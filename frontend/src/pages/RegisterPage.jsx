import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Hash, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. Zod Conditional Validation Schema
const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid campus email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    role: z.enum(['student', 'faculty', 'alumni']),
    prn: z.string().optional(),
    dept: z.string().optional(),
    year: z.string().optional(),
    alumniCompany: z.string().optional(),
    alumniRole: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'student') {
      if (!data.prn || data.prn.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PRN is required for students',
          path: ['prn'],
        });
      }
      if (!data.dept) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Department is required',
          path: ['dept'],
        });
      }
      if (!data.year) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Academic Year is required',
          path: ['year'],
        });
      }
    } else if (data.role === 'faculty') {
      if (!data.dept) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Department assignment is required',
          path: ['dept'],
        });
      }
    } else if (data.role === 'alumni') {
      if (!data.alumniCompany || data.alumniCompany.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Company name is required for alumni tracking',
          path: ['alumniCompany'],
        });
      }
      if (!data.alumniRole || data.alumniRole.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Job Title / Role is required',
          path: ['alumniRole'],
        });
      }
    }
  });

const RegisterPage = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 2. React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'student',
      prn: '',
      dept: 'Computer Science',
      year: 'FE',
      alumniCompany: '',
      alumniRole: '',
    },
  });

  const selectedRole = watch('role');

  // Submit Handler
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Clean request object based on role
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      if (data.role === 'student') {
        payload.prn = data.prn;
        payload.dept = data.dept;
        payload.year = data.year;
      } else if (data.role === 'faculty') {
        payload.dept = data.dept;
      } else if (data.role === 'alumni') {
        payload.alumniCompany = data.alumniCompany;
        payload.alumniRole = data.alumniRole;
        payload.dept = data.dept; // alumni also belong to a department
      }

      const res = await authRegister(payload);

      if (res.success) {
        toast.success(`Welcome to PCCOER support, ${res.user.name}!`);
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('An unexpected registration error occurred. Please try again.');
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
      <div className="w-full max-w-[500px] my-10 p-8 md:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl flex flex-col items-center">
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
            Create Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register to access decentralized university services
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                className={`w-full bg-white dark:bg-slate-900/60 border ${
                  errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-orange-500/20 focus:border-orange-500'
                } rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all focus:ring-4`}
                placeholder="John Doe"
                {...register('name')}
                disabled={loading}
              />
            </div>
            {errors.name && (
              <span className="block text-[11px] text-red-500 font-bold mt-1.5 text-left">
                {errors.name.message}
              </span>
            )}
          </div>

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

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
              Password
            </label>
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

          {/* Role Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
              Role Authority
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <GraduationCap className="h-4.5 w-4.5" />
              </span>
              <select
                className="w-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none transition-all appearance-none cursor-pointer"
                {...register('role')}
                disabled={loading}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="alumni">College Alumni / Mentor</option>
              </select>
            </div>
          </div>

          {/* CONDITIONAL STUDENT FIELDS */}
          {selectedRole === 'student' && (
            <div className="p-4 rounded-2xl bg-orange-500/5 dark:bg-orange-500/[0.02] border border-orange-500/10 space-y-4">
              {/* PRN Field */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
                  PRN (Permanent Registration No.)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Hash className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    className={`w-full bg-white dark:bg-slate-900 border ${
                      errors.prn ? 'border-red-500' : 'border-slate-200 dark:border-slate-850'
                    } rounded-2xl py-3 pl-11 pr-4 text-sm outline-none`}
                    placeholder="e.g. 72012345A"
                    {...register('prn')}
                  />
                </div>
                {errors.prn && (
                  <span className="block text-[11px] text-red-500 font-bold mt-1 text-left">
                    {errors.prn.message}
                  </span>
                )}
              </div>

              {/* Branch Selection & Year Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-left">
                    Department Branch
                  </label>
                  <select
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl py-2.5 px-3 text-xs outline-none appearance-none cursor-pointer"
                    {...register('dept')}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="E&TC">E&TC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 text-left">
                    Academic Year
                  </label>
                  <select
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl py-2.5 px-3 text-xs outline-none appearance-none cursor-pointer"
                    {...register('year')}
                  >
                    <option value="FE">FE (1st Year)</option>
                    <option value="SE">SE (2nd Year)</option>
                    <option value="TE">TE (3rd Year)</option>
                    <option value="BE">BE (4th Year)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* CONDITIONAL FACULTY FIELDS */}
          {selectedRole === 'faculty' && (
            <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/[0.02] border border-indigo-500/10 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
                  Assigned Department
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <BookOpen className="h-4.5 w-4.5" />
                  </span>
                  <select
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none appearance-none cursor-pointer"
                    {...register('dept')}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="E&TC">E&TC</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* CONDITIONAL ALUMNI FIELDS */}
          {selectedRole === 'alumni' && (
            <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/[0.02] border border-indigo-500/10 space-y-4">
              {/* Alumni Company */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
                  Current Employing Company
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Briefcase className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    className={`w-full bg-white dark:bg-slate-900 border ${
                      errors.alumniCompany ? 'border-red-500' : 'border-slate-200 dark:border-slate-850'
                    } rounded-2xl py-3 pl-11 pr-4 text-sm outline-none`}
                    placeholder="e.g. Google India, TCS, Capgemini"
                    {...register('alumniCompany')}
                  />
                </div>
                {errors.alumniCompany && (
                  <span className="block text-[11px] text-red-500 font-bold mt-1 text-left">
                    {errors.alumniCompany.message}
                  </span>
                )}
              </div>

              {/* Alumni Role / Designation */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
                  Professional Job Title / Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    className={`w-full bg-white dark:bg-slate-900 border ${
                      errors.alumniRole ? 'border-red-500' : 'border-slate-200 dark:border-slate-850'
                    } rounded-2xl py-3 pl-11 pr-4 text-sm outline-none`}
                    placeholder="e.g. Senior Software Engineer"
                    {...register('alumniRole')}
                  />
                </div>
                {errors.alumniRole && (
                  <span className="block text-[11px] text-red-500 font-bold mt-1 text-left">
                    {errors.alumniRole.message}
                  </span>
                )}
              </div>

              {/* Department Graduated From */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-left">
                  Graduated Department Branch
                </label>
                <select
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl py-3 px-4 text-sm outline-none appearance-none cursor-pointer"
                  {...register('dept')}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="E&TC">E&TC</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-200 mt-2"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Register Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-8">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-orange-500 font-bold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
