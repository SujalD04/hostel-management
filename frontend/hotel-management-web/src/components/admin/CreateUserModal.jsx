import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/apiClient';

const CreateUserModal = ({ onClose, onUserCreated }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const payload = { fullName, email, password, role };
      await apiClient.post('/admin/users', payload);
      onUserCreated();
      onClose();
    } catch (err) {
      setError('Failed to create user. The email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"
        >
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Create New User</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Full Name */}
            <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            {/* Email */}
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            {/* Password */}
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            {/* Role */}
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="STUDENT">Student</option>
              <option value="WARDEN">Warden</option>
              <option value="CLEANER">Cleaner</option>
              <option value="ELECTRICIAN">Electrician</option>
              <option value="ADMIN">Admin</option>
            </select>
            
            {error && <p className="text-sm text-red-400">{error}</p>}
            
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-500">
                {isLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateUserModal;