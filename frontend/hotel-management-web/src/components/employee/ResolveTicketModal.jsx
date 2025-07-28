import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckSquare, Loader, AlertTriangle, MessageSquare } from 'lucide-react';

// --- Reusable Text Area Component ---
const TextAreaField = ({ icon, label, ...props }) => (
  <div>
    <label htmlFor={props.id} className="text-sm font-medium text-slate-400 mb-2 block">
      {label}
    </label>
    <div className="relative bg-slate-900/70 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
      <span className="absolute top-3.5 left-4 text-slate-500">{icon}</span>
      <textarea
        {...props}
        className="w-full h-32 p-3 pl-12 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
      />
    </div>
  </div>
);


// --- Main Modal Component ---
const ResolveTicketModal = ({ ticket, onClose, onTicketResolved }) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const modalRef = useRef();
  
  // Destructure for easier access, assuming the parent component passes the full task object
  const details = ticket.complaint || ticket;

  // --- Backend submission logic is untouched ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // The core onTicketResolved call is the same
      await onTicketResolved(ticket.id, resolutionNotes);
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Failed to resolve the ticket. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="flex items-start justify-between p-5 border-b border-slate-700">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-sky-400"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Resolve Ticket</h2>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">"{details.description}"</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 ml-4 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* --- Modal Form --- */}
          <form onSubmit={handleSubmit} className="p-5">
             <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: '20px' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm p-3 rounded-lg flex items-center gap-3"
                >
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          
            <TextAreaField
              id="notes"
              icon={<MessageSquare size={18} />}
              label="Resolution Notes"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g., Replaced the faulty capacitor and tested the connection."
            />
            
            {/* --- Modal Footer --- */}
            <div className="flex justify-end items-center gap-4 pt-6">
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
                className="flex items-center justify-center gap-2 w-44 px-5 py-2.5 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
              >
                {isLoading ? <Loader size={20} className="animate-spin" /> : 'Mark as Resolved'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResolveTicketModal;