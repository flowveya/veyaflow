# VeyaFlow — Portal Truth Batch FIXUP — for Claude Code

**27 August 2026** · follow-up to the Portal Truth Batch v1.1 apply · three small edits

## CONTEXT — read this first

The Truth Batch v1.1 has been applied and byte-verified. It is **correct and stays**. Nothing below undoes any of it.

Byte-verification found three residual defects. Two are hardcoded wrong-answer defaults that contradict the batch's own house rule (*data drives framework logic, never hardcoded assumptions*); one is a badge that is suppressed in normal operation. All three are a few lines each.

**These fold into the SAME single commit as the Truth Batch.** Do not commit separately. Apply → STOP → coding chat verifies → one commit covering both.

## VERIFIED BASELINE (your files must match these before you edit)

| File | sha256 |
|---|---|
| `index.html` | `9b9ec7e0edfce001ed6b31a4282ba3b08eeb872e375a2be63bf4759a0902ae8d` |
| `portal.html` | `b6edaa4616b4636ed21a870754d0dbb1ddca20a09ab083c7ddd2153c0dbed514` |
| `netlify/functions/supabase-proxy.js` | `7d1d2e895c4011673a1b45268ac0e433ca06b74aa2abffaee5e1042d2c9df90b` |

If they don't match, stop and say so. Line numbers below come from these exact files — re-scout anyway.

---

## FIX B — `frameworkOf` must not assume cosmetics for unknown product types

**File:** `portal.html` · **Anchors:** `FRAMEWORK_COLUMNS` L1058-1068, `FRAMEWORK_LABELS` L1069, `frameworkOf` L1070-1074

**Defect.** `frameworkOf()` returns `'cosmetic'` for anything that isn't recognisably a device, including an empty or missing `productType`. `buildPortalSkuSnapshot` sends `sk.productType || ''`, so any untyped SKU ships `''` → falls through to cosmetic → the buyer is shown a **CPNP column and a ✗** for a product whose regulatory framework is unknown. That is a hardcoded cosmetics assumption presented as a compliance fact — the class this batch exists to eliminate.

It also hits every submission already stored in Supabase, whose `sku_data` predates the `productType` field entirely.

**Fix.**

1. Add a third entry to `FRAMEWORK_COLUMNS`:
   ```js
   unknown: [
     { label:'EU RP', cell:function(sk){ return sk.euRp || brandRpOnFile; } },
   ],
   ```
   EU Responsible Person is required under both frameworks, so it is the only check that can be honestly asserted without knowing the product type. No CPNP, no CE.

2. Add to `FRAMEWORK_LABELS`:
   ```js
   unknown: 'Product type not specified'
   ```

3. `frameworkOf()` returns `'unknown'` when `productType` is empty, missing, or unrecognised. Only an explicit device match returns `'device'`; only an explicit cosmetic match (`cosmetic`, `cosmetic_*`) returns `'cosmetic'`. **Delete the bare `return 'cosmetic'` fallthrough.**

4. In the group render, when `fw === 'unknown'` **and** `groupKeys.length === 1` (i.e. the whole submission is untyped), still show the `FRAMEWORK_LABELS.unknown` heading — the buyer must see that the framework wasn't stated, not silently get a short table. Currently the heading only renders when `groupKeys.length > 1`.

**Do not** invent a product type, guess from the SKU name, or add a caveat like "assumed cosmetic". Omit-beats-caveat: show the checks that can be earned, and label the gap.

---

## FIX C — market-code mapping must not default unknown markets to Sweden

**File:** `index.html` · **Anchor:** `computeLiveReadiness`, `nameToCode` ~L39043

**Defect.**
```js
var tgtCodes = (brand.targetMarkets||[brand.currentMarket||'Sweden']).map(function(m){ return nameToCode[m]||'SE'; });
```
`nameToCode` covers eight countries. Every other market — Finland, Poland, Spain, anything — silently becomes `'SE'` and is scored against the **Swedish** retailer registry. The resulting number is then sent to the portal and displayed to a buyer as this brand's readiness. A wrong number presented as a real one.

**Fix.** Return `null` for unmapped markets and drop them:

```js
var tgtCodes = (brand.targetMarkets||[brand.currentMarket||'Sweden'])
  .map(function(m){ return nameToCode[m] || null; })
  .filter(Boolean);
```

If `tgtCodes` ends up empty, `computeLiveReadiness()` returns `null` — the existing `readLatestReadinessScore()` fallback chain then tries `savedReports`, then `null`, and Part 1-C renders **"Not scored"**. That is the correct outcome: no score is better than a Swedish score for a Finnish launch.

Add a brief comment saying unmapped markets are skipped deliberately, so nobody "helpfully" restores the default later.

**Do not** expand `nameToCode` with more countries as the fix. The point is that an unmapped market must not silently become a different market. Expanding the list is fine as a separate improvement, but the `|| null` must land regardless.

---

## FIX E — Submission Tracker nav badge must not be suppressed by the stale badge

**File:** `index.html` · **Anchor:** L4329-4330

**Defect.**
```js
if(stale>0) html+='<span class="nav-badge alert">'+stale+'</span>';
else if(unseenPortal>0) html+='<span class="nav-badge">'+unseenPortal+'</span>';
```
`stale` counts submissions sitting in `under_review` for more than 21 days. Whenever there is at least one, the portal-alert count — the thing 2-E was approved to add — never renders. In a real account with any ageing submission, the enhancement is invisible.

**Fix.** Render both, independently:

```js
if(stale>0)        html+='<span class="nav-badge alert">'+stale+'</span>';
if(unseenPortal>0) html+='<span class="nav-badge">'+unseenPortal+'</span>';
```

Two separate `<span>`s, stale first (red `.alert`), portal second (accent). They mean different things — one is "this has gone quiet", the other is "the retailer just moved". Neither should hide the other.

Check the flex/`margin-left:auto` behaviour on `.nav-badge` with two badges present — the existing rule uses `margin-left: auto`, which on two siblings pushes only the first. If the pair renders wrong, wrap them in a single flex container rather than changing `.nav-badge`, which other nav items share.

---

## NOT IN THIS FIXUP (logged, do not touch)

- **Existing Supabase rows lack `productType` / `euResponsible`.** New submissions carry them; stored ones don't. This is data, not code. Charlotte smokes against a NEW submission. A backfill is a separate decision.
- **`computeLiveReadiness` scores `skus[0]`, not the submitted SKUs.** Faithful to Brand Home exactly as the v1.1 spec asked, so this is a spec-level question, not a defect in your work. Logged for Strategy — likely a v2 slice.
- **Dimension normalisation (percentage-of-max).** Ratified as-is for now.
- Everything else in the v1.1 OUT-OF-BATCH list.

---

## STOP. NO COMMIT.

## REPORT BACK

Per fix: what you changed and at which line. Plus:

1. How `frameworkOf` now classifies: `''`, `undefined`, `'cosmetic'`, `'cosmetic_leaveon'`, `'device'`, `'beauty_device'`, and an unrecognised string like `'supplement'`.
2. Whether the two-badge render needed a wrapper element (Fix E), and what you did.
3. `sha256sum index.html portal.html`

---

## VERIFY (byte — coding chat)

- acorn clean on `index.html` (2 blocks); `portal.html` parses (1 block)
- **B:** `FRAMEWORK_COLUMNS.unknown` exists · `unknown` branch has no CPNP and no CE · bare `return 'cosmetic'` fallthrough gone (quote the new return) · unknown heading renders at `groupKeys.length === 1`
- **C:** `|| null` + `.filter(Boolean)` present · no `|| 'SE'` remaining in `computeLiveReadiness` (grep `'SE'` in that function = 0 outside the `nameToCode` table itself)
- **E:** two independent `if` statements, no `else if` · both badge spans reachable
- **Banned phrases still 0** across `index.html`, `portal.html`, `supabase-proxy.js`: `pre-qualified by VeyaFlow` · `were completed by the brand` · `All compliance checks`
- **No-regression guards** (index.html): `['Margin','50%']` **0** · `Beauty Days participation` **6** · `launchSupport` **0** · `_bpAllowed` **2** (1 declaration + 1 use) · `renderCrmEditor` **3** · `ns_crm` setItem **1** · validPages pitch-free · `articleNotification` **1** · GLN `7312440012653` **2**

## ON GREEN

ONE commit covering the Truth Batch **and** this fixup:

```
Portal Truth Batch: remove fabricated claims, honest null-states, correct sync ordering, framework-correct columns (test round fix batch #1)
```

→ push `f2b-async:coding-aug2026` → auto-deploy → Charlotte's smoke.
