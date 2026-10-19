# IEEE GEHU frontend

The production frontend uses the Next.js App Router. Route files live under
`src/app/` and use the repository's `.next.jsx` page extension configured in
`next.config.mjs`. The public member profile route is
`src/app/members/[memberId]/page.next.jsx`, so stable QR destinations resolve
through Next without a client-side router or login.

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

Set `NEXT_PUBLIC_API_URL` and the verified HTTPS `NEXT_PUBLIC_SITE_URL` for a
hosted build. The latter is the origin used when generating printable member
QR codes.
