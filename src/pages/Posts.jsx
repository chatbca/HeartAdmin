import { useState, useEffect } from 'react';
import { supabase, SITES } from '../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Star,
  X,
  MessageSquare,
  Image as ImageIcon,
  Loader2,
  Eye,
  Monitor,
  Smartphone,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import ImagePicker from '../components/ImagePicker';

export default function Posts({ siteId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPost, setIsAddingPost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [syncAll, setSyncAll] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewSite, setPreviewSite] = useState(siteId === SITES.heartware ? 'heartware' : 'knownv');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    is_featured: false
  });

  useEffect(() => {
    if (siteId) {
        fetchPosts();
        setPreviewSite(siteId === SITES.heartware ? 'heartware' : 'knownv');
    }
  }, [siteId]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      site_id: siteId
    };

    if (editingPost) {
      const { error } = await supabase.from('posts').update(payload).eq('id', editingPost.id);
      if (!error) {
        if (syncAll) {
          const otherSiteId = siteId === SITES.knownv ? SITES.heartware : SITES.knownv;
          await supabase.from('posts').insert([{ ...payload, site_id: otherSiteId }]);
        }
        setEditingPost(null);
        fetchPosts();
      }
    } else {
      const inserts = [payload];
      if (syncAll) {
        const otherSiteId = siteId === SITES.knownv ? SITES.heartware : SITES.knownv;
        inserts.push({ ...payload, site_id: otherSiteId });
      }
      const { error } = await supabase.from('posts').insert(inserts);
      if (!error) {
        setIsAddingPost(false);
        fetchPosts();
      }
    }
    
    // Reset form
    setFormData({ title: '', content: '', image_url: '', is_featured: false });
    setIsAddingPost(false);
    setPreviewMode(false);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (!error) fetchPosts();
    }
  };

  const startEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      image_url: post.image_url || '',
      is_featured: post.is_featured || false
    });
    setIsAddingPost(true);
  };

  const filteredPosts = posts.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-orbitron text-white">Central Dispatch</h1>
          <p className="text-white/40 text-sm italic">Broadcasting news, system logs, and breakthroughs across your network.</p>
        </div>
        <button 
          onClick={() => { setIsAddingPost(true); setEditingPost(null); setFormData({ title: '', content: '', image_url: '', is_featured: false }); }}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary/60 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all border border-white/10 text-white"
        >
          <Plus size={20} />
          Create Broadcast
        </button>
      </div>

      {/* Grid View */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search broadcasts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white"
          />
        </div>
      </div>

      {/* Form Overlay */}
      {isAddingPost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setIsAddingPost(false)}></div>
          
          <div className="flex flex-col lg:flex-row w-full max-w-7xl h-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] overflow-hidden relative z-10 shadow-2xl">
            
            {/* Editor Side */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 overflow-y-auto border-r border-white/5 bg-slate-950/50">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-2xl text-primary"><MessageSquare size={24} /></div>
                    <div>
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">{editingPost ? 'Update' : 'New'} Message</h2>
                        <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Target Site: {siteId === SITES.heartware ? 'HW_PRODUCTION' : 'NV_SYSTEM'}</p>
                    </div>
                </div>
                <button onClick={() => setIsAddingPost(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[10px] uppercase font-mono text-white/40 tracking-[2px]">Subject / Title</label>
                     <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-primary text-white text-lg font-bold" placeholder="Headline..." />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] uppercase font-mono text-white/40 tracking-[2px]">Content Body</label>
                     <textarea rows={8} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 outline-none focus:ring-1 focus:ring-primary text-white leading-relaxed resize-none" placeholder="Details of the update..." />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] uppercase font-mono text-white/40 tracking-[2px]">Primary Visual</label>
                     <ImagePicker 
                       currentImage={formData.image_url} 
                       onUpload={(url) => setFormData({...formData, image_url: url})} 
                     />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`p-5 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.05] transition-all group ${editingPost ? 'opacity-50' : ''}`} title={editingPost ? "Cross-posting during an edit will create a new separate post on the other site" : ""}>
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" checked={syncAll} onChange={e => setSyncAll(e.target.checked)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-white italic">Sync Network</p>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">{editingPost ? 'Push new copy to other site' : 'Post to Both Sites'}</p>
                        </div>
                    </label>

                    <label className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.05] transition-all group">
                        <div className="relative inline-flex items-center">
                            <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-white italic">High Alert</p>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">Pin to Highlights</p>
                        </div>
                        {formData.is_featured && <Star size={14} className="text-amber-500 fill-amber-500" />}
                    </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest hover:bg-primary/90 shadow-[0_0_30px_rgba(230,57,70,0.3)] transition-all flex items-center justify-center gap-3 group">
                   <CheckCircle2 size={20} />
                   {editingPost ? 'Commit Changes' : 'Launch Broadcast'}
                   <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Side */}
            <div className="hidden lg:flex flex-col w-1/2 bg-black/40 backdrop-blur-md p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-10 blur-3xl pointer-events-none bg-primary w-64 h-64 rounded-full" />
                
                <div className="flex items-center justify-between mb-10 relative z-10 text-white">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${previewSite === 'heartware' ? 'bg-red-500/20 text-red-500' : 'bg-cyan-500/20 text-cyan-500'}`}>
                         <Eye size={18} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[3px]">Holographic Preview</span>
                   </div>
                   <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                      <button onClick={() => setPreviewSite('heartware')} className={`p-2 px-4 rounded-lg text-[10px] font-bold uppercase transition-all ${previewSite === 'heartware' ? 'bg-white/10 text-white' : 'text-white/40'}`}>HW</button>
                      <button onClick={() => setPreviewSite('knownv')} className={`p-2 px-4 rounded-lg text-[10px] font-bold uppercase transition-all ${previewSite === 'knownv' ? 'bg-white/10 text-white' : 'text-white/40'}`}>NV</button>
                   </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative z-10">
                   {previewSite === 'heartware' ? (
                     /* Heartware Preview */
                     <div className="w-full max-w-sm rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-8 text-white space-y-6">
                        {formData.image_url && <div className="h-44 rounded-2xl overflow-hidden shadow-2xl"><img src={formData.image_url} className="w-full h-full object-cover" /></div>}
                        <div className="space-y-4">
                           <div className="h-0.5 w-6 bg-primary" />
                           <h4 className="text-xl font-bold font-poppins">{formData.title || 'Broadcast Title'}</h4>
                           <p className="text-sm text-white/50 leading-relaxed font-inter line-clamp-4">{formData.content || 'Your message will manifest here in real-time...'}</p>
                        </div>
                     </div>
                   ) : (
                     /* knowNV Preview */
                     <div className="w-full max-w-sm glass-card border-l-2 border-l-cyan-400 p-8 border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[8px] font-mono text-cyan-400/60 uppercase tracking-[4px]">Node_SYS: {editingPost?.id?.split('-')[0] || 'NEW_ENTRY'}</span>
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        </div>
                        {formData.image_url && <div className="h-32 mb-6 rounded-lg overflow-hidden border border-white/5 opacity-80"><img src={formData.image_url} className="w-full h-full object-cover" /></div>}
                        <h4 className="text-lg font-orbitron font-bold text-white mb-3 tracking-tighter">{formData.title || 'STATION BROADCAST'}</h4>
                        <p className="text-xs font-rajdhani text-white/40 leading-relaxed line-clamp-3">{formData.content || 'Awaiting signal initialization...'}</p>
                     </div>
                   )}
                </div>

                <div className="mt-10 flex justify-center gap-6 opacity-30">
                   <Monitor size={20} className="text-white" />
                   <Smartphone size={20} className="text-white" />
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Actual List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="h-64 glass-card animate-pulse" />)
        ) : (
            filteredPosts.map(post => (
                <div key={post.id} className="glass-card group overflow-hidden border border-white/5 hover:border-white/20 transition-all flex flex-col h-[320px] bg-white/[0.01]">
                    <div className="h-32 bg-slate-900 group-hover:bg-slate-800 transition-colors relative">
                        {post.image_url ? (
                            <img src={post.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/5"><MessageSquare size={48} /></div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                             <button onClick={() => startEdit(post)} className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white/40 hover:text-white hover:bg-primary transition-all"><Edit3 size={14} /></button>
                             <button onClick={() => handleDelete(post.id)} className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white/40 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                        </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                           <div className={`p-1 rounded bg-white/5 text-[8px] font-black uppercase tracking-widest ${post.site_id === SITES.heartware ? 'text-red-400' : 'text-cyan-400'}`}>
                              {post.site_id === SITES.heartware ? 'HW' : 'NV'}
                           </div>
                           <span className="text-[10px] text-white/20 font-mono italic">{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-bold text-white mb-2 line-clamp-1">{post.title}</h4>
                        <p className="text-xs text-white/40 line-clamp-3 leading-relaxed mb-4 flex-1">{post.content}</p>
                        {post.is_featured && (
                            <div className="flex items-center gap-1 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                                <Star size={10} fill="currentColor" /> Highlighted
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
