import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { format } from 'date-fns';
import { AlertTriangle, Loader, Check, Ticket } from 'lucide-react';
import GenerateTicketModal from '../../components/warden/GenerateTicketModal';

const statusStyles = {
  SUBMITTED: 'bg-yellow-500/20 text-yellow-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300',
  TICKET_GENERATED: 'bg-purple-500/20 text-purple-300',
  COMPLETED: 'bg-green-500/20 text-green-300',
  REJECTED: 'bg-red-500/20 text-red-300',
};

const WardenDashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedCleaners, setSelectedCleaners] = useState({});
  const [cleaners, setCleaners] = useState([]);


  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/warden/complaints');
      setComplaints(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Could not load complaints.');
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
    }, []);


  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);
  
  const handleApproveCleaning = async (complaintId, cleanerId) => {
    try {
        // 👇 Send cleanerId in the request body!
        await apiClient.post(
            `/warden/complaints/${complaintId}/approve-cleaning`,
            {}, // empty body, since you don’t need it
            { params: { cleanerId: cleanerId } } // ✅ this adds ?cleanerId=UUID
        );
        fetchComplaints(); // Refresh updated list
    } catch (err) {
        console.error(err);
        alert('Failed to approve and assign cleaning complaint.');
    }
    };

    const handleCleanerChange = (complaintId, cleanerId) => {
        setSelectedCleaners(prev => ({
            ...prev,
            [complaintId]: cleanerId
        }));
    };



  const handleOpenTicketModal = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="flex justify-center mt-10"><Loader className="animate-spin h-10 w-10 text-white" /></div>;
  if (error) return <div className="text-red-400 text-center mt-10"><AlertTriangle className="mx-auto h-8 w-8" />{error}</div>;

  return (
    <>
      <h1 className="text-4xl font-bold text-white mb-8">All Complaints</h1>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4">Student</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Status</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {complaints.map(c => (
              <tr key={c.id} className="hover:bg-gray-700/50">
                <td className="py-3 px-4">{c.studentName}</td>
                <td className="py-3 px-4">{c.description}</td>
                <td className="py-3 px-4">{c.complaintType}</td>
                <td className="py-3 px-4 text-sm text-gray-400">{format(new Date(c.createdAt), 'dd MMM yyyy')}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[c.status]}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {c.status === 'SUBMITTED' && c.complaintType === 'CLEANER' && (
                    <>
                        <select 
                        onChange={e => handleCleanerChange(c.id, e.target.value)}
                        value={selectedCleaners[c.id] || ''}
                        >
                        <option value="">Select Cleaner</option>
                        {cleaners.map(cl => (
                            <option key={cl.id} value={cl.id}>{cl.fullName}</option>
                        ))}
                        </select>
                        <button
                        disabled={!selectedCleaners[c.id]}
                        onClick={() => handleApproveCleaning(c.id, selectedCleaners[c.id])}
                        >
                        Approve
                        </button>
                    </>
                    )}
                  {c.status === 'SUBMITTED' && (c.complaintType === 'ELECTRICIAN' || c.complaintType === 'WARDEN') && (
                    <button onClick={() => handleOpenTicketModal(c)} className="flex items-center text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded">
                      <Ticket className="h-4 w-4 mr-1"/> Generate Ticket
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <GenerateTicketModal 
            complaint={selectedComplaint} 
            onClose={() => setIsModalOpen(false)}
            onTicketGenerated={fetchComplaints}
        />
      )}
    </>
  );
};

export default WardenDashboardPage;