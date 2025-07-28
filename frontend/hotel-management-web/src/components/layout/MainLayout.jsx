import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const MainLayout = () => {
  const location = useLocation();

  return (
    // Updated background with a subtle gradient and a decorative element
    <div className="relative flex bg-slate-900 min-h-screen text-slate-300 overflow-hidden">
        {/* Decorative background shape */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

        <Sidebar />
        
        {/* Main content area with responsive padding and vertical scroll */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* AnimatePresence enables animations on route changes */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname} // Unique key for each route
                    variants={pageVariants}
                    initial="initial"
                    animate="in"
                    exit="out"
                    transition={pageTransition}
                >
                    <Outlet /> 
                </motion.div>
            </AnimatePresence>
        </main>
    </div>
  );
};

export default MainLayout;