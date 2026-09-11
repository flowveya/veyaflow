# VeyaFlow — #160: the platform cannot say a deadline has passed

**10 September 2026 · coding lane → CC**

**Found by the front-door run, on the banner, while doing something else.**

A compliance platform's most important single sentence is *"you are late."* VeyaFlow cannot
produce it. Not "renders it badly" — **cannot produce it**: the value is clamped before any
renderer sees it, and the one branch that would have said so is unreachable code with a legend
entry vouching for a state that never occurs.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           da3aefd5c7c2144c7c53a7746950a036503a891194fe836ea2bafbefff28c8ac
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

**Confirm all six before editing. Only `index.html` moves.**

---

## THE MECHANISM

`index.html:4879–4887`:

```js
function daysUntil(d){
  if(d === null || d === undefined || d === '') return null;
  var n = Math.round((new Date(d)-new Date())/(1000*60*60*24));
  return Number.isFinite(n) ? Math.max(0,n) : null;
}
```

`Math.max(0, -41)` is `0`. **The clamp is the whole defect.**

### Measured today (2026-09-10) against `REG_DEADLINES` (1218–1234)

**8 of 14 rows are in the past** and every one of them reports `0`:

| id | deadline | actual | reported |
|---|---|---|---|
| `epr_dk` | 2025-10-01 | −344 | `0d` |
| `cmr_omnibus_viii` | 2026-05-01 | −132 | `0d` |
| `uk_cmr_si_2026_23_labelling` | 2026-07-15 | −57 | `0d` |
| `textile_ban` | 2026-07-19 | −53 | `0d` |
| `inci_glossary` | 2026-07-30 | −42 | `0d` |
| `fragrance_allergen` | 2026-07-31 | −41 | `0d` |
| `ppwr` | 2026-08-12 | −29 | `0d` |
| `uk_cmr_si_2026_23_cmrban` | 2026-08-15 | −26 | `0d` |

**Confirm these counts from the bytes with the system clock. If today's date makes the count
different, the count is the finding, not the table.**

### Three consequences, and the second is the severe one

**1. The banner understates.** `renderRegStrip` (4891) renders `fmtNum(d,'d')` under the
heading **"Upcoming deadlines"**. A row 41 days past reads `0d` and is called *upcoming*.

**2. `Overdue` IS UNREACHABLE CODE.** `renderComplianceCalendarPage`'s `urg()` at 33661:

```js
if(days < 0)   return {k:'r', label:'Overdue',    …};
if(days <= 90) return {k:'a', label:'Approaching', …};
```

`daysUntil` cannot return a negative, so **branch 1 is dead** and every overdue row renders
amber **"Approaching"**. The legend at 33674 lists *"Overdue / blocked"* — the app advertises a
state it is structurally incapable of entering. **A check that cannot fail, with a legend
vouching for it.**

**3. The ordering collapses.** Both sorts (4899, 33653) order by `days`. Eight rows spanning
344 days of lateness all compare equal at `0`, so *the most overdue item cannot reach the top of
the list.*

---

## THE PEDIGREE — RECORD IT, IT IS THE TRANSFERABLE PART

`#118`'s own comment sits four lines above the surviving clamp (4875):

> *was `Math.max(0, Math.round(...))`, which reads as a floor-at-zero guard and guards nothing*

**#118 removed the line's NaN role and left its clamping role untouched.** The comment now
stands over a line still doing the thing it warns about, and its accuracy is what made the line
look audited.

**STANDING RULE, adopted by Strategy 10 Sep:** *fixing the defect a line is named for is not
the same as auditing what else that line does.* **When a line changes — count its behaviours,
not its bugs.** A line with a comment explaining it is not thereby verified; the comment is a
claim about **one** of its behaviours.

**AND THE FORM THE TWO HALVES SHARE, which is why this finding is filed with two artefacts
named rather than one defect:**

> **An artefact that certifies a check which never happened is worse than no artefact at all.**

The legend entry and the `#118` comment are the same failure in different media. The legend
tells a user that *Overdue* is a state this app reports, so a user who looks for it and does not
find it concludes **nothing is late**. The comment tells a reader that this line was examined,
so a reader who sees it moves on. **Both are more harmful than their own absence**, because
absence prompts a check and a false assurance forecloses one.

Same family as *verify the parts, assert the join*, one level in: **the part was verified and
the rest of the same expression was inherited.**

---

## IMPLEMENT — ONE LINE, PLUS WHAT A NEGATIVE NOW NEEDS

### Part A — remove the clamp

```js
return Number.isFinite(n) ? n : null;
```

`null` still means *no deadline recorded* (#118/#120's distinction, unchanged and load-bearing:
**absence is not lateness**). A negative now means *this date has passed*.

### Part B — the three consumers, each checked, none assumed

`daysUntil` has **exactly three call sites** — 4899, 4909, 33651. **Confirm that count
independently and report it**; if there is a fourth, it is the finding.

- **4899 / 33653 (sorts)** — negatives sort first. **Most overdue first is correct.** Verify
  no change is needed rather than assuming it.
- **33651 → `urg()`** — the dead branch becomes live. **No edit; report the before/after label
  for each of the 8 rows above as evidence.**
- **4909 → `fmtNum(d,'d')`** — **this one needs work.** It will render `-41d`. A minus sign is
  not how a person reads lateness, and the strip is headed *"Upcoming deadlines"*.

**Part B's copy is DESIGN's to finalise.** Propose wording using vocabulary already in the
file — `urg()` already owns the word **Overdue** and the legend already says *"Overdue /
blocked"*, so the register exists and must not be reinvented. **The heading must also stop
calling a passed deadline upcoming.**

**THE CRITERION IS NOT LEGIBILITY, IT IS INVERSION — Strategy, 10 Sep.** *Approaching* means
you have time; *Overdue* means you are already in breach. **The string must not be readable as
reassurance by someone who is late.**

That disqualifies more than it looks:
- **`0d`** — today's behaviour, and the defect.
- **`-41d`** — a minus sign in a mono font is a formatting artefact to most readers, not a
  reversal. It survives a glance as "about zero".
- **`41d`** in the same visual treatment as a future deadline — the number is right and the
  meaning is inverted.

**A passed deadline must differ from a future one in WORD, not only in sign or colour**, because
the sign is small and the colour is unavailable to a portion of readers. Propose accordingly.
**This is the one string in the product that must not be survivable by a hurried reader.**

**`fmtNum`'s contract does not change.** It renders a finite number or an em dash; it does not
learn about sign. Whatever distinguishes overdue belongs at the call site, not inside the
shared formatter — the formatter is shared with #118's other consumers and this is not their
concern.

---

## THE SIBLING SITE — REPORT, DO NOT SCOPE IN

`index.html:4650` carries the identical clamp on the **trial badge**:

```js
return Number.isFinite(days) ? Math.max(0, days) : null;
```

**An expired trial reports `0` days remaining rather than being expired.** Same shape, different
domain, and a floor may or may not be right there — a trial that ended has arguably *zero*
remaining, which is a real quantity, unlike a deadline that has *passed*.

**Report what reads it and what the badge shows on an expired trial. Do not change it.** This
is a ruling to request, not a line to fix while nearby.

**Also report** the other four `Math.max(0, …)` sites (15471, 32389, 32397, 36223) — one line
each on whether the floor is a real quantity or a hidden negative. **The count is the finding.**

---

## #161 RAISED, AND IT IS LARGER THAN THIS FIX — FOR STRATEGY

`regDeadlinesForBrand` (1960) filters by **category and market only**. There is **no per-brand
completion, dismissal, or acknowledgement state anywhere on `REG_DEADLINES`.**

So once #160 ships, the app tells Cloud & Glow they are **344 days late on Danish EPR
registration, permanently**, with no way to record that they did it. Today that is invisible
because everything reads `0d`; **this fix is what makes it visible.**

**That is not a reason to withhold the fix** — the current state is a falsehood and the next
state is a true statement with no resolution path. But it means **#160 ships knowing it creates
a dead end**, and the dead end should be specced rather than discovered.

**The hard part is not the checkbox.** A brand marking a regulatory obligation "done" is the
platform recording a compliance claim it cannot verify — which is `verifiedBy` territory and
the same distinction #135 just built. **Do not design it here.** Report the shape; Strategy
rules.

---

## OUT OF SCOPE

- **#161** — completion state. Reported only.
- **The trial badge (4650)** and the four other `Math.max(0, …)` sites. Reported only.
- **#141** — the `⚠` in `renderRegStrip`'s heading at 4907 is an emoji and belongs to the
  sweep, **not to this shipment**, even though this shipment edits that heading's neighbours.
  **If the copy change lands on the same line, say so and stop for a ruling** rather than
  removing it in passing.
- **Whether `REG_DEADLINES`' dates are correct.** This shipment is about arithmetic on the
  dates, not the dates themselves.
- #156, #157, #158, #159, #147, #143, #150's guard.

---

## STOP. NO COMMIT.

One line, one copy proposal, four reports.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. Before/after for 4886.
3. **The `daysUntil` call-site count, independently established.**
4. **The 8 overdue rows, before and after, showing the reported number AND the `urg()` label
   for each** — that table is the evidence, and the label flip from `Approaching` to `Overdue`
   is what proves the dead branch is live.
5. **Evidence a FUTURE deadline is byte-identical in behaviour** — `green_claims` (2026-09-27)
   and the 2027 rows must be untouched. The majority case must not move.
6. **Evidence an UNDATED row still returns `null` and still sorts last** — #118 and #120 must
   both survive this. State how you constructed an undated row, since `REG_DEADLINES` has none.
7. The copy proposal for 4909 and the strip heading, with the vocabulary it came from.
8. The sibling-site reports and the `Math.max(0, …)` census.
9. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `da3aefd5`; five others UNCHANGED; `1 of 6 modified`.

---

## SMOKE

**Step 1.** Load the app as a Skincare & Beauty EU brand. **The deadline strip names an overdue
obligation and says so** — not `0d`, not "upcoming".
*Failure: `0d` on a date in the past. That is the defect, and it is what the app does today.*

**Step 2.** Open the Compliance Calendar. **Overdue rows carry the red Overdue marker.**
*Failure: an overdue row rendering amber "Approaching" — the dead branch, still dead.*

**Step 3.** The most overdue item sorts above the less overdue one.
*Failure: two overdue rows in arbitrary order — the clamp still collapsing them.*

**Step 4 — the step that proves nothing else moved.** A future deadline still shows its day
count exactly as before, and the strip still hides entirely for a brand with no applicable
rows.
