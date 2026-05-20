import React, { useState, useEffect } from 'react';
import { 
  Award, Sparkles, Flame, ShieldAlert, Trophy, Star, TrendingUp, Users, ChevronUp
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/chat/users');
      // Sort users by XP descending
      const sorted = res.data.data.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setUsers(sorted);
    } catch (err) {
      toast.error('Failed to load campus leaderboard rankings.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-white">
      
      {/* Header card welcome */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl relative overflow-hidden flex items-center justify-between flex-wrap gap-4">
        <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2.5 py-0.5 rounded-full">Gamification Arena</span>
          <h2 className="text-base font-extrabold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            PCCOER Campus Influence Leaderboard
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">Recognizing student and mentor contributions in resolving grievances, counseling, and hackathons.</p>
        </div>
      </div>

      {/* Top 3 podium display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {users.slice(0, 3).map((usr, index) => {
          const podiumStyles = [
            { border: 'border-amber-500/30', bg: 'bg-amber-500/5', badge: '🥇 Gold influence tier' },
            { border: 'border-slate-350/30', bg: 'bg-slate-300/5', badge: '🥈 Silver influence tier' },
            { border: 'border-orange-500/30', bg: 'bg-orange-500/5', badge: '🥉 Bronze influence tier' },
          ];
          const style = podiumStyles[index] || podiumStyles[2];
          return (
            <div key={usr._id} className={`border ${style.border} ${style.bg} p-6 rounded-3xl text-center space-y-4 relative shadow-lg`}>
              <div className="absolute top-4 right-4 text-[9px] font-extrabold text-orange-400 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                Rank #{index + 1}
              </div>
              
              <div className="relative inline-block">
                <img src={usr.avatar || '/placeholder.png'} className="h-16 w-16 rounded-full mx-auto border-2 border-orange-500 object-cover" alt="avatar" />
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center text-[10px]">
                  ⚡
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-extrabold">{usr.name}</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase">{usr.dept} | {usr.role}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-850">
                <div className="text-center">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">XP Score</span>
                  <span className="text-xs font-extrabold text-orange-400">{usr.xp || 10}</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase">Portal Level</span>
                  <span className="text-xs font-extrabold text-white">Lvl {usr.level || 1}</span>
                </div>
              </div>

              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block bg-slate-950 py-1 rounded border border-slate-850">
                {style.badge}
              </span>
            </div>
          );
        })}
      </div>

      {/* Roster table of all campus profiles */}
      <div className="bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-850 flex justify-between items-center">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Influence rankings directory</span>
          <Users className="h-4 w-4 text-slate-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-medium text-slate-300">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500 uppercase text-[9px] font-extrabold text-left bg-slate-950/20">
                <th className="p-4">Rank</th>
                <th className="p-4">Campus User</th>
                <th className="p-4">Department & Role</th>
                <th className="p-4 text-center">Streaks</th>
                <th className="p-4 text-center">XP Level</th>
                <th className="p-4 text-right">Contribution XP</th>
              </tr>
            </thead>
            <tbody>
              {users.map((usr, i) => (
                <tr key={usr._id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-colors">
                  <td className="p-4 font-extrabold text-slate-400">#{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <img src={usr.avatar || '/placeholder.png'} className="h-7 w-7 rounded-full border border-slate-800 object-cover" alt="avatar" />
                      <span className="font-extrabold text-white">{usr.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">{usr.dept}</span>
                      <span className="h-1 w-1 bg-slate-700 rounded-full" />
                      <span className="text-[9px] bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded text-slate-400 uppercase font-bold">
                        {usr.role}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1 text-orange-400 font-extrabold bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                      <Flame className="h-3.5 w-3.5" />
                      {usr.streaks || 1} days
                    </div>
                  </td>
                  <td className="p-4 text-center font-extrabold text-white">Lvl {usr.level || 1}</td>
                  <td className="p-4 text-right font-extrabold text-orange-400">{usr.xp || 10} XP</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
