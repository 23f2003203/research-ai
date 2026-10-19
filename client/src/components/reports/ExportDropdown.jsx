import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Code, Printer, Copy, Check, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { api } from '../../services/api.js';

export const ExportDropdown = ({ researchId, reportTitle }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (format) => {
    window.open(api.getExportUrl(researchId, format), '_blank');
    setOpen(false);
  };

  const handleCopyMarkdown = async () => {
    try {
      const res = await fetch(api.getExportUrl(researchId, 'markdown'));
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setOpen(false);
    } catch (err) {
      console.error('Failed to copy report markdown', err);
    }
  };

  const handlePrint = () => {
    setOpen(false);
    window.print();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        variant="primary"
        size="sm"
        icon={Download}
        onClick={() => setOpen(!open)}
      >
        Export Report <ChevronDown className="w-3.5 h-3.5 ml-1" />
      </Button>

      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-52 rounded-2xl glass-panel shadow-glow border border-pastel-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => handleDownload('markdown')}
            className="w-full text-left px-4 py-2 text-xs font-medium text-pastel-plum hover:bg-pastel-pink/50 flex items-center gap-2.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-purple-600" />
            Download Markdown (.md)
          </button>
          <button
            onClick={() => handleDownload('json')}
            className="w-full text-left px-4 py-2 text-xs font-medium text-pastel-plum hover:bg-pastel-pink/50 flex items-center gap-2.5 transition-colors"
          >
            <Code className="w-4 h-4 text-blue-600" />
            Download Structured JSON
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="w-full text-left px-4 py-2 text-xs font-medium text-pastel-plum hover:bg-pastel-pink/50 flex items-center gap-2.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Markdown'}
          </button>
          <div className="my-1 border-t border-pastel-border/60" />
          <button
            onClick={handlePrint}
            className="w-full text-left px-4 py-2 text-xs font-medium text-pastel-plum hover:bg-pastel-pink/50 flex items-center gap-2.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            Print / Save to PDF
          </button>
        </div>
      )}
    </div>
  );
};
