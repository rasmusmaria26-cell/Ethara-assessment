import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import Navbar from '../components/Navbar.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Palette for project accents
const PALETTE = ['#c2643f', '#5c7a6b', '#7b6ba8', '#b07d3a', '#3a6b8a', '#8a3a5c'];

function CreateProjectModal({ onClose, onCreated }) {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]         = useState(false);
  const { addToast }                  = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/api/projects', {
        name: name.trim(),
        description: description.trim() || null,
      });
      addToast({ message: 'Project created successfully', type: 'success' });
      onCreated(res.data);
    } catch (err) {
      addToast({ message: err.response?.data?.error || 'Failed to create project', type: 'error' });
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-card w-full max-w-md shadow-modal animate-fade-in">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">New Project</h2>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-2xl leading-none">&times;</button>
        </div>
        <form id="create-project-form" onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-sans font-medium text-ink/70 mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full border border-border rounded-input px-3 py-2 text-sm font-sans text-ink bg-cream focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 transition-colors duration-150"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-sans font-medium text-ink/70 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              rows={3}
              placeholder="What is this project about?"
              className="w-full border border-border rounded-input px-3 py-2 text-sm font-sans text-ink bg-cream focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 transition-colors duration-150 resize-none overflow-hidden"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-sans font-medium text-ink/60 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-sans bg-terracotta text-white rounded-input hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Shimmer = () => (
  <div className="animate-pulse space-y-8">
    <div className="space-y-4">
      <div className="h-10 bg-sand rounded w-3/4"></div>
      <div className="h-4 bg-sand rounded w-1/4"></div>
      <div className="space-y-2 pt-2">
        <div className="h-4 bg-sand rounded w-full"></div>
        <div className="h-4 bg-sand rounded w-5/6"></div>
      </div>
    </div>
    <div className="flex gap-12 border-y border-border py-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-8 bg-sand rounded w-16"></div>
          <div className="h-3 bg-sand rounded w-12"></div>
        </div>
      ))}
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-sand rounded w-12"></div>
      <div className="flex gap-2">
        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-sand"></div>)}
      </div>
    </div>
  </div>
);

export default function Projects() {
  const [projects, setProjects]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [showCreate, setShowCreate]         = useState(false);
  const [hoveredProjectId, setHoveredId]     = useState(null);
  const [selectedProjectId, setSelectedId]   = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { addToast }                        = useToast();
  const navigate                            = useNavigate();
  
  const projectCache = useRef(new Map());
  const debounceTimer = useRef(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.get('/api/projects');
        setProjects(res.data);
      } catch (err) {
        addToast({ message: 'Failed to load projects', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [addToast]);

  const activeId = hoveredProjectId || selectedProjectId;
  const activeData = activeId ? projectCache.current.get(activeId) : null;

  const fetchProjectDetails = async (id) => {
    if (projectCache.current.has(id)) return;
    
    setLoadingDetails(true);
    try {
      const [detailRes, dashRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/projects/${id}/dashboard`)
      ]);
      projectCache.current.set(id, { ...detailRes.data, ...dashRes.data });
      setLoadingDetails(false);
    } catch (err) {
      console.error('Failed to fetch details', err);
      setLoadingDetails(false);
    }
  };

  const handleHover = (id) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setHoveredId(id);
      if (id) fetchProjectDetails(id);
    }, 120);
  };

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
    setShowCreate(false);
    setSelectedId(newProject.id);
    fetchProjectDetails(newProject.id);
  };

  const getAccentColor = (index) => PALETTE[index % PALETTE.length];

  return (
    <div className="min-h-screen bg-cream selection:bg-terracotta/10">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-12 min-h-[600px]">
          
          {/* LEFT PANEL: Project List */}
          <div className="w-full lg:w-[35%] flex flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="font-serif text-2xl text-ink">Projects</h1>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-terracotta text-white text-xs font-sans font-medium px-4 py-2 rounded-input hover:bg-terracotta/90 transition-all shadow-sm active:scale-[0.98]"
              >
                + New Project
              </button>
            </div>

            <div className="relative flex-1">
              <div 
                className="max-h-[700px] overflow-y-auto pr-2 space-y-1 custom-scrollbar"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)'
                }}
              >
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-16 bg-sand/50 rounded-card animate-pulse mb-1"></div>
                  ))
                ) : projects.length === 0 ? (
                  <div className="text-center py-12 px-4 border border-dashed border-border rounded-card">
                    <p className="font-sans text-sm text-ink/40">No projects found</p>
                  </div>
                ) : (
                  projects.map((p, i) => {
                    const isActive = activeId === p.id;
                    const accentColor = getAccentColor(i);
                    
                    return (
                      <div
                        key={p.id}
                        onMouseEnter={() => handleHover(p.id)}
                        onMouseLeave={() => handleHover(null)}
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className={`
                          relative px-5 py-4 cursor-pointer transition-all duration-[150ms] rounded-card group
                          ${isActive ? 'bg-sand/40 border-l-[3px]' : 'bg-transparent border-l-[3px] border-l-transparent hover:bg-sand/20'}
                        `}
                        style={{ borderLeftColor: isActive ? accentColor : 'transparent' }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: accentColor }}
                          />
                          <span className={`text-[16px] font-sans font-medium transition-colors ${isActive ? 'text-ink' : 'text-ink/70 group-hover:text-ink'}`}>
                            {p.name}
                          </span>
                          <span className="text-[10px] font-sans uppercase tracking-tighter bg-sand px-1.5 py-0.5 rounded-badge text-ink/40">
                            {p.role}
                          </span>
                        </div>
                        <p className="text-[12px] font-sans text-ink/40 ml-5 truncate">
                          {p.total_tasks ? `${p.total_tasks} tasks` : 'No tasks yet'}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Spotlight Preview */}
          <div className="hidden lg:block w-[65%] relative">
            <div className="sticky top-12 bg-surface rounded-card border border-border/60 p-10 min-h-[500px] shadow-card overflow-hidden transition-all duration-300">
              
              {!activeId ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                  <h2 className="font-serif text-[48px] text-ink/10 select-none">Select a project</h2>
                  <p className="font-sans text-[13px] text-ink/30 uppercase tracking-widest mt-2">Hover over a project to preview</p>
                </div>
              ) : (
                <div 
                  key={activeId} 
                  className="relative animate-fade-in transition-all duration-200"
                  style={{ animationName: 'spotlight-fade' }}
                >
                  {/* Decorative Circle */}
                  <div 
                    className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full blur-[80px] pointer-events-none"
                    style={{ backgroundColor: getAccentColor(projects.findIndex(p => p.id === activeId)), opacity: 0.12 }}
                  />

                  {loadingDetails ? <Shimmer /> : activeData && (
                    <div className="space-y-10">
                      {/* Top Section */}
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-1 self-stretch rounded-full" 
                            style={{ backgroundColor: getAccentColor(projects.findIndex(p => p.id === activeId)) }}
                          />
                          <div className="space-y-1">
                            <h2 className="font-serif text-[42px] leading-tight text-ink">{activeData.name}</h2>
                            <span className="inline-block text-[13px] font-sans uppercase tracking-wider text-terracotta font-semibold">
                              {activeData.currentUserRole || activeData.role}
                            </span>
                          </div>
                        </div>
                        <p className="font-sans text-[15px] text-ink/60 max-w-lg leading-relaxed line-clamp-3">
                          {activeData.description || 'This project has no description yet. Start by adding a summary of goals and objectives.'}
                        </p>
                        <Link 
                          to={`/projects/${activeId}`}
                          className="inline-block text-terracotta text-sm font-sans font-medium hover:translate-x-1 transition-transform pt-2"
                        >
                          Open Project &rarr;
                        </Link>
                      </div>

                      {/* Stats Strip */}
                      <div className="flex items-center gap-12 border-y border-border/50 py-8">
                        {[
                          { label: 'Total Tasks', value: activeData.total_tasks || 0 },
                          { label: 'Members', value: activeData.members?.length || 0 },
                          { label: 'Created', value: new Date(activeData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
                        ].map((stat, i) => (
                          <div key={stat.label} className="flex items-center gap-12">
                            <div className="space-y-1">
                              <div className="font-serif text-[32px] text-ink leading-none">{stat.value}</div>
                              <div className="text-[11px] font-sans uppercase tracking-widest text-ink/40 font-medium">{stat.label}</div>
                            </div>
                            {i < 2 && <div className="h-8 w-[1px] bg-border" />}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-12">
                        {/* Members Section */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-sans uppercase tracking-widest text-ink/40 font-bold">Team</h4>
                          <div className="flex -space-x-3 items-center">
                            {activeData.members?.slice(0, 6).map((m, idx) => (
                              <div 
                                key={m.id}
                                title={m.name}
                                className="w-8 h-8 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-sans font-bold text-white shadow-sm cursor-help"
                                style={{ backgroundColor: getAccentColor(idx) }}
                              >
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {activeData.members?.length > 6 && (
                              <div className="w-8 h-8 rounded-full bg-sand border-2 border-surface flex items-center justify-center text-[10px] font-sans font-bold text-ink/40">
                                +{activeData.members.length - 6}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress Section */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-sans uppercase tracking-widest text-ink/40 font-bold">Progress</h4>
                          {activeData.total_tasks > 0 ? (
                            <div className="space-y-3">
                              <div className="h-2 w-full bg-sand rounded-full flex overflow-hidden">
                                {['todo', 'inprogress', 'done'].map((status) => {
                                  const count = activeData.by_status?.[status] || 0;
                                  const pct = (count / activeData.total_tasks) * 100;
                                  const color = status === 'todo' ? '#e2e8f0' : status === 'inprogress' ? '#c2643f' : '#16653499';
                                  return (
                                    <div 
                                      key={status}
                                      style={{ width: `${pct}%`, backgroundColor: color }}
                                      className="h-full transition-all duration-500"
                                    />
                                  );
                                })}
                              </div>
                              <div className="flex justify-between text-[10px] font-sans font-medium text-ink/50 uppercase tracking-tighter">
                                <span>Todo: {Math.round((activeData.by_status?.todo || 0) / activeData.total_tasks * 100)}%</span>
                                <span>In Progress: {Math.round((activeData.by_status?.inprogress || 0) / activeData.total_tasks * 100)}%</span>
                                <span>Done: {Math.round((activeData.by_status?.done || 0) / activeData.total_tasks * 100)}%</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs font-sans text-ink/30 italic">No tasks yet</p>
                          )}
                        </div>
                      </div>

                      <div className="pt-6">
                        <Link to={`/projects/${activeId}`} className="text-[13px] font-sans text-ink/40 hover:text-ink transition-colors flex items-center gap-1 group">
                          View Dashboard 
                          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleProjectCreated}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spotlight-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e8e0d0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c2643f44;
        }
      `}} />
    </div>
  );
}
