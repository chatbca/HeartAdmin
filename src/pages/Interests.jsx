import { useState, useEffect } from 'react';
import { supabase, SITES } from '../lib/supabase';
import { Plus, Trash2, Edit3, Heart, X, Star } from 'lucide-react';

export default function Interests({ siteId }) {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [syncAll, setSyncAll] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    is_featured: false
  });

  useEffect(() => {
    if (siteId) fetchInterests();
  }, [siteId]);

  const fetchInterests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('interests')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    if (data) setInterests(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('interests').update(formData).eq('id', editing.id);
    } else {
      const inserts = [{ ...formData, site_id: siteId }];
      if (syncAll) {
        const otherSiteId = siteId === SITES.knownv ? SITES.heartware : SITES.knownv;
        inserts.push({ ...formData, site_id: otherSiteId });
      }
      await supabase.from('interests').insert(inserts);
    }
    setIsAdding(false);
    setEditing(null);
    setFormData({ title: '', description: '', type: '', is_featured: false });
    fetchInterests();
  };

  const startEdit = (interest) => {
    setEditing(interest);
    setFormData({
      title: interest.title,
      description: interest.description,
      type: interest.type,
      is_featured: interest.is_featured || false
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Looking For</h1>
          <p className="text-white/40 text-sm">Manage your collaborative interests and development goals.</p>
        </div>
        <button 
          onClick={() => { 
            setIsAdding(true); 
            setEditing(null); 
            setFormData({ title: '', description: '', type: '', is_featured: false }); 
          }} 
          className="px-6 py-3 bg-primary rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all text-white border border-white/10"
        >
          <Plus size={20} /> Add Interest
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
          <div className="glass-card w-full max-w-lg p-8 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? 'Edit' : 'Add'} Interest</h2>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Title</label>
                <input required placeholder="Project or topic title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Type</label>
                <input placeholder="Development / Collaboration / Research" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Description</label>
                <textarea rows={4} placeholder="What are you looking for in this area?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all h-32 text-white" />
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
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Share this interest on knowNV and Heartware</p>
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
                    <p className="text-sm font-bold text-white">Feature on Landing Page</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Pin to the spotlight section</p>
                 </div>
              </label>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 rounded-xl border border-white/10 font-bold hover:bg-white/5 transition-all text-xs uppercase tracking-widest text-white">Cancel</button>
                <button type="submit" className="flex-1 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all text-xs uppercase tracking-widest">
                  Save Interest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 glass-card animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interests.map(interest => (
            <div key={interest.id} className="glass-card p-8 flex flex-col group relative overflow-hidden transition-all hover:border-white/20">
               <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-primary/10 rounded-2xl w-fit text-primary group-hover:bg-primary group-hover:text-white transition-all"><Heart size={24} /></div>
                  {interest.is_featured && (
                    <div className="px-2 py-1 rounded bg-amber-500 text-black text-[10px] font-bold uppercase flex items-center gap-1 shadow-lg font-rajdhani">
                      <Star size={10} fill="black" /> Featured
                    </div>
                  )}
               </div>
               
               <div className="mb-4">
                 <h3 className="text-xl font-bold font-orbitron mb-1 text-white">{interest.title}</h3>
                 <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-white/40">{interest.type}</span>
               </div>
               
               <p className="text-white/50 text-sm leading-relaxed mb-6 flex-1 line-clamp-4">{interest.description}</p>
               
               <div className="flex gap-2 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => startEdit(interest)} className="flex-1 py-2 bg-white/5 rounded-lg hover:bg-white/10 text-xs font-bold transition-all uppercase tracking-widest text-white">Edit</button>
                  <button onClick={() => { if(confirm('Delete interest?')) supabase.from('interests').delete().eq('id', interest.id).then(fetchInterests); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"><Trash2 size={16} /></button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
