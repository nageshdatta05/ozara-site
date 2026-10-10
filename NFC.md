# OZARA NFC authentication

Version 1 is **identification + database verification**. The NFC tag holds an
HTTPS URL containing the bracelet ID; the server looks that ID up in its
register and returns the result. It is **not** cryptographic
anti-counterfeiting: an NTAG213-class tag can be copied. The design is ready
for secure chips later (see "Upgrading to a cryptographic chip").

## Layers

| Layer | Where | Role |
|---|---|---|
| Frontend | `src/app/b/[braceletId]`, `src/app/verify`, `src/app/admin/nfc`, `src/app/(site)/authenticity`, `src/components/nfc`, `src/components/admin` | Displays results; never decides them |
| API | `src/app/api/**` | HTTP endpoints (public lookup, organiser verify, admin CRUD) |
| Backend | `src/server/verification.ts` | **The only place a result is decided**; writes the scan log; review rules |
| Data | `src/server/db.ts`, `schema.ts`, `bracelets.ts` | SQLite (Node's built-in driver), file at `data/ozara.db` |

## Flow

```
tap bracelet → phone opens https://<domain>/b/BR-000001
            → server: verification.authenticate("BR-000001")
            → SELECT … FROM bracelets WHERE bracelet_id = 'BR-000001'
            → result: authentic | revoked | not_recognized  (+ log row)
            → page shows ✓ Authentic / No longer valid / Not recognized
```

If the phone belongs to a signed-in event organiser, the same URL shows that
event's door result instead (this is how iPhones verify at the door).

## Data model

- `bracelets` — `bracelet_id` (permanent, in the tag URL), `nfc_uid` (the
  chip's factory UID, permanent once recorded), `status` (`active`/`revoked`),
  `owner_id`, `product_slug`, `batch`, `verification_method`, `review_status`,
  timestamps. Claimed/Unclaimed is derived from `owner_id`.
- `owners` — `display_name` and `email` (private), `public_label` (the only
  thing ever shown publicly, e.g. initials).
- `events` — name, date, venue, status, hashed organiser code.
- `event_eligibility` — (bracelet, event) → `eligible`/`not_eligible`.
  **Separate from authenticity.**
- `auth_logs` — every check: presented ID, bracelet, event, channel, result,
  eligibility, flag, device class, hashed organiser session. No IP address,
  no names.

## Routes

| Route | Who | What |
|---|---|---|
| `/b/:braceletId` | anyone (NFC tap) | public authentication result |
| `/authenticity` | anyone | explanation + enter an ID manually |
| `/verify` | event staff (organiser code) | door checks, Web NFC on Android, manual ID |
| `/admin/nfc` | admin (`OZARA_ADMIN_PASSWORD`) | overview, bracelets, register, events |
| `GET /api/bracelets/:id` | anyone | JSON lookup (for the future app) |
| `POST /api/verify` | organiser session | door check |
| `/api/admin/*` | admin session | create/update/revoke/restore, eligibility, owners, events |

## Registering a real bracelet

1. Read the chip's UID with any NFC tool (e.g. NXP TagInfo / NFC Tools).
2. `/admin/nfc` → **Register** → choose a bracelet ID (e.g. `BR-000101`),
   paste the UID, choose product/batch/events → Register.
3. Write the URL shown (e.g. `https://ozara.com/b/BR-000101`) to the tag as
   an NDEF **URL** record (NFC Tools → Write → URL). Lock the tag if you want
   it read-only.
4. Tap it with a phone — you should see ✓ Authentic, and a scan in Overview.

## Event verification

1. `/admin/nfc` → **Events** → create the event, set status **Live**, set an
   organiser code, and mark bracelets eligible (bracelet detail page).
2. Door staff open `/verify` on their phone and enter the code.
3. Android (Chrome): tap **Tap to start scanning**, hold bracelets to the phone.
   iPhone: hold the phone to the bracelet; its page opens with the door result.
   Any phone: type the bracelet ID.
4. Result fills the screen: **VALID** (green), **NOT ELIGIBLE** (amber),
   **NOT VERIFIED** (red). Tap to continue. Every check is logged.

## Review flags (not fraud verdicts)

`verification.ts → reviewFlag` marks a bracelet "review recommended" when:
15+ scans in 10 minutes; admitted at two different events within 6 hours;
checked by two different door devices at the same event within 5 minutes.
Admins see these in Overview and can mark them resolved.

## Mobile app later (Universal Links / App Links)

Keep the tag URL exactly as it is. When the app exists:
- iOS: serve `https://<domain>/.well-known/apple-app-site-association` with
  `{"applinks":{"details":[{"appIDs":["TEAMID.com.ozara.app"],"components":[{"/":"/b/*"}]}]}}`
  and add the Associated Domains entitlement `applinks:<domain>`.
- Android: serve `https://<domain>/.well-known/assetlinks.json` and add an
  `autoVerify` intent filter for `https://<domain>/b/*`.
- The app reads the ID from the URL and calls `GET /api/bracelets/:id` — the
  same backend decision. No tag needs rewriting; without the app the website
  still opens.

## Upgrading to a cryptographic chip

Use a chip with per-tap dynamic authentication (e.g. NXP NTAG 424 DNA with
SUN/SDM). The tag URL then carries extra parameters
(`/b/BR-000101?picc_data=…&cmac=…`) that change on every tap. Implement the
`ntag424_sun` case in `verifyTagProof()` (decrypt, check UID and counter,
verify CMAC with a key referenced by `key_ref`), and set
`verification_method = 'ntag424_sun'` on new bracelets. Old bracelets keep
working as `url_id`.

## Deployment notes

- SQLite needs a persistent disk (a VPS, Fly.io/Render with a volume). On
  serverless hosting (e.g. Vercel) move the repository in `src/server/bracelets.ts`
  to Postgres — nothing else changes.
- Set `OZARA_ADMIN_PASSWORD`, `OZARA_SESSION_SECRET`, `OZARA_PUBLIC_URL`, and
  `OZARA_SEED_DEMO=false` before the first production start.
- Back up `data/ozara.db`.

## Owner tap pages (profiles)

An owner can publish a personal page that opens when their bracelet is tapped (`/b/<id>`).

- **Edit:** Your account → Bracelets → "Your tap page" (`src/components/account/ProfileEditor.tsx`, API `/api/account/bracelets/<id>/profile` and `/photo`).
- **Fields:** name, a line under it, location, a short about line, photo, phone, email, website, Instagram, LinkedIn, plus a card finish (midnight, burgundy or ivory). Each is optional and has its own **Show** switch; there is also a master "show my tap page" switch. A field is public only if it has a value, its switch is on, and the page is published.
- **Public side:** `src/components/nfc/ProfileCard.tsx` on `/b/<id>`; `/b/<id>/photo` serves the photo; `/b/<id>/contact` gives a "Save contact" vCard of only the shown fields.
- **Storage:** tables `profiles` and `profile_photos` (`src/server/schema.ts`), logic and input cleaning in `src/server/profiles.ts`. Photos are cropped and compressed to a small JPEG in the owner's browser (this also strips location data) and checked on the server.
- **Privacy rules (enforced in code):** the profile is erased by a database trigger whenever ownership ends (transfer, account deletion, admin change). Suspended (lost) or revoked bracelets show no profile, photo or contact card. Stranger and other-account edits are rejected.
- The tag itself still holds only the bracelet link. A tap opens a web page; nothing is read from or sent from the phone.
