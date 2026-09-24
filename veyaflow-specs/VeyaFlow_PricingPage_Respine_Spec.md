# VeyaFlow — re-key the pricing page onto the spine

**24 September 2026 · Strategy → coding lane → CC · RE-KEY, NOT A SUBTRACTION**

**Predecessor:** `VeyaFlow_PricingPage_FourClaims_Spec.md` — the four unsourced claims and ten
failing feature rows are already out. **This spec does not remove anything. It decides what the
page is organised around, and what may stand on it.**

> **THE TIERS ARE KEYED ON NUMBER OF MARKETS. That is the expansion framework, and it makes the
> customer we want the cheapest one we have** — a brand selling into six Swedish pharmacy chains is
> in ONE market.

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN.
**Confirm all eleven before starting. `index.html` must read the value the predecessor spec's
report named.**

---

## THE AXIS — RULED, NOT PROPOSED

**The market page's own structure is the axis:**

> ### Know what applies → Meet your duties → Get on the shelf

**Each tier boundary then becomes A CAPABILITY WE EITHER HAVE OR DO NOT HAVE** — measurable against
Part 0 instead of chosen. *That is the whole point of re-keying: the boundary stops being a number
someone picked and becomes a claim with a record behind it.*

**IN SCOPE:** tier names, tier taglines, feature-row placement, the headline, the block that
replaced the cost-of-inaction banner.
**OUT OF SCOPE:** the three prices and their SEK/year figures. **Prices are Charlotte's.**
*Re-keying decides what each tier IS, not what it costs — but the taglines under the prices ARE in
scope, because "for brands expanding across 5+ markets" is market-count framing and it dies with
the axis.*

---

## PART 0 · MAP EVERY SURVIVING ROW TO A SPINE POSITION — ACROSS ALL THREE TIERS

**The predecessor measured which rows ship. This one asks a different question of the survivors:
WHERE ON THE SPINE DOES EACH SIT?**

> **STRATEGY SCOPED THE PREDECESSOR'S PART 0 TO ELEVEN ROWS BECAUSE THAT IS WHAT ONE SCREENSHOT
> SHOWED.** Ten failed across three tiers, not five across one. **A screenshot is a viewport, not a
> page.** This Part 0 is scoped from the DOM, not from an image: **every feature row on every tier.**

**Produce one table. For each surviving row:**

| row | tier today | spine position | `Belägg:` |
|---|---|---|---|

**Spine position is one of:** `KNOW` · `DUTIES` · `SHELF` · `SPANS` (genuinely serves more than one)
· `NEITHER` (serves none — report it, it is a finding).

**Rules for the mapping, so it is not a judgement call:**

- **`KNOW`** — tells the brand what applies to its products. Mapping, monitoring, applicability.
- **`DUTIES`** — helps the brand DISCHARGE an obligation it has. Documentation, gap-checking, files.
- **`SHELF`** — produces or prepares something a retailer receives.
- A row that only *displays* is `KNOW`. A row that *produces an artefact the brand acts on* is
  `DUTIES` or `SHELF` depending on who receives the artefact.

**`Everything in Market Access` is NOT a row.** *It is the statement that the spine is cumulative.
Report it separately; it survives as tier structure, not as a feature.*

**STOP AFTER PART 0 AND REPORT.** *The tier boundaries are DERIVED from this table. Drawing them
first would be choosing the answer.*

---

## PART 0'S OUTCOME IS BOUND IN ADVANCE — SO IT CANNOT BE READ CHARITABLY AFTERWARDS

**All three bands carry surviving capabilities** ⇒ **three tiers**, boundaries follow the table.
**One band is hollow** ⇒ **TWO TIERS, and the page says so.**
**Most rows fail to map** ⇒ **one product, one price, no tiers.**

> **A THIN BAND LOSES ITS TIER. THE CAPABILITY DOES NOT MOVE TO FILL ONE.**
>
> *A tier's contents are decided by spine position, not by the need to have three boxes. Moving a
> row to fill a gap is the layout form of softening a claim.*

---

## PART 1 · THE THREE STATES — THIS IS WHAT THE PAGE WAS MISSING

**Between *claim it* and *remove it* there is a third state, and its absence is why the page had to
be stripped rather than corrected.**

| state | where it goes |
|---|---|
| **Ships today** | listed as an included feature |
| **Committed for launch, with a named condition** | **a separate, visibly distinct block** — the condition written out |
| **Neither** | off the page |

**THE ENTRY REQUIREMENT FOR THE LAUNCH BLOCK, AND IT IS THE WHOLE GUARD:**

> **A row in the launch block MUST HAVE A SPECCED SHIPMENT BEHIND IT. Not an intention — a spec,
> named.** `Belägg: veyaflow-specs/<file>`.
>
> **Without it, the block is "coming soon" with better typography** — which is softening in a new
> costume, and Strategy ruled "coming soon" out for exactly that reason. *A future claim is honest
> when it names what would make it true and who is committed to it. "Coming soon" names neither.*

**AND A SECOND GUARD, MEASURABLE:**

> **THE LAUNCH BLOCK MUST NOT BE LONGER THAN THE INCLUDED LIST.** *If what is coming outweighs what
> ships, the page is selling a roadmap. Report both counts.*

**The launch block is NOT inside the tier cards.** *A row inside a tier card reads as included —
that is what a tier card is for. The block sits below, on its own, headed so that nobody can read a
launch row as a purchased one.*

---

## PART 2 · THE HEADLINE AND THE REPLACED BAND

**`Invest in your expansion.` contradicts the axis this spec installs.** *It is the expansion
framework in four words, at the top of a page being re-keyed away from it.*

**The market page's headline IS the spine and is ruled usable verbatim:**

> ### Compliant first. Then on the shelf.

**AND THE STRUCTURAL GAP WHERE THE COST-OF-INACTION BAND WAS:** the predecessor reported it rather
than filling it. **What goes there is the honest inverse of what came out** — a limit, not a
promise:

> `Coverage varies by product type and market — verify against your own SKU set.`

*Ruled usable verbatim. Same position, opposite function: the band that made an unsourced promise
about the customer's revenue is replaced by the sentence that states our own limit before anyone
pays.*

---

## THE COPY RULE — UNCHANGED FROM THE PREDECESSOR

**USABLE VERBATIM:** `Coverage varies by product type and market — verify against your own SKU set`
· `Flagged — Estimated, don't send as fact yet` · `Compliant first. Then on the shelf.` · the joint
sentence about brands living in the seam between compliance and retail readiness.

**MUST NOT BE USED, EACH FOR A MEASURED REASON:**

- **`Verified — Sourced and checked by VeyaFlow`** — the claim removed FROM THE PRODUCT this week.
  **No verification mechanism exists.** *Note: `VeyaFlow Verified directory listing` failed the
  predecessor's Part 0 on TWO rulings — this one, and **#218: no commercial consideration may affect
  ordering.** A paid directory listing is paying for position.*
- **`never lets an unsourced number pass as fact`** — right positioning, **false of the product
  today.**
- **`a submission never stalls`** — ***never* falls on the measurement.** Article Templates renders
  a subset of a mixed retailer template.

**NO REGULATION NUMBERS AND NO STATUS BADGES.** *Standing rule: legal references stay off public
surfaces until the RP has confirmed them.*

---

## THE GATE OVER THE WHOLE SHIPMENT

> **NO ROW MAY CLAIM A CAPABILITY WITHOUT A RECORD BEHIND IT — a shipped one for the included list,
> a specced one for the launch block.**
>
> **A row that fails is REMOVED OR MOVED TO THE LAUNCH BLOCK. IT IS NOT REWRITTEN MORE SOFTLY.**
> *Softening changes a claim's STRENGTH and leaves its EXISTENCE untouched — and existence without a
> record is the defect. That is how `Preferred` survived data saying neither, and how `vetted`
> survived having no vetting behind it.*

---

## REPORT BACK

1. All eleven digests before and after.
2. **Part 0's table in full**, every tier, `Belägg:` per row.
3. **Which of the three bound outcomes fired**, and the tier count that follows.
4. **Both counts** — included rows and launch rows — and confirmation the second is not larger.
5. **Every launch row with its spec filename.** A row without one must not be in the block.
6. Anything noticed and not fixed.

---

## SMOKE

**Step 1 · the step that can fail.** `openPricingModal()` — **the headline reads `Compliant first.
Then on the shelf.`, the tier taglines carry no market counts, and no feature row appears in a tier
whose spine position the Part 0 table does not give it.**
**Entry point:** `index.html:openPricingModal`.

**Step 2 · the launch block.** It renders **below the tier cards, not inside them**, and every row
in it is absent from every tier's included list. **A row in both places is the defect this block
exists to prevent.**
**Entry point:** `index.html:renderPricingModal`.

**Step 3 · the control.** The three prices and their SEK/year figures are **byte-identical**.
*A re-key that moves a price is not a re-key.* **Measure it; do not eyeball it.**

---

*Every smoke step above names its entry point. Six steps this fortnight tested surfaces that could
not be reached — the format now carries the slot rather than the discipline.*
