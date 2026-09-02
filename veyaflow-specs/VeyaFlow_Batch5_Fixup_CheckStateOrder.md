# VeyaFlow — Batch #5 FIXUP: `checkState` lets a satisfied-test override an emitted blocker

**31 August 2026** · finding #52 · folds into the SAME batch #5 commit · `index.html` only

## VERIFICATION RESULT: **NOT GREEN — do not commit**

Everything else passed. Digests matched all three files, acorn clean (2 / 1 / 1 blocks), the diff is exactly ten hunks in the ten expected locations, `scoreReadiness` changed in exactly the two RP branches, `_rpDateExpired` is the single date implementation with four call sites, red is reachable only from `blocking`, the legacy path is muted, every standing guard holds, Truth Batch phrases 0 across all three files. The pack literals are gone and only survive inside your explanatory comments.

**One defect blocks the commit, and it is mine.**

## BASELINE

| File | sha256 |
|---|---|
| `index.html` | `c4fe98a77bcbecdbad97eb81f25a82a08166ad8f4aceb9b603bda87a89c983ff` |

`portal.html` (`b96423ac…`) and `brand/index.html` (`1e99d32c…`) are **correct — do not touch either.** The fix is entirely in `index.html`, in one function.

---

## THE DEFECT

`buildSkuReadiness`, ~L39281:

```js
function checkState(satisfied, ids){
  if(satisfied) return 'ok';                                                   // ← here
  for(var a=0;a<ids.length;a++){ if(lvlById[ids[a]]==='red')   return 'blocking';  }
  for(var c=0;c<ids.length;c++){ if(lvlById[ids[c]]==='amber') return 'attention'; }
  return 'not_recorded';
}
```

`satisfied` short-circuits **before any blocker is consulted**. So whenever the satisfied-test and the blocker disagree, the satisfied-test wins and the mark renders green.

That is not hypothetical. It happens on both of the checks where the two tests read different data:

### 1 — the expired RP renders ✓ (finding #50, unfixed on the buyer surface)

```js
checks.euRp = checkState(!!(sk.euRp || sk.euRpConfirmed || brandRp), ['euRpMissing','noRpUK','euRpExpired']);
```

`brandRp` is `!!(brand.euResponsible && brand.euResponsible.name)` — **existence, not currency**. Charlotte's lapsed agreement makes it `true`, so `checkState` returns `'ok'` and never looks at `euRpExpired`.

Your `scoreReadiness` work is correct: the amber blocker *is* emitted. It just never reaches the table. **The EU RP column still shows a green ✓ for an agreement nineteen months expired** — the exact mark this batch was written to remove, surviving inside the fix for it.

### 2 — a RED claim renders ✓ (worse)

```js
checks.claims = checkState(Array.isArray(sk.claimsApproved) && sk.claimsApproved.length > 0, ['redClaim','amberClaim']);
```

The satisfied-test reads **`sk.claimsApproved`**. The blocker at L6626–6629 reads **`sku.claims`** filtered against the active market rules. Different fields.

So a SKU with anything in `claimsApproved` *and* a claim flagged RED for that market renders a **green ✓ in the Claims column** — while `scoreReadiness` is simultaneously raising a red blocker and dropping the product out of the ready count. The card would name the product as blocked and the table beside it would tick the very check that blocked it.

`cpnp` and `ceMarking` cannot diverge — their satisfied-tests and blockers read the same fields — so those two are correct as written.

## WHOSE ERROR

**Mine.** The spec's derivation order says, step one: *"The check is satisfied in the SKU snapshot → `ok`."* You implemented what I wrote, faithfully.

The order is wrong because it contradicts the batch's own governing principle — *the table and the panel must speak from one source* — by giving a second, independent source the first and final word. It only became visible once `euRpExpired` created a case where "satisfied" and "no blocker raised" could come apart. Before this batch there was no such case, which is why the order looked fine when I wrote it.

---

## THE FIX — invert the order

```js
function checkState(satisfied, ids){
  for(var a=0;a<ids.length;a++){ if(lvlById[ids[a]]==='red')   return 'blocking';  }
  for(var c=0;c<ids.length;c++){ if(lvlById[ids[c]]==='amber') return 'attention'; }
  if(satisfied) return 'ok';
  return 'not_recorded';
}
```

**The emitted blocker is authoritative. The satisfied-test only speaks when the scorer raised nothing.** That is the single-source property the batch is for, and it removes the whole class of defect rather than patching the two instances.

**Change nothing else.** Not the `checks` object, not `lvlById`, not the framework gating, not the call sites, not `scoreReadiness`, not the portal.

### Every case after the inversion — confirm each

| Case | Blocker | Result | Correct? |
|---|---|---|---|
| CPNP on file | none | satisfied → `ok` | unchanged |
| CPNP missing, EU | `cpnpMissing` red | `blocking` | unchanged |
| CPNP missing, UK (SCPN) | `cpnpMissing` amber | `attention` | unchanged |
| CE marking on file / missing | none / red | `ok` / `blocking` | unchanged |
| RP current | none | satisfied → `ok` | unchanged |
| RP absent | `euRpMissing` amber | `attention` | unchanged |
| RP absent, UK | `noRpUK` red | `blocking` | unchanged |
| **RP expired** | `euRpExpired` amber | **`attention`** | **fixed** |
| **Claim flagged RED** | `redClaim` red | **`blocking`** | **fixed** |
| Claim flagged amber | `amberClaim` amber | `attention` | fixed |
| **No claims declared** | none | not satisfied → **`not_recorded`** | **#45 still resolves correctly** |
| Claims approved and clear | none | satisfied → `ok` | unchanged |

**The headline case of the whole batch — finding #45, "no claims declared renders muted, not red" — still resolves to `not_recorded` after the inversion.** Verify that specifically; if it does not, stop and tell me, because that case is the reason batch #5 exists.

### A note you do not need to act on

After the inversion, the `claimsApproved` / `sku.claims` field mismatch becomes harmless — the satisfied-test is only consulted when no claim blocker was raised, and in that state the claims genuinely are clear. **Do not "fix" the field names.** Mention it if you disagree.

---

## STOP. NO COMMIT.

## REPORT BACK

1. `checkState` after the change, quoted.
2. Functional confirmation of the four rows in bold above — expired RP, red claim, amber claim, and no-claims-declared.
3. Confirmation that nothing outside `checkState` changed — the diff against `c4fe98a7…` should be **one hunk**.
4. `sha256sum index.html` — full digest.

## VERIFY (coding chat, on the new file)

- diff against `c4fe98a7…` is **exactly one hunk**, inside `checkState`
- `if(satisfied) return 'ok';` appears **after** both blocker loops
- `portal.html` and `brand/index.html` **byte-unchanged**
- full batch #5 suite re-run from the top

## THEN

One commit for the whole of batch #5 — v1.0, v1.1, the L6587 ruling, and this fixup — with the message from the v1.1 spec. Then push, wait for Netlify, and run the smoke with **step 4 first**: the EU RP column must read **▲**, not ✓.
