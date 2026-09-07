# VeyaFlow — #112: the add-submission button opens a form below the fold

**7 September 2026 · coding lane → CC**

Reported by Charlotte from the running app: clicking **+ NEW SUBMISSION** on the
Submission Tracker appears to do nothing.

**It is not doing nothing.** The form opens, several hundred pixels below the viewport,
and the page does not move. A control that works and looks broken is worse than one that
fails visibly — the user's next action is to click it again.

**This is a UX defect, not a truth defect.** It does not assert anything false. It is in
this archive under the same discipline because the *sibling* rule applies: the pattern
occurs twice, and fixing only the reported instance is the narrow-anchor error.

---

## NAMED BASELINE

```
index.html   sha256   4a3a2e982ebc75ba3104de8aac697e6a217be5b61d96b2adb1beee21801c0a0b
             short    4a3a2e98
             41,307 lines · 2,722,881 bytes · 2 inline <script> blocks
```

Branch `f2b-async`, at `e42b66b`, which is the deploy currently in production. Three days
have passed since this value was named — **confirm it before editing.** If it differs,
stop and report; do not proceed on a tree whose provenance has not been re-established.

---

## MECHANISM

`openAddRetailSubmission()` at **38279**:

```js
retailTrackerAddOpen = true;
retailTrackerAddForm = { … };
renderPage('retail-tracker');
```

`renderPage` rebuilds the page. The form's heading (`New submission`, **38212**) is emitted
into the HTML string *after* the pipeline summary, the aggregated rejection view (36963),
Pattern Intelligence (37091) and the Brand Outcome Dashboard (37377). The button itself is
at **37957**, at the top. So the form lands far below the fold and scroll position does not
follow it.

---

## THE SIBLING — DO NOT FIX ONLY THE REPORTED ONE

Same shape, `openAddRetailComms()` at **39703**:

```js
retailCommsAddOpen = true;
retailCommsAddForm = { … };
renderPage('retail-comms');
```

Whether it is *visibly* broken depends on how much content precedes its form on that page.
**Report which**, and fix both regardless — a control that happens to be above the fold
today is one content block away from not being.

These two are the only occurrences of the `…Open = true; … renderPage(…)` pattern in the
file (lane grep, this baseline). If CC finds a third by another route, report it rather
than folding it in.

---

## IMPLEMENT

After the re-render, bring the opened form into view. The requirements:

- **Scroll only when opening**, never on an ordinary re-render.
- **Scroll after the DOM exists**, not before — `renderPage` builds markup, so the target
  node is not present until it returns.
- **Both call sites.**

The lane is **not specifying the mechanism** — id-plus-`scrollIntoView`, a ref, or
something the codebase already uses for this. Use whatever is consistent with the existing
patterns in this file and say what you chose and why.

---

## REPORT, DO NOT IMPLEMENT

1. **Focus.** Moving keyboard focus to the first field is the usual companion to this fix,
   and focusing an element can itself scroll, which may fight the scroll above. State
   whether focus should move, and whether the two interact.
2. **Closing.** `closeAddRetailSubmission()` (38285) re-renders with the form gone. State
   what happens to scroll position on close — if the user is left staring at whatever now
   occupies those pixels, that is the same defect inverted.
3. **Whether scrolling is the right fix at all.** The alternative is that the form should
   not be at the bottom of a long page — rendering it near the button, or as an overlay.
   **That is a DESIGN question and the coding lane does not own it.** Report the option;
   do not build it. If DESIGN rules for a different pattern, this fix is superseded rather
   than extended.

---

## OUT OF SCOPE

- The Daylight design system. Zero-emoji rule stands; the existing `⟳` at 4091 is nav
  iconography already in the tree and is not touched by this spec.
- #110's render half (40700–41040), still unscanned.
- Everything held from batch #9.

---

## STOP. NO COMMIT.

One edit, applied at two call sites. Three reports. Do not implement anything under
REPORT.

---

## REPORT BACK

1. sha256 before editing; confirm it matched `4a3a2e98`.
2. Before/after for both call sites, and the mechanism chosen.
3. Whether the `retail-comms` sibling was visibly broken or only latently so.
4. The three reports above.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `4a3a2e98`; the lane names the new value from an
independent digest.

---

## SMOKE

**Not blocked by this fix — the #110 smoke can proceed by scrolling manually.** This is
its own check:

**Step 1.** Click **+ NEW SUBMISSION** from the top of the Submission Tracker. The form is
visible without scrolling.
*Failure: any need to scroll to find it.*

**Step 2.** The same on the Comms page.

**Step 3 — the step that passes only if nothing else changed.** Navigate to the Submission
Tracker normally, without clicking the button. The page opens at the top as before.
*Failure: any scroll on ordinary navigation — that would mean the scroll fires on render
rather than on open.*
