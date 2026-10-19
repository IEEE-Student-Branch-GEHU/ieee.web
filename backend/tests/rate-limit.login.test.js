const request = require('supertest');

jest.setTimeout(30000);

const loadApp = () => {
  jest.resetModules();
  process.env.MONGODB_URI = 'pending';
  process.env.TRUST_PROXY_HOPS = '0';
process.env.JWT_SECRET = 'rate-limit-test-signing-secret-at-least-32-characters';
  return require('../server');
};

describe('admin login rate limiting', () => {
  it('allows five validation failures and blocks the sixth login attempt', async () => {
    const app = loadApp();
    const responses = [];

    for (let index = 0; index < 5; index += 1) {
      responses.push(await request(app).post('/api/admin/login').send({}));
    }

    expect(responses.every(response => response.status === 400)).toBe(true);
    const blocked = await request(app).post('/api/admin/login').send({});
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      message: 'Too many login attempts from this IP, please try again after an hour',
    });
    expect(blocked.headers['ratelimit-limit']).toBe('5');
    expect(blocked.headers['ratelimit-policy']).toBe('5;w=3600');
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('keeps unauthenticated protected API access separate from login credentials', async () => {
    const app = loadApp();
    const response = await request(app).get('/api/admin/stats');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'No token, authorization denied' });
  });
});
