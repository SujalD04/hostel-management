import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/apiClient';
import { User, Mail, Lock, Loader, AlertTriangle, CheckCircle } from 'lucide-react';
import AuthLayout from './AuthLayout'; // <-- Import the new layout

// Reusable FormField from our design system
const FormField = ({ icon, ...props }) => (
  <div>
    <div className="flex items-center bg-slate-900/70 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
      <span className="pl-4 pr-2 text-slate-500">{icon}</span>
      <input
        {...props}
        className="w-full h-12 py-2 pr-4 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
      />
    </div>
  </div>
);

const SignupPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- Signup logic is untouched ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = { fullName, email, password };
      await apiClient.post('/auth/register', payload);
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. The email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an Account" subtitle="Join HostelCare to manage your stay and complaints.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField icon={<User size={20} />} type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
        <FormField icon={<Mail size={20} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" required />
        <FormField icon={<Lock size={20} />} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min. 6 characters)" required />
        
        <AnimatePresence>
            {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-3 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" /><span>{error}</span>
                </motion.div>
            )}
            {success && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm p-3 rounded-lg flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0" /><span>{success}</span>
                </motion.div>
            )}
        </AnimatePresence>

        <div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading || success}
            className="w-full flex items-center justify-center gap-2 py-3 font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isLoading ? <><Loader size={20} className="animate-spin" /> Creating Account...</> : 'Sign Up'}
          </motion.button>
        </div>
      </form>
      
      <p className="text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-sky-400 hover:text-sky-300 transition-colors">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default SignupPage;