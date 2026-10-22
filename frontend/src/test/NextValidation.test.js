import { describe, expect, it } from 'vitest';
import {
  sanitizeMemberActivation,
  sanitizeMemberCredentials,
  sanitizeProvisioning,
} from '../server/validation';

describe('migrated member request validation', () => {
  it('enforces the member username contract without changing password bytes', () => {
    expect(sanitizeMemberCredentials({ username: ' Ada.Member ', password: ' password ' }))
      .toEqual({ username: 'ada.member', password: ' password ' });
  });

  it('rejects invalid usernames during account provisioning', () => {
    expect(() => sanitizeProvisioning({ username: 'not valid', teamId: '507f1f77bcf86cd799439011' }))
      .toThrow(/username must contain/i);
  });

  it('preserves activation password whitespace after validating its length', () => {
    const password = '  twelve-character ';
    expect(sanitizeMemberActivation({ token: 'activation-token', password }))
      .toEqual({ token: 'activation-token', password });
  });
});
