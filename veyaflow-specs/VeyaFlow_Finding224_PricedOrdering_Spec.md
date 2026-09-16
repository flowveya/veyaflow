# VeyaFlow — #224: a listing tier that sells sort position, and sells the word "Verified"

**16 September 2026 · coding lane → CC · the ruling already exists**

**This spec carries no new ruling. #218 settled it on 16 September:**

> **VEYAFLOW TAKES NO COMMERCIAL CONSIDERATION THAT AFFECTS ORDERING.**

**The RP tier was the first instance and shipped at `10f87a8`. This is the second, and it is worse:
the RP tier was a HIDDEN ordering with no price in the code. This one prices it, and what the
4,900 tier buys is the word `✓ Verified`.**

**The work is deletion.**

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`a2bacfe9b4c68ccea63b9b59d363067fa517e474c8c7d97e232cf2f57eb237a8`, branch `f2b-async` at
`380ec3f`. **Confirm all eleven. Only `index.html` moves.**

*If the margin batch has landed first, request the current value from the lane — do not read a digest
out of a CC report.*

---

## WHY THIS ONE IS TAKEN NOW, AND THE REASON IS NOT ITS SIZE

**Three windows are open. This one's trigger is a different KIND.**

| window | closes when | visible? |
|---|---|---|
| #229 | the design channel applies the redesign to the SKU form | **yes — the work is on the board** |
| the brand-pack attribution | the first real brand pack goes to a buyer | **yes — a scheduled event** |
| **#224** | **somebody decides to charge for a listing** | **NO** |

> **A window that closes because of WORK can be seen coming, because the work is on the board. A
> window that closes because of a DECISION cannot.**

---

## THE MECHANISM

```js
36258  const LISTING_TIERS = {
         free:     {label:'Free',     badge:null,         color:'#9A9489', sortBoost:0,  price:0},
         verified: {label:'Verified', badge:'✓ Verified', color:'#1E40AF', sortBoost:10, price:4900},
         featured: {label:'Featured', badge:'★ Featured', color:'#C4A882', sortBoost:25, price:9900},
       };
36263  const MFR_LISTING_TIERS = {1:'free',2:'free',…};   // all twelve
36264  function getMfrTier(id){ return MFR_LISTING_TIERS[id]||'free'; }
```

**It contradicts both standing rulings at once:**

- **#218** — `sortBoost: 10` and `sortBoost: 25` ARE commercial consideration affecting ordering.
- **#219** — *"vetted" requires a record.* **Here `Verified` requires a PAYMENT.**

**Inert today for two reasons, and NEITHER is the ruling:** every manufacturer maps to `'free'`, and
the surface it serves (`find`) is in `PARKED_IDS`.

---

## BEFORE EDITING — THE CENSUS

**1. Every reader of `LISTING_TIERS`, `MFR_LISTING_TIERS` and `getMfrTier`.** Line, function, and
what it does with the value. **`sortBoost` is the one that matters; report `price`, `badge`, `color`
and `label` separately** — *they may have consumers the ordering does not.*

**2. Every other sort comparator in the file that reads a tier, rank, boost or priority derived from
anything we would charge for.** *The RP tier was found by reading one function. This one was found by
a residual scan an hour later. **Ask whether there is a third.***

**3. Report before editing.** **If `sortBoost` has no reader at all, say so** — a priced ordering
that nothing implements is a different finding from one that runs, and the deletion is the same
either way.

---

## THE EDIT

**Delete `sortBoost` and `price` from `LISTING_TIERS`, and delete every use of them.**

**DELETED, not flagged, not commented out, not moved behind a feature flag.** *A mechanism preserved
behind a flag is the same decision in code that the ruling overturned — #218's spec said so and CC
honoured it; the same applies here.*

**Leave a comment recording the ruling and its date**, so the next person to consider a paid ordering
**finds the ruling rather than the mechanism.** *The honest use of a comment is to record a decision
that lacks code — canon, 16 Sep.*

### THE `Verified` BADGE IS A SEPARATE QUESTION AND MUST NOT COLLAPSE INTO THIS ONE

**`badge: '✓ Verified'` on a paid tier is #219's problem, not #218's.** **Report it; do not decide
it here.**

**And note the same badge string exists at `index.html:16425`**, driven by `p.status === 'verified'`
on the RP partner card. **That one is in the `RP_PARTNERS` trigger** *(register, 16 Sep)*.

> **Removing the tier does not remove the badge. Two register items, one surface — they must not
> collapse into "fixed".**

---

## OUT OF SCOPE

- **Deciding what "verified" means.** Unruled, Strategy's, and it blocks nothing here.
- **Un-parking or touching the `find` surface.**
- **`MFR_LISTING_TIERS`' contents** — all twelve are `'free'`; leave the map.
- **The margin batch · #220 · #199 · #226 · #227.**

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **The census, before editing** — readers of each field separately, and whether a third priced
   ordering exists anywhere.
3. What the comparator does after the deletion, and **evidence no ordering reads a purchasable
   value.**
4. **The `Verified` badge's occurrences and their drivers.** Report only.
5. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1. Ten other surfaces unchanged.

---

## SMOKE — ORIGIN NAMED

**`http://localhost:8000/index.html`, seeded NORDLYS, `ns_show_parked` set true so `find` renders.**
*Reset it afterwards.*

**Step 1.** The manufacturer directory renders and its order is unchanged from today. *All twelve
are `'free'`, so today's order is already boost-free — **this step cannot fail, and is here only to
prove nothing else broke.***

**Step 2.** In a scratch copy only, set one manufacturer to `'verified'` and one to `'featured'`.
**Before the edit, the order moves. After it, the order does not.** *This is the step that can fail.*
**Revert the scratch change; it must not be committed.**

**Step 3.** Grep the tree for `sortBoost` and `price:` within `LISTING_TIERS`. **Zero occurrences.**
