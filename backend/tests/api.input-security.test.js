const express = require('express');
const request = require('supertest');
const mongoSanitize = require('express-mongo-sanitize');

jest.mock('../models/Event', () => ({}));
jest.mock('../models/Team', () => ({}));

const apiRoutes = require('../routes/api');

const createApp = ({ sanitize = true, queryOverride } = {}) => {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: queryOverride === undefined ? req.query : queryOverride,
    });
    next();
  });
  if (sanitize) {
    app.use(mongoSanitize());
  }
  app.use('/api', apiRoutes);
  return app;
};

describe('public events query input boundaries', () => {
  it.each([
    { search: { term: 'injected' } },
    { category: ['Workshop'] },
    { page: { value: '2' } },
    { limit: ['12'] },
  ])('rejects object and array query values: %j', async (query) => {
    const response = await request(createApp({ sanitize: false, queryOverride: query })).get('/api/events');

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/must be a string/);
  });

  it('safely removes operator query keys before the public route builds a query', async () => {
    const response = await request(createApp({ queryOverride: { $where: 'true', category: 'Workshop' } })).get('/api/events');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ events: [], totalPages: 0 });
  });

  it('preserves the existing empty disconnected response for valid string filters', async () => {
    const response = await request(createApp())
      .get('/api/events')
      .query({ page: '2', limit: '6', search: 'Workshop', category: 'Technical' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ events: [], totalPages: 0 });
  });
});
