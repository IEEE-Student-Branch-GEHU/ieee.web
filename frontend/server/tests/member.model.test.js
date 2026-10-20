const mongoose = require('mongoose');
const Member = require('../models/Member');
const Certificate = require('../models/Certificate');

const teamId = new mongoose.Types.ObjectId();
const memberId = new mongoose.Types.ObjectId();

describe('member account and certificate models', () => {
  it('keeps account credentials out of default member selections and validates account states', () => {
    const member = new Member({
      teamId,
      username: 'member.a',
      status: 'active',
      passwordHash: 'bcrypt-hash',
      tokenVersion: 0,
    });

    expect(member.validateSync()).toBeUndefined();
    expect(Member.schema.path('passwordHash').options.select).toBe(false);
    expect(Member.schema.path('activationTokenHash').options.select).toBe(false);
  });

  it('defaults certificates to private and rejects unsupported visibility', () => {
    const certificate = new Certificate({
      memberId,
      teamId,
      title: 'Public speaking',
      storage: { publicId: 'certificates/member-a/public-speaking' },
    });

    expect(certificate.visibility).toBe('private');
    expect(certificate.validateSync()).toBeUndefined();
    expect(new Certificate({
      memberId,
      teamId,
      title: 'Invalid visibility',
      visibility: 'everyone',
      storage: { publicId: 'certificates/member-a/invalid' },
    }).validateSync()).toBeDefined();
    expect(Certificate.schema.path('storage.publicId').options.select).toBe(false);
  });
});
