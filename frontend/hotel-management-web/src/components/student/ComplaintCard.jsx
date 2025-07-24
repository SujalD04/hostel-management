import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns'; // Run: npm install date-fns

const statusStyles = {
  SUBMITTED: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  TICKET_GENERATED: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  COMPLETED: 'bg-green-500/20 text-green-300 border-green-400/30',
  REJECTED: 'bg-red-500/20 text-red-300 border-red-400/30',
};

const ComplaintCard = ({ complaint, index }) => {
  const { complaintType, status, description, location, createdAt } = complaint;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-gray-800 p-5 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-blue-400">{complaintType}</p>
          <h3 className="text-lg font-bold text-white mt-1">{description}</h3>
          <p className="text-sm text-gray-400 mt-2">Location: {location}</p>
        </div>
        <div className={`px-3 py-1 text-xs font-bold rounded-full border ${statusStyles[status] || 'bg-gray-500/20 text-gray-300'}`}>
          {status.replace('_', ' ')}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
        {createdAt
            ? `Filed on: ${format(new Date(createdAt), 'PPP p')}`
            : 'Date not available'}
        </p>

      </div>
    </motion.div>
  );
};

export default ComplaintCard;