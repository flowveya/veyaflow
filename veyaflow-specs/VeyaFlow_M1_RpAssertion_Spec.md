# VeyaFlow — M1b · M1c · M1d: the published pack path. Expand → migrate → contract

**coding lane → CC · THREE SHIPMENTS, ONE SURFACE EACH, STRICT ORDER `b → b′ → c → d`.**

> **STALENESS CHECKED BY THE CODING LANE against register HEAD `d9af42c`, 3 October 2026, at dispatch.**
> *CC carries no staleness check — the log repo is unreachable from the app repo. The hash is the
> evidence that the check was made, not a task for the reader.*

**SUPERSEDES THIS FILE'S VERSION AT `212cf27`**, whose third level CC's own measurement falsified.
*Same filename: two names for one shipment is failure mode 7.*

---

## THE RULING, VERBATIM

**Source: `open-items.md` at `d9af42c` — `CODINGS ANDRA RELÄ 2 okt §2`, `CODINGS FJÄRDE RELÄ 2 okt §1`,
`CODINGS FEMTE RELÄ 3 okt §1, §3, §4`.**

### The three states

> `present` → **EU Responsible Person · `<name>` · confirmed to `<renewalDate>`**
> `expired` → **EU Responsible Person · `<name>` · last confirmed `<date>` · not confirmed since**
> `absent` → **EU Responsible Person · not recorded**
>
> *The pack asserts the RECORD's state with its date, never a regulatory status we have not measured.
> The date IS the provenance.*

### The levels — two reachable, one not

> - **Uniform** (same regime, operator and date across the set) → **one row**, in the regime's own words
> - **Two regimes** → **one row per regime**, never merged
> - **Non-uniform within one regime** → **a SUMMARY row true for all:**
>   *EU Responsible Person · 5 products · 2 operators · earliest confirmation lapsed 2025-12-31* —
>   **and the row must name its set.**

> ### THE THIRD LEVEL IS UNREACHABLE BY CONSTRUCTION TODAY. IT IS NOT DROPPED.
>
> **`Belägg: index.html:_operatorStatus` — `var rec = (brand && brand[regime.field]) || null;
> var renew = (rec && rec.renewalDate) || ''`.** The name and the date come from **the brand record,
> one object per regime**; the SKU contributes presence only. **So two operators or two dates within
> one regime cannot arise.** `Mätt av CC 3 okt: fixture s1 and s2 both report expired / 2025-12-31
> while s2.euResponsible reads 'Another RP Oy'.`
>
> **Two operators within one regime exist in the tree only in `sku.euResponsible` — free text,
> unvalidated, never compared.** *The register's cited evidence — Lyko's template, C&G's two RPs across
> five rows — was an observation of the recipient's template and of that free text, not of our model.*
>
> **The rule stands written because the model changes under K21** (RP per product in the record, layer 1,
> after M1). **It is not softened, not deleted, and not to be implemented against today's model.**
> *Same form as `#197`: hidden is a state.*

### Unresolved classification — standard, ruled 3 Oct

> **A SKU the pack cannot classify is NAMED in the output. Never silently absent, never defaulted.**
> Four frameworks resolve to a `null` regime and all four appear as rows: `unknown` (untyped),
> `textile` (legacy), `food`, `supplement`. **Form: `unresolved: [{ id, returned }]`** — CC's own, adopted
> as measured.

---

## DISPATCH LOG

| date | shipment | sent | evidence |
|---|---|---|---|

> **One row PER shipment, filled at the moment of sending, carrying the commit sha of the bytes sent.**

## NAMED BASELINES

**The eleven surfaces at the values `verify.expected.txt` NAMES** — the source, never a copy. Each
shipment starts GREEN at `0 of 11 modified` and ends at `1 of 11`. The lane names each digest after two
independent computations; CC reports its own and pastes nothing.

## K19 DOES NOT BIND THIS PATH — RE-CONFIRMED BY CC

**`Belägg: index.html:buildPortalBrandPack` contains zero occurrences of `_operatorRow`,
`_operatorValueFor`, `_operatorStatus`, `getOperatorRegime` and `_rpDateExpired`** — measured inside the
function body, 3 Oct. *K19's rule binds the nine surfaces that read the resolver. This is not one.*

---

# M1b · EXPAND — `index.html` emits the new shape BESIDE `onFile`

**Nothing is removed. No rendered string changes anywhere.**

`buildPortalBrandPack` iterates `sub.skuIds`, groups by `getOperatorRegime(sku)`, calls
`_operatorStatus` per SKU, and emits **CC's measured shape**, adopted as specified:

```
set:        { name: "this pack (sub.skuIds)", size: <n> }
regimes:    [ { label, field, products, operators, distinctDates,
                states, earliestDate, uniform } ]
unresolved: [ { id, returned } ]
```

- **`pack.euResponsible = { name, onFile:true }` STAYS, untouched.** The proxy and `portal.html` keep
  working byte for byte. *That is what makes expand safe.*
- **`uniform` is emitted even though it can only be `true` today.** **It is the forcing condition for the
  third level:** the day K21 lands and it first reads `false`, the summary rule above is already written
  and nobody rediscovers it. *A rule for an unreachable state needs a trigger, or it is a wish.*
- **An empty set is emitted honestly** — `set.size: 0`, `regimes: []` — **and not refused here.**
  *Refusing it is M1b′, the next shipment; a creation-path change inside an expand would be two
  surfaces.*
- **STOP** if a SKU's regime cannot be resolved **and** the `unresolved` form above cannot carry it —
  report the shape, never default the regime.

**Smoke: none, deliberately.** *No rendered string changes; a step asserting on an unchanged screen
would be theatre.* Verification is `verify.sh` plus the emitted structure as text, for **three fixtures**:
a uniform pack, a two-regime pack, and a pack containing at least one `null`-regime SKU.

# M1b′ · THE EMPTY SET — ITS OWN SPEC

`VeyaFlow_M1b_prime_EmptySubmission_Spec.md`. **Runs straight after M1b, before M1c.**

# M1c · MIGRATE — `portal.html` reads the new fields and renders state + date

`Belägg: portal.html:renderDetail` holds a boolean-gated name today: `brandRp` feeds the per-SKU `EU RP`
cells and one *EU Responsible Person on file: `<name>`* line. **It grows to render one row per regime in
the uniform form, plus the `unresolved` rows.**

- **The per-SKU cells are this surface's carrier** and keep the detail.
- **Removing a false entry must not create a false absence** — no blank, no placeholder.
- **STOP** if the column layout cannot carry a date without a design change. *That is Design's.*

**After M1c, and not before, the no-sharing rule lifts.**

**Smoke:** entry `localhost:8000` → portal → a submission detail view; **writer of the asserted string:
`portal.html:renderDetail`.** Report the rendered line as text **with the fixture's distribution beside
it**, so the line is checked against the rule rather than against a sentence anyone guessed.

# M1d · CONTRACT — `onFile` disappears

Remove `onFile` from `buildPortalBrandPack` and the passthrough in `supabase-proxy.js`.

- **Precondition, checkable:** no reader of `onFile` remains in the eleven surfaces. **Report the pattern
  searched** — a zero result is a claim about the pattern, never about the tree.
- **STOP** if any reader remains.
- **`sku.euResponsible` IS NOT DELETED, here or in M1a.** *M1a stops rendering it as verified; the field
  stays as data until K21's migration has read it — parking applies to the surface, never to the data.*
- `verified: bp.verified === true` is out of scope — the `verifiedTier` gap Strategy ruled is the
  protection.

---

## STANDING, UNTIL M1c HAS SHIPPED

> **NO BRAND PACK IS SHARED.** *No flag is built — the rule lives in the register and costs nothing.*

## WHAT NONE OF THESE TOUCH

The preview path — **M1a**. K17's `skus[0]` inventory. K18's invented regime in `scoreReadiness`.
K19's resolver. **K21's per-product RP record — Strategy's spec, layer 1, after M1.** The readiness
parking. `#252`, `#251`, the stash.

## REPORT BACK, PER SHIPMENT

The diff · **your** digest as your own computation · `verify.sh` at 57 GREEN, **1 of 11 modified** ·
`Belägg: <file>:<function name>`, never a line number · `OLÄST` for anything not looked at.
