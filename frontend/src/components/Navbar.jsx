import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Menu, LogOut, User, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Generate name initials for placeholder avatar
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
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-4 flex items-center justify-between">
      {/* Mobile Menu Toggle & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/pccoerimg.jpeg"
            alt="PCCOER Logo"
            className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-800"
          />
          <span className="font-bold text-xl bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent hidden sm:inline-block">
            PCCOER Portal
          </span>
        </div>
      </div>

      {/* Action Triggers */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Trigger */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 transition-all duration-200 shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-amber-500 animate-pulse-slow" />
          ) : (
            <Moon className="h-5 w-5 text-indigo-600" />
          )}
        </button>

        {/* User Options Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/50 transition-all"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center shadow-sm">
              {getInitials(user?.name)}
            </div>
            <div className="text-left hidden md:block px-1">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block max-w-[120px] truncate">
                {user?.name}
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 block">
                {user?.role}
              </span>
            </div>
          </button>

          {/* Profile Dropdown Container */}
          {dropdownOpen && (
            <>
              {/* Overlay Backdrop to close dropdown */}
              <div
                onClick={() => setDropdownOpen(false)}
                className="fixed inset-0 z-10"
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-xl py-2 z-20 overflow-hidden transform origin-top-right transition-all">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60">
                  <p className="text-xs text-slate-400 dark:text-slate-500">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <User className="h-4 w-4" />
                  My Profile
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors border-t border-slate-100 dark:border-slate-800/60"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
