import { Annotation } from '@langchain/langgraph';

/**
 * State channel schema for the Research AI LangGraph multi-agent workflow
 */
export const ResearchState = Annotation.Root({
  researchId: Annotation(),
  userId: Annotation(),
  topic: Annotation(),
  configuration: Annotation(),
  plan: Annotation(),
  round: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr || 0),
    default: () => 0,
  }),
  maxRounds: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr || 2),
    default: () => 2,
  }),
  maxSources: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr || 10),
    default: () => 10,
  }),
  searchQueries: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr || []),
    default: () => [],
  }),
  sources: Annotation({
    reducer: (curr, update) => {
      const map = new Map();
      for (const s of curr || []) {
        if (s.canonicalUrl) map.set(s.canonicalUrl, s);
      }
      for (const s of update || []) {
        if (s.canonicalUrl) map.set(s.canonicalUrl, s);
      }
      return Array.from(map.values());
    },
    default: () => [],
  }),
  claims: Annotation({
    reducer: (curr, update) => [...(curr || []), ...(update || [])],
    default: () => [],
  }),
  evaluation: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => null,
  }),
  draftReport: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => null,
  }),
  finalReport: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => null,
  }),
  status: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => 'queued',
  }),
  error: Annotation({
    reducer: (curr, update) => (update !== undefined ? update : curr),
    default: () => null,
  }),
});
