const path = require('path');
const dotenv = require('dotenv');

// Resolve the backend environment file from this module instead of the
// process working directory. This keeps `npm run create-admin` and
// `node backend/server.js` on the same connection settings.
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
