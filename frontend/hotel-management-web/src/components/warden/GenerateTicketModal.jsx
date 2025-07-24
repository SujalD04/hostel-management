import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../api/apiClient';

const GenerateTicketModal = ({ complaint, onClose, onTicketGenerated }) => {
  const [electricians, setElectricians] = useState([]);
  const [selectedElectrician, setSelectedElectrician] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all users with the 'ELECTRICIAN' role for the dropdown
    const fetchElectricians = async () => {
      try {
        // NOTE: This assumes a backend endpoint exists to get users by role.
        const response = await apiClient.get('/admin/users?role=ELECTRICIAN');
        setElectricians(response.data);
        if (response.data.length > 0) {
          setSelectedElectrician(response.data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch electricians", err);
        setError("Could not load list of electricians.");
      }
    };
    fetchElectricians();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
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
      setError('Failed to generate ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
        >
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Generate Ticket</h2>
            <p className="text-sm text-gray-400 mt-1">For complaint: "{complaint.description}"</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="electrician" className="block text-sm font-medium text-gray-300 mb-2">
                Assign to Electrician
              </label>
              <select
                id="electrician"
                value={selectedElectrician}
                onChange={(e) => setSelectedElectrician(e.target.value)}
                className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {electricians.map(e => (
                  <option key={e.id} value={e.id}>{e.fullName}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-500">
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GenerateTicketModal;