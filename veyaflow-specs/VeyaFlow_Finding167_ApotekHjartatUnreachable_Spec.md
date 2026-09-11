# VeyaFlow — #167: Apotek Hjärtat can never be ready. Structurally.

**10 September 2026 · coding lane → CC**

**Found in the front-door run, by filling every field and watching it stay red.**

`RETAILER_REQS` requires `sku.moq` for Apotek Hjärtat. `migrateSkuSchemaV8` **deletes `sku.moq`
on every state load.** The requirement is unsatisfiable, in all three frameworks, for every
product, in every workspace, permanently.

**Sweden's largest pharmacy chain is unreachable in a Swedish beauty-compliance product**, and
the message shown to the brand — *"Missing required fields — complete SKU →"* — is an
instruction that cannot be followed.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           4b268e1774a4a5f90f218bb2df28b71cf6c96159ff7c487d804849345787d3b4
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

**RE-BASELINED 11 Sep after #160 and #175 landed** (`da3aefd5` → `efeab029` → `4b268e17`,
HEAD `347dee5`). **Confirm all six before editing. Only `index.html` moves.**

---

## THE RANGE-WIDENING SWEEP — ADDED AFTER #175, AND IT IS NOT OPTIONAL

**#175 was caused by exactly what this shipment does.** #160 widened `daysUntil`'s range to
include negatives; a render guard three lines away still read `r.days >= 0`; it had never been a
call site, so no call-site census found it, and an overdue deadline rendered as *"no value
recorded"* on the live site within minutes.

> **STANDING RULE: when a function's or a field's RANGE widens, every consumer's GUARD is in
> scope — not only its callers and its labels. A guard written against the old range is a
> SILENT CONSUMER, and it will not appear in a call-site census because it is not a call site.**

**This shipment widens a range.** `RETAILER_REQS['Apotek Hjärtat']` goes from *never satisfiable*
to *satisfiable*, which means **`ready` can now contain `'Apotek Hjärtat'` for the first time in
the application's history.**

**Report every site that consumes `skuReadiness().ready`, `.notReady`, or `r.ready.includes(…)`,
and for each, state what it does when Apotek Hjärtat is present.** The lane has seen
`showSkuExport` (22033) and the product-list row. **Anything that has only ever seen this
retailer absent is a guard written against the old range.**

**Specifically check for:** a hardcoded Apotek Hjärtat blocker, an `ediMatas`-style literal (one
is already known in `scoreReadiness`), a `.length` test that assumed a maximum, an index
assumption, or copy that reads correctly only while this retailer is never ready.

**The count is the finding. Report before implementing.**

---

## THE MECHANISM, MEASURED

`migrateSkuSchemaV8` (18218), called from the state-load chain at **1910**, on every boot:

```js
if('moq' in sku){
  if(!('manufacturerMoq' in sku) || …) { sku.manufacturerMoq = sku.moq; renamed++; }
  delete sku.moq;                                    // ← 18233
}
```

`skuReadiness` (18948):

```js
const allMet = reqs.every(r => sku[r] && String(sku[r]).trim().length>0);
```

`RETAILER_REQS` — **three sites, one retailer**:

| line | framework | list |
|---|---|---|
| **18895** | cosmetic | `['name','ean','inci','cpnp','euResponsible','safetyRef','rspSEK',`**`'moq'`**`]` |
| **18902** | device | `['name','ean','ceMarking','docOnFile','voltageInput','rspSEK',`**`'moq'`**`]` |
| **18913** | (third framework) | `['name','ean','ingredientList','allergens','cpnp','rspSEK',`**`'moq'`**`]` |

**Apotek Hjärtat is the ONLY retailer in any framework that names `moq`.** Every other entry
reads fields the editor writes.

**Observed in production, 10 Sep:** Cloud & Glow Forehead Tape at **100% readiness**, ✓ Lyko
✓ Kicks ✓ Matas ✓ Boots UK, **✗ Apotek Hjärtat**, with every enterable field filled and both
export cards disabled.

---

## THE COMMENT THAT MADE IT LOOK HANDLED

**18832, sixty lines above the defect**, describing the same defect in the sibling constant:

> *`'moq'` -> `'manufacturerMoq'` (batch #3): migration V8 renames the field and DELETES
> `sku.moq` on every page load, so the scorer was asking for a key that cannot exist —
> "Missing: MOQ" was permanent and unsatisfiable through the UI.*

**Batch #3 fixed `READINESS_FIELDS` and left `RETAILER_REQS`.** `READINESS_FIELDS.cosmetic`
(18846) now reads `manufacturerMoq`; `RETAILER_REQS` still reads `moq`, eleven lines further on.

**This is the third instance today of one form**, and it is now a named rule:

> **An artefact that certifies a check which never happened is worse than no artefact at all.**

The other two are #160's — the calendar legend advertising an unreachable `Overdue` state, and
#118's comment standing over a clamp it warns about. **Here the artefact is a comment that
describes the bug accurately, fixes one of its two sites, and thereby immunises the other from
being looked at.**

**Strategy's rule from #160 applies verbatim and is why this spec scopes by NAME, not by line:**
*when a line changes — count its behaviours, not its bugs.* Extended here: **when a field is
renamed, enumerate every reader of the old name before declaring the rename done.**

---

## IMPLEMENT — THE RENAME, FINISHED

Replace `'moq'` with `'manufacturerMoq'` at **18895, 18902, 18913**.

**Do not add an alias.** `sku.moq || sku.manufacturerMoq` would be a second scheme for one
value — ruled against on the certification schema, on `expiryDate`, and again on #135's Part A,
where the dead aliases were removed rather than joined by a third.

**Do not relax the requirement by deleting `moq` from the lists.** Whether Apotek Hjärtat
genuinely requires an MOQ is a commercial question for Strategy; this shipment makes the
existing requirement *satisfiable*, and changes nothing about what is required.

---

## THE CENSUS — REPORT, AND IT IS THE REAL SIZE OF THIS FINDING

**`sku.moq` has readers beyond `RETAILER_REQS`, and they are all reading a key that cannot
exist.** Enumerate and classify every one. Found in the lane's scout, **to be confirmed and
extended independently**:

| line | site | what it does today |
|---|---|---|
| **18404** | `newSkuForm` | **WRITES `moq:''`** — every new SKU is born with a key V8 deletes |
| **19977** | `SKU_FIELDS` | the **importer** maps an `MOQ` column to `moq` |
| **19987 / 19994** | `RETAILER_TEMPLATES` | Apotek Hjärtat + Matas column maps → `moq` |
| **19873** | numeric coercion loop | normalises `moq` |
| **17629** | `RETAILER_SAFE_FIELDS` | allowlists `moq` for export — always absent |
| **30139 / 30147 / 30222 / 30271** | brand pack / PDF / spec rows | render `sku.moq`, always `—` |

**Report for each: is the value rescued by V8's rename, or lost?** The answer turns on whether
the object carries `_schemaVersion >= 8` when V8 next runs (18223), and **that is the question
this census exists to settle** — an imported SKU with `_schemaVersion` already at 8 would have
its `moq` **neither renamed nor deleted, and never read**.

**State it as measured, not reasoned.** Construct an import row with an MOQ value, reload, and
report what the SKU holds. **If a brand's imported MOQ values are being dropped, that is a
separate and larger finding than this one** — raise it with its own number rather than folding
it in.

**Do not fix the census sites in this shipment.** Report the count and the classification.

---

## THE SECOND HALF, AND IT IS #165 — NOT IN THIS SHIPMENT

`reqs.every()` (18949) collapses a per-retailer field list into a boolean and **discards which
requirement failed**. `skuReadiness` returns `{pct, missing, ready, notReady}` where `missing`
is global to the SKU and has no per-retailer form.

**So the screen says "Missing required fields" identically for a retailer needing one field and
one needing five** — and in this case for a retailer needing a field that cannot exist. Had the
message named `moq`, this defect would have been visible the first time anyone opened the
screen, instead of surviving from batch #3 to today.

**#165 is specced separately.** It is the reason this took a full-catalogue walk to find, and it
is worth more than this fix — but it is a different shipment and must not ride along.

---

## OUT OF SCOPE

- **#165** — per-retailer missing-field reporting. Separate.
- **#164** — the ungated Universal export beneath five gated retailer exports. Separate.
- **#166** — `articleNo` allowlisted for export and stripped by the sanitiser. Separate.
- **The census sites.** Reported, not fixed.
- **Whether Apotek Hjärtat should require an MOQ at all.** Strategy's.
- #160 (ships first), #162, #156, #157, #158, #147, #143.

---

## STOP. NO COMMIT.

Three strings. One census.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. Before/after for 18895, 18902, 18913.
3. **The census table, independently enumerated** — every reader and writer of `moq` as a SKU
   field, classified as rescued or lost. **The count is the finding.**
4. **Evidence Apotek Hjärtat can now go ready**, measured: a cosmetic SKU with all eight
   requirements filled, `manufacturerMoq` among them, reported as `ready`.
5. **Evidence the other four retailers are byte-identical in behaviour** — Lyko, Kicks, Matas
   and Boots UK must not move in either direction. None of them names `moq`, so this should be
   structural; **say so as a structural argument AND show it measured.**
6. **Evidence a SKU with an EMPTY `manufacturerMoq` is still correctly NOT ready for Apotek
   Hjärtat.** The fix must make the check satisfiable, not satisfied.
7. The measured answer on imported MOQ values — rescued or lost.
8. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

**THE EXPECTED MID-BATCH RESULT CHANGED AT #174. DO NOT READ IT AS A REGRESSION AND DO NOT
"FIX" THE GATE.**

```
FAIL      | index.html  <new>…  DIFFERS from named baseline (4b268e17…) — AWAITING NAME
PASS      | 1 of the 11 tracked surfaces modified
 OVERALL: NOT GREEN — AWAITING NAME for: index.html
exit=1
```

**That is the correct and expected output while this batch is in flight.** #174 ruled (a):
`DIFFERS` is a `FAIL` on every surface and sets the exit code, because the old `INFO` form meant
a one-byte change to any tracked file read GREEN with exit 0.

**Required:** every other gate passes · the ten other surfaces UNCHANGED · the functions
directory contract PASSES · `1 of the 11 tracked surfaces modified`.

**GREEN returns once the lane names the new baseline**, which happens in the same commit as the
change. **A run that is GREEN while `index.html` differs would mean the #174 gate has been
undone — report that immediately and stop.**

---

## SMOKE

**Step 1.** Open a cosmetic SKU with every field filled, including MOQ. **Apotek Hjärtat shows
ready and its CSV and TXT downloads are enabled.**
*Failure: still blocked. That is the defect, and it is what the app does today at 100%
readiness.*

**Step 2.** Clear the MOQ. **Apotek Hjärtat goes back to not ready.**
*Failure: still ready — the requirement has been removed rather than repaired.*

**Step 3 — the step that proves nothing else moved.** Lyko, Kicks, Matas and Boots UK show
exactly the same state before and after, on the same SKU.

**Step 4.** Reload the page twice. **Apotek Hjärtat stays ready.**
*Failure: ready before reload and not after — that is V8 eating the value, and it means the
census found the wrong thing.*
