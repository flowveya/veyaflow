# VeyaFlow — Test 3: Listing Checklist

**31 August 2026 · module 3 of 10 · ~25 minutes**

Verdict at the end: **verklig · buggig · skal**.

**Observe, don't fix.** Record *what you did · what you expected · what happened*. Screenshot anything visual.

---

## What changed since the runsheet

The runsheet said *"nothing re-derives ticks from SKU data."* **That was wrong and I'm correcting it before you start.** Ten of the requirements carry an `autoCheck` expression and genuinely derive from the SKU — `sku.ean`, `sku.cpnp`, `sku.safetyRef`, `sku.descDA`, `brand.euResponsible`. The manual ticks sit *on top* of those.

It also predicted ticks could land on the wrong requirement when product type changes. **Also wrong** — ids are stable (`se_label` stays `se_label`), so that specific trap doesn't exist. Step 3.2 has been rewritten to chase the real version of it.

So the module is better built than I assumed. The defects I found are somewhere else, and three of them I have already confirmed in the source. Your job on those is to see them on screen and tell me how bad they look — the confirmation is done.

---

## STEP 3.0 — Setup

Open **Listing Checklist**. Note which retailer and product are selected by default. Only **Apotek Hjärtat (Sweden)** and **Matas (Denmark)** exist in `LISTING_REQUIREMENTS` — if the dropdown offers more, that's a finding on its own.

**RECORD:** retailers offered, products offered, what loaded by default.

---

## STEP 3.1 — Do manual ticks contradict SKU data? (#12)

**3.1.1** Select **Apotek Hjärtat** + the **Face Serum**.

**3.1.2** Find **"Swedish-language label approved"** (`se_label`, no autoCheck — purely manual).

**3.1.3** Tick it, without having any Swedish label data on the SKU.

**EXPECT:** it ticks. Nothing objects. That is by design — it's an intention, not evidence.

**3.1.4** Now the actual question: **does that tick change anything anywhere else?** Check, in order — Brand Home readiness, the COMPLY page blockers, the Submission Tracker card for Apotek Hjärtat, and the portal if you have a live submission.

**RECORD:** every place the number or status moved. **The finding is not that you can tick it — it's whether an intention is read downstream as evidence.**

**3.1.5** Look at the auto-ticked rows. Can you tell, on screen, which ticks were **derived from your data** and which you **ticked yourself**? Screenshot the list.

> That distinction is the whole integrity of the module. If both render as the same ☑, the checklist cannot be read as a record of anything.

---

## STEP 3.2 — The product-type trap, corrected version

Requirement ids are stable, so ticks don't migrate. The real risk is **filtered-out rows keeping their state invisibly**.

**3.2.1** With the **Face Serum** (cosmetic) on Apotek Hjärtat, tick **"CPNP reference on file"** if it isn't already auto-ticked, and note everything currently ticked. Screenshot.

**3.2.2** Change that product's type to a **device** in My Products, then come back.

**EXPECT:** the CPNP and Safety Assessment rows disappear — they carry `productTypes:['cosmetic']`.

**3.2.3** Change it **back** to cosmetic.

**EXPECT — and this is the test:** does CPNP come back **still ticked**?

> If it does, a tick you made when the product was one thing survives its becoming another and returns silently. Defensible as convenience, indefensible if it's read as a current statement. Record which it is.

**3.2.4** Now leave the product as a **device** and click **Print / Save PDF**.

> **Confirmed in source before you ran this:** the screen filters requirements by product type (`getRequirementsForRetailerAndProduct`), but `printRetailChecklist` iterates `reqsObj.requirements` — **unfiltered**. The printed PDF should therefore list CPNP, Safety Assessment and EU RP rows for a device.

**EXPECT:** the PDF shows rows the screen does not.

**RECORD + SCREENSHOT the PDF.** This is the one that leaves the building — it's headed "Listing Checklist", carries the VeyaFlow footer, and goes to a buyer.

---

## STEP 3.3 — Per-retailer scoping

**3.3.1** Tick three items for **Apotek Hjärtat** + Face Serum. Note them.

**3.3.2** Switch to **Matas**, same product.

**EXPECT:** ticks are scoped per retailer (`retailerId::skuId`) — Matas should be independent. The footer promises *"stored locally per retailer per product"*.

**3.3.3** Switch back to Apotek Hjärtat. Your three ticks should be intact.

**RECORD:** did the label match the behaviour?

---

## STEP 3.4 — The expired EU RP, third instance (#50)

**This is the one I most want confirmed on screen.**

**3.4.1** On Apotek Hjärtat + Face Serum, find **"EU Responsible Person confirmed"**.

**EXPECT:** it is **auto-ticked green**.

> Its `autoCheck` is `brand.euResponsible` and the resolver returns `!!(brand.euResponsible && brand.euResponsible.name)`. Your agreement's renewal date — **2025-01-12** — is not consulted. This is a third independent implementation of "has an RP", after `scoreReadiness` and the EU RP page, and none of the three looks at the date.

**3.4.2** Print the PDF and confirm that tick appears there too.

**RECORD + SCREENSHOT.** A ☑ against "EU Responsible Person confirmed", on a document going to a retailer, for an agreement nineteen months lapsed. Batch #5 Part 1B does **not** reach this code path.

---

## STEP 3.5 — Orphaned state

**3.5.1** Console:
```js
Object.keys(JSON.parse(localStorage.getItem('ns_retail_checklist')||'{}'))
```
Record the keys.

**3.5.2** Delete a SKU that has ticks. Re-run the command.

**EXPECT:** keys referencing the dead SKU remain. Harmless clutter **unless a count includes them** — which 3.6 tests.

---

## STEP 3.6 — The downstream count (the one with teeth)

`getIncompleteChecklistSubmissions()` drives the "incomplete checklist" nudge on submissions under review.

> **Confirmed in source:** it reads `reqsObj.requirements` — **unfiltered by product type**, same defect as print — and it only ever looks at **`skuIds[0]`**, the first product in the submission. That is the "one arbitrary product stands for the whole submission" pattern batch #4 removed from readiness, still alive here.

**3.6.1** Console:
```js
getIncompleteChecklistSubmissions()
```

**3.6.2** For a submission containing a **device**, check whether `total` includes cosmetic-only rows (CPNP, Safety Assessment, EU RP). Compare `total` against how many rows the screen actually shows for that product.

**EXPECT:** the numbers disagree, and the device is scored against requirements that do not apply to it.

**3.6.3** For a **multi-product** submission, confirm only the first product is considered. Add ticks to the *second* product and re-run — the count should not move.

**RECORD:** both numbers, verbatim, and where this count surfaces in the UI.

---

## STEP 3.7 — #41 confirm

**3.7.1** Set a product to **Beauty Accessories**. Open the checklist.

**EXPECT:** no CPNP row on screen — the accessory list is GPSR / REACH / material declaration.

> Yesterday the checklist was correct here and the DPP was not. Confirm the checklist still is. If CPNP appears for an accessory on screen, that's a regression and I want to know today.

**3.7.2** Print it. Does the PDF agree with the screen? (It shouldn't — see 3.2.4.)

---

## STEP 3.8 — Persistence

**3.8.1** Tick two items. **Hard reload.** Still ticked?

**3.8.2** Any red failure toast when ticking? Checklist writes go through `persistCritical` (batch #3), so a failure here should be **loud**, not silent.

---

# SEND ME

```
3.0  retailers / products / default:
3.1  tick without data — accepted? Y/N   moved downstream? where:
     can you distinguish auto from manual ticks? Y/N
3.2  CPNP returns still ticked after type round-trip? Y/N
     PDF shows rows the screen doesn't? Y/N   [SCREENSHOT]
3.3  per-retailer scoping correct? Y/N
3.4  EU RP auto-ticked despite 2025-01-12? Y/N   in PDF too? Y/N  [SCREENSHOT]
3.5  orphan keys after SKU delete? Y/N
3.6  getIncompleteChecklistSubmissions() output (paste verbatim):
     total vs rows on screen:
     second product's ticks change the count? Y/N
3.7  CPNP absent for Beauty Accessories on screen? Y/N   in PDF? Y/N
3.8  survives reload? Y/N   any red toast? Y/N
VERDICT: verklig / buggig / skal
```

Screenshots for **3.1.5, 3.2.4, 3.4** at minimum. Send it in one go.

---

## What I expect, so you can tell me if I'm wrong

Three defects confirmed in source, all one root: **the screen filters by product type; the print and the count do not.** The house rule is that product-type data drives framework logic — two of three consumers ignore it.

My guess at the verdict is **buggig**, and that the checklist logic itself is the soundest module we've opened. The defects are in what reads it. If that turns out wrong, your observation beats my scout — say so.
