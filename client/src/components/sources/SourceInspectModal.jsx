import React from 'react';
import { Modal } from '../ui/Modal.jsx';
import { ExternalLink, Globe, Calendar, FileText, CheckCircle2, Hash } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export const SourceInspectModal = ({ source, isOpen, onClose }) => {
  if (!source) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Source Provenance & Extracted Text" maxWidth="max-w-3xl">
      <div className="space-y-4">
        {/* Source Header Metadata */}
        <div className="bg-white/80 rounded-2xl p-4 border border-pastel-border space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-pastel-plum bg-pastel-pink/50 px-2.5 py-1 rounded-xl">
              <Globe className="w-3.5 h-3.5" />
              {source.domain}
            </span>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 hover:underline"
            >
              Open Original <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <h3 className="text-base font-bold text-pastel-plum">{source.title}</h3>
          <p className="text-xs text-pastel-muted break-all">{source.canonicalUrl}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-pastel-border/60 text-xs">
            <div>
              <span className="text-pastel-muted block text-[10px] uppercase font-bold">Published</span>
              <span className="font-medium text-pastel-plum">
                {source.publishedAt ? new Date(source.publishedAt).toLocaleDateString() : 'Not detected'}
              </span>
            </div>
            <div>
              <span className="text-pastel-muted block text-[10px] uppercase font-bold">Retrieved</span>
              <span className="font-medium text-pastel-plum">
                {source.retrievedAt ? new Date(source.retrievedAt).toLocaleDateString() : 'Just now'}
              </span>
            </div>
            <div>
              <span className="text-pastel-muted block text-[10px] uppercase font-bold">Word Count</span>
              <span className="font-medium text-pastel-plum">
                {source.qualitySignals?.wordCount || source.extractedText?.split(/\s+/).length || 0} words
              </span>
            </div>
            <div>
              <span className="text-pastel-muted block text-[10px] uppercase font-bold">Extraction Status</span>
              <span className="font-medium text-emerald-700 capitalize">
                {source.extractionStatus || 'Indexed'}
              </span>
            </div>
          </div>
        </div>

        {/* Extracted Readable Text */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-pastel-muted mb-2">
            Readable Text Content Extracted via Mozilla Readability
          </h4>
          <div className="bg-white/90 rounded-2xl p-4 border border-pastel-border max-h-96 overflow-y-auto text-xs leading-relaxed text-pastel-plum font-sans whitespace-pre-wrap">
            {source.extractedText || 'No readable text content extracted.'}
          </div>
        </div>

        {/* Content Hash Verification */}
        {source.contentHash && (
          <div className="flex items-center gap-2 text-[11px] text-pastel-muted bg-white/60 p-2.5 rounded-xl border border-pastel-border">
            <Hash className="w-3.5 h-3.5" />
            <span>SHA-256 Content Hash: </span>
            <code className="text-purple-900 font-mono text-[10px]">{source.contentHash}</code>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
