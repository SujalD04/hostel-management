import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Loader, AlertTriangle, LayoutDashboard, ClipboardList, Clock, CheckCircle,
  Inbox, MailCheck, Server, Cpu, Database, MemoryStick, Zap, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

// --- Helper Functions & Components ---

// Formats uptime from seconds into a readable string
const formatUptime = (seconds) => {
    if (seconds === null || isNaN(seconds) || seconds < 0) return "N/A";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [complaintHistory, setComplaintHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data fetching logic (untouched) ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, perfRes, historyRes] = await Promise.all([
          apiClient.get('/dashboard/stats'),
          apiClient.get('/admin/perf'),
          apiClient.get('/admin/complaints/all')
        ]);

        setStats({ ...statsRes.data, performance: perfRes.data });
        setComplaintHistory(historyRes.data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // --- JSX for the component ---
  // --- JSX for the component ---
  if (isLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader className="h-10 w-10 animate-spin text-sky-500" />
        <p className="mt-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-red-900/10 border border-red-500/30 rounded-lg p-8 m-4 text-red-400">
        <AlertTriangle className="h-12 w-12" />
        <h2 className="mt-4 text-xl font-semibold text-red-300">An Error Occurred</h2>
        <p>{error}</p>
      </div>
    );
  }

  const perf = stats?.performance;
  const health = perf?.health?.components;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-sky-400" /> Admin Dashboard
        </h1>
        <p className="text-slate-400 mt-1">An overview of application activity and server health.</p>
      </div>
      
      {/* --- Section 1: Application Statistics --- */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Application Statistics</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" variants={containerVariants} initial="hidden" animate="visible">
          <StatCard title="Total Complaints" value={stats.totalComplaints} icon={<ClipboardList />} color="sky" />
          <StatCard title="Pending Complaints" value={stats.pendingComplaints} icon={<Clock />} color="amber" />
          <StatCard title="Completed Complaints" value={stats.completedComplaints} icon={<CheckCircle />} color="emerald" />
          <StatCard title="Open Tickets" value={stats.openTickets} icon={<Inbox />} color="rose" />
          <StatCard title="Resolved Tickets" value={stats.resolvedTickets} icon={<MailCheck />} color="violet" />
        </motion.div>
      </section>

      {/* --- Section 2: Server Performance --- */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">Server Performance</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6" variants={containerVariants} initial="hidden" animate="visible">
          <StatCard title="Server Status" value={health?.ping?.status || "UNKNOWN"} icon={<Server />} color="emerald" />
          <StatCard title="Database" value={health?.db?.status || "UNKNOWN"} icon={<Database />} color="emerald" />
          <StatCard title="Server Uptime" value={formatUptime(perf?.uptime?.measurements?.[0]?.value)} icon={<Clock />} color="sky" />
          <StatCard title="CPU Usage" value={`${((perf?.cpu?.measurements?.[0]?.value || 0) * 100).toFixed(1)}%`} icon={<Cpu />} color="amber" />
          <StatCard title="Memory" value={`${((perf?.memUsed?.measurements?.[0]?.value || 0) / 1024 / 1024).toFixed(0)} MB`} icon={<MemoryStick />} color="rose" />
        </motion.div>
      </section>
      
      {/* --- Section 3: Enhanced Complaint History with Pagination --- */}
      <ComplaintHistoryTable history={complaintHistory} />

    </motion.div>
  );
};

// --- Reusable StatCard (unchanged) ---
// --- Reusable StatCard (unchanged) ---
const StatCard = ({ title, value, icon, color }) => {
  const colorClasses = {
    sky: 'text-sky-400', amber: 'text-amber-400', emerald: 'text-emerald-400',
    rose: 'text-rose-400', violet: 'text-violet-400',
  };
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 300 } }}
      className={`relative overflow-hidden rounded-xl bg-slate-800/60 p-5 shadow-lg border border-slate-700 backdrop-blur-sm`}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 bg-slate-900/50 ${colorClasses[color]}`}>
          {React.cloneElement(icon, { className: "h-7 w-7" })}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
        </div>
      </div>
      <div className={`absolute -bottom-4 -right-4 h-16 w-16 ${colorClasses[color]} opacity-10 rounded-full`}></div>
    </motion.div>
  );
};



const statusStyles = {
    SUBMITTED: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    IN_PROGRESS: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    TICKET_GENERATED: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    REJECTED: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

const StatusBadge = ({ status }) => (
  <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[status] || ''}`}>
    {status.replace('_', ' ').toLowerCase()}
  </span>
);

const TypePill = ({ type }) => {
    const isElec = type === 'ELECTRICIAN';
    return (
      <div className={`inline-flex items-center gap-2 text-sm ${isElec ? 'text-amber-300' : 'text-sky-300'}`}>
        {isElec ? <Zap size={16} /> : <Trash2 size={16} />}
        <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
      </div>
    );
};

const UserCell = ({ name }) => (
    name ? (
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sky-300 text-xs">{name.charAt(0).toUpperCase()}</div><span>{name}</span></div>
    ) : (<span className="text-slate-500">—</span>)
);

const ComplaintHistoryTable = ({ history }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    // Pagination logic
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);

    return (
        <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Complaint History</h2>
            {history.length === 0 ? (
                <div className="text-center py-16 px-6 bg-slate-800/40 border border-dashed border-slate-700 rounded-xl">
                    <p className="text-slate-400">No complaint history found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm">
                    <table className="min-w-full text-sm">
                        <thead className="border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left font-semibold text-slate-400">Complaint ID</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-400">Student</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-400">Type</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-400">Status</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-400">Assigned To</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-400">Filed On</th>
                                <th className="px-6 py-3 text-left font-semibold text-slate-400">Resolved On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((c) => (
                                <tr key={c.complaintId} className="border-b border-slate-700/50 hover:bg-slate-700/40 transition-colors duration-200">
                                    <td className="px-6 py-4 font-mono text-sky-400">#{c.complaintId}</td>
                                    <td className="px-6 py-4 text-slate-200 font-medium"><UserCell name={c.studentName} /></td>
                                    <td className="px-6 py-4"><TypePill type={c.complaintType} /></td>
                                    <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                                    <td className="px-6 py-4 text-slate-300"><UserCell name={c.assignedTo} /></td>
                                    <td className="px-6 py-4 text-slate-400">{format(new Date(c.createdAt), 'dd MMM, yyyy')}</td>
                                    <td className="px-6 py-4 text-slate-400">{c.resolvedAt ? format(new Date(c.resolvedAt), 'dd MMM, yyyy') : <span className="text-slate-500">—</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {/* --- Pagination Controls --- */}
                    <div className="flex items-center justify-between p-4 border-t border-slate-700/50">
                        <span className="text-sm text-slate-400">
                            Page <span className="font-semibold text-slate-200">{currentPage}</span> of <span className="font-semibold text-slate-200">{totalPages}</span>
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={16}/></button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                </div>
            )}
        </motion.section>
    );
};


export default AdminDashboard;