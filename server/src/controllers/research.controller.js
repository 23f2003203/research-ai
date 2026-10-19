import { ResearchJob } from '../models/ResearchJob.js';
import { Source } from '../models/Source.js';
import { Claim } from '../models/Claim.js';
import { Report } from '../models/Report.js';
import { AgentEvent } from '../models/AgentEvent.js';
import { createResearchSchema } from '../../../shared/schemas/research.schema.js';
import { RESEARCH_STATUSES, RESEARCH_DEPTHS, AGENT_EVENT_TYPES } from '../../../shared/constants/research.js';
import { executeResearchWorkflow } from '../graph/workflow.js';
import { registerSSEClient, emitResearchEvent } from '../services/sse.service.js';
import { logger } from '../utils/logger.js';

/**
 * List research jobs owned by current user
 */
export const listResearchJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const status = req.query.status;
    const search = req.query.search;

    const filter = { userId: req.user._id };
    if (status && status !== 'undefined' && status !== 'null' && Object.values(RESEARCH_STATUSES).includes(status)) {
      filter.status = status;
    }
    if (search && search.trim() && search.trim() !== 'undefined' && search.trim() !== 'null') {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.topic = { $regex: escaped, $options: 'i' };
    }

    const total = await ResearchJob.countDocuments(filter);
    const jobs = await ResearchJob.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reportId', 'title verificationSummary')
      .lean();

    return res.status(200).json({
      success: true,
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new research job and launch workflow
 */
export const createResearchJob = async (req, res, next) => {
  try {
    const validatedData = createResearchSchema.parse(req.body);
    const depthConfig = RESEARCH_DEPTHS[validatedData.depth.toUpperCase()] || RESEARCH_DEPTHS.STANDARD;

    const job = await ResearchJob.create({
      userId: req.user._id,
      topic: validatedData.topic,
      configuration: {
        objective: validatedData.objective || '',
        instructions: validatedData.instructions || '',
        depth: validatedData.depth,
        maxSources: Math.min(validatedData.maxSources || depthConfig.maxSources, depthConfig.maxSources),
        maxRounds: Math.min(validatedData.maxRounds || depthConfig.maxRounds, depthConfig.maxRounds),
        preferredDomains: validatedData.preferredDomains || [],
        excludedDomains: validatedData.excludedDomains || [],
      },
      status: RESEARCH_STATUSES.QUEUED,
      currentStep: 'Job enqueued for autonomous research processing',
    });

    logger.info(`Research job created: ${job._id} by user ${req.user._id}`);

    // Asynchronously launch the LangGraph workflow without blocking response
    setImmediate(async () => {
      try {
        await executeResearchWorkflow(job._id, req.user._id);
      } catch (workflowErr) {
        logger.error(`Background workflow failed for job ${job._id}`, workflowErr);
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Research job created and agent pipeline started',
      job,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed research job
 */
export const getResearchJob = async (req, res, next) => {
  try {
    const job = await ResearchJob.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('reportId');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Research job not found or unauthorized' });
    }

    return res.status(200).json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

/**
 * Manually start or restart a research job
 */
export const startResearchJob = async (req, res, next) => {
  try {
    const job = await ResearchJob.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Research job not found or unauthorized' });
    }

    if (job.status === RESEARCH_STATUSES.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Research job is already completed' });
    }

    job.status = RESEARCH_STATUSES.QUEUED;
    job.error = null;
    job.currentStep = 'Restarting autonomous workflow';
    await job.save();

    setImmediate(async () => {
      try {
        await executeResearchWorkflow(job._id, req.user._id);
      } catch (err) {
        logger.error(`Restart workflow failed for job ${job._id}`, err);
      }
    });

    return res.status(200).json({ success: true, message: 'Research workflow triggered', job });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel an active research job
 */
export const cancelResearchJob = async (req, res, next) => {
  try {
    const job = await ResearchJob.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Research job not found or unauthorized' });
    }

    job.status = RESEARCH_STATUSES.CANCELLED;
    job.currentStep = 'Research cancelled by user request';
    await job.save();

    await emitResearchEvent(job._id, req.user._id, {
      eventType: AGENT_EVENT_TYPES.RESEARCH_CANCELLED,
      stage: 'cancelled',
      message: 'Research operation was cancelled by user.',
    });

    return res.status(200).json({ success: true, message: 'Research job cancelled', job });
  } catch (err) {
    next(err);
  }
};

/**
 * Server-Sent Events endpoint for real-time progress
 */
export const streamResearchEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await ResearchJob.findOne({ _id: id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Research job not found or unauthorized' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Replay past events first so reconnecting clients get full history
    const pastEvents = await AgentEvent.find({ researchId: id, userId: req.user._id })
      .sort({ createdAt: 1 })
      .lean();

    for (const evt of pastEvents) {
      res.write(`data: ${JSON.stringify({
        id: evt._id,
        researchId: evt.researchId,
        eventType: evt.eventType,
        stage: evt.stage,
        message: evt.message,
        metadata: evt.metadata,
        createdAt: evt.createdAt,
      })}\n\n`);
    }

    // Register active SSE listener
    registerSSEClient(id, res);

    // Keep-alive heartbeat interval
    const heartbeat = setInterval(() => {
      try {
        res.write(': keepalive\n\n');
      } catch (e) {
        clearInterval(heartbeat);
      }
    }, 20000);

    req.on('close', () => {
      clearInterval(heartbeat);
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all captured sources for a research job
 */
export const getResearchSources = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sources = await Source.find({ researchId: id, userId: req.user._id })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, count: sources.length, sources });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all extracted claims for a research job
 */
export const getResearchClaims = async (req, res, next) => {
  try {
    const { id } = req.params;
    const claims = await Claim.find({ researchId: id, userId: req.user._id })
      .populate('sourceIds', 'title url domain')
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({ success: true, count: claims.length, claims });
  } catch (err) {
    next(err);
  }
};

/**
 * Get generated report for a research job
 */
export const getResearchReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findOne({ researchId: id, userId: req.user._id });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report has not yet been generated for this research job.',
      });
    }

    return res.status(200).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

/**
 * Export research report as Markdown or JSON
 */
export const exportResearchReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const format = req.query.format || 'markdown';
    const report = await Report.findOne({ researchId: id, userId: req.user._id });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="research-report-${id}.json"`);
      return res.send(JSON.stringify(report, null, 2));
    }

    // Generate Markdown document
    let md = `# ${report.title}\n\n`;
    md += `*Generated autonomously by Research AI on ${new Date(report.createdAt).toLocaleDateString()}*\n\n`;
    md += `## Executive Summary\n\n${report.executiveSummary}\n\n`;
    md += `## Methodology\n\n${report.methodology}\n\n`;

    for (const sec of report.sections || []) {
      md += `### ${sec.title}\n\n${sec.content}\n\n`;
    }

    if (report.comparisons && report.comparisons.length > 0) {
      md += `## Comparative Analysis\n\n`;
      md += `| Dimension | ${report.comparisons[0]?.entityA || 'Option A'} | ${report.comparisons[0]?.entityB || 'Option B'} | Finding |\n`;
      md += `| --- | --- | --- | --- |\n`;
      for (const comp of report.comparisons) {
        md += `| ${comp.dimension} | ${comp.entityA} | ${comp.entityB} | ${comp.finding} |\n`;
      }
      md += `\n`;
    }

    if (report.conflictingEvidence) {
      md += `## Conflicting Evidence & Debates\n\n${report.conflictingEvidence}\n\n`;
    }

    if (report.risksAndLimitations) {
      md += `## Risks & Limitations\n\n${report.risksAndLimitations}\n\n`;
    }

    md += `## Conclusions\n\n${report.conclusions}\n\n`;

    if (report.recommendations && report.recommendations.length > 0) {
      md += `## Strategic Recommendations\n\n`;
      for (const rec of report.recommendations) {
        md += `- ${rec}\n`;
      }
      md += `\n`;
    }

    md += `## References\n\n`;
    for (const ref of report.references || []) {
      md += `[${ref.index}] [${ref.title}](${ref.url}) — ${ref.domain}${ref.publishedDate ? ` (Published: ${ref.publishedDate})` : ''}\n`;
    }

    md += `\n---\n*Verification audit: ${report.verificationSummary?.verifiedCitations || 0}/${report.verificationSummary?.totalCitations || 0} citations verified (${report.verificationSummary?.accuracyRate || 100}% accuracy rate)*\n`;

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="research-report-${id}.md"`);
    return res.send(md);
  } catch (err) {
    next(err);
  }
};

/**
 * Follow-up research on a specific section or inquiry
 */
export const refineResearch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { followUpQuery } = req.body;

    if (!followUpQuery || !followUpQuery.trim()) {
      return res.status(400).json({ success: false, message: 'followUpQuery is required' });
    }

    const job = await ResearchJob.findOne({ _id: id, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Research job not found or unauthorized' });
    }

    // Create a targeted follow-up research job linked to this topic
    const newJob = await ResearchJob.create({
      userId: req.user._id,
      topic: `${job.topic} — ${followUpQuery.trim()}`,
      configuration: {
        ...job.configuration,
        objective: `Follow-up research on: ${followUpQuery.trim()}`,
        maxRounds: 1,
        depth: 'quick',
      },
      status: RESEARCH_STATUSES.QUEUED,
      currentStep: 'Initializing targeted follow-up research',
    });

    setImmediate(async () => {
      try {
        await executeResearchWorkflow(newJob._id, req.user._id);
      } catch (err) {
        logger.error(`Refinement workflow failed for ${newJob._id}`, err);
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Follow-up research initiated',
      job: newJob,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a research job and associated records
 */
export const deleteResearchJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await ResearchJob.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Research job not found or unauthorized' });
    }

    // Cascade delete related records
    await Source.deleteMany({ researchId: id, userId: req.user._id });
    await Claim.deleteMany({ researchId: id, userId: req.user._id });
    await Report.deleteMany({ researchId: id, userId: req.user._id });
    await AgentEvent.deleteMany({ researchId: id, userId: req.user._id });

    return res.status(200).json({ success: true, message: 'Research job and all associated records deleted' });
  } catch (err) {
    next(err);
  }
};
