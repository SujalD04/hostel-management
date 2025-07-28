import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader, Check, Wrench, ClipboardList, MapPin, Zap, Trash2, Clock } from 'lucide-react';
import ResolveTicketModal from '../../components/employee/ResolveTicketModal';

// --- Main Page Component ---
const EmployeeDashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const isElectrician = user?.role === 'ELECTRICIAN';
  const roleName = isElectrician ? 'Electrician' : 'Cleaner';

  // --- Backend data fetching logic is untouched ---
  // --- CORRECTED Data Fetching Logic ---
const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      // Set loading true only on initial fetch
      if (tasks.length === 0) setIsLoading(true);
      const endpoint = isElectrician ? '/electrician/tickets' : '/cleaner/tasks';

      // ✅ FIX: Added the 'params' object back to the API call.
      // This sends the cleanerId as a query parameter (e.g., /api/cleaner/tasks?cleanerId=...)
      // which the backend requires.
      const response = await apiClient.get(endpoint, {
        params: isElectrician ? {} : { cleanerId: user.id }
      });

      setTasks(response.data);
    } catch (err) {
      setError('Could not load your assigned tasks. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
}, [isElectrician, user, tasks.length]);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Run only when user changes

  // --- Action handlers remain untouched, but will be passed down ---
  const handleCompleteCleaningTask = async (complaintId) => {
    try {
      await apiClient.post(`/cleaner/tasks/${complaintId}/complete`);
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error('Failed to complete task.', err);
      // Re-throw to be caught in the child component for UI feedback
      throw new Error('Failed to complete task.');
    }
  };

  const handleResolveTicket = async (ticketId, resolutionNotes) => {
    try {
      const response = await apiClient.patch(`/electrician/tickets/${ticketId}/resolve`, { resolutionNotes });
      fetchTasks(); // Refresh list for consistency
      return response.data;
    } catch (err) {
      console.error('Failed to resolve ticket.', err);
      throw err;
    }
  };

  const openResolveModal = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-sky-400" />
            My Assigned Tasks
          </h1>
          <p className="text-slate-400 mt-1">Pending jobs for you as a {roleName}.</p>
        </div>

        {/* --- Content Area --- */}
        {isLoading ? (
          <TaskCardSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isElectrician={isElectrician}
                onComplete={handleCompleteCleaningTask}
                onResolve={openResolveModal}
              />
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* --- Modal Rendering --- */}
      <AnimatePresence>
        {isModalOpen && selectedTicket && (
          <ResolveTicketModal
            ticket={selectedTicket}
            onClose={() => setIsModalOpen(false)}
            onTicketResolved={handleResolveTicket}
          />
        )}
      </AnimatePresence>
    </>
  );
};


// --- Individual Task Card Component ---
// --- CORRECTED Individual Task Card Component ---
const TaskCard = ({ task, isElectrician, onComplete, onResolve }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // The 'details' variable is removed to prevent the error.
  // We will now access properties directly from the 'task' prop.

  const getIconForType = (type) => {
    switch(type) {
      // Note: Ensure these type strings ('ELECTRICAL', 'CLEANING') match your backend data.
      case 'ELECTRICAL': return <Zap className="h-5 w-5 text-amber-400" />;
      case 'CLEANING': return <Trash2 className="h-5 w-5 text-sky-400" />;
      default: return <Wrench className="h-5 w-5 text-slate-400" />;
    }
  };

  const handleAction = async () => {
    setIsUpdating(true);
    setUpdateError('');
    try {
      if (isElectrician) {
        onResolve(task);
      } else {
        // ✅ FIX: Accessing 'id' directly from 'task'
        await onComplete(task.id);
      }
    } catch (error) {
      setUpdateError(error.message || 'Action failed.');
      setTimeout(() => setUpdateError(''), 3000);
    } finally {
      if (!isElectrician) {
        setIsUpdating(false);
      }
    }
  };
  
  // A fallback for safety in case a task object is malformed.
  if (!task || !task.id) {
    return null; 
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm p-5 transition-all duration-300 hover:border-slate-600 hover:bg-slate-800/80"
    >
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Left Side Details */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* ✅ FIX: Accessing 'complaintType' directly from 'task' */}
            {getIconForType(task.complaintType)}
            <span className="font-semibold text-slate-300">{task.complaintType}</span>
          </div>
          {/* ✅ FIX: Accessing 'description' directly from 'task' */}
          <p className="text-lg font-semibold text-slate-100 leading-tight">{task.description}</p>
          <div className="flex items-center gap-6 text-sm text-slate-400 mt-3">
             {/* ✅ FIX: Accessing 'location' and 'createdAt' directly from 'task' */}
            <span className="flex items-center gap-2"><MapPin size={14} />{task.location}</span>
            <span className="flex items-center gap-2"><Clock size={14} />{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        {/* Right Side Action */}
        <div className="flex sm:flex-col justify-end items-end sm:items-center sm:justify-center">
          <motion.button
            onClick={handleAction}
            disabled={isUpdating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center justify-center gap-2 w-32 px-4 py-2.5 rounded-lg text-white font-semibold transition-all duration-300 disabled:cursor-not-allowed ${
              isElectrician
                ? 'bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 shadow-sky-500/20'
                : 'bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 shadow-emerald-500/20'
            }`}
          >
            {isUpdating ? <Loader size={20} className="animate-spin" /> : <><Check size={20} /> {isElectrician ? 'Resolve' : 'Complete'}</>}
          </motion.button>
          {updateError && <p className="text-xs text-rose-400 mt-2">{updateError}</p>}
        </div>
      </div>
    </motion.div>
  );
};

// --- Helper Components for Page States ---
const TaskCardSkeleton = () => (
  <div className="space-y-5">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 flex justify-between items-center animate-pulse">
        <div className="flex-1">
          <div className="h-5 bg-slate-700 rounded w-1/4 mb-3"></div>
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="h-11 w-32 bg-slate-700 rounded-lg"></div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-20 px-6 bg-slate-800/40 border border-slate-700 rounded-xl">
    <Wrench className="mx-auto h-16 w-16 text-emerald-400" />
    <h3 className="mt-4 text-2xl font-bold text-slate-100">All Tasks Completed!</h3>
    <p className="mt-2 text-slate-400">Great work. You have no pending tasks assigned to you.</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-red-300">
    <AlertTriangle className="h-12 w-12" />
    <h2 className="mt-4 text-xl font-semibold">An Error Occurred</h2>
    <p>{message}</p>
  </div>
);

export default EmployeeDashboardPage;