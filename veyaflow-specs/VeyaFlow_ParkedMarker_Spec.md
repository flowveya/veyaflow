# VeyaFlow — the parked marker: a page that is not shipped must not render as one

## DISPATCH LOG — THE ONE PIECE OF STATE THAT HAD NO ARTEFACT

> **"Sent to CC" was the only state in the whole set with nowhere to live.** The register holds open
> items, the repo holds specs and commits, the log holds rulings — **nothing recorded a handover,
> because handing over is a chat action and leaves no trace.** So both lanes reported a state neither
> could observe, repeatedly, each quoting the other's assumption. *A claim with no slot is a claim
> nobody checks* — the same form as every other finding this week, applied to our own process.
>
> **EVERY SPEC CARRIES THIS BLOCK FROM NOW ON. One line per dispatch: date, and what was sent.**

| date | sent | evidence |
|---|---|---|
| 22 Sep 2026 | **Part 0 only** — the enumeration, stop and report | CC's Part 0 report quotes this file and its baseline |
| 23 Sep 2026 | **Part 1** — build, after Part 0's result was recorded here | CC's Part 1 report; shipped `83ce815` |

*Both rows are observable from CC's own reports, not reconstructed from memory.*

---


**22 September 2026 · coding lane → CC · ruled by Strategy**

**The shipment has one purpose:**

> **IN X-RAY MODE, A PARKED PAGE MUST BE DISTINGUISHABLE FROM A LIVE ONE — BY CHROME THAT IS
> VISIBLY NOT PART OF THE PAGE.**

**This is a BUILD, not a move.** *The move dissolved on measurement 22 Sep: the register's claim
"`parked` gives muted italic on nine pages" was a Design relay never measured, and it is wrong in
three ways. There was nothing to relocate.*

**AND THE REASON IS NOT REVIEWER CONFUSION.** **An unshipped page rendered as a shipped one ASSERTS
A CAPABILITY WE DO NOT HAVE** — the demo-data class from 19 Sep. *Unlike the Gold/Silver/Bronze
badges, nobody needs to demo it: anyone who opens the mode sees nine finished screens.*

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`52d0a88ffa564aaed0fe38134d7b95665965691efd8bbce75e1ace574982cf1f`, branch `f2b-async` at
`b738908`, clean tree, 57 gates GREEN, **0 of 11 modified**. **Confirm all eleven before starting.**

---

## THE MECHANISM, CITED — EVERY LINE BELOW IS `Belägg: index.html:<line>`, NOT A DESCRIPTION

```
4178  PARKED_IDS = ['report','compare','bizcase','cfo','find','sourcing','circular','suppliers','pitch']
4180  showParked  ← localStorage 'ns_show_parked'
4182  !showParked → the nine are filtered OUT of the nav list
4184  showParked  → only 'pitch' stays filtered (removed-beats-parked, 7 Aug)
4455  desktop nav item render — emits class 'parked' from n.parked
4513  mobile nav item render  — same
 161  .nav-item.parked .nav-name { color: var(--ink-mute); font-style: italic; }
 880  .m-li.parked .nm          { color: var(--ink-mute); font-style: italic; }
4114  parked:true — ONE NAV ENTRY ONLY: atm-admin. Not one of the nine.
4091  suppliers carries flag:"watch"  — the only mark on any of the nine
4094  dpp carries badge:"New"         — a SECOND mark property, different name
4557  showPage — consults isSurfaceHidden, NOT PARKED_IDS
```

**TWO CONSEQUENCES OF THAT LAST LINE, BOTH INTENDED:** the nine are reachable by URL (`#/cfo`) with
the flag off, because **parking is a launch-IA decision, not a permission** — *#197's distinction,
working as designed.* **But it means the marker cannot live in the nav alone.** A reviewer arriving
by URL sees no nav entry at all. **THE MARKER BELONGS ON THE PAGE'S CHROME, NOT ON ITS NAV ROW.** *The nav row is OPTIONAL; the page
is ALWAYS THERE. A marker must sit on what is guaranteed present.*

> **AND THIS IS #197'S GATE INVERTED.** There, `showPage` guaranteed a hidden surface would not
> FUNCTION but could not stop it being OFFERED. **Here the nine are REACHABLE but UNLISTED — the
> same gate, the opposite gap.** *Which is why Step 1 of the smoke is the step that can fail: it
> enters by the route the nav does not govern.*

---

## PART 0 · THE BADGE AXIS — ENUMERATE BEFORE ANYONE DRAWS

**`flag:"watch"` (4091) and `badge:"New"` (4094) are two different properties that both render a
mark — AND THE LANE FOUND THE SECOND BY ACCIDENT WHILE MEASURING THE FIRST.**

> **SO TWO IS A FLOOR, NOT A COUNT. AN ENUMERATION IS A LOWER BOUND UNTIL SOMETHING MECHANICAL
> PRODUCES IT.** **Do NOT list the property names anyone happens to remember.** *That is the hand
> enumeration the alias sweep was graduated for replacing, and it is how `PACK_RETAILERS` reached
> 28 names with 7 unresolvable.*

**START FROM THE RENDER SITE AND WORK BACKWARDS. The two sites are 4455 (desktop) and 4513
(mobile).**

1. **Every property of `n` consumed at 4455 and 4513** — read the emitted expression and take them
   from it. *This is a CEILING for static access and a LOWER BOUND for what reaches the mark
   position: report separately whether either site uses dynamic access (`n[x]`, a key built from a
   string), which no static read can enumerate.*
2. **Which of those produce a VISIBLE MARK** as against layout, routing or the label itself.
3. **Every distinct value each mark property takes across all NAV entries**, cited.
4. **Whether two can land on one entry at once, and what the emitted HTML does when they do.**

**THE LIKELY RESOLUTION, STATED SO PART 0 IS NOT MISREAD AS A REQUEST TO SEPARATE THREE MARKS:**
**two unrelated axes already share that position — *watch* and *new*. Adding shipping status makes
three, and ONE PLACE, ONE MEANING says at most one survives there.** **So the parked marker probably
does not belong in the badge position at all** — *which is where the 17 Sep principle already
pointed, for unrelated reasons: a frame or banner, not inline chrome competing for a slot.*
**Separating three meanings inside one slot is the expensive answer; not putting the third one there
is the cheap one.**

> **CANON, AND IT APPLIES TO THE BADGE AXIS TOO: ONE PLACE, ONE MEANING.** **Today the absence of a
> badge on eight of the nine reads as normality. After this build, two marks would sit in the same
> position carrying different meanings** — `watch` means *compliance watch*, the new one would mean
> *not shipped*. **That collision is designed out in the spec or it is built in.**

**STOP AFTER PART 0 AND REPORT.** *The drawing decision depends on this enumeration and must not be
guessed at.*

### PART 0 — RESULT, 22 SEP. THE PREMISE ABOVE IS REFUTED.

**`badge` IS READ BY NEITHER RENDER CALLBACK. It renders no mark in the nav, and there is no second
axis in that position.** `Belägg: absence at index.html:4454–4503, 4512–4545`. *The lane saw
`badge:"New"` in the literal and concluded it produced a mark — READING A DECLARATION AND ASSUMING A
CONSUMER, the field-census shape and the same reflex as #207.*

**ONE property renders a mark in the nav: `flag`** — emits `<span class="flag …">` with the value as
text. `Belägg: index.html:4489, :4530`. **`parked` is STYLE-ONLY** (a class on the row's own div,
CSS at `:161`, `:880`), not a separate element.

**AND THE SPEC'S TWO CITATIONS WERE BOTH LOWER BOUNDS:**

```
flag    3 carriers — skus (4080), suppliers (4091), atm-admin (4114)   values "watch","pending"
badge   3 carriers — dpp (4094), csrd (4096), reg_monitor (4097)       values "New","Live"
parked  1 carrier  — atm-admin (4114)
```

**NO DYNAMIC ACCESS AT EITHER SITE.** *So for these two callbacks the static read is a CEILING AS
WELL AS A FLOOR — an enumeration that is exhaustive rather than a lower bound, which is rare enough
to state.* `Belägg: index.html:4454–4503, 4512–4545`.

**WHAT SURVIVES AND WHY IT IS STRONGER: the marker still does not belong in the nav — but the reason
is NOT slot contention, which does not exist. It is that PARKED PAGES ARE REACHABLE BY URL WITH NO
NAV ROW PRESENT.** `Belägg: index.html:4557` (`showPage` consults `isSurfaceHidden`, not
`PARKED_IDS`) and `:4182`. **Part 1 proceeds on that argument alone.**

**TWO THINGS NOTICED, NEITHER IN SCOPE:** **`badge` appears dead in the nav** — three entries declare
it, no callback reads it; whether anything outside these two sites reads `n.badge` is `OLÄST`. And
**`skus` carries `flag:"watch"` while being LIVE and unparked**, so "watch" already means something
unrelated to shipping status on a shipped page. `Belägg: index.html:4080`.

---

## PART 1 · THE MARKER — AFTER PART 0 IS RULED

**FORM, RULED 17 SEP AND UNCHANGED:** **a frame, a banner, an edge — something VISIBLY NOT PART OF
THE PAGE. Never restyled text, never dimmed content, never italics.**

> **A PREVIEW MUST NOT RESTYLE WHAT IT SHOWS.** *You cannot judge what a customer sees by looking at
> something rendered differently.* **Make the test DATA awkward, never the test RENDERING: awkward
> data exercises the layout, awkward styling voids the trial.**

**THE TEST, APPLIED TO THE CANDIDATE BEFORE IT SHIPS: DOES THE MARKER CHANGE ANY PROPERTY THE
REVIEWER JUDGES? IF IT DOES, IT IS THE WRONG MARKER.** *Spacing, type size, colour, and the page's
own width all count as properties she judges.*

**COPY — THE FOUR WALLS FROM THE HONESTLY-EMPTY RULING APPLY UNCHANGED:**

1. **State what is true: this page is not part of the live product.**
2. **The gap is named as OURS, in one clause, without apology.**
3. **No promise. NO "COMING SOON"** — *a claim about the future with no source, #219's class, and the
   single most natural sentence for anyone to write on a parked page.*
4. **No advice about when or whether it will ship.**

---

## OUT OF SCOPE

- **Changing `PARKED_IDS` membership.** Nothing un-parks here.
- **`pitch`**, which stays filtered even in X-ray mode (removed-beats-parked).
- **The `atm-admin` italic at 161/880.** *It marks a different thing and is a separate question —
  and it is the only consumer of `.parked`, so deleting or keeping it is not this shipment's call.*
- **#245's market pickers.** Blocked on the honesty machinery, which is ruled but unbuilt.

---

## REPORT BACK

1. All eleven digests before and after.
2. **Part 0's enumeration in full** — every mark property, every value, every render site, cited.
3. **Whether the frame collides with any of the nine pages' own layout** — *a full-width banner on a
   page that already has a top strip is a layout question, and LAYOUT IS NEVER BYTE-VERIFIABLE.*
4. Anything noticed and not fixed.

**EVERY CLAIM ASSERTING A FACT ABOUT THE CODE CARRIES `Belägg: <file:line>` OR `OLÄST`.** *A
citation, not a description — POINT AT WHERE IT SAYS SO, DO NOT RESTATE IT. `OLÄST` means I did not
look, and a claim about the code is never hard to check.*

> **THE FIELD WAS NAMED `Mekanism:` FOR ONE DAY AND RENAMED, BECAUSE THE OLD NAME INVITED A
> CONFUSION THAT WAS CAUGHT BY LUCK.** *A 12 Sep log entry reads "the mechanism is confirmed: V2,
> V3, V4 guard `=== N`" — a mechanism, plainly stated, and THE DEFECT'S, not the claim's evidence.
> Counted as a hit it would have improved our own baseline through pure ambiguity.* **A confidently
> wrong name is worse than an obviously wrong one.**
>
> **AND THE FORM DOES THE WORK, NOT THE NAME: a value that is not a path with a line number is NOT
> FILLED.** *Mechanically checkable, which is the point.*

---

## SMOKE — THE STEP THAT CAN FAIL IS NAMED

**`http://localhost:8000/index.html`, seeded NORDLYS, `ns_show_parked` set.**

**Step 1 · REWRITTEN 22 SEP, BECAUSE AS SPECCED IT TESTED THE WRONG THING.** *The original entered
by `#/cfo` on the lane's claim that parked pages are URL-reachable. MEASURED FALSE: `validPages`
excludes the parked nine and the handler returns false, so `#cfo` falls through to home.*
`Belägg: index.html:4788–4804`. **It would have failed for a reason unrelated to this shipment —
and a step that fails for the wrong reason is the twin of a step that cannot fail.**

**The step that can fail:** with `ns_show_parked` set, open **CFO View from the sidebar**, then run
`showPage('cfo')` from the console. **The marker is present both times.** *Failure: it appears by
one route and not the other — the marker is attached to something route-specific rather than to the
router.*

**Step 2 · the control.** Open a **live** page — Compliance Calendar. **No marker.** *Failure: the
marker renders on live pages, which would make it worthless.*

**Step 3 · `suppliers` IS THE DESIGN'S OWN TEST CASE, AND IT IS A SAMPLE OF ONE.** After the build,
**nine of nine parked pages carry a marker on the page, and EXACTLY ONE of them also carries `WATCH`
in the nav.** `Belägg: index.html:4091`. **`suppliers` is the only entry in the product that will
carry both.**

**Open Supplier Audit and read it deliberately: does it say PARKED AND UNDER COMPLIANCE WATCH,
unambiguously, as two facts?** *If it holds, the design holds. If it does not, this is the only
screen where that shows* — **so it is looked at on purpose rather than hoped past.**

**THE TWO MEANINGS ARE UNRELATED AND MUST NOT BE READABLE AS ONE.** `WATCH` means compliance watch
and is CORRECT on `suppliers` exactly as it is on the live `skus` (4080). *The mark is uninformative
about SHIPPING STATUS — it is not uninformative. Nothing here is an argument for removing it.*

**NOT A TEST, AND IT SAYS SO: confirming that the nine are still filtered from the nav with the flag
off.** *Nothing in this shipment touches `getVisibleNav`'s filter; the step cannot fail.*
