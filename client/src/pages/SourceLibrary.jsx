import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { SourceCard } from '../components/sources/SourceCard.jsx';
import { SourceInspectModal } from '../components/sources/SourceInspectModal.jsx';
import { Layers, Search, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';

export const SourceLibrary = () => {
  const { id } = useParams();
  const [selectedSource, setSelectedSource] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sourcesLibrary', id],
    queryFn: () => api.getSources(id),
  });

  const sources = data?.sources || [];
  const filtered = sources.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return s.title?.toLowerCase().includes(term) || s.domain?.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/workspace/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Workspace
          </Link>
          <h1 className="text-2xl font-bold text-pastel-plum">Source Library & Provenance</h1>
          <p className="text-xs text-pastel-muted">
            Inspect all primary web sources indexed and embedded for this research operation.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Filter by domain or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum focus:outline-none focus:ring-2 focus:ring-pastel-rose/50"
          />
          <Search className="w-3.5 h-3.5 text-pastel-muted absolute left-3 top-2.5" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <Compass className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-xs text-pastel-muted">Loading captured sources...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-xs text-pastel-muted">
          No matching sources found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((src) => (
            <SourceCard
              key={src._id}
              source={src}
              onInspect={(s) => setSelectedSource(s)}
            />
          ))}
        </div>
      )}

      <SourceInspectModal
        source={selectedSource}
        isOpen={Boolean(selectedSource)}
        onClose={() => setSelectedSource(null)}
      />
    </div>
  );
};
