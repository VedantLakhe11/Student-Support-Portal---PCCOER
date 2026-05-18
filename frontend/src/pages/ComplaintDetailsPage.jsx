import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ZoomIn,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState(false);

  // Dynamic Base API URL for images
  const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/complaints/${id}`);
        setComplaint(response.data.data);
      } catch (error) {
        toast.error(error.cleanMessage || 'Failed to fetch ticket details');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchComplaintDetails();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
          Fetching ticket details...
        </p>
      </div>
    );
  }

  if (!complaint) return null;

  // Status mapping colors helper
  const getStatusBadge = (status) => {
    const schemes = {
      Pending: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30',
      'In Progress': 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30',
      Resolved: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30',
    };
    return schemes[status] || schemes.Pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Return button */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Main Ticket Info details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            {/* Upper tags */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${getStatusBadge(complaint.status)}`}>
                  {complaint.status}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-transparent">
                  {complaint.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                <Calendar className="h-4 w-4" />
                <span>Filed {new Date(complaint.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Title & Desc */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {complaint.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200/20 dark:border-slate-800/10">
                {complaint.description}
              </p>
            </div>

            {/* Image Preview evidence */}
            {complaint.image && (
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Uploaded File Evidence
                </h4>
                <div className="relative group max-w-lg rounded-2xl overflow-hidden shadow-md border border-slate-200/50 dark:border-slate-800">
                  <img
                    src={`${API_URL}${complaint.image}`}
                    alt="Ticket Evidence"
                    className="w-full h-80 object-cover cursor-zoom-in group-hover:scale-102 transition-transform duration-300"
                    onClick={() => setZoomImage(true)}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-zoom-in pointer-events-none">
                    <span className="bg-white/95 dark:bg-slate-900/95 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg text-slate-800 dark:text-white">
                      <ZoomIn className="h-4 w-4" />
                      Expand Image
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Student profile and audit trails */}
        <div className="lg:col-span-4 space-y-6">
          {/* Student Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Submitter Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold flex items-center justify-center">
                  {complaint.studentId?.name ? complaint.studentId.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm block">
                    {complaint.studentId?.name || 'Anonymous User'}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-wider">
                    {complaint.studentId?.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Mail className="h-4 w-4 stroke-[1.5]" />
                <span>{complaint.studentId?.email}</span>
              </div>
            </div>
          </div>

          {/* Timeline audit trail tree */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5 text-indigo-500" />
              Resolution Timeline Logs
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
              {complaint.statusHistory?.map((hist, idx) => (
                <div key={hist._id || idx} className="relative space-y-1 text-left">
                  {/* Pulse Dot */}
                  <span className="absolute -left-[20.5px] top-1 bg-white dark:bg-slate-900 p-0.5 rounded-full z-10 border-2 border-transparent">
                    {getStatusIcon(hist.status)}
                  </span>

                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      Status: {hist.status}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800">
                      {new Date(hist.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    {hist.comment}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <User className="h-3 w-3" />
                    <span>Updated by: {hist.updatedBy?.name} ({hist.updatedBy?.role})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FULL EVIDENCE LIGHTBOX SCREEN OVERLAY */}
      {zoomImage && complaint.image && (
        <div
          onClick={() => setZoomImage(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={`${API_URL}${complaint.image}`}
            alt="Evidence Detail Fullscreen"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={() => setZoomImage(false)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
          >
            ❌ Close Zoom
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailsPage;
