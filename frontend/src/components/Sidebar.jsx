import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, User, LogOut, ChevronRight, ShieldAlert, Sparkles, BookOpen, MessageSquare, Rss, Briefcase, ShoppingBag, Trophy } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const links = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Events & Hackathons',
      path: '/events',
      icon: Trophy,
    },
    {
      name: 'Library Section',
      path: '/library',
      icon: BookOpen,
    },
    {
      name: 'Campus Chat',
      path: '/chat',
      icon: MessageSquare,
    },
    {
      name: 'Social Insights Feed',
      path: '/social',
      icon: Rss,
    },
    {
      name: 'Startup Collab Hub',
      path: '/projects',
      icon: Briefcase,
    },
    {
      name: 'Marketplace Swap',
      path: '/marketplace',
      icon: ShoppingBag,
    },
    {
      name: 'Influence Leaderboard',
      path: '/leaderboard',
      icon: Trophy,
    },
    {
      name: 'My Profile',
      path: '/profile',
      icon: User,
    },
  ];

  const activeClass =
    'flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-medium shadow-sm transition-all duration-200';
  const inactiveClass =
    'flex items-center justify-between px-4 py-3 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium transition-all duration-200';

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 py-6 px-4 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Upper Segment: Brand & Links */}
        <div>
          {/* Logo segment on drawer */}
          <div className="flex items-center gap-2.5 px-3 mb-8">
            <img
              src="/pccoerimg.jpeg"
              alt="PCCOER Logo"
              className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                PCCOER
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Student Support Portal
              </span>
            </div>
          </div>

          {/* Navigation Links grid */}
          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                  end
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 stroke-[2] ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{link.name}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'rotate-90 text-white' : 'text-slate-300 dark:text-slate-600'}`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Lower Segment: Profile banner & Logout */}
        <div className="space-y-4">
          {/* Support Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="h-3 w-3 stroke-[2.5]" />
              PCCOER Support
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Managing campus complaints has never been more organized, direct and fast.
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium transition-all"
          >
            <LogOut className="h-5 w-5 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
