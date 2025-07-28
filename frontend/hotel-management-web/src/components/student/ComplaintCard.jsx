import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Zap, Trash2, Shield, MessageSquare, MapPin, Clock, CheckCircle } from 'lucide-react';

// Using the established, consistent color palette
const statusStyles = {
  SUBMITTED: {
    base: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: 'text-amber-400',
    text: 'text-amber-400',
  },
  IN_PROGRESS: {
    base: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    icon: 'text-sky-400',
    text: 'text-sky-400',
  },
  TICKET_GENERATED: {
    base: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    icon: 'text-violet-400',
    text: 'text-violet-400',
  },
  COMPLETED: {
    base: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: 'text-emerald-400',
    text: 'text-emerald-400',
  },
  REJECTED: {
    base: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    icon: 'text-rose-400',
    text: 'text-rose-400',
  },
};

// Helper to get an icon based on complaint type
const getIconForType = (type) => {
    switch(type) {
      case 'ELECTRICIAN': return <Zap className="h-6 w-6" />;
      case 'CLEANER': return <Trash2 className="h-6 w-6" />;
      case 'WARDEN': return <Shield className="h-6 w-6" />;
      default: return <MessageSquare className="h-6 w-6" />;
    }
};

// Visual component to show the complaint's progress
const StatusTimeline = ({ currentStatus, createdAt }) => {
    const statuses = ['SUBMITTED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = statuses.indexOf(currentStatus);

    // Replace IN_PROGRESS with TICKET_GENERATED if that's the current status
    if (currentStatus === 'TICKET_GENERATED') {
        statuses[1] = 'TICKET_GENERATED';
    }

    return (
        <div className="flex items-center pt-4 mt-4 border-t border-slate-700/50">
            {statuses.map((status, index) => {
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const isFirst = index === 0;

                return (
                    <React.Fragment key={status}>
                        <div className="flex flex-col items-center">
                           <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isActive ? statusStyles[status]?.base : 'bg-slate-700'}`}>
                                {isActive && <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white animate-pulse' : statusStyles[status]?.icon}`}></div>}
                           </div>
                           <p className={`mt-2 text-xs font-semibold ${isActive ? statusStyles[status]?.text : 'text-slate-500'}`}>
                               {status.replace('_', ' ')}
                           </p>
                           {isFirst && (
                                <p className="text-xs text-slate-500 mt-1">{format(new Date(createdAt), 'dd MMM')}</p>
                           )}
                        </div>
                        {index < statuses.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${isActive ? statusStyles[statuses[index+1]]?.base || statusStyles[status]?.base : 'bg-slate-700'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};


// Main ComplaintCard Component
const ComplaintCard = ({ complaint, index }) => {
  const { complaintType, status, description, location, createdAt } = complaint;
  const style = statusStyles[status] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, type: 'spring', stiffness: 100 }}
      className="bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-slate-600 hover:bg-slate-800/80"
    >
        <div className="p-5">
          {/* Card Header */}
          <div className="flex justify-between items-start">
            <div className={`flex items-center gap-3 font-bold ${style.text}`}>
              {getIconForType(complaintType)}
              <span className="text-lg">{complaintType.charAt(0) + complaintType.slice(1).toLowerCase()}</span>
            </div>
             <div className={`px-3 py-1 text-xs font-bold rounded-full border ${style.base}`}>
               {status.replace('_', ' ')}
             </div>
          </div>
          
          {/* Card Body */}
          <div className="mt-4">
            <p className="text-slate-200 text-base leading-relaxed">{description}</p>
            <div className="flex items-center gap-2 text-sm text-slate-400 mt-3">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Card Footer with Timeline */}
        <div className="px-5 pb-5">
            <StatusTimeline currentStatus={status} createdAt={createdAt} />
        </div>
    </motion.div>
  );
};

export default ComplaintCard;