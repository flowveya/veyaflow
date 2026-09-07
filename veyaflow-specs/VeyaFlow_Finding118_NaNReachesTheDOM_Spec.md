# VeyaFlow — #118: NaN can reach the DOM

**7 September 2026 · coding lane → CC**

A user saw `NaN` rendered twice in the outcome-capture flow. Console showed **no errors**,
and a DOM sweep for leaf nodes containing `NaN` returned **nothing** minutes later — so the
instance is not reproducible and the exact site is unknown.

**This spec does not chase the instance.** It removes the class, so the defect is gone
whether or not we ever identify which site produced it. Same method that ended the
regulatory-vocabulary whack-a-mole on 4 Sep: enumerate every site from the source, fix the
class, and the check terminates.

---

## NAMED BASELINES

```
index.html   sha256  e2b148d4463922c0bcd669d8af04e198bd8a89ab3886ba8d84734ac49c88f09a
                     41,331 lines · 2,724,663 bytes · 2 blocks
portal.html  sha256  beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
```

Branch `f2b-async` at `e4d365f`. **Confirm before editing.**

---

## THE MECHANISM, ESTABLISHED

Two sites are proven by reading, and they show why the class is invisible:

**`index.html:4853`**
```js
function daysUntil(d){return Math.max(0,Math.round((new Date(d)-new Date())/(1000*60*60*24)));}
```
**`Math.max(0, NaN)` returns `NaN`.** The line reads as a floor-at-zero guard and guards
nothing. An invalid or absent date passes straight through, and 4868 renders it as
`${d}d` → `NaNd`.

**`index.html:4685–4687`**
```js
${daysLeft!==null?` ⏰ Free trial: <strong>${daysLeft} day${daysLeft!==1?'s':''} remaining</strong>
```
`NaN !== null` is `true`. The guard passes NaN through and prints it.

**Why the class hides:** none of the usual guards exclude NaN.

| guard | with NaN | |
|---|---|---|
| `Math.max(0, x)` | `NaN` | looks like a floor, is not |
| `x !== null` | passes | |
| `x != null` | passes | |
| `x \|\| fallback` | **takes the fallback** | so some sites accidentally work |
| `if(x)` | falsy → skipped | so some sites accidentally work |
| `Number.isFinite(x)` | **false** | the only reliable test |

The `||` and truthiness rows are why this is dangerous: **a majority of sites accidentally
behave**, which is exactly the condition under which the minority goes unnoticed for months.

---

## THE RULE

> **A date-derived or computed number may not reach a rendered string unless
> `Number.isFinite()` has confirmed it is one.**

When it is not finite, render the **em dash `—`**, which this file already uses for absent
values (`Template version: '+(st.templateVersionUsed||'—')`, 38536; `daysSinceVerification
== null ? '—'`, 14067). **Do not render `0`.** Zero is a measurement; the em dash is an
absence, and the difference is the same one `not_recorded` exists to preserve.

---

## IMPLEMENT — `index.html` only

Enumerate **every** site where a computed number reaches a rendered string, and gate each
one. Start from — do not stop at — these anchors:

- `daysUntil` (4853) and its call sites
- `getTrialDaysLeft` (4656) and the render at 4685
- 4639, 13403, 26057, 31346, 31562, 32689 — every `/ 86400000` or `/ (1000*60*60*24)`
- `Math.round(`, `Math.ceil(`, `Math.floor(`, `parseInt(`, `parseFloat(`, `Number(` whose
  result is concatenated into HTML
- percentage renders — `+ '%'` — since a percentage from an empty array is NaN

**Fix `daysUntil` at the function**, not at each call site. One definition serving many
callers is where the guard belongs; patching callers is the narrow-anchor error.

**Report the count**: how many sites were found, how many already behaved by accident
(`||` or truthiness), and how many were live defects. **The count is the finding** — it
measures how much of the surface was exposed, and it is unrecoverable once fixed.

---

## REPORT, DO NOT IMPLEMENT

1. **The other three surfaces.** State whether `portal.html`, `dpp/index.html` and
   `brand/index.html` contain the class, and how many sites each. **Do not edit them** —
   they are separate baselines and this shipment moves one.
2. **Any site where the em dash is wrong.** If a value genuinely cannot be absent, say so
   rather than adding a guard that can never fire — a check that cannot fail is the defect
   this lane exists to prevent, and adding forty of them would be a self-inflicted one.
3. **Whether a shared helper is warranted** — e.g. one function that takes a number and
   returns either the formatted value or `—`. Report the shape; do not build it unless the
   count makes it obviously right, and say which.

---

## OUT OF SCOPE

- The unreproduced NaN instance itself. If it reappears after this sweep, that is new
  information and a new finding.
- #114a / #114b, #115, #116, #117. Separate specs.
- #110's render half, 40700–41040, still unscanned.

---

## STOP. NO COMMIT.

---

## REPORT BACK

1. sha256 before editing; confirm it matched `e2b148d4`.
2. The count: sites found / accidentally-safe / live defects.
3. `daysUntil`'s before and after.
4. The three reports.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `e2b148d4`; `portal.html` UNCHANGED at
`beaa72b8`. The lane names the new value from an independent digest.

---

## SMOKE

**Step 1.** Open the outcome-capture flow on a submission. No `NaN` anywhere on screen.

**Step 2 — the one that proves the guard works rather than that the data happens to be
clean.** In the console, with a submission open:
```js
[...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /NaN/.test(e.textContent)).length
```
Must be `0`. Run it on Brand Home, the Submission Tracker and the outcome modal.

**Step 3 — the step that passes only if nothing else changed.** A submission with valid
dates shows the same day counts as before, and the `0d` deadline chips still read `0d` and
not `—`.
*Failure: any real number replaced by an em dash — that would mean a guard is firing on
finite values.*
