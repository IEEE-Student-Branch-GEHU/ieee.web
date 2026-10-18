const {
  verifyAdminPassword,
} = require('../services/admin-credentials');
const express = require('express');
const request = require('supertest');

const OLD_PASSWORD = 'old-test-password-never-printed';
const CURRENT_PASSWORD = 'current-test-password-never-printed';
const adminRecord = {
  _id: 'admin-id',
  username: 'ieee_test_admin',
  role: 'branch-admin',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  password: '',
  save: jest.fn(async function save() { return this; }),
};

const mockAdminModel = {
  findOne: jest.fn(async ({ username }) => (
    username === adminRecord.username ? adminRecord : null
  )),
};

jest.mock('../models/Admin', () => mockAdminModel);
jest.mock('mongoose', () => ({
  connection: { name: 'test' },
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../models/Event', () => ({}));
jest.mock('../models/Team', () => ({}));
jest.mock('../config/cloudinary', () => ({ storage: {} }));

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';
process.env.ADMIN_USERNAME = 'ieee_test_admin';
process.env.ADMIN_PASSWORD = CURRENT_PASSWORD;

const { hashAdminPassword } = require('../services/admin-credentials');
const { resetAdminPassword } = require('../scripts/reset-admin-password');
const adminRoutes = require('../routes/admin');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  return app;
};

describe('test administrator password reset', () => {
  beforeEach(async () => {
    adminRecord.password = await hashAdminPassword(OLD_PASSWORD);
    adminRecord.role = 'branch-admin';
    adminRecord.createdAt = new Date('2026-01-01T00:00:00.000Z');
    adminRecord.save.mockClear();
    mockAdminModel.findOne.mockClear();
  });

  it('updates only the existing test account password and invalidates the previous password', async () => {
    const before = {
      _id: adminRecord._id,
      username: adminRecord.username,
      role: adminRecord.role,
      createdAt: adminRecord.createdAt,
    };

    await resetAdminPassword({
      mongoUri: 'mongodb://test-db.invalid/test',
      AdminModel: mockAdminModel,
    });

    expect(mockAdminModel.findOne).toHaveBeenCalledWith({ username: 'ieee_test_admin' });
    expect(adminRecord.save).toHaveBeenCalledTimes(1);
    await expect(verifyAdminPassword(CURRENT_PASSWORD, adminRecord.password)).resolves.toBe(true);
    await expect(verifyAdminPassword(OLD_PASSWORD, adminRecord.password)).resolves.toBe(false);

    const app = createApp();
    const currentPasswordLogin = await request(app)
      .post('/api/admin/login')
      .send({ username: 'ieee_test_admin', password: CURRENT_PASSWORD });
    const previousPasswordLogin = await request(app)
      .post('/api/admin/login')
      .send({ username: 'ieee_test_admin', password: OLD_PASSWORD });
    expect(currentPasswordLogin.status).toBe(200);
    expect(currentPasswordLogin.body.token).toEqual(expect.any(String));
    expect(previousPasswordLogin.status).toBe(401);
    expect({
      _id: adminRecord._id,
      username: adminRecord.username,
      role: adminRecord.role,
      createdAt: adminRecord.createdAt,
    }).toEqual(before);
  });

  it('aborts when the selected database is not the dedicated test database', async () => {
    await expect(resetAdminPassword({
      mongoUri: 'mongodb://test-db.invalid/production',
      databaseName: 'production',
      AdminModel: mockAdminModel,
    })).rejects.toThrow('test database');
    expect(mockAdminModel.findOne).not.toHaveBeenCalled();
    expect(adminRecord.save).not.toHaveBeenCalled();
  });

  it('aborts when the existing test account is missing', async () => {
    const missingModel = { findOne: jest.fn().mockResolvedValue(null) };

    await expect(resetAdminPassword({
      mongoUri: 'mongodb://test-db.invalid/test',
      AdminModel: missingModel,
    })).rejects.toThrow('ieee_test_admin');
  });
});
