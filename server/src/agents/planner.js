import { geminiService } from '../services/gemini.service.js';
import { researchPlanSchema } from '../../../shared/schemas/research.schema.js';
import { emitResearchEvent } from '../services/sse.service.js';
import { AGENT_EVENT_TYPES, RESEARCH_STATUSES } from '../../../shared/constants/research.js';
import { ResearchJob } from '../models/ResearchJob.js';
import { logger } from '../utils/logger.js';
import { MODEL_CONFIG } from '../config/models.js';

export async function runPlannerAgent(state) {
  const { researchId, userId, topic, configuration } = state;
  logger.info(`[Agent:Planner] Initiating research plan for: "${topic}"`);

  await emitResearchEvent(researchId, userId, {
    eventType: AGENT_EVENT_TYPES.RESEARCH_STARTED,
    stage: 'planning',
    message: `Initializing autonomous research planning for "${topic}"`,
    metadata: { depth: configuration?.depth || 'standard' },
  });

  await ResearchJob.findByIdAndUpdate(researchId, {
    status: RESEARCH_STATUSES.PLANNING,
    currentStep: 'Synthesizing research plan and targeted search vectors',
  });

  const prompt = `You are the Lead Research Strategist for an Autonomous AI Research Assistant.
Dissect the following research request into a rigorous, comprehensive research plan.

TOPIC: "${topic}"
OBJECTIVE: "${configuration?.objective || 'Conduct comprehensive empirical and technical analysis'}"
INSTRUCTIONS: "${configuration?.instructions || 'Ensure balanced coverage, compare key alternatives, and verify facts'}"
DEPTH: "${configuration?.depth || 'standard'}"

You must return a valid JSON object adhering strictly to this schema:
{
  "topicSummary": "Concise 1-2 sentence distillation of the core inquiry",
  "researchQuestions": [
    "3 to 5 focused, critical research questions addressing technical mechanisms, real-world benchmarks, comparative trade-offs, and future outlook"
  ],
  "searchQueries": [
    "3 to 5 targeted search engine queries optimized to discover authoritative sources, academic papers, documentation, or benchmark studies"
  ],
  "requiredEvidenceTypes": [
    "List of evidence types required (e.g., empirical metrics, official documentation, architectural specs, case studies)"
  ],
  "proposedSections": [
    {
      "id": "section_1",
      "title": "Section Title",
      "description": "What this section explores"
    }
  ],
  "completionCriteria": [
    "Bullet points of criteria that must be satisfied before final report synthesis"
  ]
}`;

  let plan;
  try {
    if (geminiService.isConfigured()) {
      const rawPlan = await geminiService.generateContent({
        prompt,
        temperature: MODEL_CONFIG.agentSettings.planner.temperature,
        maxOutputTokens: MODEL_CONFIG.agentSettings.planner.maxOutputTokens,
        jsonMode: true,
      });
      plan = researchPlanSchema.parse(rawPlan);
    } else {
      // Deterministic fallback plan when GEMINI_API_KEY is not yet populated
      plan = {
        topicSummary: `Structured comprehensive investigation into ${topic}`,
        researchQuestions: [
          `What are the core technical architectures and principles underpinning ${topic}?`,
          `What are the verified empirical benchmarks, performance characteristics, and industry adoptions of ${topic}?`,
          `What are the primary trade-offs, conflicting perspectives, and key challenges regarding ${topic}?`,
          `What are the leading implementations and recommended best practices for ${topic}?`,
        ],
        searchQueries: [
          `${topic} architecture overview and technical specifications`,
          `${topic} benchmarks performance comparison evaluation`,
          `${topic} limitations challenges conflicting opinions analysis`,
        ],
        requiredEvidenceTypes: [
          'Technical specifications',
          'Empirical benchmarks',
          'Comparative evaluations',
          'Primary documentation',
        ],
        proposedSections: [
          { id: 'sec_arch', title: 'Architectural Foundations & Core Principles', description: 'Deep dive into fundamental mechanisms' },
          { id: 'sec_eval', title: 'Empirical Performance & Comparative Analysis', description: 'Real-world data and trade-offs' },
          { id: 'sec_challenges', title: 'Critical Challenges, Risks & Contradictions', description: 'Unresolved issues and debate' },
          { id: 'sec_outlook', title: 'Strategic Recommendations & Outlook', description: 'Actionable guidance' },
        ],
        completionCriteria: [
          'Sufficient evidence collected addressing core architectural foundations',
          'Empirical benchmarks verified against primary sources',
          'Key conflicting perspectives addressed with citations',
        ],
      };
    }
  } catch (err) {
    logger.error('[Agent:Planner] Planning error, using resilient fallback plan', err);
    plan = {
      topicSummary: `Research analysis into ${topic}`,
      researchQuestions: [
        `What are the fundamental mechanics of ${topic}?`,
        `What are the key trade-offs and empirical metrics for ${topic}?`,
      ],
      searchQueries: [`${topic} overview analysis`, `${topic} benchmarks`],
      requiredEvidenceTypes: ['Empirical metrics', 'Architectural docs'],
      proposedSections: [
        { id: 'sec_overview', title: 'Executive Findings', description: 'Core analysis' },
        { id: 'sec_details', title: 'Detailed Evidence & Evaluation', description: 'In-depth assessment' },
      ],
      completionCriteria: ['Core research questions answered'],
    };
  }

  // Update research job plan in MongoDB
  await ResearchJob.findByIdAndUpdate(researchId, {
    plan,
    currentStep: `Plan created with ${plan.researchQuestions.length} research vectors and ${plan.searchQueries.length} initial queries`,
  });

  await emitResearchEvent(researchId, userId, {
    eventType: AGENT_EVENT_TYPES.PLAN_CREATED,
    stage: 'planning',
    message: `Generated research plan with ${plan.researchQuestions.length} questions and ${plan.searchQueries.length} search queries`,
    metadata: {
      questionsCount: plan.researchQuestions.length,
      queriesCount: plan.searchQueries.length,
      sectionsCount: plan.proposedSections.length,
    },
  });

  return {
    plan,
    searchQueries: plan.searchQueries,
    status: RESEARCH_STATUSES.RESEARCHING,
  };
}
