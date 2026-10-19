import React from 'react';
import { Sparkles, Shield, Lock, FileText, Github } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="glass-panel border-t border-pastel-border/80 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pastel-peach via-pastel-rose to-pastel-lavender p-0.5">
                <div className="w-full h-full bg-white/90 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-pastel-plum" />
                </div>
              </div>
              <span className="text-lg font-bold text-pastel-plum">Research AI</span>
            </div>
            <p className="text-xs text-pastel-muted leading-relaxed">
              Autonomous AI Research Assistant that explores the live web, verifies claims against primary evidence, and compiles verifiable reports.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-pastel-plum mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-pastel-muted">
              <li><a href="/#features" className="hover:text-pastel-plum transition-colors">Core Features</a></li>
              <li><a href="/#how-it-works" className="hover:text-pastel-plum transition-colors">How It Works</a></li>
              <li><a href="/#example" className="hover:text-pastel-plum transition-colors">Report Showcase</a></li>
              <li><Link to="/research/new" className="hover:text-pastel-plum transition-colors">Start Research</Link></li>
            </ul>
          </div>

          {/* Architecture Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-pastel-plum mb-3">Architecture</h4>
            <ul className="space-y-2 text-xs text-pastel-muted">
              <li><span className="hover:text-pastel-plum cursor-default">LangGraph Multi-Agent Workflow</span></li>
              <li><span className="hover:text-pastel-plum cursor-default">Google Gemini Flash & Pro</span></li>
              <li><span className="hover:text-pastel-plum cursor-default">Tavily Web Search Integration</span></li>
              <li><span className="hover:text-pastel-plum cursor-default">Vector Semantic RAG Pipeline</span></li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-pastel-plum mb-3">Trust & Integrity</h4>
            <p className="text-xs text-pastel-muted leading-relaxed mb-3">
              Deterministic citation verification ensures every claim maps to actual retrieved source content. No hallucinated citations or URLs.
            </p>
            <div className="flex items-center gap-2 text-xs text-pastel-muted">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Full User Data Isolation</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-pastel-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-pastel-muted">
          <p>© {new Date().getFullYear()} Research AI. Built with autonomous agent orchestration and pastel aesthetics.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-pastel-plum cursor-default">Privacy</span>
            <span>•</span>
            <span className="hover:text-pastel-plum cursor-default">Terms</span>
            <span>•</span>
            <span className="hover:text-pastel-plum cursor-default">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
