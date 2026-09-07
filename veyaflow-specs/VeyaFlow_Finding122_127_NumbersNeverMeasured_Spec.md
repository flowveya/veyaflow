# VeyaFlow — #122 and #127: numbers that assert what was never measured

**7 September 2026 · coding lane → CC**

Three items, one class. Each puts a number or a colour in front of the user that no
computation supports. Two were found by using the app; one is ours, introduced by #118.

---

## NAMED BASELINES

```
index.html   sha256  48fe2758068e96918b9cb1becb98016aae2b990a1a6758cdca44b02ced7a2d76
                     41,428 lines
portal.html  sha256  beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
netlify/functions/supabase-proxy.js  sha256  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
```

Branch `f2b-async` at `6f68026`. **Confirm before editing.** The proxy is a tracked surface
as of #126 and must not move in this shipment.

---

## #127 — THE SUPPLIER AUDIT BADGE IS A LITERAL

`index.html:4435`:

```js
if(n.id==='suppliers') html+='<span class="nav-badge">2</span>';
```

**It will say 2 forever, whatever the data does.** The badge directly above it is
`savedReports.length` and the one directly below is the tracker's computed staleness — both
real. A user reading that nav cannot tell which numbers mean something, which devalues the
two that do.

**Ruling: delete it.** Do not invent a computation to justify an existing badge — that is
reasoning backwards from the decoration to the data. If Supplier Audit needs a badge later,
it gets one when there is something to count.

**Report** whether anything in the supplier region could legitimately feed one — the
`healthScore` machinery exists — but **do not build it.**

---

## #122 — THE LISTING CHECKLIST RENDERS `NaN%` AND A RED VERDICT FOR 156 OF 158 RETAILERS

`index.html:39258–39265`:

```js
var pct = Math.round((doneCount/reqs.length)*100);
var barColor = pct>=100 ? 'var(--green)' : pct>=70 ? 'var(--amber)' : 'var(--red)';
…'<div …>'+doneCount+' of '+reqs.length+' requirements complete</div>'
…'color:'+barColor+'">'+pct+'%</div>'
…'width:'+pct+'%'
```

`LISTING_REQUIREMENTS` has **two keys** — `apotek_hjartat_se` and `matas_dk` — against 158
registry retailers. For every other retailer `reqs` is `[]`, so `0/0 = NaN`, and it lands in
three places at once:

- `NaN%` as visible text
- **red**, because NaN fails both comparisons — a completion verdict on a checklist that
  does not exist
- `width:NaN%`, invalid CSS

**This is #118 and #120 in one line, and it survived #118's sweep** — which enumerated 16
percentage renders and did not catch this one. `verify.expected.txt` records that #118's
class "was removed". **That record is wrong and this shipment corrects it** (see below).

**Ruling: the fix is the empty state, not a guard.** A brand looking at a retailer with no
requirements list must be told that, not shown a 0% or NaN% bar. Rendering a progress bar
for a checklist that does not exist is the defect; guarding the number would only make the
lie tidier.

- When `reqs.length === 0`, render **no bar, no percentage, no "0 of 0"** — an honest
  statement that no requirements list exists for this retailer yet.
- Use vocabulary already in the file for absence. **Do not invent a new empty-state
  treatment**; if none fits, report that rather than designing one — it is DESIGN's.
- This is **#63 surfacing as a colour.** Say so in the comment so the next reader connects
  them.

---

## OURS, FROM #118 — TWO GUARDS THAT CANNOT FIRE

CC identified both under "noticed, not fixed" in #121:

- **33492** `!Number.isFinite(ev.days)?'—':…` — `ev` comes from `byMonth`, built from
  `events`, which only receives rows past `addEvent`'s `isNaN(d)` early return.
- **34141** `Number.isFinite(w.daysToOpen)?…:'—'` — `openDate` is built with `||1`
  fallbacks, so the date is always valid.

**Ruling: remove both.** A guard that cannot fire asserts a check nobody performs — the
defect this lane has now named five times, twice in its own work. Line numbers are from
`a1756c3b`; **locate by behaviour**, they have drifted.

**Leave the other ten #118/#120 guards alone** — each has a reachable non-finite path.

---

## ALSO IN THIS SHIPMENT — CORRECT THE RECORD

`verify.expected.txt`'s #118 entry states the NaN-to-DOM class was removed. **#122 proves it
was not.** Add a correction to that entry — not a rewrite, an appended note saying the sweep
missed a percentage render and how it was found. A record that overstates its own coverage
is the same defect as a badge that overstates its own measurement.

---

## REPORT, DO NOT IMPLEMENT

1. **Re-run #118's percentage scan** and state why 39258 was missed. Pattern too narrow?
   Different construct? **The answer determines whether other sites were missed too**, and
   that is more valuable than this fix.
2. **Any other hardcoded literal rendered as a badge, count or score.** `nav-badge` is one
   class name; there may be siblings. **Report the count.**
3. Whether the supplier region holds a real number for a badge — **report only.**

---

## OUT OF SCOPE

- **#114c** — making a reason reach an existing row. Needs the proxy; its own shipment.
- #123 (poll blocking), #119, #115, #116, #117, #121's six provably-finite sites.
- #110's render half, 40700–41040.

---

## STOP. NO COMMIT.

Three implements, three reports.

---

## REPORT BACK

1. sha256 of all three tracked surfaces before editing; confirm they matched.
2. Before/after for each implement.
3. The three reports. **Report 1 is the finding** — why the sweep missed it.
4. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `48fe2758`; `portal.html` and the proxy UNCHANGED.
5 tracked surfaces, 1 modified.

---

## SMOKE

**Step 1.** Open the Listing Checklist for a retailer that is **not** Apotek Hjärtat or
Matas — i.e. almost any of them. No `NaN%`, no red bar, no "0 of 0". An honest empty state.

**Step 2.** Open it for **Matas** or **Apotek Hjärtat**. The bar and percentage render
exactly as before.
*Failure: any change to a retailer that has a real requirements list.*

**Step 3.** The nav shows no `2` beside Supplier Audit, and the Brand Home and Submission
Tracker badges still render when they have something to say.

**Step 4 — the permanent check from #118.** On the Listing Checklist page:
```js
[...document.querySelectorAll('*')].filter(e => e.children.length === 0 && /NaN/.test(e.textContent)).length
```
Must be `0`. This is the page that would have failed it this morning.
