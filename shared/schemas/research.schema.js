import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const createResearchSchema = z.object({
  topic: z.string().trim().min(3, 'Topic must be at least 3 characters').max(200, 'Topic is too long'),
  objective: z.string().trim().max(1000).optional().default(''),
  instructions: z.string().trim().max(1000).optional().default(''),
  depth: z.enum(['quick', 'standard', 'deep']).default('standard'),
  maxSources: z.number().int().min(2).max(25).default(10),
  maxRounds: z.number().int().min(1).max(3).default(2),
  preferredDomains: z.array(z.string().trim()).optional().default([]),
  excludedDomains: z.array(z.string().trim()).optional().default([]),
});

export const researchPlanSchema = z.object({
  topicSummary: z.string(),
  researchQuestions: z.array(z.string().min(3)),
  searchQueries: z.array(z.string().min(3)),
  requiredEvidenceTypes: z.array(z.string()),
  proposedSections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
  })),
  completionCriteria: z.array(z.string()),
});

export const claimExtractionSchema = z.object({
  claims: z.array(z.object({
    claimText: z.string(),
    sourceUrl: z.string().url().optional(),
    quoteExcerpt: z.string().optional(),
    supportStatus: z.enum(['supported', 'partially_supported', 'contradicted', 'unverified']).default('supported'),
    confidence: z.number().min(0).max(1).default(0.9),
    category: z.string().optional(),
    hasContradiction: z.boolean().default(false),
    contradictionNotes: z.string().optional(),
  })),
});

export const coverageEvaluationSchema = z.object({
  coverageScore: z.number().min(0).max(100),
  questionsCoverage: z.array(z.object({
    question: z.string(),
    covered: z.boolean(),
    summary: z.string(),
    gaps: z.string().optional(),
  })),
  shouldContinueResearch: z.boolean(),
  reasonForDecision: z.string(),
  followUpQueries: z.array(z.string()),
  identifiedContradictions: z.array(z.string()).optional(),
});

export const structuredReportSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  methodology: z.string(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    citations: z.array(z.number()),
  })),
  comparisons: z.array(z.object({
    dimension: z.string(),
    entityA: z.string(),
    entityB: z.string(),
    finding: z.string(),
  })).optional(),
  conflictingEvidence: z.string().optional(),
  risksAndLimitations: z.string(),
  conclusions: z.string(),
  recommendations: z.array(z.string()).optional(),
  references: z.array(z.object({
    index: z.number(),
    title: z.string(),
    url: z.string(),
    domain: z.string(),
    publishedDate: z.string().optional(),
    accessedDate: z.string(),
    verified: z.boolean().default(true),
  })),
});
