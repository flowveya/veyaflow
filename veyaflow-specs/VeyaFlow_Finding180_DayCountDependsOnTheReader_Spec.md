# VeyaFlow — #180: the day count depends on who is reading it, and when

**11 September 2026 · coding lane → CC · PART 1 OF 2: THE ARITHMETIC**

**This fix REMOVES a variable. It adds no branch.** The time-of-day component disappears from
`daysUntil` entirely, and all three consequences go with it. **Strategy, 11 Sep: a fix that
removes a dependency is safer at eight in the evening than one that introduces a branch.**

---

## NAMED BASELINES — ELEVEN SURFACES

```
index.html                                       be174bbf669784f188ea0230038f22f3dd983d6c882b82a04ab58c4fc712cb6c
dpp/index.html                                   e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                                      beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                                 fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js              78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js                   500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
netlify/functions/anthropic-proxy.js             7cf20b3fac29ae780403416729445ca1c5bdc65b16e11866cf0768fac273b8e5
netlify/functions/anthropic-proxy-background.js  1f6f47ab9ce46f91c7fe1fab9690272c544467f01efb30e8e330030edb96e0be
netlify/functions/get-brand-pack.js              fe285fe913766f6ac10da7e4ebd98566a8e0cdd40d35243908bba14369665382
netlify/functions/get-dpp.js                     3c050904cf530d2c2a1a9e5716b17736284d1891c2bf991ac88ef81e2b9fa395
netlify/functions/share-brand-pack.js            3791bbecc745fe5d5a31a6dd368e19d3105e272c027b6eeedbcd96f6c887cecb
```

Branch `f2b-async` at `52cccc0`. **Confirm all eleven. Only `index.html` moves.**

---

## OBSERVED, ON THE LIVE SITE, THE SAME DAY

| | 10:01 CEST | 20:16 CEST |
|---|---|---|
| Danish EPR (`2025-10-01`) | `Overdue · 345d` | **`Overdue · 346d`** |
| CMR Omnibus VIII (`2026-05-01`) | `Overdue · 133d` | **`Overdue · 134d`** |

**Neither deadline moved. Neither did the calendar date.** From 1 Oct 2025 to 11 Sep 2026 is
**345 days, all day long.**

### The mechanism — three frames in one subtraction

`daysUntil` (≈4896) computes
`Math.round((new Date(d) - new Date()) / 86400000)`.

- **`new Date("2025-10-01")` is UTC midnight.** ECMAScript parses date-**only** ISO forms as UTC.
  (Date-*time* forms without an offset parse as **local** — the same call, two behaviours.)
- **`new Date()` is an absolute instant.**
- **The reader is in CEST.**

So the subtraction straddles UTC midnight, an absolute instant, and a local reader, and
`Math.round` flips when the remainder crosses half a day — **12:00 UTC**.

**Three consequences, and the third is why Strategy ruled this ships tonight:**

1. **The count ticks mid-afternoon.** Overdue rows gain a day at 14:00 CEST; **future rows lose
   one** — Green Claims reads `16d` in the morning and `15d` in the evening.
2. **The flip time moves with DST** — 14:00 in summer, 13:00 in winter. Nothing in the code knows
   that. **A bug whose behaviour changes on a calendar boundary gets RE-DISCOVERED rather than
   fixed, because its reproduction steps stop working twice a year.** That is the argument for
   solving it as arithmetic and never as an offset.
3. **THE COUNT DISAGREES WITH THE READER'S OWN CALENDAR DATE** — for up to two hours a day in
   CEST, one in CET.

**CORRECTED 11 Sep, by CC, after measurement. The lane's original consequence 3 claimed two
parties at the same instant could DISAGREE WITH EACH OTHER. THEY CANNOT, AND THE REASON IS VISIBLE
IN THE EXPRESSION:** `new Date("2025-10-01")` is UTC midnight and `new Date()` is an absolute
instant. **Neither term reads the reader's timezone**, so the subtraction is reader-independent in
both the old and the new code. Measured across UTC, Stockholm, Los Angeles and Tokyo: all four
returned `−346 / 15` at 13:00 UTC and `−345 / 16` at 11:00 UTC. **They were wrong about the
calendar TOGETHER.**

**The lane's error was confusing "the flip happens at 14:00 local" with "the value depends on the
locale."** The flip's wall-clock time differs by reader; the value at a given instant does not.

**What is actually wrong is worth stating precisely, because it is what Part 2 addresses:** every
reader agrees with every other reader, and all of them may disagree with **their own local date**.
Between 00:00 and 02:00 CEST a Stockholm reader is already on the next day and sees yesterday's
count. **That is a record-versus-reader gap, not a reader-versus-reader one.**

---

## IMPLEMENT — REMOVE THE TIME COMPONENT

```js
function daysUntil(d){
  if(d === null || d === undefined || d === '') return null;
  var target = new Date(d);
  if(!Number.isFinite(target.getTime())) return null;
  var now = new Date();
  var todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  var n = Math.round((target.getTime() - todayUTC) / 86400000);
  return Number.isFinite(n) ? n : null;
}
```

**Both sides are now UTC midnight**, so the difference is a whole number of days and **no
time-of-day survives anywhere in the expression**. UTC has no DST, so consequence 2 disappears
rather than moving.

**`Math.round` stays as a belt-and-braces guard** — the division is already exact, and a
non-midnight anchor would otherwise produce a fraction. **Do not remove it; it costs nothing and
it is the only thing standing between a malformed row and a fractional day count.**

**#118 and #120 must both survive unchanged**: an absent date still returns `null`, `null` still
sorts last, and **absence is still not lateness.** The `isNaN` guard is now explicit rather than
riding on `Number.isFinite(n)` — **report whether that changes the result for any of the four
undated forms.** It should not.

### The frame is UTC, deliberately and temporarily

**Part 2 will make the frame the brand's own country** — Charlotte's ruling, and it is right,
because the obligation belongs to the brand rather than to whoever is looking. **That field does
not exist.** `brand.currentMarket` is a *market*, not a domicile — it sits beside `targetMarkets`
and `ambitionMarkets` and `regDeadlinesForBrand` already reads all three as markets. **Using it
here would be a value from one domain standing in for a value from another** — the same error
`moq` was this afternoon.

**So Part 1 states its frame instead of guessing one.** UTC is defensible for EU regulatory dates,
which are not published in any member state's time, and it is **stable**, which is the whole
point. Write that into the comment.

---

---

## RULING — #180 PART 2, STRATEGY, 11 SEP. RECORDED HERE SO IT TRAVELS WITH THE WORK

**What the day count says for a brand whose country is not set: (c) UTC, with three conditions.**

**The reasoning:** a regulatory deadline is **a date, not a moment**, and a date has no timezone.
The frame only decides which day is *today* for the reader — so for a Nordic customer base the
disagreement window is **one to two hours out of every twenty-four**.

**Against that, (b)'s cost is certain and universal:** no existing brand has the field, so
suppressing the count makes **overdue unrepresentable again, for everyone** — precisely the
capability #160 restored this morning.

**(a), backfilling from `brand.currentMarket`, is out.** The proxy error wearing a correct field
name.

**Condition 1 — the reference is visible.** The number carries its frame the way `44` carries
*of 100*. **A silent default is one hoping not to be discovered.**

**Condition 2 — the default asks for correction.** Prefilling is wrong because it invites the
user *not to object*; **a visible default with a prompt invites them to correct.** Opposite
invitations, and this is the same ruling as #135's, one level down.

**Condition 3 — and it is the load-bearing one. UTC is adequate for ARITHMETIC DERIVED FROM A
PUBLISHED DATE. It is never adequate for anything ASSERTING A LEGAL POSITION.** The moment a
surface says *"you are compliant as of"*, real domicile is required and UTC will not do.

### The Part 1 / Part 2 boundary on Conditions 1 and 2, named rather than glossed

**Part 1 ships UTC silently, and for one weekend that is the silent default Condition 1
forbids.** Stated plainly rather than rationalised:

- **Today:** UTC, silent, and **wrong for part of every day.**
- **After Part 1:** UTC, silent, and **right all day.**
- **After Part 2:** the brand's country where set; UTC where not, **disclosed, with a prompt.**

**Part 1 does not introduce the default — the default is already there and already unstated.** It
makes the number correct; Part 2 makes the frame visible. **The disclosure debt is real and gets
a date, not an implication.**

---

## OUT OF SCOPE

- **Part 2: the brand-country field.** Needs onboarding, a migration, and the three conditions
  above. Specced separately, against the ruling now recorded here.
- **#181 (raised below).** Separate.
- The three call sites. **They are unchanged — confirm that, do not edit them.**

---

## #181 RAISED — WHAT ELSE IS COMPUTED FROM THE READER?

**Strategy's sweep question, and nobody has asked it:**

> **Every value rendered to more than one party must be a property of the RECORD, never of the
> one who is looking.**

Timezone is one instance. **Locale-dependent date formats, currency, thousands separators are
others** — `toLocaleDateString`, `toLocaleString`, `Intl.*`, and any bare `new Date()` in a render
path.

**The retailer portal is the two-sided surface where this costs most**, and `portal.html` is a
tracked baseline that has never been swept for it. **Scout it separately; do not fold it in.**

---

## STOP. NO COMMIT.

One function. No new branch.

---

## REPORT BACK

1. sha256 of all eleven before and after — **only `index.html` differs.**
2. Before/after for `daysUntil`.
3. **THE CENTRAL EVIDENCE — run BOTH versions at four simulated instants on the same calendar
   day: 00:01, 11:59, 12:01 and 23:59 UTC.** For all 14 `REG_DEADLINES` rows:
   - **OLD: the value must be shown CHANGING across those four times.** That is the defect, and it
     must be seen.
   - **NEW: the value must be IDENTICAL at all four.** That is the fix.
4. **The corrected values, stated plainly.** Some will differ from what the site shows now,
   because the current number is wrong for part of each day. **Report every row whose value
   changes and confirm it matches the calendar-day arithmetic done by hand.**
5. **#118 and #120 survive:** all four undated forms return `null`; undated still sorts last.
6. **The three call sites are untouched** and `urg()`'s thresholds behave identically on the
   corrected values.
7. **Does `REG_DEADLINES` contain any date-TIME string?** It should be date-only throughout —
   **assert it rather than assume it**, because a date-time row parses as LOCAL and would defeat
   this fix silently.
8. Anything noticed and not fixed.

---

## VERIFY

**The expected mid-batch result changed at #174 — do not read it as a regression:**

```
FAIL      | index.html  <new>…  DIFFERS from named baseline (be174bbf…) — AWAITING NAME
PASS      | 1 of the 11 tracked surfaces modified
 OVERALL: NOT GREEN — AWAITING NAME for: index.html
exit=1
```

Every other gate passes; the ten other surfaces unchanged. **A GREEN run while `index.html`
differs means the #174 gate has been undone — report it and stop.**

---

## SMOKE

**Step 1.** Deadline strip: Danish EPR reads **`Overdue · 345d`**, not 346.

**Step 2 — the one that proves it. CORRECTED: the lane wrote this backwards.** Note the number
today. **Open it again tomorrow, both before and after 14:00 CEST.** It must read **`Overdue ·
346d` all day** — **one HIGHER, because an overdue deadline gets MORE overdue as days pass** — and
it must not change between the two readings.

*The original step said 344d. That is wrong twice: wrong direction and wrong by two. **As written,
a correct fix would have failed this step**, which is the shape this lane has now declined eleven
times — a check that cannot pass, rather than one that cannot fail.*

**Step 3.** Green Claims still reads a stable future count all day.

**Step 4.** The Compliance Calendar agrees with the strip, to the day, at any hour.
