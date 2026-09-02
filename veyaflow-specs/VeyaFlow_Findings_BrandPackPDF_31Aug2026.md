# VeyaFlow — Brand Pack PDF export: findings #56–#62

**31 August 2026 · coding lane · surface never previously audited**

Source: `VeyaFlow_BrandPack_Cloud__Glow_Lyko_20260831.pdf`, 8 pages, generated today from the live build.

**This is the third Brand Pack surface.** The magic-link viewer (`brand/index.html`) and the portal submission were both audited and fixed in batches #4 and #5. The PDF export was in neither, and it is the one that gets attached to an email.

Ordered by what a retailer would see first.

---

## #56 — an internal QA annotation is printed on the cover

Page 1, beneath the title block, in red:

> `[FLAG_COPY: This pack contains claims VeyaFlow did not source: consumers aged 25–45, Verified. Verify or remove before sending.]`

Built by `honestyFlagCopy()` at L16690, fed from `verifyBrandPackProof` → `extractUnsourcedClaims`.

**The system underneath this is working correctly and is one of the best things in the product.** It read the generated copy, found two claims it could not source, and refused to let them pass silently. One of them is the word **"Verified"** — the same unearned claim batch #5 removed from the magic-link viewer, caught here automatically by provenance checking rather than by a human reading it. That is the honesty architecture doing exactly what it was built for.

**The defect is where the output lands.** It is rendered *inside the deliverable*, on the cover page, of a file named `..._Lyko_20260831.pdf`. The instruction "verify or remove before sending" is addressed to Charlotte, but there is no mechanism to remove it — the flag is baked into the PDF at generation. A brand who exports and attaches without reading page one sends a retailer a document that opens with a machine-generated note saying its contents are unsourced.

**Possible intent:** this may be deliberate — an unusable artifact is safer than a quietly wrong one. If so it is defensible, and I would still change it, because the failure mode is one careless attach and the warning sits in small red type below the fold of a cover page.

**Where it belongs:** in the authoring UI, blocking or gating the export, with the PDF either clean or not produced at all. **Strategy should rule** on gate-vs-warn before anything is built.

## #57 — raw markdown is printed literally

Confirmed at the bytes. The export (~L30155–30165) splits body text on `\n\n`, handles `•` bullets, and does **nothing else**. The LLM returns markdown; the PDF prints the source.

- **Page 3:** `# CLOUD & GLOW | BRAND PACK FOR LYKO | APRIL 2026` — a literal `#` heading, overlapping the page header block.
- **Page 5:** `| Feature | Status |` / `|---------|--------|` and eleven pipe-delimited rows, printed as text.
- **Page 6:** the competitive positioning table, same.

Two of the eight pages present their core content as unrendered table syntax. This is the most visible defect in the document — a buyer does not need to know anything about compliance to see that it is broken.

## #58 — page 3 is blank, and dated four months stale

Page 3 carries only that leaked heading. **No body content at all.** The heading also reads **APRIL 2026** on a document dated 31 August 2026 — so the generated copy carries its own stale date, independent of the header's correct one.

Two questions: why is the section empty, and where does "April 2026" come from? Possibly a cached generation. **Scout before assuming.**

## #59 — the ✓ glyph fails throughout

Page 2 and page 5 render every checkmark as a stray apostrophe:

> `EU Responsible Person   ' Cosmeservice GmbH`
> `COSMOS Organic | ' Certified |`

A font/encoding failure in the PDF library — the tick is not in the embedded font. It reads as a typo on every compliance row of the document.

## #60 — silent truncation mid-word

Page 2, Certifications:

> `' COSMOS Organic, B Corp, Vegan Society, Cruelt`

"Cruelty Free International" is cut mid-word with no ellipsis and no wrap. **Six certifications exist; four and a half are shown.** Silent truncation on a compliance document is the same family as a silent save failure: the reader has no way to know something was dropped.

## #61 — "Confidential — not for distribution"

Both the cover and every page footer carry it. On a document whose only purpose is to be sent to a retailer, and whose filename names that retailer.

Low severity, but it is boilerplate that contradicts the artifact's function, and a buyer noticing it learns the document was not written for them.

## #62 — raw values on a buyer-facing page

Page 2, Brand Snapshot:

- `Annual revenue  2500000 SEK` — no separators. Should be `2 500 000 SEK`.
- `Stage  trading` — a raw lowercase enum, not a display label.

---

## What is working — worth recording

- **`COMPLIANCE STATUS: CPNP — Not filed`, in red.** Correct, and live: it reflects the CPNP field cleared minutes earlier during the batch #5 smoke. The PDF reads real compliance state, not a cached snapshot.
- **"Price range (indicative, not verified)"** on the competitor table — provenance labelling applied without being asked for.
- **`Repeat rate —` / `Press mentions —`** — absent data rendered as absence rather than as zero.
- **The FLAG system itself**, as above.

The document's *content* is largely honest. Its *rendering* is what fails.

---

## Recommendation

**This is its own batch, and it is not urgent in the way #50 was.** Nothing here fabricates a compliance status — the defects are a leaked annotation, an unrendered format, a missing glyph and a truncation. Compare the DPP batch (#41/#27/#30/#31), which sits on a **public** page reached by a QR code on physical packaging: that one leaves the building permanently and should stay ahead of this.

Order I would take them:

1. **DPP truth batch** — public surface, printed QR codes, cosmetics text on devices.
2. **This** — #57/#58 first (the document is visibly broken), then #56 once Strategy rules gate-vs-warn, then #59/#60, then #61/#62.
3. Batch #6 brand-facing (#48 tier checklist, #49 `daysUntil` clamp, #53 device RP, #54 CPNP status disconnect).

**One question for Strategy, and it is not a code question:** has this PDF been sent to a real retailer? If a version went out carrying `[FLAG_COPY: …]`, that is worth knowing before the next pitch, and it is the kind of thing that is easier to find out today than in six months.
