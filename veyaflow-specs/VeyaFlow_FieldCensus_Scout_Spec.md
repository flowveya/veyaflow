# VeyaFlow — THE FIELD CENSUS. A domain-free sweep, and its completion criterion is set FIRST

**15 September 2026 · coding lane → CC · READ ONLY. NO EDITS.**

**The question, and it is a question of FORM, not of meaning:**

> **For every array of like objects: which fields do MOST members carry that SOME lack — and which
> fields does exactly ONE member carry?**

**It requires no understanding of what any field does.** It would have found #199 without anyone
knowing what CSRD is.

---

## THE COMPLETION CRITERION — READ THIS BEFORE RUNNING ANYTHING

> **A census is not finished when it has RUN. It is finished when every candidate has a VERDICT.**

**Forty candidates without triage is worse than no census**: it manufactures the appearance of
coverage, **which is the exact class this lane has removed eleven times.** Same form as *"Part 1 is
not done when the code ships, it is done when the cache stops serving"* and as #148's back-fill.

**The criterion is set before the run, not after, so it cannot be relaxed to match the output.**

**Every candidate carries exactly one of three verdicts, and the vocabulary is fixed:**

| verdict | means | required with it |
|---|---|---|
| **LAWFUL** | the field is optional by design | one clause saying why — *"`badge` marks new features"* |
| **DEFECT** | this member should carry it and does not | the consequence, in one sentence |
| **UNDECIDED** | needs a domain ruling | **the question, phrased so a non-coder can answer it** |

**UNDECIDED is legitimate and must not be avoided by guessing.** But **if UNDECIDED exceeds a
third of candidates, the census has been scoped too wide — stop and report that instead.**

**AND IF THE CANDIDATE COUNT IS TOO LARGE TO TRIAGE IN THIS SHIPMENT: report the count and the
array inventory, and STOP.** A half-triaged census is the failure this section exists to prevent.
**Re-scoping is a correct outcome. Delivering forty untriaged rows is not.**

---

## NAMED BASELINES — UNCHANGED AT BOTH ENDS

Eleven surfaces; `index.html` at
`74f88657245ed4efb79153913bc47658b3acebfdace79e19f0d07b6e63a3ba9c`, branch `f2b-async` at
`2011765`. **This is a scout: `./verify.sh` GREEN, `0 of the 11 tracked surfaces modified`, exit 0,
at the end. Any digest movement is a failure of the shipment.**

---

## BOTH TAILS, AND EACH HAS ALREADY PAID

**This sweep has two ends and the lane found one instance at each within a day:**

| tail | shape | instance |
|---|---|---|
| **majority gap** | most members carry it, some do not | **#199** — `COMPLIANCE_REQS`: Citeo and Norwegian VAT are threshold-gated and ask the brand to confirm; CSRD has no equivalent |
| **singleton** | exactly ONE member carries it | **#197** — `atm-admin` alone declares `parked: true`, and no gate reads the property |

**The singleton tail is the more interesting of the two**: a lone declaration is usually **a rule
someone stated on the object and no mechanism consults.** Report singletons even when they look
harmless, and **say for each whether anything in the code READS the field.** A declared field that
nothing reads is the #197 shape exactly.

---

## SCOPE

**In:** `index.html` and **all seven** `netlify/functions/*.js`. Every array literal of **four or
more object members sharing at least three keys.**

**BASELINE: the committed #197 tree, not `74f88657`.** This spec originally named the pre-#197 tree
and required GREEN with 0 modified — **an end condition that could not be met while #197 sat
uncommitted, and a census that would have described a NAV array about to change.** Run after the
commit; request the named digest from the lane.

**Report the array inventory FIRST** — name, line, member count — before any candidate analysis, so
the size of the job is visible before it is done.

**Out:** arrays of primitives · objects keyed by id (maps, not arrays) unless their values are
plainly like-shaped records · anything in `dpp/`, `brand/`, `portal/` · **any edit.**

---

## BLIND SPOT ONE — RUNTIME-CONSTRUCTED MEMBERS. DECLARE IT, THEN GO AND LOOK

**The census compares siblings inside an array LITERAL. An object built at runtime sits in no
literal and has no siblings to be compared against.**

**This is a property of the METHOD, not of the tree.** `atm-admin` — the singleton that motivated
this sweep — **was invisible to it until #197 landed**, because `getVisibleNav` pushed the object at
runtime instead of declaring it.

**Third time the same blindness has cost us:** the AST sweep missed generated HTML strings · the
`saveSkus` count missed three call sites in its own channel · now this. **A static method is blind
to dynamic construction, every time.**

> **A census that does not say so lets "the census is clean" stand as a clean bill of health over a
> surface it never looked at.** Same class as #160's legend.

**So the blind spot gets DECLARED and then CLOSED, because it has a formal complement:**

**1. State it in the result, in the census's own words.** Not a footnote — the sentence that
qualifies every LAWFUL verdict it issues.

**2. Then run the complementary query, which is as domain-free as the census itself:** for each
censused array, **find every site that pushes, splices, assigns or concats an object into it.** A
literal-shaped grep (`.push({`, `.push(Object.assign`, `= [...`) reaches most of them.

**3. Report each runtime-constructed member as a census row of its own**, compared against the
array's literal members. **A member built at runtime that lacks a field its siblings carry is the
same finding — it just was not visible from the literal.**

**If a site's shape defeats the query, say which and why.** An unclosable gap that is named is a
finding; an unclosable gap that is silent is #160.

---

## BLIND SPOT TWO — WHAT THIS SWEEP CANNOT DO AT ALL. STATE IT IN THE REPORT

> **It finds STRUCTURAL ABSENCE. It cannot find a claim that is FALSE.**

**#190's invented column sets would have passed this census and the comment-signature sweep both:
the data is well-formed and the comments are consistent.** What caught #190 was knowing that
retailers do not publish their requirements — **domain knowledge, not form.**

**Say this in the report's first paragraph.** Otherwise *"we have two sweeps"* becomes a reason to
believe the truth check is needed less. **They do not overlap: cheap and broad against expensive
and narrow.**

---

## REPORT BACK

1. All eleven digests before and after — unchanged, `0 of the 11 tracked surfaces modified`.
2. **The array inventory**, before the analysis.
3. **The candidate count**, both tails separately — before the verdicts.
4. **Every candidate with a verdict** from the fixed vocabulary, or the stop-and-report above.
5. **For every singleton: does anything READ the field?**
6. **The runtime-construction pass:** the sites found, the members they build, each compared against
   its array's literal members — **and the blind-spot sentence that qualifies every LAWFUL verdict.**
   Name any site whose shape defeated the query.
7. The sweep's stated limit, in your own words, in the first paragraph.
7. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

**GREEN, `0 of the 11 tracked surfaces modified`, 0 not found, exit 0.** A scout that moves a digest
has stopped being a scout.

---

## NO SMOKE

Nothing ships. **The verdict column is the evidence**, and the report is judged on whether every
candidate carries one.
