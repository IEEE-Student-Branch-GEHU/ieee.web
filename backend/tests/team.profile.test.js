const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

const mockTeamFind = jest.fn();
const mockTeamFindById = jest.fn();
const mockTeamDistinct = jest.fn();
const mockCertificateFind = jest.fn();

jest.mock('../models/Team', () => ({
  find: mockTeamFind,
  findById: mockTeamFindById,
  distinct: mockTeamDistinct,
}));
jest.mock('../models/Certificate', () => ({
  find: mockCertificateFind,
}));

const apiRoutes = require('../routes/api');
const {
  PUBLIC_TEAM_PROJECTION,
  TEAM_LIST_PROJECTION,
  serializePublicTeamMember,
} = require('../validation/team-public');
const {
  RequestValidationError,
  sanitizeTeam,
} = require('../routes/admin.validation');

const validId = '507f1f77bcf86cd799439011';
const createQuery = (value) => {
  const query = {
    sort: jest.fn().mockReturnThis(),
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  return query;
};

const createApp = ({ queryOverride } = {}) => {
  const app = express();
  app.use(express.json());
  if (queryOverride !== undefined) {
    app.use((req, res, next) => {
      Object.defineProperty(req, 'query', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: queryOverride,
      });
      next();
    });
  }
  app.use('/api', apiRoutes);
  return app;
};

const originalReadyState = mongoose.connection.readyState;

beforeEach(() => {
  mongoose.connection.readyState = 1;
  mockTeamFind.mockReset();
  mockTeamFindById.mockReset();
  mockTeamDistinct.mockReset();
  mockCertificateFind.mockReset();
});

afterAll(() => {
  mongoose.connection.readyState = originalReadyState;
});

describe('public team serializer', () => {
  it('returns only approved public fields and known safe links', () => {
    const member = {
      _id: validId,
      name: 'Member',
      role: 'Chair',
      category: 'executive',
      image: 'https://cdn.example/member.jpg',
      socials: {
        linkedin: 'https://linkedin.example/member',
        github: 'https://user:password@github.example/member',
        website: 'https://private.example/member',
      },
      bio: 'A public biography',
      committee: 'Executive Committee',
      academicYear: 'Third Year',
      branch: 'Computer Science',
      skills: ['Leadership', 'Web development'],
      interests: ['Open source'],
      achievements: ['Won a public award'],
      year: '2025-2026',
      isLead: true,
      rank: 1,
      email: 'private@example.test',
      phone: '+1-555-0100',
      password: 'private',
      createdAt: new Date(),
      __v: 4,
      order: 99,
    };

    expect(serializePublicTeamMember(member)).toEqual({
      _id: validId,
      name: 'Member',
      role: 'Chair',
      category: 'executive',
      image: 'https://cdn.example/member.jpg',
      socials: { linkedin: 'https://linkedin.example/member' },
      bio: 'A public biography',
      committee: 'Executive Committee',
      academicYear: 'Third Year',
      branch: 'Computer Science',
      skills: ['Leadership', 'Web development'],
      interests: ['Open source'],
      achievements: ['Won a public award'],
      year: '2025-2026',
      isLead: true,
      rank: 1,
    });
  });
});

describe('public team routes', () => {
  it('keeps the list response as an array and applies the public projection', async () => {
    const query = createQuery([{
      _id: validId,
      name: 'Member',
      role: 'Chair',
      category: 'executive',
      email: 'private@example.test',
      phone: '+1-555-0100',
      year: '2025-2026',
    }]);
    mockTeamFind.mockReturnValue(query);

    const response = await request(createApp()).get('/api/team');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      _id: validId,
      name: 'Member',
      role: 'Chair',
      category: 'executive',
      year: '2025-2026',
    }]);
    expect(mockTeamFind).toHaveBeenCalledWith({}, TEAM_LIST_PROJECTION);
    expect(query.sort).toHaveBeenCalledWith({ rank: 1, name: 1, order: 1 });
  });

  it('sorts ranked members by rank then name and keeps legacy order fallback', async () => {
    const query = createQuery([
      { _id: '507f1f77bcf86cd799439015', name: 'Legacy B', role: 'Member', category: 'executive', order: 2 },
      { _id: '507f1f77bcf86cd799439020', name: 'Rank 0', role: 'Member', category: 'executive', rank: 0 },
      { _id: '507f1f77bcf86cd799439016', name: 'Rank 2', role: 'Member', category: 'executive', rank: 2 },
      { _id: '507f1f77bcf86cd799439017', name: 'Rank 1 B', role: 'Member', category: 'executive', rank: 1 },
      { _id: '507f1f77bcf86cd799439018', name: 'Rank 1 A', role: 'Member', category: 'executive', rank: 1 },
      { _id: '507f1f77bcf86cd799439019', name: 'Legacy A', role: 'Member', category: 'executive', order: 1 },
    ]);
    mockTeamFind.mockReturnValue(query);

    const response = await request(createApp()).get('/api/team');

    expect(response.body.map((member) => member.name)).toEqual([
      'Rank 0', 'Rank 1 A', 'Rank 1 B', 'Rank 2', 'Legacy A', 'Legacy B',
    ]);
  });

  it('filters by exact year and category without constructing unsafe query operators', async () => {
    const query = createQuery([]);
    mockTeamFind.mockReturnValue(query);

    const response = await request(createApp()).get('/api/team').query({
      year: '2025-2026',
      category: 'executive',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(mockTeamFind).toHaveBeenCalledWith(
      { year: '2025-2026', category: 'executive' },
      TEAM_LIST_PROJECTION,
    );
  });

  it.each([
    { query: { year: { $ne: null } } },
    { query: { category: ['executive'] } },
    { query: { year: '2025/2026' } },
    { query: { $where: 'true' } },
    { query: { unknown: 'value' } },
  ])('rejects unsafe or unsupported team filters before database access: %j', async ({ query }) => {
    const response = await request(createApp({ queryOverride: query })).get('/api/team');

    expect(response.status).toBe(400);
    expect(mockTeamFind).not.toHaveBeenCalled();
  });

  it('returns distinct available years in descending order with category filtering', async () => {
    mockTeamDistinct.mockResolvedValue(['2024-2025', '2026-2027', '2025-2026', '2026-2027']);

    const response = await request(createApp()).get('/api/team/years').query({ category: 'executive' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(['2026-2027', '2025-2026', '2024-2025']);
    expect(mockTeamDistinct).toHaveBeenCalledWith('year', { category: 'executive' });
  });

  it('rejects an invalid detail ID before touching the model', async () => {
    const response = await request(createApp()).get('/api/team/not-an-object-id');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid team member ID' });
    expect(mockTeamFindById).not.toHaveBeenCalled();
  });

  it('returns a projected public detail document for an existing Mongo ID', async () => {
    mockTeamFindById.mockResolvedValue({
      _id: validId,
      name: 'Member',
      role: 'Chair',
      category: 'executive',
      email: 'private@example.test',
    });

    const response = await request(createApp()).get(`/api/team/${validId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: validId,
      name: 'Member',
      role: 'Chair',
      category: 'executive',
    });
    expect(mockTeamFindById).toHaveBeenCalledWith(validId, PUBLIC_TEAM_PROJECTION);
  });

  it('returns 404 for a valid but missing detail document', async () => {
    mockTeamFindById.mockResolvedValue(null);

    const response = await request(createApp()).get(`/api/team/${validId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Team member not found' });
  });

  it('returns 503 for detail requests while the database is unavailable', async () => {
    mongoose.connection.readyState = 0;

    const response = await request(createApp()).get(`/api/team/${validId}`);

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ message: 'Team service unavailable' });
    expect(mockTeamFindById).not.toHaveBeenCalled();
  });

  it('returns a safe generic error when the detail lookup fails', async () => {
    mockTeamFindById.mockRejectedValue(new Error('database credentials leaked'));

    const response = await request(createApp()).get(`/api/team/${validId}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Unable to fetch team member' });
  });

  it('returns a safe generic error when the public list lookup fails', async () => {
    const query = createQuery(Promise.reject(new Error('database credentials leaked')));
    mockTeamFind.mockReturnValue(query);

    const response = await request(createApp()).get('/api/team');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Unable to fetch team members' });
  });

  it('returns a safe generic error when years lookup fails', async () => {
    mockTeamDistinct.mockRejectedValue(new Error('database credentials leaked'));

    const response = await request(createApp()).get('/api/team/years');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Unable to fetch team years' });
  });

  it('does not expose public certificates for a deleted team member', async () => {
    mockTeamFindById.mockResolvedValue(null);

    const response = await request(createApp()).get(`/api/team/${validId}/certificates`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Team member not found' });
    expect(mockCertificateFind).not.toHaveBeenCalled();
  });
});

describe('admin team validation', () => {
  const base = { name: 'Member', role: 'Chair', category: 'executive' };

  it('preserves legacy top-level socials while accepting new public profile fields', () => {
    expect(sanitizeTeam({
      ...base,
      bio: 'Public biography',
      committee: 'Executive Committee',
      academicYear: 'Third Year',
      branch: 'Computer Science',
      skills: ['Leadership'],
      interests: ['Open source'],
      achievements: ['Public award'],
      year: '2025-2026',
      isLead: true,
      rank: 2,
      linkedin: 'https://linkedin.example/member',
      instagram: 'https://instagram.example/member',
    })).toEqual({
      ...base,
      bio: 'Public biography',
      committee: 'Executive Committee',
      academicYear: 'Third Year',
      branch: 'Computer Science',
      skills: ['Leadership'],
      interests: ['Open source'],
      achievements: ['Public award'],
      year: '2025-2026',
      isLead: true,
      rank: 2,
      socials: {
        linkedin: 'https://linkedin.example/member',
        instagram: 'https://instagram.example/member',
      },
    });
  });

  it.each([
    { image: 'https://user:password@example.test/image.jpg' },
    { socials: { linkedin: 'javascript:alert(1)' } },
    { socials: { github: 'https://user:password@example.test/profile' } },
    { year: '2025/2026' },
    { isLead: 'true' },
    { rank: '1' },
    { skills: ['x'.repeat(121)] },
    { interests: Array.from({ length: 21 }, () => 'interest') },
    { bio: 'x'.repeat(2001) },
    { branch: 'x'.repeat(121) },
    { email: 'private@example.test' },
    { phone: '+1-555-0100' },
  ])('rejects unsafe or unsupported profile data: %j', (extra) => {
    expect(() => sanitizeTeam({ ...base, ...extra })).toThrow(RequestValidationError);
  });

  it('does not require year on legacy records', () => {
    expect(sanitizeTeam(base, { partial: true })).toEqual(base);
  });

  it('requires a full academic year when creating a team record', () => {
    expect(() => sanitizeTeam(base)).toThrow('year is required');
  });
});
