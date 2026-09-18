# VeyaFlow — #237: a gate that exists and is bypassed · and the self-awarding dot

**18 September 2026 · coding lane → CC · ruled by Strategy**

**Two subtractions in one file. Neither needs a ruling; both were settled by measurement.**

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`27b69d30b0c1a6a0cf7557a65a7dd47e84e3b8a775b99177e59b8a0d30fa68b9`, branch `f2b-async` at
`7ba014e`, clean tree, 57 gates GREEN. **Confirm all eleven. Only `index.html` moves.**

---

## PART 1 · #237 — THE GATE IS PRESENT AND TWO OF ITS THREE CONSUMERS IGNORE IT

**`getRequirementsForRetailerAndProduct(retailerId, sku)` (37391) filters retailer rows by
`productTypes` and appends `PRODUCT_TYPE_REQUIREMENTS`.** **Two consumers read
`reqsObj.requirements` raw instead:**

| site | function |
|---|---|
| **38396–38398** | `getIncompleteChecklistSubmissions` — the **Home** counter |
| **39807** | `printRetailChecklist` |

**MEASURED, device SKU under review:**

| retailer | Home counter (ungated) | checklist page (gated) |
|---|---|---|
| Matas | **5 of 8 incomplete** | **12 of 15 open** |
| Apotek Hjärtat | **8 of 10 incomplete** | **14 of 15 open** |

**The two sets are not subsets. The gated path both FILTERS and APPENDS, so for a device the raw read
is a different set and a smaller one.**

> **The Home counter understates the remaining work by more than half, on a submission already under
> review.** **It fails FLATTERING — third instance this week, after `filled: true` and the −150%
> margin. Nobody investigates good news.**

### THE OPEN QUESTION IS CLOSED — DO NOT RE-OPEN IT

**Why do the two consumers read raw? MEASURED: there is no reason.**

```js
38396  var reqsObj = LISTING_REQUIREMENTS[s.retailerId];
38398  var reqs = reqsObj.requirements || [];                    // raw
38403  var sku = skus.find(x => String(x.id)===String(firstSku)); // the SKU, three lines later
```

**Both arguments the gate needs are already in scope.** *The function was written without the gate,
not around it.* **So the entrance-guard fix breaks nothing.**

**THE EDIT: both consumers call `getRequirementsForRetailerAndProduct`.** *A call-site fix, not a
schema change — design's item 5 is REWRITTEN by this, not solved by it: the capability was never
missing.*

### THE CENSUS, BEFORE EDITING

**Every reader of `LISTING_REQUIREMENTS`** — by dot, bracket, alias and destructuring. **Is there a
FOURTH?** *Two were found by an instrument that had only just begun following aliases of aliases;
the count is not established.*

**And report what each does with the rows** — a reader that only counts is a different problem from
one that renders them.

---

## PART 2 · THE SELF-AWARDING DOT — DELETE IT

```js
7705  <span onclick="var v=prompt('Admin: set verification tier (0-3):','${tier}');
                    if(v!==null&&v!==''){brand.verificationTier=parseInt(v)||0;saveBrandState();…}"
        style="cursor:pointer;color:transparent;user-select:none" id="vf-admin-override">·</span>
```

**An invisible, unselectable, one-character control on Brand Home that grants its clicker any
verification tier.** **Delete the span.**

> **RULED: the trap is not the typo — it is the dot.** A trigger saying *don't fix the property name
> yet* is a policy that depends on someone reading the register at the right moment. **Remove the
> dot and the name mismatch becomes an ordinary bug anyone may fix at any time.**

**WHY IT MATTERS — AND THIS WARNING BELONGS IN THIS SPEC, NOT ONLY IN THE REGISTER:**

> **`portal.html:1048` renders `★ VeyaFlow Verified · Tier 2` IN GOLD TO A BUYER.** It reads
> `brand.verifiedTier`; the machinery writes `brand.verificationTier`. **The badge never renders
> ONLY because the names differ.** *Chain: invisible dot → anyone types `2` → `✓ Verified` on Brand
> Home → one rename from a buyer-facing gold badge on a self-awarded value.*

**REPORT, AND IT DECIDES WHETHER THE TYPO IS STILL DANGEROUS:** **does anything else write
`brand.verificationTier`?** *If the dot is its only writer, then after this deletion the tier is
always auto-calculated — capped at Tier 1, which is earned — and the portal badge becomes safe. If
something else writes it, say so and the trigger stays live.*

**IF TIER-SETTING IS NEEDED FOR TESTING, THE CAPABILITY MAY SURVIVE — THE INVISIBILITY MAY NOT.**
**But do not build the replacement in this shipment.** *A visible, labelled dev control on a parked
surface is an ADDITION, and this batch is subtraction. Report whether anything depends on the
override first.*

---

## OUT OF SCOPE

- **The `verifiedTier` / `verificationTier` name mismatch.** **Do not "fix" it here.** *It looks like
  a defect, which is precisely why it is dangerous — our own tidiness is its trigger.*
- **Building a replacement dev control.**
- **`PRODUCT_TYPE_REQUIREMENTS`' contents**, and whether the legacy-type fallback to cosmetic is
  right (37395). Report only.
- #238, #239, #220, #214, #230, #227.

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **Every reader of `LISTING_REQUIREMENTS`, and whether a fourth exists.**
3. **Does anything else write `brand.verificationTier`?** *This decides whether the portal trigger
   stays live.*
4. The before/after counts for a device SKU on both surfaces, and **for a cosmetic SKU** — *the gate
   must not change cosmetic behaviour.*
5. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1. Ten other surfaces unchanged.

---

## SMOKE — ORIGIN NAMED

**`http://localhost:8000/index.html`, seeded NORDLYS.** *Not the deployed site.*

**Step 1 · #237, the step that can fail.** A device SKU with a submission under review at Matas.
**The Home counter and the checklist page report the SAME total.** *Failure: they differ — that is
today's defect.*

**Step 2 · the cosmetic case must not move.** A cosmetic SKU: **both surfaces read exactly as they do
today.** *The gate applies to all types; for a cosmetic, filtering changes nothing and the appended
rows are cosmetic-specific. If a cosmetic count moves, the fix has over-reached.*

**Step 3 · the dot.** Brand Home, verification card. **Click where the dot was. Nothing happens, and
no prompt appears.** *Then confirm the card still renders its tier, its Tier-1 checklist and its
Request-verification button unchanged.*
