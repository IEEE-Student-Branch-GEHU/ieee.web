'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, GraduationCap, Home, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react';
import { clearAdminToken } from '../../lib/admin-api';
import { ThemeToggle } from '../theme/ThemeToggle';

const menuItems = [
  { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
  { name: 'Events', path: '/admin/events', icon: <Calendar size={20} /> },
  { name: 'Faculty Coordinators', path: '/admin/faculty', icon: <GraduationCap size={20} /> },
  { name: 'Team members', path: '/admin/team', icon: <Users size={20} /> },
];

const AdminLayoutNext = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    clearAdminToken();
    router.replace('/admin/login');
  };

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileNavOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileNavOpen]);

  if (pathname === '/admin/login') return children;

  return (
    <div className="admin-shell site-surface flex min-h-dvh overflow-hidden">
      {mobileNavOpen && <button type="button" aria-label="Close admin navigation" onClick={() => setMobileNavOpen(false)} className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[calc(100vw-2rem)] flex-col bg-slate-900 pt-6 text-white transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex flex-col px-6">
          <div className="flex items-start justify-between gap-4">
            <span className="text-xl font-bold tracking-tight">IEEE Admin</span>
            <button type="button" aria-label="Close admin navigation" onClick={() => setMobileNavOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"><X size={20} aria-hidden="true" /></button>
          </div>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">Management Portal</span>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 space-y-2 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${isActive
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
          >
            <Home size={20} />
            <span className="text-sm font-medium">View Website</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition-all hover:bg-red-500/10"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="admin-header flex min-h-16 shrink-0 items-center justify-between gap-4 border-b px-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Open admin navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(true)} className="admin-icon-button rounded-lg p-2 lg:hidden"><Menu size={22} aria-hidden="true" /></button>
            <h1 className="admin-heading min-w-0 truncate text-lg font-semibold italic">
            {menuItems.find(item => item.path === pathname)?.name || 'Admin Management'}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">AD</div>
          </div>
        </header>
        <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayoutNext;
