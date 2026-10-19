import React from 'react';

const statusConfig = {
  queued: { bg: 'bg-amber-50 text-amber-800 border-amber-200/60', label: 'Queued' },
  planning: { bg: 'bg-purple-50 text-purple-800 border-purple-200/60', label: 'Planning' },
  researching: { bg: 'bg-blue-50 text-blue-800 border-blue-200/60', label: 'Researching' },
  analyzing: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/60', label: 'Analyzing' },
  evaluating: { bg: 'bg-cyan-50 text-cyan-800 border-cyan-200/60', label: 'Evaluating' },
  synthesizing: { bg: 'bg-pink-50 text-pink-800 border-pink-200/60', label: 'Synthesizing' },
  verifying: { bg: 'bg-teal-50 text-teal-800 border-teal-200/60', label: 'Verifying' },
  completed: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/60', label: 'Completed' },
  failed: { bg: 'bg-rose-50 text-rose-800 border-rose-200/60', label: 'Failed' },
  cancelled: { bg: 'bg-gray-50 text-gray-700 border-gray-200/60', label: 'Cancelled' },
};

export const Badge = ({ status, label, variant, className = '' }) => {
  const config = status ? statusConfig[status] : null;
  const displayText = label || config?.label || status || 'Status';
  const colorClasses = config?.bg || 'bg-pastel-pink/60 text-pastel-plum border-pastel-border';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
    >
      {displayText}
    </span>
  );
};
