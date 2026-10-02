# VeyaFlow — M1a: the Brand Pack preview's RP row. One surface, one edit, and it goes first

**2 October 2026 · coding lane → CC · `index.html` ONLY. Unblocked — no ruling outstanding.**

**WHY THIS IS AHEAD OF THE PACK PATH:** *free text rendered as verified is a worse provenance defect
than a stale boolean, and this is ONE surface while the pack path is three.*

---

## THE RULING, VERBATIM — NOT A POINTER

**Source: `open-items.md` at commit `5d4e1ce`, sections `CODINGS ANDRA RELÄ 2 okt §2` and
`CODINGS TREDJE RELÄ 2 okt §2–§3`.** *You cannot reach that file; it is in the log repo. The standing
rule was amended on 2 Oct for exactly that reason — a spec carries the ruling's operative text, the
section name AND the hash it was taken from, because the hash is what makes staleness visible. If the
register has moved past `5d4e1ce`, this spec is a relay that may have expired: say so rather than
implementing it.*

### The three states and their strings

> The pack never asserts a regulatory STATUS we have not measured. It asserts the RECORD's state,
> with its date. Three states, three rows, one form:
> `present` → **EU Responsible Person · `<name>` · confirmed to `<renewalDate>`**
> `expired` → **EU Responsible Person · `<name>` · last confirmed `<date>` · not confirmed since**
> `absent` → **EU Responsible Person · not recorded**

*Reason, carried because it changes what counts as correct: we do not know whether the brand renewed
with its RP. We know when our record was last confirmed. The date IS the provenance.*

### The level, and it governs this spec too

> **No SKU governs. A brand-level RP row is a category error. A Responsible Person is appointed PER
> PRODUCT.** `Mätt 2 okt: Lyko's own template has one RP row per product, and C&G's submission carries
> two different RPs across five rows.` **Operator status renders at the lowest level where the values
> differ:**
> - all SKUs resolve to the same regime, operator and date → **one** row, in the regime's own words:
>   *EU Responsible Person* (cosmetic) or *EU Economic Operator* (device)
> - two regimes present → **two** rows, one per regime, never merged
> - differing operator or date within one regime → **no brand-level row for that regime; the per-SKU
>   cells carry it.** *A brand-level row is a SUMMARY and may exist only when it is true for all.*
>
> **`heroSku` has no role — a hero SKU is a marketing choice, not a regulatory key. No third argument
> is invented; it is derived from the content.**

---

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

> **Not dispatched until the row exists. Filled at the moment of sending, with the commit sha carrying the bytes sent.**

## NAMED BASELINES

**The eleven surfaces at the values `verify.expected.txt` NAMES** — the source, never a copy. Confirm
GREEN, `0 of 11 modified`, exit 0 before starting. This edit moves `index.html`; **the lane names the
new digest after two independent computations. Never paste a digest into `verify.expected.txt`.**

---

## THE DEFECT, AS MEASURED BY CC 2 OCT — NOT RE-DERIVED

`Belägg: index.html:renderBrandPack` builds the page-1 Compliance tile's RP row from
`Belägg: index.html:_operatorRow` → `Belägg: index.html:_operatorValueFor`, which for
`regime.field === 'euResponsible'` returns **`heroSku.euResponsible`** — the SKU's own free-text field.
**No date. No comparator. No `_operatorStatus` call.** Rendered as `✓ EU RP · <text>` beneath the
heading *Page 1 preview — verified data only, no AI*.

> **A tick sourced from a free-text field, under a heading that says the data is verified, is a
> capability claim with nothing behind it.** *It is the same class as `filled:true` and it is one level
> below the `onFile` defect the pack path addresses.*

## THE EDIT

**The preview's RP row renders operator status derived from the pack's SKUs, per the level ruling
above.** `_operatorStatus` is the comparator; `getOperatorRegime` resolves the regime per SKU; the row
is emitted only where the ruling says a row may exist.

**Prefer the NARROWEST site.** `_operatorValueFor` is generic over `regime.field` and other operator
rows flow through it.

> **STOP CONDITION 1 — and it is the likely one.** *If the only place to make this change is the generic
> resolver, STOP and report: which `regime.field` values flow through `_operatorValueFor`, and which
> surfaces render each.* **Changing a generic resolver for one field is a scope decision, not an edit,
> and it is not yours or mine to take silently.**

> **STOP CONDITION 2.** *If the Compliance tile's row shape cannot carry state + date — if it is a
> boolean-coloured two-cell row by construction — STOP and report the shape.* **That is a surface
> question. The ruling says what is said, not where it fits.**

**Must not survive the edit:** a `✓` or `✗` applied to the RP row · the string `Not set` as the RP
value · the row sourced from any SKU free-text field.

## WHAT THIS SPEC DOES NOT TOUCH

`buildPortalBrandPack`, `supabase-proxy.js`, `portal.html`, `onFile` in any form — **those are M1b–M1d**.
The nine other name-only sites. The readiness parking. `#252`, `#251`, the stash.

---

## STANDING, UNTIL M1c HAS SHIPPED

> **NO BRAND PACK IS SHARED.** *The generator still writes `onFile` from a name; the one published pack
> is withdrawn; the next publication carries the same lie until M1c.* **No flag is built for this —
> Charlotte is the only user and the rule lives in the register. A flag would be a shipment; the rule
> is free.**

## SMOKE — ONE STEP. ENTRY POINT **AND** WRITER.

| field | value |
|---|---|
| entry point | `localhost:8000` → Brand Pack Generator → page-1 preview, hard-reload first |
| **writer of the string asserted on** | **`index.html:renderBrandPack` → `_operatorRow`** |
| fixture | a brand whose RP record carries a past `renewalDate` |

*The second field is new: naming where you enter proves the surface is reachable; it does not prove the
named function writes the string. That gap is why the last shipment's smoke could not observe it.*

**Expect:** `EU Responsible Person · <name> · last confirmed <date> · not confirmed since`.
**Report the rendered line as text, not a screenshot.** *A screenshot is a viewport, not a page.*

## REPORT BACK

The diff · **your** digest, as your own computation · `./verify.sh` at 57 gates GREEN, **1 of 11
modified** · `Belägg: <file>:<function name>` for every function touched, never a line number · and for
anything you did not look at, `OLÄST`.
