import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Calendar,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatsCard from '../components/StatsCard';
import Modal from '../components/Modal';
import { CardSkeleton, ChartSkeleton, TableRowSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const AdminDashboard = () => {
  // 1. Stats and analytics states
  const [stats, setStats] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // 2. Complaint list states
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    total: 0,
  });

  // 3. Edit Status Modal States
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusForm, setStatusForm] = useState({
    status: 'Pending',
    comment: '',
  });
  const [updating, setUpdating] = useState(false);

  // 4. Delete Confirmation Modal States
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch admin stats & charts
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
      setCategoryData(response.data.categoryData.filter((c) => c.value > 0)); // Filter out categories with zero values for pie chart
      setTimelineData(response.data.timelineData);
    } catch (error) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch complaints list for datatable
  const fetchComplaints = async (pageNumber = 1) => {
    try {
      setLoadingComplaints(true);
      const { category, status, search } = filters;

      let endpoint = `/complaints?page=${pageNumber}&limit=${pagination.limit}`;
      if (category !== 'All') endpoint += `&category=${category}`;
      if (status !== 'All') endpoint += `&status=${status}`;
      if (search.trim()) endpoint += `&search=${encodeURIComponent(search.trim())}`;

      const response = await api.get(endpoint);
      setComplaints(response.data.data);
      setPagination({
        ...pagination,
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages,
        total: response.data.pagination.total,
      });
    } catch (error) {
      toast.error('Failed to load tickets list');
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchComplaints(1);
  }, [filters.category, filters.status]);

  // Handle Search Forms
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints(1);
  };

  // Trigger Status Edit Modal
  const openStatusModal = (ticket) => {
    setSelectedTicket(ticket);
    setStatusForm({
      status: ticket.status,
      comment: '',
    });
    setShowStatusModal(true);
  };

  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setUpdating(true);
      const response = await api.put(`/complaints/${selectedTicket._id}`, {
        status: statusForm.status,
        comment: statusForm.comment || `Status updated to ${statusForm.status} by administration.`,
      });

      toast.success(response.data.message);
      setShowStatusModal(false);
      setSelectedTicket(null);
      // Refresh both stats and complaints list
      fetchStats();
      fetchComplaints(pagination.page);
    } catch (error) {
      toast.error(error.cleanMessage || 'Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  // Trigger Spam Deletion Modal
  const openDeleteModal = (ticket) => {
    setTicketToDelete(ticket);
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    if (!ticketToDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/complaints/${ticketToDelete._id}`);
      toast.success('Ticket successfully deleted (Spam Filter)');
      setShowDeleteModal(false);
      setTicketToDelete(null);
      // Refresh stats and complaints list
      fetchStats();
      fetchComplaints(1);
    } catch (error) {
      toast.error(error.cleanMessage || 'Failed to remove ticket');
    } finally {
      setDeleting(false);
    }
  };

  // Color Mapping helper for Pie Chart Cells
  const COLORS = [
    '#6366f1', // Indigo
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ef4444', // Rose
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#14b8a6', // Teal
  ];

  const getStatusBadge = (status) => {
    const schemes = {
      Pending: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30',
      'In Progress': 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30',
      Resolved: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30',
    };
    return schemes[status] || schemes.Pending;
  };

  const categories = [
    'Electricity',
    'Water Leakage',
    'Wi-Fi',
    'Cleanliness',
    'Hostel',
    'Lab Equipment',
    'Classroom Issue',
    'Other',
  ];

  return (
    <div className="space-y-8">
      {/* Headings */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
          Admin Analytics Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review, distribute, and resolve campus-wide complaints efficiently.
        </p>
      </div>

      {/* KPI Cards section */}
      {loadingStats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Tickets"
            value={stats?.totalComplaints || 0}
            icon={FileText}
            color="indigo"
            description="Overall registered tickets"
          />
          <StatsCard
            title="Pending Tickets"
            value={stats?.pendingComplaints || 0}
            icon={ShieldAlert}
            color="rose"
            description="Awaiting administration review"
          />
          <StatsCard
            title="In Progress"
            value={stats?.inProgressComplaints || 0}
            icon={Clock}
            color="amber"
            description="Assigned to maintenance teams"
          />
          <StatsCard
            title="Resolved"
            value={stats?.resolvedComplaints || 0}
            icon={CheckCircle}
            color="emerald"
            description="Successfully completed tasks"
          />
        </div>
      )}

      {/* Chart Visualization Section */}
      {loadingStats ? (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <ChartSkeleton />
          </div>
          <div className="lg:col-span-4">
            <ChartSkeleton />
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Timeline trend line chart */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Complaint Trends (Last 7 Days)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:hidden" />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="complaints"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorComplaints)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category distribution pie chart */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              Category Distribution
            </h3>
            {categoryData.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
                No active complaints registered yet.
              </div>
            ) : (
              <>
                <div className="h-60 w-full flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2.5 justify-center mt-2">
                  {categoryData.map((item, index) => (
                    <span
                      key={item.name}
                      className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      {item.name} ({item.value})
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Datatable Filter Menu */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search student complaints..."
            className="custom-input pl-11 pr-20"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search className="h-4.5 w-4.5" />
          </span>
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-800"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:outline-none"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <select
            className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:outline-none"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Datatable list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/60 dark:border-slate-800/60 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="p-4 pl-6">Student</th>
                <th className="p-4">Complaint Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Filed</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingComplaints ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 text-sm">
                    No matching complaints records found.
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr
                    key={complaint._id}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="p-4 pl-6">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm block">
                          {complaint.studentId?.name || 'Unknown Student'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block">
                          {complaint.studentId?.email}
                        </span>
                      </div>
                    </td>

                    {/* Complaint details */}
                    <td className="p-4 max-w-[240px] truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm block truncate">
                        {complaint.title}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 block truncate">
                        {complaint.description}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/10">
                        {complaint.category}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="p-4">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadge(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs font-medium text-slate-400 dark:text-slate-500">
                      {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions panel */}
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/complaint/${complaint._id}`}
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Link>
                        <button
                          onClick={() => openStatusModal(complaint)}
                          className="p-2 text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded-lg transition-colors"
                          title="Edit Status"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(complaint)}
                          className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                          title="Delete Spam"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Datatable Pagers */}
        {!loadingComplaints && complaints.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/20">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-semibold">{complaints.length}</span> of{' '}
              <span className="font-semibold">{pagination.total}</span> tickets
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchComplaints(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-350">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchComplaints(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* UPDATE STATUS MODAL */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedTicket(null);
        }}
        title="Modify Ticket Resolution Status"
      >
        <form onSubmit={handleStatusUpdateSubmit} className="space-y-5">
          <div>
            <label className="custom-label">New Status State</label>
            <select
              className="custom-input"
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="custom-label">Status Progression Comment</label>
            <textarea
              required
              rows={4}
              maxLength={200}
              className="custom-input resize-none"
              placeholder="e.g. Assigned staff to visit site tomorrow or Issue resolved and verified."
              value={statusForm.comment}
              onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedTicket(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2 rounded-xl shadow-lg disabled:opacity-70 flex items-center gap-2"
            >
              {updating ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* SPAM REMOVAL MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTicketToDelete(null);
        }}
        title="Spam Deletion Filter Action"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Are you sure you want to permanently delete the ticket titled:{' '}
            <span className="font-extrabold text-slate-800 dark:text-white">
              "{ticketToDelete?.title}"
            </span>
            ? This action will completely erase the record from the database and is irreversible.
          </p>

          <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-150 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setShowDeleteModal(false);
                setTicketToDelete(null);
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSubmit}
              disabled={deleting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl shadow-lg disabled:opacity-70 flex items-center gap-2"
            >
              {deleting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Confirm Delete'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
