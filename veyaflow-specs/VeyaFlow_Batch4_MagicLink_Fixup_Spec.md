# VeyaFlow — Batch #4 FIXUP: the magic-link Brand Pack still ships a blended score

**28 August 2026** · folds into the SAME commit as batch #4 · finding #44

## BASELINE

| File | sha256 |
|---|---|
| `index.html` | `daec4fb3cb6f0908ac7a35984f36115295a88a2c21ee9fb8823f126a3407e7d0` |

`portal.html` and `netlify/functions/supabase-proxy.js` are **already correct and must not be touched** (`0ec4bed3…` / `78c4f6a2…`).

## WHY

Batch #4's spec put `renderMagicLinkCard` out of scope as brand-facing. **That was wrong, and it was my error, not yours.** Verification traced where its output actually goes:

`renderMagicLinkCard` (~L25535) builds `brandPackData` — including **`readinessScore: rsScore`** at ~L25642 — and POSTs it to `/.netlify/functions/share-brand-pack`, producing the magic link that is pasted into pitch emails to retailers (*"Full brand verification pack: {url}"*, L15818–15820, L24925, L25019) and rendered at `brand/index.html`.

So a **blended brand-level score is still shipped to buyers**. Worse than the portal's was:

- it is computed from `heroSku` — one arbitrary product;
- with `retailerId: ''`, which falls through to `RETAILER_REGISTRY[0]` — **an arbitrary retailer the brand may have no relationship with**;
- and it lands in front of a retailer with no surrounding context at all.

Strategy's ruling is unambiguous: a single brand-level score is banned, and an aggregate must name what it aggregates. This one names nothing.

## THE FIX

### 1 — `index.html`, `renderMagicLinkCard`

- **Delete `readinessScore: rsScore`** from `brandPackData`.
- **Delete the `rsScore` computation** — the `let rsScore = null` declaration and the `try { const rs = scoreReadiness(...) ; rsScore = rs.total } catch(e){}` block (~L25600–25605). It has no other consumer; confirm by scout before deleting.
- Do **not** substitute per-SKU readiness into the pack in this fixup. The pack viewer's design is a separate question and the honest interim is absence, not a replacement metric invented here.
- Everything else in `renderMagicLinkCard` stays. This is a removal, not a rewrite.

### 2 — `brand/index.html` (the pack viewer) — SCOUT FIRST

I have not seen this file. Before editing, scout whether it reads `readinessScore`.

- **If it renders the score:** remove that element **entirely** — no zero, no dash, no "N/A" where a number used to be. Omit-beats-caveat: the reader must not be told a metric exists but is unavailable.
- **If the layout breaks with the element gone**, close the gap; do not leave a labelled empty slot.
- **If it does not read it:** change nothing and say so.

**Backward compatibility matters here.** Brand Packs already shared carry `readinessScore` in their stored JSON, and those links may be live in a retailer's inbox right now. After this fix the viewer must render those **without** the score — the field being present in old data must not resurrect it on screen.

### 3 — `netlify/functions/share-brand-pack.js` — SCOUT ONLY

Check whether it validates, stores or echoes `readinessScore`. **Report what you find; change nothing** unless its absence would throw — in which case make it tolerate the field being missing, and say exactly what you changed.

## STOP. NO COMMIT.

## REPORT BACK

1. Confirmation `rsScore` had no other consumer before you deleted it.
2. What `brand/index.html` did with `readinessScore`, and what it does now.
3. How an **already-shared** pack (stored JSON still containing `readinessScore`) renders after the change.
4. What `share-brand-pack.js` does with the field, and whether you changed anything.
5. `sha256sum index.html` (and `brand/index.html` if changed).

## VERIFY (byte — coding chat)

- acorn clean on `index.html`; `brand/index.html` parses
- `readinessScore` = **0 occurrences** in `renderMagicLinkCard`
- `rsScore` = **0 occurrences** in `index.html`
- `brand/index.html` renders no readiness number from a stored `readinessScore`
- `portal.html` and `supabase-proxy.js` **byte-unchanged** (`0ec4bed3…` / `78c4f6a2…`)
- Batch #4 intact: `buildSkuReadiness` once · `skuReadiness` present · `readinessDimensions` 0 · `out of 100` 0 in portal
- Batch #3 intact: `persistCritical` 1 · `showFailure` 1 · silent setItem catches **10**
- `scoreReadiness` signature unchanged; `resolveProductFramework` once
- Out-of-scope functions still byte-identical: `renderReadinessHero`, `renderVerificationCard`, `initCRMCards`, `renderExpansionOverview`, `renderReadinessScore` (**`renderMagicLinkCard` is now IN scope** — it will and should change)
- No-regression guards: `['Margin','50%']` **0** · `Beauty Days participation` **6** · `launchSupport` **0** · `_bpAllowed` **2** · `renderCrmEditor` **3** · GLN **2** · validPages pitch-free
- Truth Batch phrases still **0** in all files

## ON GREEN

Folds into batch #4's single commit:

`Readiness restructure (buyer-facing): per-SKU counts and named blockers replace the blended score, dimensions removed, Verified tier no longer granted from one product (fix batch #4)`

## SMOKE ADDITION

After deploy, generate a magic link and open it as a retailer would. **No readiness number anywhere on the pack.** If you still have a previously-shared link, open that too — the old stored score must not appear.
