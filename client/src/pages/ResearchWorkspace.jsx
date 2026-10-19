import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { useResearchEvents } from '../hooks/useResearchEvents.js';
import { WorkflowTimeline } from '../components/research/WorkflowTimeline.jsx';
import { LiveActivityFeed } from '../components/research/LiveActivityFeed.jsx';
import { CoverageGauge } from '../components/research/CoverageGauge.jsx';
import { SourceCard } from '../components/sources/SourceCard.jsx';
import { SourceInspectModal } from '../components/sources/SourceInspectModal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { FileText, StopCircle, RefreshCw, Compass, ArrowRight, Layers } from 'lucide-react';

export const ResearchWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState(null);

  // Fetch static job info and refetch on status changes
  const { data: jobData, refetch: refetchJob } = useQuery({
    queryKey: ['researchJob', id],
    queryFn: () => api.getResearch(id),
    refetchInterval: (query) => {
      const status = query.state.data?.job?.status;
      return status === 'completed' || status === 'failed' || status === 'cancelled' ? false : 3000;
    },
  });

  // Fetch sources captured so far
  const { data: sourcesData, refetch: refetchSources } = useQuery({
    queryKey: ['researchSources', id],
    queryFn: () => api.getSources(id),
    refetchInterval: (query) => {
      const status = jobData?.job?.status;
      return status === 'completed' || status === 'failed' || status === 'cancelled' ? false : 3000;
    },
  });

  // Stream live SSE events
  const {
    events,
    connected,
    currentStage,
    coverageScore,
    isCompleted,
    error: sseError,
  } = useResearchEvents(id, () => {
    refetchJob();
    refetchSources();
  });

  const job = jobData?.job;
  const sources = sourcesData?.sources || [];
  const activeStatus = isCompleted ? 'completed' : job?.status || 'queued';
  const effectiveStage = job?.status === 'completed' ? 'completed' : currentStage || job?.status || 'planning';
  const effectiveCoverage = coverageScore > 0 ? coverageScore : job?.coverageScore || 0;

  const handleCancel = async () => {
    try {
      await api.cancelResearch(id);
      refetchJob();
    } catch (err) {
      console.error('Failed to cancel research', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-pastel-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <Badge status={activeStatus} />
            <span className="text-xs text-pastel-muted">
              Round {job?.roundCount || 1} of {job?.configuration?.maxRounds || 2}
            </span>
            {connected && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live SSE Stream
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-pastel-plum leading-snug">
            {job?.topic || 'Autonomous Research Operation'}
          </h1>
          <p className="text-xs text-pastel-muted truncate">
            {job?.currentStep || 'Coordinating agent nodes...'}
          </p>
        </div>

        {/* Action Controls & Coverage Gauge */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          <CoverageGauge score={effectiveCoverage} />

          <div className="flex items-center gap-2">
            {activeStatus === 'completed' ? (
              <Button
                variant="primary"
                size="md"
                icon={FileText}
                onClick={() => navigate(`/report/${id}`)}
                className="shadow-glow"
              >
                View Final Report
              </Button>
            ) : activeStatus === 'failed' || activeStatus === 'cancelled' ? (
              <Button
                variant="primary"
                size="md"
                icon={RefreshCw}
                onClick={() => api.startResearch(id).then(refetchJob)}
              >
                Restart Research
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                icon={StopCircle}
                onClick={handleCancel}
                className="text-rose-700 hover:bg-rose-50 border-rose-200"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Agent Orchestration Pipeline Visualizer */}
      <WorkflowTimeline
        currentStage={effectiveStage}
        isCompleted={activeStatus === 'completed'}
      />

      {/* Main Workspace Grid: Left Live Activity Feed, Right Captured Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Activity Feed (5 cols) */}
        <div className="lg:col-span-5">
          <LiveActivityFeed
            events={events}
            isStreaming={activeStatus !== 'completed' && activeStatus !== 'failed' && activeStatus !== 'cancelled'}
          />
        </div>

        {/* Right: Captured Sources Stream (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 flex flex-col h-[460px]">
          <div className="flex items-center justify-between pb-3 border-b border-pastel-border/70 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-pastel-plum">
                Indexed Evidence Sources
              </h3>
            </div>
            <span className="text-xs text-pastel-muted font-medium">
              {sources.length} sources indexed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {sources.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-pastel-muted">
                <Compass className="w-8 h-8 mb-2 animate-pulse text-pastel-muted/60" />
                <p className="text-sm font-medium">Web search in progress...</p>
                <p className="text-xs mt-1">Discovered sources will appear here as pages are parsed.</p>
              </div>
            ) : (
              sources.map((src) => (
                <SourceCard
                  key={src._id}
                  source={src}
                  onInspect={(s) => setSelectedSource(s)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Source Provenance Inspection Modal */}
      <SourceInspectModal
        source={selectedSource}
        isOpen={Boolean(selectedSource)}
        onClose={() => setSelectedSource(null)}
      />
    </div>
  );
};
