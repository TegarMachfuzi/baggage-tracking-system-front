import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MapPin, 
  FileText, 
  LogOut, 
  User as UserIcon,
  Plane,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/src/utils';
import { User } from '@/src/types';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  
  const userStr = localStorage.getItem('user');
  const user: User | null = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Passengers', path: '/passengers' },
    { icon: Briefcase, label: 'Baggage', path: '/baggage' },
    { icon: MapPin, label: 'Tracking', path: '/tracking' },
    { icon: FileText, label: 'Claims', path: '/claims' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1e293b] text-slate-300">
      <div className="p-6 flex items-center gap-3 border-bottom border-slate-700/50">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Plane size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">SkyTrack</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Admin Panel</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              isActive 
                ? "bg-blue-500/10 text-blue-400 font-medium shadow-sm" 
                : "hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(
              "transition-colors",
              location.pathname === item.path ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
            )} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileMenuOpen(false)} />
      
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 z-50 lg:hidden transition-transform duration-300 transform bg-[#1e293b]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-20 bg-white border-bottom border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Menu size={24} />
          </button>

          <div className="hidden lg:block">
            <h2 className="text-xl font-semibold text-slate-800 capitalize">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.username || 'Admin User'}</p>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{user?.role || 'STAFF'}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200">
              <UserIcon size={20} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
