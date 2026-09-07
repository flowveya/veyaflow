# VeyaFlow — #123: the portal poll freezes the app for up to 5.2 seconds

**7 September 2026 · coding lane → CC**

Observed in DevTools on the live app during #110 smoke:

```
[Violation] 'setInterval' handler took 100ms · 352ms · 52ms · 52ms · 195ms
                                        · 50ms · 548ms · 244ms · 198ms · 5197ms
```

Ten violations in one session. **There is exactly one `setInterval` in the file** —
`setInterval(runPortalSync, 60000)` at 40250 — so every one of these is the portal poll.

**5,197ms is the app frozen for five seconds.** No clicks, no typing, no scroll. If it lands
while a brand is filling the rejection-reason field, keystrokes queue and the page appears
dead. Not a truth defect; a platform-quality defect of the kind users abandon software over.

---

## NAMED BASELINES

```
index.html   sha256  a1756c3bc195fc7d7cde7488948e57e4ff1e8fa19dc20bf78c6de1026c2c5d70
                     41,411 lines
portal.html  sha256  beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
```

Branch `f2b-async` at `d2933e6`. **Confirm before editing.**

---

## MEASURE BEFORE YOU CHANGE ANYTHING

**This spec's first half is an instruction not to fix.**

The observed range is 50ms to 5,197ms — a **100× spread on the same timer**. That means the
cost is not uniform and depends on state, and it means any fix chosen before measuring is a
guess. The coding lane has made that error three times this week (the DPP filter,
`claimLights`, and #121's "we owe this one" premise, all of which asserted a connection
between separately-observed parts). **Do not repeat it here.**

`(index):41280` in the violation is **where Chrome's sampler landed**, inside
`getLoopRejectionsForRetailer` — a cheap `forEach`. It is a symptom of the call chain, not
the cost. Do not treat it as the culprit.

**What the chain does, per read, all synchronously on the main thread:**

- `localStorage.getItem('ns_retail_submissions')` + `JSON.parse` — pre-state
- the original `runPortalSync` (network + status application)
- a second `JSON.parse` of the same key — post-state
- a `forEach` over all submissions comparing pre/post, calling `logRejectionLoopEvent`
- **a conditional full page rebuild** — `renderPage(currentPage)` at 40242–40244, fired only
  when `changed || newAlerts.length`

**CORRECTED 7 Sep, AFTER CC MEASURED.** This spec originally listed `_loopPrevSaveRP()` and
`setTimeout(runFeedbackLoopEngine, 150)` as the tail of this chain. **They are not — they
belong to the `saveRetailPerformanceMonth` wrapper (41262–41268), a different function.**
The lane read lines 41264–41266 and attributed them without establishing the enclosing
function. Consequence: `runFeedbackLoopEngine` would surface as a `'setTimeout'` violation,
never `'setInterval'`, so none of the ten observed entries can be it.

**AND THE STAGES ABOVE ARE NOT THE COST.** CC bounded them synthetically rather than
guessing: the double parse plus double forEach costs **37 ms at 5,000 submissions** (a
2.3 MB blob, already past what localStorage holds). Reaching 5,197 ms would take roughly
**700,000 submissions**. Every stage this spec originally named is bounded at single-digit
milliseconds for any reachable state.

**The surviving candidate is the render**, and it fits the distribution: quiet ticks pay a
fetch and a few ms of diffing; a tick that lands a status change pays a whole Brand Home
rebuild. Bimodal, state-dependent, 100× spread. Independently corroborated by the sampler
landing in `getLoopRejectionsForRetailer`, whose only caller is `renderPrePitchBrief` and
whose only caller is `renderPitch` — both render functions, so a render was on the stack.

**Report, with numbers:**

1. **Where the time actually goes.** Instrument the stages — `performance.now()` around each,
   or a Performance profile. State ms per stage across several ticks, including one slow tick
   if you can provoke it.
2. **What makes it vary 100×.** Submission count? A network call inside a loop? A render
   triggered per event? Repeated `JSON.parse` of a growing blob? **Name it from measurement,
   not from reading.**
3. **Whether `runFeedbackLoopEngine` is inside the measured window.** It is dispatched at
   +150ms, so it may be a *second* block rather than part of this one — two separate freezes
   would explain the bimodal distribution better than one variable stage.
4. **Why a Pre-Pitch Brief helper runs during a background sync.**
   `getLoopRejectionsForRetailer` appearing in this stack is a question on its own: either
   the brief is being rebuilt on every poll, or the sampler caught an unrelated frame. Say
   which.

---

## THEN FIX — the requirement to write against

> **No background timer may block the main thread for more than one frame (~16ms).**

The lane is **not** specifying the technique. Yielding between stages, moving the diff off
the hot path, caching the parse, debouncing the render, doing nothing when the payload is
unchanged — which of these applies depends entirely on what the measurement says. **Choose
after measuring and say why.**

**Constraints that hold whatever you choose:**

- **Polling every 60s stays** unless the measurement shows the cadence itself is the problem.
  Changing cadence to hide a slow handler is treating the symptom.
- **No behaviour change to rejection detection.** The pre/post comparison is what creates
  `rejection` loop events — #110's entire subject. If the diff moves, it must still fire
  exactly once per newly-rejected submission. **State how you established that.**
- **No silent failure.** If a stage is skipped when the page is busy, the sync must catch up,
  not drop the tick.

---

## OUT OF SCOPE

- **#122** — `renderRetailChecklist` rendering `NaN%` and a red bar for 156 of 158 retailers.
  Separate spec, and it also corrects `verify.expected.txt`'s false claim that #118's class
  terminated.
- **#119**, #114a/#114b, #115, #116, #117.
- #110's render half, 40700–41040.
- The two dead guards from #118 (33492, 34141) — going with #122.

---

## STOP. NO COMMIT.

**Report the measurement before editing.** If the measurement makes the fix obvious and
small, apply it in the same pass and say so. If it does not, stop and report — a wrong fix
here is worse than a slow poll, because rejection detection rides on this chain.

---

## REPORT BACK

1. sha256 before any edit; confirm it matched `a1756c3b`.
2. The four measurements above, with numbers.
3. The fix, if applied — technique, and why the measurement chose it.
4. How you established rejection detection is unchanged.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

If nothing was edited, **do not run it** — it would compare the tree against itself and pass
vacuously. That is now precedent, set by CC on #121, and it is the right reading.

---

## SMOKE

**Step 1.** Sit on the Submission Tracker for three minutes with DevTools open. **Zero
`[Violation] 'setInterval'` entries.**
*Failure: any violation at all — the requirement is one frame, and a violation means 50ms+.*

**Step 2 — the step that proves the fix did not break the point of the poll.** Set a
submission to Rejected from the retailer portal. Within one poll cycle a `rejection` event
appears on Brand Home.
*Failure: no event, a duplicate event, or an event appearing only after a manual refresh.*

**Step 3 — the step that passes only if nothing else changed.** Portal status changes still
land in the tracker within a minute, as before.
