import React from 'react';
import { ExternalLink, Globe, Calendar, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export const SourceCard = ({ source, onInspect }) => {
  return (
    <div className="glass-panel rounded-2xl p-5 hover:bg-white/95 transition-all duration-200 border border-pastel-border flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-pastel-plum bg-white px-2.5 py-1 rounded-xl border border-pastel-border">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            {source.domain || 'web'}
          </span>
          {source.extractionStatus === 'success' ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              <CheckCircle2 className="w-3 h-3" /> Indexed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
              <AlertTriangle className="w-3 h-3" /> Partial
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-pastel-plum line-clamp-2 mb-2" title={source.title}>
          {source.title}
        </h4>

        {source.extractedText && (
          <p className="text-xs text-pastel-muted line-clamp-3 mb-4 leading-relaxed">
            {source.extractedText}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-pastel-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] text-pastel-muted">
          {source.publishedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(source.publishedAt).toLocaleDateString()}
            </span>
          )}
          {source.qualitySignals?.wordCount && (
            <span className="inline-flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {source.qualitySignals.wordCount} words
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onInspect && (
            <Button variant="ghost" size="sm" onClick={() => onInspect(source)}>
              Inspect
            </Button>
          )}
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl hover:bg-pastel-pink/50 text-pastel-muted hover:text-pastel-plum transition-colors"
            title="Open original URL"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
