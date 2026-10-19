import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Sparkles, Compass, Sliders, Globe, Shield, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';
import { RESEARCH_DEPTHS } from '../../../shared/constants/research.js';

export const NewResearch = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [topic, setTopic] = useState('');
  const [objective, setObjective] = useState('');
  const [instructions, setInstructions] = useState('');
  const [depth, setDepth] = useState('standard');
  const [maxSources, setMaxSources] = useState(10);
  const [preferredDomainsInput, setPreferredDomainsInput] = useState('');
  const [excludedDomainsInput, setExcludedDomainsInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if template was passed via router state
  useEffect(() => {
    if (location.state?.template) {
      const tmpl = location.state.template;
      setTopic(tmpl.topic || '');
      setObjective(tmpl.objective || '');
      if (tmpl.depth) setDepth(tmpl.depth);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a research topic');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const preferredDomains = preferredDomainsInput
        .split(',')
        .map((d) => d.trim().replace(/^https?:\/\//, '').replace(/^www\./, ''))
        .filter(Boolean);

      const excludedDomains = excludedDomainsInput
        .split(',')
        .map((d) => d.trim().replace(/^https?:\/\//, '').replace(/^www\./, ''))
        .filter(Boolean);

      const payload = {
        topic: topic.trim(),
        objective: objective.trim(),
        instructions: instructions.trim(),
        depth,
        maxSources: parseInt(maxSources, 10),
        preferredDomains,
        excludedDomains,
      };

      const res = await api.createResearch(payload);
      if (res.success && res.job) {
        navigate(`/workspace/${res.job._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to start research job');
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-pink/70 border border-pastel-border text-xs font-semibold text-pastel-plum mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>Autonomous Multi-Agent Initiation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-pastel-plum tracking-tight">
          Initiate New Research
        </h1>
        <p className="text-xs sm:text-sm text-pastel-muted mt-1">
          Specify your research topic. Our coordinated agents will formulate a research plan, explore the web, extract verified claims, and synthesize a cited report.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Topic Input */}
        <Card className="p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pastel-plum mb-2">
              Research Topic or Core Question <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Comparing Vector Search Performance Across HNSW, IVF, and SCaNN"
              className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-pastel-border text-sm text-pastel-plum placeholder-pastel-muted/60 focus:outline-none focus:ring-2 focus:ring-pastel-rose/50 focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-pastel-muted mb-2">
              Research Objective (Optional)
            </label>
            <textarea
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Specific questions to answer, empirical benchmarks to verify, or comparative angles to address..."
              className="w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-pastel-border text-xs text-pastel-plum placeholder-pastel-muted/60 focus:outline-none focus:ring-2 focus:ring-pastel-rose/50 focus:bg-white transition-all resize-none"
            />
          </div>
        </Card>

        {/* Research Depth Selection */}
        <Card className="p-6 sm:p-8 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-pastel-plum mb-1">
            Desired Research Depth
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Quick */}
            <div
              onClick={() => {
                setDepth('quick');
                setMaxSources(5);
              }}
              className={`rounded-2xl p-4 cursor-pointer border transition-all duration-200 ${
                depth === 'quick'
                  ? 'bg-gradient-to-br from-pastel-yellow/70 to-pastel-pink/60 border-purple-400/60 shadow-soft scale-[1.02]'
                  : 'bg-white/60 hover:bg-white/90 border-pastel-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-pastel-plum">Quick Overview</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-[11px] text-pastel-muted leading-relaxed">
                Fast synthesis with targeted sources. 1 round, up to 5 sources.
              </p>
            </div>

            {/* Standard */}
            <div
              onClick={() => {
                setDepth('standard');
                setMaxSources(10);
              }}
              className={`rounded-2xl p-4 cursor-pointer border transition-all duration-200 ${
                depth === 'standard'
                  ? 'bg-gradient-to-br from-pastel-yellow/70 to-pastel-pink/60 border-purple-400/60 shadow-soft scale-[1.02]'
                  : 'bg-white/60 hover:bg-white/90 border-pastel-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-pastel-plum">Standard</span>
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-[11px] text-pastel-muted leading-relaxed">
                Balanced depth with iterative evaluation. Up to 2 rounds, 10 sources.
              </p>
            </div>

            {/* Deep */}
            <div
              onClick={() => {
                setDepth('deep');
                setMaxSources(18);
              }}
              className={`rounded-2xl p-4 cursor-pointer border transition-all duration-200 ${
                depth === 'deep'
                  ? 'bg-gradient-to-br from-pastel-yellow/70 to-pastel-pink/60 border-purple-400/60 shadow-soft scale-[1.02]'
                  : 'bg-white/60 hover:bg-white/90 border-pastel-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-pastel-plum">Deep Research</span>
                <BookOpen className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-[11px] text-pastel-muted leading-relaxed">
                Exhaustive cross-examination with multiple rounds. Up to 3 rounds, 18 sources.
              </p>
            </div>
          </div>
        </Card>

        {/* Advanced Options Toggle */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 hover:text-purple-950 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Advanced Controls' : 'Show Advanced Controls (Domains, Limits)'}</span>
          </button>
        </div>

        {showAdvanced && (
          <Card className="p-6 sm:p-8 space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pastel-plum mb-1.5">
                Maximum Source Budget: {maxSources} Sources
              </label>
              <input
                type="range"
                min="3"
                max="20"
                value={maxSources}
                onChange={(e) => setMaxSources(e.target.value)}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <span className="text-[11px] text-pastel-muted block mt-1">
                Controls the maximum number of authoritative sources the Researcher can fetch and embed.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pastel-muted mb-1.5">
                  Prioritize Domains (Comma separated)
                </label>
                <input
                  type="text"
                  value={preferredDomainsInput}
                  onChange={(e) => setPreferredDomainsInput(e.target.value)}
                  placeholder="arxiv.org, nature.com, github.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum focus:outline-none focus:ring-2 focus:ring-pastel-rose/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pastel-muted mb-1.5">
                  Exclude Domains (Comma separated)
                </label>
                <input
                  type="text"
                  value={excludedDomainsInput}
                  onChange={(e) => setExcludedDomainsInput(e.target.value)}
                  placeholder="wikipedia.org, pinterest.com"
                  className="w-full px-3 py-2 rounded-xl bg-white/80 border border-pastel-border text-xs text-pastel-plum focus:outline-none focus:ring-2 focus:ring-pastel-rose/50"
                />
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="ghost" size="md" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={ArrowRight}
            isLoading={isLoading}
            className="shadow-glow"
          >
            Launch Autonomous Research
          </Button>
        </div>
      </form>
    </div>
  );
};
