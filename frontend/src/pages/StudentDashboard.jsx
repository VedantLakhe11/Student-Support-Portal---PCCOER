import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Send,
  Upload,
  Calendar,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileText,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();

  // 1. Complaint list State
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    search: '',
    sort: 'latest',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6,
    totalPages: 1,
    total: 0,
  });

  // 2. Form submission states
  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState({
    title: '',
    description: '',
    category: 'Electricity',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Categories list
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

  // Fetch student complaints
  const fetchComplaints = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const { category, status, search, sort } = filters;
      
      let endpoint = `/complaints?page=${pageNumber}&limit=${pagination.limit}&sort=${sort}`;
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
      toast.error(error.cleanMessage || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
  }, [filters.category, filters.status, filters.sort]);

  // Debounced search hook or manual search trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints(1);
  };

  // Image Upload Preview Setup
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.error('File size cannot exceed 5MB');
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Form submit handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { title, description, category } = formFields;

    if (!title.trim() || !description.trim()) {
      return toast.error('Please fill in title and description fields');
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Complaint registered successfully!');
      setShowForm(false);
      setFormFields({ title: '', description: '', category: 'Electricity' });
      clearImage();
      fetchComplaints(1);
    } catch (error) {
      toast.error(error.cleanMessage || 'Could not submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick stat badge color mapper
  const getStatusBadge = (status) => {
    const schemes = {
      Pending: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30',
      'In Progress': 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30',
      Resolved: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30',
    };
    return schemes[status] || schemes.Pending;
  };

  return (
    <div className="space-y-8">
      {/* Header section with profile name and quick stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Welcome, {user?.name.split(' ')[0]}!
            <Sparkles className="h-6 w-6 text-brand-500 fill-current animate-pulse-slow hidden sm:block" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            File complaints and monitor real-time campus maintenance progress.
          </p>
        </div>

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-xl transition-all duration-200"
        >
          {showForm ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {showForm ? 'Cancel Creation' : 'New Complaint'}
        </button>
      </div>

      {/* Animate Form Panel Mount */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleFormSubmit}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl shadow-slate-100/50 dark:shadow-none space-y-6"
            >
              <h3 className="text-xl font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Register New Complaint
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  {/* Title field */}
                  <div>
                    <label className="custom-label">Complaint Title</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      className="custom-input"
                      placeholder="e.g. WiFi Router not working in Lab A"
                      value={formFields.title}
                      onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="custom-label">Category</label>
                    <select
                      className="custom-input bg-none appearance-none"
                      value={formFields.category}
                      onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description and Image uploading */}
                <div className="space-y-5">
                  <div>
                    <label className="custom-label">Detailed Description</label>
                    <textarea
                      required
                      maxLength={1000}
                      rows={5}
                      className="custom-input resize-none"
                      placeholder="Describe the issue in detail so maintenance staff can resolve it efficiently..."
                      value={formFields.description}
                      onChange={(e) =>
                        setFormFields({ ...formFields, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Upload image */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/20">
                {imagePreview ? (
                  <div className="relative group max-w-[240px]">
                    <img
                      src={imagePreview}
                      alt="Upload Preview"
                      className="h-32 object-cover rounded-xl shadow-md"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2.5 -right-2.5 bg-rose-500 text-white p-1 rounded-full shadow-md hover:bg-rose-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-2 text-slate-500 hover:text-brand-500 transition-colors">
                    <Upload className="h-8 w-8 stroke-[1.5]" />
                    <span className="text-sm font-semibold">Upload Optional Image (Max 5MB)</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, WEBP formats only</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    clearImage();
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-xl disabled:opacity-75 transition-all"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Ticket
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filter, Sort, and Search panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
          <input
            type="text"
            placeholder="Search by title or description..."
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

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Category */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
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

          {/* Status */}
          <select
            className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Listing */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <TicketSkeleton />
          <TicketSkeleton />
          <TicketSkeleton />
        </div>
      ) : complaints.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-slate-200 dark:border-slate-800 p-12 text-center rounded-3xl bg-white dark:bg-slate-900/50 max-w-xl mx-auto space-y-4 shadow-sm"
        >
          <div className="bg-brand-50 dark:bg-brand-950/20 p-4 rounded-full text-brand-600 dark:text-brand-400 w-16 h-16 flex items-center justify-center mx-auto shadow-md">
            <FileText className="h-8 w-8 stroke-[1.5]" />
          </div>
          <h4 className="text-xl font-bold text-slate-800 dark:text-white">
            No complaints registered
          </h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            We couldn't find any complaints matches for the selected filters. Submit a new ticket using the button above to alert the campus maintenance team.
          </p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={complaint._id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center gap-2 mb-3.5">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusBadge(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                    {complaint.category}
                  </span>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-white text-base leading-snug line-clamp-1 mb-2">
                  {complaint.title}
                </h4>

                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
                  {complaint.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <Link
                  to={`/complaint/${complaint._id}`}
                  className="text-brand-600 dark:text-brand-400 font-extrabold hover:underline text-xs"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {!loading && complaints.length > 0 && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold">{complaints.length}</span> of{' '}
            <span className="font-semibold">{pagination.total}</span> tickets
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchComplaints(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-350 px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchComplaints(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
