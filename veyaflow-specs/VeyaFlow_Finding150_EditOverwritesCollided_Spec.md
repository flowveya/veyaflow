# VeyaFlow — #150: editing a collided SKU destroys a different product

**9 September 2026 · coding lane → CC**

**Stop the loss. This is not the fix.**

#148 Part 1 stops new collisions. **Existing catalogues are still losing records through normal
use, today, with no backup and no delete path to undo it.** The back-fill is the repair and it
is not specified yet. This shipment stops the destruction while that is designed.

Same shape as #134 → #135: **first stop the harm, then enable the correct behaviour.**

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           93139858c820002eedc5fa1ec95359d21632237a38c1d13710817bb835e1c81a
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `dba9bcc`. **Confirm all six. Only `index.html` moves.**

---

## THE MECHANISM, STATED PRECISELY

`index.html:20254–20255`:

```js
const idx = skus.findIndex(s=>s.id===skuEditId);
if(idx>=0) skus[idx]={...skuForm};
```

In a colliding group of N, `findIndex` returns **member 1** for every member. And the editor
loads by `find`, so it also shows member 1.

**So the sequence is:** the user opens what the list labels product 57 → **is shown product 1's
data** → edits it → **saves it over product 1.**

Members 2…N are **permanently unreachable** — no path in the app resolves to them, and there is
**no delete path for SKUs at all**. Member 1 is the one that gets destroyed.

**Nothing warns. Nothing fails. The save reports success.**

---

## IMPLEMENT — REFUSE, DO NOT REPAIR

**A save that cannot identify its target must not write.**

Before the write, count matches: `skus.filter(s=>s.id===skuEditId).length`.

- **Exactly 1** — proceed unchanged. This is every uncollided catalogue and must be
  byte-identical in behaviour.
- **More than 1** — **refuse the write**, keep the user's form open so nothing they typed is
  lost, and tell them plainly what happened and that it is not their fault.
- **0** — existing behaviour (`if(idx>=0)`) already skips silently. **Report whether that
  silence is right**; do not change it here.

**The message is DESIGN's to finalise**, but it must say three things: this product shares an
identifier with others, the app cannot tell which one is meant, and **nothing has been
changed.** Propose wording using vocabulary already in the file; do not invent a register.

**Do not attempt to disambiguate.** Not by index, not by name, not by position in the list.
**The system does not choose** — Strategy's ruling, and this is exactly the case it covers.

---

## THE COST, STATED IN ADVANCE

A brand with a collided catalogue **cannot edit those products** until the back-fill runs.

That is worse than it sounds and better than what happens now: **today they can edit them, and
doing so destroys a different product.** Refusing is strictly better than silently corrupting,
and it makes a defect the user cannot currently see into one they can.

---

## REPORT, DO NOT IMPLEMENT

1. **Whether the guard belongs at open rather than save.** Opening already shows the wrong
   product's data — arguably the deception starts there. **The lane's instinct is that
   refusing at save is the minimum and refusing at open may be more honest**, but blocking the
   editor may also block the only route a user has to understand what is wrong. Report the
   trade; do not choose.
2. **Every other write path keyed by a `find`/`findIndex` on `skus`.** `saveSkuEdit` is one.
   `publishDPP`, the CPNP flow, WEEE registration, the DPP field saves — **any of them that
   writes** has this shape. **The count is the finding**, and each one is a separate
   destruction path.
3. **Whether the same defect exists on any other collection** — `retailSubmissions`,
   `sourcingCRM`, `crmCards`. #151 established `addToSourcingCRM` shares the generator; if it
   also has a `findIndex`-write, it has this defect too.

---

## OUT OF SCOPE

- **The back-fill.** Still unspecified, still needs the reports from #148 Part 2.
- **#151's fix.** Separate.
- #147, #143, #135, M2–M4.

---

## STOP. NO COMMIT.

One guard. Three reports.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. Before/after for the guard.
3. **Evidence an uncollided save is byte-identical in behaviour** — the overwhelming majority
   case must not change at all.
4. **Evidence a collided save now refuses**, measured: construct a colliding pair, attempt a
   save, show that neither record changed.
5. The three reports. **Report 2's count is the finding.**
6. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `93139858`; five others UNCHANGED; `1 of 6
modified`.

---

## SMOKE

**Step 1.** Edit any SKU in a normal catalogue. Saves exactly as before.

**Step 2.** With a collided catalogue, open one of the duplicates and attempt to save. **The
save is refused, the message explains why, and the form stays open.**
*Failure: a successful save. That is the defect.*

**Step 3 — the one that proves nothing was lost.** After the refusal, reload. **Both records
are unchanged.**
