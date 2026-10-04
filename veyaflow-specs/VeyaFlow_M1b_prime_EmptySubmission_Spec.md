# VeyaFlow — M1b′: a submission with zero products is not a submission

**coding lane → CC · `index.html` ONLY · ONE EDIT · SHIPS WITH THE LAYER-1 PASS (B1), 4 Oct ordering.**

> **STALENESS CHECKED BY THE CODING LANE against register HEAD `d9af42c`, 3 October 2026, at dispatch.**
> *CC carries no staleness check; the hash is the evidence that one was made.*

**K22.** *Found by CC while measuring M1b's second stop condition — the stop fired, the condition was
reported rather than resolved, and this is the resolution.*

---

## THE RULING, VERBATIM

**Source: `open-items.md` at `d9af42c`, `CODINGS FEMTE RELÄ 3 okt §3`.**

> `createRetailSubmission` validates the retailer and nothing else; `skuIds` starts empty and is only
> filled by the checkbox; the `||[]` defences downstream are why it has never shown — **`#114c`'s family.**
>
> **Ruled: creation REFUSES an empty set with a named reason in the interface (*"välj minst en
> produkt"*), never a silent default. Existing rows with empty `skuIds` are COUNTED first and listed as
> `unresolved` — never silently repaired.** *A pack naming its set over zero products is exactly what the
> summary form exists to prevent.*

---

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

## NAMED BASELINES

Eleven surfaces at the values `verify.expected.txt` NAMES. Start GREEN at `0 of 11 modified`, end at
`1 of 11`. The lane names the digest after two independent computations.

---

## THE DEFECT — CC's MEASUREMENT, NOT RE-DERIVED

`Belägg: index.html:createRetailSubmission` validates only `f.retailerId` and then writes
`skuIds: f.skuIds.slice()`. `retailTrackerAddForm.skuIds` starts `[]` and is toggled only by the per-SKU
checkbox handler. **A submission created with no SKU checked carries `skuIds: []`.** Downstream
`||[]` in `buildSkuReadiness`, `buildPortalSkuSnapshot` and the claims loop absorb it, **which is why the
condition has been invisible rather than rare.**

## THE EDIT — TWO PARTS, ONE SURFACE

**1 · Creation refuses.** An empty `skuIds` is rejected at `createRetailSubmission` with a **named reason
shown in the interface**, in the same form as the existing retailer check. **Never a silent default,
never an auto-selected SKU, never "all products" inferred.** *A default here would be a value whose
absence meant something.*

**2 · Existing rows are counted and listed, never repaired.** Report **how many** rows in
`ns_retail_submissions` carry an empty or absent `skuIds`, with their ids, in the `unresolved` form:
`unresolved: [{ id, returned }]`.

> **NO EXISTING ROW IS MODIFIED BY THIS SHIPMENT.** *Repairing them silently would destroy the only
> evidence of how many there are and how they arose. The count is the deliverable; what to do about them
> is a ruling that needs the count first.*

**STOP** if the count cannot be taken without a browser — **say so and report `OLÄST` with where you
looked.** *`ns_retail_submissions` lives in `localStorage`; if it is unreachable from the harness, the
count is Charlotte's to take and this shipment delivers part 1 alone.*

**STOP** if refusing an empty set would block a flow that has no other way forward — report the flow.
*Every new capability carries a flow debt paid in the same shipment: if a user can reach submission
creation with no SKUs in the catalogue at all, refusing is correct but the message must say what to do.*

## WHAT THIS SPEC DOES NOT TOUCH

`buildPortalBrandPack` and the emitted shape — **M1b, which the 4 Oct ordering moves to C and rebuilds
on K21's model.** `portal.html` — **M1c.** `onFile` — **M1d.** The preview — **A** (M1a was never started
and falls under the hide). K17, K18, K19, K21.

> **ORDERING NOTE, 4 Oct:** *this shipment left the M1 chain and travels with layer 1, because refusing an
> empty set is a record-level rule and layer 1 is where the record is being rebuilt.* **Nothing in the
> spec's substance changed — only where it sits.**

---

## STANDING, UNTIL M1c HAS SHIPPED

> **NO BRAND PACK IS SHARED.**

## SMOKE — ONE STEP. ENTRY POINT **AND** WRITER.

| field | value |
|---|---|
| entry point | `localhost:8000` → Retail Tracker → add submission, hard-reload first |
| **writer of the asserted string** | **`index.html:createRetailSubmission`** |

**Expect:** with a retailer picked and no SKU checked, the submission is **not created** and the named
reason appears. **Must not appear:** a created submission · a silent no-op with no message · a default
selection made on the user's behalf.

**Report the message as text, and the count from part 2 beside it.**

## REPORT BACK

The diff · **your** digest as your own computation · `verify.sh` at 57 GREEN, **1 of 11 modified** ·
`Belägg: <file>:<function name>` · the count of existing empty rows, or `OLÄST` with where you looked.
