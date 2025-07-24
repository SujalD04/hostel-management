import React, { useEffect, useState } from 'react';
import apiClient from '../../api/apiClient';
import { Loader, AlertTriangle, BarChart } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard stats.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 mt-20">
        <AlertTriangle className="mx-auto h-10 w-10" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-white flex items-center gap-2">
        <BarChart className="h-8 w-8 text-blue-500" /> Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Total Complaints" value={stats.totalComplaints} />
        <StatCard title="Pending Complaints" value={stats.pendingComplaints} />
        <StatCard title="Completed Complaints" value={stats.completedComplaints} />
        <StatCard title="Open Tickets" value={stats.openTickets} />
        <StatCard title="Resolved Tickets" value={stats.resolvedTickets} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-md">
    <h2 className="text-lg font-semibold text-gray-300">{title}</h2>
    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
  </div>
);

export default AdminDashboard;
