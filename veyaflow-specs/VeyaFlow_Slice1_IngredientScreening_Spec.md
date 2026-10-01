# VeyaFlow — slice 1: ingredient screening against a named list

**1 October 2026 · Strategy → coding lane → CC · THE REQUIREMENT IS RULED, THE DECOMPOSITION IS NOT**

**The slice has one purpose:**

> **ONE INGREDIENT LIST, N RULE SETS, N OPINIONS — EACH CARRYING THE LIST VERSION IT WAS TESTED
> AGAINST.**

> **`Passes at Apotek Hjärtat, rejected at Apotea.`** *The sentence nobody can produce today, and
> the whole position in seven words.* `Mätt: AH screens against Restricted Cosmetic Ingredients 7.0,
> Apotea against its own; neither is derivable from the other. Mätt på: 2 av 4.`

**THE REQUIREMENT IS IN `open-items.md` AND IS NOT RESTATED HERE BEYOND WHAT THE BUILD NEEDS.**
*The register is the source; this spec names it rather than copying its values.*

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN,
`0 of the 11 tracked surfaces modified`, exit 0. **Confirm all eleven before starting.**

---

## PART 0 · MEASURE THE PLACE THAT IS ALREADY BUILT — STOP AND REPORT

> **`vi har platsen för underlaget byggd, vi har inte fyllt den`** *— measured 1 Oct.* **Both slices
> FILL THE PLACE rather than building a new one, so the first job is to say exactly where it is.**

**Four questions, `Belägg:` per answer or `OLÄST`:**

**0a · `ean` and `inci` — the reads with no consequence.** *Strategy measured fifty and forty-four
read sites respectively, **with not one consequence**: the fields exist, the thread does not.*
**Confirm both counts and classify every site:** does it *display* the value, *validate* it, *pass it
onward*, or *decide* something? **A count without that split is two numbers over different sets.**

**0b · How is INCI stored today?** *Free-text string, or anything structured anywhere?* **Name every
writer and every reader.** *An ordered list is the requirement; what exists is the starting point.*

**0c · Where does a screening OPINION belong?** *The register says the place is built.* **Name it:
which record, which surface renders it, and what it holds today.** *If more than one candidate
exists, report all and rule none.*

**0d · Apotea's tab 14 — is any of that rule set in the tree, or entirely external?** *It is
described as already measured. **Measured is not the same as present.*** **Report which.**

**STOP AFTER PART 0.** *The shipment boundaries are derived from this, and drawing them first would
be choosing the answer — the error that withdrew the respine binding.*

---

## THE REQUIREMENT — WHAT ANY DECOMPOSITION MUST SATISFY

### THE RULE MODEL CARRIES FIVE FORMS

**presence · name pattern · POSITION IN THE LIST · TARGET GROUP · FORM (solid/liquid)**

*The last three are why a substring match is not enough:* **a rule can forbid a substance only among
the first three ingredients**, or only for products aimed at children, or only in solid form.

### THREE STATES, NEVER TWO

| state | means |
|---|---|
| **HIT** | named substance, **unconditional** rule |
| **CONDITIONAL** | a hit, but the rule has a condition **we cannot decide from the ingredient list** |
| **POSSIBLE** | synonym · fuzzy match · unparsed text |

> **`POSSIBLE` IS WHERE "it doesn't have to be true" LIVES — AND IT MUST NEVER LOOK LIKE A `HIT`.**

*Three states is measured across three independent sources:* **Åhléns' form** (`Mandatory /
Optional / Mandatory if applicable`), **Apotea's fourteen dropdowns** (`Ja / Nej / Ej tillämpligt`),
**and our own #239 slice 3.** `Mätt på: 3 källor.`

### THE WARNING CITES, IT DOES NOT GUESS

> **Rejected: *"X may be a problem."***
> **Ruled:** *"`Cyclopentasiloxane` is on Apotea's list, version 2026-10-01. It is forbidden only
> among the first three ingredients. Yours is at position seven."*

**Same information, and the user can JUDGE it — we have asserted nothing.** *The scope clause
applied: the value leaves, so it names its source.*

### THE CONDITION BECOMES A QUESTION, NOT A GUESS

**Apotea's rules carry conditions that cannot be read from an INCI list** — *is the product aimed at
children? can it be inhaled? is the polymer solid or liquid?*

> **THE SYSTEM DOES NOT WARN. IT ASKS A QUESTION — AND THE ANSWER BOTH DECIDES THE RULE AND IS SAVED
> AS A DATED FACT ABOUT THE PRODUCT.**

**That inverts the mechanics: a false-positive machine becomes a DATA-COLLECTION mechanism.** *Each
answer makes the next screening cheaper and the record richer* — **the flywheel the register
measured as stationary.** *A question is asked ONCE per product and holds until the product changes,
so it is one-off collection of fields that exist in no current flow, not friction.*

### THE OPINION FALLS WHEN THE SOURCE STEPS

**Every opinion records BOTH version fields of the list it was tested against — `source_version`
*(theirs, may be null)* and `measured_at` *(ours, never null)*. THEY ARE NEVER COLLAPSED INTO ONE
STRING.**

| list | `source_version` | `measured_at` |
|---|---|---|
| `Apotek Hjärtat Restricted Cosmetic Ingredients 7.0` | `"7.0"` — theirs | `2026-10-01` |
| Apotea’s prohibition list | `null` — `Mätt: tab 14 carries no version number` | `2026-10-01` |

> **An opinion keyed to a source that CARRIES a version falls when the version steps. An opinion
> keyed to a source that carries NONE cannot detect a step at all** — *it falls on a staleness rule
> over `measured_at`, and re-measurement is the only detector.* **Two mechanisms, and the difference
> is a property of the SOURCE, not of our design.** `Belägg: AMENDMENT B, this file`

*That is the question run backwards — **from changed requirement → affected SKUs** — which the log
called "the ONLY genuinely new build in the concept", reached from the recipient's side instead of
from theory.*

### TWO SOURCES FOR THE SAME LIST, AND THE DISAGREEMENT IS A FINDING

**The ingredient list exists in the product record AND in the artwork.** *Where they differ, **the
disagreement is itself a finding** — and one neither party has today.*

`Belägg:` **the first AH export ever produced carried `Aqua, Glucerin, Asorbic Acid`** — two
misspellings in a controlled vocabulary, and it went to a pharmacy.

---

## THE BOUNDARY — UNCHANGED, AND IT BELONGS IN THE INTERFACE

> **WE FLAG. WE NEVER CERTIFY.** *And the reason is honest and must be on screen:* **the screening
> matches known substances and known spellings, so it is NECESSARILY INCOMPLETE.**

**`absence of flags != compliant`.** *An ingredient list that could not be parsed yields
**`could not be run`, never `clean`*** — the honestly-empty rule, on a surface where the difference
is a regulatory one.

---

## REPORT BACK

1. All eleven digests — **unchanged**, this is a measurement.
2. **Part 0's four answers**, with `Belägg:` or `OLÄST` per line.
3. **The `ean`/`inci` split** — display · validate · pass on · decide — and the count per class.
4. **A proposed decomposition into shipments**, derived from Part 0 and **batched by whether a
   judgement is required**, not by file or size. *Propose; do not start.*
5. Anything noticed and not fixed.

---

## NO SMOKE — AND THAT IS NOT AN OMISSION

**Part 0 changes nothing, so there is nothing to smoke.** *The steps are written when the first
shipment's boundaries exist, and each will name its entry point — a step whose entry cannot be named
is unrunnable, and this lane has written six of those.*

---

# AMENDMENT — STRATEGY, 1 OCTOBER, SAME DAY. THREE THINGS THE SPEC COULD NOT KNOW

**The three decisions in the dispatch note stand: point at the register rather than copy it · split
the `ean`/`inci` reads before accepting the premise · derive the decomposition from Part 0 instead
of drawing it.** *Nothing below overrules any of them.*

## A · THE SLICE HAS A FREE ACCEPTANCE TEST, AND IT COMES FROM THE RECIPIENT

**Apotea's workbook carries a WORKING IMPLEMENTATION of this screening — `APOTEA_sökning ej tillåtna
ämne`, 231 columns × 600 rows, pure formulas.** `Mätt 1 okt: formulas read directly.`

```
=IFERROR(IF((SEARCH(E$3,'5. Produktinformation'!$R18))>0, E$3, ""), "")
```

**Every forbidden word is its own column; spelling variants are enumerated as separate columns —
nine for `Nylon-6` alone.** *That is why the tab has 231 columns.*

> **THAT IS AN ORACLE. Run the same ingredient list through both and compare — and where they
> disagree WE KNOW WHICH IS RIGHT, because we know their mechanism is substring matching.**

**ONE NAMED TEST CASE WITH A PREDICTED OUTCOME, WRITTEN BEFORE THE BUILD:**

| input | Apotea's sheet | ours MUST say | why |
|---|---|---|---|
| INCI containing **`Polyethylene Glycol`** | **flags it as microplastic** — `SEARCH("Polyethylene", …)` matches the substring | **does NOT flag it** | PEG is not a microplastic. **Their tool produces a false positive on a compliant product** |

**An acceptance test drawn from the RECIPIENT rather than from us is worth more than any test we
would write** — *and this one is predicted in advance, so it cannot be fitted after the fact.*

## B · A TRUTH DEFECT IN THIS SPEC'S OWN EXAMPLE — STRATEGY'S, AND IT IS THE CLASS WE POLICE

**The spec writes the version marker as `Apotea 2026-10-01`, in the same breath as
`Apotek Hjärtat Restricted Cosmetic Ingredients 7.0`. THOSE TWO ARE NOT THE SAME KIND OF THING.**

| | what it is |
|---|---|
| `Restricted Cosmetic Ingredients 7.0` | **THEIR version number.** Their artefact, their numbering, steps when they say so |
| `Apotea 2026-10-01` | **OUR measurement date.** `Mätt: tab 14 carries no version number.` *Other tabs in the same workbook do — `Hållbarhetsmärkningar (uppd 2023-06-30)`, `Egenskaper (uppd 2020-12-01)` — but the prohibition list does not* |

> **RULED: a rule set records BOTH, and never collapses them.** `source_version` *(theirs, may be
> null)* **and** `measured_at` *(ours, never null)*. **An opinion that cites our measurement date as
> if it were their version number is a claim about them that they never made.**

**AND IT HAS A CONSEQUENCE FOR "THE OPINION FALLS WHEN THE SOURCE STEPS": when the source carries no
version, we cannot DETECT a step — we can only re-measure.** *So an Apotea opinion needs a staleness
rule on `measured_at`; an AH opinion can key off the version string.* **Two mechanisms, and the
difference is a property of the SOURCE, not of our design.**

## C · PART 0d IS ALREADY HALF-ANSWERED, AND THE REMAINING HALF IS A REAL QUESTION

**Apotea's rule set is ENTIRELY EXTERNAL. It is not in the tree.** *Source:
`Aviseringsmall-Apotea.xlsx`, supplied by Charlotte 1 Oct, measured the same day; the register holds
the full reading.* **CC should confirm `not present` cheaply and spend no time looking.**

**The question that remains is the one worth the time, and it belongs in Part 0:** **WHERE DOES A
RULE SET LIVE?** *A file in the tree is a second decision layer the moment a retailer updates. A
record is what the five forms and the two version fields want. **Report candidates, rule none** —
same instruction as 0c.*

## D · ONE NOTE FOR 0a, MEASURED TODAY

**Both seed EANs fail the mod-10 check digit:** `7350000000017` should end in `6`,
`7350000000024` in `3`. `Mätt 1 okt: computed from seedDemoNordlys.`

> **So no run has ever exercised a VALID EAN** — *the app validates "13 digits", not the check
> digit.* **If the `ean` read sites turn out to have no consequence, part of the reason may be that
> the fixture could never produce one.** *Worth one line in the 0a report; not a finding on its own.*

---

**Strategy, 1 October 2026. Everything above is in `open-items.md`; this amendment names it rather
than copying it.**
