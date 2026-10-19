import React from 'react';

export const CoverageGauge = ({ score = 0 }) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  let color = '#F59E0B'; // Amber
  let statusText = 'Investigating';

  if (normalizedScore >= 80) {
    color = '#10B981'; // Emerald
    statusText = 'Comprehensive';
  } else if (normalizedScore >= 60) {
    color = '#6366F1'; // Indigo
    statusText = 'Substantial';
  } else if (normalizedScore > 0) {
    color = '#F59E0B';
    statusText = 'Partial Coverage';
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex items-center gap-4 bg-white/70 rounded-2xl p-3 border border-pastel-border/80">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#F0DFE3"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-pastel-plum">{normalizedScore}%</span>
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase font-bold tracking-wider text-pastel-muted">Evidence Coverage</h4>
        <p className="text-sm font-semibold text-pastel-plum">{statusText}</p>
        <span className="text-[11px] text-pastel-muted">
          {normalizedScore >= 80 ? 'Criteria satisfied' : 'Evidence collection in progress'}
        </span>
      </div>
    </div>
  );
};
