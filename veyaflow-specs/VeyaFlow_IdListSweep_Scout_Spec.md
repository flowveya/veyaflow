# VeyaFlow — THE ID-LIST SWEEP (UNDEMONSTRATED). And it arrives with its demonstration set.

**16 September 2026 · coding lane → CC · READ ONLY. NO EDITS.**

**The question, and it is a question of FORM:**

> **For every array literal of page ids, field names, market names or any other identifier: IS
> THERE A CANONICAL SOURCE IT SHOULD BE DERIVED FROM, AND DOES IT AGREE WITH IT?**

**The ruling it enforces has existed verbatim since #197, and nobody has applied it forward:**

> **The declaration on the object is the rule. Every gate reads the declaration. No gate carries its
> own list of ids.**

---

## PART 0 — THE DEMONSTRATION. RUN THIS FIRST AND REPORT IT BEFORE ANYTHING ELSE.

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

Eleven surfaces; `index.html` at
`a2bacfe9b4c68ccea63b9b59d363067fa517e474c8c7d97e232cf2f57eb237a8`, branch `f2b-async` at **the
RP-trio commit** — request the value from the lane if the trio has landed; if it has not,
`3e75f63` with `index.html` dirty at `a2bacfe9`.

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
