import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Database, Settings, PlusCircle, Menu, Bell, Users } from 'lucide-react';
import clsx from 'clsx';
import { supabase, getCurrentUserId, setCurrentUserId, type User } from '../db';
import { useNavigate } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const uid = getCurrentUserId();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!uid) return;
      const { data, error } = await supabase.from('users').select('*').eq('id', uid).single();
      if (!error && data) {
        setCurrentUser(data);
      }
    };
    fetchUser();
  }, [uid]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/quotes', label: 'Preventivi', icon: FileText },
    { path: '/customers', label: 'Clienti', icon: Users },
    { path: '/articles', label: 'Articoli', icon: Database },
    { path: '/settings', label: 'Impostazioni', icon: Settings },
    { path: '/users', label: 'Utenti', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-white shadow-xl z-20">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Esse Group <span className="text-blue-500">Preventivi</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon size={20} className={clsx("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/quotes/new"
            className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 transform duration-200"
          >
            <PlusCircle size={20} />
            <span className="font-bold">Nuovo Preventivo</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen relative">
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-md z-10">
          <span className="font-bold text-xl">Esse Group Preventivi</span>
          <button className="p-2">
            <Menu size={24} />
          </button>
        </header>

        {/* Top Bar */}
        <header className="hidden md:flex bg-white h-16 border-b border-slate-200 items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">
            {navItems.find(i => i.path === location.pathname)?.label || 'Gestione'}
          </h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200">
                {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-slate-600">{currentUser?.displayName || 'Utente'}</span>
              <button
                onClick={() => { setCurrentUserId(null); navigate('/login'); }}
                className="ml-4 px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                Esci
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
