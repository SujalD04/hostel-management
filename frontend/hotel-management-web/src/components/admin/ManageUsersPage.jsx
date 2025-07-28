import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, UserPlus, Users, Edit, Trash2 } from 'lucide-react';
import CreateUserModal from '../../components/admin/CreateUserModal';

// --- Re-using the consistent animation variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

// --- Role colors remain the same, just with a more modern palette ---
const roleColors = {
  ADMIN: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
  WARDEN: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  STUDENT: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  ELECTRICIAN: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  CLEANER: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
};

// --- Main Component ---
const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Backend data fetching logic is untouched ---
  const fetchUsers = useCallback(async () => {
    // No need to set loading to true here on refetch, to avoid screen flicker
    try {
      const response = await apiClient.get('/admin/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
      // You could set an error state here for better user feedback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserCreated = () => {
    // This function is passed to the modal to refetch users after creation
    fetchUsers();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Users className="h-8 w-8 text-sky-400" />
              User Management
            </h1>
            <p className="text-slate-400 mt-1">Create, view, and manage system users.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-sky-500/20 transition-all duration-300"
          >
            <UserPlus className="h-5 w-5" />
            Create User
          </motion.button>
        </div>

        {/* --- Main Content Area --- */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
          {isLoading ? (
            <TableSkeleton />
          ) : users.length > 0 ? (
            <UserTable users={users} />
          ) : (
            <EmptyState onActionClick={() => setIsModalOpen(true)} />
          )}
        </div>
      </motion.div>

      {/* --- Modal Handling --- */}
      <AnimatePresence>
        {isModalOpen && (
          <CreateUserModal
            onClose={() => setIsModalOpen(false)}
            onUserCreated={handleUserCreated}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- Refactored User Table Component ---
const UserTable = ({ users }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-slate-900/50">
        <tr>
          <th className="py-3 px-5 text-left font-semibold text-slate-300">User</th>
          <th className="py-3 px-5 text-left font-semibold text-slate-300">Role</th>
          <th className="py-3 px-5 text-left font-semibold text-slate-300 hidden md:table-cell">Created At</th>
          <th className="py-3 px-5 text-left font-semibold text-slate-300">Actions</th>
        </tr>
      </thead>
      <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
        {users.map(user => (
          <UserRow key={user.id} user={user} />
        ))}
      </motion.tbody>
    </table>
  </div>
);

// --- Individual User Row Component for Animation ---
const UserRow = ({ user }) => (
  <motion.tr
    variants={itemVariants}
    className="border-b border-slate-700/50 hover:bg-slate-700/40 transition-colors duration-200"
  >
    <td className="p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sky-300">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-slate-200">{user.fullName}</div>
          <div className="text-slate-400">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="p-5">
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleColors[user.role] || 'bg-gray-500/20 text-gray-300'}`}>
        {user.role}
      </span>
    </td>
    <td className="p-5 text-slate-400 hidden md:table-cell">
      {format(new Date(user.createdAt), 'dd MMM, yyyy')}
    </td>
    <td className="p-5">
      <div className="flex items-center gap-2">
        <button className="p-2 text-slate-400 hover:text-amber-400 transition-colors rounded-md hover:bg-slate-700"><Edit className="h-4 w-4" /></button>
        <button className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-md hover:bg-slate-700"><Trash2 className="h-4 w-4" /></button>
      </div>
    </td>
  </motion.tr>
);

// --- Skeleton Component for Loading State ---
const TableSkeleton = () => (
  <div className="p-5">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 animate-pulse mb-4">
        <div className="w-10 h-10 rounded-full bg-slate-700"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="h-6 w-24 bg-slate-700 rounded-full"></div>
        <div className="h-8 w-20 bg-slate-700 rounded-md"></div>
      </div>
    ))}
  </div>
);

// --- Component for Empty State ---
const EmptyState = ({ onActionClick }) => (
  <div className="text-center py-20 px-6">
    <Users className="mx-auto h-12 w-12 text-slate-500" />
    <h3 className="mt-4 text-xl font-semibold text-slate-200">No Users Found</h3>
    <p className="mt-2 text-slate-400">Get started by creating the first user account.</p>
    <div className="mt-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onActionClick}
        className="flex items-center justify-center gap-2 mx-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-sky-500/20 transition-all duration-300"
      >
        <UserPlus className="h-5 w-5" />
        Create First User
      </motion.button>
    </div>
  </div>
);

export default ManageUsersPage;