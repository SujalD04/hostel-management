import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../../api/apiClient';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const NewComplaintPage = () => {
  const [complaintType, setComplaintType] = useState('CLEANER');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = { complaintType, location, description };
      await apiClient.post('/complaints', payload);
      setSuccess(true);
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-white mb-8">File a New Complaint</h1>
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={handleSubmit}
        className="max-w-2xl bg-gray-800 p-8 rounded-lg space-y-6"
      >
        {/* Complaint Type */}
        <div>
          <label htmlFor="complaintType" className="block text-sm font-medium text-gray-300 mb-2">
            Complaint Type
          </label>
          <select
            id="complaintType"
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            className="w-full py-3 px-4 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="CLEANER">Cleaning Issue</option>
            <option value="ELECTRICIAN">Electrical Issue</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
            Location (e.g., Room 404, Block B)
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full py-3 px-4 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description of the Issue
          </label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full py-3 px-4 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : success ? 'Submitted!' : 'Submit Complaint'}
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-900/50 p-3 rounded-lg">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center space-x-2 text-green-400 bg-green-900/50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Complaint submitted successfully! Redirecting...</span>
          </div>
        )}
      </motion.form>
    </div>
  );
};

export default NewComplaintPage;