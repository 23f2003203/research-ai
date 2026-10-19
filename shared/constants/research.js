export const RESEARCH_STATUSES = {
  QUEUED: 'queued',
  PLANNING: 'planning',
  RESEARCHING: 'researching',
  ANALYZING: 'analyzing',
  EVALUATING: 'evaluating',
  SYNTHESIZING: 'synthesizing',
  VERIFYING: 'verifying',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

export const RESEARCH_DEPTHS = {
  QUICK: {
    id: 'quick',
    name: 'Quick Overview',
    description: 'Fast synthesis with targeted sources (1 round, up to 5 sources)',
    maxRounds: 1,
    maxSources: 5,
    searchBreadth: 3,
  },
  STANDARD: {
    id: 'standard',
    name: 'Standard Investigation',
    description: 'Balanced depth with iterative evaluation (up to 2 rounds, 10 sources)',
    maxRounds: 2,
    maxSources: 10,
    searchBreadth: 5,
  },
  DEEP: {
    id: 'deep',
    name: 'Deep Comprehensive Research',
    description: 'Exhaustive cross-examination with multiple rounds (up to 3 rounds, 18 sources)',
    maxRounds: 3,
    maxSources: 18,
    searchBreadth: 8,
  },
};

export const CLAIM_SUPPORT_STATUSES = {
  SUPPORTED: 'supported',
  PARTIALLY_SUPPORTED: 'partially_supported',
  CONTRADICTED: 'contradicted',
  UNVERIFIED: 'unverified',
};

export const AGENT_EVENT_TYPES = {
  RESEARCH_STARTED: 'research_started',
  PLAN_CREATED: 'plan_created',
  SEARCH_STARTED: 'search_started',
  SOURCES_DISCOVERED: 'sources_discovered',
  SOURCE_EXTRACTED: 'source_extracted',
  EVIDENCE_EXTRACTED: 'evidence_extracted',
  COVERAGE_EVALUATED: 'coverage_evaluated',
  ADDITIONAL_RESEARCH_STARTED: 'additional_research_started',
  REPORT_GENERATED: 'report_generated',
  CITATIONS_VERIFIED: 'citations_verified',
  RESEARCH_COMPLETED: 'research_completed',
  RESEARCH_FAILED: 'research_failed',
  RESEARCH_CANCELLED: 'research_cancelled',
};
