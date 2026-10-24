const LOCAL_FRONTEND_ORIGINS = Object.freeze([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
]);

const INSECURE_JWT_SECRETS = new Set([
  'ieee_secret_key',
  'ieee_secret_key_change_me',
  'your_secure_jwt_secret',
  'change-me',
  'change_me',
  'secret',
]);

const isProduction = (env) => env.NODE_ENV === 'production';

const assertPresent = (env, key, errors) => {
  if (!env[key]?.trim()) errors.push(`${key} is required`);
};

const normalizeOrigin = (value) => {
  if (!value?.trim()) return null;

  let parsed;
  try {
    parsed = new URL(value.trim());
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) {
    return null;
  }

  return parsed.origin;
};

const parseTrustedProxyHops = (value) => {
  if (value === undefined || value === '') return 0;
  if (!/^\d+$/.test(String(value))) return null;
  const hops = Number(value);
  return Number.isSafeInteger(hops) ? hops : null;
};

const createValidationError = (errors) => {
  const error = new Error(`Invalid production configuration: ${errors.join('; ')}`);
  error.code = 'INVALID_PRODUCTION_CONFIG';
  return error;
};

const getEnvironmentConfig = (sourceEnv = process.env) => {
  // In the combined Next.js deployment the public site origin doubles as the
  // allowed frontend origin, so it only has to be configured once.
  const env = { ...sourceEnv, FRONTEND_URL: sourceEnv.FRONTEND_URL || sourceEnv.NEXT_PUBLIC_SITE_URL };
  const production = isProduction(env);
  const errors = [];
  const frontendOrigin = normalizeOrigin(env.FRONTEND_URL);
  const trustedProxyHops = parseTrustedProxyHops(env.TRUST_PROXY_HOPS);

  if (production) {
    for (const key of [
      'MONGODB_URI',
      'JWT_SECRET',
      'FRONTEND_URL',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ]) {
      assertPresent(env, key, errors);
    }

    if (env.MONGODB_URI === 'pending') errors.push('MONGODB_URI must be a real connection string');
    if (env.JWT_SECRET && (env.JWT_SECRET.length < 32
      || INSECURE_JWT_SECRETS.has(env.JWT_SECRET)
      || /^(replace|your|change)([-_]|\s)/i.test(env.JWT_SECRET))) {
      errors.push('JWT_SECRET must be a random value of at least 32 characters');
    }
    if (env.FRONTEND_URL && !frontendOrigin) {
      errors.push('FRONTEND_URL must be an origin without a path, query, or wildcard');
    } else if (frontendOrigin?.startsWith('http://')) {
      errors.push('FRONTEND_URL must use HTTPS in production');
    }
  }

  if (trustedProxyHops === null) errors.push('TRUST_PROXY_HOPS must be a non-negative integer');

  if (errors.length > 0) throw createValidationError(errors);

  return Object.freeze({
    environment: env.NODE_ENV || 'development',
    production,
    port: Number(env.PORT) || 5000,
    mongoUri: env.MONGODB_URI && env.MONGODB_URI !== 'pending' ? env.MONGODB_URI : null,
    jwtSecret: env.JWT_SECRET?.trim() || null,
    frontendOrigin,
    allowedOrigins: Object.freeze([
      ...(frontendOrigin ? [frontendOrigin] : []),
      ...(!production ? LOCAL_FRONTEND_ORIGINS : []),
    ]),
    cloudinary: Object.freeze({
      cloudName: env.CLOUDINARY_CLOUD_NAME?.trim() || null,
      apiKey: env.CLOUDINARY_API_KEY?.trim() || null,
      apiSecret: env.CLOUDINARY_API_SECRET?.trim() || null,
    }),
    trustedProxyHops: trustedProxyHops ?? 0,
    // The OAuth client ID is public; the browser button uses the same value.
    googleClientId: (env.GOOGLE_CLIENT_ID || env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)?.trim() || null,
  });
};

module.exports = {
  LOCAL_FRONTEND_ORIGINS,
  getEnvironmentConfig,
  normalizeOrigin,
};
