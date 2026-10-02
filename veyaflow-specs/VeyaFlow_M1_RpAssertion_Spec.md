# VeyaFlow — M1b · M1c · M1d: the published pack path. Expand → migrate → contract

**2 October 2026 · coding lane → CC · THREE SHIPMENTS, ONE SURFACE EACH. STRICT ORDER.**

**SUPERSEDES THIS FILE'S 2 OCT VERSION AT `f7f37cf`**, which specified one edit to
`buildPortalBrandPack` and was stopped by CC on two of its own stop conditions. *Same filename on
purpose — two names for one shipment is failure mode 7, and the older name held the stale version.*
**M1a (the preview) is a separate surface in its own spec and ships FIRST.**

---

## THE RULING, VERBATIM — NOT A POINTER

**Source: `open-items.md` at commit `5d4e1ce`, sections `CODINGS ANDRA RELÄ 2 okt §2` and
`CODINGS TREDJE RELÄ 2 okt §2 and §4`.** *That file is in the log repo and you cannot reach it. The
standing rule was amended 2 Oct for that reason: a spec carries the operative text, the section name
and the hash. If the register has moved past `5d4e1ce`, this is a relay that may have expired — say so
rather than implementing it.*

### The three states and their strings

> `present` → **EU Responsible Person · `<name>` · confirmed to `<renewalDate>`**
> `expired` → **EU Responsible Person · `<name>` · last confirmed `<date>` · not confirmed since**
> `absent` → **EU Responsible Person · not recorded**
>
> The pack never asserts a regulatory STATUS we have not measured — it asserts the RECORD's state with
> its date. *We do not know whether the brand renewed with its RP. We know when our record was last
> confirmed. The date IS the provenance.*

### The level

> **No SKU governs. A brand-level RP row is a category error. A Responsible Person is appointed PER
> PRODUCT.** `Mätt 2 okt: Lyko's own template has one RP row per product; C&G's submission carries two
> different RPs across five rows.`
> - same regime, operator and date across all the pack's SKUs → **one** row, in the regime's own words:
>   *EU Responsible Person* (cosmetic) / *EU Economic Operator* (device)
> - two regimes → **two** rows, one per regime, never merged
> - differing operator or date inside one regime → **no brand-level row for that regime; the per-SKU
>   cells carry it.** *A brand-level row is a SUMMARY and may exist only when true for all.*
>
> **`heroSku` has no role. No third argument is invented — it is derived from the pack's content.**

### Why three shipments and not one

> `onFile` is writer → passthrough → reader, and the reader is `portal.html:renderDetail`. Remove it
> from `index.html` alone and `brandRp` becomes `''`: the *EU Responsible Person on file* line
> disappears and the per-SKU cells lose their fallback — **exactly what the previous spec's own smoke
> listed as must-not-appear.** As M4's certificate migration: expand → migrate → contract, one surface
> per shipment, no exception from the one-edit rule.

---

## DISPATCH LOG

| date | shipment | sent | evidence |
|---|---|---|---|

> **Not dispatched until the row exists. One row PER shipment, filled at the moment of sending.**

## NAMED BASELINES

**The eleven surfaces at the values `verify.expected.txt` NAMES** — the source, never a copy.
**Each shipment starts from GREEN with `0 of 11 modified` and ends at `1 of 11`.** *Two modified at any
point means two surfaces moved and the shipment is wrong.* The lane names each digest after two
independent computations.

---

# M1b · EXPAND — `index.html` emits the new shape BESIDE `onFile`

**Nothing is removed. Nothing downstream changes behaviour.**

`Belägg: index.html:buildPortalBrandPack` iterates the pack's SKUs, groups them by
`getOperatorRegime(sku)`, calls `_operatorStatus` per SKU, and emits brand-level operator entries
**only where the level ruling permits a row** — carrying, per entry: the regime, the regime's own
label, the operator name, the state, and the date.

**`pack.euResponsible = { name, onFile:true }` STAYS, untouched**, so `supabase-proxy.js` and
`portal.html` keep working byte-for-byte.

- **Reachability is settled, do not re-measure it:** `_operatorStatus` and `buildPortalBrandPack` are
  top-level declarations in separate classic `<script>` blocks sharing one global scope, block 1 first.
  **Do not inline a second comparator.**
- **STOP** if a regime cannot be resolved for a SKU — report which SKU and what `getOperatorRegime`
  returned. *Do not default it: a defaulted regime is a value whose absence meant something.*

**Smoke:** none. *This shipment changes no rendered string anywhere — that is what makes it safe, and
a smoke step asserting on an unchanged screen would be theatre.* Verification is `verify.sh` plus the
emitted structure reported as text.

# M1c · MIGRATE — `portal.html` reads the new fields and renders state + date

**The surface question lives here.** `Belägg: portal.html:renderDetail` today holds a boolean-gated name:
`brandRp` feeds the per-SKU `EU RP` column cells and one *EU Responsible Person on file: `<name>`* line.
**It must grow to carry one row per permitted regime, each with state and date, and zero rows where the
ruling says the brand-level row may not exist.**

- **The per-SKU cells keep their fallback** until this shipment lands; after it, the fallback comes from
  the new entries, not from `onFile`.
- **Removing a false entry must not create a false absence.** Where the ruling permits no brand-level
  row, the per-SKU cells carry it — **not a blank, not a placeholder, not "coming soon".**
- **STOP** if the column layout cannot carry a date without a design change — report the constraint.
  *That is Design's, not an edit.*

**After M1c, and not before, the no-sharing rule below lifts.**

**Smoke:** entry point `localhost:8000` → portal → a submission detail view; **writer of the asserted
string: `portal.html:renderDetail`.** Expect the `expired` form verbatim for a brand whose record is
past its renewal date. Report as text.

# M1d · CONTRACT — `onFile` disappears

Remove `onFile` from `Belägg: index.html:buildPortalBrandPack` and the passthrough in
`Belägg: netlify/functions/supabase-proxy.js`. **Only now does the concept cease to exist.**

- **Precondition, checkable:** no reader of `onFile` remains in any of the eleven surfaces. **Report the
  pattern searched** — a zero result is a claim about the pattern, never about the tree.
- **STOP** if any reader remains. *Contracting with a live reader is the failure M1c exists to prevent.*
- `verified: bp.verified === true` in the proxy is **out of scope** — it is false today for the same
  reason the gold badge never renders, and it belongs to the `verifiedTier` gap Strategy ruled is the
  protection.

---

## STANDING, UNTIL M1c HAS SHIPPED

> **NO BRAND PACK IS SHARED.** *The generator still writes `onFile` from a name; the one published pack
> is withdrawn; the next publication carries the same lie until M1c.* **No flag is built — Charlotte is
> the only user and the rule lives in the register. A flag would be a shipment; the rule is free.**

## WHAT NONE OF THE THREE TOUCH

The preview path (`renderBrandPack` → `_operatorRow` → `_operatorValueFor`) — **M1a**. The nine other
name-only sites. The readiness parking. `#252`, `#251`, the stash. `verificationTier` / `verifiedTier`.

## REPORT BACK, PER SHIPMENT

The diff · **your** digest as your own computation, never pasted into `verify.expected.txt` ·
`./verify.sh` at 57 gates GREEN, **1 of 11 modified** · `Belägg: <file>:<function name>`, a name and
never a line number · `OLÄST` for anything not looked at.
