# VeyaFlow — #133: fields that are read and never written

**9 September 2026 · coding lane → CC · Strategy's sweep instruction**

**REPORT ONLY. NO EDITS. NOT ONE LINE.**

`brand.certifications` has **seven readers and zero writers**. That is the same shape as
`smartEmpty` — a ~90-line empty-state system never called — and the dead render block at
L34732 whose filter tests keys that do not exist. **Surfaces built for data that was never
connected.**

Strategy: *same rule as #108, applied to data flow instead of prompt instructions.* #108 says
raise a boolean-regime-proxy on sight. This says: **a field with readers and no writer is a
surface asserting a capability the product does not have.**

**Mechanically checkable, and it finds the whole class at once** rather than one instance per
week.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           c8a754f2695427c8dc249d53caa3c079e9d176618fdf1c1cd272c8d0adcd0aea
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `fc5f6d7`. **Confirm all six, and confirm all six identical afterwards.**
The tree must hash the same at both ends, and that is checkable.

---

## THE SWEEP

**For each of the app's own state objects, enumerate every property READ and every property
WRITTEN. Report the properties read and never written.**

The state objects, to be confirmed rather than trusted — CC has found the lane's lists
incomplete in two consecutive shipments:

`brand` · `skus` / `sku` / `skuForm` · `dppData` · `retailChecklistState` ·
`retailPerformance` · `retailComms` · `onboardForm` · anything else persisted under an `ns_`
key.

**Use the AST.** `verify.js` already parses both blocks with acorn. A textual sweep will
mis-count optional chaining, computed access and destructuring — and this file has all three.

**Writes include**: assignment, `Object.assign`, spread into a new object that is then
assigned, `push` onto an array property, and **arrival from storage or the network** —
`JSON.parse(localStorage…)`, a proxy response, a seed literal. **A field written only by the
seed is not "written" for this purpose if no user path can produce it**; say which category
each falls into rather than collapsing them.

---

## WHAT COUNTS AS A FINDING, AND WHAT DOES NOT

**A finding:** readers exist, no writer exists, and **a surface renders or gates on it.**
`brand.certifications` qualifies — seven readers, and an empty state that sends the brand to a
field that does not exist.

**Not a finding:** a field read only defensively (`x.foo || fallback`) where the fallback is
the designed behaviour and nothing tells the user the field is missing. **Say which of these
you are looking at** — the difference is whether a user is misled, not whether a property is
absent.

**The distinction that matters most:** does anything **instruct the user to supply it**?
Strategy's ruling — *a "what remains" message must be gated on the thing it points to
existing* — makes that the sharp edge. **A dead field behind a call-to-action is a broken
promise; a dead field behind silence is dead code.**

---

## REPORT

1. **The count.** Read-never-written properties, per state object. **The count is the finding**
   — if it is two, we fix two; if it is thirty, the pattern is architectural and the answer is
   not thirty fixes.
2. **Which of them have a user-facing call-to-action pointing at them.** Rank by that, not by
   reader count. `brand.certifications` is presumed first; say if it is not.
3. **Whether `smartEmpty` and L34732 belong to this class or are a different one.** They are
   *code* never reached rather than *fields* never written. If the sweep's method finds them
   too, the class is wider than Strategy framed it and that is worth knowing.
4. **Whether any field is written ONLY by the seed** — present for the demo brand, impossible
   for a real one. That is a third category, and arguably the worst, because it works in every
   demo and fails for every customer.
5. **What this sweep cannot see.** Fields arriving from `localStorage` written by an older
   build; fields written only by a Netlify function. State the blind spots so the count is not
   over-trusted.

---

## OUT OF SCOPE

- **Every fix.** This is a scout. Nothing is repaired here, including
  `brand.certifications` — that belongs to M4, which ships the schema and the empty state
  **together**, per Strategy's ruling.
- M2, M3, M4.
- Third-party reference data. A registry field with no writer is *data*, not a broken promise.

---

## STOP. NO EDITS AT ALL.

Not a comment, not whitespace. Six digests identical at both ends.

---

## REPORT BACK

1. sha256 of all six before and after — **identical**.
2. The count, per state object, with the method stated.
3. The call-to-action ranking.
4. Reports 3, 4 and 5.
5. Anything noticed and not fixed.

---

## VERIFY

**Do not run `./verify.sh`.** Nothing was edited, so it would compare the tree against itself —
the precedent set on #121. Report the six digests instead; that is the check that can fail
here.
