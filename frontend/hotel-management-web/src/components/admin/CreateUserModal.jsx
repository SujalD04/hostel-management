import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/apiClient';
import { X, User, Mail, KeyRound, Shield, Loader, AlertTriangle } from 'lucide-react';

// --- Reusable Form Field Component ---
const FormField = ({ icon, ...props }) => (
  <div>
    <label className="text-sm font-medium text-slate-400 mb-1 block">
      {props.label}
    </label>
    <div className="flex items-center bg-slate-900/70 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
      <span className="pl-4 pr-2 text-slate-500">{icon}</span>
      <input
        {...props}
        className="w-full h-12 py-2 pr-4 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
      />
    </div>
  </div>
);

// --- Reusable Select Field Component ---
const SelectField = ({ icon, options, ...props }) => (
  <div>
    <label className="text-sm font-medium text-slate-400 mb-1 block">
      {props.label}
    </label>
    <div className="flex items-center bg-slate-900/70 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
      <span className="pl-4 pr-2 text-slate-500">{icon}</span>
      <select
        {...props}
        className="w-full h-12 py-2 pr-4 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none appearance-none"
      >
        {options.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">{opt.label}</option>)}
      </select>
    </div>
  </div>
);


// --- Main Modal Component ---
const CreateUserModal = ({ onClose, onUserCreated }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef();

  // --- Backend submission logic is untouched ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const payload = { fullName, email, password, role };
      await apiClient.post('/admin/users', payload);
      onUserCreated(); // Callback to refresh the user list
      onClose();       // Close the modal on success
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user. The email might already be in use.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const roleOptions = [
    { value: 'STUDENT', label: 'Student' },
    { value: 'WARDEN', label: 'Warden' },
    { value: 'CLEANER', label: 'Cleaner' },
    { value: 'ELECTRICIAN', label: 'Electrician' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose} // Click outside to close
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative bg-slate-800/80 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
        >
          {/* --- Modal Header --- */}
          <div className="flex items-center justify-between p-5 border-b border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Create a New User</h2>
              <p className="text-sm text-slate-400">Enter the details to create a user account.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- Modal Form --- */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-3 rounded-lg flex items-center gap-3"
                >
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <FormField icon={<User size={20} />} label="Full Name" type="text" placeholder="e.g., John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <FormField icon={<Mail size={20} />} label="Email Address" type="email" placeholder="e.g., john.doe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <FormField icon={<KeyRound size={20} />} label="Password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <SelectField icon={<Shield size={20} />} label="User Role" options={roleOptions} value={role} onChange={(e) => setRole(e.target.value)} />
            
            {/* --- Modal Footer --- */}
            <div className="flex justify-end items-center gap-4 pt-4">
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 w-36 px-5 py-2.5 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
              >
                {isLoading ? <Loader size={20} className="animate-spin" /> : 'Create User'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateUserModal;