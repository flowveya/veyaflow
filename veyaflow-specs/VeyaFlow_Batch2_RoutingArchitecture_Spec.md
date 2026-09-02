# VeyaFlow — Batch #2: Product-Type Routing Architecture — for Claude Code

**27 August 2026** · fix batch #2 of the test round · touches `index.html` only

## BASELINE (verify before editing)

| File | sha256 |
|---|---|
| `index.html` | `3f23a21aa22ffd87703890f4da538d1ca8abe31c54782025b7830d205034f477` |

If it doesn't match, STOP and say so. Line numbers below come from this exact file and were confirmed by direct read — **re-scout every anchor anyway**.

`portal.html` and `supabase-proxy.js` are NOT touched by this batch. The portal's `frameworkOf()` (shipped in the Truth Batch fixup) is already correct and is the reference implementation this batch generalises.

## WHY THIS BATCH EXISTS — and why the ruled target changed

Strategy ruled batch #2 as "MARKET_REQS gains a product-type dimension." Byte-scouting found `MARKET_REQS` (L1521) has exactly one consumer — `calcReadiness(m, market)` at L1713 — which scores **manufacturers** on the parked sourcing surface. It never touches SKU compliance.

Strategy re-ruled: **retarget to wherever live SKU compliance actually reads; the parked surface gets nothing.** Intent over letter.

Scouting then found there is **no single source to target**. Product-type routing is duplicated across ~19 independent sites, each privately deciding that an untyped product is a cosmetic. **The duplication IS the architecture defect.** This batch replaces it with one resolver.

**`MARKET_REQS` is explicitly OUT OF SCOPE. Do not touch it.**

## THE HOUSE RULE THIS BATCH ENFORCES

Registry/product-type DATA drives framework logic, never hardcoded cosmetics assumptions. Where the framework is not known, that is a **fact to display**, not a gap to paper over with a default. Omit beats caveat; absence beats a wrong value.

---

# PART 1 — the single resolver (build this first)

Add ONE function, placed **before its first consumer** (i.e. above `scoreReadiness` at L6364; anywhere after the constants block is fine — state where you put it).

```js
function resolveProductFramework(sku){
  // Returns { framework, stated }.
  // framework: 'cosmetic' | 'device' | 'supplement' | 'food' | 'textile'
  //          | 'beauty_accessory' | 'unknown'
  // stated:   true only when the SKU itself carries the type. NEVER inferred
  //           from brand category — a Skincare & Beauty brand can sell a device.
  // 'unknown' is a FIRST-CLASS outcome, not an error and not a synonym for cosmetic.
}
```

Classification rules — mirror the portal's shipped `frameworkOf()`:

- empty / missing / non-string → `unknown`
- exact `device`, `beauty_device`, or contains `device` → `device`
- exact `cosmetic` or starts with `cosmetic` (covers `cosmetic_leaveon` etc.) → `cosmetic`
- exact `supplement`, `food`, `textile`, `garment`, `beauty_accessory` → that value (`garment` normalises to `textile`, matching the existing `catMap`)
- anything else unrecognised → `unknown`

**Hard requirements:**

1. **No brand-category inference anywhere in this function.** The existing `catMap` at L6372 infers `cosmetic` from `'Skincare & Beauty'` — that inference is what types a LED face mask as a cosmetic. It does not move into the resolver.
2. Pure function, no side effects, no writes.
3. Add a companion `FRAMEWORK_LABEL = { cosmetic:'Cosmetic · EU 1223/2009', device:'Device · CE framework', supplement:'Supplement', food:'Food', textile:'Textile', beauty_accessory:'Beauty accessory', unknown:'Product type not specified' }` for display use.

---

# PART 2 — route `scoreReadiness` through it

**Anchor: L6364–6376.** Currently:

```js
const catMap = {'Skincare & Beauty':'cosmetic', ...};
const skuType   = sku&&sku.productType ? sku.productType : (catMap[...]||'cosmetic');
const isCosm    = skuType==='cosmetic';
const isDevice  = skuType==='device';
const isAccessory = skuType==='beauty_accessory';
```

Replace the resolution with `resolveProductFramework(sku)`. Delete the `catMap` fallback entirely.

Then handle `unknown` explicitly — this is the substantive part, not a rename:

- `isCosm`, `isDevice`, `isAccessory` all become **false** when framework is `unknown`.
- **Framework-specific blockers must NOT be raised for an unknown framework.** Today L6381–6382 raises `cpnpMissing` ("Blocks all EU pharmacy and beauty retail listings") for anything falsy-typed in an EU market. On an unknown framework that is an invented compliance failure. Suppress every framework-conditional blocker.
- In its place raise ONE blocker: `{id:'productTypeUnknown', level:'amber', label:'Product type not set', impact:'Compliance requirements cannot be determined until the product type is set. Set it on the SKU to see the applicable checks.'}`. Amber, not red — this is missing input, not a failed check.
- **Dimension maxima must not silently shift.** `scoreReadiness` returns `dims` as `{score,max}`. If suppressing framework blockers changes any `max`, the resulting percentages become incomparable with previously stored scores. State in your report, per dimension, whether `max` changes on the `unknown` path — and if it does, say by how much. Do not "fix" it; just report it.
- Framework-agnostic checks (EU RP, EAN, RSP, labelling) continue to run normally on the `unknown` path.

---

# PART 3 — route every remaining live site through it

All of these currently default an untyped SKU to cosmetic. Each must call `resolveProductFramework(sku)` and handle `unknown` honestly rather than defaulting.

**SKU form / SKU display sites** — L17992, L18056, L19650, L20071, L21090, L29107, L29192.
`const type = sku.productType||'cosmetic'` and `skuForm.productType||'cosmetic'` throughout.
Where these DRIVE which fields or checks are shown: show the framework-agnostic set plus a clear "set the product type to see the applicable requirements" affordance. Where they only DISPLAY a value: show `FRAMEWORK_LABEL.unknown`, never a guessed type.

**L29107** is a WRITE: `skuForm.productType = productType||'cosmetic'`. See Part 4 — writes are handled there. Do not simply reroute this one.

**Counting/aggregation sites** — L16020, L16186, L16188.
`skuList.filter(s => (s.productType||'cosmetic')==='cosmetic').length` counts untyped SKUs as cosmetics, which flows into prompt context sent to the LLM. Count `unknown` as its own bucket. If the count feeds prompt text, the prompt must say "N products of unstated type", never fold them into the cosmetic count — a poisoned count produces poisoned copy, which is the honesty-scanner's whole concern.

**Listing Checklist / DPP sites** — L33713, L33794, L33821.
Route through the resolver. On `unknown`, framework-specific checklist rows are **omitted**, with one row stating the product type is unset — the same shape the portal's `unknown` column set already uses.

**L33803 — a separate defect, fix it here:**
```js
{id:'circular', label:'End-of-life routing', done:!!(sku.productType), source:'SKU'}
```
A compliance row marked **done** because a field is non-empty. Setting a product type is not end-of-life routing. Either bind `done` to whatever actually evidences routing, or — if no such evidence exists in the data — render the row as not-done with an honest label. **Do not** leave a green tick sourced from a truthiness check. State which option you chose and why.

**Display-only sites** — L34584, L34726, L34835 already render `sku.productType||'—'` / `||null`. These are honest. **Leave them alone.**

---

# PART 4 — stop minting wrong types at the write sites

Read-time routing is pointless while write time keeps producing bad data.

**L5121–5123 (onboarding):**
```js
const _catTypeMap={'Skincare & Beauty':'cosmetic', ...};
heroSku.productType = onboardForm.heroSkuType || _catTypeMap[onboardForm.category] || 'cosmetic';
```
A brand in "Skincare & Beauty" who never states a type has their SKU **written to storage as a cosmetic**. That is how Cloud & Glow's LED Face Mask became untyped-but-treated-as-cosmetic (test-round finding #13).

**Fix:** `heroSku.productType = onboardForm.heroSkuType || ''`. Delete `_catTypeMap` and the `'cosmetic'` literal. An unstated type is stored as unstated. The resolver then returns `unknown` and the surfaces ask for it.

**L29107:** same principle — persist `''`, not `'cosmetic'`, when the user has not chosen.

**No migration, no backfill.** Do not retroactively write a type onto existing SKUs. Existing untyped SKUs correctly become `unknown`, which is the true state.

---

# PART 5 — ESPR_TIMELINE is structurally always green (test-round finding #20)

**`ESPR_TIMELINE` (L1453) is keyed by brand CATEGORY and its values are STRINGS:**
```js
const ESPR_TIMELINE={ "Fashion & Apparel":"EU Textile Destruction Ban: July 19, 2026...", "Skincare & Beauty":"ESPR cosmetics packaging requirements: 2027...", ... };
```

It is indexed at **L34236, L34296, L34527** as:
```js
const espr = ESPR_TIMELINE[sku.productType]||ESPR_TIMELINE.cosmetic||{urgency:'green',label:''};
```

`ESPR_TIMELINE['cosmetic']` does not exist. `ESPR_TIMELINE.cosmetic` does not exist. **Every one of the three sites therefore always resolves to `{urgency:'green', label:''}`.** The ESPR urgency indicator on the DPP list, the DPP detail page and the **public `/dpp/` page** has never shown anything but green, with a permanently blank label. Even a key that did match would fail, because the values are strings with no `.urgency` or `.label`.

**Fix — provenance or nothing.** Do NOT invent urgency levels or dates. Two acceptable outcomes:

1. **Preferred:** render the ESPR indicator only when a real timeline entry is found for this product; otherwise render nothing at all. No dot, no blank label, no green.
2. If the indicator must occupy the layout, render it in muted/neutral styling with `FRAMEWORK_LABEL.unknown`-style honesty text. **Never green.**

Resolve the lookup against real data: the timeline text is per brand CATEGORY, so index it by category, not by product type — and only where a category is actually set. If you introduce an object shape with `urgency`, every urgency value must come from the data, not from a default. If no dated source exists for a level, do not assert one.

L34525 is the **public** DPP page. Anything asserted there leaves the building.

---

# PART 6 — ATM seed correction (Apotek Hjärtat)

Small, independent, fully sourced. **All correct values already exist in this file** from the shipped AH-PDX registry batch — do not invent or look anything up.

**Anchor: `_ATM_SEED_TEMPLATES.apotek_hjartat_se`, L13255–13258.**

Current seed:
```js
format: 'xlsx',
portalUrl: 'https://leverantor.apotekshjartat.se',
```

Authoritative registry values in the same file:
- **L8425:** `"Formal supplier application at apotekhjartat.se/leverantor. Article notification via the PDX article portal (Excel notifications retired 2026) — request portal invite with legal company name + org.nr to Masterdata.supplier@apotekhjartat.se."`
- **L8427:** `route: 'PDX article portal'`
- **L30886:** `format:'PDX article portal (Excel notifications retired 2026)...'`, `portalUrl:'apotekhjartat.se — PDX invite via Masterdata.supplier@apotekhjartat.se'`

**Two errors in the seed's URL:** the domain is `apotekshjartat.se` but the registry's primary-sourced value is `apotekhjartat.se` (no `s` after `apotek`), and `leverantor` is a **path**, not a subdomain.

**Fix:**
- `portalUrl` → the registry's form: `https://apotekhjartat.se/leverantor`
- `format` → no longer `'xlsx'`; PDX supersedes Excel. Use the format vocabulary the ATM model already uses elsewhere — **scout what other records use and match it**; state your choice. If no non-xlsx value exists in the vocabulary yet, say so and propose one rather than silently inventing.
- Add the PDX invite contact if the seed shape supports it (`submissionContact` exists on the `ahlens_se` record) — `Masterdata.supplier@apotekhjartat.se`, sourced from L8425.

**Do NOT touch** `matas_dk` or `ahlens_se`. Their `format:'xlsx'` at L13277 and L13291 is correct.

---

# OUT OF THIS BATCH (do not touch)

- **`MARKET_REQS` and `calcReadiness`** — parked surface, explicitly excluded by Strategy's re-ruling.
- **`productTypeRouting`** in the ATM template schema (L12692, L12709, L13877) — the field exists, is persisted, and has ZERO consumers. It is the ATM *sheet-routing* axis, a different problem from SKU *compliance* routing. Logged as a "skal" finding; its own batch.
- **Registry → CRM-card refresh-on-load (UX #5)** — deferred to batch #3, not scouted deeply enough to spec honestly.
- The `|| 'SE'` market-default pattern audit (13 sites) — separate batch, needs a Strategy ruling alongside finding #15.
- Brand Home's `calcProfileCompleteness()` substitution (finding #15) — needs a Strategy ruling first.
- Findings #14, #16, #17, #18, #19 — small-batch queue.

---

# STOP. NO COMMIT.

## REPORT BACK

Per part: what changed, at which line. Plus these, all required:

1. Where you placed `resolveProductFramework`, and its classification result for each of: `''`, `undefined`, `null`, `'cosmetic'`, `'cosmetic_leaveon'`, `'device'`, `'beauty_device'`, `'supplement'`, `'garment'`, `'supplement_gummy'`, `'  Device  '`. **Test it, don't read it.**
2. **Whether any `dims` `max` value changes on the `unknown` path in `scoreReadiness`**, per dimension, and by how much.
3. Your choice for L33803 (`done:!!(sku.productType)`) and the reasoning.
4. Your choice for Part 5 — option 1 or 2 — and what the three sites now render when no timeline entry exists.
5. Whether the count sites (L16020/16186/16188) feed LLM prompt text, and how `unknown` now appears in that text.
6. The ATM `format` value you chose for Part 6 and what vocabulary it came from.
7. Any site in Part 3 where handling `unknown` honestly was NOT possible without a larger change — name it and leave it, do not force it.
8. `sha256sum index.html`

**Do not report an item as done if you did not write the bytes for it.**

---

# VERIFY (byte — coding chat)

- acorn clean on `index.html` (expect 2 inline blocks)
- `resolveProductFramework` defined exactly once; returns `'unknown'` on the fallthrough (quote the return)
- **`productType||'cosmetic'` occurrences = 0** across the whole file (currently 12)
- `_catTypeMap` gone from L5122; `catMap` gone from `scoreReadiness`
- L5123 and L29107 persist `''`, not `'cosmetic'`
- `ESPR_TIMELINE[sku.productType]` = 0 occurrences
- `done:!!(sku.productType)` = 0 occurrences
- `MARKET_REQS` **unchanged** — byte-identical to baseline (this is a guard, not a goal)
- `productTypeRouting` **unchanged** — still 4 occurrences, no new consumers
- ATM seed: `apotekshjartat` = 0 · `apotekhjartat.se/leverantor` present · `matas_dk` and `ahlens_se` records byte-unchanged
- **No-regression guards:** `['Margin','50%']` **0** · `Beauty Days participation` **6** · `launchSupport` **0** · `_bpAllowed` **2** · `renderCrmEditor` **3** · `ns_crm` setItem **1** · validPages pitch-free · `articleNotification` **1** · GLN `7312440012653` **2**
- Truth Batch guards still hold: `pre-qualified by VeyaFlow` **0** · `were completed by the brand` **0** · `All compliance checks` **0**

# ON GREEN

ONE commit:
`Routing architecture: single product-type resolver, unknown as first-class, stop inferring type from category; ESPR indicator no longer always-green; AH ATM seed corrected (fix batch #2)`
→ push `git push origin f2b-async:coding-aug2026` → auto-deploy → smoke.

# SMOKE (Charlotte, after deploy)

1. **The LED Face Mask** (untyped): COMPLY/readiness should no longer raise a CPNP blocker against it, and should raise "Product type not set" in amber instead. Listing Checklist shows no cosmetics-specific rows. Nothing anywhere calls it a cosmetic.
2. **Set the LED mask's product type to device**, then re-check: CE-framework checks appear, CPNP does not, and the portal submission (a NEW one) shows the CE column — closing test-round finding #13 end to end.
3. **DPP page for any SKU:** the ESPR indicator is either absent or neutral — **never a green dot with a blank label**. Check the public `/dpp/` page too.
4. **Article Templates → Apotek Hjärtat:** portal link reads `apotekhjartat.se/leverantor` and the format no longer says Excel.
5. Regression sweep: Brand Home hero, COMPLY, CRM cards and Submission Tracker all still render — Part 2 touches the function all four read from.
