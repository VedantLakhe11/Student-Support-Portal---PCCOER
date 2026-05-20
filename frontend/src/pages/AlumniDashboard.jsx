import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  HeartHandshake, BookOpen, Clock, Plus, Send, MessagesSquare, Sparkles, Check, X,
  ThumbsUp, Calendar, MapPin, Eye, GraduationCap, Flame, Briefcase, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AlumniDashboard = () => {
  const { user } = () => useAuth();
  const activeUser = user || JSON.parse(localStorage.getItem('user'));

  // Active Tab: 'Requests', 'Blogs', 'Forum'
  const [activeTab, setActiveTab] = useState('Requests');

  // ==========================================
  // TAB 1: MENTORSHIP REQUESTS SENT BY STUDENTS
  // ==========================================
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const fetchMentorshipRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await api.get('/university/mentors');
      // Find active alumni mentor profile corresponding to user id
      const currentAlum = res.data.data.find(m => m.userId?._id?.toString() === activeUser?._id?.toString());
      if (currentAlum) {
        setRequests(currentAlum.studentsRequested || []);
      }
    } catch (err) {
      toast.error('Failed to load student connection requests.');
    } finally {
      setLoadingRequests(false);
    }
  };

  const acceptMentorshipRequest = async (studentId) => {
    try {
      // Find current mentor profile ID first
      const mentorsRes = await api.get('/university/mentors');
      const currentAlum = mentorsRes.data.data.find(m => m.userId?._id?.toString() === activeUser?._id?.toString());
      if (!currentAlum) return toast.error('Alumni mentor profile not configured.');

      await api.post(`/university/mentors/${currentAlum._id}/approve`, { studentId });
      toast.success('Connection request approved! Mentoring active.');
      fetchMentorshipRequests();
    } catch (err) {
      toast.error('Failed to approve mentorship request.');
    }
  };

  // ==========================================
  // TAB 2: PLACEMENT GUIDANCE BLOGS
  // ==========================================
  const [blogs, setBlogs] = useState([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: '', content: '', category: 'Interview Experience' });
  const [submittingBlog, setSubmittingBlog] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await api.get('/university/mentors');
      const currentAlum = res.data.data.find(m => m.userId?._id?.toString() === activeUser?._id?.toString());
      if (currentAlum) {
        setBlogs(currentAlum.guidanceBlogs || []);
      }
    } catch (err) {
      toast.error('Failed to load guidance journals.');
    }
  };

  const submitGuidanceBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      return toast.error('Please fill in blog title and guidance content');
    }
    try {
      setSubmittingBlog(true);
      // Find mentor profile ID first
      const mentorsRes = await api.get('/university/mentors');
      const currentAlum = mentorsRes.data.data.find(m => m.userId?._id?.toString() === activeUser?._id?.toString());
      if (!currentAlum) return toast.error('Alumni mentor profile not configured.');

      await api.post(`/university/mentors/${currentAlum._id}/blog`, blogForm);
      toast.success('Placement Guidance Blog published successfully!');
      setShowBlogForm(false);
      setBlogForm({ title: '', content: '', category: 'Interview Experience' });
      fetchBlogs();
    } catch (err) {
      toast.error('Failed to publish guidance journal.');
    } finally {
      setSubmittingBlog(false);
    }
  };

  // ==========================================
  // TAB 3: FORUM
  // ==========================================
  const [posts, setPosts] = useState([]);
  const [postBody, setPostBody] = useState('');
  const [postTag, setPostTag] = useState('General');
  const [postLoading, setPostLoading] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const fetchForum = async () => {
    try {
      const res = await api.get('/forum');
      setPosts(res.data.data);
    } catch (err) {
      toast.error('Failed to retrieve peer discussions.');
    }
  };

  const submitForumPost = async (e) => {
    e.preventDefault();
    if (!postBody.trim()) return toast.error('Discussion body cannot be empty');
    try {
      setPostLoading(true);
      await api.post('/forum', { body: postBody, tag: postTag });
      toast.success('Discussion published successfully!');
      setPostBody('');
      fetchForum();
    } catch (err) {
      toast.error('Failed to post discussion.');
    } finally {
      setPostLoading(false);
    }
  };

  const likePost = async (id) => {
    try {
      await api.post(`/forum/${id}/like`);
      fetchForum();
    } catch (err) {
      toast.error('Casting vote failed.');
    }
  };

  const submitComment = async (id) => {
    if (!commentText.trim()) return toast.error('Reply text cannot be empty');
    try {
      await api.post(`/forum/${id}/comment`, { text: commentText });
      toast.success('Comment reply published!');
      setCommentText('');
      setActiveCommentPost(null);
      fetchForum();
    } catch (err) {
      toast.error('Failed to publish reply.');
    }
  };

  useEffect(() => {
    if (activeTab === 'Requests') fetchMentorshipRequests();
    if (activeTab === 'Blogs') fetchBlogs();
    if (activeTab === 'Forum') fetchForum();
  }, [activeTab]);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Alumni Headings */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5 text-left">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            Welcome Mentor, {activeUser?.name.split(' ')[0]}!
            <Sparkles className="h-6 w-6 text-orange-500 fill-current  shrink-0" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            Alumni & Corporate Guidance Dashboard • PCCOER Campus Support Network
          </p>
        </div>

        {activeTab === 'Blogs' && (
          <button
            onClick={() => setShowBlogForm(!showBlogForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl shadow text-xs transition-all"
          >
            {showBlogForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showBlogForm ? 'Close Editor' : 'Write Guidance Log'}
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200/50 dark:border-slate-800/40 pb-2 scrollbar-thin">
        {[
          { id: 'Requests', label: 'Mentoring Requests', icon: HeartHandshake },
          { id: 'Blogs', label: 'My Placement Journals', icon: FileText },
          { id: 'Forum', label: 'Campus peer Discussions', icon: MessagesSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500 text-white shadow shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* PANELS */}
      <div className="mt-6">

        {/* 1. MENTORING CONNECTION MANAGER */}
        {activeTab === 'Requests' && (
          <div className="space-y-6">
            {loadingRequests ? (
              <div className="grid sm:grid-cols-2 gap-6 animate-pulse">
                <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
                <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl max-w-xl mx-auto space-y-3">
                <div className="bg-orange-500/10 text-orange-500 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto"><HeartHandshake className="h-6 w-6" /></div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">No Pending Requests</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">There are no outstanding mentorship invitations from students at the moment. Keep active in the discussions to share guidance!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {requests.map((r, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex flex-col justify-between text-left shadow-sm">
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-orange-500/15 text-orange-500 font-extrabold flex items-center justify-center text-xs">
                            {r.studentName?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-800 dark:text-white text-sm leading-tight">{r.studentName}</h4>
                            <span className="text-[10px] font-bold text-slate-400">Student • PRN: {r.studentPrn || '720...'}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/25'
                        }`}>
                          {r.status || 'Pending'}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-850 rounded-xl text-xs text-slate-550 dark:text-slate-400 leading-relaxed italic">
                        "{r.message || 'Hi, I am looking for software engineering interview preparation guidance.'}"
                      </div>
                    </div>

                    {r.status !== 'Approved' && (
                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                        <button
                          onClick={() => acceptMentorshipRequest(r.studentId)}
                          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve Invite</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. PLACEMENT JOURNALS */}
        {activeTab === 'Blogs' && (
          <div className="space-y-6">
            {/* Editor Drawer */}
            <AnimatePresence>
              {showBlogForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-6 text-left"
                >
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-3">Draft Placement Experience Journal</h3>
                  <form onSubmit={submitGuidanceBlog} className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Journal Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. My Capgemini Interview Experience - 3 Rounds Guide"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-orange-500"
                          value={blogForm.title}
                          onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Category Tag</label>
                        <select
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-sm outline-none cursor-pointer"
                          value={blogForm.category}
                          onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                        >
                          <option value="Interview Experience">Interview Experience</option>
                          <option value="Internship Tips">Internship Tips</option>
                          <option value="DSA Prep">DSA Preparation Roadmap</option>
                          <option value="Web3 Coding">Web3 Coding Guides</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Guidance content</label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Break down your rounds: aptitude tests, technical coding tasks, coding schemas, and managerial HR interviews."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-xs outline-none resize-none focus:border-orange-500"
                          value={blogForm.content}
                          onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 border-t dark:border-slate-800 pt-4">
                      <button type="button" onClick={() => setShowBlogForm(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
                      <button type="submit" disabled={submittingBlog} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-2">
                        {submittingBlog ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Publish Journal <Send className="h-3.5 w-3.5" /></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List */}
            {blogs.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl max-w-xl mx-auto space-y-3">
                <div className="bg-orange-500/10 text-orange-500 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto"><FileText className="h-6 w-6" /></div>
                <h4 className="font-extrabold text-slate-800 dark:text-white text-lg">No Blogs Written</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Publish your placement journals to help junior students pass recruiting assessments!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl flex flex-col justify-between text-left shadow-sm relative">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-3xl">📝</span>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                          {blog.category}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-800 dark:text-white text-base leading-snug">{blog.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-4">{blog.content}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Published by: <span className="font-bold">{activeUser?.name}</span></span>
                      <button
                        onClick={() => toast.success(`Journal:\n\n${blog.content}`, { duration: 6000 })}
                        className="text-orange-500 font-extrabold hover:underline"
                      >
                        Read full
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. DISCUSSIONS peer FORUM */}
        {activeTab === 'Forum' && (
          <div className="space-y-8 text-left">
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column */}
              <div className="md:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-5">
                <div className="flex items-center gap-2">
                  <MessagesSquare className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">Broadcast Professional Thread</h3>
                </div>

                <form onSubmit={submitForumPost} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Broadcaster Text</label>
                    <textarea
                      required
                      rows={5}
                      maxLength={1000}
                      placeholder="Share open hiring positions, Capgemini or TCS assessment alerts, or general professional advice..."
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-4 text-xs outline-none resize-none focus:border-orange-500"
                      value={postBody}
                      onChange={(e) => setPostBody(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-450 tracking-wider mb-2">Category Tag</label>
                    <select
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-xs outline-none cursor-pointer"
                      value={postTag}
                      onChange={(e) => setPostTag(e.target.value)}
                    >
                      <option value="Placements">Placements Announcements</option>
                      <option value="General">General Broadcast</option>
                      <option value="Technical">Technical Curriculums</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={postLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {postLoading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Broadcast post <Send className="h-3.5 w-3.5" /></>}
                  </button>
                </form>
              </div>

              {/* Right Column */}
              <div className="md:col-span-7 space-y-6">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-6 rounded-2xl shadow-sm hover:shadow transition-shadow space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-500 text-white font-black flex items-center justify-center text-xs shrink-0 select-none">
                          {post.userName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-white text-xs md:text-sm leading-none">{post.userName}</h4>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 block">{post.userRole}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded border" style={{ color: post.tagColor, borderColor: `${post.tagColor}40`, backgroundColor: `${post.tagColor}0D` }}>
                        {post.tag}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-350 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-5 text-slate-450 dark:text-slate-500 text-xs font-bold">
                      <button onClick={() => likePost(post._id)} className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        <span>Upvote ({post.likes?.length || 0})</span>
                      </button>
                      <button onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)} className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors">
                        <MessagesSquare className="h-4 w-4" />
                        <span>Replies ({post.comments?.length || 0})</span>
                      </button>
                    </div>

                    {/* Comments list */}
                    {activeCommentPost === post._id && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="space-y-3.5 pl-3 border-l-2 border-slate-200 dark:border-slate-850">
                          {post.comments?.map((comment, cIdx) => (
                            <div key={cIdx} className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="font-extrabold text-slate-700 dark:text-slate-300">{comment.userName}</span>
                                <span className="text-slate-400 font-medium">({comment.userRole})</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{comment.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reply box */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Type comment reply..."
                            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                          />
                          <button
                            onClick={() => submitComment(post._id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 rounded-xl text-xs transition-colors"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniDashboard;
