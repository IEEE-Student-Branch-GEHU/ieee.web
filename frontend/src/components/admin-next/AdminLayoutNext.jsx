'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, GraduationCap, Home, LayoutDashboard, LogOut, Users } from 'lucide-react';
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

  if (pathname === '/admin/login') return children;

  const handleLogout = () => {
    clearAdminToken();
    router.replace('/admin/login');
  };

  return (
    <div className="admin-shell site-surface flex h-screen overflow-hidden">
      <aside className="flex w-64 flex-col bg-slate-900 pt-6 text-white">
        <div className="mb-10 flex flex-col px-6">
          <span className="text-xl font-bold tracking-tight">IEEE Admin</span>
          <span className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">Management Portal</span>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 space-y-2 px-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
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

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="admin-header flex h-16 shrink-0 items-center justify-between border-b px-8">
          <h1 className="admin-heading text-lg font-semibold italic">
            {menuItems.find(item => item.path === pathname)?.name || 'Admin Management'}
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">AD</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayoutNext;
