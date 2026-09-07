# VeyaFlow — #120: absence rendered as a verdict

**7 September 2026 · coding lane → CC**

Raised by CC's own #118 report, under "noticed, not fixed". **It outranks #118.**

`NaN` is *visibly* broken, so a user distrusts it. `LOW`, red, and *"· today"* are
**plausible**, so a user believes them. This is the same failure as the Lyko rejection
inventing three causes into an empty `reason` field — a confident finding manufactured from
an absence — except arithmetic did it instead of a model, which is why no prompt sweep
would ever have found it.

---

## NAMED BASELINES

```
index.html   sha256  e1f68ca17b898bac9bc90554b70b4b0435d507b71d955cd8a6b0d2250e47bb52
                     41,365 lines
portal.html  sha256  beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
```

Branch `f2b-async` at `7c4362b`. **Confirm before editing.**

**LINE NUMBERS IN CC'S #118 REPORT ARE STALE.** They were taken at `e2b148d4`; #118 added
34 lines at ~4859, so everything below shifted. **Locate these three by behaviour and by
function name, not by the numbers in that report** — anchoring on a stale line is the
narrow-anchor error, and it has bitten this lane nine times.

---

## SITE 1 — `fieldConfidence` / `fieldAge` (≈35828–35839) — THE CLEAREST CASE

```js
function fieldAge(dateStr){
  if(!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr)) / (1000*60*60*24));
}
function fieldConfidence(dateStr){
  const days = fieldAge(dateStr);
  if(days===null) return 'LOW';
  if(days<90)     return 'HIGH';
  if(days<180)    return 'MEDIUM';
  return 'LOW';
}
const CONFIDENCE_COLOR = {HIGH:'#10B981', MEDIUM:'#F59E0B', LOW:'#EF4444'};
```

**Two defects, and the second is not a NaN bug at all.**

1. An **unparseable** date makes `fieldAge` return `NaN` — the `if(!dateStr)` guard catches
   absence but not garbage. `NaN===null` is false and `NaN<90` / `NaN<180` are both false,
   so it falls through to `LOW`.
2. **An absent date already returns `LOW` deliberately** — `if(days===null) return 'LOW'`.
   So *"we have no date"* and *"this data is over 180 days old"* produce the same red
   verdict. **The app states low confidence about data it never had.**

**There are three states where there must be four.** The missing one is `not_recorded`, and
this app already has that concept: `checkState` treats it as first-class, the portal's
compliance legend distinguishes `–` *not recorded* from `✗` *blocks this listing*, and
#110 item 4 zeroed a database field to the literal string rather than blanking it —
precisely so that "we removed something" stays distinguishable from "nothing was here".

**Implement:** `fieldAge` returns `null` for unparseable input as well as absent input
(`Number.isFinite`, per #118's rule). `fieldConfidence` gains a fourth return value for the
null case, distinct from `LOW`, with its own entry in `CONFIDENCE_COLOR` that is **not the
red used for LOW** — the muted/neutral treatment this codebase already uses for absence,
not a fourth invented colour.

---

## SITE 2 — template staleness rendering an unreadable date as RED

CC reported a site falling through to `layer1='red'` — a **staleness verdict** derived from
a date it could not read. Around `getTemplateStaleness` (≈13409), which already returns an
honest all-null shape when no template exists — so the null contract was intended here too,
and NaN slips past it exactly as it does in `fieldAge`.

**Locate it, state the current behaviour, then apply the same rule:** an unreadable or
absent date yields the not-recorded state, never a colour that asserts a judgment.

---

## SITE 3 — `'· today'` on an unreadable date

CC reported a magic-link surface rendering `' · today'` when the date cannot be parsed.
**This one is a plain false statement** — not a wrong colour, an assertion that something
happened today when we do not know when it happened.

Same rule. Absent or unreadable → the em dash or an explicit "date not recorded", never a
relative-time phrase.

---

## ALSO IN THIS SHIPMENT — the sort ruling

`daysUntil` now returns `null`, and the comparators at ≈4862 and ≈33337 subtract it. `null`
coerces to `0`, so **undated rows sort FIRST in a soonest-first list** — urgency asserted
from an absence, which is this finding's own shape introduced by its predecessor's fix.

**Ruling: undated rows sort LAST.** An item with no deadline is not urgent.

---

## THE RULE THIS SHIPMENT ESTABLISHES

> **An absence may never be rendered as a judgment.** Not as a colour, not as a confidence
> level, not as a relative time, not as a position in a ranked list. Where the app has no
> data, it says so — and "no data" must be visually distinct from every real verdict,
> especially the worst one.

Record it in the file's comments where a future reader will meet it.

---

## REPORT, DO NOT IMPLEMENT

1. **Sweep for siblings.** Every place where a null or NaN input produces a *categorical*
   output — a colour, a label, a tier, a status, a sort position — rather than a number.
   #118 swept numbers reaching the DOM; this class reaches the DOM as **words and colours**,
   which is why it survived that sweep. **Report the count.** Do not fix what this spec does
   not name.
2. **Whether any caller depends on `LOW` meaning both things.** If something counts LOW
   fields as a quality signal, splitting the state changes that count — say so.
3. **What the not-recorded treatment should look like**, given what already exists in the
   file. If there is no established neutral token, say so rather than inventing one; that is
   DESIGN's.

---

## OUT OF SCOPE

- **#119** — percentages on user-supplied money. Its own shipment; the em dash may be wrong
  there, since 0% is a real answer where a missing RSP is not.
- #114a/#114b, #115, #116, #117.
- #110's render half, 40700–41040, still unscanned.

---

## STOP. NO COMMIT.

Three sites plus the sort ruling. Three reports.

---

## REPORT BACK

1. sha256 before editing; confirm it matched `e1f68ca1`.
2. Before/after for all three sites and both comparators.
3. The sibling count from report 1 — **the count is the finding**, as it was for #118.
4. Reports 2 and 3.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `e1f68ca1`; `portal.html` UNCHANGED.

---

## SMOKE

**Step 1.** A supplier field with no recorded date shows the not-recorded treatment — not
red, not LOW.

**Step 2.** A supplier field with a genuinely old date (>180 days) still shows LOW in red.
*Failure: if this changed, the fix has confused absence with staleness in the other
direction.*

**Step 3 — the step that passes only if nothing else changed.** A field with a recent date
still shows HIGH in green, and the deadline bar still sorts soonest-first with real
deadlines above undated rows.
