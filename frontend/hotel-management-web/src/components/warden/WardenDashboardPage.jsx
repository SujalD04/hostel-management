import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader, Check, Ticket, ListChecks, History, MapPin, Clock } from 'lucide-react';
import GenerateTicketModal from '../../components/warden/GenerateTicketModal';

// --- Status styles for consistency ---
const statusStyles = {
  SUBMITTED: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  IN_PROGRESS: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
  TICKET_GENERATED: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  COMPLETED: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  REJECTED: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
};

// --- Main Page Component ---
const WardenDashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [view, setView] = useState('active'); // 'active' or 'completed'

  // --- Backend data fetching logic is untouched ---
  const fetchComplaints = useCallback(async () => {
    try {
      const response = await apiClient.get('/warden/complaints');
      setComplaints(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Could not load complaints.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchCleaners = async () => {
      try {
        const response = await apiClient.get('/warden/cleaners');
        setCleaners(response.data);
      } catch (err) {
        console.error('Could not load cleaners', err);
      }
    };
    fetchCleaners();
    fetchComplaints();
  }, [fetchComplaints]);

  // --- Action Handlers are untouched ---
  const handleApproveCleaning = async (complaintId, cleanerId) => {
    try {
      await apiClient.post(`/warden/complaints/${complaintId}/approve-cleaning`, {}, { params: { cleanerId } });
      fetchComplaints();
    } catch (err) {
      console.error(err);
      throw new Error('Failed to assign complaint.');
    }
  };

  const handleOpenTicketModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };
  
  // --- Filtered lists based on the current view ---
  const activeComplaints = complaints.filter(c => c.status !== 'COMPLETED');
  const completedComplaints = complaints.filter(c => c.status === 'COMPLETED');
  
  const renderContent = () => {
    if (isLoading) return <ComplaintCardSkeleton />;
    if (error) return <ErrorState message={error} />;
    
    const complaintsToDisplay = view === 'active' ? activeComplaints : completedComplaints;

    if (complaintsToDisplay.length === 0) {
        return view === 'active' ? <ActiveEmptyState /> : <CompletedEmptyState />;
    }
    
    return (
      <motion.div
        key={view} // Add key to force re-render with animations on view change
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {complaintsToDisplay.map(complaint => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
            cleaners={cleaners}
            onApprove={handleApproveCleaning}
            onGenerateTicket={handleOpenTicketModal}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <ListChecks className="h-8 w-8 text-sky-400" />
            Manage Complaints
          </h1>
          <p className="text-slate-400 mt-1">Review, assign, and process all student complaints.</p>
        </div>

        {/* --- View Switcher --- */}
        <ViewSwitcher
          view={view}
          setView={setView}
          activeCount={activeComplaints.length}
          completedCount={completedComplaints.length}
        />

        {/* --- Content Area --- */}
        <div className="mt-8">
            {renderContent()}
        </div>

      </motion.div>

      <AnimatePresence>
        {isModalOpen && selectedComplaint && (
          <GenerateTicketModal
            complaint={selectedComplaint}
            onClose={() => setIsModalOpen(false)}
            onTicketGenerated={fetchComplaints}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// --- View Switcher Component ---
const ViewSwitcher = ({ view, setView, activeCount, completedCount }) => {
  const tabs = [
    { id: 'active', label: 'Active Complaints', count: activeCount, icon: <ListChecks size={18} /> },
    { id: 'completed', label: 'Completed History', count: completedCount, icon: <History size={18} /> },
  ];

  return (
    <div className="p-1.5 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center gap-2 max-w-md">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          className={`${
            view === tab.id ? 'text-slate-100' : 'text-slate-400 hover:text-slate-200'
          } relative w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold transition rounded-lg`}
        >
          {view === tab.id && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-slate-700/50"
              style={{ borderRadius: '8px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">{tab.icon}{tab.label}
             <span className="bg-slate-900 text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{tab.count}</span>
          </span>
        </button>
      ))}
    </div>
  );
};


// --- Individual Complaint Card Component ---
const ComplaintCard = ({ complaint, cleaners, onApprove, onGenerateTicket }) => {
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  
  const handleApproveClick = async () => {
    if (!selectedCleaner) {
      setUpdateError('Please select a cleaner.');
      return;
    }
    setIsUpdating(true);
    setUpdateError('');
    try {
      await onApprove(complaint.id, selectedCleaner);
    } catch (error) {
      setUpdateError(error.message);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const ActionPanel = () => {
    if (complaint.status !== 'SUBMITTED') {
      return <p className="text-xs text-center text-slate-500 italic py-2">No pending actions</p>;
    }

    if (complaint.complaintType === 'CLEANER') {
      const cleanerOptions = cleaners.map(c => ({ value: c.id, label: c.fullName }));
      return (
        <div className="space-y-3">
          <select
            value={selectedCleaner}
            onChange={(e) => setSelectedCleaner(e.target.value)}
            className="w-full h-11 py-2 px-3 bg-slate-900/70 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
            disabled={isUpdating}
          >
            <option value="">-- Assign a Cleaner --</option>
            {cleanerOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-slate-800">{opt.label}</option>)}
          </select>
          <motion.button
            onClick={handleApproveClick}
            disabled={!selectedCleaner || isUpdating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isUpdating ? <Loader size={20} className="animate-spin" /> : <><Check size={20} /> Approve & Assign</>}
          </motion.button>
          {updateError && <p className="text-xs text-rose-400 text-center">{updateError}</p>}
        </div>
      );
    }

    if (complaint.complaintType === 'ELECTRICIAN' || complaint.complaintType === 'WARDEN') {
      return (
        <motion.button
          onClick={() => onGenerateTicket(complaint)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors"
        >
          <Ticket size={20} /> Generate Ticket
        </motion.button>
      );
    }
    
    return null;
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm flex flex-col"
    >
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sky-300 text-sm">
            {complaint.studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-200">{complaint.studentName}</p>
            <p className="text-xs text-slate-400">{complaint.student?.roomNumber || 'Room N/A'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[complaint.status]}`}>
          {complaint.status.replace('_', ' ')}
        </span>
      </div>

      <div className="p-4 flex-grow">
        <p className="text-slate-300">{complaint.description}</p>
        <div className="text-xs text-slate-400 mt-4 space-y-2">
            <p className="flex items-center gap-2"><MapPin size={12}/>{complaint.location}</p>
            <p className="flex items-center gap-2"><Clock size={12}/>{formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}</p>
        </div>
      </div>

      <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 rounded-b-xl">
        <ActionPanel />
      </div>
    </motion.div>
  );
};


// --- Helper Components for Page States ---
const ComplaintCardSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl animate-pulse">
        <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700"></div>
            <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-700 rounded"></div>
                <div className="h-3 w-16 bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="h-6 w-24 bg-slate-700 rounded-full"></div>
        </div>
        <div className="p-4">
          <div className="h-4 w-full bg-slate-700 rounded mb-2"></div>
          <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
        </div>
        <div className="p-4 bg-slate-900/40 border-t border-slate-700/50 rounded-b-xl">
            <div className="h-11 w-full bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);

const ActiveEmptyState = () => (
  <div className="text-center py-20 px-6 bg-slate-800/40 border border-slate-700 rounded-xl">
    <Check className="mx-auto h-16 w-16 text-emerald-400" />
    <h3 className="mt-4 text-2xl font-bold text-slate-100">Inbox Zero!</h3>
    <p className="mt-2 text-slate-400">There are no active complaints to review. Great job!</p>
  </div>
);

const CompletedEmptyState = () => (
  <div className="text-center py-20 px-6 bg-slate-800/40 border border-slate-700 rounded-xl">
    <History className="mx-auto h-16 w-16 text-slate-500" />
    <h3 className="mt-4 text-2xl font-bold text-slate-100">No Completed Tasks</h3>
    <p className="mt-2 text-slate-400">The history of completed complaints will appear here.</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-red-300">
    <AlertTriangle className="h-12 w-12" />
    <h2 className="mt-4 text-xl font-semibold">An Error Occurred</h2>
    <p>{message}</p>
  </div>
);

export default WardenDashboardPage;