import mongoose from 'mongoose';
import { CLAIM_SUPPORT_STATUSES } from '../../../shared/constants/research.js';

const claimSchema = new mongoose.Schema(
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
    text: {
      type: String,
      required: true,
    },
    sourceIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Source',
      },
    ],
    evidenceChunkIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EvidenceChunk',
      },
    ],
    supportStatus: {
      type: String,
      enum: Object.values(CLAIM_SUPPORT_STATUSES),
      default: CLAIM_SUPPORT_STATUSES.SUPPORTED,
      index: true,
    },
    confidence: {
      type: Number,
      default: 0.9,
    },
    category: {
      type: String,
      default: 'finding',
    },
    hasContradiction: {
      type: Boolean,
      default: false,
    },
    contradictionNotes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ researchId: 1, supportStatus: 1 });

export const Claim = mongoose.model('Claim', claimSchema);
