# Production readiness checklist

## Current status

**Production launch readiness: BLOCKED**

The repository is a single Next.js application (site and Express API) deployed
to Vercel, but the canonical public domain is not verified. Do
not generate production member QR codes or publish canonical URLs until the
organizer confirms one HTTPS origin and it has been verified in Vercel.

## Checklist

- [ ] Confirm the canonical custom domain and whether the apex or `www` host is primary.
- [ ] Connect the confirmed domain in Vercel and verify DNS and TLS.
- [ ] Set the API secrets in Vercel (`MONGODB_URI`, `JWT_SECRET`, Cloudinary, `TRUST_PROXY_HOPS=1`) and leave `NEXT_PUBLIC_API_URL` unset.
- [ ] Allow Vercel in MongoDB Atlas Network Access.
- [ ] Set Vercel `NEXT_PUBLIC_SITE_URL` to the same confirmed public origin.
- [ ] Rebuild after setting `NEXT_PUBLIC_SITE_URL`; hosted Next.js builds reject
      an unset or non-public origin before printable QR codes can be generated.
- [x] Favicon is referenced by the active Next.js layout and included in `frontend/public/favicon.png`.
- [ ] Verify the favicon response and browser-tab rendering on a running production-like preview.
- [x] Repository search found no website AI attribution label or badge.
- [ ] Verify the absence of that label in the deployed DOM and any hosting-injected UI.
- [ ] Privacy Notice draft reviewed by the organizer and legal reviewer.
- [ ] Terms of Use draft reviewed by the organizer and legal reviewer.
- [ ] Confirm legal entity/controller, rights request process, contact ownership, retention, backups, and applicable terms.
- [ ] Test member profile URLs with real approved Team records.
- [ ] Provision an approved member account through the administrator flow and verify activation, login, logout, and profile ownership checks.
- [ ] Verify certificate uploads with configured authenticated Cloudinary storage, private-by-default behavior, explicit public visibility, and deletion.
- [ ] Set the verified public origin and test QR scanning from a production-like preview.
- [ ] Test QR SVG downloads and readability in both themes.
- [ ] Test `/community/scan` from HTTPS or localhost: grant camera permission only after pressing Start, scan an approved QR, confirm the correct read-only profile opens, stop/deny camera access, and verify unsupported browsers show a safe fallback.
- [ ] Test theme persistence, system preference, keyboard access, responsive layouts, and reduced motion in a real browser.
- [ ] Run accessibility checks against homepage, events, team/profile, legal, and admin flows.
- [x] Run the backend and frontend test suites and the Next.js production build locally; the legacy Vite adapter is not the production build target.

## Local verification notes

- Backend Jest: 17 suites and 260 tests passed with `npm test -- --runInBand`; the deployment suite includes the member-profile `PATCH` CORS preflight regression.
- The existing frontend suite passed in bounded runs before the architecture-targeting changes: 29 files and 259 tests using `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism`.
- After the architecture changes, focused Next.js/deployment/profile/archive checks passed, including 8 Next route-contract tests, 14 deployment tests, 27 member-profile tests, 42 public-origin/QR tests, 9 leadership-archive tests, and 12 API configuration tests.
- Next.js production build passed after the member-flow changes. The legacy
  Vite adapter remains available for tests and optional previews but is not the
  production deployment target.
- `npm run build` and `npm run build:next` both use and pass the Next.js App Router production build. The Vite adapter remains available only for tests and optional previews.
- Scoped ESLint for the changed architecture/configuration files passed with no errors.

## Member data

No Excel workbook or compatible member import file exists in this repository.
The expected source, if one is supplied later, should contain only approved
fields such as name, role, category, image URL, public social URLs, bio,
committee, academic year, branch, year, skills, interests, and achievements.
Do not add fictional records or modify production records to fill missing data.

## Manual checks requiring access

The following cannot be proven from this local workspace alone:

- Vercel custom-domain ownership, DNS, TLS, and deployed hostname.
- Vercel environment values and live origin checks.
- MongoDB/Cloudinary production readiness.
- QR scanning on a physical device or production-like deployment.
- Final legal approval and retention/contact decisions.
