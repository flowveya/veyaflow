# VeyaFlow — Ruling: one framework vocabulary, three accessors

**1 September 2026 · answers the two questions in your 1E classification · unblocks 1E**

---

## THE CLASSIFICATION IS ACCEPTED AS REPORTED

CPNP **specific**, Certifications **agnostic**, Claims **agnostic**, Safety Assessment **label specific / field agnostic**. INCI absent from all five — my list was wrong about that, and your correction stands.

Your evidence on Safety Assessment closes it. The device branch reads the same field and calls it `Technical file on file`; `safety_assessment` in the listing checklist is already gated `productTypes:['cosmetic']`. **The file has known the label was cosmetic-specific for two batches and kept printing it on the buyer-facing surface anyway.** That is the CPNP defect exactly.

**Safety Assessment ships in 1E, with CPNP.** It does not wait for the RP. The RP question exists because the *instrument* behind the operator obligation is uncertain; here nothing is uncertain — we are choosing between two words the file already uses, and for the third case we are declining to name an instrument at all. No new legal claim is made, so there is nothing to confirm.

---

## RULING 1 — one table, three accessors, zero call-site churn

You asked whether the safety-document labels ride on `OPERATOR_REGIME` or get their own table. **Neither. Both are wrong for the same reason.**

Putting safety-doc labels in a table named `OPERATOR_REGIME` makes the name a lie the next reader has to discover. A parallel `SAFETY_DOC_REGIME` keyed by the same framework is two tables that must be edited together and will eventually not be — and Shipment 2 would make it three.

**Generalise the table. Keep the accessors.**

```js
// The regime vocabulary, per framework. One table: every framework-specific WORD the
// app uses about a product lives here, keyed by concept. A concept ABSENT for a
// framework asserts nothing — the caller omits the row. A framework absent entirely
// (unknown, textile, food, supplement) asserts nothing at all.
// NO instrument or article numbers — Strategy ruling 1 Sep, unchanged.
const FRAMEWORK_VOCAB = {
  cosmetic: {
    operator:     { label:'EU Responsible Person',            field:'euResponsible' },
    safetyDoc:    { label:'Safety Assessment',                field:'safetyRef' },
    notification: { label:'CPNP',                             field:'cpnp' },
  },
  device: {
    operator:     { label:'EU-established economic operator', field:'euOperator' },
    safetyDoc:    { label:'Technical file',                   field:'safetyRef' },
    notification: null,
    mark:         { label:'CE marking',                       field:'ceMarking' },
  },
  beauty_accessory: {
    operator:     { label:'EU-established economic operator', field:'euOperator' },
    safetyDoc:    { label:'Safety documentation',             field:'safetyRef' },
    notification: null,
  },
};
```

**`getOperatorRegime(sku)` keeps its exact signature and return shape.** Only its body changes — it reads `FRAMEWORK_VOCAB[fw] && FRAMEWORK_VOCAB[fw].operator`. **That means not one of Shipment 1's thirteen call sites moves.** The accessor is the seam that makes this refactor free, which is the whole reason it is worth doing now rather than after a second table exists.

Add two siblings with identical shape and identical `null` semantics:

- `getSafetyDocRegime(sku)`
- `getNotificationRegime(sku)`

`mark` gets no accessor in 1b — the DPP PDF's CE row is already gated by `resolveProductFramework` from Shipment 1 and works. It sits in the table so the next reader sees the whole vocabulary in one place; wire it when something needs it.

**Verification this refactor must pass, and it is a hard one:** `OPERATOR_REGIME` = **0**, `FRAMEWORK_VOCAB` = **1**, and **all thirteen Shipment 1 sites byte-identical to `fdb6dcc8…`**. If a single one of them changes, the refactor was not free and I want to see why before anything else happens.

## RULING 2 — the accessory's safety document is called "Safety documentation"

Neutral by construction. A jade roller has neither a CPSR nor a CE technical file, and borrowing device vocabulary would be the same error the app currently makes with cosmetics vocabulary — you identified that precisely and you were right not to guess.

**This does not go to the RP.** We are not naming an instrument; we are declining to. The RP is needed to *add* a claim, never to *withhold* one.

**Consequence for Shipment 2, applied now so we do not ship two vocabularies:** the accessory form field stays `gpsrTechFile` as an identifier, but its **rendered label becomes "Safety documentation"**, matching this table. Its `BLOCKER_RESOLUTION` wording follows. One word for one thing across input and output.

## RULING 3 — `empty` vs `missing` is ratified, and it names something we did not have a word for

> *"`missing` renders 'Missing — add in My Products →', which would instruct the brand to appoint an RP for a product that needs none — the same false assertion as a filled cell, phrased as a task."*

**A false claim can be phrased as an instruction.** Every truth fix in this project so far has hunted assertions in *declarative* form — a label, a badge, a row, a score. This is the first time one has been caught wearing an imperative, and an imperative is worse: a filled cell is a claim the brand can inspect, while "add in My Products →" is a claim that recruits the brand into acting on it.

**Standing rule, effective now:** a truth fix must scout the surface's **remediation copy** as well as its display copy. Fix prompts, empty-state instructions, blocker `fix` text and action-button labels are assertions. Apply this to 1E: a gated-away CPNP row must not leave a "file at portal.cpnp.eu" prompt behind for a device.

## RULING 4 — the check that could not fail

> *"the shasum compared two empty `sed` ranges, so it would have said OK for any name"*

That is the right diagnosis and it generalises past this instance: **a check that cannot fail is not a check, and reporting its result as a pass is worse than reporting nothing** — it spends the credibility of every other line in the report.

**Standing rule:** any guard whose subject is not found must report **NOT FOUND**, never a pass. This applies to my specs as much as your reports — I wrote the item that could only be answered yes.

---

# 1E — WRITE IT NOW

**Five surfaces** — Brand Pack hero tile (~16714), Brand Pack LLM prompt (~16929), Brand Pack HTML block (~17133), Pitch LLM prompt (~25056), Brand Pack PDF (~30343).

1. **The `FRAMEWORK_VOCAB` refactor first**, on its own, verified byte-identical at the thirteen sites before anything else is written.
2. **CPNP** → `getNotificationRegime`. Regime present → row as now. `null` → **omit the row entirely**, and per Ruling 3 confirm no CPNP remediation copy survives on that surface.
3. **Safety Assessment** → `getSafetyDocRegime`. Value stays `sku.safetyRef||sku.technicalFile` on every surface that already reads both — do not narrow it. Label routes. `null` → omit.
4. Surface A has no Safety Assessment row today and **does not gain one**. 1b removes wrong assertions; it does not add rows.

**Cosmetic must be a total no-op across all five.** Same rows, same labels, same values, same order.

## STOP. NO COMMIT.

### REPORT BACK

1. `OPERATOR_REGIME` = 0, `FRAMEWORK_VOCAB` = 1, and the evidence that all thirteen Shipment 1 sites are byte-identical to `fdb6dcc8…`. State the method.
2. The three accessors, one definition each, and their `null` semantics.
3. Per surface: which rows now route, which were omitted for a device, and **what happened to each row's remediation copy** (Ruling 3).
4. Confirmation the cosmetic path is byte-identical across all five surfaces, and that surface A gained no row.
5. Any guard whose subject you could not locate, reported as NOT FOUND (Ruling 4).
6. `sha256sum index.html`.

### VERIFY (byte — coding chat)

- acorn clean, 2 blocks · `FRAMEWORK_VOCAB` 1 · `OPERATOR_REGIME` 0 · three accessors 1 each
- thirteen Shipment 1 sites byte-identical · `resolveProductFramework` byte-identical · `_rpDateExpired` 1
- newly-added `2019/1020` = 0 · `2023/988` = 0
- cosmetic path byte-identical on all five surfaces
- all batch #3–#7 guards, **rendered-occurrence counting**

---

## 1b IS NOW CLOSED TO NEW WORK

It has grown from "the CPNP row" to a vocabulary table, a safety-document label and a refactor. Each addition was the same finding on the same surfaces and I stand behind every one — but the batch is closed. **Anything further found on these five surfaces gets logged, not folded in**, including anything the Ruling-3 remediation-copy scout turns up beyond CPNP. Report it and it becomes batch #9.

**On sequencing:** I have not byte-verified 1F. I am ruling ahead of it deliberately — 1F is confined to `retailTemplateResolveSource` and 1E does not touch that resolver, so they cannot interfere. I verify 1F, the refactor and 1E together on the next upload. If that assumption is wrong — if 1E needs anything from `retailTemplateResolveSource` — **stop and say so** rather than working around it.
