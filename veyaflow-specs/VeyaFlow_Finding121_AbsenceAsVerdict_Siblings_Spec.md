# VeyaFlow — #121: the six remaining absence-as-verdict sites

**7 September 2026 · coding lane → CC**

#120 established the rule and fixed three sites. CC's sweep found **six more live**. This
shipment closes them, so the class terminates rather than being revisited a fourth time.

> **AN ABSENCE MAY NEVER BE RENDERED AS A JUDGMENT** — not as a colour, not as a confidence
> level, not as a relative time, not as a position in a ranked list.

And the mechanism CC extracted, which is what makes this enumerable rather than endless:

> **The final `else` of a comparison chain is where absence lands, and whichever verdict
> sits there gets asserted** — sometimes the worst, sometimes the best, never "unknown".

---

## NAMED BASELINES

```
index.html   sha256  a1756c3bc195fc7d7cde7488948e57e4ff1e8fa19dc20bf78c6de1026c2c5d70
                     41,411 lines
portal.html  sha256  beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
```

Branch `f2b-async` at `d2933e6`. **Confirm before editing.**

**THE LINE NUMBERS IN CC'S #120 REPORT ARE STALE BY ~46** — they were taken at `e1f68ca1`
and #120 added 46 lines. **Locate every site by behaviour, as you did last time.** That
worked; the numbers didn't.

---

## SITE 1 — THE CALENDAR EVENT COLOUR (≈33293 at the old baseline) — WE OWE THIS ONE

```js
days<30 ? 'red' : days<90 ? 'amber' : 'green'
```

An unreadable or absent date falls through both comparisons and renders **green**.

**This is the inverse hazard and the worse one.** Red reads as *a problem to check*; green
reads as *checked and fine*. A user acts on red and relaxes on green, so an absence
rendered green is the one that actually changes behaviour.

**And #120 half-fixed it, which is worse than leaving it alone.** That same `events.push`
had its `days` field made null-safe for **sorting**. The row now sorts correctly and still
colours itself green from nothing — so the sort implies the colour was considered. **Do
this one first.**

---

## SITES 2–6

| | current | absence renders as |
|---|---|---|
| benchmark comparison (≈23589) | `diff<=0?'green':diff<=5?'amber':'red'` | **red** — a missing benchmark reads as a failed one |
| score tier (≈15266) | `score`→HIGH/MEDIUM/LOW | worst tier |
| (≈28441) | comparison chain | report which |
| `healthScoreColor` (≈35958) | score→colour | report which |
| readiness bar (≈6899) | `rs.total`→bar colour | report which |

---

## THE TEST EACH SITE MUST PASS — AND THE ONE IT MUST NOT

**For each of the six, establish first whether the input can actually be absent.** #118
proved this matters: `RETAILER_REGISTRY` has 158 entries with zero missing `marginMin`, so
a guard there would have been **a check that cannot fail** — the defect this lane exists to
prevent, self-inflicted six times over.

- **Input provably finite** → no guard. Say so, say how you established it, move on.
- **Input can be absent or unreadable** → the chain gains a not-recorded branch **before**
  the comparisons, using `Number.isFinite`, rendering the neutral this file already has
  (`var(--muted)`, 752 uses).

**Do not invent a colour.** #120 used the existing neutral and that is the precedent.

---

## THE DISTINCTION THAT MATTERS ON THE SCORE SITES

Three of these (15266, 35958, 6899) are driven by **scores**, not dates. A score of **0 is
a real answer**; a score that was never computed is not. That is the same distinction #119
holds open for percentages on user-supplied money, and it is easier to get wrong here
because `0` and `undefined` both look empty.

**If a site cannot distinguish "scored zero" from "never scored", report it rather than
guessing.** That is a data-shape problem and a bigger fix than a render guard.

---

## REPORT, DO NOT IMPLEMENT

1. **Is the class now closed?** Re-run your own sweep at the new baseline and state whether
   any site of this shape remains. **A count of zero is the answer that ends this** — and if
   it isn't zero, that is more useful than a clean report.
2. **`portal.html`, `dpp/index.html`, `brand/index.html`** — does this class exist there?
   #118 found the *number* class absent from two of them, but this class renders as words
   and colours and may not have travelled the same way. **Report only; do not edit.**
3. **Any site where a not-recorded branch would change an existing count or aggregate** —
   the way splitting `LOW` would have, had `fieldConfidence` had callers.

---

## OUT OF SCOPE

- **#119** — percentages on user-supplied money. Its own shipment.
- #114a/#114b, #115, #116, #117.
- #110's render half, 40700–41040.

---

## STOP. NO COMMIT.

Six sites, three reports. Site 1 first.

---

## REPORT BACK

1. sha256 before editing; confirm it matched `a1756c3b`.
2. Before/after for each site, and for any site left unguarded, **how you established the
   input is provably finite**.
3. The three reports. Report 1's count is the finding.
4. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `a1756c3b`; `portal.html` UNCHANGED.

---

## SMOKE

**Step 1.** A calendar row whose date is absent shows the neutral treatment — **not green.**
This is the step that matters; it is the one we half-fixed.

**Step 2.** A row with a date inside 30 days still shows red; 30–90 amber; beyond 90 green.
*Failure: any real date changing colour — that would mean a guard is firing on finite
values.*

**Step 3 — the step that passes only if nothing else changed.** The readiness bar and health
score render exactly as before for any record that has a score.
