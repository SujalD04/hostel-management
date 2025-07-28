import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="relative min-h-screen flex items-center justify-center bg-slate-900 p-4 overflow-hidden">
    {/* Decorative background shapes from MainLayout */}
    <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>

    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="relative w-full max-w-md p-8 space-y-8 bg-slate-800/60 border border-slate-700/80 backdrop-blur-lg rounded-2xl shadow-2xl"
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center mb-4">
           <ShieldCheck className="w-10 h-10 text-sky-400" />
           <h1 className="ml-3 text-4xl font-bold text-slate-100">HostelCare</h1>
        </div>
        <h2 className="text-2xl font-bold text-slate-200">{title}</h2>
        <p className="mt-2 text-slate-400">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  </div>
);

export default AuthLayout;