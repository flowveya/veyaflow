# VeyaFlow — #199: every surface that asserts an obligation must first test whether it applies

**16 September 2026 · coding lane → CC · ruled by Strategy**

**#199 started as a CSRD fix, grew into an applicability rule, then SHRANK — and the shrinking is
the point.**

> **The applicability primitive EXISTS, built correctly, one nav item from the surface that lacks
> it. #199 is applying an existing function where it is missing. It is not building applicability.**

**Written from five surface readings rather than from the two instances that raised it** — *scope by
the rule, not by the instance.* **The complete list is below; nothing here is extrapolated.**

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`49cefac83a271e11c4dfce6d59fe92391cc342389739d592150b6994d0e92d6c`, branch `f2b-async` at
`3e75f63`. **Confirm all eleven. Only `index.html` moves.**

**`verify.expected.txt` is dirty and named** — the lane's #183 note, twice corrected on 16 Sep.

---

## THE REFERENCE IMPLEMENTATION — READ IT BEFORE WRITING ANYTHING

`regDeadlinesForBrand()` / `regMarketApplies()` at **1950–1971**. Category gate by display-name
match; market gate resolving `EU`/`EU/EEA` against an EU/EEA list, else code-or-name membership,
including ambition markets. **Single-sourced so the banner and the calendar cannot disagree about
which rows apply.**

**This is the shape. Do not invent a second one.** *Where a surface needs the same test, it calls
this or a sibling of it — it does not grow its own.*

---

## THE AXES — AND THE FINDING IS THAT THERE ARE THREE, NOT ONE

An obligation applies along **three** axes. **Coverage today, measured:**

| axis | tested where | absent where |
|---|---|---|
| **category** | `regDeadlinesForBrand` · `renderComplianceRadar` (7961) | Regulatory Monitor — the returned `category` is stored unvalidated |
| **market** | same two | Regulatory Monitor — same |
| **size / threshold** | **nowhere systematically.** Two rows do it by hand: Citeo (7864) and Norwegian VAT (7918), by ASKING the brand to confirm | **CSRD** (7941) — `categories:['all']`, `markets:['all_eu','United Kingdom']`, no size gate. CSRD applies to large undertakings; her customer has 0–4 employees |

**The brand model has NO employee-count and NO turnover field.** So the size axis cannot be a filter
over data we hold. **The Citeo pattern is the only implementable form: ask once, store the answer.**

---

## THE FOUR SITES, WITH WHAT EACH NEEDS

**1 · Compliance Radar — the CSRD row (7941).** The row is category- and market-filtered already;
**the missing axis is size.** Strategy's ruling stands: **the row's own existence is the question,
not its action** *(the action was removed by #197)*. **Report what the row renders once a size gate
exists and the brand has not answered — that state must be designed, not defaulted.**

**2 · Regulatory Monitor (33209–33214).** `market` and `category` come back from a model and are
stored unvalidated. **This is #204's rule, not only #199's:**

> **Validation never lives in a prompt. The condition is tested AFTER the return, never requested
> before it.**

**Test the returned market and category against the brand's** — using the reference implementation's
market logic, not a new comparison. **An alert that fails the test is not stored.** *Report what
happens to alerts already stored that would fail it.*

**3 · The dedupe, same file.** `title.toLowerCase().slice(0,40)` dedupes **per phrasing, not per
event** — two sources wording one change differently both land. **Design has been reporting four
alerts that are two events since 13 Sep.** *Report a shape for event identity; do not implement one
yet.*

**4 · The `severity` default (#203) is NOT in this shipment.** Named so it is not swept in.

---

## OUT OF SCOPE — AND EACH FOR A STATED REASON

- **#211 · `runClaimLocalizer` picks its claims regime by BRAND CATEGORY.** This is applicability of
  a RULESET, not of an obligation — **a different axis with a different fix (#139's family).**
- **#212 · `bdRunClaimsScan` scans typed SKUs against no ruleset.** Same family.
- **#202 / #204's date fabrication** — `date: parsed.date || new Date()`. **Adjacent in the same
  function and deliberately separate:** it is an INVENTION defect, not an applicability one.
- **#208 / #209** — the calendar's window and its dropped `confidence`. Same file, different rule.
- **#214 / #215** — currency. **Highest severity on the board and specced separately.**
- **#205, #206, #210, #217, #218, #219.**

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **Every call site of `regDeadlinesForBrand` / `regMarketApplies`** before editing, and **any
   surface that filters by market or category WITHOUT calling them** — *the duplicate-behaviour
   question, asked because #201 was four independent implementations of one computation.*
3. **The size axis: every row in `COMPLIANCE_RADAR_ITEMS` whose obligation is threshold-bound.**
   Citeo and Norwegian VAT are two. **Is CSRD the third, or are there more?** *The count is the
   finding.*
4. What the CSRD row renders with a size gate and no answer from the brand.
5. Regulatory Monitor: the validation, and **the fate of already-stored alerts that fail it.**
6. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1. Ten other surfaces unchanged.

---

## SMOKE — ORIGIN NAMED IN EVERY STEP

**Run on `http://localhost:8000/index.html`, seeded NORDLYS.** *Adopted 15 Sep after a smoke run
against the deployed site proved nothing: a green production page cannot test an uncommitted change.*

**Step 1.** Compliance Radar with no size answer recorded. **The CSRD row renders whatever step 4 of
the report specifies — and it is the same on screen as in the report.** *Failure: it renders amber
as today, i.e. asserting an obligation whose applicability is untested.*

**Step 2.** A brand with `targetMarkets` not including the United Kingdom. **Force a stored alert
with `market: 'United Kingdom'` and reload. It does not render.** *Failure: it renders — the test is
after the store but not before the read, or not at all.*

**Step 3.** An alert whose market IS in her markets. **Renders unchanged from today.** *The gate must
not be a filter that removes everything.*
