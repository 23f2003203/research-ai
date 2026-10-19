import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../src/app.js';
import { executeResearchWorkflow } from '../../src/graph/workflow.js';
import { ResearchJob } from '../../src/models/ResearchJob.js';
import { Source } from '../../src/models/Source.js';
import { Claim } from '../../src/models/Claim.js';
import { Report } from '../../src/models/Report.js';

let mongoServer;
let app;
let userAToken;
let userBToken;
let userAId;
let userBId;
let testJobId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createApp();

  // Register User A
  const resA = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Dr. Evelyn Carter',
      email: 'evelyn.carter@ai-lab.org',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    });
  userAToken = resA.body.token;
  userAId = resA.body.user.id;

  // Register User B
  const resB = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Marcus Vance',
      email: 'marcus.vance@external-corp.io',
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
    });
  userBToken = resB.body.token;
  userBId = resB.body.user.id;
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('End-to-End Research AI Workflow and Multi-User Isolation', () => {
  it('creates a new research job for User A', async () => {
    const res = await request(app)
      .post('/api/research')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        topic: 'Next-Generation Solid State Battery Architectures',
        objective: 'Analyze empirical electrolyte benchmarks, cycling stability, and automotive manufacturing trade-offs',
        depth: 'standard',
        maxSources: 6,
        maxRounds: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.job).toBeDefined();
    expect(res.body.job.topic).toBe('Next-Generation Solid State Battery Architectures');
    testJobId = res.body.job._id;
  });

  it('executes full LangGraph workflow across all 5 agents', async () => {
    // Wait for the autonomous LangGraph workflow to complete
    let job = await ResearchJob.findById(testJobId);
    let attempts = 0;
    while (job && job.status !== 'completed' && job.status !== 'failed' && attempts < 50) {
      await new Promise((r) => setTimeout(r, 1500));
      job = await ResearchJob.findById(testJobId);
      attempts++;
    }

    expect(job).toBeDefined();
    expect(job.status).toBe('completed');
    expect(job.coverageScore).toBeGreaterThanOrEqual(60);
    expect(job.reportId).toBeDefined();
  }, 90000);

  it('retrieves the generated report with verified citations', async () => {
    const res = await request(app)
      .get(`/api/research/${testJobId}/report`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const report = res.body.report;

    expect(report.title).toBeDefined();
    expect(report.executiveSummary).toBeDefined();
    expect(report.sections.length).toBeGreaterThan(0);
    expect(report.references.length).toBeGreaterThan(0);
    expect(report.verificationSummary).toBeDefined();
    expect(report.verificationSummary.accuracyRate).toBeGreaterThanOrEqual(80);
  });

  it('exports report in Markdown format', async () => {
    const res = await request(app)
      .get(`/api/research/${testJobId}/export?format=markdown`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
    expect(res.text).toContain('# ');
    expect(res.text).toContain('## Executive Summary');
    expect(res.text).toContain('## References');
  });

  it('strictly enforces multi-user data isolation: User B cannot access User A research', async () => {
    // User B attempts to access User A's research job details
    const jobRes = await request(app)
      .get(`/api/research/${testJobId}`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(jobRes.status).toBe(404);

    // User B attempts to access User A's report
    const reportRes = await request(app)
      .get(`/api/research/${testJobId}/report`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(reportRes.status).toBe(404);

    // User B attempts to export User A's report
    const exportRes = await request(app)
      .get(`/api/research/${testJobId}/export`)
      .set('Authorization', `Bearer ${userBToken}`);
    expect(exportRes.status).toBe(404);
  });
});
