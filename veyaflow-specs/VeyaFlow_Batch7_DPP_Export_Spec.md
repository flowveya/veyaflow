# VeyaFlow — Batch #7: the DPP export surface tells the truth — for Claude Code

**2 September 2026** · findings #70, #67, #68, #69, #41-survivor, #74, #71, #72 (+ #58 root cause, #75 scout) · touches `index.html` and `dpp/index.html`

## BASELINES (verify both before editing)

| File | sha256 |
|---|---|
| `index.html` | `4092f5962b146779d9dfaf8d27d66bd153bfa66db635009297ddcd9e9d18de3a` |
| `dpp/index.html` | `0e8055aa75034d61a61a2897410d3c878017e396ab12e697e1072a6f7b8f378e` |

Both are commit **7f82323** (batch #6). `portal.html`, `brand/index.html` and the Netlify functions are **not touched**.

If either baseline doesn't match, **STOP and report.** Do not proceed on your own assessment of why — that rule is standing since 31 August.

---

## WHY THIS BATCH EXISTS, AND MY PART IN IT

Batch #6 fixed the DPP. Smoking it surfaced **eight further findings on the same surface**, and two of them are mine to own:

**I gated one door of three.** #30 said "the QR download". I specced the QR download. The same panel also exports **JSON** and a **PDF Declaration**, neither gated, both producing compliance artifacts for a passport that returns 404.

**I anchored #41 on one line.** Batch #6 correctly fixed the label in `dppReadiness`. Twenty lines away, the **DPP Data Summary** table has its own hardcoded `['CPNP', sku.cpnp||'—']` row that renders for every product type.

**Standing rule that follows, and it applies to this spec too:** when a finding is *"X is labelled/gated wrongly"*, the spec must require a scout for **every rendering or path of X**, not the line I happened to quote. A narrow anchor produces a narrow fix. **Where this spec names a line number, treat it as a starting point and report every sibling you find.**

---

# PART 1 — #70: the QR encodes whichever domain the brand happened to be browsing

## The finding — the most consequential defect currently in the project

`index.html` L34756 and L33966:

```js
const dppUrl    = window.location.origin + '/dpp/' + dppId;
const publicUrl = window.location.origin + '/dpp/' + dppId;
```

**The QR encodes the browser's current origin.** Generated from `veyaflow.netlify.app`, it points at `veyaflow.netlify.app` forever — on physical packaging.

Meanwhile five places hardcode a different domain: the integration banner (L34862), the unpublished refusal (L34934), the SVG fallback (L34942), the JSON `@context` (L34964), and the Brand Pack prompt (L16832) — all `veyaflow.com`.

**One of the two is wrong on a printed box, and printing is not reversible.** The publish dialog's promise — *"The URL is stable across re-publishes"* — is true only within a single origin.

## The fix

**Introduce ONE canonical origin constant** and read it everywhere a passport URL is produced or displayed. Never derive a passport URL from `window.location.origin` again.

```js
const DPP_CANONICAL_ORIGIN = '…';   // Strategy's ruling — see below
```

**STRATEGY MUST SUPPLY THE VALUE.** If it has not been given to you, **stop and ask** — do not pick one, and do not default to the current origin, which is how this happened.

**Scout every site that builds or prints a passport URL** — the two `window.location.origin` uses, the five hardcoded strings, and anything else you find. Report the complete list. All must read the constant.

**Do not** change `getDPPId`, the id format, or any stored `dppId`. The identifier is fine; the origin around it is not.

**One consequence to state in your report, not to fix:** passports already published carry URLs built from the old origin. Whether those need a redirect or a re-publish is Strategy's call — say what you found, change nothing.

---

# PART 2 — #67: JSON and PDF exports are not publish-gated

Batch #6 gated `downloadDPPQR`. The same panel has two more export paths and neither checks anything:

- `downloadDPPJson` (~L35011) — only `if(!data) return;`, a null guard, not a gate
- `generateDPPPdf`, reached from the **PDF Declaration** button (~L34853), whose own label reads *"Compliance document · Dated + branded"*

A dated, branded compliance declaration for a record that does not exist is worse than the QR, because it reads as an authored document rather than a link.

## The fix

**Reuse batch #6's gate — do not write a second one.** The published test already exists inside `downloadDPPQR`; lift it into a single small helper (name it plainly, e.g. `_dppIsPublished(skuIdOrDppId)`) and call it from all three exports. **One publication test in the file, exactly as `_rpDateExpired` is the one date test.**

Wording for the refusal is yours, but say what the artifact would claim and why that is wrong — not merely "not published".

**Also fix a defect in batch #6's own gate while you are there:** it reads `if(typeof showFailure === 'function'){ … } return;`. If `showFailure` were absent the button would do nothing and say nothing — the silent-disable the batch #6 spec forbade. Add a fallback so the refusal is always visible.

---

# PART 3 — #68: the Brand Pack asserts an unpublished passport, and #58's root cause

## 3A — the assertion (L16832)

```js
${heroSku&&dppData[heroSku.id]&&dppData[heroSku.id].generatedAt
  ? "Also include: Digital Product Passport: ✓ Generated at veyaflow.com/dpp/"+(dppData[heroSku.id].dppId||"pending")+". Ahead of mandatory ESPR date."
  : ""}
```

Three defects in one line, in a **buyer-facing** pack:

1. **Gated on `generatedAt`, not on publication.** A generated-but-unpublished passport is asserted to a retailer with a **✓** and a URL that returns "not found" — automatically, with nobody clicking anything.
2. **"Ahead of mandatory ESPR date"** — an unearned claim, and batch #6 removed exactly this assertion from the banner three metres up the same page. ESPR phases in by product group through delegated acts; there is no single mandatory date.
3. **`|| "pending"`** — if the id is missing it prints `veyaflow.com/dpp/pending` as a live URL.

**Fix:** gate on **published**, using the Part 2 helper. Drop the ESPR claim entirely. If the id is missing, emit **nothing** — never a placeholder URL. Use the Part 1 constant for the origin.

## 3B — the integration banner overstates (L34861)

> *"Your DPP link is automatically added to Section 5 (Compliance) of any Brand Pack generated for this product."*

It fires only for the **hero SKU**, and only when generated. **Fix the wording to match what 3A actually does after your change.** Do not widen the behaviour to match the wording.

## 3C — #58 root cause, one word

The Brand Pack prompt (~L16761) ends: `...targeting ${retailer} in ${market}. April 2026.`

**Hardcoded.** That is why a Brand Pack PDF generated on 31 August carried a section headed "APRIL 2026". Not a rendering bug — the model was told the wrong date.

**Fix:** derive it from the current date. Report the exact format you used.

---

# PART 4 — #69: the QR is a 140px screen preview sold as print-ready

**Measured from a real download: 140 × 140 px.** `downloadDPPQR` calls `canvas.toDataURL()` on the canvas inside `#dpp-qr-container`, which is `width:140px;height:140px` (L34789) — a display element.

Against the panel's own *"Min print size: 10×10mm"*: 140px is 11.9 mm at 300 dpi and **5.9 mm at 600 dpi** — under the stated minimum at the resolution a packaging proof actually uses. At 10mm a Level-Q code's modules are ~0.2mm; resampling a 140px raster to press resolution softens exactly those edges.

**The card also claims "PNG + SVG".** No SVG is ever produced. The SVG branch fires only when there is **no** canvas, and what it writes is not a QR — it is a bordered box containing the text *"QR renders on veyaflow.com"*. If it ever ran, someone would receive a placeholder rectangle labelled as a QR code.

## The fix

**4A — render for print.** `qrcodejs` accepts `width`/`height`. Render a **second, offscreen** instance at print resolution (≥1024px) for the download; leave the 140px one on screen. Do not scale the small canvas up.

**4B — the SVG claim.** `qrcodejs` cannot emit SVG. Either produce a real one or **remove "+ SVG" from the card.** Removing it is acceptable and preferred over adding a library. **Do not leave the claim standing.**

**4C — the placeholder branch.** A fallback that emits a fake QR is worse than no fallback. Make it refuse and explain, like Part 2.

**4D — one comment.** L34893 says *"Use qrcode-generator lib"*; the URL loads **`qrcodejs`**. Different libraries, confusingly similar names. Correct the comment.

**Level Q is correctly set** (`correctLevel: QRCode.CorrectLevel.Q`) — leave it.

---

# PART 5 — #41 survivor and #74, in the DPP Data Summary (~L34812)

```js
['Category', sku.productType||'—'],
...
['CPNP', sku.cpnp||'—'],
```

**#41 survivor:** the CPNP row renders for **every** framework. A device shows a CPNP row *and* no CE row — the field that doesn't apply, and not the one that does. Same defect batch #6 fixed twenty lines away in `dppReadiness`.

**#74:** `Category` prints the raw enum `device`. The public passport prettifies the same value to "Beauty Device" via `prettifyProductType`. Two renderings of one field, and the brand sees the internal one.

**Fix:** route the regulatory row by `resolveProductFramework(sku)` exactly as `dppReadiness` now does — **cosmetic → CPNP, device → CE marking, otherwise → a neutral regulatory reference.** Use the existing resolver; introduce no second one. Prettify the category.

**Scout the whole function for other hardcoded framework assumptions and report them** — this is the second time this one has hidden in a sibling.

---

# PART 6 — #71 and #72 on the public passport (`dpp/index.html`)

**#71 — "NET CONTENT: g".** L206–208:

```js
if(identity.netContent || identity.netUnit) {
  identityRows.push(['Net content', ((netContent||'') + ' ' + (netUnit||'')).trim(), 'mono']);
}
```

With `netContent` empty and `netUnit` `'g'`, the row renders a bare **`g`** on a public regulatory record. **Fix:** render the row only when there is an actual quantity. A unit alone is not a value.

**#72 — "CE Yes".** The badge prints `regulatory.ceMarking` verbatim, and the stored value is the string `"Yes"`. Where CPNP shows a notification number, CE shows a boolean. **Fix the rendering, not the data:** when the value is a plain affirmative, render the badge as a statement (e.g. "CE marked") rather than echoing "Yes". If it holds a real reference, print it. **Do not change the SKU schema.**

**Nothing else in `dpp/index.html` changes.** The regulatory section's data-driven structure and batch #6's carbon block are correct — leave both byte-identical apart from the two edits above.

---

# SCOUT ONLY — #75, the version date

The LED Face Mask page shows three renderings, two disagreeing: header *"Published v1 · 1 Sept 26"*, public passport *"Published 1 September 2026"*, version history *"v1.0 · Updated 27 Aug 2026"*.

**Find what the version-history block reads from and report it. Change nothing.** My working theory is that it prints an edit timestamp under a version label, but I have not scouted it and will not guess.

---

# OUT OF SCOPE

`getDPPId` and the id format · `dppReadiness`'s `done` logic · `estimateCarbon` · `ESPR_TIMELINE` · `scoreReadiness` and everything batches #4/#5/#6 fixed · the SKU schema and DPP payload field list · `portal.html`, `brand/index.html`, all Netlify functions · #53/#73 (their own batch).

---

# STOP. NO COMMIT.

## REPORT BACK

1. **#70:** the complete list of sites that build or print a passport URL, and confirmation every one reads the constant. What value Strategy gave you. What you found about already-published passports — findings only.
2. **#67:** the helper, its name, and the three call sites. Confirm one publication test exists in the file. Confirm the `showFailure` fallback.
3. **#68:** the rewritten line, quoted. Confirm it gates on published, drops the ESPR claim, and emits nothing when the id is missing. The new banner wording. The date fix for #58.
4. **#69:** the download render size, how you produced it offscreen, what you did about the "+ SVG" claim, and what the fallback does now.
5. **Part 5:** the routed row quoted; confirm `resolveProductFramework` is still one definition. **Every other hardcoded framework assumption you found in that function.**
6. **Part 6:** both renders quoted; confirm the rest of `dpp/index.html` is byte-identical.
7. **#75:** what you found. No changes.
8. `sha256sum index.html dpp/index.html` — full 64-character digests.

## VERIFY (byte — coding chat)

- acorn clean: `index.html` **2 blocks**, `dpp/index.html` **1 block**
- `window.location.origin` = **0** occurrences in any passport-URL construction
- one canonical origin constant, **1 definition**; no hardcoded `veyaflow.com/dpp/` outside it
- one publication test, **1 definition**, reachable from QR + JSON + PDF; no export path bypasses it
- `"Ahead of mandatory ESPR date"` = **0**; `/dpp/pending` unreachable
- `April 2026.` literal = **0**
- QR download render size ≥1024; the 140px display container unchanged
- `"PNG + SVG"` claim either satisfied or removed — no standing unmet claim
- fake-QR placeholder SVG = **0**
- `['CPNP', sku.cpnp` hardcoded row = **0**; `resolveProductFramework` still **1** definition
- `dpp/index.html`: regulatory section and carbon block byte-identical; only the two Part 6 edits
- batch #6 intact: `resolveEsprTimeline` returns `category` · `'CPNP/regulatory ref'` 0 · `~65%` panel absent · `estimateCarbon` byte-identical
- batch #5 intact: `_rpDateExpired` 1 def / 4 calls · `checkState` blocker-first · `expiresInDays: 90`
- batch #4/#3 intact: `buildSkuReadiness` 1 · `out of 100` 0 in portal · `persistCritical` 1 · `showFailure` 1
- guards: `['Margin','50%']` 0 · `Beauty Days participation` 6 · `launchSupport` 0 · `_bpAllowed` 2 · `renderCrmEditor` 3 · GLN digits `7312440012653` **2** · `daysUntil` 1
- Truth Batch phrases 0 in both files

**Note on guard counts:** several literals removed by earlier batches survive inside the comments recording their removal. Guards here count **rendered** occurrences. Report a mismatch; do not edit code to satisfy a count.

## ON GREEN

`DPP export truth pass: one canonical passport origin, all three exports gated on publication, print-resolution QR, framework-correct summary row, and the unearned ESPR and integration claims removed (fix batch #7)`

## SMOKE

1. Generate a QR from two different origins — both encode the canonical one.
2. Unpublished passport: **QR, JSON and PDF all refuse** and explain.
3. Downloaded QR is ≥1024px.
4. Brand Pack for a product with a generated-but-unpublished DPP: **no passport line at all**. Publish it, regenerate: the line appears, no ESPR claim, correct date in the heading.
5. LED Face Mask summary: **CE marking row, no CPNP row**, category reads "Beauty Device".
6. Public passport for a SKU with a unit but no quantity: **no Net content row**. CE badge no longer reads "Yes".
