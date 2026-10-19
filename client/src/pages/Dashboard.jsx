import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import {
  PlusCircle,
  Search,
  Filter,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['researchJobs', page, statusFilter, searchTerm],
    queryFn: () =>
      api.listResearch({
        page,
        limit: 8,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      }),
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const starterTemplates = [
    {
      topic: 'Agentic AI Orchestration & Tool Calling Architectures',
      objective: 'Analyze state-of-the-art patterns in LangGraph, multi-agent communication, and reliable tool use.',
      depth: 'standard',
    },
    {
      topic: 'Post-Quantum Cryptography & NIST Standardization',
      objective: 'Evaluate ML-KEM, ML-DSA, and migration roadmaps for enterprise security architectures.',
      depth: 'standard',
    },
    {
      topic: 'Commercialization Progress of All-Solid-State Lithium Batteries',
      objective: 'Examine energy density benchmarks, manufacturing yields, and automotive adoption timelines.',
      depth: 'quick',
    },
  ];

  const handleLaunchTemplate = (tmpl) => {
    navigate('/research/new', { state: { template: tmpl } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-pastel-peach/60 via-pastel-pink/50 to-pastel-lavender/50 rounded-4xl p-6 sm:p-10 border border-pastel-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-pastel-border/80 text-xs font-semibold text-pastel-plum mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Autonomous Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-pastel-plum tracking-tight">
            Welcome, {user?.name || 'Researcher'}
          </h1>
          <p className="text-xs sm:text-sm text-pastel-muted mt-1 max-w-xl">
            Explore live web sources, execute multi-agent evidence synthesis, and generate verifiable research reports.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={PlusCircle}
          onClick={() => navigate('/research/new')}
          className="shrink-0 shadow-glow"
        >
          New Research
        </Button>
      </div>

      {/* Starter Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-pastel-plum">
            Quick Research Templates
          </h2>
          <span className="text-xs text-pastel-muted">Click to pre-fill</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {starterTemplates.map((t, idx) => (
            <div
              key={idx}
              onClick={() => handleLaunchTemplate(t)}
              className="glass-panel rounded-2xl p-4 cursor-pointer hover:bg-white/95 transition-all duration-200 border border-pastel-border group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-pastel-lavender px-2 py-0.5 rounded-full">
                  {t.depth}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-pastel-muted group-hover:text-pastel-plum group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-xs font-bold text-pastel-plum mb-1 line-clamp-1">{t.topic}</h3>
              <p className="text-[11px] text-pastel-muted line-clamp-2">{t.objective}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Research Jobs Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-pastel-plum">Your Research Jobs</h2>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search research topics..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum placeholder-pastel-muted/60 focus:outline-none focus:ring-2 focus:ring-pastel-rose/50 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-pastel-muted absolute left-3 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="py-1.5 px-3 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum focus:outline-none focus:ring-2 focus:ring-pastel-rose/50"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="researching">Researching</option>
              <option value="planning">Planning</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Jobs List / Table */}
        {isLoading ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-xs text-pastel-muted">
            <Compass className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            Loading research records...
          </div>
        ) : jobs.length === 0 ? (
          <Card className="text-center py-16">
            <FileText className="w-10 h-10 text-pastel-muted/50 mx-auto mb-3" />
            <h3 className="text-base font-bold text-pastel-plum mb-1">
              {searchTerm || statusFilter ? 'No matching research found' : 'No research jobs found'}
            </h3>
            <p className="text-xs text-pastel-muted max-w-sm mx-auto mb-6">
              {searchTerm || statusFilter
                ? 'Try modifying or clearing your search term or filter to see existing jobs.'
                : 'Launch your first autonomous research query to explore live web sources and generate cited reports.'}
            </p>
            {searchTerm || statusFilter ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button variant="primary" size="md" icon={PlusCircle} onClick={() => navigate('/research/new')}>
                Create First Research
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="glass-panel rounded-2xl p-5 hover:bg-white/95 transition-all duration-200 border border-pastel-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <Badge status={job.status} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-pastel-muted bg-white px-2 py-0.5 rounded-lg border border-pastel-border">
                      {job.configuration?.depth || 'Standard'}
                    </span>
                    <span className="text-[11px] text-pastel-muted">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-pastel-plum truncate" title={job.topic}>
                    {job.topic}
                  </h3>
                  <p className="text-xs text-pastel-muted truncate mt-0.5">
                    {job.currentStep || 'Workflow in progress'}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right text-xs">
                    <span className="text-pastel-muted block text-[10px] uppercase font-bold">Sources</span>
                    <span className="font-semibold text-pastel-plum">{job.sourceCount || 0}</span>
                  </div>

                  {job.coverageScore > 0 && (
                    <div className="text-right text-xs">
                      <span className="text-pastel-muted block text-[10px] uppercase font-bold">Coverage</span>
                      <span className="font-semibold text-emerald-700">{job.coverageScore}%</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/workspace/${job._id}`)}
                    >
                      Workspace
                    </Button>
                    {job.status === 'completed' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={FileText}
                        onClick={() => navigate(`/report/${job._id}`)}
                      >
                        View Report
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 text-xs text-pastel-muted">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
