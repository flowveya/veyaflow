# VeyaFlow — Time axis step 7: expand phase 3c, the mixed and brand-side reads

**9 September 2026 · coding lane → CC**

Closes the expand phase. **Includes three sites 3b should have covered and did not** — a gap
in the lane's scope definition, not in CC's enumeration.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           eb8299557005ae16cfb2f3d44ac7dd390133c5a5f031fd02915bf9f047a1041f
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `d126ec1`. **Confirm all six. Only `index.html` moves.**

---

## THE GAP 3b LEFT, AND WHY

**32436, 32475, 32528** spread `sku?.certifications` **raw**:

```js
const certs = [...(sku?.certifications||[]), ...(brand?.certifications?.map(c=>c.name||c)||[])].map(c=>(c||'').toLowerCase());
```

The brand half is tolerated; the sku half is not. **An object entry is truthy, so `(c||'')`
passes it through and `.toLowerCase()` throws.**

3b's scope said *"reads that produce a displayed or prompt string."* These produce a
**matching array**, so they fell outside the definition. **The lane's shape was too narrow —
the shape must be the OPERATION performed on the field, not the DESTINATION of the result.**
Recorded because the same error would recur on the next migration.

---

## SCOPE — BY OPERATION

**In scope: every remaining read of `certifications` on `sku` or `brand` that extracts NAMES.**

| site | shape |
|---|---|
| **32436, 32475** | mixed spread, then `.toLowerCase()` — **throws today on the object form** |
| **32528** | mixed spread, no lowercase |
| **34761** | `(brand?.certifications||[]).map(c=>c.name||c.label||c)` — reads `.label` too |
| **26228** | `(brand?.certifications||[]).map(c=>c.name||c).slice(0,8)` — **classify before touching** |

**26228 needs classifying first.** If it builds a payload that is **sent or persisted**, it
belongs with 34592 / 35734 / 26233 in migrate, not here. **Report which, and do not edit it if
it publishes.**

**34761 is `csrdAutoFill`,** which CC established writes to `ns_csrd_answers` — **persisted.**
Same test: if the normalised value is stored rather than displayed, it is migrate. **Report,
then decide with me before editing.**

---

## EXPLICITLY OUT — THE `expiryDate` CONSUMERS STAY RAW

**33362** (`buildComplianceEvents`) and **33514** (`.some(c=>c.expiryDate)`).

These read a field the canonical reader **deliberately discards**. They cannot use it, and
they do not need to: `brand.certifications` is **already the object form**, so they already
work. Forcing them through the reader would break them.

**This is the boundary the expand phase reveals: the reader answers "what are they called",
never "what do we know about them".** A second accessor for the object form is a **migrate-phase
design question**, and it is where Strategy's validity-rendering ruling will land.

**Do not touch either site. Do not add a second reader in this shipment.**

---

## IMPLEMENT

Replace the name-extracting reads with `normalizeCertifications(...)`.

**For the mixed sites, normalise BOTH halves:**
```js
// before
[...(sku?.certifications||[]), ...(brand?.certifications?.map(c=>c.name||c)||[])]
// after
[...normalizeCertifications(sku?.certifications), ...normalizeCertifications(brand?.certifications)]
```

**Then check whether the trailing `.map(c=>(c||'').toLowerCase())` is still needed.** The
reader guarantees non-empty strings, so `(c||'')` is now a guard that cannot fire — the shape
declined five times this week. **`.toLowerCase()` stays; the `||''` should go.** Say whether
you agree.

**34761's `c.label` fallback is already inside the reader** (`entry.name || entry.label`), so
the site loses nothing — confirm that rather than assuming it.

---

## REPORT, DO NOT IMPLEMENT

1. **26228 and 34761: displayed or persisted?** Trace each to its destination. **Anything
   persisted or sent moves to migrate.**
2. **Whether any other read of `certifications` remains anywhere in the file** after this
   shipment, on any accessor, in any shape. **The expand phase is finished only when that
   answer is "none except the `expiryDate` consumers and the writer."** Report the count.
3. **Whether 32436 and 32475 are duplicates.** They look identical. If so, that is #131's shape
   again — near-copies with no gate — and worth its own note.

---

## STOP. NO COMMIT.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. Independent enumeration, and any site this spec missed. **The lane has now missed sites in
   two consecutive shipments; assume the list is incomplete.**
3. The evidence table, three-way as before, with **reachability stated per difference.**
4. The three reports. **Report 2 is the finding** — it declares the expand phase complete or
   not.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `eb829955`; five others UNCHANGED; `1 of 6
modified`; copy gate still **three** surfaces.

---

## SMOKE

**Step 1.** Open the surfaces 32436/32475/32528 feed — they gate market-entry and claim
matching. Behaviour unchanged for a SKU with certifications.

**Step 2.** A SKU with **no** certifications and a brand **with** them still matches on the
brand's — the merge must survive normalisation.

**Step 3 — the step that proves the boundary held.** The Compliance Calendar still raises
events from certificate expiry dates, and the panel gated on `.some(c=>c.expiryDate)` still
appears.
*Failure: either disappearing means an `expiryDate` consumer was routed through the reader.*
