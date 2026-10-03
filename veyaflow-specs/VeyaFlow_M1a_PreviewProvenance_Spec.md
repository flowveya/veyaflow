# VeyaFlow — M1a: the Brand Pack preview's RP row. One surface, and the set is the catalogue

**coding lane → CC · `index.html` ONLY · REWRITTEN after CC's stop on condition 2.**

> **STALENESS CHECKED BY THE CODING LANE against register HEAD `241751e`, 3 October 2026, at dispatch.**
> *CC carries no staleness check. The hash is the evidence that the check was made, not a task.*

**SUPERSEDES THIS FILE'S VERSION AT `1bd6e03`**, whose `Expect:` line asserted a string the ruling it
cited forbids for the measured fixture. *CC caught the spec contradicting its own source. Same filename:
two names for one shipment is failure mode 7.*

---

## THE RULING, VERBATIM

**Source: `open-items.md` at `241751e` — `CODINGS ANDRA RELÄ 2 okt §2`, `CODINGS FJÄRDE RELÄ 2 okt §1–§2`.**

### The three states

> `present` → **EU Responsible Person · `<name>` · confirmed to `<renewalDate>`**
> `expired` → **EU Responsible Person · `<name>` · last confirmed `<date>` · not confirmed since**
> `absent` → **EU Responsible Person · not recorded**
>
> *The pack asserts the RECORD's state with its date, never a regulatory status we have not measured.
> The date IS the provenance.*

### The three levels — corrected. **The earlier third level is dead.**

> - **Uniform** → **one row**, in the regime's own words
> - **Two regimes** → **one row per regime**, never merged
> - **Non-uniform within one regime** → **a SUMMARY row true for all:**
>   *EU Responsible Person · 5 products · 2 operators · earliest confirmation lapsed 2025-12-31*
>
> **THE SUMMARY ROW MUST NAME ITS SET. For this surface the set is THE CATALOGUE** — `brandPackState`
> has no `skuIds`, so the row says so in its own words (*in the catalogue*), not by implication.
> **Without the set the number is a claim about something unknown.**
>
> *Why the earlier rule was wrong: "no brand-level row" on a tile with no per-SKU cells is a blank where
> a claim stood — a false absence.*

---

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

## NAMED BASELINES

**The eleven surfaces at the values `verify.expected.txt` NAMES.** Start GREEN at `0 of 11 modified`,
end at `1 of 11`. The lane names the digest after two independent computations.

---

## THE DEFECT — CC's MEASUREMENT, NOT RE-DERIVED

`Belägg: index.html:renderBrandPack` builds the page-1 Compliance tile's RP row as
`_operatorRow(heroSku,'EU RP')` with `heroSku = skus[0]`, rendering `(_r[1]?'✓ ':'✗ ')+_r[0]` and
`_r[1]||'Not set'`. `Belägg: index.html:_operatorValueFor` returns, for `euResponsible`, **the SKU's own
free-text field** — no date, no comparator — beneath the heading *verified data only, no AI*.

**Two defects in one row:** the value is free text, **and** it describes array position zero of the
catalogue rather than the catalogue.

## THE EDIT

**The RP row is computed over the catalogue and rendered per the level ruling.** Group the catalogue's
SKUs by `getOperatorRegime(sku)`; run `_operatorStatus` per SKU; emit one row per regime in the uniform
form, or the summary form when the regime's SKUs disagree on operator or date — **naming the set in the
row.**

> **SCOPE DECISION, STATED SO STRATEGY CAN OVERTURN IT: this shipment does NOT change
> `_operatorValueFor`.** *K19 rules that where surfaces read the resolver, the resolver is what gets
> fixed. This row stops reading it: a summary over a SET cannot live in a per-SKU resolver, which has no
> set.* **K19 remains open and unchanged for the other eight surfaces that do read it.** If Strategy
> reads K19 as binding here, say so and this becomes a nine-surface shipment instead of one.

**CC measured that the row is replaceable on its own** — the tile's IIFE, with `getOperatorRegime` and
`_operatorStatus` both in scope. **So stop condition 1 of the previous version does not arise and is
removed rather than left reading as a live risk.**

**Must not survive the edit:** the `✓`/`✗` prefix on the RP row · the literal `Not set` as its value ·
any RP value sourced from a SKU free-text field · any RP claim that describes `skus[0]`.

> **STOP CONDITION — geometry, measured by CC and unresolved.** *The value cell is capped at 120 px with
> `white-space:nowrap` and `text-overflow:ellipsis` at `.7rem` — about 17–18 characters. The ruled strings
> are 60+.* **Two ways out exist and both are layout changes to the tile: put the full sentence in the
> unconstrained label cell and leave the value cell empty, or give the Compliance block its own row shape
> by duplication rather than by sharing with "The numbers".** *Report which you would take and why — and
> STOP. The surface is Design's, not this spec's.*

## WHAT THIS SPEC DOES NOT TOUCH

`buildPortalBrandPack`, the proxy, `portal.html`, `onFile` — **M1b–M1d**. K17's `skus[0]` inventory for
the tile's other eight values — **measured after M1b is out**. K18, K19. The readiness parking. `#252`,
`#251`, the stash.

---

## STANDING, UNTIL M1c HAS SHIPPED

> **NO BRAND PACK IS SHARED.** *No flag is built — the rule lives in the register and costs nothing.*

## SMOKE — ONE STEP. ENTRY POINT **AND** WRITER.

| field | value |
|---|---|
| entry point | `localhost:8000` → Brand Pack Generator → page-1 preview, hard-reload first |
| **writer of the asserted string** | **`index.html:renderBrandPack` → the Compliance tile's RP row** |

**Report two things, both as text:** the rendered line, **and the catalogue's actual distribution** —
how many SKUs, how many regimes, how many distinct operators, the earliest confirmation date.
*The expected string cannot be written here in advance, because the live catalogue's uniformity is
`OLÄST` — the SKU records are in Charlotte's browser (`ns_skus`). The check is that the rendered line
matches the rule GIVEN the distribution, not that it matches a sentence I guessed.* **That is what the
previous version got wrong: it asserted the non-uniform fixture's row would read as a uniform one.**

## REPORT BACK

The diff · **your** digest as your own computation · `verify.sh` at 57 GREEN, 1 of 11 modified ·
`Belägg: <file>:<function name>` for every function touched · `OLÄST` for anything unexamined.
