# VeyaFlow — THE FIELD CENSUS. A domain-free sweep, and its completion criterion is set FIRST

**15 September 2026 · coding lane → CC · READ ONLY. NO EDITS.**

**The question, and it is a question of FORM, not of meaning:**

> **For every array of like objects: which fields do MOST members carry that SOME lack — and which
> fields does exactly ONE member carry?**

**It requires no understanding of what any field does.**

---

## WHAT THIS SWEEP COVERS — CORRECTED 15 SEP, AFTER MEASUREMENT REFUTED THE ORIGINAL CLAIM

**This spec previously claimed the census would have found #199 without anyone knowing what CSRD
is. CC measured it. THE CLAIM WAS FALSE.**

**All 19 members of `COMPLIANCE_RADAR_ITEMS`** *(named `COMPLIANCE_REQS` in the first draft — that
array does not exist)* **carry the same seven keys.** Citeo's and Norwegian VAT's threshold
behaviour lives **inside their `check` and `actionLabel` function bodies.** CSRD's key set is
identical.

> **The missing primitive was not a missing FIELD. It was a missing BEHAVIOUR inside a field that is
> present.** No scoping choice makes that visible to a key-presence comparison.

**AND #197 IS WEAKER THAN CLAIMED TOO.** `parked` *is* read — the rail and mobile menu use it for
italic styling. **The read test as worded clears it.** The real question is **what the read
DECIDES** — styling or gating — **which is a judgement per field, not a formal property.**

**COVERAGE, TO BE STATED IN THE REPORT AND NOT LEFT TO INFERENCE:**

| the census | |
|---|---|
| **finds** | structural field absence — a field its siblings carry and this member lacks |
| **found** | #197, with the read-test caveat above |
| **does NOT find** | behavioural absence — a present field whose body lacks the behaviour |
| **does NOT find** | a claim that is FALSE (see the second limit below) |
| **cannot decide alone** | whether a read is styling or gating |

**Of the eleven instances of the primitive-applied-once pattern, this sweep plausibly reaches three
or four.** *That number is an estimate and has not been measured — the sort is lane work.*

> **"We have a sweep" must never be read as "the pattern is covered."**

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
`49cefac83a271e11c4dfce6d59fe92391cc342389739d592150b6994d0e92d6c`, branch `f2b-async` at
`3e75f63`. **This is a scout: `./verify.sh` GREEN, `0 of the 11 tracked surfaces modified`, exit 0,
at the end. Any digest movement is a failure of the shipment.**

*Corrected 15 Sep: this section named `74f88657`/`2011765` while SCOPE named the post-#197 tree —
one was edited and the other left. CC used the latter, correctly, and reported the contradiction.*

---

## BOTH TAILS, AND EACH HAS ALREADY PAID

**This sweep has two ends and the lane found one instance at each within a day:**

| tail | shape | instance |
|---|---|---|
| **majority gap** | most members carry it, some do not | *no instance yet — #199 was claimed here and does not qualify; see COVERAGE above* |
| **singleton** | exactly ONE member carries it | **#197** — `atm-admin` alone declares `parked: true`, and no GATE reads the property |

**AND THERE IS A THIRD BAND THE TWO TAILS DO NOT REPORT** — CC's finding: **32 key slots are carried
by between 2 members and half.** `flag`, `badge` and `hidden` in `NAV`; `urgency` and `fineRisk` in
the radar. **Two tails and a blind middle.** Report the band's count; **triaging it is not in this
scope.**

**The singleton tail is the more interesting of the two**: a lone declaration is usually **a rule
someone stated on the object and no mechanism consults.** Report singletons even when they look
harmless, and **say for each whether anything in the code READS the field.** A declared field that
nothing reads is the #197 shape exactly.

---

## SCOPE

**RE-SCOPED 15 SEP, OPTION 1 — after CC's inventory returned 144 candidates and stopped, correctly.**

**In: the NINE candidates in literal arrays OUTSIDE `RETAILER_REGISTRY`, with the runtime pass.**
`REG_DEADLINES` · `EXPORT_OPTIONS` · `NAV` · `NORWAY_CUSTOMS_CHECKLIST` · the two `cpnpFields[].fields`
· `RETAILER_ESG.apotek_hjartat_se.mandatoryRequirements` · `LISTING_REQUIREMENTS.matas_dk.requirements`.
**Every one carries a verdict. That is the shipment.**

**OUT, and each for a stated reason, not for convenience:**

- **`RETAILER_REGISTRY` (47 candidates)** — one 214-member dataset whose singletons are per-retailer
  FACTS. Its own shipment, if ever.
- **The maps (88)** — `CLAIMS_RULES`' 31 singletons are claim strings keyed per framework. **Data
  variation, not record-shape variation.**

> **Both would yield LAWFUL verdicts at volume, which is exactly how a sweep becomes its own
> artefact.** The completion rule applied in advance rather than discovered at the end.

*Original scope — `index.html` and all seven `netlify/functions/*.js`, every array literal of four or
more members sharing three keys — produced the inventory. **None of the seven function files holds an
array meeting the threshold**, so they are out by measurement, not by choice.*

**BASELINE — NAMED, #197 NOW COMMITTED:** `index.html` at
`49cefac83a271e11c4dfce6d59fe92391cc342389739d592150b6994d0e92d6c`, branch `f2b-async` at
`3e75f63`. The other ten surfaces at their existing baselines. **Clean tree; `./verify.sh` GREEN,
57 gates, before you start.**

*This spec originally named `74f88657` — the pre-#197 tree — and required GREEN with 0 modified
while #197 sat uncommitted: an end condition that could not be met, over a NAV array that was about
to change. Corrected 15 Sep.*

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
2. **Every one of the nine candidates with a verdict** from the fixed vocabulary. **The inventory is
   already delivered; this run is the triage.**
3. **For every singleton: what does the read DECIDE — styling or gating?** *Not "does anything read
   it": `parked` is read for italic styling and the read test cleared it.* **If you cannot tell,
   UNDECIDED is the correct verdict and the question goes to the lane.**
4. **The runtime-construction pass** over those arrays: the sites found, the members they build,
   each compared against its array's literal members — **and the blind-spot sentence that qualifies
   every LAWFUL verdict.** Name any site whose shape defeated the query.
5. **The third band's count** (keys on 2 members up to half) — count only, no triage.
6. **The coverage statement, in your own words, in the first paragraph** — what the sweep finds,
   what it cannot find, and that #199 is outside it.
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
