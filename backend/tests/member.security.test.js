const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const request = require('supertest');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const MEMBER_A_ID = '507f1f77bcf86cd799439011';
const MEMBER_B_ID = '507f1f77bcf86cd799439012';
const TEAM_A_ID = '507f1f77bcf86cd799439021';
const TEAM_B_ID = '507f1f77bcf86cd799439022';
const CERT_A_ID = '507f1f77bcf86cd799439031';
const CERT_B_ID = '507f1f77bcf86cd799439032';
const PASSWORD_A = 'member-password-long-enough';

const memberRecords = new Map();
const teamRecords = new Map();
const certificateRecords = new Map();
const mockMemberFindOne = jest.fn();
const mockMemberFindById = jest.fn();
const mockMemberFindOneAndUpdate = jest.fn();
const mockMemberFindByIdAndUpdate = jest.fn();
const mockTeamFindById = jest.fn();
const mockTeamFindOneAndUpdate = jest.fn();
const mockCertificateFind = jest.fn();
const mockCertificateFindOne = jest.fn();
const mockCertificateFindOneAndUpdate = jest.fn();
const mockCertificateFindById = jest.fn();
const mockCertificateCreate = jest.fn();
const mockCertificateDeleteOne = jest.fn();
const mockCloudinaryUrl = jest.fn((publicId) => `https://res.cloudinary.com/test/authenticated/${publicId}`);
const mockCloudinaryDestroy = jest.fn().mockResolvedValue({ result: 'ok' });

const createQuery = (value) => {
  const query = {
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  return query;
};

const findById = (records, id) => records.get(String(id)) || null;

jest.mock('../models/Member', () => ({
  findOne: (...args) => mockMemberFindOne(...args),
  findById: (...args) => mockMemberFindById(...args),
  findOneAndUpdate: (...args) => mockMemberFindOneAndUpdate(...args),
  findByIdAndUpdate: (...args) => mockMemberFindByIdAndUpdate(...args),
}));
jest.mock('../models/Team', () => ({
  findById: (...args) => mockTeamFindById(...args),
  findOneAndUpdate: (...args) => mockTeamFindOneAndUpdate(...args),
}));
jest.mock('../models/Certificate', () => ({
  find: (...args) => mockCertificateFind(...args),
  findOne: (...args) => mockCertificateFindOne(...args),
  findOneAndUpdate: (...args) => mockCertificateFindOneAndUpdate(...args),
  findById: (...args) => mockCertificateFindById(...args),
  create: (...args) => mockCertificateCreate(...args),
  deleteOne: (...args) => mockCertificateDeleteOne(...args),
}));
jest.mock('../config/cloudinary', () => ({
  storage: {
    _handleFile(req, file, callback) {
      file.stream.on('end', () => callback(null, {
        path: 'https://res.cloudinary.com/test/image/upload/member-a.png',
        public_id: 'ieee-website/member-a',
        resource_type: 'image',
      }));
      file.stream.resume();
    },
    _removeFile(req, file, callback) { callback(null); },
  },
  certificateStorage: {
    _handleFile(req, file, callback) {
      file.stream.on('end', () => callback(null, {
        public_id: 'ieee-website/certificates/member-a/certificate',
        resource_type: 'raw',
        format: 'pdf',
        bytes: 4,
      }));
      file.stream.resume();
    },
    _removeFile(req, file, callback) { callback(null); },
  },
  cloudinary: {
    url: (...args) => mockCloudinaryUrl(...args),
    uploader: { destroy: (...args) => mockCloudinaryDestroy(...args) },
  },
}));
jest.mock('express-rate-limit', () => () => (req, res, next) => next());

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'member-test-signing-secret-with-enough-length';

const memberRoutes = require('../routes/member');
const apiRoutes = require('../routes/api');
const adminAuth = require('../middleware/auth');
const { createMemberToken } = require('../services/member-auth');
const { hashActivationToken } = require('../services/member-auth');

const createMemberApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/member', memberRoutes);
  return app;
};

const createPublicApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRoutes);
  return app;
};

const createMember = (overrides = {}) => ({
  _id: MEMBER_A_ID,
  teamId: TEAM_A_ID,
  username: 'member.a',
  passwordHash: bcrypt.hashSync(PASSWORD_A, 4),
  status: 'active',
  tokenVersion: 0,
  ...overrides,
});

const createCertificate = (overrides = {}) => ({
  _id: CERT_A_ID,
  memberId: MEMBER_A_ID,
  teamId: TEAM_A_ID,
  title: 'Cloud fundamentals',
  issuer: 'IEEE GEHU',
  visibility: 'private',
  storage: { publicId: 'private/certificate-a', resourceType: 'raw' },
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  ...overrides,
});

beforeEach(() => {
  memberRecords.clear();
  teamRecords.clear();
  certificateRecords.clear();
  memberRecords.set(MEMBER_A_ID, createMember());
  memberRecords.set(MEMBER_B_ID, createMember({ _id: MEMBER_B_ID, teamId: TEAM_B_ID, username: 'member.b' }));
  teamRecords.set(TEAM_A_ID, { _id: TEAM_A_ID, name: 'Member A', role: 'Chair', category: 'executive', bio: 'A public profile' });
  teamRecords.set(TEAM_B_ID, { _id: TEAM_B_ID, name: 'Member B', role: 'Secretary', category: 'executive', bio: 'B public profile' });
  certificateRecords.set(CERT_A_ID, createCertificate());
  certificateRecords.set(CERT_B_ID, createCertificate({ _id: CERT_B_ID, memberId: MEMBER_B_ID, teamId: TEAM_B_ID, title: 'Private B certificate' }));

  mockMemberFindOne.mockImplementation((filter) => {
    if (filter.username) return [...memberRecords.values()].find(member => member.username === filter.username) || null;
    if (filter.activationTokenHash) return [...memberRecords.values()].find(member => (
      member.activationTokenHash === filter.activationTokenHash
      && member.status === filter.status
    )) || null;
    return null;
  });
  mockMemberFindById.mockImplementation((id) => Promise.resolve(findById(memberRecords, id)));
  mockMemberFindOneAndUpdate.mockImplementation((filter, update) => {
    const member = [...memberRecords.values()].find(candidate => (
      candidate.activationTokenHash === filter.activationTokenHash
      && candidate.status === filter.status
      && candidate.activationExpiresAt > filter.activationExpiresAt.$gt
    ));
    if (!member) return Promise.resolve(null);
    Object.assign(member, update.$set || {});
    for (const field of Object.keys(update.$unset || {})) delete member[field];
    return Promise.resolve(member);
  });
  mockMemberFindByIdAndUpdate.mockImplementation((id, update) => {
    const member = findById(memberRecords, id);
    if (member && update?.$inc?.tokenVersion) member.tokenVersion += update.$inc.tokenVersion;
    return Promise.resolve(member);
  });
  mockTeamFindById.mockImplementation((id) => Promise.resolve(findById(teamRecords, id)));
  mockTeamFindOneAndUpdate.mockImplementation((filter, update) => {
    const team = findById(teamRecords, filter._id);
    if (!team) return Promise.resolve(null);
    Object.assign(team, update.$set || update);
    return Promise.resolve(team);
  });
  mockCertificateFind.mockImplementation((filter) => createQuery([...certificateRecords.values()].filter(certificate => (
    (!filter.memberId || String(certificate.memberId) === String(filter.memberId))
      && String(certificate.teamId) === String(filter.teamId)
      && (!filter.visibility || certificate.visibility === filter.visibility)
  ))));
  mockCertificateFindOne.mockImplementation((filter) => createQuery([...certificateRecords.values()].find(certificate => (
    String(certificate._id) === String(filter._id)
      && String(certificate.memberId) === String(filter.memberId)
      && String(certificate.teamId) === String(filter.teamId)
  )) || null));
  mockCertificateFindOneAndUpdate.mockImplementation((filter, update) => {
    const certificate = [...certificateRecords.values()].find(item => (
      String(item._id) === String(filter._id)
      && String(item.memberId) === String(filter.memberId)
      && String(item.teamId) === String(filter.teamId)
    ));
    if (!certificate) return createQuery(null);
    Object.assign(certificate, update);
    return createQuery(certificate);
  });
  mockCertificateFindById.mockImplementation((id) => createQuery(findById(certificateRecords, id)));
  mockCertificateCreate.mockImplementation(async (record) => {
    const certificate = { _id: CERT_A_ID, createdAt: new Date(), ...record };
    certificateRecords.set(String(certificate._id), certificate);
    return certificate;
  });
  mockCertificateDeleteOne.mockImplementation(async (filter) => {
    certificateRecords.delete(String(filter._id));
    return { deletedCount: 1 };
  });
  mockCloudinaryUrl.mockClear();
  mockCloudinaryDestroy.mockClear();
  jest.clearAllMocks();
});

const authTokenFor = (member = memberRecords.get(MEMBER_A_ID)) => createMemberToken({
  memberId: member._id,
  teamId: member.teamId,
  tokenVersion: member.tokenVersion,
}, process.env.JWT_SECRET);

describe('member authentication and ownership boundaries', () => {
  it('requires authentication for member account endpoints', async () => {
    const response = await request(createMemberApp()).get('/api/member/me');
    expect(response.status).toBe(401);
    expect(mockTeamFindById).not.toHaveBeenCalled();
  });

  it('rejects an administrator-style token on member routes', async () => {
    const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const response = await request(createMemberApp()).get('/api/member/me').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it('logs in an active member without returning password data', async () => {
    const response = await request(createMemberApp())
      .post('/api/member/login')
      .send({ username: 'MEMBER.A', password: PASSWORD_A });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: expect.any(String) });
    const claims = jwt.verify(response.body.token, process.env.JWT_SECRET);
    expect(claims.purpose).toBe('member-access');
    expect(claims.sub).toBe(MEMBER_A_ID);
    expect(response.body.passwordHash).toBeUndefined();
  });

  it('activates only an administrator-provisioned, unexpired account', async () => {
    const activationToken = 'one-time-activation-secret';
    const pending = createMember({
      _id: '507f1f77bcf86cd799439099',
      teamId: TEAM_A_ID,
      username: 'pending.member',
      passwordHash: undefined,
      status: 'pending',
      activationTokenHash: hashActivationToken(activationToken),
      activationExpiresAt: new Date(Date.now() + 60_000),
    });
    memberRecords.set(pending._id, pending);

    const response = await request(createMemberApp()).post('/api/member/activate').send({
      token: activationToken,
      password: 'new-member-password-long',
    });

    expect(response.status).toBe(200);
    expect(pending.status).toBe('active');
    expect(pending.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(pending.activationTokenHash).toBeUndefined();
    expect(mockMemberFindOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        activationTokenHash: hashActivationToken(activationToken),
        status: 'pending',
        activationExpiresAt: { $gt: expect.any(Date) },
      }),
      expect.objectContaining({ $set: expect.objectContaining({ status: 'active' }), $unset: expect.any(Object) }),
      { new: true, runValidators: true },
    );
  });

  it('returns only the authenticated member profile from /me', async () => {
    const response = await request(createMemberApp()).get('/api/member/me')
      .set('Authorization', `Bearer ${authTokenFor()}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: MEMBER_A_ID,
      username: 'member.a',
      status: 'active',
      profile: {
        _id: TEAM_A_ID,
        name: 'Member A',
        role: 'Chair',
        category: 'executive',
        bio: 'A public profile',
      },
    });
  });

  it('updates only the authenticated member profile regardless of supplied IDs', async () => {
    const response = await request(createMemberApp()).patch('/api/member/profile')
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .send({ bio: 'Updated public bio' });

    expect(response.status).toBe(200);
    expect(mockTeamFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: TEAM_A_ID },
      { bio: 'Updated public bio' },
      { new: true, runValidators: true },
    );
    expect(teamRecords.get(TEAM_B_ID).bio).toBe('B public profile');

    const tampered = await request(createMemberApp()).patch('/api/member/profile')
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .send({ teamId: TEAM_B_ID, memberId: MEMBER_B_ID, ownerId: MEMBER_B_ID, bio: 'Should not apply' });
    expect(tampered.status).toBe(400);
    expect(teamRecords.get(TEAM_B_ID).bio).toBe('B public profile');

    const legacyIdAttempt = await request(createMemberApp()).patch(`/api/member/profile/${TEAM_B_ID}`)
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .send({ bio: 'Should not apply' });
    expect(legacyIdAttempt.status).toBe(404);
  });

  it('allows the authenticated member to upload a profile image without accepting an owner override', async () => {
    const response = await request(createMemberApp()).post('/api/member/profile/image')
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .attach('image', Buffer.from('safe test image'), 'profile.png');

    expect(response.status).toBe(200);
    expect(response.body.profile.image).toBe('https://res.cloudinary.com/test/image/upload/member-a.png');
    expect(mockTeamFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: TEAM_A_ID },
      { $set: { image: 'https://res.cloudinary.com/test/image/upload/member-a.png' } },
      { new: true, runValidators: true },
    );
    expect(teamRecords.get(TEAM_B_ID).image).toBeUndefined();
  });

  it('rejects unsafe profile image uploads before storage handling', async () => {
    const response = await request(createMemberApp()).post('/api/member/profile/image')
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .attach('image', Buffer.from('not an image'), 'profile.txt');

    expect(response.status).toBe(400);
    expect(mockTeamFindOneAndUpdate).not.toHaveBeenCalled();
  });

  it('lists only certificates owned by the authenticated member', async () => {
    const response = await request(createMemberApp()).get('/api/member/certificates')
      .set('Authorization', `Bearer ${authTokenFor()}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ _id: CERT_A_ID, title: 'Cloud fundamentals', visibility: 'private' });
    expect(response.body[0].storage).toBeUndefined();
    expect(response.body[0].downloadUrl).toContain('private/certificate-a');
    expect(mockCertificateFind).toHaveBeenCalledWith({ memberId: MEMBER_A_ID, teamId: TEAM_A_ID });
  });

  it.each(['get', 'patch', 'delete'])('cannot access member B certificate through a changed URL: %s', async (method) => {
    const req = request(createMemberApp())[method](`/api/member/certificates/${CERT_B_ID}`)
      .set('Authorization', `Bearer ${authTokenFor()}`);
    if (method === 'patch') req.send({ visibility: 'public' });
    const response = await req;
    expect(response.status).toBe(404);
    expect(certificateRecords.get(CERT_B_ID).visibility).toBe('private');
  });

  it('allows the owner to change visibility but never accepts an owner override', async () => {
    const response = await request(createMemberApp()).patch(`/api/member/certificates/${CERT_A_ID}`)
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .send({ visibility: 'public' });

    expect(response.status).toBe(200);
    expect(certificateRecords.get(CERT_A_ID).visibility).toBe('public');
    expect(mockCertificateFindOneAndUpdate).toHaveBeenCalledWith(
      { _id: CERT_A_ID, memberId: MEMBER_A_ID, teamId: TEAM_A_ID },
      { visibility: 'public' },
      { new: true, runValidators: true },
    );

    const tampered = await request(createMemberApp()).patch(`/api/member/certificates/${CERT_A_ID}`)
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .send({ memberId: MEMBER_B_ID, teamId: TEAM_B_ID, visibility: 'private' });
    expect(tampered.status).toBe(400);
    expect(certificateRecords.get(CERT_A_ID).visibility).toBe('public');
  });

  it('validates certificate upload types and stores no client-controlled owner', async () => {
    const invalid = await request(createMemberApp()).post('/api/member/certificates')
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .field('title', 'Not a certificate')
      .attach('certificate', Buffer.from('not allowed'), 'certificate.txt');
    expect(invalid.status).toBe(400);
    expect(mockCertificateCreate).not.toHaveBeenCalled();

    const uploaded = await request(createMemberApp()).post('/api/member/certificates')
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .field('title', 'New certificate')
      .field('visibility', 'private')
      .field('memberId', MEMBER_B_ID)
      .attach('certificate', Buffer.from('%PDF'), 'certificate.pdf');
    expect(uploaded.status).toBe(400);
    expect(mockCertificateCreate).not.toHaveBeenCalled();
    expect(mockCloudinaryDestroy).toHaveBeenCalledWith(
      'ieee-website/certificates/member-a/certificate',
      { resource_type: 'raw', type: 'authenticated' },
    );

    const valid = await request(createMemberApp()).post('/api/member/certificates')
      .set('Authorization', `Bearer ${authTokenFor()}`)
      .field('title', 'New certificate')
      .field('visibility', 'private')
      .attach('certificate', Buffer.from('%PDF'), 'certificate.pdf');
    expect(valid.status).toBe(201);
    expect(mockCertificateCreate).toHaveBeenCalledWith(expect.objectContaining({
      memberId: MEMBER_A_ID,
      teamId: TEAM_A_ID,
      title: 'New certificate',
      visibility: 'private',
    }));
  });

  it('invalidates the access token on logout', async () => {
    const token = authTokenFor();
    const response = await request(createMemberApp()).post('/api/member/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(memberRecords.get(MEMBER_A_ID).tokenVersion).toBe(1);

    const afterLogout = await request(createMemberApp()).get('/api/member/me').set('Authorization', `Bearer ${token}`);
    expect(afterLogout.status).toBe(401);
  });
});

describe('public certificate visibility and admin separation', () => {
  const originalReadyState = mongoose.connection.readyState;

  beforeEach(() => {
    mongoose.connection.readyState = 1;
  });

  afterAll(() => {
    mongoose.connection.readyState = originalReadyState;
  });

  it('returns only explicitly public certificate metadata to anonymous visitors', async () => {
    certificateRecords.get(CERT_A_ID).visibility = 'public';
    const response = await request(createPublicApp()).get(`/api/team/${TEAM_A_ID}/certificates`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([expect.objectContaining({
      _id: CERT_A_ID,
      title: 'Cloud fundamentals',
      visibility: 'public',
    })]);
    expect(response.body[0].memberId).toBeUndefined();
    expect(response.body[0].storage).toBeUndefined();
    expect(response.body[0].downloadUrl).toContain('private/certificate-a');
    expect(mockCertificateFind).toHaveBeenCalledWith({ teamId: TEAM_A_ID, visibility: 'public' });
  });

  it('rejects a member token at the administrator boundary', async () => {
    const app = express();
    app.get('/admin-only', rateLimit(), adminAuth, (req, res) => res.json({ ok: true }));
    const response = await request(app).get('/admin-only').set('Authorization', `Bearer ${authTokenFor()}`);
    expect(response.status).toBe(401);
  });
});
