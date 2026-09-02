# VeyaFlow — Batch #4: Readiness Restructure, Buyer-Facing Half — for Claude Code

**28 August 2026** · fix batch #4 of the test round · touches `index.html`, `portal.html`, `netlify/functions/supabase-proxy.js`

## BASELINES (verify all three before editing)

| File | sha256 |
|---|---|
| `index.html` | `dbc6782e77fff7f6b16a8399a96efb3f7399d34910297fa4016ce749fd1b7e18` |
| `portal.html` | `dc9a029b23694c26293eddfdb8cb747389e4d078e5343f53056c5b84b15ad9a5` |
| `netlify/functions/supabase-proxy.js` | `7d1d2e895c4011673a1b45268ac0e433ca06b74aa2abffaee5e1042d2c9df90b` |

If any doesn't match, STOP. Line numbers below are from these files — **re-scout every anchor.**

## THE RULING THIS IMPLEMENTS (Strategy, 27 Aug)

> Readiness is **PER-SKU-PER-RETAILER**, the only primitive: `scoreReadiness(SKU, retailer)`, framework-correct per type. Everything else is **explicit named aggregates**; a single brand-level score is **BANNED** (the `skus[0]` number was a claim with no referent). Portal = per-submission counts + worst-case — *"4 of 5 SKUs ready · LED mask pending CE"* — **never a blended %**. Dimensions derive from the same per-SKU checks displayed beside them, or they don't render: **an aggregate must NAME what it aggregates.**

This batch does the **buyer-facing half only**. Brand-facing surfaces (Brand Home hero, CRM cards, expansion overview, magic-link card, and the missing SKU selector) are **batch #5** — the hero replacement needs Design. **Do not touch them.**

## WHY THIS IS URGENT RATHER THAN TIDY

Test-round findings #37 and #38, both live on the buyer surface today:

- **#37** — the portal renders `COMPLIANCE 100` four lines above a `CLAIMS ✗` on the same card. Every number is real; the juxtaposition is the falsehood.
- **#38** — the three dimensions shown (100 / 100 / 57) cannot arithmetically produce the `75` headline, because two of the five dimensions are silently dropped. A buyer who checks concludes the number is wrong.

Both dissolve if the blended number stops existing.

---

# PART 1 — `index.html`: build per-SKU readiness into the submission

## 1A — new helper: `buildSkuReadiness(skuIds, retailerId, marketCode)`

Place near `buildPortalSkuSnapshot` (**scout — ~L39190 region**). For each SKU in the submission, call the **existing** `scoreReadiness(brand, sku, marketCode, retailerId)` — unchanged, it is the ruled primitive — and return:

```js
[{
  name,                 // sku.name
  ean,                  // sku.ean
  framework,            // resolveProductFramework(sku).framework  (batch #2)
  ready,                // TRUE only when this SKU has ZERO red blockers for THIS retailer
  blockers: [ {level:'red'|'amber', label} ]   // this SKU's own blockers, labels only
}]
```

**Rules:**

- `ready` is defined **only** as "no red blockers for this retailer in this market". Amber does not block. State this definition in a code comment so nobody redefines it silently later.
- **Never** compute an average, total, percentage or score across SKUs. Not in this helper, not anywhere in the payload.
- Use the submission's **actual** retailer and target market — not `skus[0]`, not a registry default. If the retailer can't be resolved, return `null` for the whole structure rather than scoring against a substitute. **A wrong referent is worse than no answer.**
- Framework comes from `resolveProductFramework`; an `unknown` framework yields `ready:false` with the existing `productTypeUnknown` amber blocker surfaced by name.

## 1B — `buildPortalBrandPack` (scout — `verified`/`verifiedTier` at ~L39154)

- **DELETE `readinessDimensions` from the pack entirely.** It is the source of #38. Nothing replaces it in this batch — dimensions return only when they are per-SKU checks shown beside the checks they aggregate, which is not this batch.
- Remove the `_live`/`computeLiveReadiness` dimension block feeding it.
- Leave `verified` / `verifiedTier` in the pack — Part 4 changes how the flag is *earned*, not how it is carried.

## 1C — the submission payload

Where `portal.submission.create` is called (scout — the `createRetailSubmission` wrapper), change the payload:

- **Remove `readinessScore`.** Stop sending a blended number.
- **Add `skuReadiness`** from 1A, built with that submission's retailer and market.

## 1D — `buildSubmitSnapshot` (~L37577) and `computeLiveReadiness` (~L39219)

Both compute a brand-level number from `skus[0]`.

- `buildSubmitSnapshot` — replace its `score` with the per-SKU structure from 1A. If callers expect a scalar, **report what they are; do not invent a scalar to satisfy them.**
- `computeLiveReadiness` — used only to feed the payload's score and dimensions. With both gone, **delete it** unless a scout finds a live consumer. If one exists, name it and leave the function; do not repurpose it.

**Note for the report:** `computeLiveReadiness` deliberately omits the `calcProfileCompleteness()` fallback that Brand Home's hero uses (test finding #15). That asymmetry is intentional and correct. The hero is batch #5.

---

# PART 2 — `supabase-proxy.js`: carry the new shape

`mapSubmissionRow` (**L105–131**):

- Keep `readinessScore: row.readiness_score` **for legacy rows only** — existing submissions in the table have it and Part 3 needs to distinguish them.
- **Remove `readinessDimensions`** from the mapped output.
- **Add** `skuReadiness: bp.skuReadiness || null`.

`portal.submission.create` (**~L406–440**) — `readiness_score` may keep receiving `null`; do not repurpose the column. Note in your report whether the column should be dropped later; **do not alter the schema in this batch.**

---

# PART 3 — `portal.html`: counts and worst-case, never a percentage

## 3A — the submission card (`renderSubmissionCard`, ~L933–969)

Currently a big score box, `out of 100`, and a tier clause.

**Replace the score box with a count:**

- With `skuReadiness`: **"3 of 4 products ready"**, and beneath it, when any product is not ready, the worst-case named — *"LED Face Mask — CE marking missing"*. Pick the worst as: the first SKU with a red blocker, naming its **first red blocker**. If several, say **"and 2 others"** rather than listing them on a card.
- All products ready: **"4 of 4 products ready"**. No tick, no score, no percentage.
- `skuReadiness` absent (legacy row): render **"Not scored"** in muted type, exactly as the Truth Batch does today. **Do NOT fall back to the legacy `readinessScore` number** — a blended % is banned whether it is fresh or historical.
- Keep the Truth Batch's `tierClause` guard **exactly as is**.

## 3B — the detail view (`renderDetail`, ~L1024–1048)

- **Delete the readiness hero** (the 3rem number and `/ 100`).
- **Delete the four-dimension breakdown loop entirely** — this is #37 and #38 removed at the root.
- Replace the "Readiness breakdown" card with a **"Product readiness"** card listing each SKU by name with its framework label and either **"Ready"** or its **named blockers**. This is the aggregate naming what it aggregates.
- One line under the heading stating the rule: *"Ready = no blocking issues for this retailer."* The buyer must know what the word means.
- Legacy rows: the honest "Not scored" panel already shipped in the Truth Batch. Keep it.

## 3C — the inbox filter (~L819 and ~L882–888)

`inboxFilter.readinessMin` filters on `(s.readinessScore||0) < min` with options 60/70/80/90. That filter **cannot survive** — it sorts on the banned number, and it silently excludes unscored submissions by treating null as 0.

Replace with a two-state filter: **All products** / **Has blocking issues**, computed from `skuReadiness`. Legacy rows without `skuReadiness` must be **included** in "All" and **excluded** from "Has blocking issues" — never silently dropped.

Update `getFilteredSubmissions` and the filter bar together, and remove `readinessMin` from `inboxFilter` and `clearFilters`.

---

# PART 4 — the Verified tier must stop being granted from one product

`calcVerificationTier` (**L7087–7112**) grants Tier 1 partly on:

```js
const sku0 = skus[0]||{};
const hasGoodReadiness = allMktCodes.some(mc => { ... scoreReadiness(brand, sku0, mc, ...).total >= 70 });
```

A brand-level trust claim — shown to buyers via `brand.verifiedTier` — derived from **one arbitrary product's score**. It is the banned scalar wearing a trust badge.

**Replace with a named aggregate:** every SKU in the catalogue has **zero red blockers** in at least one target market. Not an average, not a threshold on a total — a stated condition over a named set.

**Two hard requirements:**

1. If the catalogue is empty, `hasGoodReadiness` is **false**. No products cannot mean ready.
2. **This will revoke Tier 1 from brands that hold it on the old basis, including Cloud & Glow.** That is the correct outcome — the tier was granted on a claim that had no referent. Flag it prominently in your report; Charlotte needs to expect it before she sees it.

Do not touch the manual override (`brand.verificationTier >= 2`), `calcProfileCompleteness`, or the red-claims condition.

---

# OUT OF SCOPE — do not touch

Brand Home hero (`renderReadinessHero`, ~L7395) · `renderVerificationCard` (~L7313) · `renderMagicLinkCard` (~L25535) · `initCRMCards` (~L26879) · `renderExpansionOverview` (~L30834) · `renderReadinessScore` (~L6720, and the missing SKU selector) · `renderPitch` (parked) · `scoreReadiness` itself — **the primitive is correct and must not change.**

---

# STOP. NO COMMIT.

## REPORT BACK

1. Your exact definition of `ready` as implemented, and confirmation no average/total/percentage is computed anywhere in the new code.
2. What happens when the submission's retailer cannot be resolved.
3. Whether `computeLiveReadiness` had any live consumer besides the payload — deleted or kept, and why.
4. Every caller of `buildSubmitSnapshot` that expected a scalar `score`, and what each does now.
5. Confirmation that legacy rows (no `skuReadiness`) render "Not scored" and are **never** shown the old blended number.
6. The Part 4 aggregate as implemented, and whether Cloud & Glow's current data still earns Tier 1.
7. `sha256sum index.html portal.html netlify/functions/supabase-proxy.js`

## VERIFY (byte — coding chat)

- acorn clean on `index.html` (2 blocks); `portal.html` parses; proxy `node --check` OK
- **`readinessDimensions` = 0 occurrences** in all three files
- **`out of 100` = 0** in `portal.html`; no `/ 100` in the detail view
- `readinessMin` = 0 occurrences in `portal.html`
- `skuReadiness` present in all three files
- no `Math.round`, `/`, or `%` operating on a cross-SKU total in the new code — quote the helper
- `scoreReadiness` signature **unchanged**; `resolveProductFramework` still defined once
- Part 4: no `scoreReadiness(brand, sku0` remaining in `calcVerificationTier`
- **Out-of-scope functions byte-unchanged**: `renderReadinessHero`, `renderVerificationCard`, `renderMagicLinkCard`, `initCRMCards`, `renderExpansionOverview`, `renderReadinessScore`
- Batch #3 intact: `persistCritical` once, `showFailure` once, silent `catch(e){}` on setItem lines still **10**
- No-regression guards: `['Margin','50%']` **0** · `Beauty Days participation` **6** · `launchSupport` **0** · `_bpAllowed` **2** · `renderCrmEditor` **3** · GLN **2** · validPages pitch-free · `articleNotification` data block intact
- Truth Batch phrases still **0**: `pre-qualified by VeyaFlow` · `were completed by the brand` · `All compliance checks`

## ON GREEN

ONE commit:
`Readiness restructure (buyer-facing): per-SKU counts and named blockers replace the blended score, dimensions removed, Verified tier no longer granted from one product (fix batch #4)`

## SMOKE (Charlotte, after deploy)

1. **New submission → portal:** the card shows **"N of M products ready"**, not a number out of 100. If something is blocked, the product is **named** with its blocker.
2. **Detail view:** no 3rem score, no four coloured bars. A "Product readiness" list naming each product, its framework, and Ready or its blockers — with the one-line definition of Ready.
3. **The old test submission:** still reads "Not scored". It must **not** show its stored blended number.
4. **Inbox filter:** "Has blocking issues" behaves; unscored legacy rows appear under "All" and never silently vanish.
5. **Expect your Verified tier to disappear.** It was granted on one product's score. If it survives, every product in your catalogue is genuinely clear of red blockers in a target market — check that's true before believing it.
