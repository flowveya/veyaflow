# VeyaFlow — #220 and #243: the market lists say what they are, and the one membership test uses the membership list

**21 September 2026 · coding lane → CC · ruled by Strategy**

**Three renames, one hoist, one repoint. One neighbourhood, one digest.**

**This shipment GATES #214/#230's re-spec**, which runs through seven `rspCanonical` call sites in
the same code. *Sweeping that neighbourhood while three lists still carry misleading membership
names is the merge scenario — the widening gets installed by the work meant to clean up.*

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`f36d7f664d0d13e0f5f05521b96499f72e6095820098d6d38f80c25bc2515795`, branch `f2b-async` at
`2c3cdec`, clean tree, 57 gates GREEN. **Confirm all eleven. Only `index.html` moves.**

---

## THE RULING THIS IMPLEMENTS — AND THE ONE IT MUST NOT BREAK

> **DIVERGENCE IS EVIDENCE. The four lists are NOT merged.**

**Measured 17 Sep:**

| list | entries | what it actually is |
|---|---|---|
| `EU_EEA` (1952) | **30** | **the correct membership set** — EU 27 + Norway, Iceland, Liechtenstein |
| `EU_RP_MARKETS` (16641) | 16 → **15 unique** *(Denmark twice)* | the markets we hold RP data for |
| `EU_MKTS` (7959) | **11** | the markets the radar has rows for |
| `isEU` (24551) | **6** | Denmark, Germany, Netherlands, France, Belgium, Austria |

> **Three of the four are COVERAGE lists wearing a MEMBERSHIP name.** Merging them onto the correct
> one would silently widen three coverage checks into EU-wide assertions. **Do not merge them.**

---

## PART 1 · THE RENAMES — AND THEY GO FIRST IN THE SAME EDIT

**A rule saying *do not merge `EU_MKTS`* is a policy. A name saying `RADAR_MARKETS` makes the merge
unthinkable.**

| from | to | why |
|---|---|---|
| `EU_MKTS` (7959) | **`RADAR_MARKETS`** | the markets `COMPLIANCE_RADAR_ITEMS` has rows for |
| `EU_RP_MARKETS` (16641) | **`RP_DATA_MARKETS`** | the markets we hold RP data for |
| `isEU` (24551) | **NOT RENAMED IN THIS EDIT — GATED ON MEASUREMENT** | see below |

### THE THIRD RENAME IS GATED, AND THE REASON IS THE NAME ITSELF

**`hasLandedCostData` was the lane's guess, marked as one. Strategy gated it:**

> **A rename is an assertion about PURPOSE — the most durable kind we make.** It outlives comments,
> it is the first thing the next person reads, **and it is never quoted with a caveat.**

> **CANON: A CONFIDENTLY WRONG NAME IS WORSE THAN AN OBVIOUSLY WRONG ONE.** `EU_MKTS` is suspect the
> moment anyone knows to look. **`hasLandedCostData` would look SETTLED — and a settled name ends the
> investigation.** *An error that flatters, on the naming axis.*

**So: MEASURE IT AND REPORT. Do not rename it.** *That "one edit" is tidier is not a reason to press
a guess into a name.*

**Each rename carries a one-line comment stating what the list IS and what it is NOT.** *The honest
use of a comment: record a decision that lacks code.*

**`EU_RP_MARKETS` lists Denmark twice** — *hand-maintained. Deduplicate while renaming; report it,
do not treat it as the finding.*

---

## PART 2 · THE HOIST — AND ITS NAME IS THE GUARD

**`EU_EEA` is declared `var` INSIDE `regMarketApplies` (1952), so nothing outside can reach it.**

**Hoist it to a module-level `const`, named `EU_EEA_MEMBER_STATES`**, with a comment saying:

> **This is the membership list. It is the only one. Coverage lists are named for what they cover.**

**Why the name matters more than the move:** *hoisting makes it globally reachable, which is the
condition that produced the other three lists.* **The renames in Part 1 are what make this safe, and
that is why they are in the same edit.**

**`regMarketApplies` then reads the hoisted constant.** **Its behaviour must not change** — smoke
step 1 checks this.

---

## PART 3 · #243 — THE REPOINT. THIS IS THE CORRECTNESS FIX.

```js
16652  const euIntent = markets.some(m => EU_RP_MARKETS.indexOf(m) >= 0);
16659  const hasGap = activeStage && missingRp && euIntent && cosmeticSkus > 0;
```

**The RP requirement is EU/EEA-wide — one responsible person for the whole area.** *(Source:
Strategy research, 21 Sep — secondary sources, consistent, not the regulation text. **No article
number goes on any buyer-facing surface**; standing rule unchanged.)*

> **Today: a brand targeting Poland is told it needs an RP. A brand targeting Czechia is not.**
> **#230's INVERSE — that one manufactures an obligation, this one DELETES a real one.**

**Point line 16652 at `EU_EEA_MEMBER_STATES`.**

> **This is not unification. It is correcting WHICH QUESTION IS ASKED.** `RP_DATA_MARKETS` stays,
> renamed, for whatever legitimately needs *the markets we hold RP data for*. **Report every other
> reader of it.**

**AND DO NOT TOUCH `cosmeticSkus` (16657).** It resolves through `resolveProductFramework` and its
comment states the contract: *an unstated type is `unknown`, not a cosmetic.* **It is the reference
implementation for #240's later fix and must survive byte-identical.**

---

### RULED — WHAT A CZECHIA-TARGETING BRAND SEES, AND THE ABSENCE IS SPLIT

**The fix is unambiguously an improvement and that is stated before anyone hesitates:**

> **Telling someone a true thing she cannot act on is better than a false one that lets her continue
> unlawfully. The obligation is real whether or not we can help with it.**

**But the rendering splits on WHOSE ABSENCE IT IS:**

| | whose | so |
|---|---|---|
| **the obligation** | **hers** | **the banner stands** |
| **no RP partner for Czechia** | **ours** | **honestly empty — never silently empty** |

**"We have no RP partners registered for Czechia."** *Never an empty list, which reads as "no options
exist."*

> **NON-NEGOTIABLE: AN EMPTY MARKETPLACE MUST NOT READ AS "NO RP IS NEEDED."** **Absence read as its
> opposite, in the one direction that makes the whole fix pointless.**

**And this is the first time the product says something true it cannot help with.** *The honesty
discipline has been about not claiming more than we know; the grown-up version is being useful about
our own limits.* **A maturity marker, not a defect.**

---

## OUT OF SCOPE

- **Merging any two lists.** The ruling stands.
- **#240's fix at 37395.** Referenced here, fixed elsewhere.
- **Building the honestly-empty RP-marketplace state** *(ruled below — report what renders today; the
  copy is Strategy's and the build is its own item).*
- **#214 / #230 / #233 / #242 / #227.**

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **Readers discovered BY the rename, as their own item.** *A rename breaks every reader that is not
   updated — so the run produces the enumeration MECHANICALLY. Canon says an enumeration is a lower
   bound until something mechanical produces it; **this is the producer.** Any site none of us knew
   about is a finding in itself.*
3. **What the six-market `isEU` list actually gates — measured, not guessed. DO NOT RENAME IT.**
4. **Every other reader of `RP_DATA_MARKETS`** after the repoint.
5. **What a brand targeting one of the 15 previously-missing states sees today** — the banner, and
   **the question that decides the follow-on build: CAN the RP marketplace REPRESENT "we hold none
   for this market" AS A STATE, or does it only have an empty array that renders to nothing?**
   *Report only. Without that state there is nowhere to write the sentence, so this answer is what
   unlocks the copy — and the copy is Strategy's.*
6. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1. Ten other surfaces unchanged.

---

## SMOKE — ORIGIN NAMED

**`http://localhost:8000/index.html`, seeded NORDLYS** *(Sweden, Norway, Denmark, Finland)*.

**Step 1 · the hoist changes nothing.** The Compliance Calendar and the deadline strip render
**exactly as today** — same rows, same counts. *`regMarketApplies` reads a hoisted constant instead
of a local one; if anything moves, the hoist changed a value.*

**Step 2 · NORDLYS is unaffected by #243.** All four of her markets were already in
`RP_DATA_MARKETS`. **The RP banner behaves exactly as today.**

> **THIS STEP CANNOT FAIL. It is a NOTE, not a test** — written out so it is not counted as evidence.
> *A smoke step that cannot fail is not a test; saying so in the step is what stops it being read as
> coverage.*

**Step 3 · the step that can fail.** Set `brand.targetMarkets` to include **Czechia** and clear the
RP name. **The RP gap banner appears.** *Before this shipment it does not.* **Then remove Czechia —
the banner goes.**

**Step 4 · the radar did not move.** With `RADAR_MARKETS` renamed, the Compliance Radar renders the
same rows for the same brand. *A rename that changes behaviour is not a rename.*
