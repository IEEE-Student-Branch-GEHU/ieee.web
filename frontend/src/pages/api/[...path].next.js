// Serves the Express API in server/ from the same Next.js deployment as the
// pages, so the site and its API share one origin and one Vercel project.

export const config = {
  // Express parses JSON and multipart bodies itself (express.json, multer).
  api: { bodyParser: false, externalResolver: true },
};

let appPromise = null;

// Loaded on the first request rather than at import time, so `next build`
// never runs the production environment checks or touches the database.
const loadApp = () => {
  appPromise ??= import('../../../server/server.js')
    .then(module => module.default ?? module)
    .catch((error) => {
      appPromise = null;
      throw error;
    });
  return appPromise;
};

export default async function handler(req, res) {
  let app;
  try {
    app = await loadApp();
    await app.ensureDatabase();
  } catch (error) {
    // Configuration and connection errors never include secret values.
    console.error(JSON.stringify({ event: 'api_startup_failed', message: error.message, code: error.code }));
    return res.status(503).json({ message: 'Service temporarily unavailable' });
  }

  // Next.js parses the query (including the catch-all `path` segment) onto the
  // request. Remove it so Express derives req.query from the URL as usual.
  delete req.query;

  return new Promise((resolve) => {
    res.once('finish', resolve);
    res.once('close', resolve);
    app(req, res);
  });
}
