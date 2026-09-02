# VeyaFlow — Batch #6: DPP truth pass — for Claude Code

**31 August 2026** · findings #30, #31 (revised), #41 (revised), #27, #28, #66 · touches `index.html` and `dpp/index.html`

## BASELINES (verify both before editing)

| File | sha256 |
|---|---|
| `index.html` | `e50a32e6cc5adb1728a0b682d5f2d821391fce9b7f32ad972f7a7083402ae63c` |
| `dpp/index.html` | `da32a65a57c8b3e260043d47c54fd169ef663b0a678543ea7a4d45909c72170f` |

`index.html` at this sha is commit **9e944fb** (batch #5). `portal.html`, `brand/index.html` and all Netlify functions are **not touched**.

If either baseline doesn't match, **STOP and report** — do not proceed on your own assessment of why. Line numbers are from these files; re-scout every anchor.

---

## FIRST: WHAT I GOT WRONG, CORRECTED BEFORE YOU START

I pre-registered five DPP findings from earlier sessions. Scouting the actual bytes today, **two of them are wrong and one is wrong in an interesting way.** Read this before the work, because the ledger would send you to the wrong file.

**WITHDRAWN — #41 on the public passport.** I logged "CPNP ticks green on a non-cosmetic" as a public-page defect. It is not. `dpp/index.html` L224–239 builds the regulatory section entirely from data: a CPNP badge renders **only** if `regulatory.cpnp` is set, CE only if `ceMarking`, Novel Food only if `novelFoodStatus`. No hardcoded row, no unconditional tick. **The public regulatory section is correct as written — do not touch it.** The real #41 is in the generator's readiness checklist and is a labelling problem; see Part 3.

**REVISED — #31.** I logged "nothing distinguishes a measured figure from a category-average estimate on the public record." Wrong: `dpp/index.html` L286 renders an **`Estimated`** badge. The defect is real but different, and worse in one direction than I described. See Part 2.

**STANDS — #30, #27, #28.** All confirmed at the bytes.

**NEW — #66.** Found while scouting. See Part 4.

**COULD NOT LOCATE — #29** ("two completeness numbers for one product, 50% on the list and 60% on the detail"). I could not find the two computations. **Scout it and report what you find; change nothing.** If only one completeness number exists, say so and I will withdraw the finding.

---

# PART 1 — #30: a print-ready QR for a passport that does not exist

## The finding

`downloadDPPQR(dppId)` (~L34795) has **no publish check of any kind**. It reads the rendered canvas and triggers a PNG download. The button sits directly above:

> `Min print size: 10×10mm · Error correction: Level Q`

That line exists for one reason: someone is putting this on physical packaging.

Until `sharePublicDPP` runs, `/dpp/<dppId>` returns 404 and the public page shows *"Product passport does not exist or has been removed by the brand."* So a brand can today download a print-ready QR, send it to a packaging proof, and print thousands of units pointing at a dead URL. **That is the only defect in this batch that costs real money and cannot be fixed after the fact.**

There is a genuine reason the download exists early: `getDPPId` persists the id before publish and the URL is stable across re-publishes, so artwork can legitimately be laid out ahead of time. The fix must not simply break that.

## The fix

**Gate the download on published state.** `dppData[skuId].publishedVersion` is set on publish (~L33987) — use it, or scout a better signal and say which you used.

- **Published** → download exactly as now. No change.
- **Not published** → **do not produce a print-ready file.** Explain in one line what would happen (the URL is not live yet and the QR would resolve to a "not found" page), and offer the publish action.

**Do not silently disable the button** with no explanation — a dead control teaches nothing. **Do not** produce a watermarked "draft" PNG either: a draft file that reaches a printer is the same accident with an extra step.

**If you believe blocking is wrong** — for instance if you find an existing flow that depends on the pre-publish download — **stop and tell me** rather than designing around it. Strategy may prefer a watermarked proof; that is their call, not ours, and I would rather ship the safe version now.

**Also fix the SVG fallback branch.** When no canvas exists it downloads an SVG containing the URL as text. Same gate applies.

---

# PART 2 — #31 revised: the carbon figure and its provenance

## What is actually wrong

Three separate defects, one root: **`carbonKg` and `carbonEstimated` are two fields, and the public page assumes a relationship between them that the data model does not guarantee.**

`dpp/index.html` L280–290:

```js
if(env.carbonKg !== undefined && env.carbonKg !== '') {
  … <span class="vf-env-value">${esc(String(env.carbonKg))}</span> kg CO₂e
  ${env.carbonEstimated ? '<span class="vf-env-est">Estimated</span>' : ''}
}
```

The payload (`index.html` ~L33952) publishes both fields separately, straight from the SKU.

**Defect A — the estimate-only case renders nothing.** The "Use estimate" button (~L20633) writes `skuForm.carbonEstimated` and leaves `carbonKg` empty. That is the ordinary path for a brand with no LCA. The guard tests `carbonKg`, so **the entire Environmental carbon row is silently dropped** from the published passport. The brand believes they published a carbon figure; the regulator sees no carbon data at all.

**Defect B — a measured figure gets labelled "Estimated".** If a brand used the estimate button and *later* entered a real `carbonKg`, both fields are populated. The page renders the **measured** number and, because `carbonEstimated` is truthy, stamps **Estimated** on it. A verified LCA figure mislabelled as a guess. Conservative for the regulator, materially unfair to the brand, and simply false.

**Defect C — provenance is destroyed at capture, not at display.** `estimateCarbon` (~L34064) returns:

```js
return {estimate, confidence:'LOW', note:'Category-average estimate. Replace with verified LCA for full compliance.'};
```

The button consumes `.estimate` and **discards `confidence` and `note`**. Everything downstream then sees a bare number. This is why the information cannot be recovered later — it was never stored.

## The fix

**2A — `dpp/index.html`: choose the figure, then label it.** One value, one provenance, derived together:

- `carbonKg` present → render it, **no badge**. It is measured.
- `carbonKg` absent and `carbonEstimated` present → render **that** value, **with the Estimated badge**.
- Neither → render nothing, as now.

The badge must describe **the number being shown**, never the mere existence of another field.

**2B — the badge should say what it means.** "Estimated" alone does not tell a regulator what kind of estimate. Add a short qualifier from the estimator's own words — *category average, not a verified LCA* — or a tooltip carrying it. **Wording is yours; do not invent a confidence level or a methodology name.** The only sourced text available is the `note` string above; use it or a faithful shortening.

**2C — `index.html`: stop discarding provenance at capture.** At the "Use estimate" button (~L20633), surface `e.note` to the brand at the moment they accept the estimate — inline text near the field is enough. They are about to put a category-average number on a public regulatory record and should be told so once, plainly.

**Do not** change the SKU schema, add new persisted fields, or alter `estimateCarbon`'s maths. **Do not** publish `confidence` to the passport payload — it is an internal label and would need its own design.

---

# PART 3 — #41 revised and #27: framework conflation in the generator

Both are the same error in different places: **cosmetics vocabulary applied to a product that is not a cosmetic.** Neither is on the public page.

## 3A — #41: the readiness row label (~L34028)

```js
{id:'cpnp', label:'CPNP/regulatory ref', done:!!(sku.cpnp||sku.ceMarking||sku.novelFoodStatus), source:'SKU'}
```

**The `done` logic is correct** — it accepts a CE marking for a device and a Novel Food status for a supplement. Do not change it. **The label is wrong**: an LED face mask shows a green tick beside a row that reads "CPNP", and CPNP does not apply to devices under EC 1223/2009.

**Fix:** derive the label from the SKU's framework using the existing `resolveProductFramework(sku)` — cosmetic → CPNP wording, device → CE wording, and a neutral "Regulatory reference" for anything else including `unknown`. **Do not build a second framework resolver**; batch #2 exists precisely so there is one.

## 3B — #27: the ESPR line

`resolveEsprTimeline()` (~L1458) reads the **brand category**, not the product, and `ESPR_TIMELINE` (~L1467) is keyed by category. So a Skincare & Beauty brand returns *"ESPR cosmetics packaging requirements: 2027"* for **every** SKU, the LED face mask included.

Batch #2's comment documents this as deliberate, and it is **defensible as a brand-level statement**. It is misleading only because it renders inside a per-product context and appears to describe the product.

**Fix — the smallest honest one:** at the three call sites (~L34463, ~L34523, ~L34754), make the scope explicit. Render it as a statement about the brand's category, not about the SKU on screen — e.g. prefixed with the category it derives from. **Do not** re-key `ESPR_TIMELINE` by product type and do not invent device or accessory entries: that would be fabricating regulatory dates, which is the thing we are here to prevent. If a per-product ESPR line is wanted later, it needs sourced data first — a Strategy/registry task, not a coding one.

**Report which of the three call sites are per-product and which are brand-level.** If one is genuinely brand-level already, leave it.

---

# PART 4 — #28 and #66: claims with no referent, in the generator

## 4A — #28: the ESPR banner (~L34439)

> "Every product sold in the EU will require a machine-readable DPP. The QR code on your packaging links to this record."

**Not true as stated.** ESPR phases in **by product group, via delegated acts**. There is no universal present-tense requirement, and cosmetics are not in the first wave. Batteries have their own regulation and timeline.

**Fix:** state what is actually known — that ESPR introduces DPP requirements progressively by product group, and that the timing for a given category depends on its delegated act. **Do not name a date for cosmetics.** If you cannot write it without asserting a date, write the shorter version that asserts less.

## 4B — #66 (new): the hardcoded "data advantage" panel (~L34500–34506)

```js
"VeyaFlow already captures ~65% of mandatory DPP fields from your SKU data."
['Product identity + EAN','INCI / materials list','Country of manufacture',
 'CPNP / CE / regulatory refs','Certifications (COSMOS, GOTS…)','Circular routing (Circular GPS)']
   .map(f => `<div style="background:#ECFDF5;color:#065F46">✓ ${f}</div>`)
['Carbon footprint (kg CO2e)','Recycled content %','Recyclability declaration','Take-back scheme']
   .map(f => `<div style="background:#FEF2F2;color:#991B1B">✗ ${f}</div>`)
```

**Six green ticks and four red crosses, all string literals, computed from nothing.** The panel tells a brand their INCI list and regulatory refs are captured whether or not those fields hold anything, and tells them their carbon footprint is missing **even when `carbonKg` is populated**. The "~65%" has no computation behind it.

This is the `|| 'Verified'` fallback and the always-green ESPR indicator in a third costume: a status display with no referent.

**Fix — one of two, your choice, and say which:**

1. **Compute it.** Each row derives from the same SKU fields the DPP payload already reads (~L33936–33954). The percentage becomes the count of populated fields over the total.
2. **Delete the panel.** Omit-beats-caveat. A panel that cannot tell the truth cheaply should not be on the page.

**Do not** keep the literals and soften the wording. **Do not** invent a denominator for "mandatory DPP fields" — if you compute the percentage, it must be over the fields this code actually checks, and the label must say so.

---

# OUT OF SCOPE — do not touch

The public regulatory section of `dpp/index.html` (correct as written) · `estimateCarbon`'s maths · the SKU schema and the DPP payload field list · `scoreReadiness` and everything batches #4/#5 touched · `portal.html` · `brand/index.html` · all Netlify functions · the listing-checklist module (its own batch, and Test 3 findings are still being written up).

---

# STOP. NO COMMIT.

## REPORT BACK

1. **#30:** what signal you used for "published", what the button does when not published, and the exact wording shown. Confirm the SVG fallback is gated too.
2. **#31:** the new render block quoted. Confirm all three cases — measured only, estimate only, both. Confirm the badge describes the displayed value.
3. **#31C:** where `e.note` now surfaces, and confirmation that `estimateCarbon` and the SKU schema are unchanged.
4. **#41:** the label derivation quoted; confirmation `done` logic is byte-identical and that you used the existing `resolveProductFramework`.
5. **#27:** which of the three call sites you changed, which you left, and why; confirmation `ESPR_TIMELINE` data is byte-identical.
6. **#28** and **#66:** new wording; for #66 which option you took and, if computed, the exact field list behind the number.
7. **#29:** what you found. Change nothing.
8. `sha256sum index.html dpp/index.html` — full 64-character digests.

## VERIFY (byte — coding chat)

- acorn clean: `index.html` **2 blocks**, `dpp/index.html` **1 block**
- `downloadDPPQR` unreachable in an unpublished state — grep every call path
- carbon: the public render tests `carbonKg` **and** `carbonEstimated`; the badge is emitted from the displayed value, not from field presence
- `estimateCarbon` byte-identical; `ESPR_TIMELINE` byte-identical; the DPP payload field list byte-identical
- `resolveProductFramework` still **1** definition; no second framework resolver introduced
- `'CPNP/regulatory ref'` literal = **0**; no hardcoded CPNP label reachable from a device
- `~65%` = **0**; the six green literals gone or computed
- `dpp/index.html` regulatory section byte-identical
- batch #5 intact: `_rpDateExpired` 1 definition / 4 call sites · `euRpExpired` present · `checkState` blocker-first (`if(satisfied)` after both loops) · `expiresInDays: 90` · `'Verified brand profile'` 0 in `brand/index.html`
- batch #4 intact: `buildSkuReadiness` 1 · `out of 100` 0 in portal · `rsScore` 0
- batch #3 intact: `persistCritical` 1 · `showFailure` 1 · silent setItem catches **10**
- guards: `['Margin','50%']` **0** · `Beauty Days participation` **6** · `launchSupport` **0** · `_bpAllowed` **2** · `renderCrmEditor` **3** · GLN **2** · `daysUntil` **1** (untouched, #49)
- Truth Batch phrases **0** in all files

## ON GREEN

`DPP truth pass: QR download gated on publication, carbon provenance derived from the displayed figure, framework-correct regulatory labels, and the unearned field-coverage and ESPR claims removed (fix batch #6)`

## SMOKE

1. Unpublished DPP → Download QR refuses and explains. Publish → download works.
2. A SKU with **only** an estimate: the public passport now shows the figure **with** the Estimated badge (today it shows nothing).
3. A SKU with a measured `carbonKg` and a leftover estimate: **no** Estimated badge.
4. LED Face Mask in the generator: the regulatory row no longer reads "CPNP", and the ESPR line reads as a brand-category statement.
5. The "data advantage" panel is gone, or its ticks change when a field is cleared.
