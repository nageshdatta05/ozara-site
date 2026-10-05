# OZARA — website

Next.js 16 · React 19 · Tailwind 4 · Motion · Lenis

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Start here
- **DESIGN-NOTES.md** — why great jewellery sites feel different, and how this skeleton applies it (plus the launch checklist).
- **IMAGE-GUIDE.md** — every photo slot: type, ratio, background, resolution.
- **NFC.md** — the bracelet authentication system: architecture, registering bracelets, event verification, app links.

## Where things live

| Change…                              | Edit                                   |
| ------------------------------------ | -------------------------------------- |
| Products (names, slugs, images, price, availability, materials, features, checkout link) | `src/data/products.ts` |
| Every photograph (paths, sizes, alt text, focal points) | `src/data/media.ts` |
| Every word on the page (incl. shared product-page copy) | `src/content/copy.ts` |
| Brand, nav, footer, contact, launch status, waiting-list endpoint, services, press/testimonials, founder note | `src/config/site.ts` |
| Home section order / remove / add   | `src/config/sections.ts`               |
| Colours, type scale, spacing, radius, shadows, timing | `src/app/tokens.css`  |
| Motion easings/durations (JS side)   | `src/lib/motion.ts`                    |

### Pages
- `/` — home, a sequence of cinematic sections
- `/shop` — the collection
- `/shop/[slug]` — product page (gallery, price, quantity, CTA, story, NFC, craft, details, gallery, FAQ, related). Pages are generated from `products.ts`.

### Products
Each entry has `slug`, `name`, `category`, `tagline`, `description`, `story`,
`image`, `gallery`, `price`, `availability`, `materials`, `features`,
`checkoutUrl`. `null` values show "Price coming soon" / "Details to be
announced". When a product has a `price`, `availability: "available"` and a
`checkoutUrl`, the product page's button becomes **Purchase — £x** and links
to checkout (quantity is appended as `?quantity=`). Until then it is **Join the
waiting list** (mailto to `site.contactEmail`).

All three entries currently use the same bracelet photography on purpose.

### Imagery
All photography is in `public/media/`, grouped as `campaign`, `product`,
`detail`, `lifestyle`, `nfc`, `texture`. It was cut from the Gemini asset board
and triptych in `../Ozara Media/`, upscaled 4× with Real-ESRGAN, and cleaned
of baked-in text. The source tiles were small (≈200–550px), so:
- replace any file with a high-resolution original of the same subject when
  you have one (≥ 2400px on the long edge) and update its size in `media.ts`;
- avoid showing small-source images full-bleed on phones — `Photo` frames
  should keep the image near its natural proportions there.

### Brand colour
Change `--c-satin*` (and surfaces if needed) in `tokens.css`. The few inline
`rgb(43 70 128 / …)` glows in sections are the satin value at low alpha;
search for `43 70 128` to retune them together.

### Accessibility & motion
- `prefers-reduced-motion`: scroll-pinned scenes become static sequences,
  ambient CSS loops stop, smooth scrolling is disabled.
- Pinned choreography (Concept, Access) only runs ≥ 900px; mobile gets a
  simplified vertical version.
- Keyboard: skip link, focus-visible rings, Esc closes menu/overlay, focus is
  trapped in and returned from the product overlay.

## Production setup — what you still provide

Everything below is configured through environment variables (see `.env.example`).

| Item | Variable / file | Without it |
|---|---|---|
| Public address (also written into NFC tags — choose once) | `OZARA_PUBLIC_URL`, `NEXT_PUBLIC_SITE_URL` | links, sitemap and tag URLs point at localhost |
| Admin password, session secret | `OZARA_ADMIN_PASSWORD`, `OZARA_SESSION_SECRET` | the server refuses to start in production |
| Email (password reset, order confirmations, enquiry copies) | `RESEND_API_KEY`, `EMAIL_FROM`, `OZARA_INBOX_EMAIL` | nothing is emailed; attempts listed in Admin → Messages |
| Public contact email | `NEXT_PUBLIC_CONTACT_EMAIL` | the contact form is used instead (enquiries are always saved) |
| Legal entity, address, registration, governing law | `NEXT_PUBLIC_LEGAL_*`, `NEXT_PUBLIC_GOVERNING_LAW` | omitted from Privacy/Terms — have both reviewed by a lawyer |
| Prices and stone surcharges | `price` in `src/data/products.ts`, `GEM_SURCHARGE` | "Price on confirmation" everywhere |
| Metals/plating per finish | `materials` in `src/data/products.ts` | "confirmed with you in writing" |
| Payments | `src/server/payments.ts`, `payments.provider` in `src/config/site.ts` | checkout saves a reservation; nothing is charged |
| Brand font | `public/fonts/brown-sugar.woff2` | Libre Caslon is used |
| Database on a persistent disk + backups | `OZARA_DB_PATH` | — |
| Demo data OFF | `OZARA_SEED_DEMO=false` | demo bracelets/events are created (always labelled as demo) |

## How the system fits together

- **Customer:** product → stones + wrist size → bag → checkout (reservation, optional account) → confirmation + email → Your account (reservations, details, password, privacy, delete).
- **Business:** Admin (`/admin/nfc`) → Orders (move each reservation along) → Register a bracelet (optionally with its order reference) → a one-time **claim code** is shown → print it on the card in the box → write the tag URL to the NFC tag.
- **Owner:** Your account → Bracelets → enter bracelet ID + claim code → registered. Controls: show initials or "a private owner", report lost / found, transfer (issues a new code for the next owner).
- **Public:** tap → `/b/<ID>` → Authentic (registered or not) / Reported lost / No longer valid / Not recognised. Never shows the chip UID, names or emails.
- **Events:** Admin → Events (organiser code, eligibility per bracelet) → door staff open `/verify`, sign in with their **name** + code → tap or type → Valid / Not eligible / Not verified. Every check is logged with the staff name.
- **Messages:** Admin → Messages: contact enquiries (mark answered), waiting list (CSV export), email log.

## Tests

End-to-end scripts (Puppeteer) were run against the dev server: full customer/owner/business journey (44 checks), edge cases and failures (35), password reset and account deletion (11), the original NFC/admin suite (30), plus a crawl of every link. Rate limits are in memory per server process — restart the dev server between repeated test runs.
