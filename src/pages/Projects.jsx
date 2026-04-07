import { useState, useEffect } from 'react';
import { supabase, SITES } from '../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Search, 
  Filter,
  MoreVertical,
  ChevronDown,
  Star,
  X,
  Briefcase
} from 'lucide-react';

import ImagePicker from '../components/ImagePicker';

const GithubIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Projects({ siteId }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [syncAll, setSyncAll] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tech_stack: '',
    highlights: '',
    status: '',
    category: '',
    link: '',
    github_link: '',
    image_url: '',
    is_featured: false
  });

  useEffect(() => {
    if (siteId) fetchProjects();
  }, [siteId]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    
    if (data) setProjects(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      site_id: siteId,
      tech_stack: formData.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
      highlights: formData.highlights.split('\n').map(s => s.trim()).filter(Boolean)
    };

    if (editingProject) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editingProject.id);
      if (!error) {
        setEditingProject(null);
        fetchProjects();
      }
    } else {
      const inserts = [payload];
      if (syncAll) {
        const otherSiteId = siteId === SITES.knownv ? SITES.heartware : SITES.knownv;
        inserts.push({ ...payload, site_id: otherSiteId });
      }
      const { error } = await supabase.from('projects').insert(inserts);
      if (!error) {
        setIsAddingProject(false);
        fetchProjects();
      }
    }
    
    // Reset form
    setFormData({
      title: '', description: '', tech_stack: '', highlights: '',
      status: '', category: '', link: '', github_link: '', image_url: '',
      is_featured: false
    });
    setIsAddingProject(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (!error) fetchProjects();
    }
  };

  const startEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      tech_stack: (project.tech_stack || []).join(', '),
      highlights: (project.highlights || []).join('\n'),
      status: project.status || '',
      category: project.category || '',
      link: project.link || '',
      github_link: project.github_link || '',
      image_url: project.image_url || '',
      is_featured: project.is_featured || false
    });
    setIsAddingProject(true);
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-orbitron text-white">Manage Projects</h1>
          <p className="text-white/40 text-sm">Create, edit and remove projects from your website.</p>
        </div>
        <button 
          onClick={() => { setIsAddingProject(true); setEditingProject(null); setFormData({
            title: '', description: '', tech_stack: '', highlights: '',
            status: '', category: '', link: '', github_link: '', image_url: '', is_featured: false
          }); }}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary/60 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all border border-white/10"
        >
          <Plus size={20} />
          Add New Project
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-l-4 border-l-primary flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg"><Briefcase size={20} /></div>
          <div><p className="text-xs text-white/40 uppercase">Total</p><p className="text-xl font-bold">{projects.length}</p></div>
        </div>
        <div className="glass-card p-4 border-l-4 border-l-amber-500 flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg"><Star size={20} className="text-amber-500" /></div>
          <div><p className="text-xs text-white/40 uppercase tracking-tighter">Featured</p><p className="text-xl font-bold">{projects.filter(p => p.is_featured).length}</p></div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
          />
        </div>
      </div>

      {/* Form Overlay */}
      {isAddingProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAddingProject(false)}></div>
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">{editingProject ? 'Edit' : 'Add'} Project</h2>
                <button onClick={() => setIsAddingProject(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/60"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Title</label>
                    <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Category</label>
                    <input placeholder="Web / AI / etc." value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Description</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary h-24 text-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Tech Stack (comma separated)</label>
                    <input placeholder="React, Node.js" value={formData.tech_stack} onChange={e => setFormData({...formData, tech_stack: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Status</label>
                    <input placeholder="Live / Developed" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Highlights (one per line)</label>
                  <textarea rows={3} value={formData.highlights} onChange={e => setFormData({...formData, highlights: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary h-24 text-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Demo Link</label>
                    <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Github Link</label>
                    <input type="url" value={formData.github_link} onChange={e => setFormData({...formData, github_link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-white/40 tracking-wider">Project Image</label>
                  <ImagePicker 
                    currentImage={formData.image_url} 
                    onUpload={(url) => setFormData({...formData, image_url: url})} 
                  />
                </div>

                {!editingProject && (
                  <label className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all border-dashed border-primary/40">
                    <div className="relative inline-flex items-center">
                        <input 
                          type="checkbox" 
                          checked={syncAll} 
                          onChange={e => setSyncAll(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">Post to Both Sites</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">Share this project on knowNV and Heartware</p>
                    </div>
                  </label>
                )}

                <label className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all">
                   <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData.is_featured} 
                        onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-white">Feature on Homepage</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Pin to the top 3 items</p>
                   </div>
                   {formData.is_featured && <Star size={16} className="text-primary fill-primary animate-in zoom-in" />}
                </label>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAddingProject(false)} className="flex-1 py-3 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-all text-white">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                    {editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 glass-card animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="glass-card overflow-hidden flex flex-col group hover:border-white/20 transition-all h-full">
              <div className="h-44 bg-zinc-900 flex items-center justify-center relative border-b border-white/5 overflow-hidden">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-110" />
                ) : (
                  <Briefcase size={40} className="text-white/10" />
                )}
                
                <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button onClick={() => startEdit(project)} className="p-2 bg-slate-900/80 backdrop-blur-md rounded-lg hover:bg-white hover:text-black text-white shadow-xl border border-white/10 transition-all"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 bg-primary/20 backdrop-blur-md hover:bg-primary text-primary hover:text-white rounded-lg shadow-xl border border-primary/20 transition-all"><Trash2 size={16} /></button>
                </div>

                <div className="absolute bottom-4 left-4 flex gap-2">
                   <div className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase">{project.category || 'Portfolio'}</div>
                   {project.is_featured && (
                     <div className="px-2 py-1 rounded bg-amber-500 text-black text-[10px] font-bold uppercase flex items-center gap-1 shadow-lg">
                        <Star size={10} fill="black" /> Featured
                     </div>
                   )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-bold mb-2 font-orbitron text-white">{project.title}</h3>
                <p className="text-sm text-white/50 line-clamp-2 mb-6 flex-1 leading-relaxed">{project.description}</p>
                
                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-white/5 text-white/40">
                  <div className="flex gap-3">
                    {project.link && <a href={project.link} target="_blank" className="hover:text-primary transition-all"><ExternalLink size={18} /></a>}
                    {project.github_link && <a href={project.github_link} target="_blank" className="hover:text-primary transition-all"><GithubIcon size={18} /></a>}
                  </div>
                  <div className="flex-1"></div>
                  <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-bold tracking-widest">{project.status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
