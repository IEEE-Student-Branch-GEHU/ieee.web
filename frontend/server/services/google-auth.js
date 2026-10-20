const { OAuth2Client } = require('google-auth-library');

const createGoogleAuthError = (code, message) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

let client = null;

// Verifies a Google Identity Services ID token: signature, expiry, issuer and
// that it was issued for this site's OAuth client. Only verified emails count.
const verifyGoogleCredential = async (credential, clientId) => {
  client ??= new OAuth2Client();

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    throw createGoogleAuthError('GOOGLE_TOKEN_INVALID', 'Google sign-in could not be verified');
  }

  if (!payload?.sub || typeof payload.email !== 'string' || payload.email_verified !== true) {
    throw createGoogleAuthError('GOOGLE_TOKEN_INVALID', 'Google sign-in could not be verified');
  }

  return { subject: payload.sub, email: payload.email.trim().toLowerCase() };
};

module.exports = { createGoogleAuthError, verifyGoogleCredential };
