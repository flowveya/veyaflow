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
| 24 Sep 2026 | **Part 0** — spine mapping, all three tiers | CC's Part 0 report: 18 rows tabulated, band tally, binding declined with reason |
| 24 Sep 2026 | **Part 0, second question** — which shipping surfaces are absent from the page | — |

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN.
**Confirm all eleven before starting. `index.html` must read the value the predecessor spec's
report named.**

---

## THE AXIS — RULED, NOT PROPOSED

**The market page's own structure is the axis:**

> ### Know what applies → Meet your duties → Get on the shelf

### CORRECTED 25 SEP — THE AXIS HAD THREE POSITIONS AND THE PRODUCT HAS FOUR

**`retail-performance` mapped to `NEITHER` in Part 0. The reason is not taxonomy — IT IS CHURN.**

> **A SPINE THAT ENDS AT THE SHELF DESCRIBES A PRODUCT YOU CANCEL AFTER A SUCCESSFUL LISTING.**
> *"Get on the shelf" is a ONE-TIME OUTCOME. Once the customer reaches it she has no reason to keep
> paying.*
>
> **THE ONLY OUTCOME THAT JUSTIFIES A SUBSCRIPTION IS STAYING THERE** — and that is exactly what
> sell-through data is for: **a retailer delists what does not move.**

**So `retail-performance` is not outside what we sell. IT IS WHAT MAKES WHAT WE SELL RECURRING.** Its
absence was **a hole in the business model, not in the taxonomy** — and we were about to key the
pricing page onto an axis whose endpoint is a reason to leave.

**AND THE AXIS WE TOOK WAS ALREADY AN ABBREVIATION.** *The spine the log carries has FOUR parts. The
market page's three steps truncated our own model, and this spec imported the truncation without
noticing it.* **Fourth position in:**

> ### Know what applies → Meet your duties → Get on the shelf → **Stay on the shelf**

**NAMED BY STRATEGY, 25 SEP.** *Parallel with the other three, and it carries the churn property in
its own wording:* **it is CONTINUOUS, not TERMINAL.** **Its content is measured: sell-through after
listing.** `Belägg: index.html:renderRetailPerformance`, `index.html:loadRetailPerformance`.

*Considered and rejected:* **`Prove it moves`** — closer to what we actually hold, but **narrower
than the position**: it covers sell-through and not the shared record. **`Grow the listing`** —
naming a position out of an ambition, from a surface.

### THE CONDITION ON THE WHOLE AXIS — IT DECIDES WHETHER ANY OF THE FOUR IS HONEST

> **THE AXIS DESCRIBES THE CUSTOMER'S GOAL, NOT OUR COMMITMENT.**
>
> ***This is what you are trying to do; this is what helps.***

**`Get on the shelf` IS ALREADY AN OUTCOME WE DO NOT CONTROL — a retailer decides.** *The three
steps are only true read as **the brand's journey**, never as **our deliverables**.*

**Under that reading `Stay on the shelf` is exactly right. Under the other, ALL FOUR BECOME
OVERSTATEMENTS — not just the fourth.**

**SO: if the axis is ever rendered as a list of what WE do, all four fall at once.** *That is a
rendering constraint on every surface the spine appears on, not a note about this one.*

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

## ~~PART 0'S OUTCOME IS BOUND IN ADVANCE~~ — THE BINDING IS WITHDRAWN, 24 SEP

**The binding read: all three bands live ⇒ three tiers · one band hollow ⇒ two tiers · most rows
unmappable ⇒ one price. CC declined to fire it and gave a measured reason. It was right to.**

> **THE BINDING HAD THE RIGHT FORM AND THE WRONG INPUT. It bound an outcome ABOUT THE PRODUCT to a
> measurement OF THE PAGE.**
>
> **A band's thinness on the pricing page says nothing about the capability behind it** — that is
> the rule from 17 Sep: *a capability's state cannot be inferred from its output.* **THE PAGE IS THE
> OUTPUT.**

**DUTIES came back with one row, which would have fired "two tiers". Measured: SEVEN DUTIES-BAND
CAPABILITIES SHIP AND APPEAR ON NO TIER AT ALL** — `dpp` · `csrd` · `brandpack` ·
`retail-checklist` · `buyer-docs` · `retail-tracker` · `rp-marketplace`. **None parked, all with
live `renderPage` branches.** `Belägg: index.html:renderPage`, `index.html:NAV`.

**Firing it would have collapsed a tier because the page forgot to mention the seven things that
would fill it — encoding an omission as a decision.**

**A THIN BAND STILL LOSES ITS TIER, and a capability still does not move to fill one.** *That part
stands. What does not stand is deciding thinness from this table.*

---

## THE REAL RESULT, AND THE NEW QUESTION — 18 ROWS OVER 27 SURFACES

**Two documents went into removing claims the page made that the product could not carry. THE LARGER
ERROR RUNS THE OTHER WAY: the page describes a substantially smaller product than the one that
exists** — on the surface where someone decides what to pay.

> **NEW PART 0 QUESTION: not *which rows survive* but WHICH SHIPPING SURFACES ARE ABSENT FROM THE
> PAGE.**

**For every live nav surface not named on any tier: its id, its spine position, and — the only
third column that is measurable — WHETHER A RECORD OF A DECISION EXISTS.** `Belägg:` per surface,
or `OLÄST`.

> **DO NOT ASK WHETHER AN ABSENCE IS A DECISION OR AN OVERSIGHT. THAT IS A QUESTION ABOUT INTENT,
> AND INTENT IS NOT MEASURABLE FROM CODE.** *Nobody wrote down why `dpp` is missing from the pricing
> page, so the answer would be INFERRED — and inferred intent presented as measurement is the exact
> error that cost us a day on #243's severity.*
>
> **`OLÄST` WILL BE THE ANSWER FOR NEARLY ALL OF THEM, AND THAT IS THE HONEST ANSWER, NOT A
> FAILURE.** **Absence of a record means UNEXPLAINED. It does not mean overlooked.**

**AND NO BINDING ON THE COUNT THIS TIME.** *If nine surfaces come back with no record, nothing
follows automatically. Three readings stay open — the page should grow · they are internal and not
sellable · some of each, which is almost certainly the answer.*

> **SO THE OUTPUT IS NOT A NUMBER. IT IS A TABLE WITH A DETERMINATION PER ROW, and Strategy rules
> the ones that are not obvious.**

### AND THE RESULT'S CONSEQUENCE, RULED 25 SEP — THE OUTPUT IS NOT "ADD TEN ROWS"

**Every record cell came back `OLÄST`. Nothing was decided about the ten and left unwritten —
NOTHING WAS DECIDED AT ALL.**

> **WHICH MEANS THE EIGHTEEN ARE ALSO UNDECIDED.** *Two specs went into correcting a list nobody
> chose.* **The corrections stand — the claims were false however the rows got there. But the remedy
> is not more correction.**

**THE OUTPUT OF THIS PART 0 IS THAT THE PAGE GETS, FOR THE FIRST TIME, A WRITTEN DISPOSITION PER
SURFACE.** *One-time cost, and it closes the whole class:* **the next time someone asks why `dpp`
is not on the page, there is an answer in a file instead of an inference.**

*Every live nav surface gets a line. Sold · not sold, with the reason · launch block, with its spec.
A surface with no line is the finding, and it is checkable rather than rememberable.*
>
> **Binding an outcome to an aggregate is deciding the answer before knowing what the number is made
> of** — the same lesson that withdrew the binding above, applied immediately rather than in three
> days.

---

## CORRECTION — A PREMISE OF THIS SPEC WAS REFUTED BY CC'S PART 0

**This document states: *"the four unsourced claims and TEN failing feature rows are already out."***

**FIVE ARE OUT.** All five from `full_platform`. **The other five are still in the tree today** —
the market-entry report, the retailer pitch generator, the verified directory listing, the contract
analyser inside parked `cfo`, and the unenforced "up to 15 retailers".

> **WRITTEN FROM MEMORY OF A REPORT INSTEAD OF FROM THE REPORT — and the coding lane had itself
> reported those five as LEFT STANDING DELIBERATELY, then saved this spec asserting the opposite
> without catching it.**
>
> **FIFTH TIME THIS WEEK SOMEONE REPORTED FROM MEMORY WHILE THE RECORD HELD THE ANSWER.** *Corrected
> in place, as a block, the way the marker row and #243's severity claim were — **never as a silent
> edit**.*

**AND ONE SCOPING ERROR PRODUCED THREE FINDINGS, NOT ONE:** ten rows instead of five · this premise
error · **`(daily)` surviving while `(weekly)` was removed, refuted by the same function
(`shouldRunWeeklyCheck`, whose only gate is ≥7 days), on the MORE EXPENSIVE tier.**

> **A SCOPING ERROR DOES NOT YIELD A DEFECT. IT YIELDS ONE DEFECT PER THING OUTSIDE THE SCOPE.**

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

### A FOURTH STATE — SERVICE COMMITMENTS, WHICH THE SPINE HAS NO POSITION FOR

**Three Expansion rows are not capabilities: `Dedicated onboarding session` · `Slack access to
VeyaFlow team` · `Quarterly market intelligence briefing`.** *No producer in the tree, and there
never will be — they are not software.*

> **THE SPINE DESCRIBES WHAT THE SOFTWARE DOES. THESE DESCRIBE WHAT WE DO.** *Mapping them to `KNOW`
> or `SHELF` would be forcing a category onto something that is not in it.*

**AND THEY HAVE A DIFFERENT TRUTH TEST.** *A capability ships or it does not. **A service commitment
is true if someone is BOUND to deliver it — and that someone is a person.***

**THEIR `Belägg:` IS CAPACITY, NOT A SPEC. And every such row carries a number:**

> **AT HOW MANY CUSTOMERS DOES THIS BREAK?**
>
> *A quarterly briefing for every Expansion customer is an entry in Charlotte's calendar that scales
> linearly.* **That kind of commitment sinks small companies quietly, and the only protection is
> that the number is written down BEFORE the row is sold.**

**A service row without its number does not go on the page.**

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
