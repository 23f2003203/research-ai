import mongoose from 'mongoose';
import { RESEARCH_STATUSES } from '../../../shared/constants/research.js';

const researchJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    configuration: {
      objective: { type: String, default: '' },
      instructions: { type: String, default: '' },
      depth: { type: String, enum: ['quick', 'standard', 'deep'], default: 'standard' },
      maxSources: { type: Number, default: 10 },
      maxRounds: { type: Number, default: 2 },
      preferredDomains: { type: [String], default: [] },
      excludedDomains: { type: [String], default: [] },
    },
    plan: {
      topicSummary: { type: String, default: '' },
      researchQuestions: { type: [String], default: [] },
      searchQueries: { type: [String], default: [] },
      requiredEvidenceTypes: { type: [String], default: [] },
      proposedSections: [
        {
          id: String,
          title: String,
          description: String,
        },
      ],
      completionCriteria: { type: [String], default: [] },
    },
    status: {
      type: String,
      enum: Object.values(RESEARCH_STATUSES),
      default: RESEARCH_STATUSES.QUEUED,
      index: true,
    },
    currentStep: {
      type: String,
      default: 'Initializing research request',
    },
    roundCount: {
      type: Number,
      default: 0,
    },
    coverageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    sourceCount: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

researchJobSchema.index({ userId: 1, createdAt: -1 });

export const ResearchJob = mongoose.model('ResearchJob', researchJobSchema);
