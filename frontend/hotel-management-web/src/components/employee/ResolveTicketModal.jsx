import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ResolveTicketModal = ({ ticket, onClose, onTicketResolved }) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  const updatedTicket = await onTicketResolved(ticket.id, resolutionNotes);
  setIsLoading(false);

  // ✅ Optimistically update local state instead of waiting for full fetch
  if (updatedTicket) {
    // Let parent update its tasks state
  }

  onClose();
};
  

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg"
        >
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Resolve Ticket #{ticket.ticketNumber}</h2>
            <p className="text-sm text-gray-400 mt-1">Complaint: "{ticket.complaintDescription}"</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Resolution Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows="4"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g., Replaced the faulty capacitor."
                className="w-full py-2 px-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-500">
                {isLoading ? 'Resolving...' : 'Mark as Resolved'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ResolveTicketModal;