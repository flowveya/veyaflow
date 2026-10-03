# VeyaFlow — M1b · M1c · M1d: the published pack path. Expand → migrate → contract

**coding lane → CC · THREE SHIPMENTS, ONE SURFACE EACH, STRICT ORDER `b → c → d`.**

> **STALENESS CHECKED BY THE CODING LANE against register HEAD `241751e`, 3 October 2026, at dispatch.**
> *CC carries no staleness check — the log repo is unreachable from the app repo and a duty assigned to a
> party with no instrument is the shape we keep removing. The hash is the evidence that the check was
> made, not a task for the reader.*

**SUPERSEDES THIS FILE'S VERSION AT `1bd6e03`**, whose third level was overturned by the register the
same day. *Same filename on purpose — two names for one shipment is failure mode 7.*

---

## THE RULING, VERBATIM

**Source: `open-items.md` at `241751e` — `CODINGS ANDRA RELÄ 2 okt §2`, `CODINGS TREDJE RELÄ 2 okt §2`,
`CODINGS FJÄRDE RELÄ 2 okt §1`.**

### The three states

> `present` → **EU Responsible Person · `<name>` · confirmed to `<renewalDate>`**
> `expired` → **EU Responsible Person · `<name>` · last confirmed `<date>` · not confirmed since**
> `absent` → **EU Responsible Person · not recorded**
>
> The pack never asserts a regulatory STATUS we have not measured — it asserts the RECORD's state with
> its date. *We do not know whether the brand renewed with its RP. We know when our record was last
> confirmed. The date IS the provenance.*

### The three levels — as corrected 2 Oct. **The earlier third level is dead.**

> - **Uniform** (same regime, operator and date across the set) → **one row:**
>   *EU Responsible Person · `<name>` · `<state + date>`*
> - **Two regimes** → **one row per regime**, never merged
> - **Non-uniform within one regime** → **a SUMMARY row that is true for all:**
>   *EU Responsible Person · 5 products · 2 operators · earliest confirmation lapsed 2025-12-31* —
>   **plus the per-SKU cells where they exist.** *The row asserts no uniformity, carries provenance
>   (the count and the earliest date), and creates no absence.*
>
> **THE SUMMARY ROW MUST NAME ITS SET** — *in the pack*, for this path, since the pack has content.
> **Without the set the number is a claim about something unknown.**
>
> **No SKU governs; a Responsible Person is appointed PER PRODUCT. `heroSku` has no regulatory role.
> No third argument is invented — it is derived from the set's content.**

*Why the earlier rule was wrong: "no brand-level row" on a surface without per-SKU cells is a blank where
a claim stood — a false absence, which the register forbids.*

---

## DISPATCH LOG

| date | shipment | sent | evidence |
|---|---|---|---|

> **One row PER shipment, filled at the moment of sending, carrying the commit sha of the bytes sent.**

## NAMED BASELINES

**The eleven surfaces at the values `verify.expected.txt` NAMES** — the source, never a copy. **Each
shipment starts GREEN at `0 of 11 modified` and ends at `1 of 11`.** *Two modified at any point means
two surfaces moved and the shipment is wrong.* The lane names each digest after two independent
computations; CC reports its own and pastes nothing.

## THIS PATH DOES NOT READ THE RESOLVER — WHICH IS WHY K19 DOES NOT BIND IT

**`Belägg: index.html:buildPortalBrandPack` sets `euResponsible` directly and is absent from CC's
measured caller list for `_operatorRow` (10 call sites, 7 functions) and `_operatorValueFor` (4 call
sites).** *K19's rule — where the surfaces read the resolver, the resolver is what gets fixed — applies
to the nine surfaces that do. This path is not one of them.* **If CC's inventory turns out to have
missed a call, STOP: that changes the shipment's scope, not its code.**

---

# M1b · EXPAND — `index.html` emits the new shape BESIDE `onFile`

**Nothing is removed. No rendered string changes anywhere.**

`buildPortalBrandPack` iterates the pack's SKUs (`sub.skuIds`), groups them by `getOperatorRegime(sku)`,
calls `_operatorStatus` per SKU, and emits per regime either the uniform row's parts or the summary's —
**the count, the number of distinct operators, and the earliest confirmation date — together with the
name of the set the counts are over.**

**`pack.euResponsible = { name, onFile:true }` STAYS, untouched**, so the proxy and `portal.html` keep
working byte-for-byte.

- **Reachability is settled; do not re-measure.** `_operatorStatus` and `buildPortalBrandPack` are
  top-level declarations in separate classic `<script>` blocks sharing one global scope, block 1 first.
  **Do not inline a second comparator.**
- **STOP** if a regime cannot be resolved for a SKU — report which SKU and what `getOperatorRegime`
  returned. *Never default it: a defaulted regime is a value whose absence meant something.*
- **STOP** if `sub.skuIds` can be empty or absent for a real submission — report the condition. *A
  summary over an unnamed or empty set is the defect this form exists to prevent.*

**Smoke: none, deliberately.** *This shipment changes no rendered string — that is what makes expand
safe, and a step asserting on an unchanged screen would be theatre.* Verification is `verify.sh` plus
the emitted structure reported as text, **including the set name and the counts for a non-uniform
fixture.**

# M1c · MIGRATE — `portal.html` reads the new fields and renders state + date

`Belägg: portal.html:renderDetail` today holds a boolean-gated name: `brandRp` feeds the per-SKU `EU RP`
column cells and one *EU Responsible Person on file: `<name>`* line. **It grows to carry one row per
regime — uniform form or summary form per the ruling — and the per-SKU cells keep the detail.**

- **The per-SKU cells are this surface's carrier**, so the summary row and the cells coexist here.
- **Removing a false entry must not create a false absence** — no blank, no placeholder, no "coming soon".
- **STOP** if the column layout cannot carry a date without a design change. *That is Design's.*

**After M1c, and not before, the no-sharing rule below lifts.**

**Smoke:** entry `localhost:8000` → portal → a submission detail view; **writer of the asserted string:
`portal.html:renderDetail`.** Report the rendered line as text, with the fixture's regime/operator/date
distribution beside it so the line can be checked against the rule rather than against expectation.

# M1d · CONTRACT — `onFile` disappears

Remove `onFile` from `buildPortalBrandPack` and the passthrough in
`Belägg: netlify/functions/supabase-proxy.js`. **Only now does the concept cease to exist.**

- **Precondition, checkable:** no reader of `onFile` remains in any of the eleven surfaces. **Report the
  pattern searched** — a zero result is a claim about the pattern, never about the tree.
- **STOP** if any reader remains. *Contracting with a live reader is the failure M1c exists to prevent.*
- `verified: bp.verified === true` is **out of scope** — false today for the same reason the gold badge
  never renders, and it belongs to the `verifiedTier` gap Strategy ruled is the protection.

---

## STANDING, UNTIL M1c HAS SHIPPED

> **NO BRAND PACK IS SHARED.** *The generator still writes `onFile` from a name; the one published pack is
> withdrawn; the next publication carries the same lie until M1c.* **No flag is built — Charlotte is the
> only user and the rule lives in the register. A flag would be a shipment; the rule is free.**

## WHAT NONE OF THE THREE TOUCH

The preview path (`renderBrandPack` → `_operatorRow` → `_operatorValueFor`) — **M1a**. The nine other
name-only sites. K17's `skus[0]` inventory. K18's invented regime in `scoreReadiness`. K19's resolver.
The readiness parking. `#252`, `#251`, the stash.

## REPORT BACK, PER SHIPMENT

The diff · **your** digest as your own computation · `./verify.sh` at 57 gates GREEN, **1 of 11
modified** · `Belägg: <file>:<function name>`, a name and never a line number · `OLÄST` for anything not
looked at.
