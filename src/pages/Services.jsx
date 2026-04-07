import { useState, useEffect } from 'react';
import { supabase, SITES } from '../lib/supabase';
import { Plus, Trash2, Edit3, Settings, X, Image as ImageIcon } from 'lucide-react';
import ImagePicker from '../components/ImagePicker';

export default function Services({ siteId }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const [syncAll, setSyncAll] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon_name: '',
    link: '',
    image_url: ''
  });

  useEffect(() => {
    if (siteId) fetchServices();
  }, [siteId]);

  const fetchServices = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false });
    if (data) setServices(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      icon_name: formData.icon_name,
      link: formData.link,
      image_url: formData.image_url,
      site_id: siteId
    };

    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing.id);
    } else {
      const inserts = [payload];
      if (syncAll) {
        const otherSiteId = siteId === SITES.knownv ? SITES.heartware : SITES.knownv;
        inserts.push({ ...payload, site_id: otherSiteId });
      }
      await supabase.from('services').insert(inserts);
    }
    setIsAdding(false);
    setEditing(null);
    setFormData({ title: '', description: '', icon_name: '', link: '', image_url: '' });
    fetchServices();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this service?')) {
      await supabase.from('services').delete().eq('id', id);
      fetchServices();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-white/40">Manage what you offer.</p>
        </div>
        <button onClick={() => { setIsAdding(true); setEditing(null); }} className="px-6 py-3 bg-primary rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> Add Service
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdding(false)}></div>
          <div className="glass-card w-full max-w-lg p-8 relative z-10">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">{editing ? 'Edit' : 'Add'} Service</h2>
                <button onClick={() => setIsAdding(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none" />
                <textarea rows={3} placeholder="Description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none" />
                <input placeholder="Icon Name (e.g. FaCode, FiCpu)" value={formData.icon_name} onChange={e => setFormData({...formData, icon_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none" />
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-white/40">Service Image / Cover</label>
                  <ImagePicker 
                    currentImage={formData.image_url} 
                    onUpload={(url) => setFormData({...formData, image_url: url})} 
                  />
                </div>
                <input placeholder="External Link (Optional)" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none" />
                
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
                        <p className="text-[10px] text-white/40 uppercase tracking-widest text-wrap">Sync service to knowNV and Heartware</p>
                    </div>
                  </label>
                )}
                
                <button className="w-full py-3 bg-primary rounded-xl font-bold shadow-lg shadow-primary/20">Save Service</button>
              </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="glass-card p-6 flex flex-col gap-4 group">
            <div className="relative h-32 bg-white/5 -mx-6 -mt-6 mb-4 border-b border-white/5 flex items-center justify-center overflow-hidden">
              {service.image_url ? (
                <img src={service.image_url} alt={service.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="p-3 bg-white/5 rounded-xl text-primary"><Settings size={28} /></div>
              )}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { 
                    setEditing(service); 
                    setFormData({
                      title: service.title || '',
                      description: service.description || '',
                      icon_name: service.icon_name || '',
                      link: service.link || '',
                      image_url: service.image_url || ''
                    }); 
                    setIsAdding(true); 
                  }} 
                  className="p-2 bg-slate-900 border border-white/10 rounded-lg hover:bg-slate-800"
                >
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(service.id)} className="p-2 bg-primary/20 border border-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">{service.title}</h3>
              <p className="text-sm text-white/50">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
