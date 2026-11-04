# HAWAS Agent Guide

## Read first

- [Product requirements](docs/PRD.md)
- [Architecture essentials](docs/Architecture-essentials.md)
- [Design direction](DESIGN.md)
- Read [full architecture](docs/Architecture.md) before changing routing, data flow, dependencies, persistence, or privacy behavior.

## Design and anti-slop filter

- For any visual, copy, or code work: read `DESIGN.md` for direction, then apply antislop skills as the filter (`antislop`, `antislop-ui`, `antislop-code`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `no-ai-slop`).
- Dials: `ENERGY 1 / RHYTHM 2 / MOTION 1` (Civic security manual, calm, structured, no decorative motion).
- Copy: No em dashes (`—`) in user-facing copy or titles. Use colons, commas, or parentheses instead. No fake stats, no AI buzzwords, no decorative arrows (`→`, `↗`) on buttons.
- Plain Language & Inklusi Digital: Pastikan bahasa dapat dipahami masyarakat awam. Jelaskan istilah teknis (merchant, OTP, APK, QRIS) dengan kata sederhana saat pertama kali muncul. Jangan merendahkan atau menyalahkan pengguna. Bedakan informasi, peringatan risiko, dan tindakan aman dengan teks eksplisit (bukan warna/ikon saja).
- UI: No pill shapes for every element, no glassmorphism or neon/purple gradients. Keep flat lines, crisp hierarchy, and WCAG AA contrast.
- Code comments: Keep only explanations of constraints, security rules, and business logic. Remove AI narration (`// Step 1: ...`), empty labels (`// Main logic`), and banner boxes.

## Product constraints

- HAWAS is an educational tool, not an official bank, BI, or OJK service.
- Never claim a message, URL, QR, or merchant is definitely fraudulent or definitely safe.
- Do not add real payments, account access, OTP/PIN/password collection, reporting automation, or third-party analysis.
- Keep all simulation identities and balances fictional. Do not blame users.
- Do not fabricate contact details or claim partnerships. Verify SOS content before release.
- Features not implemented must be plainly marked unavailable and must not accept input as if functional.

## Engineering practices

- Keep the app mobile-first, lightweight, keyboard accessible, and usable with reduced motion.
- Keep scenario and SOS copy in `src/content/`; keep domain behavior in its feature module.
- Use strict TypeScript and explicit error states. Do not silently turn failures into successful results.
- Do not persist user input, QR images, payloads, or simulation score by default.
- Never open or fetch a URL pasted into Cek. Do not render user text as HTML.
- Avoid new runtime dependencies. Review package size, license, privacy, and browser support before proposing one.
- Update `docs/Architecture.md` and `docs/Architecture-essentials.md` when technical decisions change.

## Validation

- Run `npm run typecheck` and `npm run build` for code changes.
- Add focused tests when implementing domain behavior; do not treat a successful build as feature validation.
- For any privacy claim, inspect network requests and browser storage. Do not assert “not sent” or “not stored” without evidence.
- For responsive or interaction changes, validate phone and desktop layouts and keyboard operation.

## Scope

- Keep changes focused on the request. Do not rewrite source concept documents unless asked.
- Do not claim user research, partnerships, or production readiness that has not happened.
