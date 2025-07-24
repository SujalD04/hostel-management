import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FilePlus2, Users, Wrench, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

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

  const activeLinkStyle = {
    backgroundColor: '#1E40AF', // A darker blue
    color: 'white',
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-64 bg-gray-800 text-gray-200 flex flex-col h-screen shadow-lg"
    >
      <div className="p-6 text-center border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">HostelCare</h1>
        <p className="text-sm text-gray-400 mt-1">{user?.role}</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
            className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <link.icon className="w-5 h-5 mr-3" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 hover:text-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;