import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Briefcase, 
  Settings, 
  Mail, 
  Globe, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  ExternalLink,
  Star
} from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    knownv: { projects: 0, services: 0, messages: 0, featured: [] },
    heartware: { projects: 0, services: 0, messages: 0, featured: [] }
  });
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const SITES = {
    knownv: '47da696a-f827-4e44-a651-4d8905db19b1',
    heartware: '01aa78e5-f988-47c3-9405-934f6bf69952'
  };

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    setLoading(true);
    
    // Fetch Sites
    const { data: sitesData } = await supabase.from('sites').select('*');
    if (sitesData) setSites(sitesData);

    // Fetch Projects
    const { data: projects } = await supabase.from('projects').select('*');
    // Fetch Services
    const { data: services } = await supabase.from('services').select('*');
    // Fetch Messages
    const { data: messages } = await supabase.from('contacts').select('*');

    const newStats = {
      knownv: {
        projects: projects?.filter(p => p.site_id === SITES.knownv).length || 0,
        services: services?.filter(s => s.site_id === SITES.knownv).length || 0,
        messages: messages?.filter(m => m.site_id === SITES.knownv && !m.is_read).length || 0,
        featured: projects?.filter(p => p.site_id === SITES.knownv && p.is_featured === true).slice(0, 3) || []
      },
      heartware: {
        projects: projects?.filter(p => p.site_id === SITES.heartware).length || 0,
        services: services?.filter(s => s.site_id === SITES.heartware).length || 0,
        messages: messages?.filter(m => m.site_id === SITES.heartware && !m.is_read).length || 0,
        featured: projects?.filter(p => p.site_id === SITES.heartware && p.is_featured === true).slice(0, 3) || []
      }
    };

    setStats(newStats);
    setLoading(false);
  };

  const toggleBuildMode = async (id, currentState) => {
    console.log('Toggling build mode for:', id, !currentState);
    const { error } = await supabase
      .from('sites')
      .update({ build_mode: !currentState })
      .eq('id', id);
    
    if (error) {
      console.error('Error toggling build mode:', error);
      alert('Failed to update Build Mode: ' + error.message);
      return;
    }

    setSites(sites.map(s => s.id === id ? { ...s, build_mode: !currentState } : s));
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-orbitron tracking-tight">System Overview</h1>
        <p className="text-white/40">Unified analytics for both Heartware and knowNV.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <SiteOverviewCard 
          name="knowNV" 
          stats={stats.knownv} 
          url="http://localhost:5174"
          accent="text-secondary"
          bg="bg-secondary/5"
          siteData={sites.find(s => s.id === SITES.knownv)}
          onToggleBuild={() => toggleBuildMode(SITES.knownv, sites.find(s => s.id === SITES.knownv)?.build_mode)}
        />
        <SiteOverviewCard 
          name="ajja-Heartware" 
          stats={stats.heartware} 
          url="http://localhost:5173"
          accent="text-primary"
          bg="bg-primary/5"
          siteData={sites.find(s => s.id === SITES.heartware)}
          onToggleBuild={() => toggleBuildMode(SITES.heartware, sites.find(s => s.id === SITES.heartware)?.build_mode)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard label="Total Reach" value="Unified" icon={Globe} color="text-blue-400" />
         <StatCard label="System Health" value="100%" icon={Activity} color="text-green-400" />
         <StatCard label="Database Sync" value="Live" icon={TrendingUp} color="text-primary" />
      </div>
    </div>
  );
}

function SiteOverviewCard({ name, stats, url, accent, bg, siteData, onToggleBuild }) {
  const isHeartware = name.toLowerCase().includes('heart');
  return (
    <div className={`glass-card p-8 border-t-4 ${isHeartware ? 'border-t-primary' : 'border-t-secondary'}`}>
      <div className="flex justify-between items-start mb-10">
        <div className="flex-1">
          <h2 className={`text-2xl font-bold mb-1 ${accent}`}>{name}</h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs text-white/30 uppercase tracking-widest font-semibold">
               <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
               Live
             </div>
             
             {siteData && (
               <label className="flex items-center gap-2 cursor-pointer group">
                 <div className="relative">
                   <input 
                     type="checkbox" 
                     className="sr-only peer" 
                     checked={siteData.build_mode}
                     onChange={onToggleBuild}
                   />
                   <div className="w-8 h-4 bg-white/10 rounded-full peer peer-checked:bg-primary/50 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:bg-white"></div>
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-tighter text-white/40 group-hover:text-white transition-colors">
                   Build Mode {siteData.build_mode ? 'ON' : 'OFF'}
                 </span>
               </label>
             )}
          </div>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white/60">
          <ExternalLink size={20} />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="p-4 rounded-2xl bg-white/5 flex flex-col items-center">
          <Briefcase size={20} className="text-white/20 mb-2" />
          <span className="text-xl font-bold">{stats.projects}</span>
          <span className="text-[10px] text-white/40 uppercase">Projects</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 flex flex-col items-center">
          <Settings size={20} className="text-white/20 mb-2" />
          <span className="text-xl font-bold">{stats.services}</span>
          <span className="text-[10px] text-white/40 uppercase">Services</span>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 flex flex-col items-center">
          <Mail size={20} className={stats.messages > 0 ? "text-primary mb-2" : "text-white/20 mb-2"} />
          <span className="text-xl font-bold">{stats.messages}</span>
          <span className="text-[10px] text-white/40 uppercase font-semibold">Messages</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase text-white/30 tracking-wider mb-4 border-b border-white/5 pb-2">Featured Projects Management</h3>
        <div className="space-y-3">
          {stats.featured.length === 0 ? (
            <div className="py-4 text-center text-white/20 text-xs italic bg-white/5 rounded-xl border border-dashed border-white/10">
              No featured projects selected
            </div>
          ) : (
            stats.featured.map(project => (
              <div key={project.id} className={cn(
                "flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group transition-all",
                isHeartware ? "hover:border-primary/50" : "hover:border-secondary/50"
              )}>
                <div className="flex items-center gap-3 min-w-0">
                  <Star size={14} className={`${isHeartware ? 'text-primary' : 'text-secondary'} flex-shrink-0`} />
                  <span className="text-sm font-medium truncate">{project.title}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className={`px-2 py-0.5 rounded ${isHeartware ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'} text-[10px] font-bold uppercase`}>Pinned</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-card p-6 flex items-center gap-4 group hover:bg-white/5 transition-all">
      <div className={`p-4 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
