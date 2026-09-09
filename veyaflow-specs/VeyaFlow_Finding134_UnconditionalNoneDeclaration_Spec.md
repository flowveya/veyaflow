# VeyaFlow — #134: "None" declared for nanomaterials and CMR substances, unasked

**9 September 2026 · coding lane → CC · Strategy: own severity class**

**Two lines. Shipped alone.**

> *"Ett falskt 'None' på en yta som matar en CPNP-anmälan är inte en produktdefekt — det är en
> felaktig uppgift på väg in i en myndighetsanmälan."*

Nanomaterials and CMR substances are the two categories under EC 1223/2009 carrying the
strictest notification requirements. Everything else on the board damages trust. **This could
lead a customer to file an untrue declaration.**

**And the honest proportion beside it:** no paying customers. Strategy assessed exposure as
likely zero on the grounds that Cloud & Glow sells device and accessory — **that premise is
disputed below and is part of this shipment's report.**

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           c8a754f2695427c8dc249d53caa3c079e9d176618fdf1c1cd272c8d0adcd0aea
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `6c09aa3`. **Confirm all six. Only `index.html` moves.**

---

## THE TWO LINES

`index.html:19423–19424`:

```js
{portal:'Nanomaterials present',  value: sku.nanomaterials||'None',          filled:true, required:true},
{portal:'CMR substances present', value: sku.cmrSubstances||'None confirmed', filled:true, required:true},
```

**They are the only two of nineteen that do not derive `filled` from their value.** Every
sibling is `filled:!!<value>`. So the fix is not a new pattern — it is making two lines
consistent with the seventeen around them.

`sku.nanomaterials` and `sku.cmrSubstances` have **no writer** (#133). The user is never asked.

---

## THE FIX — Strategy's shape

> **`filled` is derived from whether the user was asked and answered. It is never set.
> The value renders `not_recorded`, not "None".**

**1 · `filled` derives from the value**, exactly as the seventeen siblings do.

**2 · The default value goes.** `||'None'` and `||'None confirmed'` are the declaration. Remove
them.

**3 · Use the treatment the unfilled siblings already get — do not invent one.** Fifteen fields
already render with `value: ''` and `filled:false`. **Report what the renderer does with
those**, and use it. If that treatment is *indistinguishable from a negative answer* — if an
empty row reads as "no nanomaterials" rather than "not recorded" — say so, because then it is
not sufficient here and the explicit `not_recorded` string is required. **This surface cannot
have an ambiguous blank.**

---

## THIS SHIPMENT MAKES A NUMBER WORSE, ON PURPOSE

`filledRequired` drops by up to 2, so `readyPct` falls and `missingRequired` gains two rows.

**That is correct and must not be compensated for.** Strategy's gate point 7: *a pilot that
hits a wall at 64% has a worse experience than one meeting an honestly empty product* — and a
meter that counts an unasked question as answered is the same defect as the declaration.

**Do not touch `readyPct`, the required count, or the meter.** That is **#135**, and it needs
its own shipment. **Report the new number** so #135 inherits a measured figure rather than an
estimate.

---

## REPORT, DO NOT IMPLEMENT

1. **Is the surface reachable for Cloud & Glow?** Strategy's exposure assessment rests on the
   catalogue being device and accessory only. **The portal shows "Cloud & Glow Face Serum ·
   Cosmetic · EU 1223/2009" with CPNP on file.** Establish from the code which product types
   reach this helper, and whether a `cosmetic` SKU in the current catalogue does. **Report the
   answer plainly — it decides whether exposure is zero or live, and Strategy has asked that
   their runtime claims be treated as hypotheses until verified.**
2. **The renderer's treatment of an unfilled field** — verbatim, and whether it is
   distinguishable from a negative answer.
3. **Any other `filled:` that is not derived from its value**, anywhere in the file. Two were
   found by a sweep looking for something else; **a third would mean this is a pattern rather
   than a pair.** The count is the finding.

---

## OUT OF SCOPE

- **#135** — the five unfillable required fields and the 64% cap, including the
  `countryOfManufacture||mfrCountry` vs `countryOfMfr` name mismatch.
- **#136, #137, #138.**
- **M4.** Moved below the write-path repairs by Strategy's ruling.
- Adding writers for `nanomaterials` or `cmrSubstances`. **That is the write path (#135's
  family) and it is not this shipment.** This shipment stops an assertion; it does not build
  the question.

---

## STOP. NO COMMIT.

Two lines. Three reports.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. Before/after for both lines.
3. **The new `readyPct` for a SKU with no nanomaterials or CMR data**, measured.
4. The three reports. **Report 1 decides the exposure statement in the log.**
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `c8a754f2`; five others UNCHANGED; `1 of 6
modified`.

---

## SMOKE

**Step 1.** Open the CPNP helper for a cosmetic SKU with no nanomaterial or CMR data. Both
rows show as **not recorded** — not "None", not "None confirmed", and **not a blank that could
be read as a negative answer.**

**Step 2.** Both rows now appear in the missing-required list, and the readiness percentage is
lower than before.
*Failure: either row still counting as filled.*

**Step 3 — the step that passes only if nothing else moved.** Every other row on that surface
renders exactly as before, and a SKU with all data present shows the same percentage it did.
