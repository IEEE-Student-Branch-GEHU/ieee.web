# Production readiness checklist

## Current status

**Production launch readiness: BLOCKED**

The repository contains the Vite production frontend and Render backend
configuration, but the canonical public domain is not verified. The README
and Render configuration currently name different Vercel hostnames. Do not
generate production member QR codes or publish canonical URLs until the
organizer confirms one HTTPS origin and it has been verified in Vercel.

## Checklist

- [ ] Confirm the canonical custom domain and whether the apex or `www` host is primary.
- [ ] Connect the confirmed domain in Vercel and verify DNS and TLS.
- [ ] Set Render `FRONTEND_URL` to the exact confirmed HTTPS origin.
- [ ] Set Vercel `VITE_API_URL` to the deployed Render API origin, then rebuild.
- [ ] Set Vercel `VITE_PUBLIC_SITE_URL` to the same confirmed public origin.
- [x] Favicon is referenced by the active Vite `index.html` and included in `frontend/public/favicon.png`.
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
- [x] Run the backend and frontend test suites and both production builds locally; the full frontend lint command still reports existing repository errors listed below.

## Local verification notes

- Backend Jest: 16 suites and 254 tests passed with `npm test -- --runInBand`; the deployment suite includes the member-profile `PATCH` CORS preflight regression.
- Frontend Vitest: 25 files and 219 tests passed across bounded runs using `npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism`. A single all-files invocation exceeded the local 900-second tool limit after its completed files printed green results; the remaining 8 files passed in a separate bounded command.
- QR/profile/scanner/routing-focused Vitest passed, including actual SVG generation, stable URL assertions, canonical-origin validation, download behavior, invalid-profile handling, admin profile actions, camera cleanup, and route coverage.
- Vite and incremental Next.js production builds passed after the member-flow changes. Vite retains the existing large JavaScript chunk warning.
- Scoped ESLint for the changed JavaScript/JSX files passed with no errors. Repository-wide ESLint still reports existing legacy errors in unrelated animation/UI/test files; no new errors were reported in the scoped changed files.

## Member data

No Excel workbook or compatible member import file exists in this repository.
The expected source, if one is supplied later, should contain only approved
fields such as name, role, category, image URL, public social URLs, bio,
committee, academic year, branch, year, skills, interests, and achievements.
Do not add fictional records or modify production records to fill missing data.

## Manual checks requiring access

The following cannot be proven from this local workspace alone:

- Vercel custom-domain ownership, DNS, TLS, and deployed hostname.
- Render environment values and live CORS behavior.
- MongoDB/Cloudinary production readiness.
- QR scanning on a physical device or production-like deployment.
- Final legal approval and retention/contact decisions.
