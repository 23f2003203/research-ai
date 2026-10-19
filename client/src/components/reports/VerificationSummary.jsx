import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const VerificationSummary = ({ summary }) => {
  if (!summary) return null;

  const {
    totalCitations = 0,
    verifiedCitations = 0,
    unverifiedCitations = 0,
    accuracyRate = 100,
    auditNotes = '',
  } = summary;

  return (
    <div className="bg-gradient-to-r from-pastel-lime/50 via-pastel-yellow/40 to-pastel-pink/50 rounded-2xl p-5 border border-pastel-border/80 mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/80 shadow-xs text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-pastel-plum">Citation & Evidence Verification Audit</h4>
            <p className="text-xs text-pastel-muted">
              {auditNotes || 'All references verified against primary database source captures.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-xl font-bold text-emerald-800">{accuracyRate}%</span>
            <span className="block text-[10px] uppercase font-bold text-pastel-muted">Accuracy Rate</span>
          </div>
          <div className="h-8 w-px bg-pastel-border" />
          <div className="text-left">
            <span className="text-sm font-bold text-pastel-plum">{verifiedCitations}/{totalCitations}</span>
            <span className="block text-[10px] uppercase font-bold text-pastel-muted">Verified Claims</span>
          </div>
        </div>
      </div>
    </div>
  );
};
