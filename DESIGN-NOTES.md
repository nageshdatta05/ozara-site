# Why great jewellery sites feel different — and what the OZARA skeleton now does about it

Benchmarks: Cartier, Tiffany, Van Cleef & Arpels, Bottega Veneta, Mejuri,
Apple, Aesop, Oura. What separates them is rarely one effect — it is a set of
decisions that reduce doubt and let the product carry the page.

## 1. The product photograph is the design
**What they do.** A strict photographic system: identical studio packshots on
a neutral ground for anything you can buy; campaign imagery only for mood. The
shopper compares like with like, instantly.
**Psychology.** Processing fluency — things that are easy to see feel more
trustworthy and more valuable. Consistency signals control and craft.
**Before.** One dark, AI-generated mood for everything; no packshot; the
product never seen plainly.
**Now.** A `packshot` slot per product. When present, the collection stage,
cards and gallery show it whole on a light `#EBE9E4` stage (the configurator
approach). `IMAGE-GUIDE.md` specifies every shot.

## 2. Clarity before poetry
**What they do.** Brand line + plain explanation. You know what it is in five
seconds.
**Psychology.** Cognitive load and the "what is this?" test. Ambiguity reads as
risk; people leave rather than decode.
**Before.** Every heading was a poetic line with an italic accent word.
**Now.** Hero eyebrow says *NFC fine jewellery*; sub-line says what a tap does.
Italic accents kept for two signature lines only (hero, closing).

## 3. Never look unfinished
**What they do.** Missing information is absent, not apologised for.
**Psychology.** Trust is eroded by visible gaps; repeated "to be announced"
signals a brand that isn't ready — and makes the price feel risky.
**Before.** "Details to be announced" in a dozen places.
**Now.** Tables and accordions render only real facts. Pre-launch products
show one confident status line (`launch.status`, `launch.note`) and a
waiting-list form. Empty content slots are visible in development only.

## 4. One action per view
**What they do.** A single, solid, rectangular primary button. Secondary
actions are text.
**Psychology.** Hick's law — fewer choices, faster decisions.
**Now.** `.btn-solid` / `.btn-line` / `.btn-text` hierarchy; the collection
stage has one button; product page has one action (buy, or join the list).

## 5. Capture intent
**What they do.** Pre-launch brands live on the waiting list: email capture
on the product page, in the footer area, at the end of the story.
**Psychology.** Commitment & consistency — a small "yes" now makes the later
purchase more likely. Scarcity/exclusivity ("first access") raises desire.
**Before.** `mailto:` links only.
**Now.** `WaitlistForm` on every product page and the closing section. Set
`waitlist.endpoint` (Klaviyo/Mailchimp/Shopify/etc.) and it posts JSON; until
then it opens a pre-filled email so no sign-up is lost.

## 6. Commerce infrastructure = reassurance
**What they do.** Sizes, finishes, delivery, returns, warranty, packaging,
client care — visible near the buy button.
**Psychology.** Loss aversion: the fear of a wrong size or a costly return
stops more purchases than price does.
**Now.** `variants.sizes` / `variants.finishes` render selectors; `specs`
renders the details table; `services` renders service promises under the
button. All hidden until you fill them.

## 7. Social proof and a human face
**What they do.** Press, client words, the founder's story.
**Psychology.** Social proof and authority — especially decisive for a new
brand with no heritage.
**Now.** `Proof` section (press, testimonials, founder note), data-driven,
absent until real quotes exist. Never invent them.

## 8. Restraint in motion and decoration
**What they do.** Motion confirms actions; it does not perform. No custom
cursors, few effects, fast reveals.
**Psychology.** Delays feel like friction; novelty effects read as "startup"
rather than "maison".
**Now.** Custom cursor removed, reveals faster and shorter, shadows trimmed,
body text heavier and higher-contrast.

## 9. Signature moments — few and meaningful
Keep: the identity card (the USP, made tangible), the configurator-style
collection stage, the NFC "how it works". These are where OZARA is different;
everything else should be quiet so they stand out.

## Launch checklist (fill → the site completes itself)
1. Packshots for each product → `packshot`
2. Real names, descriptions, `price`, `availability: "available"`, `checkoutUrl`
3. `specs`, `materials`, `features`, `variants`
4. `services` (only confirmed promises)
5. `waitlist.endpoint`
6. `proof` and `founder` (only real)
7. Campaign, wrist, macro and lifestyle images per `IMAGE-GUIDE.md`
