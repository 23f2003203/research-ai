import mongoose from 'mongoose';

const reportSectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    citations: [{ type: Number }], // Array of 1-based reference indexes e.g. [1, 2]
  },
  { _id: false }
);

const comparisonSchema = new mongoose.Schema(
  {
    dimension: String,
    entityA: String,
    entityB: String,
    finding: String,
  },
  { _id: false }
);

const referenceSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    domain: { type: String },
    publishedDate: { type: String },
    accessedDate: { type: String },
    verified: { type: Boolean, default: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Source' },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchJob',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    executiveSummary: {
      type: String,
      required: true,
    },
    methodology: {
      type: String,
      default: '',
    },
    sections: [reportSectionSchema],
    comparisons: [comparisonSchema],
    conflictingEvidence: {
      type: String,
      default: '',
    },
    risksAndLimitations: {
      type: String,
      default: '',
    },
    conclusions: {
      type: String,
      required: true,
    },
    recommendations: [String],
    references: [referenceSchema],
    verificationSummary: {
      totalCitations: { type: Number, default: 0 },
      verifiedCitations: { type: Number, default: 0 },
      unverifiedCitations: { type: Number, default: 0 },
      accuracyRate: { type: Number, default: 100 },
      auditNotes: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ userId: 1, createdAt: -1 });

export const Report = mongoose.model('Report', reportSchema);
