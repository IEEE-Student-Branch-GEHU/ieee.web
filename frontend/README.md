# IEEE GEHU frontend

The production frontend uses the Next.js App Router. Route files live under
`src/app/` and use the repository's `.next.jsx` page extension configured in
`next.config.mjs`. The public member profile route is
`src/app/members/[memberId]/page.next.jsx`, so stable QR destinations resolve
through Next without a client-side router or login.

The production backend is also inside Next. All API methods are dispatched by
the server-only catch-all handler at `src/app/api/[...path]/route.js`, while
MongoDB, authentication, validation, Cloudinary storage, and ownership checks
live under `src/server/`. The handler uses the Node.js runtime and a cached
Mongoose connection suitable for warm Vercel functions.

## Commands

```bash
npm run dev          # Next.js development server
npm run build        # production Next.js build
npm run start        # serve the Next.js build
npm test             # Vitest component and contract tests
```

The repository keeps a legacy Vite adapter for compatibility with existing
React Router component tests and optional local previews. Its commands are
explicitly named `dev:vite`, `build:vite`, and `preview:vite`; Vite is not the
production deployment target. Vitest still uses Vite's React plugin for its
test transform.

Leave `NEXT_PUBLIC_API_URL` unset or set it to `/api` for the single-app
deployment. Set the verified HTTPS `NEXT_PUBLIC_SITE_URL` for a hosted build;
it is the origin used when generating printable member QR codes. Configure
`MONGODB_URI`, `JWT_SECRET`, and the Cloudinary credentials as server-only
Vercel variables. They must never use the `NEXT_PUBLIC_` prefix.
