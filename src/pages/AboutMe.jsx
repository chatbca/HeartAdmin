import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Cpu, Terminal, Save, RefreshCw, Loader2 } from 'lucide-react';

import ImagePicker from '../components/ImagePicker';

const AboutMe = ({ siteId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    nv_core: {},
    alu_modules: {},
    memory_unit: {},
    control_unit: {},
    terminal_output: '',
    profile_image_url: ''
  });

  useEffect(() => {
    if (siteId) fetchAboutMe();
  }, [siteId]);

  const fetchAboutMe = async () => {
    setLoading(true);
    const { data: aboutData, error } = await supabase
      .from('about_me')
      .select('*')
      .eq('site_id', siteId)
      .single();
    
    if (aboutData) setData(aboutData);
    setLoading(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from('about_me')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('site_id', siteId);
    
    if (!error) alert('Profile updated successfully!');
    setSaving(false);
  };

  const handleUnitChange = (unit, key, value) => {
    setData(prev => ({
      ...prev,
      [unit]: { ...prev[unit], [key]: value }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-orbitron">CPU Configuration</h1>
          <p className="text-white/40">Manage your digital profile architecture.</p>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={saving}
          className="px-6 py-3 bg-primary rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Configuration
        </button>
      </div>

      <div className="glass-card p-6 space-y-4 border border-primary/20">
        <h2 className="font-bold uppercase tracking-wider text-primary">Profile Image Architecture</h2>
        <ImagePicker 
          currentImage={data.profile_image_url} 
          onUpload={(url) => setData({ ...data, profile_image_url: url })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* NV-CORE Unit */}
        <div className="glass-card p-6 space-y-4 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Cpu size={20} />
            <h2 className="font-bold uppercase tracking-wider">NV-CORE</h2>
          </div>
          <div className="space-y-4">
            {Object.keys(data.nv_core).map(key => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 font-bold">{key}</label>
                <input 
                  value={data.nv_core[key]} 
                  onChange={(e) => handleUnitChange('nv_core', key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ALU Modules */}
        <div className="glass-card p-6 space-y-4 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <RefreshCw size={20} />
            <h2 className="font-bold uppercase tracking-wider">ALU MODULES</h2>
          </div>
          <div className="space-y-4">
            {Object.keys(data.alu_modules).map(key => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 font-bold">{key}</label>
                <input 
                  value={data.alu_modules[key]} 
                  onChange={(e) => handleUnitChange('alu_modules', key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Memory Unit */}
        <div className="glass-card p-6 space-y-4 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Cpu size={20} />
            <h2 className="font-bold uppercase tracking-wider">MEMORY UNIT</h2>
          </div>
          <div className="space-y-4">
            {Object.keys(data.memory_unit).map(key => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 font-bold">{key}</label>
                <input 
                  value={data.memory_unit[key]} 
                  onChange={(e) => handleUnitChange('memory_unit', key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Control Unit */}
        <div className="glass-card p-6 space-y-4 border border-primary/20">
          <div className="flex items-center gap-2 text-primary">
            <Terminal size={20} />
            <h2 className="font-bold uppercase tracking-wider">CONTROL UNIT</h2>
          </div>
          <div className="space-y-4">
            {Object.keys(data.control_unit).map(key => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] uppercase text-white/40 font-bold">{key}</label>
                <input 
                  value={data.control_unit[key]} 
                  onChange={(e) => handleUnitChange('control_unit', key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="glass-card p-6 space-y-4 border border-primary/20">
        <div className="flex items-center gap-2 text-primary">
          <Terminal size={20} />
          <h2 className="font-bold uppercase tracking-wider">TERMINAL OUTPUT</h2>
        </div>
        <textarea 
          rows={10}
          value={data.terminal_output}
          onChange={(e) => setData({...data, terminal_output: e.target.value})}
          className="w-full bg-black/40 border border-white/10 rounded-lg p-6 font-jetbrains text-sm leading-relaxed outline-none focus:ring-1 focus:ring-primary text-gray-300"
          placeholder="Enter terminal sequence lines..."
        />
        <p className="text-[10px] text-white/30">Each line will be rendered sequentially in the TypeAnimation component.</p>
      </div>
    </div>
  );
};

export default AboutMe;
