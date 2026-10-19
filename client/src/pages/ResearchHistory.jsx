import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { History, Search, Trash2, ExternalLink, FileText, Compass, AlertCircle } from 'lucide-react';

export const ResearchHistory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['researchHistory', page, statusFilter, searchTerm],
    queryFn: () =>
      api.listResearch({
        page,
        limit: 10,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      }),
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination;

  const handleDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteResearch(jobToDelete._id);
      setJobToDelete(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['researchHistory'] }),
        queryClient.invalidateQueries({ queryKey: ['researchJobs'] }),
      ]);
    } catch (err) {
      console.error('Failed to delete research job', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-pastel-plum">Research History</h1>
          <p className="text-xs text-pastel-muted">
            All autonomous research operations and compiled evidence reports.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum focus:outline-none focus:ring-2 focus:ring-pastel-rose/50"
            />
            <Search className="w-3.5 h-3.5 text-pastel-muted absolute left-3 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="py-2 px-3 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum focus:outline-none focus:ring-2 focus:ring-pastel-rose/50"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="researching">Researching</option>
            <option value="planning">Planning</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <Compass className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
          <p className="text-xs text-pastel-muted">Loading research history...</p>
        </div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-16">
          <History className="w-10 h-10 text-pastel-muted/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-pastel-plum mb-1">
            {searchTerm || statusFilter ? 'No matching research records found' : 'No research history found'}
          </h3>
          <p className="text-xs text-pastel-muted max-w-sm mx-auto mb-4">
            {searchTerm || statusFilter
              ? 'Try modifying your search query or status filter to see other research records.'
              : 'Launch a research query from the dashboard to begin building your knowledge history.'}
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
            <Button variant="primary" size="sm" onClick={() => navigate('/research/new')}>
              Start New Research
            </Button>
          )}
        </Card>
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden border border-pastel-border shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-pastel-pink/40 border-b border-pastel-border font-bold text-pastel-plum uppercase tracking-wider">
                <tr>
                  <th className="p-4">Topic</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Depth</th>
                  <th className="p-4">Sources</th>
                  <th className="p-4">Coverage</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pastel-border/60 text-pastel-plum">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-white/60 transition-colors">
                    <td className="p-4 font-semibold max-w-xs truncate" title={job.topic}>
                      <button
                        onClick={() => navigate(job.status === 'completed' ? `/report/${job._id}` : `/workspace/${job._id}`)}
                        className="text-left font-semibold text-pastel-plum hover:text-purple-700 hover:underline transition-colors truncate max-w-xs block"
                      >
                        {job.topic}
                      </button>
                    </td>
                    <td className="p-4">
                      <Badge status={job.status} />
                    </td>
                    <td className="p-4 uppercase text-[10px] font-bold text-purple-800">
                      {job.configuration?.depth || 'standard'}
                    </td>
                    <td className="p-4 font-medium">{job.sourceCount || 0}</td>
                    <td className="p-4 font-semibold text-emerald-700">
                      {job.coverageScore !== undefined && job.coverageScore !== null ? `${job.coverageScore}%` : '-'}
                    </td>
                    <td className="p-4 text-pastel-muted">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
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
                            Report
                          </Button>
                        )}
                        <button
                          onClick={() => setJobToDelete(job)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete research record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-pastel-border/60 flex items-center justify-between text-xs text-pastel-muted">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(jobToDelete)}
        onClose={() => setJobToDelete(null)}
        title="Delete Research Job"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-pastel-muted leading-relaxed">
            Are you sure you want to permanently delete this research job and all associated sources, claims, and reports?
            This action cannot be undone.
          </p>
          <div className="p-3 rounded-xl bg-pastel-pink/50 border border-pastel-border text-xs font-bold text-pastel-plum">
            "{jobToDelete?.topic}"
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setJobToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDelete}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
