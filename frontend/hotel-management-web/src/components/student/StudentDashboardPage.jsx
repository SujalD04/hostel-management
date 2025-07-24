import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import ComplaintCard from '../../components/student/ComplaintCard';
import { AlertTriangle, Loader } from 'lucide-react';

const StudentDashboardPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/complaints/my-complaints');
        // Sort complaints by most recent first
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
      return (
        <div className="flex flex-col items-center justify-center text-gray-400 mt-20">
            <Loader className="animate-spin h-12 w-12 mb-4" />
            <p>Loading your complaints...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-red-400 bg-red-500/10 p-8 rounded-lg mt-20">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
        </div>
      );
    }

    if (complaints.length === 0) {
      return (
        <div className="text-center text-gray-400 mt-20">
          <h2 className="text-2xl font-bold">No Complaints Found</h2>
          <p className="mt-2">You haven't filed any complaints yet. Use the "New Complaint" link to get started.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {complaints.map((complaint, index) => (
          <ComplaintCard key={complaint.id} complaint={complaint} index={index} />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">My Complaints</h1>
      {renderContent()}
    </div>
  );
};

export default StudentDashboardPage;