import mongoose from 'mongoose';

const evidenceChunkSchema = new mongoose.Schema(
  {
    researchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchJob',
      required: true,
      index: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source',
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
    chunkIndex: {
      type: Number,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    sectionTitle: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

evidenceChunkSchema.index({ researchId: 1, sourceId: 1, chunkIndex: 1 });

export const EvidenceChunk = mongoose.model('EvidenceChunk', evidenceChunkSchema);
