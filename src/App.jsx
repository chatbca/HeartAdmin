import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  FileText, 
  Heart, 
  Menu, 
  X, 
  ChevronRight,
  Globe,
  ExternalLink,
  User,
  Mail
} from 'lucide-react';
import { supabase, SITES } from './lib/supabase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Real CRUD Components
import Projects from './pages/Projects';
import Services from './pages/Services';
import Papers from './pages/Papers';
import Interests from './pages/Interests';
import AboutMe from './pages/AboutMe';
import Messages from './pages/Messages';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import AboutHeartware from './pages/AboutHeartware';

// Helper for tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Sidebar Link Component
const SidebarLink = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={cn(
      "nav-link",
      active ? "nav-link-active" : "nav-link-inactive"
    )}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

import Login from './pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAdminAuthenticated') === 'true';
  });
  
  const [selectedSite, setSelectedSite] = useState(() => {
    return localStorage.getItem('selectedSite') || 'heartware';
  });
  const [sites, setSites] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('isAdminAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchSites = async () => {
      const { data } = await supabase.from('sites').select('*');
      if (data) setSites(data);
    };
    fetchSites();
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedSite', selectedSite);
  }, [selectedSite]);

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  const currentSite = sites.find(s => s.slug === selectedSite) || { name: 'Loading...', id: null };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-50 font-sans">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 lg:translate-x-0 lg:static",
        !sidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg shadow-lg shadow-primary/20">
                <Globe className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Heart Admin</h1>
                <p className="text-[10px] uppercase tracking-widest text-white/40">Unified Portal</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/60">
              <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <label className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3 block px-2">
              Current Site
            </label>
            <div className="relative group">
              <select 
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-white/90 group-hover:bg-white/10"
              >
                {sites.map(site => (
                  <option key={site.slug} value={site.slug} className="bg-slate-900 text-white">
                    {site.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                <ChevronRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-8">
            <div>
              <label className="text-xs font-bold text-white/20 uppercase tracking-[2px] mb-4 block px-2">Core Unified</label>
              <div className="space-y-1">
                <SidebarLink to="/" icon={LayoutDashboard} label="Overview" active={location.pathname === '/'} />
                <SidebarLink to="/messages" icon={Mail} label="Messages" active={location.pathname === '/messages'} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/20 uppercase tracking-[2px] mb-4 block px-2">Site Specific</label>
              <div className="space-y-1">
                <SidebarLink to="/projects" icon={Briefcase} label="Projects" active={location.pathname === '/projects'} />
                <SidebarLink to="/services" icon={Settings} label="Services" active={location.pathname === '/services'} />
                <SidebarLink to="/posts" icon={FileText} label="Updates" active={location.pathname === '/posts'} />
                
                {selectedSite === 'knownv' ? (
                  <>
                    <SidebarLink to="/papers" icon={FileText} label="Research" active={location.pathname === '/papers'} />
                    <SidebarLink to="/interests" icon={Heart} label="Interests" active={location.pathname === '/interests'} />
                    <SidebarLink to="/aboutme" icon={User} label="About Me" active={location.pathname === '/aboutme'} />
                  </>
                ) : (
                  <>
                    <SidebarLink to="/about-heartware" icon={User} label="About Page" active={location.pathname === '/about-heartware'} />
                  </>
                )}
              </div>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-white/10">
            <a 
              href={selectedSite === 'heartware' ? 'http://localhost:5173' : 'http://localhost:5174'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div>
                <p className="text-xs font-medium text-white/40">Open Website</p>
                <p className="text-sm font-semibold">{currentSite.name}</p>
              </div>
              <ExternalLink size={18} className="text-white/20 group-hover:text-primary transition-colors" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60">
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4">
             <div className="h-8 w-[1px] bg-white/10 mx-2 hidden lg:block"></div>
             <div>
               <h2 className="text-sm font-medium text-white/80">{currentSite.name}</h2>
               <p className="text-[10px] text-white/40 font-mono uppercase">ID: {currentSite.id?.split('-')[0]}...</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">Local Admin</p>
              <p className="text-xs text-white/40 text-green-400 flex items-center gap-1 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Connected
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent/20 border border-white/10 flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects siteId={currentSite.id} />} />
            <Route path="/services" element={<Services siteId={currentSite.id} />} />
            <Route path="/posts" element={<Posts siteId={currentSite.id} />} />
            <Route path="/papers" element={<Papers siteId={currentSite.id} />} />
            <Route path="/interests" element={<Interests siteId={currentSite.id} />} />
            <Route path="/aboutme" element={<AboutMe siteId={currentSite.id} />} />
            <Route path="/about-heartware" element={<AboutHeartware siteId={currentSite.id} />} />
            <Route path="/messages" element={<Messages siteId={currentSite.id} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}




