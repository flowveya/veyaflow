# VeyaFlow — Today's Runsheet

**28 August 2026 · coding lane · work top to bottom**

Three phases. A is setup and pays for itself within the hour. B ships work already verified and waiting. C is the three test modules.

Estimated: A ~20 min · B ~20 min · C ~90 min.

---

# PHASE A — Setup

## A1. Link your computer to this session

This removes most of yesterday's friction — no more uploading a 2.6 MB file for every verification pass, no stale-copy confusion, sha checks in seconds.

1. Open the **Claude desktop app** on your MacBook.
2. Find this task in the sidebar and open it.
3. Choose **"Link to this computer"**.
4. If the option isn't offered for this task, start a **new task from the desktop app** with your computer selected, and paste the handoff into it.
5. When you connect a folder, connect **`/Users/charlotte/claude-code-test`**.

**Then tell me it's linked** and I'll confirm from my side by reading a file — not by trusting the UI.

## A2. Rotate the GitHub PAT

**Expires 11 September.** Two weeks. Pushes stop dead that day, probably mid-batch.

1. GitHub → Settings → Developer settings → Personal access tokens.
2. Generate a new token with `repo` scope. Set a calendar reminder for a week before its new expiry.
3. Update it wherever git is storing it — first push after rotating will prompt if it isn't cached.
4. Test: `git fetch origin` should succeed silently.

## A3. Housekeeping — two commands

Move the stray root-level function copies that shadow the real ones. They have cost us twice: once when Claude Code scouted the wrong file, once when the wrong proxy reached me for verification.

```
mv anthropic-proxy.js get-brand-pack.js share-brand-pack.js get-dpp.js share-dpp.js _untracked_backup/
```

Then commit the specs of record — four shipped batches are described in files that aren't in the repo:

```
git add VeyaFlow_PortalTruthBatch_Spec_v1.1.md VeyaFlow_PortalTruthBatch_Fixup_Spec.md VeyaFlow_Batch2_RoutingArchitecture_Spec.md VeyaFlow_Batch3_SaveIntegrity_Spec.md VeyaFlow_Batch4_ReadinessBuyerFacing_Spec.md VeyaFlow_Batch4_MagicLink_Fixup_Spec.md
git commit -m "Add specs of record for Truth Batch, batch #2 routing, batch #3 save integrity, batch #4 readiness"
```

No deploy impact — markdown only.

---

# PHASE B — Ship batch #4 (already verified, waiting on you)

Verified green yesterday: four files, all shas matched, out-of-scope functions byte-identical, guards hold.

## B1. Commit and push

```
git add index.html portal.html brand/index.html netlify/functions/supabase-proxy.js
```

```
git status --short
```

**Expect exactly four `M` lines.** If `brand/index.html` is missing, stop and tell me.

```
git commit -m "Readiness restructure (buyer-facing): per-SKU counts and named blockers replace the blended score, dimensions removed, magic-link pack no longer ships a brand-level score, Verified tier no longer granted from one product (fix batch #4)"
```

```
git push origin f2b-async:coding-aug2026
```

## B2. Confirm the build before trusting anything

Wait ~2 minutes, open the app with a cache-buster (`?v=5` on the URL), then in the console:

```js
typeof buildSkuReadiness
```

**Must say `"function"`.** Yesterday we lost a round testing against a stale build. Don't skip this.

## B3. Smoke — five checks

1. **New submission → portal card:** reads **"N of M products ready"**, not a score. Any blocked product is **named** with its blocker.
2. **Detail view:** no 3rem number, no coloured dimension bars. A "Product readiness" list naming each product and its status.
3. **Old test submission:** still says "Not scored" — must NOT show its stored blended number.
4. **Freshly generated magic link:** no readiness section anywhere on the pack.
5. **Previously shared magic link** (if you have one): also none — proves old stored data can't resurrect it.

**Brace for your Verified tier disappearing.** It was granted because one arbitrary product scored ≥70. The new rule requires every product to be clear of blocking issues in a target market. If it survives, check that's actually true before believing it.

---

# PHASE C — Tests 3, 4 and 5

**Method unchanged:** observe first, fix later. Record *what you did · what you expected · what happened*. Screenshot anything visual. **Fix nothing during the test.** Send results after each module rather than all at the end — I'll trace each observation to its code path while you run the next.

Chosen because each already has an open finding pointing at it. These are not blind sweeps.

---

## TEST 3 — Listing Checklist

**Pre-registered:** #12 (manual ticks contradict SKU data) · #41 (CPNP ticks green on a beauty accessory)

**Scouted risk:** ticks are stored in `retailChecklistState`, keyed `retailerId::skuId`, as `{requirementId: true}`. Nothing re-derives them from SKU data. Two consequences worth probing.

**3.1 — Ticks vs reality.** Tick "Swedish-language label approved" for a SKU that has no Swedish label data. Does anything object? Then check whether that tick influences anything downstream — readiness, the portal, the submission tracker. *A checklist that records intentions but is read as evidence is the finding.*

**3.2 — The product-type trap (most interesting).** Set a product to **cosmetic**, tick three requirements, note which. Change the same product to **Beauty Accessories**. The checklist re-tailors — it did for me yesterday. **Now look at which items are ticked.** If ticks are keyed by requirement id and the id set changed, ticks may have landed on different requirements than the ones you agreed to. Record exactly what's ticked before and after.

**3.3 — Per retailer.** Tick items for Lyko. Switch to Matas, same product. Are ticks correctly scoped per retailer, or shared? Both are defensible designs — the finding is if it's inconsistent with the label.

**3.4 — Delete a SKU** that has ticks. Does the state orphan? Check the console:
```js
Object.keys(JSON.parse(localStorage.getItem('ns_retail_checklist')||'{}'))
```
Keys referencing a deleted SKU are harmless clutter — unless a count somewhere still includes them.

**3.5 — #41 confirm.** With a product set to Beauty Accessories, check whether the checklist shows CPNP anywhere. Yesterday the checklist was correct and the DPP was not — confirm the checklist still is.

---

## TEST 4 — Claims / Claim Localizer

**Pre-registered:** #21 (`catMap2` at L22432 infers `cosmetic` from brand category for claim rules — batch #2 did not reach this path)

**This is the highest regulatory stakes of the three.** A wrong claim verdict is the failure that reaches a regulator, not just a buyer.

**4.1 — The #21 confirmation.** Run a claims analysis with a **device** selected. Look at the output for any sign it was assessed under cosmetics rules — references to EU 1223/2009, CPNP, INCI, cosmetic claim regulation. The code sends `Product type: cosmetic` into the prompt whenever the brand category is Skincare & Beauty, regardless of the product. **Screenshot whatever it says about which regime it applied.**

**4.2 — A claim that should differ by market.** Run the same claim against **Sweden** and **Germany**. Yesterday's log references an anti-age claim permitted in one and not the other. Does the verdict actually differ, or is the market a label on an identical answer?

**4.3 — Provenance.** For any red or amber verdict: does it cite a specific regulation, or assert without source? A compliance verdict with no citation is an opinion in a lab coat.

**4.4 — Persistence.** Save a claim to the library. Reload. Still there, unchanged?

**4.5 — Refusal handling.** Give it something it can't assess — an empty claim, or gibberish. Does it say so, or produce a confident verdict? **Finding #24 was an LLM refusal stored as a Danish product description**; check the same failure mode isn't here.

---

## TEST 5 — DPP

**Pre-registered:** #27 (ESPR text says "cosmetics" on a device and an accessory) · #30 (QR downloadable before publishing) · #31 (measured vs estimated carbon indistinguishable) · #41 (CPNP row on a non-cosmetic) · #29 (two completeness numbers for one product)

**Highest external stakes of the three.** The `/dpp/` page is public — no login — and reached by a QR code printed on physical packaging. Anything wrong here leaves the building permanently.

**5.1 — #41 and #27 on one screen.** Set a product to **device**. Open its DPP. Record whether the ESPR line still says "cosmetics packaging requirements", and whether "CPNP/regulatory ref" still ticks green. Both were live yesterday.

**5.2 — #29.** Note the completeness % on the DPP **list** and on the DPP **detail** page for the same product. Yesterday one product showed 50% and 60%.

**5.3 — #31, and take this one seriously.** Look at the Carbon figure. Nothing on screen distinguishes a figure you measured from a category-average estimate — the code carries `confidence: 'LOW'` and a note saying "replace with verified LCA for full compliance", and neither reaches the display. **On a public regulatory record.** Confirm it still shows a bare number.

**5.4 — #30, the one that costs real money.** With a DPP unpublished, click **DOWNLOAD QR (PNG)**. It should still work, next to "Min print size: 10×10mm". That PNG encodes a URL that 404s and nothing stops it reaching a packaging proof. Confirm it downloads.

**5.5 — Publish, then check the public page.** Publish one DPP and open its public URL **in a private window** (no login). Record everything asserted there. Specifically: the "Every product sold in the EU will require a machine-readable DPP" banner (#28 — not true as stated; ESPR phases in by product group), and whether absent fields render as absence or as something worse.

**5.6 — Unpublish, if possible.** Is there a way to take a published passport down? If a QR is printed and the data turns out wrong, what's the recourse? Record what exists.

---

# WHAT TO SEND ME

- After **A1**: "linked" — I'll verify by reading a file.
- After **B1**: the commit and push output.
- After **B3**: what you saw, especially the Verified tier.
- After **each test**: observations plus screenshots. Not batched.

I'll trace each finding to its code path as it arrives, and by the end of the day we'll have five of ten modules tested — which is the point at which the launch estimate stops being a guess.
