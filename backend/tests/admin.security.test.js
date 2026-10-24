const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createAdminToken } = require('../services/admin-auth');

const mockAdminFindOne = jest.fn();
const mockEventSave = jest.fn();
const mockTeamSave = jest.fn();
const mockEventFindByIdAndUpdate = jest.fn();
const mockEventFindByIdAndDelete = jest.fn();
const mockTeamFindByIdAndUpdate = jest.fn();
const mockTeamFindByIdAndDelete = jest.fn();

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-signing-key-with-at-least-32-characters';

// Keep real multipart parsing; replace only the external Cloudinary transport.
jest.mock('../config/cloudinary', () => ({
  storage: {
    _handleFile(req, file, callback) {
      file.stream.on('end', () => callback(null, { path: 'https://res.cloudinary.com/test/image.png' }));
      file.stream.resume();
    },
    _removeFile(req, file, callback) { callback(null); },
  },
}));
// Validation cases must not share the production limiter's five-attempt budget.
jest.mock('express-rate-limit', () => () => (req, res, next) => next());
jest.mock('../models/Admin', () => ({ findOne: mockAdminFindOne }));
jest.mock('../models/Event', () => {
  const Event = function Event(data) {
    Object.assign(this, data);
    this.save = mockEventSave;
  };
  Event.findByIdAndUpdate = mockEventFindByIdAndUpdate;
  Event.findByIdAndDelete = mockEventFindByIdAndDelete;
  return Event;
});
jest.mock('../models/Team', () => {
  const Team = function Team(data) {
    Object.assign(this, data);
    this.save = mockTeamSave;
  };
  Team.findByIdAndUpdate = mockTeamFindByIdAndUpdate;
  Team.findByIdAndDelete = mockTeamFindByIdAndDelete;
  return Team;
});

const adminRoutes = require('../routes/admin');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

const jwtSecret = process.env.JWT_SECRET;
const token = createAdminToken({ username: 'admin' }, jwtSecret);
const authHeader = { Authorization: `Bearer ${token}` };

const resetMocks = () => {
  mockAdminFindOne.mockReset();
  mockEventSave.mockReset();
  mockTeamSave.mockReset();
  mockEventFindByIdAndUpdate.mockReset();
  mockEventFindByIdAndDelete.mockReset();
  mockTeamFindByIdAndUpdate.mockReset();
  mockTeamFindByIdAndDelete.mockReset();
};

describe('admin input security contracts', () => {
  beforeEach(() => {
    resetMocks();
    mockAdminFindOne.mockResolvedValue({ password: bcrypt.hashSync('password', 4) });
    mockEventSave.mockImplementation(function save() { return Promise.resolve(this); });
    mockTeamSave.mockImplementation(function save() { return Promise.resolve(this); });
    mockEventFindByIdAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', title: 'Updated' });
    mockEventFindByIdAndDelete.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
    mockTeamFindByIdAndUpdate.mockResolvedValue({ _id: '507f1f77bcf86cd799439012', name: 'Updated' });
    mockTeamFindByIdAndDelete.mockResolvedValue({ _id: '507f1f77bcf86cd799439012' });
  });

  it('accepts a normal valid login payload and returns a JWT', async () => {
    const response = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    const claims = jwt.verify(response.body.token, jwtSecret);
    expect(claims.username).toBe('admin');
    expect(claims.exp - claims.iat).toBe(3600);
    expect(mockAdminFindOne).toHaveBeenCalledWith({ username: 'admin' });
  });

  it.each([
    { username: { $ne: null }, password: 'password' },
    { username: ['admin'], password: 'password' },
    { username: null, password: 'password' },
    { username: 42, password: 'password' },
    { username: '', password: 'password' },
    { username: '   ', password: 'password' },
    { password: 'password' },
  ])('rejects malformed login username values: %j', async (payload) => {
    const response = await request(app).post('/api/admin/login').send(payload);

    expect(response.status).toBe(400);
    expect(mockAdminFindOne).not.toHaveBeenCalled();
  });

  it.each([{ $gt: '' }, ['password'], null, 42, '', '   '])('rejects malformed passwords: %j', async (password) => {
    const response = await request(app)
      .post('/api/admin/login')
      .send({ username: 'admin', password });

    expect(response.status).toBe(400);
    expect(mockAdminFindOne).not.toHaveBeenCalled();
  });

  it.each([
    { username: 'admin' },
    { username: 'admin', password: 'password', $where: 'true' },
    { 'username.value': 'admin', password: 'password' },
    { username: 'admin', password: 'password', role: 'admin' },
  ])('rejects incomplete or unsupported credentials: %j', async (payload) => {
    const response = await request(app).post('/api/admin/login').send(payload);
    expect(response.status).toBe(400);
    expect(mockAdminFindOne).not.toHaveBeenCalled();
  });

  it('preserves invalid-credential responses for string credentials', async () => {
    const response = await request(app).post('/api/admin/login').send({ username: 'admin', password: 'wrong-password' });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials' });
  });

  it('preserves valid event create and update behavior while allowlisting fields', async () => {
    const createResponse = await request(app)
      .post('/api/admin/events')
      .set(authHeader)
      .send({ title: 'Workshop', date: '2026-02-01', description: 'Details', category: 'Workshop' });

    expect(createResponse.status).toBe(201);
    expect(mockEventSave).toHaveBeenCalledTimes(1);
    expect(mockEventSave.mock.instances[0]).toMatchObject({ title: 'Workshop', date: '2026-02-01', category: 'Workshop' });

    const updateResponse = await request(app)
      .put('/api/admin/events/507f1f77bcf86cd799439011')
      .set(authHeader)
      .send({ title: 'Updated workshop', createdAt: 'attacker-value', _id: 'other-id', id: 'other-id', __v: 99 });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body._id).toBe('507f1f77bcf86cd799439011');
    expect(mockEventFindByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      { title: 'Updated workshop' },
      { new: true, runValidators: true },
    );
  });

  describe('event highlights', () => {
    const id = '507f1f77bcf86cd799439011';
    const highlights = [
      { url: 'https://res.cloudinary.com/test/first.jpg', caption: 'Opening session' },
      { url: 'https://res.cloudinary.com/test/second.jpg' },
    ];

    it('creates an event with ordered highlights separately from its cover', async () => {
      const payload = { title: 'Workshop', date: '2026-02-01', image: 'cover.jpg', highlights };
      const response = await request(app).post('/api/admin/events').set(authHeader).send(payload);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(payload);
      expect(mockEventSave.mock.instances[0].highlights).toEqual(highlights);
    });

    it('replaces, reorders, and clears a gallery on the selected event only', async () => {
      for (const gallery of [[...highlights].reverse(), [highlights[1]], []]) {
        const response = await request(app).put(`/api/admin/events/${id}`).set(authHeader).send({ highlights: gallery });
        expect(response.status).toBe(200);
        expect(mockEventFindByIdAndUpdate).toHaveBeenLastCalledWith(
          id, { highlights: gallery }, { new: true, runValidators: true },
        );
      }
    });

    it('does not overwrite a gallery or cover when an unrelated field is updated', async () => {
      await request(app).put(`/api/admin/events/${id}`).set(authHeader).send({ title: 'Renamed' });
      expect(mockEventFindByIdAndUpdate).toHaveBeenCalledWith(id, { title: 'Renamed' }, { new: true, runValidators: true });
    });

    it.each([
      null, 'photo.jpg', {}, [null], [[]], ['https://example.invalid/photo.jpg'], [{}],
      [{ url: 42 }], [{ url: { $gt: '' } }], [{ url: '' }], [{ url: '/photo.jpg' }],
      [{ url: 'javascript:alert(1)' }], [{ url: 'data:image/png;base64,abc' }],
      [{ url: 'https://user:password@example.invalid/photo.jpg' }],
      [{ url: 'https://example.invalid/photo.jpg', caption: { $ne: null } }],
      [{ url: 'https://example.invalid/photo.jpg', caption: ['bad'] }],
      [{ url: 'https://example.invalid/photo.jpg', caption: 'x'.repeat(301) }],
      [{ url: `https://example.invalid/${'x'.repeat(2048)}` }],
      [{ url: 'https://example.invalid/photo.jpg', unknown: true }],
      [{ url: 'https://example.invalid/photo.jpg', 'caption.value': 'bad' }],
      [{ $set: { url: 'https://example.invalid/photo.jpg' } }],
      Array.from({ length: 51 }, () => ({ url: 'https://example.invalid/photo.jpg' })),
    ])('rejects invalid highlight data before create/update database access (case %#)', async (gallery) => {
      const create = await request(app).post('/api/admin/events').set(authHeader)
        .send({ title: 'Workshop', date: '2026-02-01', highlights: gallery });
      const update = await request(app).put(`/api/admin/events/${id}`).set(authHeader).send({ highlights: gallery });
      expect(create.status).toBe(400);
      expect(update.status).toBe(400);
      expect(mockEventSave).not.toHaveBeenCalled();
      expect(mockEventFindByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  it.each([
    { $set: { title: 'Injected' } },
    { $where: 'this.title = "Injected"' },
    { title: { $gt: '' } },
    { 'title.value': 'Injected' },
    { title: 'Valid', unknownField: 'Injected' },
  ])('rejects event update injection or unsupported fields: %j', async (payload) => {
    const response = await request(app)
      .put('/api/admin/events/507f1f77bcf86cd799439011')
      .set(authHeader)
      .send(payload);

    expect(response.status).toBe(400);
    expect(mockEventFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('preserves valid team create/update/delete behavior with nested socials', async () => {
    const createResponse = await request(app)
      .post('/api/admin/team')
      .set(authHeader)
      .send({ name: 'Member', role: 'Chair', category: 'executive', year: '2025-2026', socials: { linkedin: 'https://linkedin.example' } });

    expect(createResponse.status).toBe(201);
    expect(mockTeamSave.mock.instances[0]).toMatchObject({ name: 'Member', category: 'executive' });

    const updateResponse = await request(app)
      .put('/api/admin/team/507f1f77bcf86cd799439012')
      .set(authHeader)
      .send({ name: 'Updated Member', socials: { instagram: 'https://instagram.example' }, bio: 'not persisted', _id: 'other-id', id: 'other-id', __v: 99, createdAt: 'attacker-value' });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body._id).toBe('507f1f77bcf86cd799439012');
    expect(mockTeamFindByIdAndUpdate).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439012',
      { name: 'Updated Member', bio: 'not persisted', socials: { instagram: 'https://instagram.example' } },
      { new: true, runValidators: true },
    );

    const deleteResponse = await request(app)
      .delete('/api/admin/team/507f1f77bcf86cd799439012')
      .set(authHeader);

    expect(deleteResponse.status).toBe(200);
    expect(mockTeamFindByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
  });

  it('normalizes legacy Vite team form fields and preserves public profile fields', async () => {
    const response = await request(app).post('/api/admin/team').set(authHeader).send({
      name: 'Member', role: 'Chair', category: 'executive', year: '2025-2026', bio: 'Legacy biography',
      linkedin: 'https://linkedin.example', instagram: 'https://instagram.example',
      socials: { github: 'https://github.example', twitter: 'https://twitter.example' }, order: 2,
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      name: 'Member', role: 'Chair', category: 'executive', year: '2025-2026', bio: 'Legacy biography', order: 2,
      socials: {
        linkedin: 'https://linkedin.example', instagram: 'https://instagram.example',
        github: 'https://github.example', twitter: 'https://twitter.example',
      },
    });
  });

  it.each([
    { name: 'Member', role: 'Chair', category: 'executive' },
    { name: 'Member', role: 'Chair', category: 'executive', year: '2025-26' },
    { name: 'Member', role: 'Chair', category: 'executive', year: '2025/2026' },
  ])('rejects a team create without a valid full academic year: %j', async (payload) => {
    const response = await request(app).post('/api/admin/team').set(authHeader).send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/year/);
    expect(mockTeamSave).not.toHaveBeenCalled();
  });

  describe.each([
    { resource: 'events', id: '507f1f77bcf86cd799439011', payload: { title: 'Event', date: '2026-01-01' }, save: mockEventSave, update: mockEventFindByIdAndUpdate, remove: mockEventFindByIdAndDelete, deletedMessage: 'Event deleted' },
    { resource: 'team', id: '507f1f77bcf86cd799439012', payload: { name: 'Member', role: 'Chair', category: 'executive', year: '2025-2026' }, save: mockTeamSave, update: mockTeamFindByIdAndUpdate, remove: mockTeamFindByIdAndDelete, deletedMessage: 'Member deleted' },
  ])('$resource route boundaries', ({ resource, id, payload, save, update, remove, deletedMessage }) => {
    it.each(['not-an-id', '123', '123456789012', '507f1f77bcf86cd79943901!', '{"$ne":null}'])('rejects invalid update/delete IDs before database access: %s', async (invalidId) => {
      for (const method of ['put', 'delete']) {
        const response = await request(app)[method](`/api/admin/${resource}/${encodeURIComponent(invalidId)}`).set(authHeader).send(payload);
        expect(response.status).toBe(400);
      }
      expect(update).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    });

    it('returns 404 for an absent identifier route', async () => {
      const response = await request(app).put(`/api/admin/${resource}/`).set(authHeader).send(payload);
      expect(response.status).toBe(404);
      expect(update).not.toHaveBeenCalled();
    });

    it.each([
      { $set: { image: 'injected' } }, { $where: 'true' }, { $gt: '' },
      { 'image.value': 'injected' }, { image: { $ne: null } }, { image: ['injected'] },
      { image: null }, { unknown: 'injected' },
    ])('rejects unsafe create and update payloads: %j', async (unsafe) => {
      const create = await request(app).post(`/api/admin/${resource}`).set(authHeader).send({ ...payload, ...unsafe });
      const edit = await request(app).put(`/api/admin/${resource}/${id}`).set(authHeader).send({ ...payload, ...unsafe });
      expect(create.status).toBe(400);
      expect(edit.status).toBe(400);
      expect(save).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it.each(['null', '[]', '"body"', '42'])('rejects non-object JSON bodies: %s', async (body) => {
      const response = await request(app).post(`/api/admin/${resource}`).set(authHeader).set('Content-Type', 'application/json').send(body);
      expect(response.status).toBe(400);
      expect(save).not.toHaveBeenCalled();
    });

    it('rejects empty create and update bodies', async () => {
      const create = await request(app).post(`/api/admin/${resource}`).set(authHeader).send({});
      const edit = await request(app).put(`/api/admin/${resource}/${id}`).set(authHeader).send({});
      expect(create.status).toBe(400);
      expect(edit.status).toBe(400);
      expect(save).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it('discards managed fields on creation', async () => {
      const response = await request(app).post(`/api/admin/${resource}`).set(authHeader).send({ ...payload, _id: 'other-id', id: 'other-id', __v: 99, createdAt: 'attacker-value' });
      expect(response.status).toBe(201);
      expect(response.body).toEqual(payload);
    });

    it('preserves successful deletion', async () => {
      const response = await request(app).delete(`/api/admin/${resource}/${id}`).set(authHeader);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: deletedMessage });
      expect(remove).toHaveBeenCalledWith(id);
    });

    it('returns 404 for valid IDs with no matching document', async () => {
      update.mockResolvedValue(null);
      remove.mockResolvedValue(null);
      const edit = await request(app).put(`/api/admin/${resource}/${id}`).set(authHeader).send(payload);
      const deletion = await request(app).delete(`/api/admin/${resource}/${id}`).set(authHeader);
      expect(edit.status).toBe(404);
      expect(deletion.status).toBe(404);
    });
  });

  it.each([
    { socials: { linkedin: { $ne: null } } }, { socials: { 'linkedin.url': 'injected' } },
    { socials: { website: 'unsupported' } }, { socials: [] }, { socials: null },
    { socials: { linkedin: [] } }, { order: { $gt: 0 } }, { order: '2' }, { order: null },
    { linkedin: { $ne: null } }, { instagram: ['injected'] },
  ])('rejects malformed nested or legacy team fields: %j', async (unsafe) => {
    const payload = { name: 'Member', role: 'Chair', category: 'executive', ...unsafe };
    const create = await request(app).post('/api/admin/team').set(authHeader).send(payload);
    const edit = await request(app).put('/api/admin/team/507f1f77bcf86cd799439012').set(authHeader).send(payload);
    expect(create.status).toBe(400);
    expect(edit.status).toBe(400);
    expect(mockTeamSave).not.toHaveBeenCalled();
    expect(mockTeamFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('preserves the authenticated multipart image upload contract', async () => {
    const response = await request(app).post('/api/admin/upload').set(authHeader).attach('image', Buffer.from('test image'), 'image.png');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ url: 'https://res.cloudinary.com/test/image.png' });
  });

  it('returns 400 when an authenticated upload has no image', async () => {
    const response = await request(app).post('/api/admin/upload').set(authHeader);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'No file uploaded' });
  });

  it.each([
    ['get', '/stats'], ['post', '/upload'], ['post', '/events'],
    ['put', '/events/507f1f77bcf86cd799439011'], ['delete', '/events/507f1f77bcf86cd799439011'],
    ['post', '/team'], ['put', '/team/507f1f77bcf86cd799439012'], ['delete', '/team/507f1f77bcf86cd799439012'],
  ])('requires a valid JWT for %s %s', async (method, path) => {
    const expiredToken = createAdminToken({ username: 'admin' }, jwtSecret, { expiresIn: -1 });
    for (const authorization of [null, 'Bearer invalid', `Bearer ${expiredToken}`]) {
      const req = request(app)[method](`/api/admin${path}`);
      if (authorization) req.set('Authorization', authorization);
      const response = await req;
      expect(response.status).toBe(401);
    }
    expect(mockEventSave).not.toHaveBeenCalled();
    expect(mockTeamSave).not.toHaveBeenCalled();
    expect(mockEventFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(mockTeamFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(mockEventFindByIdAndDelete).not.toHaveBeenCalled();
    expect(mockTeamFindByIdAndDelete).not.toHaveBeenCalled();
  });

  it.each([
    { $set: { name: 'Injected' } },
    { $where: 'true' },
    { socials: { $gt: '' } },
    { 'socials.linkedin': 'Injected' },
    { name: 'Valid', password: 'Injected' },
  ])('rejects team update injection or unsupported fields: %j', async (payload) => {
    const response = await request(app)
      .put('/api/admin/team/507f1f77bcf86cd799439012')
      .set(authHeader)
      .send(payload);

    expect(response.status).toBe(400);
    expect(mockTeamFindByIdAndUpdate).not.toHaveBeenCalled();
  });

  it('rejects invalid and missing JWTs before any protected operation', async () => {
    const missing = await request(app).post('/api/admin/events').send({ title: 'Event', date: '2026-01-01' });
    const invalid = await request(app).post('/api/admin/team').set('Authorization', 'Bearer invalid').send({ name: 'Member', role: 'Chair', category: 'executive' });

    expect(missing.status).toBe(401);
    expect(invalid.status).toBe(401);
    expect(mockEventSave).not.toHaveBeenCalled();
    expect(mockTeamSave).not.toHaveBeenCalled();
  });

  it('rejects a signed token without the administrator issuer, audience, and purpose', async () => {
    const legacyToken = jwt.sign({ username: 'admin' }, jwtSecret, { expiresIn: '1h' });
    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${legacyToken}`);

    expect(response.status).toBe(401);
  });
});
