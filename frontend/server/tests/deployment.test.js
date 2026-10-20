const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getEnvironmentConfig } = require('../config/environment');

jest.setTimeout(30000);

const productionEnv = {
  NODE_ENV: 'production',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/deployment-test',
  JWT_SECRET: 'deployment-signing-key-with-at-least-32-characters',
  FRONTEND_URL: 'https://ieee-web-seven.vercel.app',
  CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: 'test-key',
  CLOUDINARY_API_SECRET: 'test-secret',
  TRUST_PROXY_HOPS: '1',
  PORT: '5000',
};
const originalEnv = { ...process.env };

const loadApp = (overrides = {}) => {
  jest.resetModules();
  process.env = { ...originalEnv, ...productionEnv, ...overrides };
  jest.doMock('dotenv', () => ({ config: jest.fn() }));
  return require('../server');
};

afterEach(() => {
  process.env = { ...originalEnv };
  jest.restoreAllMocks();
});

describe('deployment startup and readiness', () => {
  it.each(['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'])(
    'fails safely when production %s is missing', (key) => {
      expect(() => getEnvironmentConfig({ ...productionEnv, [key]: '' })).toThrow(key);
    },
  );

  it('does not silently accept the old manifest MONGO_URI name', () => {
    expect(() => getEnvironmentConfig({ ...productionEnv, MONGODB_URI: '', MONGO_URI: productionEnv.MONGODB_URI })).toThrow('MONGODB_URI');
  });

  it.each(['ieee_secret_key', 'ieee_secret_key_change_me', 'short', 'replace-with-a-random-secret-of-at-least-32-characters'])(
    'rejects insecure or placeholder signing keys', (secret) => {
      expect(() => getEnvironmentConfig({ ...productionEnv, JWT_SECRET: secret })).toThrow('JWT_SECRET');
    },
  );

  it.each(['https://example.invalid/path', 'https://example.invalid?query=yes', '*', 'http://example.invalid'])(
    'rejects invalid production frontend origins', (origin) => {
      expect(() => getEnvironmentConfig({ ...productionEnv, FRONTEND_URL: origin })).toThrow('FRONTEND_URL');
    },
  );

  it.each(['-1', 'true', '1.5', 'invalid'])(
    'rejects an invalid trusted proxy configuration', (hops) => {
      expect(() => getEnvironmentConfig({ ...productionEnv, TRUST_PROXY_HOPS: hops })).toThrow('TRUST_PROXY_HOPS');
    },
  );

  it('does not connect or seed accounts merely by importing the app', () => {
    jest.resetModules();
    const mongoose = require('mongoose');
    const connect = jest.spyOn(mongoose, 'connect').mockResolvedValue(mongoose);
    process.env = { ...originalEnv, ...productionEnv };
    jest.doMock('dotenv', () => ({ config: jest.fn() }));
    require('../server');
    expect(connect).not.toHaveBeenCalled();
  });

  it('waits for MongoDB before listening and does not initialize an admin', async () => {
    const app = loadApp();
    const mongoose = require('mongoose');
    const Admin = require('../models/Admin');
    const create = jest.spyOn(Admin, 'create');
    const count = jest.spyOn(Admin, 'countDocuments');
    let finishConnection;
    jest.spyOn(mongoose, 'connect').mockImplementation(() => new Promise(resolve => { finishConnection = resolve; }));
    const listen = jest.spyOn(app, 'listen').mockImplementation((port, host, callback) => {
      queueMicrotask(callback);
      return { once: jest.fn() };
    });
    const starting = app.startServer();
    expect(listen).not.toHaveBeenCalled();
    finishConnection();
    await starting;
    expect(listen).toHaveBeenCalledWith(5000, '0.0.0.0', expect.any(Function));
    expect(create).not.toHaveBeenCalled();
    expect(count).not.toHaveBeenCalled();
  });

  it('rejects database connection failure without opening a listener or exposing the URI', async () => {
    const app = loadApp();
    const mongoose = require('mongoose');
    jest.spyOn(mongoose, 'connect').mockRejectedValue(new Error(`Sensitive driver detail: ${productionEnv.MONGODB_URI}`));
    const listen = jest.spyOn(app, 'listen');
    await expect(app.startServer()).rejects.toThrow('MongoDB connection failed');
    expect(listen).not.toHaveBeenCalled();
  });

  it('reports database readiness independently of process availability', async () => {
    const app = loadApp();
    const mongoose = require('mongoose');
    mongoose.connection.readyState = 0;
    const unavailable = await request(app).get('/health');
    expect(unavailable.status).toBe(503);
    expect(unavailable.body).toEqual({ status: 'not_ready', database: 'disconnected' });
    expect((await request(app).get('/')).status).toBe(200);
    mongoose.connection.readyState = 1;
    const ready = await request(app).get('/health');
    expect(ready.status).toBe(200);
    expect(ready.body).toEqual({ status: 'ready', database: 'connected' });
    expect(ready.headers['cache-control']).toBe('no-store');
    mongoose.connection.readyState = 0;
  });
});

describe('deployment CORS policy', () => {
  it('allows the configured frontend origin on JSON API responses', async () => {
    const app = loadApp();
    const response = await request(app).get('/api/events').set('Origin', productionEnv.FRONTEND_URL);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ events: [], totalPages: 0 });
    expect(response.headers['access-control-allow-origin']).toBe(productionEnv.FRONTEND_URL);
    expect(response.headers.vary).toContain('Origin');
    expect(response.headers['ratelimit-limit']).toBe('100');
  });

  it('handles authorized login preflight before rate limiting or authentication', async () => {
    const app = loadApp();
    const response = await request(app).options('/api/admin/login')
      .set('Origin', productionEnv.FRONTEND_URL)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type,authorization');
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(productionEnv.FRONTEND_URL);
    expect(response.headers['access-control-allow-headers']).toMatch(/authorization/i);
    expect(response.headers['ratelimit-limit']).toBeUndefined();
  });

  it('allows member profile PATCH preflight from the configured frontend', async () => {
    const app = loadApp();
    const response = await request(app).options('/api/member/profile')
      .set('Origin', productionEnv.FRONTEND_URL)
      .set('Access-Control-Request-Method', 'PATCH')
      .set('Access-Control-Request-Headers', 'content-type,authorization');
    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(productionEnv.FRONTEND_URL);
    expect(response.headers['access-control-allow-methods']).toMatch(/PATCH/);
    expect(response.headers['access-control-allow-headers']).toMatch(/authorization/i);
    expect(response.headers['ratelimit-limit']).toBeUndefined();
  });

  it.each(['https://untrusted.example.invalid', 'https://ieee-web-seven.vercel.app.evil.invalid', 'null', 'http://localhost:5173'])(
    'rejects unauthorized production browser origins', async (origin) => {
      const app = loadApp();
      const response = await request(app).get('/api/events').set('Origin', origin);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: 'Origin is not allowed' });
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
      expect(response.headers['ratelimit-limit']).toBeUndefined();
    },
  );

  it('rejects unauthorized preflight requests', async () => {
    const app = loadApp();
    const response = await request(app).options('/api/admin/login')
      .set('Origin', 'https://untrusted.example.invalid')
      .set('Access-Control-Request-Method', 'POST');
    expect(response.status).toBe(403);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it.each(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'])(
    'preserves local development origin %s', async (origin) => {
      const app = loadApp({ NODE_ENV: 'development', MONGODB_URI: '', FRONTEND_URL: '', TRUST_PROXY_HOPS: '0' });
      const response = await request(app).get('/api/events').set('Origin', origin);
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe(origin);
    },
  );

  it('allows requests without Origin while still enforcing authentication', async () => {
    const app = loadApp();
    expect((await request(app).get('/api/events')).status).toBe(200);
    const protectedResponse = await request(app).get('/api/admin/stats');
    expect(protectedResponse.status).toBe(401);
    expect(protectedResponse.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('allows same-origin browser requests from a Vercel preview deployment', async () => {
    const app = loadApp();
    const previewHost = 'ieee-web-git-feature-team.vercel.app';
    const response = await request(app).get('/api/events')
      .set('Host', previewHost)
      .set('Origin', `https://${previewHost}`);
    expect(response.status).toBe(200);
  });

  it('still rejects a cross-origin request sent to a preview host', async () => {
    const app = loadApp();
    const response = await request(app).get('/api/events')
      .set('Host', 'ieee-web-git-feature-team.vercel.app')
      .set('Origin', 'https://ieee-web-git-feature-team.vercel.app.evil.invalid');
    expect(response.status).toBe(403);
  });

  it('uses NEXT_PUBLIC_SITE_URL as the frontend origin when FRONTEND_URL is unset', () => {
    const config = getEnvironmentConfig({
      ...productionEnv,
      FRONTEND_URL: '',
      NEXT_PUBLIC_SITE_URL: 'https://ieee-web-seven.vercel.app',
    });
    expect(config.allowedOrigins).toEqual(['https://ieee-web-seven.vercel.app']);
  });

  it('serves readiness at /api/health for the Next.js rewrite', async () => {
    const app = loadApp();
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: 'not_ready', database: 'disconnected' });
  });
});

describe('missing JWT secret defense', () => {
  it('refuses login without a signing key before querying the database', async () => {
    const app = loadApp({ NODE_ENV: 'test', JWT_SECRET: '', MONGODB_URI: '' });
    const Admin = require('../models/Admin');
    const findOne = jest.spyOn(Admin, 'findOne').mockResolvedValue({ password: bcrypt.hashSync('password', 4) });
    const response = await request(app).post('/api/admin/login').send({ username: 'admin', password: 'password' });
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ message: 'Authentication is not configured' });
    expect(findOne).not.toHaveBeenCalled();
  });

  it('does not authorize a token signed with the former fallback key', async () => {
    const app = loadApp({ NODE_ENV: 'test', JWT_SECRET: '', MONGODB_URI: '' });
    const token = jwt.sign({ username: 'admin' }, 'ieee_secret_key');
    const response = await request(app).delete('/api/admin/events/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(503);
    expect(response.body).toEqual({ message: 'Authentication is not configured' });
  });

  it('signs a normal login only with the configured secret', async () => {
    const app = loadApp();
    const Admin = require('../models/Admin');
    jest.spyOn(Admin, 'findOne').mockResolvedValue({ password: bcrypt.hashSync('password', 4) });
    const response = await request(app).post('/api/admin/login').send({ username: 'admin', password: 'password' });
    expect(response.status).toBe(200);
    expect(jwt.verify(response.body.token, productionEnv.JWT_SECRET).username).toBe('admin');
    expect(() => jwt.verify(response.body.token, 'ieee_secret_key')).toThrow();
  });
});
