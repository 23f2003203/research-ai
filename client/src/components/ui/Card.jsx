import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`glass-panel rounded-3xl p-6 ${hover ? 'glass-panel-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
