const { test } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../secure-server');

test('GET /health returns ok status', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(res.body.timestamp);
});

test('GET /security/health reports secure status', async () => {
  const res = await request(app).get('/security/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'secure');
  assert.ok(res.body.checks.rateLimiting);
});

test('GET /narratives/:id/metrics returns mocked metrics', async () => {
  const res = await request(app).get('/narratives/nar-global-ops/metrics').query({ window: '7d' });
  assert.equal(res.status, 200);
  assert.equal(res.body.narrative_id, 'nar-global-ops');
  assert.equal(res.body.window, '7d');
  assert.ok(Array.isArray(res.body.metrics));
});

test('GET /metrics/kpis returns KPI list', async () => {
  const res = await request(app).get('/metrics/kpis').query({ window: '24h' });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body[0].kpi);
});

test('GET /metrics/kpis rejects bad window', async () => {
  const res = await request(app).get('/metrics/kpis').query({ window: 'bad-window' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.message || res.body.error, 'Validation failed');
});

test('POST /ingest/webhook/:source enforces validation', async () => {
  const res = await request(app)
    .post('/ingest/webhook/twitter')
    .send({ invalid: true });
  assert.equal(res.status, 400);
  assert.ok(res.body.error);
  assert.equal(res.body.error.message || res.body.error, 'Validation failed');
});

test('POST /ingest/webhook/:source accepts valid payload', async () => {
  const payload = {
    source: 'twitter',
    external_id: 'art-123',
    fetched_at: new Date().toISOString(),
    payload: { text: 'hello world' }
  };
  const res = await request(app)
    .post('/ingest/webhook/twitter')
    .send(payload);
  assert.equal(res.status, 202);
  assert.equal(res.body.message, 'Accepted for processing');
});

test('POST /alerts/test returns trigger results', async () => {
  const res = await request(app)
    .post('/alerts/test')
    .send({ rule_id: 'rule-1', payload: { foo: 'bar' } });
  assert.equal(res.status, 200);
  assert.ok(typeof res.body.triggered === 'boolean');
  assert.ok(Array.isArray(res.body.outputs));
});

test('POST /alerts/test rejects missing payload', async () => {
  const res = await request(app)
    .post('/alerts/test')
    .send({ rule_id: 'rule-1' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.message || res.body.error, 'Validation failed');
});

test('POST /exports/sac queues a job', async () => {
  const res = await request(app)
    .post('/exports/sac')
    .send({ destination: 's3://bucket/export', filters: { narrative_id: 'nar-global-ops' } });
  assert.equal(res.status, 202);
  assert.ok(res.body.job_id);
  assert.equal(res.body.status, 'queued');
});

test('POST /exports/sac enforces required fields', async () => {
  const res = await request(app)
    .post('/exports/sac')
    .send({ filters: {} });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.message || res.body.error, 'Validation failed');
});
