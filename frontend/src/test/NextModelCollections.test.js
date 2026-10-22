import { describe, expect, it } from 'vitest';
import { Admin, Certificate, Event, Member, RateLimit, Team } from '../server/models';

describe('migrated model collection compatibility', () => {
  it('uses the collections owned by the preserved backend', () => {
    expect(Team.collection.name).toBe('teams');
    expect(Event.collection.name).toBe('events');
    expect(Admin.collection.name).toBe('admins');
    expect(Member.collection.name).toBe('members');
    expect(Certificate.collection.name).toBe('certificates');
    expect(RateLimit.collection.name).toBe('apiRateLimits');
  });
});
