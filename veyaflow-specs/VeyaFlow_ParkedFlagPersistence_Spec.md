# VeyaFlow — X-ray mode remembers which page you were on

**1 October 2026 · coding lane → CC · ruled by Strategy · DEV-ONLY, SMALL**

**The shipment has one purpose:**

> **WITH `ns_show_parked` SET, A RELOAD KEEPS YOU ON THE PAGE YOU WERE ON.**

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN,
`0 of the 11 tracked surfaces modified`, exit 0. **Confirm all eleven before starting.**

---

## WHY THIS AND NOT THE OTHER FIX

**The irritation: every reload on a parked page drops to Brand Home**, because `#cfo` is not in
`validPages` and the boot route falls through. `Belägg: index.html:handleDeepLink`,
`index.html:init`.

**THE CODING LANE PROPOSED DERIVING `validPages` FROM NAV. STRATEGY CORRECTED IT, AND THE CORRECTION
SEPARATES TWO THINGS THE LANE HAD BUNDLED:**

> **RULED 1 OCT: `validPages` REMAINS THE LIST OF PUBLISHED SURFACES. `ns_show_parked` EXTENDS IT AT
> RUNTIME, NEVER IN THE DECLARATION.**
>
> **AND `parked` HOLDS ONE MEANING: NOT SHIPPED.** *Not "not in the nav", which is a navigation
> fact.*

**DERIVING FROM NAV WOULD PUT THE PARKED NINE IN THE DECLARATION — it moves the publishing
boundary.** *An unshipped surface would then be **one link away from anyone**, and in X-ray mode a
parked page is not distinguishable from a live one without the marker.* **Demo-data's class: an
unshipped page rendered as a shipped one asserts a capability we do not have.**

**THE GUARD SITS AT THE ENTRANCE AND INHERITS — #197's axis unchanged.** *Widening the allowlist to
cure a reload annoyance would change what parking IS, as a side effect of convenience.*

**#226 STAYS OPEN AND SEPARATE.** *Four LIVE pages cannot be deep-linked — `rp-marketplace`,
`compliance-cal`, `seasonal`, `buyer-docs` — and deriving from NAV is still the structural answer
for them.* **That is a different defect with a different fix, and it does not ride here.**

---

## THE MECHANISM — A THIRD BRANCH, NOT A CHANGE TO EITHER EXISTING ONE

**Measured boot order.** `Belägg: index.html:init`:

```js
if(!handleDeepLink()){
  showPage('home');
}
```

*The comment there records why the order matters:* **`showPage` → `setDeepLink` writes the hash, so
`handleDeepLink` must read it first.** *That is also why the hash showed `#cfo` after a console
`showPage('cfo')` — the hash was a consequence of navigating, not the route into it.*

**THE EDIT ADDS A THIRD BRANCH BELOW BOTH:**

```js
if(!handleDeepLink()){
  if(!restoreParkedPage()){
    showPage('home');
  }
}
```

**FOUR CONSTRAINTS ON `restoreParkedPage`, AND EACH IS WHAT KEEPS THIS DEV-ONLY:**

1. **It returns false immediately unless `ns_show_parked === 'true'`.** *With the flag off, the
   function is inert and the boot path is byte-for-byte what it is today.*
2. **IT RESTORES ONLY A PARKED ID.** *It asks `isParkedSurface`, never a list of its own.* **A live
   page already routes through `validPages`; restoring live pages would be a SECOND ROUTING
   MECHANISM beside the first — the defect this shipment exists to avoid.**
3. **An explicit hash always wins.** *It runs after `handleDeepLink`, so a URL the user typed beats
   a page the app remembered.*
4. **It changes nothing about what is REACHABLE.** *No id is added to `validPages`. A parked page is
   still unreachable by URL on a cold load; the only thing that changes is that X-ray mode does not
   forget where you were.*

**THE WRITE SIDE:** `showPage` records the id **only when the flag is set and the id is parked**.
*One key, named for what it is.* **Nothing is written in production, so nothing to migrate and
nothing to evict.**

---

## OUT OF SCOPE

- **`validPages`, `handleDeepLink`, and #226.** *Untouched — and the report must confirm it.*
- **The parked marker.** *It already states what a parked page is; this changes nothing it renders.*
- **Any live surface.**

---

## REPORT BACK

1. All eleven digests before and after.
2. **Proof the flag-off path is unchanged** — ideally that `restoreParkedPage` returns false before
   touching anything when `ns_show_parked` is absent.
3. **`validPages` byte-identical**, and `handleDeepLink` unchanged.
4. **Which key the page id is stored under**, and confirmation it is written only under both
   conditions.
5. Anything noticed and not fixed.

**`Belägg: <file:name>` or `OLÄST` on every claim about the code.**

---

## SMOKE — EVERY STEP NAMES ITS ENTRY POINT

**Step 1 · the step that can fail. ENTRY: console on `localhost:8000`.**
`localStorage.setItem('ns_show_parked','true')`, reload, `showPage('cfo')`, **then reload again.**
**You stay on CFO View.** *Failure: it drops to Brand Home — the restore did not fire.*

**Step 2 · the control, and it fails in the opposite direction. ENTRY: console.**
`localStorage.removeItem('ns_show_parked')`, reload. **You land on Brand Home.** *Failure: a parked
page is restored with the flag off, which would mean X-ray mode leaked into the normal path.*

**Step 3 · the hash still wins. ENTRY: the URL bar.** With the flag set and CFO remembered, load
`index.html#claims` directly. **You land on Claim Localizer, not CFO.** *An explicit route beats a
remembered one.*

**Step 4 · nothing became reachable. ENTRY: the URL bar, flag OFF.** Load `index.html#cfo`.
**You land on Brand Home**, exactly as today. *`Belägg: index.html:validPages` — the parked nine are
still excluded, and this shipment did not change that.*
