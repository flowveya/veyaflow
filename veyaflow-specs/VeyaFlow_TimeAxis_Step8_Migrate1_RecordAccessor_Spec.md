# VeyaFlow — Time axis step 8: migrate 1, the record accessor

**9 September 2026 · coding lane → CC · Strategy's ruling 5**

**Migrate is four shipments, not one.** This is the first and it is **behaviour-neutral**, so
it is verified exactly like everything since the scout.

| | |
|---|---|
| **M1 — this spec** | the second accessor; the two `expiryDate` consumers routed through it; direct reads made impossible |
| M2 | the writer, its three editor `includes` tests and the description prompt — **five sites, one unit** |
| M3 | legacy conversion and the five publish/persist sites, gated on `share-dpp.js:41` |
| M4 | Strategy's rulings 1–3: `verifiedBy: not_recorded` beside bare dates, expired → `not_recorded` keeping what it was |

**M1 first because the authorised path must exist before anything produces data that needs
it.** Expand-before-write, one level up.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           6d4d09b707228e89f99b68ae2b7b2ed3fe7374ebe98283e329ff4295afa245f7
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `8be0197`. **Confirm all six. Only `index.html` moves.**

---

## WHY THIS IS NEUTRAL

`brand.certifications` is **already the object form** and **has no writer in the file** — it
arrives from the seed and from onboarding. So an accessor returning normalised objects hands
its two consumers what they already receive. **Same events, same panel.**

---

## THE ACCESSOR

**One copy, in `index.html` only.** `brand/index.html` and `dpp/index.html` do not read
`expiryDate` and must not gain it — so this is not a copy-gate concern, and **do not add it to
the other surfaces.**

It returns **records**, not names:

```
[{ name, expiryDate?, verifiedBy? }, …]
```

**Contract, and each clause is load-bearing:**

- **Same three input shapes as `normalizeCertifications`** — `string[]`, bare `string`, object
  form. A string entry becomes `{name}` with **no `expiryDate` and no `verifiedBy`**, because
  that is what is known. **Do not invent `verifiedBy: 'not_recorded'` here** — M4 decides how
  absence is *rendered*; this returns what exists.
- **Order preserved**, same reason as the name reader.
- **An entry with no usable name is dropped**, same rule.
- **Pure.** No DOM, no storage, no dates computed, no interpretation of validity.
- **Name it for what it returns.** `normalizeCertifications` answers *what are they called*;
  this answers *what do we know about them*. The names must make that difference obvious to
  someone reading one call site.

---

## THE TWO CONSUMERS

**`buildComplianceEvents` (≈33362)** — `(brand?.certifications||[]).forEach(cert=>{…})`,
reading `cert.expiryDate` to raise calendar events.

**`hasCertData` (≈33525)** — `.some(c=>c.expiryDate)`, gating **only** the empty-state prompt
*"Add your certification dates in Brand Profile"*. **It asserts nothing.** Strategy: do not
harden a surface that is already correct — but it must route through the accessor so that
**no direct read remains**, which is ruling 5's whole point.

Line numbers have moved every shipment. **Locate by behaviour.**

---

## THE GATE — ruling 5 in structure, not policy

> **After this shipment, `.expiryDate` may be read in exactly one place: inside the accessor.**

Assert **zero** occurrences of `.expiryDate` in `index.html` outside the accessor's own body,
located by its comment banner and closing brace — **never by line number**.

**This is what retires the epitaph.** 33362 and 33514 stop being special sites needing a
comment to explain why they read raw; they stop reading raw. **The next consumer cannot
reintroduce a direct read without the battery refusing.**

**It must be seen failing.** Add a direct `.expiryDate` read in a scratch copy, show the FAIL,
revert — as with the copy gate and all three #131 groups.

---

## REPORT, DO NOT IMPLEMENT

1. **Whether `normalizeCertifications` should be re-expressed as
   `accessor(raw).map(r => r.name)`.** It would make the two readers structurally unable to
   disagree — but it edits the reader in **three copies**, and the copy gate would enforce
   identity across surfaces that must not gain the record accessor. **Report the trade; do not
   do it.** The lane's instinct is no, and the instinct may be wrong.
2. **Reachability of the dropped-entry case.** A `brand.certifications` entry with an
   `expiryDate` but **no name** is currently counted by `.some(c=>c.expiryDate)` and would
   raise a calendar event with no label. The accessor drops it. **Same class as #129** — state
   whether onboarding or the seed can produce one, and report it as a difference rather than a
   pass if reachable.
3. **Every other field on a certification record anywhere in the tree.** `name`, `label`,
   `expiryDate` are known. If onboarding or the seed writes anything else, the accessor is
   silently discarding it and M4 will need it. **The count is the finding.**

---

## OUT OF SCOPE

- **M2, M3, M4.** In particular: **no rendering change**, no `not_recorded` marker, no expiry
  semantics. Strategy's rulings 1–3 are M4's.
- **The writer.** `toggleSkuCert` still pushes strings after this shipment. That is correct —
  M1 builds the path, M2 changes what travels it.
- **No brand → SKU propagation** (ruling 4). Nothing here touches SKU certifications at all,
  and nothing later may copy a brand-level record onto a SKU: **scope is a field on the
  certificate, not a consequence of the migration.**
- Third-party reference data. Permanently.

---

## STOP. NO COMMIT.

One accessor, two consumers, one gate, three reports.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. The accessor's full source, verbatim.
3. Before/after for both consumers.
4. **Evidence the calendar raises byte-identical events** — three-way against a pre-edit
   capture, as every phase has been.
5. The gate's output, and **evidence it FAILS** on an injected direct read.
6. The three reports.
7. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `6d4d09b7`; five others UNCHANGED; `1 of 6
modified`. **Copy gate still three surfaces** — this shipment adds no copy of the *name*
reader. The new `.expiryDate` gate must be visible in the output.

---

## SMOKE

**Step 1.** Open the Compliance Calendar. The same deadlines appear, in the same order, with
the same day counts.
*Failure: any event missing, added, or reordered.*

**Step 2.** A brand with **no** certification dates still sees the *"Add your certification
dates"* prompt and its button.

**Step 3 — the step that proves the boundary held.** A brand **with** certificate expiry dates
does **not** see that prompt.
*Failure: either state flipping means `hasCertData` changed meaning.*
