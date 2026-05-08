import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
    MessageSquare,
    Briefcase,
    HeartPulse,
    Dumbbell,
    Bell,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

const SidebarItem = ({ to, icon: Icon, label, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
            active
                ? "text-white shadow-lg shadow-primary/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
        )}
    >
        {active && (
            <motion.div 
                layoutId="active-nav"
                className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 -z-10 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
        )}
        <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110 group-hover:drop-shadow-md", active && "scale-110 drop-shadow-md")} />
        <span className="font-medium tracking-wide z-10">{label}</span>
    </Link>
);

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: MessageSquare, label: 'Personal Chat' },
        { path: '/professional', icon: Briefcase, label: 'Professional' },
        { path: '/health', icon: HeartPulse, label: 'Health Assistant' },
        { path: '/workout', icon: Dumbbell, label: 'Workout Coach' },
        { path: '/reminders', icon: Bell, label: 'Reminders' },
        // { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="flex h-screen bg-dark text-light overflow-hidden font-sans">
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col p-4",
                mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="mb-8 px-2 flex items-center justify-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        AI Companion
                    </h1>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            to={item.path}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname === item.path}
                            onClick={() => setMobileMenuOpen(false)}
                        />
                    ))}
                </div>

                <div className="mt-auto border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-800/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]"></div>
                </div>

                <div className="relative z-10 w-full h-full overflow-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
