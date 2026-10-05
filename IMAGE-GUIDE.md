# OZARA — Image guide

The single biggest difference between this site and the best jewellery houses
is photography. The layout is now built around a strict set of image *types*.
Shoot (or commission) to this list and every slot will look intentional.


## Current photography (October 2026)

Every bracelet image on the site now comes from the OZARA product renders in
`/Ozara Media` — for each model, the plain piece and the piece set with ruby,
sapphire, emerald and amethyst (`bracelet_*_refined.jpg`,
`bracelet_*_wave_hires.png`). Files live in `public/media/collection/<model>/`
and are registered in `src/data/media.ts`. All crops are cut from the
originals at full resolution — nothing is enlarged.

| File | What it is | Used for |
|---|---|---|
| `plate-cut.png` | The plain piece cut out (macOS Vision subject mask), soft contact shadow, same scale for all three | Opening, collection, menu, bag, transitions |
| `piece.jpg` / `campaign.jpg` | The plain piece, full frame / wide | First gallery frame; campaign frames |
| `eye.jpg`, `eye-wide.jpg` | The eye, close and wide | Detail cards; "The OZARA eye"; Technology; Authenticity |
| `curve.jpg`, `hinge-detail.jpg` | The band crossing; the hinge | Gallery; detail prints |
| `portrait.jpg` | Upright crop, eye at centre | The Flow chapter |
| `<stone>-piece/eye/detail.jpg` | The piece set with each stone | Product gallery when that stone is chosen |
| `<stone>-portrait.jpg` | Upright crop of the stone-set piece | "Set with stones" on the home page |
| `diamond-*.jpg` (Flow, Line) | Diamond photographs supplied earlier | Product gallery for Diamond |

**Not yet photographed** (so those slots were removed rather than filled with
the old AI images): the piece worn on the wrist, the OZARA engraving inside the
band, the NFC mark, and the Wave with diamonds. The old images are kept in
`/archive/old-site-images` (outside the site) for reference.

**Rules for every image**
- Same bracelet, same finish, same lighting family across a set.
- Long edge ≥ 2400px (hero ≥ 3200px). JPG, quality ~85. sRGB.
- No text, logos or UI burnt into the image — type is set by the site.
- Leave breathing room: the site crops for different screens.
- Put files in `public/media/…` and register them in `src/data/media.ts`
  (path, width, height, alt text, optional focal point).

| # | Type | Used in | Ratio | Background & light | Notes |
|---|------|---------|-------|--------------------|-------|
| 1 | **Packshot** (per product) | Collection stage, cards, first gallery frame | 4:5, piece ≈ 70% of frame | Plain warm-grey `#EBE9E4`, soft top light, gentle contact shadow | The most important image. Same angle for every product so they read as a family. Set as `packshot` on the product. |
| 2 | Packshot — alternate angles (2–4 per product) | Product gallery | 4:5 or 1:1 | Same as #1 | Side, top-down, closure open. |
| 3 | **Campaign hero** | Home hero, shop header | 16:9 (supply 3:2 for safety) | Midnight-blue satin, piece off-centre right | Headline sits on the left third — keep it calm. |
| 4 | **On the wrist** (per product) | Story, How it works | 4:5 | Dark tailoring or skin on satin | Shows scale. The most persuasive shot after the packshot. |
| 5 | Wrist + phone tap | Digital identity, How it works | 1:1 or 4:5 | Natural, not staged | Hand bringing a phone close to the piece. No real UI on screen (or a blank dark screen). |
| 6 | Macro details (3) | Craft, gallery | 1:1 and 4:5 | Raking light across brushed/polished surfaces | Edge, closure, finish. |
| 7 | Lifestyle — portrait | "Worn" section | 4:3 landscape | Evening, restrained | Person first, piece visible but secondary. |
| 8 | Lifestyle — event | "Worn" inset, Access | 5:4 | Low light, bokeh | Suggests access without naming a venue. |
| 9 | Texture — satin | Identity background | 3:2 | Blue satin folds | Pure texture, no product. |
| 10 | Environment — horizon/architecture | Final CTA | 16:9 | Dusk, metal/stone | Calm, wide, space on the left for type. |
| 11 | **Wrist sequence** (optional) | Product page, scroll animation | 16:9, 90–150 frames | Continuous render | `/public/media/sequence/<name>/0001.jpg…`, then set `wristSequence` on the product. |
| 12 | Founder portrait (optional) | Proof section | 4:5 | Natural light | Humanises a new brand. |

**Where each type plugs in**
- Products: `src/data/products.ts` → `packshot`, `image`, `gallery`, `wristSequence`
- Everything else: `src/data/media.ts`
