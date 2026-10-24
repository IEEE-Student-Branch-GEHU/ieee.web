const mongoose = require('mongoose');
const Team = require('../models/Team');

const base = { name: 'Member', role: 'Chair', category: 'executive' };

describe('Team model public profile fields', () => {
  it('requires year on new records while accepting legacy records loaded from the database', () => {
    const missingYear = new Team(base).validateSync();
    expect(missingYear?.errors.year).toBeDefined();

    const legacyRecord = Team.hydrate({
      _id: new mongoose.Types.ObjectId(),
      ...base,
    });
    expect(legacyRecord.validateSync()).toBeUndefined();
  });

  it('defaults archive flags for a new record', () => {
    const member = new Team({ ...base, year: '2025-2026' });

    expect(member.isLead).toBe(false);
    expect(member.rank).toBe(0);
  });

  it('validates the new profile fields and safe public links', () => {
    const member = new Team({
      ...base,
      image: 'https://cdn.example/member.jpg',
      socials: { linkedin: 'https://linkedin.example/member' },
      bio: 'Public biography',
      committee: 'Executive Committee',
      academicYear: 'Third Year',
      branch: 'Computer Science',
      skills: ['Leadership'],
      interests: ['Open source'],
      achievements: ['Public award'],
      year: '2025-2026',
      isLead: true,
      rank: 1,
    });

    expect(member.validateSync()).toBeUndefined();
  });

  it.each([
    { year: '2025/2026' },
    { image: 'http://user:password@example.test/image.jpg' },
    { socials: { twitter: 'javascript:alert(1)' } },
    { bio: 'x'.repeat(2001) },
    { branch: 'x'.repeat(121) },
    { skills: Array.from({ length: 21 }, () => 'skill') },
  ])('rejects invalid public profile fields: %j', (extra) => {
    const error = new Team({ ...base, ...extra }).validateSync();

    expect(error).toBeDefined();
  });
});
