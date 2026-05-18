import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  Zap, 
  ArrowRight, 
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Dumbbell, 
  MessagesSquare, 
  Activity,
  HeartHandshake
} from 'lucide-react';

const LandingPage = () => {
  const stats = [
    { label: 'Grievances Resolved', value: '98.4%', desc: 'Within 24-48 hours', icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Verified Alumni', value: '450+', desc: 'From FAANG & Top Firms', icon: GraduationCap, color: 'text-orange-500' },
    { label: 'Library Catalogues', value: '1,200+', desc: 'Active Textbook Stock', icon: BookOpen, color: 'text-blue-500' },
    { label: 'Upcoming Hackathons', value: '2 Active', desc: 'Cash Prizes and Merits', icon: Calendar, color: 'text-indigo-500' },
  ];

  const modules = [
    {
      title: 'Smart Complaints Tracker',
      desc: 'File facility, IT, or class grievances with image uploads and track status timelines (Pending ➡️ Assigned ➡️ In Progress ➡️ Resolved) in real-time.',
      icon: ShieldAlert,
      color: 'bg-red-500/10 text-red-500 border-red-500/20'
    },
    {
      title: 'Alumni & Senior Mentorship',
      desc: 'Browse verified alumni profiles from Google, TCS, and more. Request direct career guidance, and review shared placement blogs and internship tips.',
      icon: HeartHandshake,
      color: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    },
    {
      title: 'Campus Hackathons & Events',
      desc: 'Review upcoming technology contests, coding sprints, or cultural gatherings. Lock down a slot, review agendas, and monitor registration limits.',
      icon: Calendar,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    },
    {
      title: 'Central Library Catalogue',
      desc: 'Search the library inventory instantly. Review availability, check out cabinet shelf/rack numbers, and queue up reservations on the spot.',
      icon: BookOpen,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    },
    {
      title: 'Digital Facility Scheduler',
      desc: 'View active statuses of campus gyms, sports complexes, seminar halls, and laboratories. Schedule space bookings for student activities.',
      icon: Dumbbell,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    {
      title: 'Decentralized Student Forum',
      desc: 'Connect with peers and teachers. Publish question threads, share coding ideas, toggle category tags, and comment collaboratively on posts.',
      icon: MessagesSquare,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 overflow-x-hidden flex flex-col font-sans">
      {/* Header bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <img
            src="/pccoerimg.jpeg"
            alt="PCCOER Logo"
            className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-md"
          />
          <div className="flex flex-col">
            <span className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
              PCCOER
            </span>
            <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-0.5">
              CampusCare
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-bold bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Main hero segment */}
      <main className="flex-1 flex flex-col justify-center relative px-6 z-10 max-w-7xl mx-auto w-full py-16 md:py-24 space-y-24">
        {/* Glow rings in background */}
        <div className="absolute top-10 left-1/3 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[140px] -z-10 pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

        <div className="grid md:grid-cols-12 gap-12 items-center">
          {/* Left Hero copy */}
          <div className="md:col-span-7 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/5 text-orange-600 dark:text-orange-400 border border-orange-200/30 dark:border-orange-900/30 text-xs font-bold uppercase tracking-wider"
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              Next-Gen Campus SaaS System
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-800 dark:text-white leading-[1.1]"
            >
              The Modern Digital{' '}
              <span className="bg-gradient-to-r from-orange-500 to-indigo-500 bg-clip-text text-transparent">
                Campus Care Hub.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-slate-600 dark:text-slate-350 text-lg leading-relaxed max-w-xl"
            >
              PCCOER CampusCare is a startup-grade campus support and community administration platform. Manage complaints, book sports facilities, query library racks, register for hackathons, and interact with verified alumni mentors on a fast dashboard.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                to="/register"
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold px-7 py-4 rounded-2xl shadow-xl shadow-orange-500/25 hover:shadow-2xl transition-all duration-200 text-base"
              >
                Access Portal
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold px-7 py-4 rounded-2xl transition-all duration-200 text-base"
              >
                Role Dashboards
              </Link>
            </motion.div>
          </div>

          {/* Right Hero Graphic: Glass Cards */}
          <div className="md:col-span-5 relative flex justify-center items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-[390px] p-6 rounded-3xl border border-white/20 dark:border-slate-800/40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl relative"
            >
              {/* Floating Ticket Stat overlay */}
              <div className="absolute -left-6 top-10 bg-emerald-500 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-xs font-black">
                <CheckCircle className="h-4 w-4" />
                Solved in record time!
              </div>

              {/* Second floating overlay */}
              <div className="absolute -right-6 bottom-12 bg-orange-500 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-500/20 text-xs font-black">
                <Activity className="h-4 w-4" />
                Centralized Status
              </div>

              {/* Sample Ticket preview inside card */}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Live Grievance Preview
                </span>
                <div className="h-28 rounded-2xl bg-gradient-to-tr from-orange-100 to-indigo-100/50 dark:from-slate-800 dark:to-orange-950/20 border border-slate-200/50 dark:border-slate-800/40 flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <ShieldAlert className="h-10 w-10 stroke-[1.5]" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 dark:text-white text-base">
                    Block B Lab 204 Projector Offline
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    HDMI port on primary ceiling projector is loose, rendering lectures and presentation files unplayable.
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                  <span className="text-[10px] bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                    Lab Equipment
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Just now
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Statistical Grid */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 bg-white dark:bg-slate-900/40 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 ${s.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <span className="block text-2xl font-black text-slate-800 dark:text-white">
                    {s.value}
                  </span>
                  <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight mt-0.5">
                    {s.label}
                  </span>
                  <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    {s.desc}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Modular Grid */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">
              An All-in-One Campus Ecosystem
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              PCCOER CampusCare connects support, learning tools, senior career assistance, and booking panels in a single, high-fidelity secure dashboard.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, idx) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="p-6 rounded-2xl border border-slate-200/40 dark:border-slate-850 bg-white dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group flex flex-col text-left justify-between"
                >
                  <div className="space-y-4">
                    <div className={`p-3 rounded-xl inline-block border ${m.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-lg group-hover:text-orange-500 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1 text-[11px] font-black text-orange-500 uppercase tracking-widest cursor-pointer hover:underline mt-4">
                    Explore module
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer segment */}
      <footer className="py-8 border-t border-slate-200/40 dark:border-slate-900/60 mt-auto px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <img src="/pccoerimg.jpeg" className="h-5 w-5 rounded-full object-cover" />
            <p>© 2026 Pimpri Chinchwad College of Engineering & Research. Platform engineered for student experience and DTIL portfolios.</p>
          </div>
          <div className="flex gap-4 font-bold">
            <span className="hover:text-orange-500 cursor-pointer">Security Standards</span>
            <span className="hover:text-orange-500 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-orange-500 cursor-pointer">DTIL Presentable</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
