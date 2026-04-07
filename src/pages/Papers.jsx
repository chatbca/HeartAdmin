import { useState, useEffect } from 'react';
import { supabase, SITES } from '../lib/supabase';
import { Plus, Trash2, Edit3, FileText, X, Star } from 'lucide-react';

export default function Papers({ siteId }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [syncAll, setSyncAll] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    tags: '',
    highlights: '',
    link: '',
    is_featured: false
  });

  useEffect(() => {
    if (siteId) fetchPapers();
  }, [siteId]);

  const fetchPapers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('papers')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    if (data) setPapers(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      site_id: siteId,
      tags: formData.tags.split(',').map(s => s.trim()).filter(Boolean),
      highlights: formData.highlights.split('\n').map(s => s.trim()).filter(Boolean)
    };

    if (editing) {
      await supabase.from('papers').update(payload).eq('id', editing.id);
    } else {
      const inserts = [payload];
      if (syncAll) {
        const otherSiteId = siteId === SITES.knownv ? SITES.heartware : SITES.knownv;
        inserts.push({ ...payload, site_id: otherSiteId });
      }
      await supabase.from('papers').insert(inserts);
    }
    setIsAdding(false);
    setEditing(null);
    setFormData({ title: '', description: '', date: '', tags: '', highlights: '', link: '', is_featured: false });
    fetchPapers();
  };

  const startEdit = (paper) => {
    setEditing(paper);
    setFormData({
      ...paper,
      tags: (paper.tags || []).join(', '),
      highlights: (paper.highlights || []).join('\n'),
      is_featured: paper.is_featured || false
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Research Papers</h1>
          <p className="text-white/40 text-sm">Manage your academic and technical publications.</p>
        </div>
        <button 
          onClick={() => { 
            setIsAdding(true); 
            setEditing(null); 
            setFormData({ title: '', description: '', date: '', tags: '', highlights: '', link: '', is_featured: false }); 
          }} 
          className="px-6 py-3 bg-primary rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all border border-white/10 hover:shadow-xl hover:scale-105"
        >
          <Plus size={20} /> Add Paper
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{editing ? 'Edit' : 'Add'} Research Paper</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-lg"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all" placeholder="Enter paper title" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Date</label>
                  <input placeholder="e.g., May 2025" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Abstract / Description</label>
                <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all h-32" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Key Highlights (One per line)</label>
                <textarea rows={4} value={formData.highlights} onChange={e => setFormData({...formData, highlights: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all h-32" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Tags (Comma separated)</label>
                  <input placeholder="Blockchain, FinTech" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Document Link (Google Drive, PDF, etc.)</label>
                  <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              {!editing && (
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
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Share this research on knowNV and Heartware</p>
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
                    <p className="text-sm font-bold text-white">Feature in BuildMode</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Pin to the top of the research list</p>
                 </div>
              </label>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs">Cancel</button>
                <button type="submit" className="flex-1 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all uppercase tracking-widest text-xs">
                  {editing ? 'Save Changes' : 'Publish Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-40 glass-card animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {papers.map(paper => (
            <div key={paper.id} className="glass-card group hover:border-white/20 transition-all p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
               
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText size={20} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold font-orbitron text-white/90 truncate">{paper.title}</h3>
                        {paper.is_featured && <div className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-bold uppercase flex items-center gap-1 shadow-lg flex-shrink-0 font-rajdhani"><Star size={10} fill="black" /> Featured</div>}
                      </div>
                      <p className="text-xs text-white/40 uppercase tracking-widest">{paper.date}</p>
                    </div>
                 </div>
                 
                 <p className="text-white/50 mb-6 leading-relaxed line-clamp-3">{paper.description}</p>
                 
                 <div className="flex flex-wrap gap-2">
                    {paper.tags?.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/60">{tag}</span>
                    ))}
                 </div>
               </div>

               <div className="flex flex-col justify-between items-end gap-6 md:min-w-[120px]">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(paper)} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:text-primary transition-all self-start"><Edit3 size={16} /></button>
                    <button onClick={() => { if(confirm('Delete paper?')) supabase.from('papers').delete().eq('id', paper.id).then(fetchPapers); }} className="p-3 bg-primary/5 border border-primary/5 rounded-xl hover:bg-primary hover:text-white transition-all text-primary self-start"><Trash2 size={16} /></button>
                  </div>
                  {paper.link && (
                    <a href={paper.link} target="_blank" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all border border-white/10 uppercase tracking-widest">Read More</a>
                  )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
