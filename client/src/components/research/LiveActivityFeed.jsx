import React, { useRef, useEffect } from 'react';
import {
  Search,
  FileCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Compass,
  Repeat,
  Layers,
} from 'lucide-react';

const getEventIcon = (eventType) => {
  switch (eventType) {
    case 'research_started':
    case 'plan_created':
      return <Compass className="w-4 h-4 text-purple-600" />;
    case 'search_started':
    case 'sources_discovered':
      return <Search className="w-4 h-4 text-blue-600" />;
    case 'source_extracted':
      return <Layers className="w-4 h-4 text-teal-600" />;
    case 'evidence_extracted':
      return <FileCheck className="w-4 h-4 text-indigo-600" />;
    case 'coverage_evaluated':
    case 'additional_research_started':
      return <Repeat className="w-4 h-4 text-amber-600" />;
    case 'report_generated':
      return <Sparkles className="w-4 h-4 text-pink-600" />;
    case 'citations_verified':
      return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    case 'research_completed':
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case 'research_failed':
      return <AlertCircle className="w-4 h-4 text-rose-600" />;
    default:
      return <Sparkles className="w-4 h-4 text-pastel-plum" />;
  }
};

export const LiveActivityFeed = ({ events = [], isStreaming = true }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col h-[460px]">
      <div className="flex items-center justify-between pb-3 border-b border-pastel-border/70 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-pastel-plum">
            Live Agent Event Log
          </h3>
          {isStreaming && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>
        <span className="text-xs text-pastel-muted font-medium">
          {events.length} workflow events
        </span>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth"
      >
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-pastel-muted">
            <Compass className="w-8 h-8 mb-2 animate-pulse text-pastel-muted/60" />
            <p className="text-sm font-medium">Agents are initializing workflow...</p>
            <p className="text-xs mt-1">Events will appear live as each agent acts.</p>
          </div>
        ) : (
          events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="flex items-start gap-3 p-3 rounded-2xl bg-white/60 hover:bg-white/90 border border-pastel-border/60 transition-colors"
            >
              <div className="p-2 rounded-xl bg-pastel-pink/50 shrink-0">
                {getEventIcon(evt.eventType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-muted">
                    {evt.stage || 'workflow'}
                  </span>
                  <span className="text-[10px] text-pastel-muted">
                    {evt.createdAt ? new Date(evt.createdAt).toLocaleTimeString() : ''}
                  </span>
                </div>
                <p className="text-xs font-medium text-pastel-plum mt-0.5 leading-snug">
                  {evt.message}
                </p>
                {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {Object.entries(evt.metadata)
                      .slice(0, 3)
                      .map(([key, value]) => {
                        if (typeof value === 'object' && value !== null) return null;
                        return (
                          <span
                            key={key}
                            className="inline-block text-[10px] bg-pastel-yellow/60 text-pastel-plum px-1.5 py-0.5 rounded-md"
                          >
                            {key}: {String(value)}
                          </span>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
