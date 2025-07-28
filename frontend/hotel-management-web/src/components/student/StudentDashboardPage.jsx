import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import ComplaintCard from '../../components/student/ComplaintCard'; // Using the modern card we already designed
import { motion } from 'framer-motion';
import { AlertTriangle, Loader, LayoutGrid, FilePlus2, Megaphone } from 'lucide-react';

// --- Main Page Component ---
const StudentDashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Backend data fetching logic is completely untouched ---
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/complaints/my-complaints');
        const sortedComplaints = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComplaints(sortedComplaints);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
        setError('Could not load your complaints. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <ComplaintListSkeleton />;
    }
    if (error) {
      return <ErrorState message={error} />;
    }
    if (complaints.length === 0) {
      return <EmptyState />;
    }
    return (
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      >
        {complaints.map((complaint, index) => (
          <ComplaintCard key={complaint.id} complaint={complaint} index={index} />
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
    >
        {/* --- Page Header --- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <LayoutGrid className="h-8 w-8 text-sky-400" />
              My Complaints Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Track the status of all your complaints here.</p>
          </div>
          <Link to="/student/new-complaint">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-sky-500/20 transition-all duration-300"
            >
              <FilePlus2 className="h-5 w-5" />
              File New Complaint
            </motion.button>
          </Link>
        </div>

        {/* --- Content Area --- */}
        {renderContent()}
    </motion.div>
  );
};


// --- Helper Components for Page States ---

const ComplaintListSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 animate-pulse">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="h-7 w-32 bg-slate-700 rounded"></div>
                    <div className="h-6 w-24 bg-slate-700 rounded-full"></div>
                </div>
                {/* Body */}
                <div className="space-y-3 mb-5">
                    <div className="h-4 w-full bg-slate-700 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
                </div>
                {/* Footer Timeline */}
                <div className="pt-4 mt-4 border-t border-slate-700/50 flex justify-between items-center">
                    <div className="h-8 w-20 bg-slate-700 rounded"></div>
                    <div className="h-2 w-24 bg-slate-700 rounded"></div>
                    <div className="h-8 w-20 bg-slate-700 rounded"></div>
                    <div className="h-2 w-24 bg-slate-700 rounded"></div>
                    <div className="h-8 w-20 bg-slate-700 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

const EmptyState = () => (
  <div className="text-center py-20 px-6 bg-slate-800/40 border border-dashed border-slate-700 rounded-xl">
    <Megaphone className="mx-auto h-16 w-16 text-slate-500" />
    <h3 className="mt-4 text-2xl font-bold text-slate-100">No Complaints Yet</h3>
    <p className="mt-2 text-slate-400">Ready to report an issue? Click the button below to get started.</p>
    <div className="mt-6">
        <Link to="/student/new-complaint">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 mx-auto bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-sky-500/20 transition-all duration-300"
            >
                <FilePlus2 className="h-5 w-5" />
                File Your First Complaint
            </motion.button>
        </Link>
    </div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="flex flex-col items-center justify-center min-h-[40vh] bg-red-900/20 border border-red-500/30 rounded-lg p-8 text-red-300">
    <AlertTriangle className="h-12 w-12" />
    <h2 className="mt-4 text-xl font-semibold">An Error Occurred</h2>
    <p>{message}</p>
  </div>
);

export default StudentDashboardPage;