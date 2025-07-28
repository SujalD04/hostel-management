import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/apiClient';
import { X, Ticket, Loader, AlertTriangle, UserCheck } from 'lucide-react';

// --- Reusable Select Field Component (from previous designs) ---
const SelectField = ({ icon, label, options, isLoading, ...props }) => (
  <div>
    <label htmlFor={props.id} className="text-sm font-medium text-slate-400 mb-2 block">
      {label}
    </label>
    {isLoading ? (
      <div className="w-full h-12 bg-slate-900/70 border border-slate-700 rounded-lg animate-pulse"></div>
    ) : (
      <div className="flex items-center bg-slate-900/70 border border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
        <span className="pl-4 pr-2 text-slate-500">{icon}</span>
        <select
          {...props}
          className="w-full h-12 py-2 pr-4 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none appearance-none"
        >
          {options.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">{opt.label}</option>)}
        </select>
      </div>
    )}
  </div>
);


// --- Main Modal Component ---
const GenerateTicketModal = ({ complaint, onClose, onTicketGenerated }) => {
  const [electricians, setElectricians] = useState([]);
  const [selectedElectrician, setSelectedElectrician] = useState('');
  const [isFetching, setIsFetching] = useState(true); // For fetching electricians
  const [isSubmitting, setIsSubmitting] = useState(false); // For form submission
  const [error, setError] = useState('');
  const modalRef = useRef();

  // --- Backend data fetching logic is untouched ---
  useEffect(() => {
    const fetchElectricians = async () => {
      setIsFetching(true);
      try {
        const response = await apiClient.get('/admin/users?role=ELECTRICIAN');
        setElectricians(response.data);
        if (response.data.length > 0) {
          setSelectedElectrician(response.data[0].id);
        } else {
          setError("No electricians are available to be assigned.");
        }
      } catch (err) {
        console.error("Failed to fetch electricians", err);
        setError("Could not load the list of electricians.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchElectricians();
  }, []);

  // --- Backend submission logic is untouched ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElectrician) {
      setError("You must select an electrician to generate a ticket.");
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const payload = {
        complaintId: complaint.id,
        electricianId: selectedElectrician,
      };
      await apiClient.post('/warden/tickets', payload);
      onTicketGenerated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate the ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const electricianOptions = electricians.map(e => ({ value: e.id, label: e.fullName }));

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.95, opacity: 0, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative bg-slate-800/80 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* --- Modal Header --- */}
          <div className="flex items-start justify-between p-5 border-b border-slate-700">
             <div className="flex items-center gap-4">
               <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Ticket className="h-6 w-6 text-amber-400"/>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">Generate New Ticket</h2>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">For: "{complaint.description}"</p>
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
          
            <SelectField
              id="electrician"
              icon={<UserCheck size={20} />}
              label="Assign to Electrician"
              options={electricianOptions}
              value={selectedElectrician}
              onChange={(e) => setSelectedElectrician(e.target.value)}
              isLoading={isFetching}
              disabled={isFetching || electricians.length === 0}
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
                disabled={isSubmitting || isFetching || electricians.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 w-36 px-5 py-2.5 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
              >
                {isSubmitting ? <Loader size={20} className="animate-spin" /> : 'Generate'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GenerateTicketModal;