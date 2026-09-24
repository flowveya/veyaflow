# VeyaFlow — #245: the surfaces disagree about what a market is, and a brand in Portugal cannot say so

**23 September 2026 · coding lane → CC · ruled by Strategy (form B, 22 Sep)**

**The shipment has one purpose:**

> **A MARKET IS SELECTABLE ONLY IF THE PRODUCT CAN SAY WHAT IT HOLDS FOR IT.**

**THE ORDER IS THE RULING'S SECOND HALF AND IT IS NOT NEGOTIABLE:** *the honesty machinery is built
BEFORE any market is added. You cannot add Poland until Poland can be honestly under-covered —*
**adding a market must not assert coverage we do not have.** *Same form as: removing a false blocker
must not promote to approved.* **THE MARKETS ARE THE SPEC'S LAST STEP, NOT ITS FIRST.**

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN,
`0 of the 11 tracked surfaces modified`, exit 0. **Confirm all eleven before starting.**

---

## THE FINDING, MEASURED 22 SEP

**The compliance engine reasons about 30 member states. The onboarding picker offers 18 markets, 8
of them members. RP coverage held 15. Landed cost offers 14.**

> **Italy, Spain, Portugal, Ireland and POLAND sit in the membership predicate AND in the RP list
> BUT IN NO PICKER.** *The coverage list's reach exceeded the interface's.* **A brand whose market is
> Portugal cannot say so.**

**Belägg:** `index.html:MARKETS` · `index.html:CURRENT_MARKETS` · `index.html:isEuEeaMarket` (the
closure's `MEMBERS`) · `index.html:RADAR_MARKETS` · `index.html:RP_DATA_MARKETS` ·
`index.html:DUTY_RATES` · `index.html:FREIGHT_EST`.

**AND THE SEVERITY ORDER INVERTS AGAINST #243.** *#243 was a wrong answer nobody could trigger.*
**#245 is a missing answer every brand in those markets hits immediately — a capability the customer
lacks, not a reasoning error. Poland, Spain and Italy are not edge cases.**

---

## THE RULING THIS IMPLEMENTS — FORM B, AND WHY A AND C WERE REFUSED

**A — offer only what we cover — FAILS ON THE MEASUREMENT, NOT ON TASTE.** *It presumes coverage is
a fact. It is not:* **RP partners 0, radar 11, duty rates 11, freight 14.** *Under A no market is
selectable at all unless someone arbitrarily appoints one surface's coverage as the gate —* **and
collapsing several different questions into one is the error we have removed four times.**

**C — offer all 30 silently — IS TODAY'S STATE AND IT IS #134's CLASS.** *A landed cost computed
from a silent 50 SEK default is a manufactured number.*

> **B: COVERAGE IS PER SURFACE, THEREFORE THE HONESTY MUST BE PER SURFACE.**

**AND IT IS PLACED WHERE THE DECISION IS MADE, NOT WHERE THE GAP IS DISCOVERED.** *Pick Poland, then
meet three empty surfaces one screen at a time, and we have spent the user's attention discovering
our own gaps.* **The coverage statement belongs to the MOMENT OF CHOICE:**

> *Poland — we hold regulatory watch. We do not hold retailer data, duty rates or an RP partner.*

**One sentence, one place, front-loaded rather than dripped.** *Per-surface empty states are still
needed as a backstop — someone can arrive at the radar directly — but they are NOT the main
countermeasure.*

**THE ABSENCE IS OURS, NOT THE MARKET'S.** *Named as ours, without apology and without promise — the
same four walls as the Czechia copy:*

1. **The obligation stands at full strength, unhedged.**
2. **The gap is named as OURS, in one clause.**
3. **The next step only as far as it is sourced** — the ROLE, never an article, never a named company.
4. **NO "coming soon."**

---

## PART 0 · THE COVERAGE MATRIX — MECHANICALLY PRODUCED, AND STOP AFTER IT

**Do not hand-list the coverage sources. Produce them from the code.**

> **AN ENUMERATION IS A LOWER BOUND UNTIL SOMETHING MECHANICAL PRODUCES IT** — and a ceiling needs
> TWO conditions, not one: mechanically produced **and** dynamic access excluded. *The lane found
> `badge` by accident while measuring `flag`; the item-level ESG tag was `OLÄST` for a day because
> nobody read the render site.*

**Report, with `Belägg: <file:name>` on every line or `OLÄST`:**

1. **Every market list in `index.html`** — name, entry count, and the question each one answers.
   *The lane counted fourteen on 22 Sep. Treat that as a floor and say whether it is a ceiling.*
2. **For each list: is it a COVERAGE list (what we hold) or a MEMBERSHIP list (what is true)?**
   *This is the distinction that produced #220 and #243 — `EU_RP_MARKETS` was a coverage list wearing
   a membership name.*
3. **Which lists are READ BY A SURFACE, and which surface.** *A list with no reader is a different
   problem from a list with a reader.*
4. **The matrix itself:** for each of the 30 member states, which coverage lists contain it.
5. **Whether any list is built dynamically** — `push`, `concat`, spread, a key built from a string —
   which no static read enumerates.

**STOP AFTER PART 0 AND REPORT.** *The mechanism in Part 1 is shaped by what the matrix looks like,
and this lane has now had TWO spec premises refuted by its own Part 0.*

---

## PART 1 · THE MACHINERY — AFTER PART 0, AND BEFORE ANY MARKET IS ADDED

**One function answers one question: `coverageFor(market)` → what we hold, per surface.**

- **Derived from the coverage lists, never a second list of its own.** *A hand-maintained coverage
  table would be a fifteenth market list and the exact defect this item is about.*
- **Its output is a STATE, not a sentence.** *Copy is Design's; the mechanism supplies the facts.*
- **It must be able to say NOTHING IS HELD** — the honestly-empty case is the common one, not the
  exception. **`RP_PARTNERS` is empty for every market including the ones we "cover".**

### THE TRANSLATION MAP — RULED IN, AND THE SPEC'S OWN CONSTRAINT DOES NOT APPLY TO IT

**Part 0 measured the obstacle: three lists key by ISO-2, the rest by display name, and the tree's
four partial name→code maps cover TWELVE of thirty members.**

> **THE "NEVER A NEW LIST" CONSTRAINT EXISTS BECAUSE COVERAGE LISTS DRIFT. A NAME→CODE MAP IS NOT A
> COVERAGE LIST.** *It asserts an IDENTITY — that `Sweden` and `SE` are the same market — and it
> cannot drift, because **ISO 3166 is external, stable and authoritative.***
>
> **AND IT IS A REDUCTION, NOT AN ADDITION. One complete map REPLACES FOUR PARTIAL ONES** doing the
> same job incompletely. *Write none and we keep four; write one without removing them and we have
> five.*

**TWO CONDITIONS, AND THEY ARE WHAT STOP THE MAP BECOMING THE THING IT REPLACES:**

1. **IDENTITY ONLY — code ↔ display name, nothing else.** *The moment it carries coverage, flags,
   ordering or any second fact, it IS a coverage list and the constraint bites.*
2. **THE SOURCE IS EXTERNAL: ISO 3166, NOT MEMORY.** *CC supplied twenty codes itself in Part 0 and
   flagged them —* **that is `NY`, not measured.** **Build the join key out of a lane's construction
   and we have done precisely what the constraint forbids.**

**The four existing partial maps are removed in the same edit.** *Otherwise the count goes up.*

### `coverageFor` READS `RP_DATA_MARKETS` — AND THAT WAS DECIDED ON 21 SEP

**`Belägg: verify.expected.txt`, the 21 Sep entry:** *"DO NOT DELETE IT: it is exactly the list that
answers 'do we hold RP partners for this market?', which is the input the honestly-empty state needs.
The repoint made it dead and **the build item revives it**."*

**THIS SPEC IS THAT BUILD ITEM.** *So the "declared and never read" finding from Part 0 is not
`isEU`'s case:* **`isEU` was dead because nothing SHOULD read it. This holds coverage information
something SHOULD read, and giving it a reader is the fix rather than a question.**

### THE RADAR'S COVERAGE COMES FROM THE ITEMS, NOT FROM THE FILTER

**`RADAR_MARKETS` is a FILTER list.** What the radar can actually show is each item's own `markets`
in `COMPLIANCE_RADAR_ITEMS`. **Belägg:** `index.html:renderComplianceRadar`,
`index.html:COMPLIANCE_RADAR_ITEMS`.

> **DERIVING RADAR COVERAGE FROM THE FILTER WOULD REPEAT #220 EXACTLY** — a picker read as a
> membership test. **Third time coverage-against-membership has bitten in this same area.**

### THE FIVE FUNCTION-LOCAL LISTS

`RADAR_MARKETS`, `vatRates`, `PKG_MARKETS`, `INCI_MARKETS`, `PACK_MARKETS` are not visible to a
top-level `coverageFor`. **A hoist is an edit to the surface that owns each one** — report which are
needed and why before hoisting anything, and hoist to a closure predicate rather than a public
constant where the list answers a question (`isEuEeaMarket`'s shape, and **a public list is a public
predicate with its reasoning removed**).

**AND THE DISCLOSURE RENDERS AT THE POINT OF SELECTION**, reading `coverageFor`. Per-surface empty
states read the same function, so **one source answers both** — otherwise the disclosure and the
empty state are two expressions of one fact with nothing checking they agree.

---

## PART 2 · THE MARKETS — LAST, AND ONLY AFTER PART 1 IS ON SCREEN

**Adding markets is mechanical. It is last because it is the step that ARMS things.**

> **CANON: A CAPABILITY GAP CAN BE WHAT KEEPS A DEFECT LATENT — CLOSING THE GAP ARMS THE DEFECT.**

**Named consequences, each of which must be handled BEFORE its market becomes selectable:**

- **#246 — SHARPER THAN THIS SPEC FIRST STATED, AND INVERTED ON ONE HALF.** *Part 0 measured it:*
  `getDutyRate` **does** return `'Rate unknown — verify with customs broker'`, and
  `updateLandedResult` renders it — **and the same screen's table row reads `0 SEK — EU/FTA`**,
  because the row branches on `dutyRate>0` alone. **A disclosure and a positive claim contradicting
  each other in one view, about one market.** *A silent default is one wrong thing; this is two, one
  of them right, and the reader cannot tell which.* **And three of the four callers —
  `calcSupplierLanded`, `renderCompareQuotesTab`, the TCO line — destructure `rate` and DROP THE
  NOTE.** `getFreightCost`'s fallback still carries no note at all. **Belägg:**
  `index.html:getDutyRate`, `index.html:updateLandedResult`, `index.html:getFreightCost`.
  > **CANON: A CAVEAT THAT CAN BE DESTRUCTURED AWAY IS NOT A CAVEAT.** *The rate and its note must
  > be ONE value, not two, so that whoever drops the note drops the rate.* **#214's rule one level
  > up: money without its currency is not a number → A VALUE WITHOUT ITS PROVENANCE IS NOT A VALUE.**

- **SWEDEN GOES FIRST AMONG THE MARKETS, AND IT IS NOT A DEFECT — IT IS THE WEDGE.** *Part 0
  measured the home market as the worst-covered in the product:* **16 of 22 against Denmark's 21,
  in no `MARKETS` picker, no duty rate, no freight, no VAT.** **The wedge is Nordic brands and the
  home market is Sweden. The first real customer conversation hits it immediately** — and it
  explains why testing has run on Danish data, which we had taken for an arbitrary choice.
- **The radar's 11-market coverage.** *#244 already exists: a Czechia brand sees the Brand Pack
  assert an RP is required while the Radar renders zero rows. Adding markets multiplies that.*
- **The RP marketplace's GLOBAL empty state.** *"No RP partners listed" is honest for every market
  while `RP_PARTNERS` is empty. The per-market state becomes necessary when we hold partners for
  SOME markets — trigger, not a date.*

---

## OUT OF SCOPE

- **Renaming any market list.** *A rename is an assertion about purpose; #220 established it is
  Strategy's, and three of these lists already carry names that make claims.*
- **#242's market ranking**, which has no basis once readiness is a report.
- **Fixing #246.** *It is NAMED here as a gate on Part 2, not fixed here — a judgement dropped into
  a mechanical batch makes the batch only as well verified as the judgement.*

---

## REPORT BACK

1. All eleven digests before and after.
2. **Part 0's matrix in full**, with `Belägg:` per line.
3. **Whether `coverageFor` could be derived from the existing lists**, or whether any surface's
   coverage is not expressible from them.
4. Anything noticed and not fixed.

**A citation is a NAME that survives an insertion, not a line number.** *Line numbers moved 46 in one
shipment today.*

---

## SMOKE — NOT WRITTEN YET, AND THAT IS DELIBERATE

**The steps depend on Part 0's matrix and on what Part 1 renders.** *Writing them now would produce
another control against a case that may not exist — the lane has written FIVE unrunnable smoke steps,
the most recent one this morning, and the pattern is stable: controls written without checking the
control case exists.*

**The one step already known to be required:** a market we hold NOTHING for, and a market we hold
SOMETHING for, read side by side. **The control must fail in the opposite direction** — a disclosure
that appears on every market is as useless as one that appears on none.
