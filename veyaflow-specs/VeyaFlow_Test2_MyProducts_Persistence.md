# VeyaFlow — Platform Test Round · TEST 2: My Products persistence

**27 August 2026** · run against the deployed `f972ad2` build (batch #2 live)
Verdicts: **verklig** (real) · **buggig** (works but defective) · **skal** (shell — looks real, isn't)
Method: **observe first, fix later.** Record what happens. Do not fix anything mid-test.

## WHY THIS MODULE IS HIGH-RISK

Scouted from the shipped file before writing this:

- **No server mirror.** `ns_skus` is localStorage only. Every other core store has a Supabase path; this one has none. Clearing site data destroys your product catalogue.
- **Silent save failures.** `saveSkus()` (L17592) is `try{ localStorage.setItem(...) }catch(e){}` — an empty catch. If the write fails (quota, private mode, corrupted store) you are told **nothing** and the UI continues as if saved.
- **Eight migrations run on every load.** `migrateSkuSchemaV2` → `V8` (L17108–17508) each read, rewrite and re-save `ns_skus` at startup. Any one mis-handling a field silently rewrites your data, on every refresh, with no undo and no backup.
- **A combined write at L2010** saves `ns_brand` and `ns_skus` inside one `try`. If it throws between them, one persists and the other doesn't.

**Before you start: take a backup.** Open the console on the app and run:

```js
copy(JSON.stringify({skus:localStorage.getItem('ns_skus'), brand:localStorage.getItem('ns_brand')}))
```

Paste into a text file and save it. If this test corrupts something, that file is the only way back.

---

## 2.1 — Round-trip fidelity

1. Create a new product. Fill **every** field the form offers — name, EAN, product type, net content, country of manufacture, RSP, MOQ, descriptions, INCI/ingredients, certifications, claims, carbon, recycled content, whatever the form has.
2. Note the time. **Hard-reload** the page (Cmd-Shift-R).
3. Open the product again and compare field by field against what you entered.

**Record:** any field that is empty, changed, reformatted, truncated, or reordered. Note the exact before/after value.

**Watch especially for:** numbers that came back as strings or vice versa, values that lost a decimal, text that lost its line breaks, multi-select fields that came back with fewer items, and any field that silently reverted to a default.

## 2.2 — The migration gauntlet

The eight migrations run at every load, so 2.1 already ran them once. This step checks they're *idempotent* — that running them repeatedly doesn't keep changing your data.

1. After 2.1, note the product's full state.
2. Hard-reload **three more times**.
3. Compare again.

**Record:** anything that differs between reload 1 and reload 4. A field that changes on reload 2 but not reload 3 is a migration that isn't idempotent — that's a **buggig** verdict and a data-integrity finding, not a cosmetic one.

## 2.3 — Edit persistence

1. Open an existing product and change three fields of different types — a text field, a number, and a dropdown.
2. Navigate **away without an explicit save** (click another nav item). Come back.
3. Then repeat, this time saving explicitly, then reload.

**Record:** whether unsaved edits are silently kept, silently lost, or warned about. All three are defensible designs; **silently keeping them is the dangerous one**, because you can't tell what's persisted.

## 2.4 — Silent save failure (the one that matters most)

This deliberately breaks the save so you can see what the app tells you. **Do the backup first.**

In the console:

```js
const _orig = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(k,v){ if(k==='ns_skus') throw new Error('simulated quota'); return _orig(k,v); };
```

Now edit a product and save it. Then:

```js
localStorage.setItem = _orig;
```

**Record:** did the UI show any error? Did it look like it saved? Reload and check whether the edit survived.

**Expected from the code:** the app will appear to save and the data will be gone on reload, with no warning at any point. If that's what happens, it's a confirmed finding — a silent-data-loss path on the one store with no server backup.

## 2.5 — Cross-surface consistency

One product, five surfaces. Open each and record what it shows for the **same** SKU:

| Surface | What to record |
|---|---|
| My Products | the values as entered |
| COMPLY / readiness | product type routing, which blockers appear |
| DPP page | DPP readiness %, the data summary fields |
| Article Templates (Apotek Hjärtat) | auto-filled vs missing counts |
| Portal (new submission) | the products table columns and values |

**Record:** any field that differs between surfaces, and any completeness percentage that disagrees with another. **Finding #29 is already open here** — the DPP list said 50% while the DPP detail said 60% for the same product. Confirm whether that reproduces and find a third number if there is one.

## 2.6 — Product type, end to end (closes finding #13)

1. Create a product and **leave the type unset**. Check it reads "Product type not specified" everywhere — COMPLY, Listing Checklist, DPP, and a fresh portal submission. Confirm nothing calls it a cosmetic and no CPNP row appears.
2. Set the type to **Beauty Device**. Re-check the same five surfaces.
3. Set it to **Beauty Accessories** — the third option in `PRODUCT_TYPES`. This one is least exercised; check it doesn't fall back to cosmetic anywhere.

**Record:** any surface still showing cosmetics requirements for a device or accessory. Note that `PRODUCT_TYPES` offers only three options while the resolver knows seven frameworks — check whether legacy-typed SKUs (supplement, food, textile) can still be *displayed* even though they can't be *chosen*.

## 2.7 — Delete and recover

1. Delete a test product.
2. Reload.

**Record:** is there a confirmation step? Is there any undo? Does the deletion survive reload? Does anything elsewhere still reference the deleted SKU — a submission, a DPP record, an article template, a checklist row? **A dangling reference to a deleted product is a finding**, especially if a portal submission still lists it.

## 2.8 — The no-mirror reality check

Do not perform this on your main browser profile.

Open the app in a **private window** or a different browser. Log in / load as you normally would.

**Record:** what you see. Expected: no products at all, because there is no server mirror. Then record **how the app presents that** — does it say your data is device-local, or does it look like an empty account? If a user could mistake "this device has no data" for "my data is gone", that's a finding on its own.

---

## RECORDING THE RESULTS

For each of 2.1–2.8, note: **what you did · what you expected · what happened**. Screenshots for anything visual. Then an overall verdict for the module — verklig, buggig, or skal — with the reasoning in one line.

Send them here and I'll trace each observation to its code path before anything gets specced. Nothing gets fixed during the test.

## PRE-REGISTERED — already known, don't re-open

- **#13** product type unset on real C&G SKUs — being closed by 2.6
- **#29** DPP 50% vs 60% for one product — being confirmed by 2.5
- **#24** LLM refusal text stored in the Danish description field
- **#12** Listing Checklist manual ticks contradict SKU data (Test 3's module)
- Silent `catch(e){}` in `saveSkus` — 2.4 exists to characterise it, not to rediscover it
