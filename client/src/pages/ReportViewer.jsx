import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api.js';
import { VerificationSummary } from '../components/reports/VerificationSummary.jsx';
import { TableOfContents } from '../components/reports/TableOfContents.jsx';
import { ExportDropdown } from '../components/reports/ExportDropdown.jsx';
import { CitationBadge } from '../components/reports/CitationBadge.jsx';
import { SourceInspectModal } from '../components/sources/SourceInspectModal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Compass,
  Repeat,
  ShieldCheck,
  Bookmark,
} from 'lucide-react';

export const ReportViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState(null);
  const [followUpText, setFollowUpText] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['researchReport', id],
    queryFn: () => api.getReport(id),
  });

  const { data: sourcesData } = useQuery({
    queryKey: ['researchSources', id],
    queryFn: () => api.getSources(id),
  });

  const report = reportData?.report;
  const sources = sourcesData?.sources || [];

  const handleCitationClick = (citationIndex) => {
    // Scroll to the reference item in the bibliography
    const refElement = document.getElementById(`ref-${citationIndex}`);
    if (refElement) {
      refElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      refElement.classList.add('bg-pastel-yellow/70');
      setTimeout(() => refElement.classList.remove('bg-pastel-yellow/70'), 2000);
    }
  };

  const handleInspectByUrl = (url) => {
    const matched = sources.find((s) => s.url === url || s.canonicalUrl === url);
    if (matched) {
      setSelectedSource(matched);
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (!followUpText.trim()) return;

    setIsRefining(true);
    try {
      const res = await api.refineResearch(id, { followUpQuery: followUpText.trim() });
      if (res.success && res.job) {
        navigate(`/workspace/${res.job._id}`);
      }
    } catch (err) {
      console.error('Follow up inquiry failed', err);
      setIsRefining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <Compass className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
        <h3 className="text-base font-bold text-pastel-plum">Loading research report...</h3>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h3 className="text-lg font-bold text-pastel-plum">Report not ready or unavailable</h3>
        <p className="text-xs text-pastel-muted">
          This research job might still be in progress or encountered an error.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate(`/workspace/${id}`)}>
          Go to Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Report Header Bar */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-pastel-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-purple-800 bg-pastel-lavender px-3 py-1 rounded-full">
              Autonomous Synthesis
            </span>
            <span className="text-xs text-pastel-muted">
              Published {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-pastel-plum tracking-tight">
            {report.title}
          </h1>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(`/workspace/${id}`)}>
            Workspace
          </Button>
          <ExportDropdown researchId={id} reportTitle={report.title} />
        </div>
      </div>

      {/* Main Layout: Left sticky TOC, Right Report Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Table of Contents Sticky Sidebar (3 cols) */}
        <div className="hidden lg:block lg:col-span-3">
          <TableOfContents
            sections={report.sections || []}
            hasComparisons={Boolean(report.comparisons?.length)}
            hasContradictions={Boolean(report.conflictingEvidence)}
            hasLimitations={Boolean(report.risksAndLimitations)}
            hasRecommendations={Boolean(report.recommendations?.length)}
          />
        </div>

        {/* Report Content Body (9 cols) */}
        <div className="lg:col-span-9 space-y-8">
          {/* Verification Audit Summary Banner */}
          <VerificationSummary summary={report.verificationSummary} />

          {/* Report Paper Container */}
          <div className="glass-panel rounded-4xl p-6 sm:p-12 border border-pastel-border shadow-soft space-y-10 bg-white/90">
            {/* Executive Summary */}
            <section id="executive-summary" className="space-y-3">
              <h2 className="text-lg font-bold text-pastel-plum uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-600" />
                Executive Summary
              </h2>
              <div className="text-xs sm:text-sm text-pastel-plum/90 leading-relaxed space-y-2 font-sans whitespace-pre-wrap">
                {report.executiveSummary}
              </div>
            </section>

            {/* Methodology */}
            {report.methodology && (
              <section id="methodology" className="space-y-3 pt-6 border-t border-pastel-border/60">
                <h3 className="text-sm font-bold uppercase tracking-wider text-pastel-muted">
                  Methodology & Autonomous Search Strategy
                </h3>
                <p className="text-xs text-pastel-muted leading-relaxed">
                  {report.methodology}
                </p>
              </section>
            )}

            {/* Detailed Findings & Sections */}
            {(report.sections || []).map((sec, idx) => (
              <section key={sec.id || idx} id={sec.id || `section-${idx}`} className="space-y-3 pt-6 border-t border-pastel-border/60">
                <h3 className="text-base sm:text-lg font-bold text-pastel-plum">
                  {sec.title}
                </h3>
                <div className="text-xs sm:text-sm text-pastel-plum/90 leading-relaxed whitespace-pre-wrap">
                  {sec.content}
                </div>
                {sec.citations && sec.citations.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-2 text-xs text-pastel-muted">
                    <span className="text-[11px] font-semibold">Citations:</span>
                    {sec.citations.map((cIdx) => (
                      <CitationBadge
                        key={cIdx}
                        index={cIdx}
                        onClick={handleCitationClick}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Comparative Analysis Matrix */}
            {report.comparisons && report.comparisons.length > 0 && (
              <section id="comparisons" className="space-y-4 pt-6 border-t border-pastel-border/60">
                <h3 className="text-base font-bold text-pastel-plum">
                  Comparative Analysis Matrix
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-pastel-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-pastel-pink/40 border-b border-pastel-border font-bold text-pastel-plum">
                      <tr>
                        <th className="p-3">Evaluation Dimension</th>
                        <th className="p-3">{report.comparisons[0]?.entityA || 'Option A'}</th>
                        <th className="p-3">{report.comparisons[0]?.entityB || 'Option B'}</th>
                        <th className="p-3">Comparative Finding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pastel-border/50 text-pastel-plum/90">
                      {report.comparisons.map((c, i) => (
                        <tr key={i} className="hover:bg-white/60">
                          <td className="p-3 font-semibold">{c.dimension}</td>
                          <td className="p-3">{c.entityA}</td>
                          <td className="p-3">{c.entityB}</td>
                          <td className="p-3 leading-relaxed">{c.finding}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Conflicting Evidence */}
            {report.conflictingEvidence && (
              <section id="conflicting-evidence" className="space-y-3 pt-6 border-t border-pastel-border/60">
                <h3 className="text-base font-bold text-pastel-plum flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Conflicting Evidence & Debates
                </h3>
                <p className="text-xs sm:text-sm text-pastel-plum/90 leading-relaxed bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50">
                  {report.conflictingEvidence}
                </p>
              </section>
            )}

            {/* Risks & Limitations */}
            {report.risksAndLimitations && (
              <section id="risks-limitations" className="space-y-3 pt-6 border-t border-pastel-border/60">
                <h3 className="text-base font-bold text-pastel-plum">
                  Risks & Limitations
                </h3>
                <p className="text-xs sm:text-sm text-pastel-muted leading-relaxed">
                  {report.risksAndLimitations}
                </p>
              </section>
            )}

            {/* Conclusions */}
            <section id="conclusions" className="space-y-3 pt-6 border-t border-pastel-border/60">
              <h3 className="text-base sm:text-lg font-bold text-pastel-plum">
                Conclusions
              </h3>
              <p className="text-xs sm:text-sm text-pastel-plum/90 leading-relaxed">
                {report.conclusions}
              </p>
            </section>

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
              <section id="recommendations" className="space-y-3 pt-6 border-t border-pastel-border/60">
                <h3 className="text-base font-bold text-pastel-plum">
                  Strategic Recommendations
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-pastel-plum/90">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* References Bibliography */}
            <section id="references" className="space-y-4 pt-8 border-t border-pastel-border/80">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-pastel-plum">
                  Verified References & Source Bibliography
                </h3>
                <span className="text-xs text-pastel-muted">
                  {(report.references || []).length} authoritative references
                </span>
              </div>

              <div className="space-y-2.5">
                {(report.references || []).map((ref) => (
                  <div
                    key={ref.index}
                    id={`ref-${ref.index}`}
                    className="p-3.5 rounded-2xl bg-white/70 hover:bg-white border border-pastel-border/70 flex items-start justify-between gap-3 transition-colors duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-pastel-pink text-purple-900 font-bold text-xs shrink-0 mt-0.5">
                        {ref.index}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-pastel-plum leading-snug">
                          {ref.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-pastel-muted">
                          <span className="font-medium text-purple-700">{ref.domain}</span>
                          {ref.publishedDate && <span>• Published {ref.publishedDate}</span>}
                          {ref.verified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Grounded in database
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <AlertTriangle className="w-3 h-3" /> Unverified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleInspectByUrl(ref.url)}
                      >
                        Inspect
                      </Button>
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl hover:bg-pastel-pink/50 text-pastel-muted hover:text-pastel-plum transition-colors"
                        title="Open external source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Follow-Up Research Inquiry Card */}
          <Card className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-pastel-plum">
                Ask a Follow-Up Inquiry on this Report
              </h3>
            </div>
            <p className="text-xs text-pastel-muted">
              Want to drill deeper into a particular section, compare another alternative, or investigate new questions?
              Launch a targeted follow-up research workflow.
            </p>

            <form onSubmit={handleFollowUpSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                placeholder="e.g., Conduct deeper analysis into manufacturing yield rates and solid-state costs"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-pastel-border text-xs text-pastel-plum focus:outline-none focus:ring-2 focus:ring-pastel-rose/50"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isRefining}
                icon={ArrowRight}
              >
                Research Follow-Up
              </Button>
            </form>
          </Card>
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
