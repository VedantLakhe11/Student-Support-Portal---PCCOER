import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageSquare, Bookmark, Share2, TrendingUp, Sparkles, Send,
  Image, Film, BarChart2, Plus, X, Globe, Lock, AlertTriangle, Flame, Award
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SocialFeedPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [trendingTags, setTrendingTags] = useState([]);
  
  // Interactive poll states
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Filters & sorting
  const [activeTab, setActiveTab] = useState('All');
  const [savesOnly, setSavesOnly] = useState(false);

  // Active commenting post id
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchPosts();
    fetchTrendingTags();
  }, [activeTab, savesOnly]);

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts', {
        params: {
          category: activeTab,
          savesOnly: savesOnly,
        },
      });
      setPosts(res.data.data);
    } catch (err) {
      toast.error('Failed to load campus feed postings.');
    }
  };

  const fetchTrendingTags = async () => {
    try {
      const res = await api.get('/posts/trending-tags');
      setTrendingTags(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const filteredOptions = pollOptions.filter(opt => opt.trim());
      const payload = {
        content: content.trim(),
        category,
        mediaUrl,
        mediaType,
        hashtags,
        pollQuestion: showPoll ? pollQuestion : '',
        pollOptions: showPoll && filteredOptions.length >= 2 ? filteredOptions : [],
      };

      const res = await api.post('/posts', payload);
      setPosts([res.data.data, ...posts]);
      
      // Cleanup inputs
      setContent('');
      setMediaUrl('');
      setMediaType('');
      setHashtags('');
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPoll(false);
      
      fetchTrendingTags();
      toast.success('Post published to campus feed!');
    } catch (err) {
      toast.error('Failed to publish post.');
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, likes: res.data.data };
        }
        return post;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/save`);
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, saves: res.data.data };
        }
        return post;
      }));
      toast.success(res.data.data.includes(user.id) ? 'Post saved to favorites' : 'Removed from favorites');
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (postId, optionId) => {
    try {
      const res = await api.post(`/posts/${postId}/poll/${optionId}/vote`);
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return { ...post, poll: res.data.data };
        }
        return post;
      }));
      toast.success('Vote recorded!');
    } catch (err) {
      toast.error('Failed to submit poll vote.');
    }
  };

  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/comment`, {
        text: commentText.trim(),
      });
      setPosts(posts.map(post => {
        if (post._id === postId) {
          return res.data.data;
        }
        return post;
      }));
      setCommentText('');
      toast.success('Comment published!');
    } catch (err) {
      toast.error('Failed to submit comment.');
    }
  };

  const handleReport = async (postId) => {
    try {
      await api.post(`/posts/${postId}/report`, {
        reason: 'Inappropriate Content / Spam',
      });
      toast.success('Post reported to campus administrators.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
      
      {/* Left panel: Post creator and feeds listings */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Post creation card */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <h2 className="text-base font-extrabold flex items-center gap-2 mb-4 bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Share Campus Insights
          </h2>

          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Announce hackathons, startup concepts, exam schedules, coding profiles, or placement templates..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-2xl p-4 text-xs font-medium focus:outline-none placeholder-slate-500 resize-none text-white"
            />

            {/* Render interactive poll builder */}
            {showPoll && (
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-orange-500" /> Create Campus Poll
                  </span>
                  <button type="button" onClick={() => setShowPoll(false)} className="p-1 hover:bg-slate-850 rounded text-slate-500 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Poll Question?"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                />
                <div className="space-y-2">
                  {pollOptions.map((opt, index) => (
                    <input
                      key={index}
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={opt}
                      onChange={(e) => {
                        const copy = [...pollOptions];
                        copy[index] = e.target.value;
                        setPollOptions(copy);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-350 focus:outline-none focus:border-orange-500"
                    />
                  ))}
                  {pollOptions.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="text-[10px] text-orange-400 font-extrabold hover:text-orange-500 flex items-center gap-1 mt-1"
                    >
                      <Plus className="h-3 w-3" /> Add another choice
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Media URLs & hashtags fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Image/Video URL (Optional)"
                value={mediaUrl}
                onChange={(e) => {
                  setMediaUrl(e.target.value);
                  setMediaType(e.target.value.includes('.mp4') ? 'video' : 'image');
                }}
                className="bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder-slate-500 text-white"
              />
              <input
                type="text"
                placeholder="Hashtags: placement, hackathon, coding (Optional)"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs focus:outline-none placeholder-slate-500 text-white"
              />
            </div>

            {/* Post button and quick tool selections */}
            <div className="flex items-center justify-between border-t border-slate-850 pt-4 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-400 focus:outline-none"
                >
                  {['General', 'Placements', 'Clubs', 'Events', 'Announcements', 'Coding', 'Startups', 'Projects'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowPoll(!showPoll)}
                  className={`p-2 rounded-xl transition-all border ${showPoll ? 'bg-orange-500 border-orange-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <BarChart2 className="h-4 w-4" />
                </button>
              </div>

              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2">
                <Send className="h-4 w-4" /> Broadcast Insight
              </button>
            </div>
          </form>
        </div>

        {/* Filter categories tabs panel */}
        <div className="flex items-center justify-between border-b border-slate-850 pb-2 flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            {['All', 'Placements', 'Clubs', 'Coding', 'Startups', 'Projects', 'Announcements'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  activeTab === tab ? 'bg-orange-500 border-orange-600 text-white shadow-lg' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSavesOnly(!savesOnly)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
              savesOnly ? 'bg-amber-500 border-amber-600 text-slate-950' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" /> Favorite Saves
          </button>
        </div>

        {/* Feed Posts container */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-slate-900 border border-slate-850 p-8 rounded-3xl text-center text-slate-500 font-bold">
              No postings found matching your active filter criteria.
            </div>
          ) : (
            posts.map(post => {
              const hasLiked = post.likes.includes(user.id);
              const hasSaved = post.saves.includes(user.id);
              return (
                <div key={post._id} className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4 hover:border-slate-800 transition-all">
                  
                  {/* Header: Author specs */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={post.author?.avatar || '/placeholder.png'} className="h-10 w-10 rounded-full border border-slate-800 object-cover" alt="avatar" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-white">{post.author?.name}</span>
                          <span className="text-[9px] bg-slate-950 border border-slate-800 px-2 py-0.2 rounded text-slate-400 uppercase font-bold">
                            {post.author?.role}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold">{post.author?.dept} | {new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-2.5 py-0.5 rounded-full">
                      <Award className="h-3.5 w-3.5 text-orange-500" />
                      <span className="text-[9px] font-extrabold text-orange-400">Lv.{post.author?.level || 1}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <p className="text-xs text-slate-300 font-medium leading-relaxed whitespace-pre-line">{post.content}</p>

                  {/* Render Polls */}
                  {post.poll && post.poll.question && (
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" /> {post.poll.question}
                      </h4>
                      <div className="space-y-2">
                        {post.poll.options.map(opt => {
                          const totalVotes = post.poll.options.reduce((sum, o) => sum + o.votes.length, 0);
                          const hasVoted = opt.votes.includes(user.id);
                          const votePercent = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                          return (
                            <button
                              key={opt._id}
                              onClick={() => handleVote(post._id, opt._id)}
                              className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden flex justify-between items-center ${
                                hasVoted ? 'border-orange-500/50 bg-orange-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900'
                              }`}
                            >
                              {/* Background vote percent bar */}
                              <div className="absolute left-0 top-0 bottom-0 bg-orange-500/5 transition-all" style={{ width: `${votePercent}%` }} />
                              <span className="text-xs font-bold relative z-10">{opt.text}</span>
                              <span className="text-xs font-extrabold text-orange-400 relative z-10">{votePercent}% ({opt.votes.length} votes)</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Media attachment displays */}
                  {post.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-850 max-h-96">
                      {post.mediaType === 'video' ? (
                        <video src={post.mediaUrl} controls className="w-full object-cover" />
                      ) : (
                        <img src={post.mediaUrl} className="w-full object-cover" alt="attachment" />
                      )}
                    </div>
                  )}

                  {/* Hashtags row */}
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.map(tag => (
                        <span key={tag} className="text-[10px] font-extrabold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons footer */}
                  <div className="flex items-center justify-between border-t border-slate-850 pt-4 text-slate-400 text-xs">
                    <button onClick={() => handleLike(post._id)} className={`flex items-center gap-1.5 hover:text-red-500 transition-colors font-bold ${hasLiked ? 'text-red-500' : ''}`}>
                      <Heart className="h-4 w-4" fill={hasLiked ? 'currentColor' : 'none'} /> {post.likes.length} Likes
                    </button>
                    <button onClick={() => setActiveCommentPost(activeCommentPost === post._id ? null : post._id)} className="flex items-center gap-1.5 hover:text-orange-400 transition-colors font-bold">
                      <MessageSquare className="h-4 w-4" /> {post.comments.length} Comments
                    </button>
                    <button onClick={() => handleSave(post._id)} className={`flex items-center gap-1.5 hover:text-amber-500 transition-colors font-bold ${hasSaved ? 'text-amber-500' : ''}`}>
                      <Bookmark className="h-4 w-4" fill={hasSaved ? 'currentColor' : 'none'} /> Favorite
                    </button>
                    <button onClick={() => handleReport(post._id)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors font-bold">
                      <AlertTriangle className="h-4 w-4" /> Flag
                    </button>
                  </div>

                  {/* Expand Comments container */}
                  {activeCommentPost === post._id && (
                    <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Publish a constructive reply..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-orange-500 text-white"
                        />
                        <button onClick={() => handleAddComment(post._id)} className="p-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white">
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {post.comments.map(comment => (
                          <div key={comment._id} className="flex gap-2.5 bg-slate-900/50 p-2.5 rounded-xl border border-slate-850/50">
                            <img src={comment.author?.avatar || '/placeholder.png'} className="h-6 w-6 rounded-full border border-slate-800 object-cover" alt="avatar" />
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-extrabold text-white">{comment.author?.name}</span>
                                <span className="text-[8px] bg-slate-950 border border-slate-800 px-1 py-0.1 rounded text-slate-400 uppercase font-bold">
                                  {comment.author?.role}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-350 leading-relaxed font-medium">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: Trending and analytics tags widgets */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Trending tags side box */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trending Hotspots
          </h3>
          <div className="space-y-3">
            {trendingTags.length === 0 ? (
              <p className="text-slate-500 text-xs font-bold">No trending hashtags logged.</p>
            ) : (
              trendingTags.map(tag => (
                <div key={tag.name} className="flex items-center justify-between p-2 hover:bg-slate-850 rounded-xl transition-all">
                  <span className="text-xs font-extrabold text-slate-350 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                    #{tag.name}
                  </span>
                  <span className="text-[9px] font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-slate-500">
                    {tag.count} posts
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic tips box */}
        <div className="bg-gradient-to-br from-slate-900 to-orange-950/20 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-3">
          <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2.5 py-0.5 rounded-full">Gamified Contributions</span>
          <h4 className="text-xs font-extrabold text-white">Elevate Your Campus Influence</h4>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            Gain +10 XP for publishing insights, +2 XP for replies, and level up your badges profile to grab premium placements recommendations from alumni guides.
          </p>
        </div>

      </div>

    </div>
  );
}
