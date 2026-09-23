# VeyaFlow — #239: eight rows are labelled "Preferred" when the data says they are not preferred

**23 September 2026 · coding lane → CC · ruled by Strategy**

**The shipment has one purpose:**

> **STOP ASSERTING A PREFERENCE THE DATA DOES NOT HOLD.**

**This is slice 1 of three, and the other two are deliberately not here.** *Slice 2 is a rendering
judgement Strategy reserved. Slice 3 is a schema build item. A judgement dropped into a mechanical
batch makes the batch only as well verified as the judgement — batch by whether a judgement is
required, not by file or size.*

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN,
`0 of the 11 tracked surfaces modified`, exit 0. **Confirm all eleven before starting.**

*This block names the SOURCE, never a copy of its values — a copied digest went two shipments stale
in #227's spec and a two-shipment-old baseline made the census spec unstartable. Cite the source,
not the number.*

---

## THE MECHANISM, CITED

```
Belägg: index.html — renderESGModal, the carbonTransparency row
        ${esg.carbonTransparency.required?'<strong>Required</strong>':'Preferred'}: ${note}
Belägg: index.html — renderESGModal, the supplyChainTransparency row
        ${esg.supplyChainTransparency.required?'<strong>Required</strong>':'Preferred'}: ${note}
Belägg: index.html — RETAILER_ESG, the eight objects carrying preferred:false
        lyko_se · kicks_se · dm_de · nordicfeel_se, carbon + supply chain each
Belägg: index.html — RETAILER_ESG, the ten objects carrying preferred:true
        apotek_hjartat_se · matas_dk · douglas_de · sephora_eu, and the item-level entries
```

*Line numbers deliberately omitted: they moved 46 lines in the last shipment alone, and a citation
is a NAME that survives an insertion. The two render sites are the only two places in the file
where the string `'Preferred'` follows a `required` ternary.*

**THREE STATES ARE ENCODED IN TWO BRANCHES.** `required:true` · `required:false, preferred:true` ·
`required:false, preferred:false`. **The ternary reads `required` ONLY and never reads `preferred`,
so the third state renders as the second.** Both combinations genuinely exist in the data — ten
`preferred:true`, eight `preferred:false` — so the field distinguishes something the render discards.

> **MEASURED ON SCREEN 23 SEP, SIDE BY SIDE, SAME TWO ROWS:**
> **Lyko** — *"Preferred: Not currently required. Watch for 2027 requirement."*
> **Apotek Hjärtat** — *"Preferred: Scope 3 reporting preferred from 2026."*
> **One of those is true.**

---

## THE EDIT

**Both render sites take a third branch:**

| data | label |
|---|---|
| `required: true` | **`Required:`** — unchanged, including the `<strong>` wrapper |
| `required: false`, `preferred: true` | **`Preferred:`** — unchanged |
| `required: false`, `preferred: false` | **NO LABEL. The note alone.** |

**NO THIRD LABEL, AND THE REASON IS MEASURED, NOT STYLISTIC.** *The eight notes were read. They
carry FOUR different facts: **not required YET** with a named date · **not required FOR THIS SCOPE**,
which implies it IS required for another · **not tracked at all**, which is the retailer not
collecting it · and **flatly not required**. One word over those four would assert a shared class
that does not exist —* **manufacturing exactly the fact the label was meant to stop manufacturing.**
*It also dissolves the repetition problem: "Not required: Not currently required…" cannot occur when
there is no label to repeat.*

**THE `preferred` FIELD IS USED, NOT DELETED.** *This item stood in the register for days as
"`preferred` read by nothing — subtraction, no ruling." That was the wrong locus and the opposite
action:* **deleting `preferred` would make *not preferred* permanently indistinguishable from
*preferred* — the collapse locked in rather than removed.** *A field is for what cannot be
re-measured; here the field is the only thing that can tell the third state from the second.*

**OUT OF SCOPE, AND NEITHER IS A POLISH NOTE:**

- **The item-level tag** on `mandatoryRequirements` entries. *Almost certainly the same two-branch
  ternary, but* **no item anywhere carries `preferred:false`**, *so it produces no false label today.
  Whether it reads `preferred` at all is `OLÄST`.*
- **Everything in slice 2 and slice 3 below.**

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **Both render sites changed, and no third site found.** *If a third `required ? … : 'Preferred'`
   exists anywhere, report it — the lane's first grep for this pattern returned ZERO because it
   assumed spaces around the `?` and `:`. A zero result is a claim about the pattern, never about
   the tree.*
3. **Counts, from the data rather than from this spec:** how many objects carry `preferred:false`,
   how many `preferred:true`, and how many carry neither key.
4. Anything noticed and not fixed.

**Every claim about the code carries `Belägg: <file:name>` or `OLÄST`.** *A citation is a NAME that
can be looked up, not a line number that expires on the next insertion.*

---

## SMOKE — THE STEP THAT CAN FAIL IS A PAIR, NOT A PAGE

**`http://localhost:8000/index.html`, console.**

**Step 1 · the step that can fail.** `openESGModal('lyko_se')`, scroll to **Carbon transparency** and
**Supply chain transparency**. **Both notes render with NO label.** *Failure: they still say
"Preferred" — the third branch is not reached.*

**Step 2 · the control, and it must be run in the same session.** `openESGModal('apotek_hjartat_se')`,
same two rows. **Both still say "Preferred:".** *Failure: the label disappeared here too, which would
mean the new branch is catching `preferred:true` as well — a fix that removes the true statement
along with the false one.*

**Step 3 · the other two carriers.** `openESGModal('dm_de')` and `openESGModal('kicks_se')`. **No
label on either.** *`dm_de`'s supply-chain note — "Not required for branded suppliers" — is the
sharpest single line in the finding and should now stand on its own.*

**Step 4.** Any retailer with a `required:true` row, to confirm **`Required:`** is untouched.

**NOT A TEST, AND IT SAYS SO:** confirming the modal still opens. *Nothing in this shipment touches
`openESGModal`; the step cannot fail.*

---

## THE TWO SLICES THIS ONE DELIBERATELY EXCLUDES

**SLICE 2 — A RENDERING JUDGEMENT, STRATEGY'S, AND IT IS ONE LOOK AFTER THIS SHIPS.** *Does an
unlabelled row read as "the label failed to load"?* The rows sit under a grey uppercase section
heading (`CARBON TRANSPARENCY`), so a bare note is not floating — **but that is the lane's read of a
screenshot, and the state is ruled by Strategy while the rendering is not.**

**SLICE 3 — TWO DEFECTS NO CHOICE OF LABEL CAN FIX.**

**The flattened conditional obligation.** *"Preferred: Tier 1 factory list **required** for private
label. Encouraged for branded ranges."* — on a row where `preferred:true` is HONEST. **The label
says preferred; the note says required, conditionally.** The obligation is real and scope-limited,
and **the schema has one boolean where it needs a scope.** #199's family: a condition living in prose
where nothing reads it. **No label fixes a fact that is not binary.** Build item.

**`mandatoryRequirements` contains a non-mandatory item.** Apotek Hjärtat renders
`MANDATORY REQUIREMENTS (1/3 MET)` over **four** rows, the first of which says *"Not mandatory but
strongly preferred"* in its own note. **The denominator is correct, which is what lets it pass:** a
right count under a heading that contradicts its own list. **The array's NAME asserts something one
of its members denies** — `EU_RP_MARKETS` and `isEU`'s family, except on screen rather than in the
source. **A rename is an assertion about purpose, so it is Strategy's**, and the measurement is
already done: exactly one member carries `required:false`.
