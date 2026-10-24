const mongoose = require('mongoose');
const request = require('supertest');
const express = require('express');
const Event = require('../models/Event');
const apiRoutes = require('../routes/api');

const highlights = [
  { url: 'https://example.invalid/session.jpg', caption: 'Hands-on session' },
  { url: 'https://example.invalid/team.jpg', caption: '' },
];

describe('event gallery storage and public response', () => {
  afterEach(() => {
    mongoose.connection.readyState = 0;
    jest.restoreAllMocks();
  });

  it('keeps old records valid with an empty gallery and unchanged cover', () => {
    const event = Event.hydrate({ title: 'Old event', date: '2026-01-01', image: 'original.jpg' });
    expect(event.validateSync()).toBeUndefined();
    expect(event.toObject()).toMatchObject({ image: 'original.jpg', highlights: [] });
  });

  it('retains gallery order/captions through model serialization without photo IDs', () => {
    const event = new Event({ title: 'Workshop', date: '2026-01-01', image: 'cover.jpg', highlights });
    expect(event.validateSync()).toBeUndefined();
    const reloaded = Event.hydrate(JSON.parse(JSON.stringify(event)));
    expect(reloaded.toObject().highlights).toEqual(highlights);
    reloaded.highlights = [];
    expect(Event.hydrate(reloaded.toObject()).toObject()).toMatchObject({ image: 'cover.jpg', highlights: [] });
  });

  it('returns gallery data in the existing public pagination envelope', async () => {
    // Only the database transport is substituted; the model and route are real.
    const event = new Event({ title: 'Workshop', date: '2026-01-01', highlights });
    mongoose.connection.readyState = 1;
    jest.spyOn(Event, 'countDocuments').mockResolvedValue(1);
    const query = { sort: jest.fn().mockReturnThis(), skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([event]) };
    jest.spyOn(Event, 'find').mockReturnValue(query);
    const app = express();
    app.use('/api', apiRoutes);
    const response = await request(app).get('/api/events?page=1&limit=6');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ currentPage: 1, totalPages: 1, totalEvents: 1, events: [{ highlights }] });
    expect(response.body.events[0]._id).toBe(event.id);
  });
});
