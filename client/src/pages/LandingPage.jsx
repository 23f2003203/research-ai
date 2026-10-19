import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import {
  Compass,
  Search,
  FileCheck,
  Repeat,
  ShieldCheck,
  Database,
  History,
  Download,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      icon: Compass,
      title: 'Autonomous Research Planning',
      desc: 'Dissects open-ended questions into structured research vectors, sub-questions, and targeted search queries.',
    },
    {
      icon: Search,
      title: 'Live Web Search',
      desc: 'Retrieves current authoritative web pages via Tavily, with canonical deduplication and SSRF security.',
    },
    {
      icon: FileCheck,
      title: 'Evidence-Based Analysis',
      desc: 'Extracts empirical facts, units, dates, and claims, distinguishing verified findings from opinion or forecasts.',
    },
    {
      icon: Repeat,
      title: 'Intelligent Research Loops',
      desc: 'The Critic evaluates question coverage and automatically triggers follow-up research loops if gaps persist.',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Citations',
      desc: 'Strict citation verification ensures every single claim links to an actual, stored database source passage.',
    },
    {
      icon: Database,
      title: 'Semantic Knowledge Retrieval',
      desc: 'Chunks articles and generates embeddings for semantic vector search across collected evidence.',
    },
    {
      icon: History,
      title: 'Persistent Research History',
      desc: 'Every research job, source passage, claim, and event is persisted for multi-session resumption and auditability.',
    },
    {
      icon: Download,
      title: 'Exportable Reports',
      desc: 'Download research reports as clean Markdown, structured JSON, or print-ready PDF with complete bibliographies.',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Enter Topic', desc: 'Provide your research topic and desired depth.' },
    { step: '02', title: 'AI Planning', desc: 'Planner agent decomposes questions and formulates queries.' },
    { step: '03', title: 'Web Research', desc: 'Researcher executes live searches and extracts readable pages.' },
    { step: '04', title: 'Evidence Analysis', desc: 'Analyst identifies factual claims and flags contradictions.' },
    { step: '05', title: 'Critic Evaluation', desc: 'Evaluates coverage score and triggers bounded follow-up loops.' },
    { step: '06', title: 'Verified Report', desc: 'Writer synthesizes structured findings with verifiable citations.' },
  ];

  const faqs = [
    {
      q: 'How does Research AI prevent hallucinations?',
      a: 'Unlike standard chatbots that guess answers, Research AI utilizes a multi-agent LangGraph pipeline that searches the live web, extracts raw text via Mozilla Readability, chunks and embeds the text, and deterministically validates that every citation in the bibliography maps to an indexed database source.',
    },
    {
      q: 'What LLM models power the assistant?',
      a: 'The system uses Google Gemini Flash-class models for cost-effective, high-throughput planning, analysis, and synthesis, paired with Gemini text-embedding-004 for semantic vector retrieval.',
    },
    {
      q: 'Can I export reports for publication?',
      a: 'Yes! Every report can be exported as clean Markdown with numbered citation anchors, structured JSON for programmatic ingestion, or printed directly to PDF.',
    },
    {
      q: 'Are my research topics private?',
      a: 'Yes. All research jobs, captured sources, claims, and reports are protected by user authentication with strict ownership isolation.',
    },
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 sm:pt-16 pb-12">
        {/* Subtle badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-pastel-border/80 shadow-xs mb-8">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-pastel-plum tracking-wide">
            Autonomous Multi-Agent AI Research Assistant
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-pastel-plum tracking-tight leading-[1.1] mb-6">
          Research deeper. <br />
          <span className="bg-gradient-to-r from-purple-700 via-rose-600 to-amber-600 bg-clip-text text-transparent">
            Discover smarter.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-pastel-muted leading-relaxed mb-10">
          Your autonomous AI research assistant that explores the web, analyzes evidence,
          and transforms complex questions into structured, source-backed reports.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={handleStart}
            className="w-full sm:w-auto shadow-glow"
          >
            Start Researching
          </Button>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore How It Works
            </Button>
          </a>
        </div>

        {/* Hero Visual: Pastel Research Workflow Graphic */}
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-10 shadow-soft border border-pastel-border/80 relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 items-center">
            {/* Step 1: Query & Discovery */}
            <div className="bg-white/80 rounded-2xl p-5 border border-pastel-border text-left shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-pastel-yellow/70 flex items-center justify-center mb-3">
                <Search className="w-5 h-5 text-amber-700" />
              </div>
              <h4 className="text-sm font-bold text-pastel-plum mb-1">Live Web Search</h4>
              <p className="text-xs text-pastel-muted">
                Tavily discovery & extraction across multiple authoritative sources.
              </p>
            </div>

            {/* Step 2: RAG & Factual Claims */}
            <div className="bg-gradient-to-br from-pastel-pink/60 to-pastel-lavender/50 rounded-2xl p-5 border border-pastel-border text-left shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5 text-purple-700" />
              </div>
              <h4 className="text-sm font-bold text-pastel-plum mb-1">Evidence Analysis</h4>
              <p className="text-xs text-pastel-muted">
                Semantic chunking, vector embeddings, and contradiction detection.
              </p>
            </div>

            {/* Step 3: Verified Report */}
            <div className="bg-white/80 rounded-2xl p-5 border border-pastel-border text-left shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-pastel-lime/80 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <h4 className="text-sm font-bold text-pastel-plum mb-1">Cited Report</h4>
              <p className="text-xs text-pastel-muted">
                100% verified citation bibliography matching primary source passages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-purple-700 bg-pastel-lavender/60 px-3 py-1 rounded-full">
            Autonomous Agentic Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-pastel-plum mt-3 mb-4">
            Engineered for Grounded, Verifiable Truth
          </h2>
          <p className="text-sm sm:text-base text-pastel-muted">
            Combining LangGraph multi-agent coordination, Google Gemini Flash intelligence, and live web search.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Card key={idx} hover className="flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pastel-yellow via-pastel-pink to-pastel-lavender p-0.5 mb-4 inline-flex items-center justify-center">
                    <div className="w-full h-full bg-white/90 rounded-[14px] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-pastel-plum" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-pastel-plum mb-2">{f.title}</h3>
                  <p className="text-xs text-pastel-muted leading-relaxed">{f.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-purple-700 bg-pastel-lavender/60 px-3 py-1 rounded-full">
            Multi-Agent Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-pastel-plum mt-3 mb-4">
            How Research AI Discovers the Web
          </h2>
          <p className="text-sm sm:text-base text-pastel-muted">
            A stateful, observable LangGraph architecture executing bounded research rounds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflowSteps.map((s, idx) => (
            <div key={idx} className="glass-panel rounded-3xl p-6 relative">
              <span className="text-3xl font-extrabold text-pastel-border/80 block mb-2 font-mono">
                {s.step}
              </span>
              <h3 className="text-base font-bold text-pastel-plum mb-2">{s.title}</h3>
              <p className="text-xs text-pastel-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example Report Preview */}
      <section id="example" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-4xl p-8 sm:p-12 border border-pastel-border shadow-soft">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-pastel-border/70 mb-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-800 bg-pastel-lime/80 px-2.5 py-1 rounded-full">
                Sample Verified Output
              </span>
              <h3 className="text-2xl font-bold text-pastel-plum mt-2">
                Autonomous Report: Next-Generation Solid State Batteries
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-pastel-muted">Citation Accuracy</span>
              <p className="text-xl font-bold text-emerald-700">100% Verified</p>
            </div>
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-pastel-plum">
            <h4 className="text-sm font-bold text-pastel-plum uppercase tracking-wider">
              Executive Summary
            </h4>
            <p className="text-pastel-muted leading-relaxed">
              Recent technological breakthroughs in ceramic electrolyte synthesis have doubled ion conductivity at ambient operating temperatures{' '}
              <span className="px-1.5 py-0.5 rounded bg-pastel-pink font-bold text-purple-900 border border-pastel-border text-[10px]">[1]</span>.
              Independent peer-reviewed evaluations across major automotive labs report sustained 80% capacity retention over 1,200 fast-charge cycles{' '}
              <span className="px-1.5 py-0.5 rounded bg-pastel-pink font-bold text-purple-900 border border-pastel-border text-[10px]">[2]</span>.
            </p>

            <div className="p-4 rounded-2xl bg-white/70 border border-pastel-border mt-4">
              <h5 className="font-bold text-pastel-plum mb-2">Verified References</h5>
              <ul className="space-y-1.5 text-pastel-muted text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="font-bold text-purple-800">[1]</span>
                  <span>Nature Materials: Advances in Solid-State Electrolytes (nature.com)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold text-purple-800">[2]</span>
                  <span>U.S. National Renewable Energy Laboratory Technical Report (nrel.gov)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-pastel-plum">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 border border-pastel-border">
              <h3 className="text-base font-bold text-pastel-plum mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs text-pastel-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-br from-pastel-yellow/60 via-pastel-pink/60 to-pastel-lavender/60 rounded-4xl p-10 sm:p-16 border border-pastel-border shadow-soft">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-pastel-plum mb-4">
            Ready to explore verified research?
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base text-pastel-muted mb-8 leading-relaxed">
            Experience the power of autonomous agentic discovery with live web search and deterministic citation auditing.
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            onClick={handleStart}
            className="shadow-glow"
          >
            Launch Research Assistant
          </Button>
        </div>
      </section>
    </div>
  );
};
