import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/apiClient';
import { CheckCircle, AlertTriangle, FilePlus2, Trash2, Zap, MapPin, MessageSquare, Loader } from 'lucide-react';

// --- Reusable Form Field Components (consistent with our design system) ---
const FormField = ({ icon, label, ...props }) => (
  <div>
    <label htmlFor={props.id} className="block text-sm font-medium text-slate-400 mb-2">
      {label}
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

const TextAreaField = ({ icon, label, ...props }) => (
  <div>
    <label htmlFor={props.id} className="block text-sm font-medium text-slate-400 mb-2">
      {label}
    </label>
    <div className="flex items-start bg-slate-900/70 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
      <span className="pl-4 pr-2 pt-3 text-slate-500">{icon}</span>
      <textarea
        {...props}
        className="w-full p-3 pl-0 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
      />
    </div>
  </div>
);

// --- Main Page Component ---
const NewComplaintPage = () => {
  const [complaintType, setComplaintType] = useState('CLEANER');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  // --- Backend submission logic remains completely untouched ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = { complaintType, location, description };
      await apiClient.post('/complaints', payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const complaintOptions = [
    { value: 'CLEANER', label: 'Cleaning Issue', icon: <Trash2 size={20} /> },
    { value: 'ELECTRICIAN', label: 'Electrical Issue', icon: <Zap size={20} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <FilePlus2 className="h-8 w-8 text-sky-400" />
            File a New Complaint
          </h1>
          <p className="text-slate-400 mt-1">Please provide details about the issue you are facing.</p>
        </div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-800/60 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center p-10 min-h-[400px]"
              >
                  <CheckCircle className="h-16 w-16 text-emerald-400" />
                  <h2 className="mt-4 text-2xl font-bold text-slate-100">Complaint Submitted!</h2>
                  <p className="mt-2 text-slate-400">Thank you. Your complaint has been received and will be reviewed shortly.</p>
                  <p className="mt-1 text-xs text-slate-500">Redirecting you to the dashboard...</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="p-8 space-y-6"
              >
                {/* Complaint Type Radio Group */}
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Complaint Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {complaintOptions.map(option => (
                            <button
                                type="button"
                                key={option.value}
                                onClick={() => setComplaintType(option.value)}
                                className={`flex items-center justify-center gap-3 w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                                    complaintType === option.value
                                    ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                {option.icon}
                                <span className="font-semibold">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location and Description */}
                <FormField id="location" icon={<MapPin size={20} />} label="Location (e.g., Room 404, Block B)" type="text" value={location} onChange={(e) => setLocation(e.target.value)} required />
                <TextAreaField id="description" icon={<MessageSquare size={20} />} label="Description of the Issue" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} required />

                {/* Submit Button & Error Message */}
                <div className="pt-4">
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: '16px' }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-3 rounded-lg flex items-center gap-3"
                            >
                                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 py-3 font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <><Loader size={20} className="animate-spin" /> Submitting...</> : 'Submit Complaint'}
                    </motion.button>
                </div>
              </motion.form>
            )}
            </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NewComplaintPage;