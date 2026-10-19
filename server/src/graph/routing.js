import { logger } from '../utils/logger.js';

/**
 * Conditional router from Critic node:
 * Decides whether to loop back to 'researcher' for another round or advance to 'reportWriter'.
 */
export function routeFromCritic(state) {
  const { round = 1, maxRounds = 2, evaluation, searchQueries = [] } = state;

  logger.info(`[Router:Critic] Evaluating transition. Round: ${round}/${maxRounds}, shouldContinue: ${evaluation?.shouldContinueResearch}`);

  // Hard stop condition: exceeded maximum rounds
  if (round >= maxRounds) {
    logger.info(`[Router:Critic] Reached maximum allowed research rounds (${round}/${maxRounds}). Routing to reportWriter.`);
    return 'reportWriter';
  }

  // If critic requested more research and provided queries
  if (evaluation?.shouldContinueResearch && searchQueries.length > 0) {
    logger.info(`[Router:Critic] Coverage gap identified. Looping back to researcher for round ${round + 1} with ${searchQueries.length} follow-up queries.`);
    return 'researcher';
  }

  logger.info('[Router:Critic] Evidence coverage sufficient. Proceeding to reportWriter.');
  return 'reportWriter';
}
