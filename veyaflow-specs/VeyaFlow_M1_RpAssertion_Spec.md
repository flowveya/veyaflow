# VeyaFlow — M1: the RP assertion. Shipment 1 of 11 sites, and only the published one

**2 October 2026 · coding lane → CC · ONE EDIT. `buildPortalBrandPack` ALONE.**

**THE RULING THIS SPEC IMPLEMENTS IS NOT RESTATED HERE BEYOND THE RENDERED STRINGS.**
`Belägg: open-items.md § CODINGS ANDRA RELÄ 2 okt, §2.` *Read it there. The register is the source; this spec names it.*

**THE MEASUREMENT IS ALREADY DONE AND IS NOT REDONE.** CC's M1 reading, 2 Oct: one correct comparator
(`index.html:_rpDateExpired`, seven call sites, correct), wrapped by `index.html:_operatorStatus`
returning `absent · expired · present`; eight sites producing a tick from the NAME alone; three more
reading the date without comparing it. **This shipment changes exactly one of the eleven.**

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

> **NOT DISPATCHED UNTIL THE ROW ABOVE EXISTS.** *Filled at the moment of sending, with the commit sha
> that carries the bytes sent — not after the reply.*

---

## NAMED BASELINES

**The eleven surfaces at the values `verify.expected.txt` NAMES.** *The source, not a copy — a copied
baseline went two shipments stale twice.* Confirm all eleven GREEN, `0 of 11 modified`, exit 0 before
starting. **`index.html` is pinned and verified both ends as of 2 Oct; this edit moves it, and the new
value is named by the lane after two independent computations, never by CC.**

---

## PART 0 · ONE MEASUREMENT, REPORT-ONLY, RUNS ALONGSIDE

**S7/K9 — call sites per meaning for `verificationTier` and `verifiedTier`.** *Strategy ruled: no
rename, no writer. The gap that keeps `★ VeyaFlow Verified` dead is the protection until "Verified"
has a disposition.* **So this is a COUNT, not a change.**

- How many call sites read `brand.verificationTier`, in which enclosing functions, and which of those
  functions are live versus parked.
- The same for `brand.verifiedTier`, including the path through `supabase-proxy.js` into `portal.html`.
- **Confirm by search that nothing WRITES either name**, and state the pattern searched — a zero result
  is a claim about the pattern, never about the tree.

**Report the numbers. Rename nothing, write nothing, and do not add a writer "while you are there."**

---

## PART 1 · THE EDIT — `buildPortalBrandPack`, AND NOTHING ELSE

### WHAT IS WRONG

`index.html:buildPortalBrandPack` sets `pack.euResponsible = { name, onFile: true }`. **`onFile` is
derived from the presence of a NAME and never from the renewal date.** That is what put
`✓ EU RP · Cosmeservice GmbH` under the heading `VERIFIED DATA ONLY, NO AI` in a published,
buyer-facing document whose brand's RP page read `EXPIRED 2025-12-31`.

**The pack published on 5 May was withdrawn 2 Oct** (`db/CHANGELOG.sql`, entry 2026-10-02). **That
removed one artefact. This removes the source.**

### WHAT IT BECOMES

**`onFile` DISAPPEARS AS A CONCEPT.** *It is not recomputed, not renamed, not set from the comparator —
the field goes.* What the pack carries is the RECORD's state and its date:

| `_operatorStatus` | the pack renders |
|---|---|
| `present` | **EU Responsible Person · `<name>` · confirmed to `<renewalDate>`** |
| `expired` | **EU Responsible Person · `<name>` · last confirmed `<renewalDate>` · not confirmed since** |
| `absent` | **EU Responsible Person · not recorded** |

**THE PACK NEVER ASSERTS A REGULATORY STATUS WE HAVE NOT MEASURED.** *We do not know whether the brand
renewed with its RP. We know when our record was last confirmed.* **The date IS the provenance, per the
scope clause of 1 Oct: every value about the product that leaves the system carries its provenance.**

**Use `_operatorStatus`, not `_rpDateExpired` directly** — the three-state wrapper is what exists and
what the other ten sites will inherit. *Do not introduce a second comparator.*

### WHAT THIS SPEC DOES NOT TOUCH

- **The other ten sites.** `retailChecklistAutoCheckValue`, the `eu_rp` radar item, the PIF checks,
  `buildSkuReadiness`, `checkComplianceGap`, `retailTemplateResolveSource`,
  `generateRpHandoffPayload`, `buildComplianceEvents`, `generateSpecSheetPDF`,
  `renderComplianceCalendar`. **They inherit the form — state plus date, never a bare tick — in their
  own shipments, with each surface's wording.** Not here.
- **The readiness parking**, which is the next shipment after this one.
- **Anything in `#252`, `#251` or the stash.**

> **ONE EDIT PER SHIPMENT, AND THIS ONE CARRIES A JUDGEMENT.** *A judgement dropped into a mechanical
> batch makes the batch only as well verified as the judgement.* **Bundling any of the other ten here
> is the thing the rule forbids.**

### STOP CONDITIONS

- **If the three strings cannot be rendered because the pack template has room for a tick and nothing
  else — STOP and report.** *That is a surface question, not an edit, and the register's ruling is
  about what is said, not about where it fits.*
- **If `_operatorStatus` is not reachable from `buildPortalBrandPack` — STOP and report the reachability,
  do not inline a copy of the comparator.** *A second comparator is the defect this shipment removes.*
- **If `renewalDate` is absent while `_operatorStatus` returns `expired` — STOP.** *That combination
  should be impossible, and if it occurs the state machine is wrong, not the renderer.*

---

## REPORT BACK

1. The diff, and **the digest CC computes** — reported as CC's own computation, never pasted into
   `verify.expected.txt`. *The lane names the value after Charlotte's `shasum` agrees.*
2. `./verify.sh` — expect **57 gates GREEN, 1 of 11 modified**.
3. `Belägg:` for every function touched — **a NAME, never a line number.**
4. Part 0's counts.

---

## SMOKE — ONE STEP, LOCAL ONLY, AND ONE HARD PROHIBITION

**At `localhost:8000`, hard-reload first.** Entry point: **Brand Pack Generator → page 1 preview**, with
a brand whose RP record carries a past `renewalDate`. *Every step names its entry point, so an
unreachable step fails at writing time rather than at running time.*

**Expect:** `EU Responsible Person · <name> · last confirmed <date> · not confirmed since`.
**Must NOT appear anywhere on that preview:** a tick, a `✓`, the word `verified` applied to the RP, or
the row missing entirely.

> **DO NOT SHARE OR PUBLISH A PACK TO TEST THIS.** *Sharing writes a `shared_brand_packs` row and puts
> real Cloud & Glow data at a public URL — which is how the artefact this shipment exists to fix came
> to be published on 5 May.* **The preview is local and is the whole smoke.**

**Report the rendered line as TEXT, not a screenshot.** *A screenshot is a viewport, not a page.*
