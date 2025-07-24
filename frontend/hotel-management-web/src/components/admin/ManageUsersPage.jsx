import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/apiClient';
import { format } from 'date-fns';
import { Loader, PlusCircle } from 'lucide-react';
import CreateUserModal from '../../components/admin/CreateUserModal';

const roleColors = {
  ADMIN: 'bg-red-500/20 text-red-300',
  WARDEN: 'bg-purple-500/20 text-purple-300',
  STUDENT: 'bg-green-500/20 text-green-300',
  ELECTRICIAN: 'bg-yellow-500/20 text-yellow-300',
  CLEANER: 'bg-blue-500/20 text-blue-300',
};

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // NOTE: This assumes a backend endpoint exists to get all users.
      const response = await apiClient.get('/admin/users/all');
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) return <div className="flex justify-center mt-10"><Loader className="animate-spin h-10 w-10 text-white" /></div>;

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Manage Users</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
          <PlusCircle className="h-5 w-5 mr-2" />
          Create User
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
        <table className="min-w-full text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left py-3 px-4">Full Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-700/50">
                <td className="py-3 px-4">{user.fullName}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-400">{format(new Date(user.createdAt), 'dd MMM yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <CreateUserModal onClose={() => setIsModalOpen(false)} onUserCreated={fetchUsers} />}
    </>
  );
};

export default ManageUsersPage;