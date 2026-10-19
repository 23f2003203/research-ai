import React from 'react';
import { ListOrdered } from 'lucide-react';

export const TableOfContents = ({ sections = [], hasComparisons, hasContradictions, hasLimitations, hasRecommendations }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="glass-panel rounded-3xl p-5 sticky top-24 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-pastel-border/60 text-xs font-bold uppercase tracking-wider text-pastel-plum">
        <ListOrdered className="w-4 h-4 text-purple-600" />
        <span>Table of Contents</span>
      </div>

      <ul className="space-y-1.5 text-xs">
        <li>
          <button
            onClick={() => scrollTo('executive-summary')}
            className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors"
          >
            Executive Summary
          </button>
        </li>
        <li>
          <button
            onClick={() => scrollTo('methodology')}
            className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors"
          >
            Methodology
          </button>
        </li>

        {sections.map((sec, idx) => (
          <li key={sec.id || idx}>
            <button
              onClick={() => scrollTo(sec.id || `section-${idx}`)}
              className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors truncate"
            >
              {sec.title}
            </button>
          </li>
        ))}

        {hasComparisons && (
          <li>
            <button
              onClick={() => scrollTo('comparisons')}
              className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors"
            >
              Comparative Analysis
            </button>
          </li>
        )}

        {hasContradictions && (
          <li>
            <button
              onClick={() => scrollTo('conflicting-evidence')}
              className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors"
            >
              Conflicting Evidence
            </button>
          </li>
        )}

        {hasLimitations && (
          <li>
            <button
              onClick={() => scrollTo('risks-limitations')}
              className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors"
            >
              Risks & Limitations
            </button>
          </li>
        )}

        <li>
          <button
            onClick={() => scrollTo('conclusions')}
            className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors"
          >
            Conclusions
          </button>
        </li>

        {hasRecommendations && (
          <li>
            <button
              onClick={() => scrollTo('recommendations')}
              className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors"
            >
              Recommendations
            </button>
          </li>
        )}

        <li>
          <button
            onClick={() => scrollTo('references')}
            className="w-full text-left py-1 px-2 rounded-lg text-pastel-muted hover:text-pastel-plum hover:bg-pastel-pink/40 transition-colors font-semibold"
          >
            Verified References
          </button>
        </li>
      </ul>
    </nav>
  );
};
