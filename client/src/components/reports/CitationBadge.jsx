import React from 'react';

export const CitationBadge = ({ index, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick && onClick(index)}
      className="inline-flex items-center justify-center px-1.5 py-0.2 mx-0.5 text-[11px] font-bold text-purple-800 bg-pastel-pink/70 hover:bg-pastel-pink rounded-md border border-pastel-border/80 transition-all duration-150 cursor-pointer shadow-xs align-super"
      title={`View verified citation [${index}]`}
    >
      [{index}]
    </button>
  );
};
