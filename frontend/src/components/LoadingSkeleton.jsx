import React from 'react';

// Single KPI Card Skeleton
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/80 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
      <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-2/3"></div>
  </div>
);

// Ticket Card Skeleton
export const TicketSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm animate-pulse">
    <div className="flex justify-between items-center mb-3">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
    </div>
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3"></div>
    <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-xl w-full mb-4"></div>
    <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
    </div>
  </div>
);

// Chart Area Skeleton
export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/80 animate-pulse h-80 flex flex-col justify-between">
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
    <div className="flex-1 flex gap-4 items-end justify-between px-4 pb-2">
      <div className="h-2/3 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
      <div className="h-1/2 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
      <div className="h-4/5 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
      <div className="h-1/3 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
      <div className="h-3/4 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
      <div className="h-1/2 bg-slate-200 dark:bg-slate-700 rounded w-8"></div>
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-slate-100 dark:border-slate-800">
    <td className="p-4"><div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div></td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div></td>
    <td className="p-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-full w-24"></div></td>
    <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div></td>
    <td className="p-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-12 ml-auto"></div></td>
  </tr>
);
