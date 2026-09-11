# VeyaFlow — #165: the export screen knows which field is missing and will not say

**10 September 2026 · coding lane → CC**

**SHIPS AFTER #160 AND #167.** Ordering is structural, not preference — see ORDERING below.

Five retailers, five different requirement lists, **one identical sentence**:
*"Missing required fields — complete SKU →"*.

The app holds the per-retailer requirement list, evaluates it, **discards which member failed**,
and prints a generic string. A brand one field from a listing and a brand five fields away are
told the same thing.

**This is the defect that hid #167 from batch #3 until today.** Had the message named the
field, an unsatisfiable `moq` requirement would have been visible the first time anyone opened
this screen.

---

## NAMED BASELINES

**The `index.html` baseline will have moved twice by the time this ships.** Request it from the
lane. **Do not derive it. Do not proceed on a sha you computed yourself** — the five other
surfaces are unchanged from:

```
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

---

## THE MECHANISM

`skuReadiness` (18948):

```js
Object.entries(retailerReqs).forEach(function([retailer,reqs]){
  const allMet = reqs.every(function(r){return sku[r]&&String(sku[r]).trim().length>0;});
  if(allMet) ready.push(retailer); else notReady.push(retailer);
});
return {pct, missing, ready, notReady};
```

**`.every()` returns a boolean and the failing members are unrecoverable.** `missing` (18942) is
computed from `READINESS_FIELDS` — **a different list**, global to the SKU, and it is what the
100%/65% meter reports. It is not the retailer requirement set and cannot substitute for it.

`showSkuExport` (22124) has only `anyReady` to work with:

```js
${!anyReady?`<div …>Missing required fields — <span … onclick="editSku('${id}')">complete SKU →</span></div>`:''}
```

**The string is hardcoded and identical for all five.**

### Measured, 10 Sep, Cloud & Glow Forehead Tape at 100% readiness

| retailer | requires | actually missing |
|---|---|---|
| Lyko | `name ean inci rspSEK descSV descEN` | ready ✓ |
| Kicks | `name ean inci rspSEK cpnp` | ready ✓ |
| Matas | `name ean inci cpnp rspDKK descEN` | ready ✓ |
| Boots UK | `name ean inci cpnp euResponsible safetyRef rspGBP` | ready ✓ |
| **Apotek Hjärtat** | `… rspSEK moq` | **`moq` — a key `migrateSkuSchemaV8` deletes on every load** |

**Two meters disagreed on one product and neither could be reconciled by the user**, because the
one that said *blocked* would not say *why*.

---

## IMPLEMENT — RETURN WHAT IT ALREADY COMPUTED

### Part A — `skuReadiness` reports per retailer

Add a fifth key. **Additive: `pct`, `missing`, `ready` and `notReady` keep their current shapes
and values exactly.**

```
missingByRetailer: { '<retailer>': ['<label>', …] }
```

built from the **same** `reqs` loop, using the **same** emptiness test, and labelled through
**`FIELD_LABELS` (18821)** — the map the SKU meter already uses, so a field has one name across
both surfaces.

**Do not introduce a second label source.** `FIELD_LABELS` already carries
`moq:'MOQ', manufacturerMoq:'MOQ'`; a key with no entry falls back to the key, which is the
existing convention at 18937 and must be reused rather than re-decided.

**Populate the entry for every retailer, ready ones included** — a ready retailer gets an empty
array, not an absent key. An absent key and an empty array must not both mean "ready", or the
consumer has two ways to ask one question.

### Part B — the export screen names them

At **22124**, replace the generic sentence with the named fields for **that** retailer.

**THE PRECEDENT EXISTS AND IT IS TWO CLICKS AWAY — DO NOT INVENT A CONTROL.** Strategy's
precedent-scout rule, ninth instance. **The CPNP modal already does exactly this job**, on the
same product, in the same file:

- **19626–19630** — *"Required fields: 12/14 filled · 86%"* with **`Missing: Nanomaterials
  present, CMR substances present`** underneath. A count, a percentage, and **the fields named.**
- **19700–19705** — the package view's summary box: *"⚠ 2 required fields missing"*, then **one
  row per field**, each with its own `add in My Products →` jump.

**Read both before writing anything.** The export screen's blocker should be recognisably the
same object as 19626–19630, not a new pattern reasoned out from scratch. **If this spec's shape
differs from that precedent, the precedent wins** unless you state why it cannot transfer.

**One asymmetry to report rather than paper over:** the CPNP modal names fields for **one**
regime, so it has a single list. The export screen has **five retailers with five lists** on one
page. **Report whether the CPNP presentation survives being repeated five times**, or whether
that is where it must diverge — that is a real difference, and it is the only part of this that
is genuinely new.

**DESIGN owns the wording.** Constraints that are not DESIGN's to relax:

- **The fields must be named.** That is the entire shipment.
- **`complete SKU →` stays and keeps its `editSku` target.** It is the correct affordance and
  the only thing on the screen that currently helps.
- **A long list must not become a wall of its own.** If a retailer is missing six fields,
  propose how the sixth is handled — this is a judgement, so state it rather than truncating
  silently.

---

## ORDERING — WHY #167 FIRST, AND IT IS NOT PREFERENCE

**If this ships before #167**, the screen will honestly report *"Missing: MOQ"* for Apotek
Hjärtat — **a true statement about a field that cannot be entered.** The user follows
`complete SKU →`, finds no MOQ input matching it, and the product has converted a silent wall
into an explicit instruction it cannot support.

**That is #122's class**, and #134's residual in the same shape: *a false regulatory
declaration became a false navigation hint.* Here it would be a **true** message pointing at an
impossible action, which is not better.

**#167 makes the requirement satisfiable. This makes it legible. In that order.**

---

## SCOPE BY SHAPE — ENUMERATE THE CONSUMERS FIRST

**Report before editing: every caller of `skuReadiness`.** The lane has seen `showSkuExport`
(22033) and the product-list row; **there are more, and the count is the finding.**

For each, state whether it destructures, spreads, serialises, or persists the return value.
**A consumer that spreads the object into a payload, a hash, or storage inherits the new key** —
and that is the one case where an additive change is not behaviour-neutral. **If any consumer
publishes or persists it, report and stop.**

Precedent: `_ssCanon` (time axis 3a), where a change with no visible effect would have made every
previously-issued spec sheet silently unreproducible.

---

## OUT OF SCOPE

- **#167** — ships first, makes `moq` satisfiable.
- **#164** — the ungated Universal export. Awaiting a Strategy ruling.
- **#166** — `articleNo` allowlisted and stripped. Separate.
- **The `RETAILER_REQS` lists themselves.** Whether Lyko genuinely needs `descSV` is
  commercial. This shipment reports the lists as they are.
- **`READINESS_FIELDS` vs `RETAILER_REQS` being two different lists.** That is by design —
  a SKU meter and a retailer gate answer different questions. **Do not merge them.** But
  **report whether the screen makes the distinction legible**, because a user seeing 100% beside
  a blocked retailer has no way to know they are reading two scales.
- #162, #156, #157, #158.

---

## STOP. NO COMMIT.

One key added. One string replaced. One consumer census.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. **The `skuReadiness` consumer census, with each classified** — read-only, spread, persisted
   or published. **The count is the finding.**
3. Before/after for 18948–18953 and 22124.
4. **Evidence `pct`, `missing`, `ready` and `notReady` are byte-identical** across a spread of
   SKU shapes — a full SKU, an empty one, one missing exactly one field, one of each framework.
   **The additive claim must be measured, not asserted.**
5. **Evidence the named fields are correct**, measured: for one SKU, the reported list per
   retailer against the `RETAILER_REQS` entry, by hand.
6. **Evidence a ready retailer reports an empty array and still renders no blocker.**
7. The wording proposal, and how it handles a six-field list.
8. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from the named baseline; five others UNCHANGED;
`1 of 6 modified`.

---

## SMOKE

**Step 1.** A SKU missing several fields. **Each retailer names its own missing fields, and two
retailers with different requirements show different lists.**
*Failure: identical text under two retailers with different `RETAILER_REQS` entries. That is the
defect.*

**Step 2.** Fill one field that only one retailer needs. **That retailer's list shortens by
exactly one; no other retailer's list changes.**

**Step 3.** Fill everything. **Every retailer goes ready and no blocker renders anywhere.**
*Failure: a blocked retailer with an empty missing list — the two halves disagreeing, which is
today's defect wearing the new copy.*

**Step 4 — the control.** The product-list readiness percentage is unchanged from before this
shipment on the same SKU. **This shipment does not touch the meter.**
