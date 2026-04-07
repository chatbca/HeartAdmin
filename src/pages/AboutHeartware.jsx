import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Heart, 
  Target, 
  MapPin, 
  Quote, 
  Save, 
  Plus, 
  Trash2,
  Loader2,
  Cpu,
  Layers
} from 'lucide-react';

const AboutHeartware = ({ siteId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    mission: '',
    vision: '',
    story: '',
    philosophy: '',
    quote: '',
    founder: '',
    values: []
  });

  useEffect(() => {
    if (siteId) fetchAbout();
  }, [siteId]);

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const { data: pageData, error } = await supabase
        .from('about_pages')
        .select('*')
        .eq('site_id', siteId)
        .single();
      
      if (pageData && pageData.content) {
        setData(pageData.content);
      }
    } catch (err) {
      console.error('Error fetching about data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
        // Upsert logic
        const { error } = await supabase
          .from('about_pages')
          .upsert({
            site_id: siteId,
            content: data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'site_id' });
        
        if (!error) alert('About page updated successfully!');
        else throw error;
    } catch (err) {
        alert('Error saving data: ' + err.message);
    } finally {
        setSaving(false);
    }
  };

  const addValue = () => {
    setData({
      ...data,
      values: [...(data.values || []), { title: '', description: '', icon_name: 'FiHeart' }]
    });
  };

  const removeValue = (index) => {
    const newValues = [...data.values];
    newValues.splice(index, 1);
    setData({ ...data, values: newValues });
  };

  const updateValue = (index, field, value) => {
    const newValues = [...data.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setData({ ...data, values: newValues });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron text-white">Heartware Personality</h1>
          <p className="text-white/40">Define the soul, mission, and story of ajja-Heartware.</p>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="px-6 py-3 bg-primary rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 text-white"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Publish to Site
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission & Vision */}
        <div className="glass-card p-8 space-y-6 border border-white/5">
          <div className="flex items-center gap-3 text-red-400">
            <Target size={24} />
            <h2 className="font-bold uppercase tracking-widest text-lg text-white">Mission & Vision</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Our Mission</label>
              <textarea 
                value={data.mission} 
                onChange={(e) => setData({...data, mission: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-1 focus:ring-primary text-white text-sm leading-relaxed"
                rows={3}
                placeholder="What drives Heartware?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Our Vision</label>
              <textarea 
                value={data.vision} 
                onChange={(e) => setData({...data, vision: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-1 focus:ring-primary text-white text-sm leading-relaxed"
                rows={3}
                placeholder="Where are we heading?"
              />
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="glass-card p-8 space-y-6 border border-white/5">
          <div className="flex items-center gap-3 text-amber-400">
            <MapPin size={24} />
            <h2 className="font-bold uppercase tracking-widest text-lg text-white">The Heartware Story</h2>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-white/40 font-bold tracking-widest">Biography / Origins</label>
            <textarea 
              value={data.story} 
              onChange={(e) => setData({...data, story: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-1 focus:ring-primary text-white text-sm leading-relaxed"
              rows={9}
              placeholder="Hardware powers machines. Software powers systems. But Heartware..."
            />
          </div>
        </div>
      </div>

      {/* Philosophy & Quote */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-6 border border-white/5">
           <div className="flex items-center gap-3 text-blue-400">
            <Layers size={24} />
            <h2 className="font-bold uppercase tracking-widest text-lg text-white">Tech Philosophy</h2>
          </div>
          <textarea 
            value={data.philosophy} 
            onChange={(e) => setData({...data, philosophy: e.target.value})}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-1 focus:ring-primary text-white text-sm leading-relaxed"
            rows={5}
            placeholder="How do we choose our stack?"
          />
        </div>

        <div className="glass-card p-8 space-y-6 border border-white/5">
          <div className="flex items-center gap-3 text-purple-400">
            <Quote size={24} />
            <h2 className="font-bold uppercase tracking-widest text-lg text-white">Founder's Quote</h2>
          </div>
          <div className="space-y-4">
            <textarea 
               value={data.quote} 
               onChange={(e) => setData({...data, quote: e.target.value})}
               className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:ring-1 focus:ring-primary text-white text-sm italic font-medium leading-relaxed"
               rows={3}
               placeholder="A closing thought..."
            />
            <input 
               value={data.founder} 
               onChange={(e) => setData({...data, founder: e.target.value})}
               className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:ring-1 focus:ring-primary text-white text-xs"
               placeholder="Founder Name / Title"
            />
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="glass-card p-8 space-y-8 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-green-400">
            <Heart size={24} />
            <h2 className="font-bold uppercase tracking-widest text-lg text-white">Core Values</h2>
          </div>
          <button 
            onClick={addValue}
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <Plus size={16} /> Add Value
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.values?.map((value, index) => (
            <div key={index} className="p-6 bg-white/5 rounded-2xl border border-white/5 relative group animate-in zoom-in duration-300">
               <button 
                 onClick={() => removeValue(index)}
                 className="absolute top-4 right-4 p-2 bg-red-500/20 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
               >
                 <Trash2 size={14} />
               </button>
               <div className="space-y-4 pt-4 text-white">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-white/40 font-bold">Value Title</label>
                    <input 
                      value={value.title} 
                      onChange={(e) => updateValue(index, 'title', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-white/40 font-bold">Description</label>
                    <textarea 
                      value={value.description} 
                      onChange={(e) => updateValue(index, 'description', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white text-xs leading-relaxed"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-white/40 font-bold">Icon Name (React-Icons/Fi)</label>
                    <input 
                      value={value.icon_name} 
                      onChange={(e) => updateValue(index, 'icon_name', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary text-white text-xs"
                      placeholder="FiHeart, FiStar, etc."
                    />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutHeartware;
