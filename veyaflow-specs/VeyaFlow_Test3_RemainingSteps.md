# VeyaFlow — Test 3, remaining steps: 3.2.4 · 3.4 · 3.6

**31 August 2026 · ~15 minutes · observe only, fix nothing**

Three steps. Each has a **prediction made from the source before you ran it** — if what you see disagrees, your observation wins and I want to know.

Two need setup first. Do **STEP 0** or two of the three tests will return nothing and look like a pass.

---

# STEP 0 — Setup (3 minutes)

## 0.1 — Restore the RP renewal date to the expired one

You cleared it during the batch #5 smoke, which was the right test then. **3.4 needs it expired again.**

1. Brand profile → EU Responsible Person → **Update existing RP**
2. Set renewal date to **`2025-01-12`**
3. Save

**Write down that you did this.** At the end of 3.4 you set it back to `2026-12-31`. Do not leave it expired.

## 0.2 — Create a submission the count can actually see

`getIncompleteChecklistSubmissions()` has two filters, and your current submissions fail both:

- it only looks at submissions with status **`under_review`** — yours read *Received* and *Rejected*
- it only looks at retailers present in `LISTING_REQUIREMENTS`, which contains **exactly two**: `apotek_hjartat_se` and `matas_dk`. **Lyko is not one of them.**

So:

1. Create a submission to **Apotek Hjärtat** (not Lyko) containing the **LED Face Mask** — the device is the point of 3.6.
2. In the portal, set that submission's status to **Under review**.
3. Come back to the brand side and reload.

> **Prediction, and it's a finding in its own right:** with only two of roughly twenty-eight registry retailers carrying a requirements list, this nudge can never fire for a Lyko, Åhléns, Kicks or Matas-DK submission. Worth confirming that's a data gap rather than a lookup bug.

---

# STEP 3.2.4 — the PDF ignores product type

**Confirmed in source:** the screen filters requirements through `getRequirementsForRetailerAndProduct(retailer, sku)`. `printRetailChecklist` iterates `reqsObj.requirements` — **unfiltered**.

**3.2.4.1** My Products → set the **LED Face Mask** to product type **device** (it should already be).

**3.2.4.2** Listing Checklist → select **Apotek Hjärtat** + **LED Face Mask**.

**3.2.4.3** **Count the rows on screen and write down the list.** Screenshot it.

**PREDICT:** no CPNP row, no Safety Assessment row, no EU Responsible Person row — all three carry `productTypes:['cosmetic']`.

**3.2.4.4** Click **Print / Save PDF**. Don't print — just look at the preview.

**PREDICT:** the PDF lists **CPNP reference on file**, **Safety Assessment on file** and **EU Responsible Person confirmed** — rows the screen just told you don't apply to this product.

**3.2.4.5** Count the PDF's rows. **Screenshot it.**

**RECORD:** screen row count vs PDF row count, and exactly which rows appear only in the PDF.

> Why this matters more than it looks: the PDF is headed "Listing Checklist", carries the VeyaFlow footer, and is the artifact a brand hands a buyer. A cosmetics-only requirement listed against an LED device is the same defect as the DPP's "ESPR cosmetics packaging" on a device — cosmetics concepts applied to a product the regulation doesn't cover.

---

# STEP 3.4 — the RP tick on a printed document

**Confirmed in source:** `retailChecklistAutoCheckValue('brand.euResponsible', sku)` returns `!!(brand.euResponsible && brand.euResponsible.name)`. **Existence only.** `renewalDate` is never read.

This is the **fourth** independent implementation of "has an RP". Batch #5 fixed two of them (`scoreReadiness`, twice) and the EU RP page. This one it did not reach.

**3.4.1** With the renewal date now at **2025-01-12** (Step 0.1), go to Listing Checklist → **Apotek Hjärtat** + **Face Serum** (cosmetic — the RP row only appears for cosmetics).

**3.4.2** Find **"EU Responsible Person confirmed"**.

**PREDICT:** auto-ticked, green, no warning of any kind.

**3.4.3** Cross-check the same brand data on two other screens, in this order:

| Screen | Predicted |
|---|---|
| EU Responsible Person page | **amber box, "EU RP agreement expired"** (batch #5) |
| Portal, on a **fresh** submission | **▲ needs attention** (batch #5) |
| **Listing Checklist** | **✓ green, unqualified** |

**RECORD all three.** One brand, one agreement, one date — three screens, and only two of them now know it lapsed.

**3.4.4** Click **Print / Save PDF** and confirm that ✓ appears on the printed sheet. **Screenshot it.**

**3.4.5 — restore.** Set the renewal date back to **`2026-12-31`** and save. Don't skip this; a stale expired date will confuse every later test.

---

# STEP 3.6 — the count that scores a device against cosmetic requirements

**Confirmed in source:** `getIncompleteChecklistSubmissions()` reads `reqsObj.requirements` — **unfiltered by product type**, same defect as print — and looks only at **`skuIds[0]`**, the first product in the submission. That's the "one arbitrary product stands for the whole submission" pattern batch #4 removed from readiness, still alive here.

**3.6.1** Console (brand side):

```js
getIncompleteChecklistSubmissions()
```

**PREDICT:** one entry, for the Apotek Hjärtat submission from Step 0.2, shaped `{id, retailerName, incomplete, total}`.

If it returns `[]`, Step 0.2 didn't take — check the status really is *under review* and the retailer really is Apotek Hjärtat.

**3.6.2** Note **`total`**. Then count the rows the Listing Checklist shows on screen for that same device.

**PREDICT:** `total` is larger. It includes CPNP, Safety Assessment and EU RP — rows the screen correctly hides for a device.

**RECORD both numbers.**

**3.6.3** Add a **second product** (the Face Serum) to a new Apotek Hjärtat submission, set it to under review, and tick a few requirements **on the second product only**. Re-run the command.

**PREDICT:** the count does not move. Only `skuIds[0]` is ever read.

**3.6.4** Find where this number surfaces in the UI — a nudge, a banner, a badge on the Submission Tracker. **Screenshot it.**

> The number itself is the finding. "3 of 11 requirements outstanding" on a device, where four of the eleven are cosmetics-only, is a fabricated denominator — the same class as the blended readiness score, on a smaller surface.

---

# SEND ME

```
0.1  RP set to 2025-01-12:            done / not
0.2  Apotek Hjärtat submission under review: done / not
     did it appear? (3.6.1 returned something)  Y/N

3.2.4  screen rows: ......  PDF rows: ......
       rows in PDF only:
       [SCREENSHOT screen + PDF]

3.4    checklist EU RP tick:      ✓ / other
       EU RP page:                amber / green
       portal fresh submission:   ▲ / ✓ / –
       ✓ present in printed PDF:  Y/N   [SCREENSHOT]
       RP date restored to 2026-12-31: done / not

3.6    getIncompleteChecklistSubmissions() output (paste verbatim):
       total: ......   screen rows for same product: ......
       second product's ticks moved the count? Y/N
       where it surfaces in the UI:            [SCREENSHOT]

VERDICT for Test 3: verklig / buggig / skal
```

---

## My prediction for the verdict

**buggig** — and specifically: the checklist's own logic is the soundest thing we've opened. Ticks don't migrate, ids are stable, scoping is per retailer per product, ten requirements genuinely auto-derive from SKU data, and a manual tick is read by nothing that treats it as evidence.

**Every defect is in what reads it.** The screen filters by product type; the print and the count do not. That's one root cause with two symptoms, plus the RP date gap it shares with three other places in the app.

If the module turns out worse than that — if something on screen is wrong rather than something downstream — say so plainly. I've been wrong twice on this module already.
