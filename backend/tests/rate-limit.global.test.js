const express = require('express');
const request = require('supertest');
const { createGlobalLimiter, globalRateLimitOptions } = require('../config/rate-limit');

jest.setTimeout(30000);

const loadApp = () => {
  jest.resetModules();
  process.env.MONGODB_URI = 'pending';
  process.env.TRUST_PROXY_HOPS = '0';
  return require('../server');
};

describe('global API rate limiting', () => {
  it('preserves the configured production limits and headers', () => {
    expect(globalRateLimitOptions).toMatchObject({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });
    expect(globalRateLimitOptions.message).toEqual({
      message: 'Too many requests from this IP, please try again after 15 minutes',
    });
  });

  it('preserves CORS preflight handling before the API limiter', async () => {
    const app = loadApp();
    const response = await request(app)
      .options('/api/events')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers.ratelimit).toBeUndefined();
  });

  it('limits all /api requests and returns the configured JSON 429 response', async () => {
    const app = loadApp();
    const responses = await Promise.all(
      Array.from({ length: 100 }, () => request(app).get('/api/events')),
    );

    expect(responses.every(response => response.status === 200)).toBe(true);
    const blocked = await request(app).get('/api/events');
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      message: 'Too many requests from this IP, please try again after 15 minutes',
    });
    expect(blocked.headers['ratelimit-limit']).toBe('100');
    expect(blocked.headers['ratelimit-policy']).toBe('100;w=900');
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('does not let changing forwarded headers bypass the local trust boundary', async () => {
    const app = loadApp();

    const responses = await Promise.all(
      Array.from({ length: 100 }, (_, index) => request(app)
        .get('/api/events')
        .set('X-Forwarded-For', `198.51.100.${index + 1}`)),
    );
    for (const response of responses) {
      expect(response.status).toBe(200);
    }

    const blocked = await request(app)
      .get('/api/events')
      .set('X-Forwarded-For', '203.0.113.250');
    expect(blocked.status).toBe(429);
  });

  it('resets a limiter according to its configured window', async () => {
    const app = express();
    app.use('/api', createGlobalLimiter({ windowMs: 50, max: 1 }));
    app.get('/api/health', (req, res) => res.json({ ok: true }));

    expect((await request(app).get('/api/health')).status).toBe(200);
    expect((await request(app).get('/api/health')).status).toBe(429);
    await new Promise(resolve => setTimeout(resolve, 70));
    expect((await request(app).get('/api/health')).status).toBe(200);
  });
});
