# VeyaFlow — A′.5: the Brand Pack link's state is MEASURED, never asserted

**coding lane → CC · `index.html` ONLY · ONE EDIT: `renderMagicLinkCard`.**

> **SOURCE: coding-lane measurement, 5 October 2026 — NOT YET IN THE REGISTER.** *No hash exists to
> cite. The standing rule wants text + section + hash; this has the first only, and is marked as an
> expiring relay rather than presented as settled. The line is replaced when the section lands.*

> **STALENESS IS THE LANE'S, NOT YOURS.** *Checked against register HEAD at dispatch; the dispatch line
> carries that hash.*

**FOUND BY SMOKE, WHICH IS WHY SMOKE EXISTS.** *A′.1's battery was 57 GREEN. The browser showed a
withdrawn pack badged `LIVE` with a working Copy link, one screen above the row A′.1 had just repaired.*

---

## THE DEFECT — MEASURED, NOT INFERRED

`Belägg: index.html:renderMagicLinkCard` renders, in its "State 2: Link exists" branch:

```
<span style="…background:#D1FAE5;color:#065F46;…">Live</span>
```

**A hardcoded literal with no condition.** It renders whenever `brand.magicLinkUrl` is a non-empty
string. It reads **none** of: the row's `active`, its `expires_at`, or whether the row exists at all.

> **This is not a stale value. It is a constant wearing the clothes of a status.** *Worse than
> `onFile:true`, which was at least derived from something.*

**Measured ground truth, 2–5 Oct:** `shared_brand_packs` holds `total 1, aktiva 0`. The one row was
deactivated 2 Oct (`db/CHANGELOG.sql`, entry 2026-10-02); `get-brand-pack.js` returns 404 with *"This
link is no longer active or does not exist."*; the public page renders *Brand Pack not available*.
**The generator still shows `LIVE` and offers `Copy link`.**

**Four states the badge cannot distinguish:** active · deactivated · expired (`expiresInDays: 90`, so
the 31 Aug link expires 29 Nov 2026 and the badge will not notice) · row absent.

---

## THE EDIT — THE SAME RULING AS A′.1, ONE SCREEN UP

**A′.1 replaced a tick with state + date. This replaces a constant with state + time of check.**
*Confirmation is its own state — `checked_at` on the value, canon since 13 Sep.*

**Three states, never two, and never a default:**

| condition | the card renders |
|---|---|
| the link resolves | **`Checked <time> · live`** |
| the function answers 404 | **`Checked <time> · no longer active`** |
| the check could not be made | **`Not checked`** — *and this is the initial state, not an error* |

- **The check is a `GET` to `/.netlify/functions/get-brand-pack?id=<shareId>`** on render of the card.
  The body is discarded; only the status matters. *`get-brand-pack.js` answers 405 to anything but GET,
  so a HEAD probe is not available — name that rather than leaving the GET looking careless.*
- **`Not checked` is what renders before the answer returns and if it never does.** *It is an honest
  state, not a failure message, and it must not look like an error.*
- **The time is the time of the CHECK, never the time of generation.** `Generated 31 Aug 2026 · 34d ago`
  stays as it is — it answers a different question and it is already correct.

> **THIS IS NOT "VERIFYING AN ACCESS-CONTROL DEFECT AGAINST PRODUCTION."** *That standing constraint is
> about probing a policy. This asks our own link whether it is live, which is the link's entire purpose.
> Named so the two are not conflated later.*

## STOP CONDITIONS

- **STOP** if the card cannot make a network call on its render path without restructuring the renderer.
  *Report the constraint; a restructure inside a truth repair is two shipments.*
- **STOP** if `brand.shareId` is absent while `brand.magicLinkUrl` is present — **report how many brands
  are in that state.** *The URL contains the id, but parsing a UUID out of a string to make a status
  claim is the kind of inference this shipment exists to remove.*
- **STOP** if the fetch needs a credential. *It must not: the pack is public read by policy, scoped to
  `active = true`.*

## WHAT THIS SPEC DOES NOT TOUCH — AND BOTH ARE FINDINGS, NOT OMISSIONS

**1 · The pitch result card** (`index.html` ≈26244) prints the same URL with its own `Copy link`,
unchecked. **Same class, different renderer, its own judgement.**

**2 · `Belägg: index.html:getBrandMagicLink`, read at ≈16295, writes the URL INTO THE GENERATED PITCH
TEXT** — *End: "Full brand verification pack: `<url>`"*. **A withdrawn link is therefore substituted
into a document addressed to a buyer.** *That is the worst of the three and it is not a badge problem:
it asks whether a pitch may carry a link whose state nobody measured. **`RELÄ:STRATEGI` — that is a
ruling, not an edit.***

Also untouched: `#105`'s generation truncation · the honesty banner rendering its own placeholder
(`[HONESTY_BANNER_BRANDPACK: …]`, seen on the preview) · K17 · A′.2a, A′.2b, A′.3, A′.4.

---

## STANDING, UNTIL M1c HAS SHIPPED

> **NO BRAND PACK IS SHARED.** *Unchanged by this shipment — and this shipment is why the rule needed
> something behind it.*

## SMOKE — CHARLOTTE RUNS IT. STATED UP FRONT, NOT IMPLIED.

| field | value |
|---|---|
| entry point | the app at the origin where the catalogue lives → Brand Pack Generator, hard-reload first |
| **writer of the asserted string** | **`index.html:renderMagicLinkCard`** |

**Expect:** `Checked <time> · no longer active` — because the one existing row is inactive, measured.
**Must not appear:** the word `Live` · a green badge · any status with no time beside it.

**Report as text.** *A screenshot is a viewport, not a page.*

## REPORT BACK

The diff · **your** digest as your own computation · `verify.sh` at 57 GREEN, **1 of 11 modified** ·
`Belägg: <file>:<function name>` · the count from stop condition 2 if it fires · `OLÄST` for anything
unexamined.
