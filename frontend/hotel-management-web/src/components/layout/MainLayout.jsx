import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

const MainLayout = () => {
  return (
    <div className="flex bg-gray-900 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Outlet /> 
        </motion.div>
      </main>
    </div>
  );
};

export default MainLayout;