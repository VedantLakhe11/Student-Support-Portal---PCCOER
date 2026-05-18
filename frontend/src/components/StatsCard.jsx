import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color = 'indigo', description }) => {
  const colorMaps = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      icon: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/40',
      glow: 'shadow-indigo-100/50 dark:shadow-none',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      icon: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/40',
      glow: 'shadow-amber-100/50 dark:shadow-none',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      icon: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      glow: 'shadow-emerald-100/50 dark:shadow-none',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      icon: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/40',
      glow: 'shadow-rose-100/50 dark:shadow-none',
    },
  };

  const scheme = colorMaps[color] || colorMaps.indigo;

  return (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${scheme.border} shadow-lg ${scheme.glow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex justify-between items-start`}>
      <div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-1">
          {title}
        </span>
        <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
          {value}
        </h3>
        {description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
            {description}
          </p>
        )}
      </div>
      <div className={`p-3.5 rounded-xl ${scheme.bg} ${scheme.icon} flex items-center justify-center shadow-inner`}>
        <Icon className="h-6 w-6 stroke-[2]" />
      </div>
    </div>
  );
};

export default StatsCard;
