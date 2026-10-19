import { StateGraph, START, END } from '@langchain/langgraph';
import { ResearchState } from './state.js';
import { runPlannerAgent } from '../agents/planner.js';
import { runResearcherAgent } from '../agents/researcher.js';
import { runAnalystAgent } from '../agents/analyst.js';
import { runCriticAgent } from '../agents/critic.js';
import { runReportWriterAgent } from '../agents/reportWriter.js';
import { routeFromCritic } from './routing.js';
import { ResearchJob } from '../models/ResearchJob.js';
import { emitResearchEvent } from '../services/sse.service.js';
import { AGENT_EVENT_TYPES, RESEARCH_STATUSES } from '../../../shared/constants/research.js';
import { logger } from '../utils/logger.js';

/**
 * Constructs and compiles the LangGraph research workflow
 */
export function buildResearchGraph() {
  const workflow = new StateGraph(ResearchState)
    .addNode('planner', runPlannerAgent)
    .addNode('researcher', runResearcherAgent)
    .addNode('analyst', runAnalystAgent)
    .addNode('critic', runCriticAgent)
    .addNode('reportWriter', runReportWriterAgent)
    .addEdge(START, 'planner')
    .addEdge('planner', 'researcher')
    .addEdge('researcher', 'analyst')
    .addEdge('analyst', 'critic')
    .addConditionalEdges('critic', routeFromCritic, {
      researcher: 'researcher',
      reportWriter: 'reportWriter',
    })
    .addEdge('reportWriter', END);

  return workflow.compile();
}

/**
 * Executes the full autonomous multi-agent research workflow for a given job.
 *
 * @param {string} researchId
 * @param {string} userId
 */
export async function executeResearchWorkflow(researchId, userId) {
  try {
    const job = await ResearchJob.findOne({ _id: researchId, userId });
    if (!job) {
      throw new Error(`Research job ${researchId} not found or unauthorized`);
    }

    logger.info(`Starting LangGraph execution for research: "${job.topic}" (${researchId})`);

    const graph = buildResearchGraph();

    const initialState = {
      researchId: job._id.toString(),
      userId: userId.toString(),
      topic: job.topic,
      configuration: job.configuration || {},
      round: 0,
      maxRounds: job.configuration?.maxRounds || 2,
      maxSources: job.configuration?.maxSources || 10,
      searchQueries: [],
      sources: [],
      claims: [],
      status: RESEARCH_STATUSES.QUEUED,
    };

    // Run the graph to completion
    const finalState = await graph.invoke(initialState);
    logger.info(`LangGraph workflow completed successfully for job ${researchId}`);
    return finalState;
  } catch (err) {
    logger.error(`LangGraph workflow failed for job ${researchId}`, err);

    await ResearchJob.findByIdAndUpdate(researchId, {
      status: RESEARCH_STATUSES.FAILED,
      error: err.message,
      currentStep: `Workflow halted due to error: ${err.message}`,
    });

    await emitResearchEvent(researchId, userId, {
      eventType: AGENT_EVENT_TYPES.RESEARCH_FAILED,
      stage: 'failed',
      message: `Research execution encountered an unrecoverable error: ${err.message}`,
      metadata: { error: err.message },
    });

    throw err;
  }
}
