import mongoose from 'mongoose';

const agentEventSchema = new mongoose.Schema(
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
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    stage: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

agentEventSchema.index({ researchId: 1, createdAt: 1 });

export const AgentEvent = mongoose.model('AgentEvent', agentEventSchema);
