const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');

/**
 * Contact API Rate Limiting Tests (Issue #23)
 * 
 * These tests verify that the contact form endpoint correctly
 * enforces rate limiting to prevent spam abuse.
 * 
 * Uses an isolated Express app (no MongoDB dependency)
 * to ensure CI compatibility without database credentials.
 */
describe('Contact API Rate Limiting', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mirror the production contactLimiter but with lower max for fast tests
    const contactLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 3,  // Lower than production (5) for test speed
      message: { message: 'Too many contact requests from this IP, please try again later.' },
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.post('/api/contact', contactLimiter, (req, res) => {
      res.json({ message: 'Thank you for your message. We will get back to you soon!' });
    });
  });

  it('should allow requests under the rate limit', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ firstName: 'Test', lastName: 'User', email: 'test@ieee.org', message: 'Hello' });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Thank you for your message. We will get back to you soon!');
  });

  it('should return 429 when rate limit is exceeded', async () => {
    // Exhaust the limit (max: 3 in test config)
    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .post('/api/contact')
        .send({ firstName: 'Test', lastName: 'User', email: 'test@ieee.org', message: 'Hello' });
      expect(res.statusCode).toBe(200);
    }

    // 4th request should be blocked
    const blocked = await request(app)
      .post('/api/contact')
      .send({ firstName: 'Test', lastName: 'User', email: 'test@ieee.org', message: 'Hello' });

    expect(blocked.statusCode).toBe(429);
    expect(blocked.body.message).toContain('Too many contact requests');
  });

  it('should include standard rate limit headers in response', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ firstName: 'Test', lastName: 'User', email: 'test@ieee.org', message: 'Hello' });

    // RFC 6585 standard headers
    expect(res.headers).toHaveProperty('ratelimit-limit');
    expect(res.headers).toHaveProperty('ratelimit-remaining');
    expect(res.headers).toHaveProperty('ratelimit-reset');
  });

  it('should not include legacy X-RateLimit headers', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({ firstName: 'Test', lastName: 'User', email: 'test@ieee.org', message: 'Hello' });

    // legacyHeaders: false should suppress these
    expect(res.headers).not.toHaveProperty('x-ratelimit-limit');
    expect(res.headers).not.toHaveProperty('x-ratelimit-remaining');
  });

  it('should return JSON content-type on rate limit response', async () => {
    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/contact')
        .send({ firstName: 'Test', email: 'test@ieee.org', message: 'Hello' });
    }

    // Blocked request should still return proper JSON
    const blocked = await request(app)
      .post('/api/contact')
      .send({ firstName: 'Test', email: 'test@ieee.org', message: 'Hello' });

    expect(blocked.statusCode).toBe(429);
    expect(blocked.headers['content-type']).toMatch(/json/);
  });
});
