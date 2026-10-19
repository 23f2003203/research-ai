import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchJob',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    canonicalUrl: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Document',
    },
    domain: {
      type: String,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    retrievedAt: {
      type: Date,
      default: Date.now,
    },
    contentHash: {
      type: String,
      index: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    qualitySignals: {
      relevanceScore: { type: Number, default: 0.8 },
      wordCount: { type: Number, default: 0 },
      isPrimary: { type: Boolean, default: false },
      hasAuthor: { type: Boolean, default: false },
    },
    extractionStatus: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
    },
  },
  {
    timestamps: true,
  }
);

sourceSchema.index({ researchId: 1, canonicalUrl: 1 }, { unique: true });

export const Source = mongoose.model('Source', sourceSchema);
