import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, Folder, Globe, Send, Plus, X, Check, AlertCircle, Award, Briefcase, HelpCircle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProjectsHubPage() {
  const [projects, setProjects] = useState([]);
  const [skillMatches, setSkillMatches] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [rolePositions, setRolePositions] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Apply join request modal
  const [applyProjectId, setApplyProjectId] = useState(null);
  const [applyRole, setApplyRole] = useState('');
  const [applyMessage, setApplyMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchProjects();
    fetchMatches();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      toast.error('Failed to load campus projects list.');
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await api.get('/projects/matchmaking');
      setSkillMatches(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      const res = await api.post('/projects', {
        title: title.trim(),
        description: description.trim(),
        tags,
        githubUrl,
        demoUrl,
        rolePositions,
      });

      setProjects([res.data.data, ...projects]);
      setTitle('');
      setDescription('');
      setTags('');
      setRolePositions('');
      setGithubUrl('');
      setDemoUrl('');
      setShowCreateModal(false);
      
      toast.success('Project showcase successfully launched!');
    } catch (err) {
      toast.error('Failed to launch project.');
    }
  };

  const handleApplyJoin = async (e) => {
    e.preventDefault();
    if (!applyRole.trim()) return;

    try {
      await api.post(`/projects/${applyProjectId}/join`, {
        role: applyRole,
        message: applyMessage,
      });

      setApplyProjectId(null);
      setApplyRole('');
      setApplyMessage('');
      
      toast.success('Join request submitted to project founder!');
      fetchProjects();
    } catch (err) {
      toast.error('Join request failed to submit.');
    }
  };

  const handleRespondRequest = async (projectId, requestId, action) => {
    try {
      await api.post(`/projects/${projectId}/respond/${requestId}`, { action });
      toast.success(`Applicant request successfully ${action}!`);
      fetchProjects();
      fetchMatches();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 text-white">
      
      {/* Left panel: Showcase cards */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Hub Welcome Header */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl flex justify-between items-center flex-wrap gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2.5 py-0.5 rounded-full">PCCOER Ecosystem</span>
            <h2 className="text-base font-extrabold">Startup & Project Collaboration Hub</h2>
            <p className="text-[10px] text-slate-400 font-medium">Recruit developers, craft startup teams, and showcase hackathon ideas.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Declare Showcase
          </button>
        </div>

        {/* Projects showcases */}
        <div className="space-y-6">
          {projects.length === 0 ? (
            <div className="bg-slate-900 border border-slate-850 p-8 rounded-3xl text-center text-slate-500 font-bold">
              No collaborative showcases currently registered. Be the first to build a squad!
            </div>
          ) : (
            projects.map(proj => {
              const isOwner = proj.creator?._id === user.id;
              const hasJoined = proj.teammates.some(t => t._id === user.id);
              const pendingRequests = proj.teamRequests?.filter(r => r.status === 'pending') || [];
              return (
                <div key={proj._id} className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl hover:border-slate-800 transition-all space-y-4">
                  
                  {/* Creator details and title */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-extrabold text-white">{proj.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">By {proj.creator?.name}</span>
                        <span className="h-1 w-1 bg-slate-500 rounded-full" />
                        <span className="text-[10px] text-orange-400 font-extrabold">{proj.creator?.dept}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl text-slate-400 hover:text-white" title="View Repository">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                        </a>
                      )}
                      {proj.demoUrl && (
                        <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl text-slate-400 hover:text-white">
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-350 leading-relaxed font-medium">{proj.description}</p>

                  {/* Vacancy Roster */}
                  {proj.rolePositions?.length > 0 && (
                    <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-2">
                      <span className="text-[9px] font-extrabold text-orange-500 tracking-wider uppercase flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" /> Vacant Positions Recruiting
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {proj.rolePositions.map(role => (
                          <span key={role} className="text-[10px] font-extrabold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teammates list */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dev Squad Teammates</span>
                    <div className="flex flex-wrap gap-3">
                      {proj.teammates.map(tm => (
                        <div key={tm._id} className="flex items-center gap-2 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-xl">
                          <img src={tm.avatar || '/placeholder.png'} className="h-5 w-5 rounded-full border border-slate-800" alt="avatar" />
                          <span className="text-[10px] font-extrabold text-white">{tm.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Creator specific applicants dashboard */}
                  {isOwner && pendingRequests.length > 0 && (
                    <div className="bg-slate-950 border border-orange-500/20 p-4 rounded-2xl space-y-3">
                      <span className="text-[9px] font-extrabold text-orange-400 tracking-wide uppercase flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-orange-500" /> Pending Recruitment Applicants ({pendingRequests.length})
                      </span>
                      <div className="space-y-2.5">
                        {pendingRequests.map(req => (
                          <div key={req._id} className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2.5">
                              <img src={req.user?.avatar || '/placeholder.png'} className="h-8 w-8 rounded-full border border-slate-850" alt="avatar" />
                              <div className="flex flex-col">
                                <span className="text-xs font-extrabold text-white">{req.user?.name}</span>
                                <span className="text-[9px] text-slate-400 font-bold">Applying for: <b className="text-orange-400">{req.role}</b></span>
                                {req.message && <span className="text-[9px] text-slate-500 italic mt-0.5 font-medium">"{req.message}"</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button onClick={() => handleRespondRequest(proj._id, req._id, 'approved')} className="p-1.5 bg-green-600/20 hover:bg-green-600 border border-green-500/30 text-green-400 hover:text-white rounded-lg transition-colors">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleRespondRequest(proj._id, req._id, 'rejected')} className="p-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white rounded-lg transition-colors">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apply actions */}
                  {!isOwner && !hasJoined && (
                    <button
                      onClick={() => setApplyProjectId(proj._id)}
                      className="w-full py-2 bg-slate-950 hover:bg-orange-500 border border-slate-800 hover:border-orange-600 rounded-xl text-xs font-extrabold transition-all"
                    >
                      Apply to Join Squad
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: Matches */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Dynamic skills matchmaker */}
        <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl shadow-xl">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Branch Skills Matchmaker
          </h3>
          <div className="space-y-4">
            {skillMatches.length === 0 ? (
              <div className="bg-slate-950 p-4 rounded-2xl text-center border border-slate-850">
                <AlertCircle className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                <p className="text-slate-500 text-[10px] font-bold">Populate your branch skills badges inside settings to activate matches!</p>
              </div>
            ) : (
              skillMatches.map(match => (
                <div key={match._id} className="bg-slate-950 border border-slate-850 p-3 rounded-2xl space-y-2 hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-2.5">
                    <img src={match.avatar || '/placeholder.png'} className="h-8 w-8 rounded-full border border-slate-800 object-cover" alt="avatar" />
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-white">{match.name}</span>
                      <span className="text-[9px] text-orange-400 font-bold">{match.dept}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {match.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-[9px] font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic tips box */}
        <div className="bg-gradient-to-br from-slate-900 to-orange-950/20 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-2">
          <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2.5 py-0.5 rounded-full">Startup Incubator</span>
          <h4 className="text-xs font-extrabold text-white">Create Teammates Sync</h4>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            Invite fellow coders, build and verify repository tags, publish live deployment widgets, and Pitch to Faculty heads inside suggestions!
          </p>
        </div>

      </div>

      {/* MODAL: Declare Project Showcase */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 max-w-lg w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-extrabold text-white">Declare Collaborative Project</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-slate-350 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-[10px] text-slate-500 uppercase">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PCCOER Study Guide App"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-[10px] text-slate-500 uppercase">Description / Objectives</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain startup idea and developer skills wanted..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-[10px] text-slate-500 uppercase">Core Stack Tags</label>
                  <input
                    type="text"
                    placeholder="React, AI, Python"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-[10px] text-slate-500 uppercase">Roles Vacant</label>
                  <input
                    type="text"
                    placeholder="UI Designer, ML Engineer"
                    value={rolePositions}
                    onChange={(e) => setRolePositions(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="GitHub URL (Optional)"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Live Demo URL (Optional)"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-extrabold transition-all shadow-lg">
                Publish Showcase Card
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Apply Join Squad */}
      {applyProjectId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Apply for Vacancy</h3>
              <button onClick={() => setApplyProjectId(null)} className="p-1 hover:bg-slate-800 rounded text-slate-400">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleApplyJoin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[10px] text-slate-500 uppercase">Target Role Position</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Developer"
                  value={applyRole}
                  onChange={(e) => setApplyRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[10px] text-slate-500 uppercase">Why you are a fit? (Badges / Skills)</label>
                <textarea
                  rows={2}
                  placeholder="Detail your contribution score or portfolio credentials..."
                  value={applyMessage}
                  onChange={(e) => setApplyMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <button type="submit" className="w-full py-2 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-extrabold transition-all">
                Submit Teammate Application
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
