import { AgentEvent } from '../models/AgentEvent.js';
import { logger } from '../utils/logger.js';

// Map of researchId -> Set of express response objects
const activeClients = new Map();

/**
 * Registers an SSE client connection for a specific research job.
 */
export function registerSSEClient(researchId, res) {
  if (!activeClients.has(researchId)) {
    activeClients.set(researchId, new Set());
  }
  const clients = activeClients.get(researchId);
  clients.add(res);

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', researchId, timestamp: new Date().toISOString() })}\n\n`);

  // Handle client disconnection
  res.on('close', () => {
    clients.delete(res);
    if (clients.size === 0) {
      activeClients.delete(researchId);
    }
  });
}

/**
 * Emits an event to all connected clients and persists it to the database.
 */
export async function emitResearchEvent(researchId, userId, { eventType, stage, message, metadata = {} }) {
  try {
    // 1. Persist to MongoDB
    const event = await AgentEvent.create({
      researchId,
      userId,
      eventType,
      stage,
      message,
      metadata,
    });

    // 2. Stream to connected clients
    const clients = activeClients.get(researchId.toString());
    if (clients && clients.size > 0) {
      const payload = JSON.stringify({
        id: event._id,
        researchId,
        eventType,
        stage,
        message,
        metadata,
        createdAt: event.createdAt,
      });

      for (const client of clients) {
        try {
          client.write(`data: ${payload}\n\n`);
        } catch (clientErr) {
          logger.warn('Failed to write event to SSE client', clientErr);
        }
      }
    }

    logger.info(`[ResearchEvent] [${stage}] ${eventType}: ${message}`);
    return event;
  } catch (err) {
    logger.error('Failed to emit research event', err);
  }
}
