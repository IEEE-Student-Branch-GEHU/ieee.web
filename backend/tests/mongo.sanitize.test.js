const express = require('express');
const request = require('supertest');
const mongoSanitize = require('express-mongo-sanitize');

const createSanitizedApp = () => {
  const app = express();
  app.use(express.json());

  // Express 5 exposes req.query through a getter while express-mongo-sanitize
  // replaces the query object after sanitizing it.
  app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: req.query,
    });
    next();
  });
  app.use(mongoSanitize());

  app.post('/items/:id', (req, res) => {
    res.json({ body: req.body, query: req.query, id: req.params.id });
  });

  return app;
};

describe('global NoSQL input sanitation', () => {
  it('removes operator and dotted keys from JSON bodies and query strings', async () => {
    const response = await request(createSanitizedApp())
      .post('/items/507f1f77bcf86cd799439011')
      .query({ $where: 'true', 'filter.name': 'injected', safe: 'yes' })
      .send({
        $set: { title: 'Injected' },
        'title.value': 'Injected',
        nested: { $gt: '', 'safe.value': 'Injected', valid: 'kept' },
        safe: 'kept',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      body: { nested: { valid: 'kept' }, safe: 'kept' },
      query: { safe: 'yes' },
      id: '507f1f77bcf86cd799439011',
    });
  });

  it('preserves ordinary values and route parameters', async () => {
    const response = await request(createSanitizedApp())
      .post('/items/507f1f77bcf86cd799439012')
      .query({ page: '2', category: 'Workshop' })
      .send({ title: 'Workshop', date: '2026-01-01' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      body: { title: 'Workshop', date: '2026-01-01' },
      query: { page: '2', category: 'Workshop' },
      id: '507f1f77bcf86cd799439012',
    });
  });
});
