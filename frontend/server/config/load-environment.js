const path = require('path');
const dotenv = require('dotenv');

// Standalone scripts (create-admin, reset-admin-password, ...) read the same
// environment files that `next dev` uses. Inside Next.js these values are
// already loaded, and dotenv never overrides variables that are present.
const appRoot = path.resolve(__dirname, '../..');
dotenv.config({ path: [path.join(appRoot, '.env.local'), path.join(appRoot, '.env')], quiet: true });
