import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Menu, LogOut, User, ShieldAlert, Search, BookOpen, MessageSquare, Briefcase, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        triggerSearch();
      } else {
        setSearchResults(null);
      }
    }, 305);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const triggerSearch = async () => {
    try {
      const res = await api.get('/search', {
        params: { query: searchQuery.trim() }
      });
      setSearchResults(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

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
          <span className="font-bold text-xl text-slate-800 dark:text-slate-100 hidden sm:inline-block">
            PCCOER Portal
          </span>
        </div>
      </div>

      {/* Global Intelligent Fuzzy Search Bar */}
      <div className="relative flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
          <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Search student profiles, branch skills, projects, textbooks..."
            className="w-full bg-transparent border-none text-xs focus:outline-none text-slate-700 dark:text-slate-200 placeholder-slate-455"
          />
        </div>

        {/* Floating results drawer popover */}
        {searchFocused && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 max-h-96 overflow-y-auto z-50 text-xs text-slate-700 dark:text-slate-300 space-y-4">
            
            {/* Matching Users */}
            {searchResults.users?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-1">Students & Mentors</span>
                {searchResults.users.map(u => (
                  <div key={u._id} className="flex items-center justify-between p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <img src={u.avatar || '/placeholder.png'} className="h-6 w-6 rounded-full object-cover" alt="avatar" />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block leading-normal">{u.name}</span>
                        <span className="text-[9px] text-slate-450 font-bold uppercase">{u.dept} | {u.role}</span>
                      </div>
                    </div>
                    {u.skills?.length > 0 && (
                      <span className="text-[8px] bg-orange-500/10 text-orange-400 px-1.5 py-0.2 rounded font-extrabold">
                        {u.skills[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Matching Projects */}
            {searchResults.projects?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-1">Startup Collaborations</span>
                {searchResults.projects.map(p => (
                  <button
                    key={p._id}
                    onClick={() => navigate('/projects')}
                    className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Briefcase className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block leading-normal">{p.title}</span>
                      <span className="text-[9px] text-slate-400 font-bold">By {p.creator?.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Matching Posts */}
            {searchResults.posts?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold text-indigo-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-1">Social Insights</span>
                {searchResults.posts.map(p => (
                  <button
                    key={p._id}
                    onClick={() => navigate('/social')}
                    className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-350 truncate block max-w-[320px]">{p.content}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Matching Books */}
            {searchResults.books?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold text-purple-500 uppercase tracking-widest block border-b border-slate-100 dark:border-slate-800 pb-1">Library Catalog</span>
                {searchResults.books.map(b => (
                  <button
                    key={b._id}
                    onClick={() => navigate('/library')}
                    className="w-full text-left p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block leading-normal">{b.title}</span>
                      <span className="text-[9px] text-slate-400 font-bold">By {b.author}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searchResults.users?.length && !searchResults.projects?.length && !searchResults.posts?.length && !searchResults.books?.length && (
              <div className="text-center text-slate-500 font-bold py-2">No matching campus packets found.</div>
            )}

          </div>
        )}
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
            <Sun className="h-5 w-5 text-amber-500" />
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
            <div className="h-9 w-9 rounded-full bg-slate-800 dark:bg-slate-700 text-white font-bold flex items-center justify-center shadow-sm">
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
