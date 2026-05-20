import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft, Calendar, User, Mail, Shield, FileText, Clock, CheckCircle,
  HelpCircle, AlertTriangle, ZoomIn, MessageSquare, Send, Heart, ArrowUpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomImage, setZoomImage] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Dynamic Base API URL for images
  const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';

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

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return toast.error('Comment reply text is required');

    try {
      setSubmittingComment(true);
      const res = await api.post(`/complaints/${id}/comment`, { text: commentText.trim() });
      toast.success(res.data.message || 'Comment reply posted!');
      setCommentText('');
      // Refetch to see updated comments and thread
      fetchComplaintDetails();
    } catch (err) {
      toast.error('Failed to submit comment. Verified students & staff only.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
          Fetching ticket details and timeline...
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
      Closed: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200/10',
    };
    return schemes[status] || schemes.Pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-amber-600 " />;
      default:
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-6 font-sans pb-12 text-left">
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

      <div className="grid lg:grid-cols-12 gap-8 items-start">
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
              <div className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500 font-medium">
                <Calendar className="h-4 w-4" />
                <span>Filed {new Date(complaint.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Title & Desc */}
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-850 dark:text-white leading-tight">
                {complaint.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200/20 dark:border-slate-800/10">
                {complaint.description}
              </p>
            </div>

            {/* Image Preview evidence */}
            {complaint.image && (
              <div className="space-y-3 pt-4 border-t border-slate-150 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Incident Evidence Image
                </h4>
                <div className="relative group max-w-lg rounded-2xl overflow-hidden shadow border border-slate-200/50 dark:border-slate-800">
                  <img
                    src={`${complaint.image.startsWith('http') ? '' : API_URL}${complaint.image}`}
                    alt="Ticket Evidence"
                    className="w-full h-80 object-cover cursor-zoom-in group-hover:scale-102 transition-transform duration-300"
                    onClick={() => setZoomImage(true)}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-zoom-in pointer-events-none">
                    <span className="bg-white/95 dark:bg-slate-900/95 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg text-slate-850 dark:text-white">
                      <ZoomIn className="h-4 w-4" />
                      Expand Evidence
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* COMMENTS & DISCUSSION PANEL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-850 dark:text-white border-b dark:border-slate-800 pb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Ticket Discussion Thread ({complaint.comments?.length || 0})
            </h3>

            {/* Comments list thread */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {complaint.comments?.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No comments published on this grievance ticket yet.
                </div>
              ) : (
                complaint.comments?.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 flex gap-3 items-start">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-500 text-white font-black flex items-center justify-center text-xs shrink-0 select-none">
                      {c.author?.name ? c.author.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 leading-none">{c.author?.name || 'Campus Member'}</span>
                          <span className="text-[9px] uppercase font-bold text-slate-400">({c.author?.role})</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write comment reply */}
            <form onSubmit={handlePostComment} className="flex gap-3 border-t dark:border-slate-800 pt-4">
              <input
                type="text"
                placeholder="Submit ticket comments or resolutions progress details..."
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-3 px-4 text-xs outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={submittingComment}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 rounded-xl transition-all shadow-md shadow-orange-500/10 flex items-center justify-center gap-1.5 text-xs disabled:opacity-75"
              >
                {submittingComment ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Comment
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Student profile and audit trails */}
        <div className="lg:col-span-4 space-y-6">
          {/* Submitter details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Submitter details
            </h3>
            <div className="space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-500 text-white font-black flex items-center justify-center text-sm shadow">
                  {complaint.studentId?.name ? complaint.studentId.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <span className="font-extrabold text-slate-850 dark:text-slate-200 text-sm block leading-tight">
                    {complaint.isAnonymous ? 'Anonymous' : complaint.studentId?.name || 'Academic'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase mt-1 block">
                    {complaint.isAnonymous ? 'Student' : complaint.studentId?.role}
                  </span>
                </div>
              </div>

              {!complaint.isAnonymous && complaint.studentId?.email && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-850">
                  <Mail className="h-4 w-4 stroke-[1.5]" />
                  <span>{complaint.studentId?.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline audit trail tree */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2.5 flex items-center gap-1.5">
              <ArrowUpCircle className="h-4.5 w-4.5 text-indigo-500" />
              Resolution Timeline Logs
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-250 dark:before:bg-slate-800">
              {complaint.statusHistory?.map((hist, idx) => (
                <div key={hist._id || idx} className="relative space-y-1 text-left">
                  {/* Pulse Dot */}
                  <span className="absolute -left-[20.5px] top-1 bg-white dark:bg-slate-900 p-0.5 rounded-full z-10">
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

                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 leading-relaxed">
                    {hist.comment}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <User className="h-3 w-3" />
                    <span>Updated by: {hist.updatedBy?.name || 'Mediator'} ({hist.updatedBy?.role || 'Staff'})</span>
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
            src={`${complaint.image.startsWith('http') ? '' : API_URL}${complaint.image}`}
            alt="Evidence Detail Fullscreen"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
          <button
            onClick={() => setZoomImage(false)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs transition-colors"
          >
            Close Evidence Screen
          </button>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetailsPage;
