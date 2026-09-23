# VeyaFlow — #239 slice 3: a heading that cannot misdescribe its list

**23 September 2026 · coding lane → CC · ruled by Strategy**

**The shipment has one purpose:**

> **MAKE THE HEADING TRUE BY CONSTRUCTION, NOT TRUE TODAY.**

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN,
`0 of the 11 tracked surfaces modified`, exit 0. **Confirm all eleven before starting.**

---

## THE FINDING

**The ESG modal renders `MANDATORY REQUIREMENTS (1/3 MET)` over FOUR rows**, the first of which says
*"Not mandatory but strongly preferred"* in its own note. **Belägg:** `index.html:renderESGModal`,
the `mandatoryRequirements` block · `index.html:checkMandatoryESG`.

> **THE DENOMINATOR IS CORRECT, WHICH IS EXACTLY WHAT LETS IT PASS.** `1/3` counts only the
> mandatory ones. **A right count under a heading that contradicts its own list.**

**RULED: SPLIT THE RENDER. DO NOT RENAME AS THE FIX.** *A rename makes the name true TODAY. A split
makes the heading true BY CONSTRUCTION — each block is homogeneous, and no heading can misdescribe a
list containing only one kind.* **And the denominator decides it: either the list is homogeneous, or
the counter has to say what it counts — and a heading over a mixed list is precisely what cannot be
phrased honestly.** *The split also scales: the data already has three states, and a third block is
additive.*

---

## PART 1 · THE SPLIT

**Group `mandatoryRequirements` by state and render one block per non-empty group:**

| state | block heading |
|---|---|
| `required: true` | **Mandatory requirements** — `(met/total)` over ITS OWN members only |
| `required: false`, `preferred: true` | **Preferred** — its own count, if it carries one |
| `required: false`, `preferred: false` | **Neither required nor preferred** — see the copy note below |

**EACH COUNTER RANGES OVER ITS OWN BLOCK.** *Two counts over different sets with nothing checking
they count the same thing is #238's mechanism, and it is already live in this same function —*
**`checkMandatoryESG` counts `met` over ALL rows and `total` over REQUIRED rows only, so the modal
can render `4/3`.** *Fixing the denominator is in scope precisely because the split forces it: a
per-block count cannot be computed from a global `met`.*

**AN EMPTY GROUP RENDERS NOTHING — no heading, no empty state.** *A block that exists only to say it
is empty is noise; the honestly-empty ruling is about surfaces the user came to look at.*

**COPY FOR THE THIRD HEADING IS DESIGN'S AND MAY BE NOTHING AT ALL.** *Object-level rows took no
label because the eight notes carried four different facts. Whether a heading over a group is the
same question as a label on a row is NOT established — the group is defined by the data, the label
described it. Flagged, not assumed.*

---

## PART 2 · THE ITEM-LEVEL TAG — DISARMED IN THE SAME PASS, NOT LEFT AS A TRIGGER

```
${req.required ? 'REQUIRED' : 'PREFERRED'}
```

**Belägg:** `index.html:renderESGModal`, the item row template. **Measured 23 Sep: it does NOT read
`preferred`.** Same defect as the object-level ternary fixed in slice 1.

**Of 22 items, 19 carry `required:true` and 3 carry `required:false` — and ALL THREE happen to carry
`preferred:true`.** *The second branch tells the truth only because no item anywhere is neither.*

> **CANON: A DEFECT WHOSE TRIGGER IS CONTENT ENTRY IS WORSE THAN ONE WHOSE TRIGGER IS A CODE
> CHANGE.** *Content is entered by someone who does not review code, and **there is no diff that
> catches it**.*
>
> **AND A TRIGGER THAT COULD HAVE BEEN CLOSED FOR FREE IS A WISH WITH EXTRA STEPS.** *What arms it
> is content work; what disarms it is the same ternary we are already opening beside it.*

**Give the item tag the same three branches as the object level.** *Then it is correct by
construction instead of by luck.*

---

## PART 3 · RENAME `mandatoryRequirements` — SOURCE HYGIENE, AND IT IS A SEPARATE DEFECT

**The array is named `mandatoryRequirements` and contains a non-mandatory member.** *The split fixes
the SCREEN; it does not fix the NAME. The rename fixes the NAME; it does not fix the screen.*
**Neither substitutes for the other, and that is why both are here.**

**Report the new name as a proposal with the measurement behind it — do not apply it unasked.** *A
rename is an assertion about purpose and #220 established it is Strategy's. The measurement is
done: exactly 3 of 22 members carry `required:false`.*

---

## OUT OF SCOPE

- **Slice 3(a), the flattened conditional obligation.** *"Preferred: Tier 1 factory list **required**
  for private label" on a row where `preferred:true` is HONEST.* **The schema has one boolean where
  it needs a scope, and no label fixes a fact that is not binary.** #199's family. Build item.
- **`preferredCertifications`**, a third thing wearing the word `preferred` — an array of
  certification names, read by `prefCerts`. Untouched.

---

## REPORT BACK

1. All eleven digests before and after.
2. **The per-block counts, computed from the data**, for every retailer in `RETAILER_ESG` — how many
   blocks each one renders and what each denominator is. *If any retailer still produces a count
   whose numerator can exceed its denominator, the split did not fix #238's mechanism.*
3. **Every item's `(required, preferred)` pair**, so the third group's emptiness is measured rather
   than assumed.
4. **The proposed new name for the array**, with its reasoning.
5. Anything noticed and not fixed.

**`Belägg: <file:name>` or `OLÄST` on every claim about the code.**

---

## SMOKE — AND THE THIRD BRANCH CANNOT BE DEMONSTRATED ON THE PRODUCT

> **NAMED BEFORE A STEP IS WRITTEN, BECAUSE THIS LANE HAS WRITTEN FIVE UNRUNNABLE SMOKE STEPS:
> NO ITEM ANYWHERE CARRIES `required:false, preferred:false`.** **The third block and the item tag's
> third branch RENDER NEVER against seeded data.**

**So Part 2 is a GUARD, not a visible fix, and the spec says so rather than pretending otherwise.**
*It may be demonstrated against a synthetic item — and if it is,* **that object is CC's construction,
not the product's, and the report must say so in the same line as the result.**

**Step 1 · the step that can fail.** `openESGModal('apotek_hjartat_se')` — the only retailer with a
mixed list. **ISO 14001 sits under its own heading, separate from the mandatory block, and the
mandatory count reads over three rows, not four.** *Failure: one heading over four rows again.*

**Step 2 · the control, failing in the opposite direction.** `openESGModal('lyko_se')` — a
homogeneous list, both items `required:true`. **ONE block, heading unchanged, count over two.**
*Failure: a second empty block appears, which would mean empty groups are rendering.*

**Step 3.** `openESGModal('kicks_se')` and `openESGModal('douglas_de')` — the other two carriers of a
`required:false` item. **Same split as step 1.**

**Step 4 · the denominator.** Any retailer where every mandatory item is met. **The count reads
`n/n`, never above.** *This is #238's mechanism and it is the one step that tests the counter rather
than the heading.*

**NOT A TEST, AND IT SAYS SO:** confirming the modal opens. *Nothing here touches `openESGModal`.*
