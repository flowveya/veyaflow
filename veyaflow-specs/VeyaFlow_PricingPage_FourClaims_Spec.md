# VeyaFlow — the pricing page makes four claims we cannot source

**24 September 2026 · coding lane → CC · ruled by Strategy**

**The shipment has one purpose:**

> **STOP THE SURFACE WHERE SOMEONE PAYS FROM CLAIMING WHAT WE CANNOT SOURCE.**

### SCOPE, CORRECTED — THIS DOCUMENT CONTRADICTED ITSELF, AND THE HEADING IS WHAT TRAVELS

**It read `SUBTRACTION ONLY` and `NO NEW COPY IS WRITTEN` at the top, and then Part 2 re-keyed the
tier axis — which cannot be done without writing tier names and descriptions.**

> **SUMMARY AGAINST DETAIL, THIRD TIME THIS WEEK, NOW IN OUR OWN SPEC.** *After CC's "Required"
> summary line and the "Unaffected (9)" header over a seven-row table.* **The heading is the part
> that gets quoted onward, which is why being wrong there is worse than being wrong in the body.**

- **PART 1 IS SUBTRACTION. No new copy, by CC or by this lane.** *Where removal leaves a structural
  gap, the gap is **reported, not filled**.*
- **PART 2 WRITES COPY, AND THAT IS ITS ENTIRE NATURE. It is blocked and out of this shipment** —
  not because copy is forbidden, but because **the tier boundaries cannot be drawn until Part 1
  shows which capabilities remain.** *The exception is written here rather than left implicit.*

### AND THERE ARE THREE STATES, NOT TWO — RULED 24 SEP

**"Remove, don't soften" answers what the page CLAIMS IS TRUE NOW. It does not answer what the page
is ORGANISED AROUND — that is Part 2. Between asserting and removing there is a third state the spec
was missing: NAMED AS COMING, WITH WHAT MAKES THAT TRUE.**

| state | treatment |
|---|---|
| **ships today** | listed as included |
| **promised for launch, with a named condition** | **its own block, visibly separate, the condition written out** |
| **neither** | **off the page** |

> **`CFO View` in a bullet list headed `INCLUDED FEATURES` asserts that it IS INCLUDED. That is not
> the same claim as that it is COMING.**

**THE GATE THAT STOPS THE MIDDLE BLOCK BECOMING A DUMP:**

> **A ROW IN THE LAUNCH BLOCK MUST HAVE A SPECCED SHIPMENT BEHIND IT. NOT AN INTENTION — A SPEC.**
>
> *That is the row's `Belägg:`, except the evidence is a commitment rather than a line of code.*
> **Without it, it is "coming soon" with better typography — the softening in a new costume, and
> "coming soon" was ruled out for precisely that reason.**

**The difference from the parked case: a future claim is honest when it names WHAT MAKES IT TRUE and
WHO IS BOUND. "Coming soon" names neither. "Included from launch, spec written" names both.**

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|
| 24 Sep 2026 | **Part 0** — the eleven rows plus the two extras, measured | CC's Part 0 report: 11 rows tabulated, 6 doubts answered, `Belägg:` per row |

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN.
**Confirm all eleven before starting.**

---

## PART 0 · ONE MECHANICAL CHECK FIRST, BECAUSE IT DECIDES HOW MANY LINES ARE IN SCOPE

**Eleven rows are listed as `FULL PLATFORM — INCLUDED FEATURES`. For each one, three questions:**

1. **Does it ship?**
2. **Is it parked?** `Belägg: index.html:getVisibleNav` — `PARKED_IDS` = report · compare · bizcase ·
   cfo · find · sourcing · circular · suppliers · pitch.
3. **Does it exist IN THE CADENCE THE ROW CLAIMS?** *A row that promises a rhythm is claiming
   something a row promising a screen is not.*

**`Belägg: <name>` per row, or `OLÄST`.**

**SIX ARE ALREADY IN DOUBT FROM THE LOG AND MUST BE ANSWERED EXPLICITLY:**

| row | the doubt, and its record |
|---|---|
| `CFO View — margin stress test + contract analyser` | **`cfo` is in `PARKED_IDS`.** Sold on the pricing page, parked in the product |
| `Unlimited Market Entry Reports` | **`report` is parked** — and **#105's generator truncated on `max_tokens`** |
| `Mirror Test + Pitch Scorer` | **`pitch` is parked, and removed-beats-parked** |
| `Seasonal Intelligence **alerts**` | ***alerts* claims dispatch. #241 established NO MAIL HAS EVER BEEN SENT FROM THIS PROJECT** |
| `Regulatory Monitor **(weekly)**` | ***weekly* is a cadence claim, and #198 found cadence confirmation UNRENDERABLE** |
| `CPNP Notification Package` | **We do not file.** We organise the work, and the standing rule keeps the dossier's source of truth OUTSIDE VeyaFlow |

**AND ONE THAT IS NOT A FEATURE ROW AT ALL: `Continue with trial →`.** *Is there a trial?*
`renderPricingModal` reads `getTrialState()` and `getTrialDaysLeft()`, so the machinery exists —
**report whether it gates anything, or whether the link offers a state the product does not enforce.**
`Belägg: index.html:getTrialState`.

> **A PRICE LIST SELLING A PARKED FEATURE IS THE DEMO-DATA CLASS ON THE SURFACE WHERE IT COSTS MONEY
> RATHER THAN CREDIBILITY.** *The whole argument for the parked marker was that an unshipped thing
> must not render as shipped. This is that, with a price beside it.*

**STOP AFTER PART 0 AND REPORT.** *How many rows come out is a measurement, not an estimate — and it
decides the tier boundaries in Part 2.*

---

## PART 1 · THE FOUR, REMOVED

### 1 · `Most popular`

**Belägg:** `index.html:renderPricingModal`, the tier card badge.

> **WE HAVE NO CUSTOMERS.** *It is `✓ Verified` and `vetted` again — **social proof with no record
> behind it**, on the surface where someone pays. Strategy: the worst thing on the page.*

**The badge comes out. The tier stays, unmarked.**

### 2 · THE COST-OF-INACTION BLOCK — REMOVED, NOT FILLED

**Belägg:** `index.html:renderPricingModal`, the `<!-- Cost-of-inaction -->` block, **and**
`index.html:renderTrialExpiredScreen`, the `<!-- Cost-of-inaction block -->` / *Cost of waiting*
block, **which carries the identical claim on a second surface.**

> *"Every month not in ⬚ = estimated ⬚ in missed revenue."*
>
> **DO NOT FILL THE SLOTS. What would go there is a REVENUE FORECAST ABOUT THE CUSTOMER'S BUSINESS,
> and we have no basis for that number.** *It is the readiness score in its purest commercial form:
> a composite about the customer's outcome built from unsourced inputs.* **THE FILLED VERSION IS
> WORSE THAN THE BROKEN ONE.**

**Both blocks come out in full**, including the trial screen's `ROI` line, which is the same claim
expressed as a multiple.

*Separately and for the record, the slots are not empty because interpolation failed:* **`--gold` is
aliased to `--accent` (`Belägg: index.html:55`), and both blocks are `background:var(--accent)` with
`color:var(--gold)` — teal on teal.** *The values render correctly and are invisible. That is its own
finding and it does not change this removal.*

### 3 · THE TWO LISTING-VALUE CLAIMS

**Belägg:** `index.html:renderPricingModal` — the headline *"Invest in your expansion. Recover it
with one listing."* and the line *"VeyaFlow pays for itself when your first listing is confirmed."*
**The second also appears in `renderTrialExpiredScreen`.**

> **BOTH ASSERT THAT ONE LISTING IS WORTH ≥60 000 SEK TO THE BRAND.** *We do not know what a listing
> is worth. Same class as the four above it.*

**The headline's second sentence comes out. Every instance of the pays-for-itself line comes out, on
both surfaces.**

**"Invest in your expansion" STAYS IN PART 1 — it carries no claim — AND IT IS FLAGGED FOR PART 2,
NOT LEFT SILENTLY.** *Part 2 re-keys AWAY from the expansion framework, so that sentence contradicts
the axis the same document introduces. **Keeping it without saying so would be the summary-against-
detail error one more time**, in the sentence a reader meets first.*

### 4 · THE FEATURE ROWS THAT FAILED PART 0 — FIVE, NOT ONE

**Part 0 measured it. These come out, and NONE is rewritten more softly:**

| row | why it fails | `Belägg:` |
|---|---|---|
| `Unlimited Market Entry Reports` | **`report` is parked** | `index.html:renderReport` |
| `CFO View — margin stress test + contract analyser` | **`cfo` is parked** — and the Expansion tier's `Contract Terms Analyser` is the same function | `index.html:renderCFO` |
| `Mirror Test + Pitch Scorer` | **`pitch` is parked, and removed-beats-parked** | `index.html:renderPitch` |
| `CPNP Notification Package` | **NOTHING PRODUCES ONE.** No function, tab, modal or export. Every CPNP string in the tree is requirement data or a check that the brand typed a reference | **no producer in the tree** |
| `Retailer ESG Data Pack` | **THERE IS NO PACK.** The modal's footer carries one button, `Close` — no export, no download, no copy | `index.html:renderESGModal` |

**AND THE CADENCE AND LIMIT CLAIMS ON ROWS THAT DO SHIP:**

- **`Seasonal Intelligence alerts` → the word `alerts` comes out.** *The screens ship and render
  in-app; **no send path exists anywhere** — no mail API, no `sendEmail`; the only outbound construct
  is `mailto:`, which opens the user's own client.* **Consistent with #241.**
- **`Regulatory Monitor (weekly)` → `(weekly)` comes out.** *`shouldRunWeeklyCheck` is **a throttle,
  not a schedule**: it returns true when ≥7 days have passed, and fires two seconds after app load or
  from a manual button. **No cron, no `setInterval` — if nobody opens the app, nothing is checked.***
  And `weeklyCheck: true` is **written and never read**. *The same claim lives on a second surface —
  a label map reading `reg_monitor: 'Weekly regulatory updates'` — which is out of scope here and
  must not be left behind.*
- **Both `(unlimited)` claims come out.** *`Belägg:` — **no cap exists anywhere and no code reads a
  plan**. An unenforced limit claim is a promise about a mechanism that does not exist.*

### 5 · `Continue with trial →`

**The link offers a state the product does not enforce.** *`initTrialIfNeeded()` is **commented out
at its only call site** ("trial system dormant pre-Beta"), so `ns_trial` is never written,
`getTrialState()` always returns null, the `Free trial: N days remaining` banner **never renders**,
and **`renderTrialExpiredScreen` has no caller anywhere**. The link's `onclick` closes the modal and
does nothing else.* **Belägg:** `index.html:initTrialIfNeeded`, `index.html:getTrialState`.

**It comes out. The dormant machinery stays** — it is not this shipment's business, and removing code
that a later decision may want is the subtraction error in the other direction.

> **AND NOTE WHAT THIS MEANS FOR THE SMOKE: the trial-expired screen CANNOT BE REACHED.** *The lane's
> original Step 2 tested a surface with no caller — sixth unrunnable step, caught by CC. Its removals
> are made blind and verified by absence in the source, not on a page.*

---

## PART 2 · RE-KEY THE AXIS ONTO THE SPINE — AFTER PART 0, NEVER BEFORE

**The tiers are keyed on NUMBER OF MARKETS. That is the expansion framework, and it makes the
customer we want the cheapest one we have.** *A brand selling into six Swedish pharmacy chains is in
ONE market — on this page it is the entry tier, and it is exactly the wedge.*

**THE MARKET PAGE'S OWN STRUCTURE IS THE AXIS:**

> **Know what applies → Meet your duties → Get on the shelf**

**Each tier boundary then becomes A CAPABILITY WE EITHER HAVE OR DO NOT HAVE — measurable against
Part 0 instead of arbitrary.** *That is the point of re-keying: the boundary stops being a number
someone chose and becomes a claim with a record behind it.*

**PRICES ARE CHARLOTTE'S AND SIT OUTSIDE THIS SHIPMENT.** *Re-keying decides what each tier IS, not
what it costs.*

---

## THE COPY RULE — TAKE IT FROM THE MARKET PAGE, DO NOT TRANSCRIBE IT

**USABLE VERBATIM:**

- `Coverage varies by product type and market — verify against your own SKU set`
- `Flagged — Estimated, don't send as fact yet`
- `Compliant first. Then on the shelf.`
- the joint sentence about brands living in the seam

**MUST NOT BE USED, AND EACH FOR A MEASURED REASON:**

- **`Verified — Sourced and checked by VeyaFlow`** — *that is the claim we removed FROM THE PRODUCT
  this week.* **No verification mechanism exists.**
- **`never lets an unsourced number pass as fact`** — *right positioning,* **false of the product
  today**, and this spec exists because of it.
- **`a submission never stalls`** — ***never* falls on the measurement.**

**NO REGULATION NUMBERS AND NO STATUS BADGES ON THE PRICING PAGE.** *Standing rule: legal references
stay off public surfaces until the RP has confirmed them.*

---

## THE GATE OVER THE WHOLE SHIPMENT

> **NO ROW MAY CLAIM A CAPABILITY WITHOUT A RECORD BEHIND IT.**
>
> **A tier row that fails Part 0 IS REMOVED. IT IS NOT REWRITTEN MORE SOFTLY.** *Softening is how a
> claim survives its own refutation — and "Preferred" over data that says neither is exactly what we
> spent yesterday removing.*

---

## REPORT BACK

1. All eleven digests before and after.
2. **Part 0's table in full**, with `Belägg:` per line.
3. **Every site removed**, cited by name — and confirmation that the pays-for-itself line is gone
   from **both** surfaces, not just the modal.
4. **Whether removing the cost-of-inaction block leaves a structural gap** — an empty container, a
   broken grid, a heading with nothing under it. **Report it; do not fill it.**
5. Anything noticed and not fixed.

---

## SMOKE — AND EVERY STEP NAMES ITS ENTRY POINT

> **RULED 24 SEP, AFTER THE SIXTH UNRUNNABLE STEP: EVERY SMOKE STEP NAMES THE FUNCTION OR URL THAT
> REACHES ITS SURFACE.** *Six times a step has tested a surface that could not be reached. That is
> no longer an accident.* **A step whose entry point cannot be named is unrunnable — and now that
> shows WHEN IT IS WRITTEN rather than when it is run.**

**Step 1 · the step that can fail. ENTRY: `openPricingModal()` in the console.** — **no `Most
popular` badge on any tier, no cost-of-inaction banner, and the headline's second sentence gone.**

**Step 2 · REMOVED — THE SURFACE CANNOT BE REACHED.** *It asked for the trial-expired screen.*
**`renderTrialExpiredScreen` has no caller anywhere and `initTrialIfNeeded()` is commented out**, so
that screen never renders. **Its removals are verified by absence in the source, in the report, not
on a page** — and the report must state that explicitly rather than let silence imply a page check.

**Step 3 · the control.** The three tier prices, their SEK/year figures and their descriptions are
**unchanged**. *A subtraction that moves a price is not a subtraction.*
