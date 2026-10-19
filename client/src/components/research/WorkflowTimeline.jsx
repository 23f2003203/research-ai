import React from 'react';
import { CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';

const STAGES = [
  { id: 'planning', label: 'Planner', description: 'Decompose questions' },
  { id: 'researching', label: 'Researcher', description: 'Web search & extraction' },
  { id: 'analyzing', label: 'Analyst', description: 'Extract factual claims' },
  { id: 'evaluating', label: 'Critic', description: 'Coverage evaluation' },
  { id: 'synthesizing', label: 'Writer', description: 'Synthesis & citations' },
  { id: 'verifying', label: 'Verifier', description: 'Audit citations' },
];

export const WorkflowTimeline = ({ currentStage = 'planning', isCompleted = false }) => {
  const getStageStatus = (stageId, index) => {
    if (isCompleted) return 'completed';

    const stageOrder = ['planning', 'researching', 'analyzing', 'evaluating', 'synthesizing', 'verifying', 'completed'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const thisIndex = stageOrder.indexOf(stageId);

    if (thisIndex < currentIndex) return 'completed';
    if (thisIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full bg-white/70 rounded-3xl p-6 border border-pastel-border/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-pastel-plum">
          Multi-Agent Orchestration Pipeline
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-pastel-pink/70 text-pastel-plum font-medium">
          LangGraph Stateful Workflow
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.id, idx);

          return (
            <div
              key={stage.id}
              className={`rounded-2xl p-3 border transition-all duration-300 ${
                status === 'active'
                  ? 'bg-gradient-to-br from-pastel-yellow/70 via-pastel-pink/60 to-pastel-lavender/50 border-pastel-border shadow-soft scale-[1.02]'
                  : status === 'completed'
                  ? 'bg-pastel-lime/40 border-pastel-sage/50 text-pastel-plum'
                  : 'bg-white/40 border-pastel-border/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pastel-muted">
                  Agent 0{idx + 1}
                </span>
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : status === 'active' ? (
                  <Loader2 className="w-4 h-4 text-purple-700 animate-spin" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-pastel-muted/60" />
                )}
              </div>
              <p className="text-sm font-bold text-pastel-plum truncate">{stage.label}</p>
              <p className="text-[11px] text-pastel-muted truncate">{stage.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
