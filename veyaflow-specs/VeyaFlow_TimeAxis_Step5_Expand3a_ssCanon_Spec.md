# VeyaFlow — Time axis step 5: expand phase 3a, `_ssCanon` and the reader's home

**9 September 2026 · coding lane → CC**

**One site.** The highest-consequence line in the migration, shipped alone so it is the only
thing in the diff.

Everywhere else a mistake shows as a visibly wrong string. Here it shows as **every
previously-issued spec sheet becoming silently unreproducible** — #93's one-time cost re-paid,
with no symptom.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           9eb3da6917ba6ec516a846006f27d5579418edb730636a2d1fc5b9589c9c71e7
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `a86224d`. **Confirm all six. Only `index.html` moves.**

---

## WHAT SHIPS

**1 · The reader, third copy, at line 4928 beside `normalizeNumericProof`.**

Copied **programmatically** from `brand/index.html`, as in phase 2 — extract by banner and
closing brace, write to a scratch file, insert that file. **No transcription step, so no
transcription error.** The copy gate will compare all three the moment it lands, and it must
PASS without adjustment.

Placement is your own reasoning from phase 1 and it is better than the lane's: **before the
earliest read at 7119 (`renderExpansionSequencer`)**, not near the riskiest site 22,000 lines
later. Block one.

**2 · `_ssCanon`, line 30028 — the only behavioural change in this shipment.**

```js
// before
certs:(sku.certifications||[]).slice().sort(),
// after
certs: normalizeCertifications(sku.certifications).sort(),
```

The reader returns a fresh array, so `.slice()` is no longer load-bearing. **Report whether
you kept it.** Either is defensible — keeping preserves the line's shape and documents that
`.sort()` must not mutate; dropping is honest about what the reader guarantees. Say which and
why; do not treat it as beneath mention.

**Nothing else in `index.html` changes.** The other 44 sites are 3b and 3c.

---

## THE EVIDENCE THIS SHIPMENT LIVES OR DIES ON

> **For every SKU in the catalogue, `_ssCanon` must be byte-identical before and after — and
> therefore every Document ID unchanged.**

Compare the **canonical JSON string**, not the rendered PDF. The PDF carries a timestamp and
layout; the JSON is the thing that is hashed, and it is exactly comparable.

**Method, same three-way discipline as phases 1 and 2:** capture `_ssCanon`'s output for every
SKU **before** editing, then evaluate old and new expressions against the same inputs and
compare with `===`, and both against the pre-edit capture.

**Then hash them.** Byte-identical JSON is the argument; identical `_atmHashContent` output is
the proof a buyer would recognise. Report both.

*Failure: any SKU whose canonical string differs. That is not a nuance to explain — it means
every spec sheet already issued for that SKU can no longer be reproduced, and the shipment
stops.*

---

## A LATENT CRASH THE READER CLOSES — REPORT WHETHER IT IS REACHABLE

`.slice()` on a **string** returns a string, and strings have no `.sort()`. So if
`sku.certifications` is ever the legacy bare comma-separated form, line 30028 **throws** — and
it sits **outside** the `try` that guards `_atmHashContent` on the next line. **The spec sheet
does not degrade; it fails to generate.**

The reader closes this by construction: it returns `string[]` for all three input shapes.

**Report:** is the bare-string form reachable on `sku.certifications`? `toggleSkuCert` pushes
strings into an array, but 29957/29962 test `Array.isArray` and fall back to a string, which
means someone believed the form occurs. **If it is reachable, this is a live crash and needs
its own number.** If it is not, say so — a latent crash correctly recorded is worth more than
one overstated.

---

## REPORT, DO NOT IMPLEMENT

1. **Whether `_ssCanon`'s `certs` field is the only one touching certifications in the hash.**
   If any other hashed field derives from them, it must move in the same shipment or the ID
   moves later, in a diff where nobody is watching for it.
2. **Every other caller of `_atmHashContent`.** If another document type hashes certifications
   through a different path, it has this same requirement and is not yet scheduled.
3. **Whether the copy gate needed any adjustment** to accept a third surface. It was written to
   scan all surfaces carrying the banner — if it did need changing, that is a finding about the
   gate, not about this shipment.

---

## OUT OF SCOPE

- The other 44 `index.html` sites — **3b** (exports, PDFs) and **3c** (ESG, calendar).
- `buildComplianceEvents` and `renderComplianceCalendar` — they already read `expiryDate` and
  they are 3c's problem, with their own ruling owed.
- The writer, `toggleSkuCert` — migrate phase.
- Legacy bare-string conversion — migrate phase, and now carrying `share-dpp.js:41`'s
  `Array.isArray` gate as a hard constraint.
- Third-party reference data. Permanently.

---

## STOP. NO COMMIT.

Two implements, three reports, one piece of evidence that decides everything.

---

## REPORT BACK

1. sha256 of all six before and after — **only `index.html` differs**.
2. The per-SKU `_ssCanon` comparison and the hash comparison. **This is the report.**
3. Before/after for 30028, and whether `.slice()` stayed.
4. Copy-gate result across three surfaces.
5. The three reports, including whether the bare-string crash is reachable.
6. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `9eb3da69`; five others UNCHANGED; `1 of the 6
tracked surfaces modified`. **The copy gate must report three surfaces**, not two — if it still
says two, it is not seeing the new copy and the gate is broken rather than passing.

---

## SMOKE

**Step 1 — the one that matters.** Generate a spec sheet for a SKU with certifications. **The
Document ID in the footer is identical to one generated before this change.** Generate one
first if you do not have a prior sheet to hand.
*Failure: any change to the Document ID.*

**Step 2.** The Certifications content on the sheet renders as before.

**Step 3 — the step that passes only if nothing else moved.** A SKU with **no** certifications
produces the same Document ID as before.
*Failure: a change here would mean the reader's empty-case return differs from `[]`.*
