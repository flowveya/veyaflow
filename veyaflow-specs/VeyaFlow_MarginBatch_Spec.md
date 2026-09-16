# VeyaFlow — the margin batch: #229 · #214 · #228 · #230 · #231

**16 September 2026 · coding lane → CC · ruled by Strategy**

**One quantity, four assertions, two registries of what it should be, and a blocking verdict
computed from an unsourced number.** *Provenance discipline applies to this spec: every factual
claim names its source; anything unsourced is marked `NEW` or `RELAY:<lane>`.*

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`a2bacfe9b4c68ccea63b9b59d363067fa517e474c8c7d97e232cf2f57eb237a8`, branch `f2b-async` at
`380ec3f`. **Confirm all eleven. Only `index.html` moves.**

---

## THE RULING THAT SHAPES EVERYTHING BELOW — READ FIRST

**There are FOUR representations of "margin", and they carry four different `verifiedBy` values**
*(source: lane census 16 Sep, confirmed line-by-line)*:

| # | where | who produced it |
|---|---|---|
| 1 | `scoreReadiness` 6931 | computed, currency-blind |
| 2 | `updateMarginCalc` 21548 | computed, SEK-only **by accident** |
| 3 | `contractTerms.grossMargin` 23935 | **typed in by the user** |
| 4 | `brand.marginStructure` 2237 | **extracted from a pitch deck by a model** |

> **RULED: THEY ARE MADE DISTINGUISHABLE, NOT UNIFIED. 1 and 2 converge — they are the same
> computation. 3 AND 4 ARE DIFFERENT ASSERTIONS AND ARE NOT CONSOLIDATED WITH THEM AT ALL.**

**SCOPE NOTE, AND IT IS THE MOST IMPORTANT LINE IN THIS SPEC:** if you find yourself making all four
agree, **you are about to overwrite the user's own typed number with a computed one.** That is #150's
class — **silent destruction of user-entered data, introduced by a consistency fix.** **Stop and
report instead.**

**And #2 is NOT the destination.** It is unit-consistent because someone hardcoded `rspSEK`, not
because anyone made a currency decision. **A brand selling only in DKK gets rubbish from it too.**

> **Divergence says they disagree. It does not say either one is the destination. Consolidating onto
> the incidental winner installs its blind spot in every caller.**

---

## PART 1 · #229 — LOGIC ADDRESSED THROUGH DISPLAY COPY. DO THIS FIRST.

```js
21545  document.getElementById('net-price')?.closest('.card')
         ?.querySelector('[placeholder="e.g. 599"]')?.value
```

**The margin calculator locates the RSP field by its PLACEHOLDER TEXT.**

**Why it is first and not last:** *the design channel owns placeholder copy, and the redesign of every
page is queued* **(`RELAY:Strategy`, 16 Sep)**. **A copy edit stops the arithmetic silently.** This is
**a gate on the design application, not an item on a list.**

**And the failure mode blames the user.** With both fields filled, `rsp` reads 0 and the panel says
**"Enter RSP and net price to see margin calculation"** *(source: 21547)*.

> **She retypes the values, sees the same sentence, and concludes the field did not save.** An error
> that blames the user survives longest, because it produces a behaviour that looks like an
> explanation.

**Fix: address the field by `id`.** Give the RSP input an id and read it directly.

> **CANON, and it is broader than this fix: NO LOGIC MAY ADDRESS AN ELEMENT THROUGH TEXT A HUMAN IS
> MEANT TO READ.** *Placeholder, label, innerText.* **Report every other selector in the file that
> does.** *(The sweep for this is `UNDEMONSTRATED` — the case was in hand when the criterion was
> written.)*

---

## PART 2 · #214 — MONEY WITHOUT ITS CURRENCY IS NOT A NUMBER

```js
17736  return parseFloat(obj.rspSEK||obj.rspDKK||obj.rspNOK||obj.rspEUR||obj.rspGBP||obj.rspISK||0)||0;
6928   const rsp = rspCanonical(sku);
6929   const net = parseFloat(sku.netPriceSEK||0);
6932   const margin = (rsp-net)/rsp;
6935   …'Margin below '+retailer.name+' minimum ('+Math.round(margin*100)+'% …)'
```

**`rspCanonical` returns a naked float and throws the unit away. Not canonical — FIRST NON-EMPTY.**
**So for a Danish retailer the margin is a Swedish RSP minus a SEK-named net price, printed with the
retailer's name on it.**

> **THE VERDICT IS DECIDED BY THE ORDER OF A HARDCODED LIST, NOT BY THE RETAILER IT NAMES.**

**The fix is structural, not "pick the right currency":**

- **`rspCanonical` returns an amount AND its currency, or refuses.**
- **A margin across two currencies without conversion must be IMPOSSIBLE TO EXPRESS, not
  discouraged.** *Same form as deriving hard/soft from whether a date exists.*
- **Report what the scorer renders when the currencies do not match.** **Do not default to a
  conversion rate** — a rate is a world-claim with a date, and we hold neither.

**`netPriceSEK` is a field name that encodes a unit the code does not enforce** *(the import maps
`'Nettopris DKK'` → `netPriceSEK`, #215)*. **Do not rename it in this shipment** — report what a
rename would touch. *Third name this week carrying an unenforced claim, after the column sets and
`parked`.*

---

## PART 3 · #228 — THE THRESHOLD IS A LOOKUP, NOT ADVICE

`updateMarginCalc` hardcodes 40/60 and renders **"most pharmacy retailers require 40-55%"**
*(source: 21551)* — **on top of a registry holding per-retailer `marginMin`/`marginMax` spanning 0.32
to 0.65** *(source: `RETAILER_REGISTRY`, lane census)*.

> **An unsourced world-claim rendered over the real number. The product promise inverted on our own
> surface.**

- **The threshold is read from the registry for the selected retailer.**
- **The ability to state a threshold not read from the registry is REMOVED.**
- **No retailer selected → SAY SO.** **Do not fill the gap with "most".**

---

## PART 4 · #230 — TWO REGISTRIES, NO SOURCE, AND THE SCORER BLOCKS ON IT

| structure | Matas |
|---|---|
| `RETAILER_REGISTRY` 8825 | `marginMin: 0.48, marginMax: 0.52` |
| `RETAILER_TARGETS` 23865 (pharmacy_nordic) | `typical 47, floor 42, ceiling 55`, note *"Matas 44–50%"* |

**48–52 against 44–50. One retailer, two structures, different units, no source on either.**

> **This is NOT #214's kind of divergence. In #214 unit consistency decided it and the tree
> answered. THESE ARE TWO CLAIMS ABOUT THE WORLD AND THE TREE CANNOT ANSWER.** Pick a side and **the
> choice becomes canon by having been made.**

> **RULED: the right state is `not_recorded`, NOT the safer of two numbers.**

**And it outranks its size because the scorer BLOCKS on it.** *"Margin below Matas minimum"* is a
**blocking verdict computed from an unsourced threshold.** **#160 inverted an obligation; this one
manufactures one.**

### THE STATE IS RULED. THE WORDING IS NOT — AND THE ORDER MATTERS.

> **A threshold with no source yields `not_recorded`. THE VERDICT IS HIDDEN, NOT THE MARGIN.**

**The percentage is computed from our own data and renders exactly as it does today. What disappears
is the JUDGEMENT AGAINST A THRESHOLD.** *Whose absence is it? Ours — we do not hold Matas's
requirement with a source.*

**SEQUENCE, and it is not a formality:** **Strategy rules the state → CC renders the absence →
Strategy writes the sentence against what is actually on the screen.** *A sentence written against a
surface nobody has seen goes wrong in a way nobody catches.* **And the reverse — CC ships a wording
and reports it — is worse: a default that has sat for a week reads as a decision.**

### NON-NEGOTIABLE — THE ONE WAY THIS SHIPMENT COULD MAKE THE PRODUCT LIE

> **REMOVING A FALSE BLOCKER MUST NOT PROMOTE THE SKU TO PASSED.**

**The interim state renders NOTHING in the verdict slot. No placeholder. No empty chip. No "—".**

> **Nothing is honest. A default sentence is an assertion.** **Fourth instance of an absence being
> read as its opposite.**

**Do not choose between 48–52 and 44–50. Do not merge the two structures.**

---

## OUT OF SCOPE

- **Consolidating 3 or 4 with anything** — the scope note above.
- **`brand.marginStructure`'s attribution.** Its ABSENCE handling is the reference implementation in
  this codebase and must not be touched: *"not on file — say commercial terms are 'to be discussed';
  do NOT invent a margin or wholesale figure"* (17330). Its PRESENCE half carries a confidence hedge
  and no origin — **a trigger, not this shipment: first real brand pack to a buyer.**
- **#215's import mapping** (`'Nettopris DKK'` → `netPriceSEK`) and the dead `'MOQ'` → `'moq'`.
- **Renaming `netPriceSEK`.** Report only. **This refusal has a DIFFERENT reason from the two above
  and the reasons must not blur:** *no conversion rate* and *no choice between 48–52 and 44–50* are
  **refusals to invent** — we hold neither a rate with a date nor a sourced threshold. **The rename
  is a refusal to SWELL SCOPE:** it fixes nothing and reaches into the import path where #215 lives.
- **#224, #220, #199, #226.**

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **Before editing: every site that ASSERTS a margin, not only those that compute one.** *The lane's
   four came from asking the second question after the first returned two. Ask it again — is there a
   fifth?*
3. **Every selector addressing an element by human-readable text** (#229's canon).
4. What the scorer renders when currencies do not match, and when a threshold has no source.
5. What a `netPriceSEK` rename would touch. **Report only.**
6. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1. Ten other surfaces unchanged.

---

## SMOKE — ORIGIN NAMED IN EVERY STEP

**`http://localhost:8000/index.html`, seeded NORDLYS.** *Not the deployed site (15 Sep).*

**Step 1 · #229.** SKU form, Commercial tab. Fill RSP and net price. **The margin renders.** Then
change the RSP field's placeholder text in devtools and re-enter a value. **The margin still
renders.** *Failure: "Enter RSP and net price" with both fields filled — that is today's defect.*

**Step 2 · #214.** A SKU with `rspSEK` empty and `rspDKK` set, scored against a Danish retailer.
**No percentage is printed with a retailer's name on it.** *Failure: any margin percentage — the
currencies do not match and the number cannot exist.*

**Step 3 · #214, the passing case.** `rspSEK` and `netPriceSEK` both set, Swedish retailer.
**Unchanged from today.** *The fix must not remove the margin where it is valid.*

**Step 4 · #228.** No retailer selected. **The panel says no threshold applies and names no
percentage band.** *Failure: "most pharmacy retailers require 40-55%".*

**Step 5 · #230.** Matas selected, margin below both candidate thresholds. **No blocker citing a
minimum.** *Failure: "Margin below Matas minimum" — a blocking verdict from an unsourced number.*
