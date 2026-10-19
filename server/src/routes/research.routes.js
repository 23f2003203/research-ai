import { Router } from 'express';
import {
  listResearchJobs,
  createResearchJob,
  getResearchJob,
  startResearchJob,
  cancelResearchJob,
  streamResearchEvents,
  getResearchSources,
  getResearchClaims,
  getResearchReport,
  exportResearchReport,
  refineResearch,
  deleteResearchJob,
} from '../controllers/research.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { researchCreateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// All research routes require authenticated session
router.use(authenticate);

router.get('/', listResearchJobs);
router.post('/', researchCreateLimiter, createResearchJob);
router.get('/:id', getResearchJob);
router.post('/:id/start', startResearchJob);
router.post('/:id/cancel', cancelResearchJob);
router.get('/:id/events', streamResearchEvents);
router.get('/:id/sources', getResearchSources);
router.get('/:id/claims', getResearchClaims);
router.get('/:id/report', getResearchReport);
router.get('/:id/export', exportResearchReport);
router.post('/:id/refine', refineResearch);
router.delete('/:id', deleteResearchJob);

export default router;
