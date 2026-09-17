# VeyaFlow — THE ID-LIST SWEEP (UNDEMONSTRATED). And it arrives with its demonstration set.

**16 September 2026 · coding lane → CC · READ ONLY. NO EDITS.**

**The question, and it is a question of FORM:**

> **For every array literal of page ids, field names, market names or any other identifier: IS
> THERE A CANONICAL SOURCE IT SHOULD BE DERIVED FROM, AND DOES IT AGREE WITH IT?**

**The ruling it enforces has existed verbatim since #197, and nobody has applied it forward:**

> **The declaration on the object is the rule. Every gate reads the declaration. No gate carries its
> own list of ids.**

---

## REWRITTEN 16 SEP — PART 0 WAS CIRCULAR, AND CC SAID SO

**CC's own caveat, which found a loophole in the rule this spec was built on:**

> *"I wrote the criteria knowing all three cases, so this shows the criteria CAN express them. It
> doesn't show they'd have found them cold."*

**That is overfitting, and it makes the demonstration circular.** The rule — *an instrument is
demonstrated against a known failing case* — existed to stop adoption on plausibility. **But if the
criteria are written against the test set, the run proves EXPRESSIBILITY, not DETECTION.**

> **THE RULE'S SECOND HALF: an instrument is demonstrated when it finds cases THE AUTHOR DID NOT
> HOLD. Otherwise it is a specification of known defects, not a detector of unknown ones.**

### THEREFORE THE TEST SET IS THE 266 DIVERGENCES, NOT #197 / #226 / #220

**The stop-reason turns into the method.**

**TRIAGE A SAMPLE OF TWENTY, CHOSEN AT RANDOM. Not all 266, and not a sample you pick.**

- **Two or three real defects → the instrument works**, and the remaining 246 are a work queue.
- **Zero real defects → it is a noise generator**, and we learned that for the price of **twenty
  judgements instead of 266.**

> **Same discipline as the calibration: a SAMPLE THAT CAN FAIL, rather than a complete run that
> cannot.**

**Report the sampling method before the verdicts** — how the twenty were drawn, so the result means
something.

### FIRST, CUT THE NOISE THAT IS NOISE BY CONSTRUCTION

**CC's second blind spot — a PARTITION read as a GAP — is cheap to fix and is a SET OPERATION, not a
judgement:**

> **If the union of several lists equals the source, they are a PARTITION, not gaps.**

Each `NAV_GROUPS` group's `ids` covering less than the union of all groups is noise by construction.
**No domain knowledge required, and it removes a whole class from the 266 before anyone reads them.**
**Apply it, report how many of the 266 it removes, and draw the twenty from what remains.**

### AND THE STRUCTURAL LIMIT STANDS, UNFIXED BY ANY OF THIS

**#220's miss is not a tuning problem.** A market PICKER uses `includes` exactly as a membership TEST
does, and **the canonical source is a BEHAVIOUR — each obligation's own `market`, resolved by one
function — not a SET.**

> **The sweep can say "these disagree" and never "this side is right". Under *divergence is
> evidence*, that is the half that matters.**

**So it is the same KIND of instrument as the field census: cheap, domain-free, produces candidates,
does not judge.** The difference is the outcome — **zero of eleven against two of three — and the
two were in hand.**

---

## PART 0 (SUPERSEDED — KEPT FOR THE RECORD). THE THREE FOUNDING CASES.

**This is the first candidate instrument that arrives with known failing cases already in hand.**
Yesterday's rule — *a sweep is a check, and a check not demonstrated against the case it claims to
catch is a claim about a capability* — **applies the same day.**

**Three known cases. The sweep must find all three, unprompted, by its own criteria:**

| # | the list | its canonical source | the gap |
|---|---|---|---|
| **#197** | `PARKED_IDS` (9 ids) | the `parked` / `hidden` declaration on each NAV entry | `atm-admin` declared `parked:true` and absent from the list; 8 of 9 unreachable anyway |
| **#220** | 14 literal market lists, 4 used as EU-membership tests | each obligation's own `market` field, resolved by one function | the four disagree; the same brand gets different answers about the same law |
| **#226** | `validPages` (15 ids) in `handleDeepLink` | `NAV` / `NAV_GROUPS` (17 ids) | `rp-marketplace`, `compliance-cal`, `seasonal`, `buyer-docs` cannot be deep-linked |

**Report, before the general run:**

1. **Did your criteria find each of the three WITHOUT being told where to look?** Name each by line.
2. **For any it missed: WHY.** *That answer is worth more than the sweep, because it is the
   sweep's blind spot stated in its own terms.*
3. **Only then run the general pass.** **If it misses one of the three, say so and stop** — an
   instrument that cannot find its own founding cases does not get a general run.

---

## NAMED BASELINES — UNCHANGED AT BOTH ENDS

**UPDATED 17 SEP — two shipments have landed since the first draft.**

Eleven surfaces; `index.html` at
`108dcad4db02da32d8d53b4795e5d5e1ab042bf7f259d917f5fa33ed0635511c`, branch `f2b-async` at
`7fc6b74`, clean tree, 57 gates GREEN.

*The draft named `a2bacfe9` and the RP-trio commit. Both are now two shipments old. **Confirm the
value above against `verify.expected.txt` before starting** — a spec's named baseline goes stale the
moment anything ships, and this one has gone stale twice.*

**`./verify.sh` GREEN, `0 of the 11 tracked surfaces modified`, exit 0.** A scout that moves a digest
has stopped being a scout.

---

## SCOPE

**In:** `index.html` and the seven `netlify/functions/*.js`. **Every array literal whose members are
identifier-shaped strings** — page ids, field names, market names or codes, retailer keys, framework
names, localStorage keys.

**For each, answer three things:**

1. **Is there a canonical source** — a declaration on the objects themselves, or another structure
   that already holds the same set?
2. **Does the list AGREE with it?** Name the members present in one and absent from the other, in
   both directions.
3. **What does the divergence DO?** *A list that diverges and changes nothing is not the same
   finding as one that gates a route.*

**Out:** arrays of prose, labels or copy · CSS values · anything in `dpp/`, `brand/`, `portal/` ·
**any edit.**

---

## THE RULE THAT GOVERNS WHAT YOU DO WITH A DIVERGENCE

> **DIVERGENCE IS EVIDENCE.** *Ruled 16 Sep.*

**Do not propose unifying anything.** Nine implementations that disagree may be nine people who each
encoded a slightly different REAL requirement — **and #220 is exactly that case: EU ≠ EEA ≠ EU plus
UK, so a single shared list would have installed a FALSE LEGAL CLAIM everywhere at once.**

> **Noise is detectable. A unanimous falsehood is not.**

**So for every divergence: report it, report what it does, and — where you can tell from the tree —
report WHICH SIDE LOOKS CORRECT and on what evidence.** Where you cannot tell, say so. **Proposing a
merge is out of scope.**

---

## COMPLETION CRITERION — SET BEFORE THE RUN

**Same as the field census:** every candidate carries a verdict — **LAWFUL / DEFECT / UNDECIDED** —
**or you report the inventory and the count and STOP.** *A half-triaged sweep manufactures the
appearance of coverage, which is the class this lane has removed a dozen times.* **Re-scoping is a
correct outcome.**

---

## REPORT BACK

1. **PART 0 FIRST** — the three known cases, found or missed, and why.
2. All eleven digests before and after — unchanged.
3. The inventory: every qualifying array literal, with its canonical source or `none`.
4. Every divergence, what it does, and which side looks correct.
5. **Any list with NO canonical source** — *that is a different finding: not a gate disagreeing with
   a declaration, but a set that exists in only one place and may be the declaration itself.*
6. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

**GREEN, `0 of the 11 tracked surfaces modified`, exit 0.**

---

## NO SMOKE

Nothing ships. **Part 0 is the evidence. The general run counts only if Part 0 passes.**
