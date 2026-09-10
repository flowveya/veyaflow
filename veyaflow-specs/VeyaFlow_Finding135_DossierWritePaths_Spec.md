# VeyaFlow — #135 + `documentRef`: the dossier write paths

**10 September 2026 · coding lane → CC · ruled by Strategy**

**One record, not two shipments.** The five unfillable CPNP fields include the safety assessor
and the PIF reference; `documentRef` belongs to the same dossier record. Strategy: *specced
together.*

**This is the shipment the front-door test needs to exist before it runs.** A first encounter
happens exactly once, and running it against a product that structurally cannot hold a dossier
would produce a list of what is missing instead of the actual question — *can VeyaFlow take a
product from "the dossier is incomplete" to "ready to notify"?*

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           93139858c820002eedc5fa1ec95359d21632237a38c1d13710817bb835e1c81a
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `dba9bcc`. **Confirm all six. Only `index.html` moves.**

---

## STEP 0 — SCOUT FOR PRECEDENT BEFORE ANYTHING ELSE

**New standing rule, Strategy, 10 Sep, after the seventh instance:** *before a new capability
is specced, the first question is where it already exists in the codebase aimed at something
else.* Seven times running, the primitive was already built and pointed at one domain.

**Report before implementing:**

1. **Where does the tree already render a `{value, verifiedBy, verifiedDate}` triple?** The
   retailer registry does — `verifiedBy`/`verifiedDate` → a confidence tier, with honest labels
   (*"research-verified (public sources)"*). **Report its exact shape and whether it transfers.**
2. **Where does the tree already hold a document reference?** `dppData[skuId].dppId`,
   `templateVersionUsed`, `bil_extractions`. **Report what each stores and what it does not.**
3. **What field-editing pattern do the SKU editor tabs already use** for a value plus metadata,
   if any. **Do not invent a control if one exists.**

**If a precedent exists and this spec's shape differs from it, the precedent wins** unless you
state why it cannot.

---

## THE FIVE FIELDS, AND THEY ARE NOT FIVE OF A KIND

From the CPNP helper (≈19409–19435), all five read `sku.*` and none has a writer:

| field | reads | shape |
|---|---|---|
| Country of manufacture | `sku.countryOfManufacture \|\| sku.mfrCountry` | **already written — as `countryOfMfr`** |
| Product function / category | `sku.productCategory \|\| sku.euCosmeticCategory` | a taxonomy value |
| Safety Assessment ref | `sku.safetyAssessment \|\| sku.safetyAssessor` | **document-backed** |
| Safety Assessor name | `sku.safetyAssessor` | **part of the safety assessment record** |
| PIF location / reference | `sku.pifRef` | **document-backed** |

**So this is not five fields needing five schemas. It is:**

- **one name mismatch** — the data exists
- **one taxonomy value** — a plain field
- **two dossier records** — the safety assessment (which carries its assessor) and the PIF

---

## PART A — THE NAME MISMATCH. CHEAPEST FIX ON THE BOARD

The editor writes **`countryOfMfr`**. The CPNP helper reads `countryOfManufacture || mfrCountry`.
**Three characters apart, and the data has been there all along.**

**Make the helper read the written name.** Do not add a third alias — that is a second scheme
for one value, ruled against on the certification schema and again on `expiryDate`.

**Report** whether any other surface reads the wrong name, and whether `countryOfManufacture`
or `mfrCountry` is written anywhere at all. **The count is the finding** — if one of them has a
writer somewhere, this is a merge, not a rename.

---

## PART B — THE DOSSIER RECORD

For the safety assessment and the PIF, the stored shape is:

```
{ value, verifiedBy, verifiedDate, documentRef? }
```

**`documentRef` holds a REFERENCE, NOT A FILE.** Strategy: *a reference is more honest than a
file — holding the file tempts the product to assert what it read; holding a reference forces
the human to state what is true.* File upload is **B**, it arrives after **#147** identity, and
it is an accelerator on top of this — **not the destination this approximates.**

**Rules on the record, each load-bearing:**

- **`verifiedBy: 'brand'` — never `'verified'`, never rendered buyer-facing as though the
  platform confirmed it.** Same distinction as `★ VeyaFlow Verified` in #116, caught before it
  ships rather than after.
- **`verifiedDate` is written when the human confirms**, not when the field is edited.
- **Absent stays `not_recorded`** — never a blank that could read as a negative answer, and
  never `0`.
- **The confirmation stamp fires on the act** — `_appendStamp` exists and its contract is a
  human's yes. `FIXED_CALLSITES` asserts **3** call sites, so a fourth **fails the battery
  until Strategy rules on it.** That is the gate working as designed; **report it, do not
  raise the number unilaterally.**

---

## THE RULE THAT MUST BE WRITTEN IN NOW, THOUGH NOTHING USES IT YET

Strategy, 10 Sep: **prefilling moves authority.** *An empty field asks the user to know
something. A prefilled field asks the user not to object — and the second is a much weaker
act.*

> **Confirmation must be an act, not an absence of objection. A value that has not been
> confirmed does not count toward completion.**

**Concretely and checkably: a value whose `verifiedBy` is not a human act renders `attention`,
not as filled, and does not move the CPNP meter.**

Nothing extracts yet. **Write the rule into the record's shape anyway**, so B inherits it
rather than needing it retrofitted — otherwise the meter measures extraction instead of truth,
which is `filled:true` from #134 one level up.

---

## THE METER MOVES, AND THAT IS THE POINT

#134 took the ceiling from 64% to 50% by counting honestly. **This shipment is what raises it
by making the fields fillable rather than by relaxing the count.**

**Report the new ceiling, measured**, for a SKU with every enterable field filled. **Do not
touch `readyPct`, the required list, or the banner thresholds** — if the ceiling is still not
100%, that is a finding about which fields remain unwritable, not a number to adjust.

---

## OUT OF SCOPE

- **File upload, extraction, prefill.** B, after #147.
- **#148's back-fill** — and the reason it sits later is **structural, not a priority call.**
  **#147 is what makes the back-fill knowable.** Without identity there is no way to ask which
  catalogues carry colliding ids — the question cannot be posed, and a back-fill can only run
  on whichever browser happens to open the app.
  **What we can state:** two workspaces were checked and both are clean — one empty, one
  showing **50 records / 50 distinct ids after a real import**, which is #148 Part 1 verified
  in production. **What we cannot state is that no affected workspace exists.** `ns_brand` and
  `ns_skus` persist per browser; a demo, an old device, any machine that ever loaded the app
  is unreachable and uncountable. Per the standing rule, that is **"no known affected
  workspace, and the search is impossible rather than merely undone"** — never "none exists".
- **#139** — the CPNP helper gating on brand category rather than product framework. Real,
  separate, and it decides *whether this surface should appear at all* for a given SKU.
- #147, #143, #150's guard, M2–M4.

---

## STOP. NO COMMIT.

Step 0 reports first. Then Part A, then Part B.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. **Step 0's three precedent reports — before any edit.**
3. Part A before/after, and whether the wrong names are written anywhere.
4. Part B: the record's shape, the editor controls used, and **which existing pattern each
   came from.**
5. **The measured new ceiling**, and which fields still cannot be filled.
6. The `_appendStamp` call-site count and whether it changed.
7. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `93139858`; five others UNCHANGED; `1 of 6
modified`. **If `_appendStamp` moves past 3 the battery FAILS — that is correct, and it is a
ruling to request, not a number to change.**

---

## SMOKE

**Step 1.** Open a cosmetic SKU. **Country of manufacture shows the value already entered** —
no longer "Missing".

**Step 2.** Enter a safety assessor, an assessment reference and a PIF reference, each with a
document reference. Save. **The CPNP helper shows them as present.**

**Step 3.** The readiness percentage rises, and the missing list shrinks by exactly what was
filled.
*Failure: the number moving by more than what was entered.*

**Step 4 — the step that proves the honesty held.** A field left empty still reads **not
recorded** — not blank, not "None", not 0.
