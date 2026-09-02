# VeyaFlow — Batch #3: Save Integrity — for Claude Code

**28 August 2026** · fix batch #3 of the test round · touches `index.html` only

## BASELINE (verify before editing)

| File | sha256 |
|---|---|
| `index.html` | `630128cad71d6a3a14d96ccdd0e828bce0fc4710dc632bbaf85dcc0e049bcfde` |

If it doesn't match, STOP and say so. Line numbers below are from this exact file — **re-scout every anchor**.

`portal.html` and `supabase-proxy.js` are NOT touched by this batch.

## WHY THIS BATCH EXISTS

Test 2 finding **#40**, confirmed by controlled test on the deployed build: with `localStorage.setItem` forced to throw for `ns_skus`, Charlotte edited a product, clicked SAVE PRODUCT, and **the app reported a clean save**. No error, no toast, no console line. Storage kept the old value while the screen showed the new one.

Scouting shows this is a **class, not an instance**: of 77 `localStorage.setItem` calls, **38 sit inside a silent `catch(e){}`**. Every store holding work the user typed — brand, SKUs, CRM, DPP, CSRD answers, claims library, retail submissions — fails invisibly.

Two structural facts make it worse:

1. **`ns_skus` has no server mirror.** Nothing else holds a copy. There is no undo.
2. **There is no `showError`.** The app has `showSuccess` (L4178) and no counterpart anywhere in 40,000 lines. The failure path is silent because it has never had a vocabulary.

Every other finding in this test round is a display defect — a wrong label, a wrong colour, a number that doesn't reconcile. Those mislead. **This one destroys work while reporting success.**

## WHAT IS DELIBERATELY NOT IN SCOPE

Cache and dismissal writes are **correctly** silent and must stay that way. A failed "nudge dismissed" flag is not data loss, and surfacing it would train users to ignore the warning that matters. **Do not touch** these: `compCacheKey` (L14710), `inciCacheKey` (L18215), `packagingCacheKey` (L18335), `supplierRiskKey` (L25680), `savePageState` (L3967), `ns_sidebar_hidden`, `ns_trial`, `ns_autofill_done`, `ns_atm_show_admin`, `ns_show_parked`, `ns_readiness_viewed`, `ns_portal_last_checked`, `ns_sku_type_submitted`, `ns_no_customs_checks`, and every `*Dismiss*` / `*_dismissed` / `dismissKey` write.

---

# PART 1 — the two missing primitives

## 1A — `showFailure(message, detail)`

The counterpart to `showSuccess` (L4178). Place it directly beneath.

Requirements, and they differ from `showSuccess` deliberately:

- **Does NOT auto-dismiss.** `showSuccess` disappears after 3.2s. A failure the user didn't see is the bug we're fixing. It stays until dismissed by an explicit close control.
- Visually distinct and unmissable — error styling, not the success green.
- Shows `message` prominently and `detail` (the error text) in smaller type, so a support conversation has something to work with.
- Re-entrant: a second failure while one is showing must not stack infinitely. Replace, or show a count.
- Never used for anything but genuine failures. Do not repurpose it for validation hints.

## 1B — `persistCritical(key, value)`

One function every user-data write goes through. Returns `true` on verified success, `false` otherwise.

```js
function persistCritical(key, value){
  // 1. serialise once (callers pass the OBJECT, not a string — see Part 2)
  // 2. attempt localStorage.setItem
  // 3. VERIFY: read the key back and compare length to what was written.
  //    A write that silently truncates is as bad as one that throws.
  // 4. on throw or verify-mismatch:
  //      a. attempt ONE cache eviction pass (Part 1C), then retry once
  //      b. if it still fails: console.error, showFailure(...), return false
  // 5. return true
}
```

**On the read-back check:** compare the length of the re-read string against the length written. Full string comparison is unnecessary and costs more on large stores; length catches both a failed write and a truncated one.

**The failure message must be specific and actionable.** Not "Save failed". Something the user can act on — that the change was NOT saved, which store it was, and that they should copy their work before continuing. Word it yourself; the requirement is that a non-technical user reading it understands *their data is not safe right now*.

## 1C — cache eviction on quota pressure

The realistic cause of a quota failure is the caches, not the user's data. `ns_skus` is under 2 KB; the INCI, packaging and competitive-analysis caches hold generated text and grow unbounded.

Add an eviction helper that, when a critical write fails, removes keys matching **only** the known cache prefixes — `ns_inci_`, `ns_packaging_`, `ns_comp_`, `ns_supplier_risk_` (scout the exact prefixes; do not guess) — oldest-first if a timestamp is available, then allows one retry.

**Hard rule: eviction must NEVER remove a key that is not a known cache prefix.** Write it as an allowlist of prefixes, never a denylist. Deleting user data to make room for user data is a worse bug than the one we're fixing. If you cannot determine a key's class with certainty, leave it.

---

# PART 2 — route the critical stores through it

Each site below currently reads roughly `try{ localStorage.setItem(KEY, JSON.stringify(X)); }catch(e){}`. Replace with `persistCritical(KEY, X)` — **note the callee serialises**, so pass the object.

Where the enclosing function is a named `saveX()`, **return the boolean** so callers can react. Do not change any caller's behaviour in this batch beyond that — no new UI flows; the toast is the user-facing change.

**Core stores — user work, highest priority:**

| Line | Key |
|---|---|
| 1829, 1899, 17040, 17088, 38709, 39013 | `ns_brand` |
| 2010 | `ns_brand` AND `ns_skus` — **split into two calls**, currently one `try` covering both, so a throw on the first silently skips the second |
| 17593 | `ns_skus` (`saveSkus` — the confirmed #40 site) |
| 26926 | `ns_crm` |
| 35606 | `ns_sourcing_crm` |
| 33767 | `ns_dpp` |
| 34010, 34017 | `ns_csrd_answers` |
| 21523 | `ns_claims_library` |
| 21770 | `ns_pif_checks` |
| 3964 | `ns_reports` |
| 36835, 39279 | `ns_retail_submissions` |
| 36843 | `ns_retail_checklist` |
| 36851 | `ns_retail_performance` |
| 36859 | `ns_retail_comms` |
| 39222 | `ns_portal_alerts` |
| 31201 | `ns_asset_checks` |
| 32829 | `ns_rrp` |
| 32016 | `ns_reg_monitor` |
| 7932 | `ns_market_presets` |
| 25086 | `ns_pitch_scores` |
| 35103 | `ns_mfr_feedback` |
| 35008 | `ns_mfr_field_*` |
| 27461, 35953 | `ns_listing_requests` |
| 1319, 1336 | `ns_manual_suppliers` |
| 12660, 12664, 12709, 12713 | ATM template + audit keys |
| 13924, 13970 | `ns_atm_last_verifier` |
| 20117 | `ns_sku_type_suggestions` |
| 35347 | `ns_referrals` |
| 35311 | `ns_escrow_waitlist` |
| 38951 | `ns_session_id` — identity; a silent failure here breaks every subsequent server call |

**Migrations — L17156, 17216, 17274, 17310, 17389, 17391, 17460, 17462, 17508.** These already `console.warn`, which is more than the real saves do. Route them through `persistCritical` too: a migration that fails to save has left the in-memory schema ahead of storage, which is a corruption path, not a logging nicety. Keep their existing warn text as the `detail`.

**If any site's enclosing logic makes `persistCritical` unsafe** — a hot loop, a call during page teardown where a toast can't render — **name it in your report and leave it**. Do not force it.

---

# PART 3 — #39: the MOQ key the app deletes and then asks for

Migration V8 renames `sku.moq` → `sku.manufacturerMoq` and **deletes `sku.moq` on every page load** (L17500). The SKU form correctly writes `manufacturerMoq` (L20352). But `READINESS_FIELDS` still asks for `moq` in **all four** framework lists — **L17975, L17981, L17987, L17996**.

Result: the scorer reads a field a migration deletes at startup, every time. "Missing: MOQ" is permanent, unsatisfiable through the UI, and costs a silent point on every product ever created.

**Fix:** change the key from `'moq'` to `'manufacturerMoq'` in all four lists. Nothing else.

**Then scout for the same shape elsewhere** — any other reader of a field V2–V8 renamed or deleted. Report what you find; **fix nothing beyond the four keys in this batch.**

---

# STOP. NO COMMIT.

## REPORT BACK

1. Where you placed `showFailure` and `persistCritical`, and the exact user-facing failure message you wrote.
2. The cache prefixes you found for eviction, and confirmation the eviction is prefix-**allowlisted**.
3. A count: how many sites you routed, and the list of any you left with the reason.
4. Confirmation that L2010's combined brand+skus write is now two separate calls.
5. Whether any `saveX()` now returns a boolean that a caller ignores in a way that matters — name it, don't fix it.
6. Anything found by the Part 3 scout for other renamed/deleted-field readers.
7. `sha256sum index.html`

## VERIFY (byte — coding chat)

- acorn clean
- `showFailure` defined exactly once; does **not** auto-dismiss (no `setTimeout(...remove...)` on its element)
- `persistCritical` defined exactly once; contains a read-back verification
- eviction uses an allowlist of cache prefixes — quote it
- **`catch(e){}` count on `localStorage.setItem` lines drops from 38 to the cache/dismissal remainder** — state the expected number in your report and I'll check it
- L2010 is two calls, not one `try`
- `READINESS_FIELDS`: `'moq'` = 0 occurrences, `'manufacturerMoq'` = 4 in the four framework lists
- cache and dismissal sites listed under NOT IN SCOPE are **byte-unchanged**
- **No-regression guards:** `['Margin','50%']` **0** · `Beauty Days participation` **6** · `launchSupport` **0** · `_bpAllowed` **2** · `renderCrmEditor` **3** · `ns_crm` setItem present · validPages pitch-free · `articleNotification` data block at L8484 intact · GLN `7312440012653` **2**
- Truth Batch phrases still **0**: `pre-qualified by VeyaFlow` · `were completed by the brand` · `All compliance checks`
- `resolveProductFramework` still defined once; batch #2's routing intact

## ON GREEN

ONE commit:
`Save integrity: surface persistence failures instead of swallowing them, verified writes with cache eviction, fix MOQ key deleted by migration V8 (fix batch #3)`

→ push `git push origin f2b-async:coding-aug2026` → auto-deploy → smoke.

## SMOKE (Charlotte, after deploy)

1. **Normal save still works.** Edit a product, save, reload — the change persists and you see the usual success toast. This is the control; if it fails, stop.
2. **Re-run the #40 test.** In the console:
   ```js
   const _o = localStorage.setItem.bind(localStorage);
   localStorage.setItem = function(k,v){ if(k==='ns_skus') throw new Error('simulated quota'); return _o(k,v); };
   ```
   Edit a product and save. **You should now get a failure message that does not disappear.** Then hard-reload (no restore needed — reload clears it) and confirm the value reverted, matching what the message told you.
3. **MOQ.** The Listing Checklist / compliance readiness should no longer say "Missing: MOQ" for a product with a manufacturer MOQ set.
4. Spot-check that dismissible nudges still dismiss silently — no failure toasts from ordinary UI state.
