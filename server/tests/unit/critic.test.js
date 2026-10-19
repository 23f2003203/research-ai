import { describe, it, expect } from 'vitest';
import { routeFromCritic } from '../../src/graph/routing.js';

describe('LangGraph Routing and Bounded Loop Constraints', () => {
  it('routes back to researcher when gaps exist, queries provided, and under maxRounds', () => {
    const state = {
      round: 1,
      maxRounds: 3,
      evaluation: {
        shouldContinueResearch: true,
        coverageScore: 65,
      },
      searchQueries: ['follow up benchmark query'],
    };

    const nextNode = routeFromCritic(state);
    expect(nextNode).toBe('researcher');
  });

  it('strictly forces transition to reportWriter when round reaches maxRounds', () => {
    const state = {
      round: 3,
      maxRounds: 3,
      evaluation: {
        shouldContinueResearch: true, // Critic wants more, but hard limit forbids
        coverageScore: 70,
      },
      searchQueries: ['extra query'],
    };

    const nextNode = routeFromCritic(state);
    expect(nextNode).toBe('reportWriter');
  });

  it('routes to reportWriter when coverage is sufficient', () => {
    const state = {
      round: 1,
      maxRounds: 3,
      evaluation: {
        shouldContinueResearch: false,
        coverageScore: 92,
      },
      searchQueries: [],
    };

    const nextNode = routeFromCritic(state);
    expect(nextNode).toBe('reportWriter');
  });
});
