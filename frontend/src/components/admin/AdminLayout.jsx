import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, Home } from 'lucide-react';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Events', path: '/admin/events', icon: <Calendar size={20} /> },
        { name: 'Team members', path: '/admin/team', icon: <Users size={20} /> },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col pt-6">
                <div className="px-6 mb-10 flex flex-col">
                    <span className="text-xl font-bold tracking-tight">IEEE Admin</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Management Portal</span>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    >
                        <Home size={20} />
                        <span className="font-medium text-sm">View Website</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
                    <h1 className="text-lg font-semibold text-gray-800 italic">
                        {menuItems.find(item => item.path === location.pathname)?.name || 'Admin Management'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                            AD
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
