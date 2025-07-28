import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FilePlus2, Users, Wrench, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// The navigation link structure remains untouched
const navLinks = {
  STUDENT: [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'New Complaint', path: '/student/new-complaint', icon: FilePlus2 },
  ],
  WARDEN: [
    { name: 'All Complaints', path: '/warden/dashboard', icon: LayoutDashboard },
  ],
  ADMIN: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
  ],
  EMPLOYEE: [
    { name: 'My Tasks', path: '/employee/dashboard', icon: Wrench },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const role = user?.role === 'CLEANER' || user?.role === 'ELECTRICIAN' ? 'EMPLOYEE' : user?.role;
  const links = navLinks[role] || [];

  return (
    // Responsive: hidden on small screens, flex on medium and up
    <motion.aside
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 25 }}
      className="hidden md:flex w-64 h-screen flex-col z-20"
    >
      <div className="flex-1 flex flex-col bg-slate-800/50 border-r border-slate-700/80 backdrop-blur-lg">
        {/* Header/Logo */}
        <div className="flex items-center justify-center p-6 h-20 border-b border-slate-700/50">
            <ShieldCheck className="w-8 h-8 text-sky-400" />
            <h1 className="ml-3 text-2xl font-bold text-slate-100">HostelCare</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `relative flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive ? 'text-slate-100' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="active-sidebar-pill"
                      className="absolute inset-0 bg-sky-500/20"
                      style={{ borderRadius: '8px' }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <link.icon className="w-5 h-5 mr-4 relative z-10" />
                  <span className="relative z-10">{link.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer/User Profile Section */}
        <div className="p-4 border-t border-slate-700/50">
           <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sky-300">
                    {user?.fullName?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                    <p className="font-semibold text-slate-200 text-sm truncate">{user?.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>
           </div>
           <motion.button
            onClick={logout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
           >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
           </motion.button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;