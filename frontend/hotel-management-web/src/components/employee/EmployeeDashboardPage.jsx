import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Loader, Check, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import ResolveTicketModal from '../../components/employee/ResolveTicketModal';

const EmployeeDashboardPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const isElectrician = user?.role === 'ELECTRICIAN';

  const fetchTasks = useCallback(async () => {
  if (!user) return;

  try {
    setIsLoading(true);
    const endpoint = isElectrician ? '/electrician/tickets' : '/cleaner/tasks';

    const response = await apiClient.get(endpoint, {
      params: isElectrician ? {} : { cleanerId: user.id } // ✅ send cleanerId
    });

    setTasks(response.data);
  } catch (err) {
    setError('Could not load your assigned tasks.');
  } finally {
    setIsLoading(false);
  }
}, [isElectrician, user]);

useEffect(() => {
  if (user) {
    fetchTasks();
  }
}, [fetchTasks, user]);




  const handleCompleteCleaningTask = async (complaintId) => {
    try {
      await apiClient.post(`/cleaner/tasks/${complaintId}/complete`);
      fetchTasks(); // Refresh list
    } catch (err) {
      alert('Failed to complete task.');
    }
  };

  const handleResolveTicket = async (ticketId, resolutionNotes) => {
  try {
    const response = await apiClient.patch(`/electrician/tickets/${ticketId}/resolve`, { resolutionNotes });
    const updatedTicket = response.data;

    // ✅ Remove the resolved ticket from local tasks state
    setTasks(prev =>
      prev.filter(t => t.id !== updatedTicket.id)
    );

    console.log("Resolved ticket removed from local list");

    return updatedTicket;
  } catch (err) {
    alert('Failed to resolve ticket.');
    throw err;
  }
};



  const renderTaskCard = (task, index) => {
    const taskDetails = isElectrician ? task.complaint : task;
    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex justify-between items-center"
      >
        <div>
          <p className="text-sm font-semibold text-blue-400">{task.complaintType}</p> 
          <h3 className="text-lg font-bold text-white mt-1">{task.description}</h3>
          <p className="text-sm text-gray-400 mt-2">Location: {task.location}</p>
        </div>
        <div>
          {isElectrician ? (
            <button onClick={() => { setSelectedTicket(task); setIsModalOpen(true); }} className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              <Check className="h-4 w-4 mr-2"/> Resolve
            </button>
          ) : (
            <button onClick={() => handleCompleteCleaningTask(task.id)} className="flex items-center text-sm bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
              <Check className="h-4 w-4 mr-2"/> Complete
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center mt-10"><Loader className="animate-spin h-10 w-10 text-white" /></div>;
    if (error) return <div className="text-red-400 text-center mt-10"><AlertTriangle className="mx-auto h-8 w-8" />{error}</div>;
    if (tasks.length === 0) {
      return (
        <div className="text-center text-gray-400 mt-20">
          <Wrench className="mx-auto h-16 w-16 text-gray-500" />
          <h2 className="text-2xl font-bold mt-4">All Clear!</h2>
          <p className="mt-2">You have no pending tasks assigned to you.</p>
        </div>
      );
    }
    return <div className="space-y-4">{tasks.map(renderTaskCard)}</div>;
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-white mb-8">My Assigned Tasks</h1>
      {renderContent()}
      {isModalOpen && (
        <ResolveTicketModal 
            ticket={selectedTicket} 
            onClose={() => setIsModalOpen(false)}
            onTicketResolved={handleResolveTicket}
        />
      )}
    </>
  );
};

export default EmployeeDashboardPage;