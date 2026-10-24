# Production readiness checklist

## Current status

**Production launch readiness: BLOCKED**

The repository contains a single Next.js App Router application with the
Express API mounted at the same origin through `src/pages/api/[...path].next.js`.
The legacy `backend/` Express/Render backend remains available for rollback,
but is not the Vercel production target. The canonical public domain
is not verified. Do not generate production member QR codes or publish
canonical URLs until the organizer confirms one HTTPS origin and verifies it in
Vercel.

## Checklist

- [ ] Confirm the canonical custom domain and whether the apex or `www` host is primary.
- [ ] Connect the confirmed domain in Vercel and verify DNS and TLS.
- [ ] Set Vercel server-only `MONGODB_URI`, `JWT_SECRET`, and Cloudinary credentials.
- [ ] Leave Vercel `NEXT_PUBLIC_API_URL` unset or set it to `/api` for same-origin routing.
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
- [ ] Configure and verify administrator-authorized volunteer Google sign-in, including authorization, first-login subject binding, revocation, reassignment rejection, and disabled-account rejection.
- [ ] Verify certificate uploads with configured authenticated Cloudinary storage, private-by-default behavior, explicit public visibility, and deletion.
- [ ] Set the verified public origin and test QR scanning from a production-like preview.
- [ ] Test QR SVG downloads and readability in both themes.
- [ ] Test `/community/scan` from HTTPS or localhost: grant camera permission only after pressing Start, scan an approved QR, confirm the correct read-only profile opens, stop/deny camera access, and verify unsupported browsers show a safe fallback.
- [ ] Test theme persistence, system preference, keyboard access, responsive layouts, and reduced motion in a real browser.
- [ ] Run accessibility checks against homepage, events, team/profile, legal, and admin flows.
- [ ] Run the mounted `frontend/server` API route tests against a staging MongoDB/Cloudinary configuration.
- [ ] Run the preserved `backend/` rollback suite, frontend tests, lint, and the Next.js production build after the integration merge.

## Local verification notes

- Local verification results for this integration are recorded after the merge is resolved; do not treat historical pre-merge counts as current evidence.

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
