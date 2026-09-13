# VeyaFlow — #180 Part 2: the establishment axis

**12 September 2026 · coding lane → CC · ruled by Strategy**

**This is not a timezone field.** The product knows where a brand **sells** — `currentMarket`,
`targetMarkets`, `ambitionMarkets` — and has no record of where it is **established**. That axis
is missing, it is regulatory, and the day count is a by-product of building it.

---

## NAMED BASELINES

Request current values from the lane. `index.html` is at `dd358cac…` as of `50c307f`; the other
ten are unchanged. **Only `index.html` moves.**

---

## THE HARD BOUNDARY — READ THIS BEFORE ANYTHING ELSE

> **A FIELD IS COLLECTION. AN INFERENCE FROM THE FIELD IS AN ASSERTION.**

**Capture the field now. Do not reason from it until a Responsible Person has answered.**

The field is written, stored and rendered as **a fact the brand stated about itself** — nothing
more. **`_operatorStatus` does not change. No obligation is derived. No requirement appears or
disappears because of what this field says.**

**Concretely forbidden in this shipment:** *"EU-established → you are your own RP by default"*,
or any variant. **If that inference is wrong, we will have built a regulatory conclusion into the
product — precisely the class removed four times this week.** The regulatory question is **#182**,
it is on the RP's list, and it is not a coding decision.

**A reviewer should be able to delete every consumer of this field and lose nothing but the day
count.**

---

## WHY THIS IS NOT A FIFTH PROXY — WRITE IT DOWN, THE NEXT READER WILL ASK

Four proxies were rejected this week, each standing in for something it was not:

| rejected | stood in for |
|---|---|
| `brand.category` gating per-SKU regulatory fields (#139) | product framework |
| `moq` as an Apotek Hjärtat requirement (#167) | a retailer-side quantity that was deleted in June |
| `currentMarket` as a timezone | establishment |
| a bare `100%` | a per-SKU-per-retailer readiness |

**Establishment is different, and the difference is not that it is convenient.** A Swedish
regulatory deadline is measured against Swedish time, and **the obligation belongs to the
jurisdiction of establishment.** So establishment is **the correct axis for the day count** — not
a substitute for the reader's locale.

> **THE CRITERION: a field carries two purposes legitimately when it is the CORRECT AXIS for
> both — never when it is merely AVAILABLE for the second. Availability is how proxy errors
> arise.**

---

## WHAT TO BUILD

### 1 — The field

**Scout for precedent before proposing a name or a control** (standing rule, and it has earned
itself twice this month — `sku.safetyRef` for #135 and the CPNP modal's presentation for #165).
**Report:**

- Does any existing brand field hold a country in the domicile sense? **`euResponsible.address`
  contains one, and it is the RP's, not the brand's — say so explicitly** so the next reader does
  not reach for it.
- What control does onboarding already use for a country or market? **Do not invent one.**
- Is there an existing country list, and does it carry ISO codes or display names only?
  **`estimateCarbon`'s 32-country list exists and #158 established it is keyed by display name
  with a broken `slice(0,2)` — report whether it is reusable or whether reusing it inherits that
  defect.**

**The value is a country of legal establishment.** One country, not a list. **Stored on `brand`,
mirrored by `brand.save` like every other brand field** — confirm that is automatic and does not
need a new proxy action.

### 2 — Onboarding captures it

**An empty field that asks**, not a prefilled one that invites agreement. Strategy's prefilling
ruling: *an empty field asks the user to know something; a prefilled field asks them not to
object.*

**Do not default it from `currentMarket`.** That is the rejected proxy, and it would arrive
looking correct.

### 3 — The day count consumes it, and nothing else does

`daysUntil`'s "today" becomes **the calendar date in the establishment country's zone**, rather
than the UTC date.

**This is the one use.** The deadline anchor stays UTC midnight — deadlines are published dates
and do not move.

**Note for #181's sweep, so it is not flagged as a violation:** `Intl.DateTimeFormat` with an
**explicit** `timeZone` is **record-dependent, not reader-dependent** — it is exactly the correct
form under #181's rule. **Reading the reader's zone is the violation; naming the record's zone is
the fix.** Report which mechanism you use and why.

**Country → zone needs a mapping.** Report the smallest honest option and its failure mode — a
country spanning multiple zones has no single answer, and **for a Nordic and UK customer base that
case may not arise today.** Say whether it does.

### 4 — The absent state, ruled (Strategy, 11 Sep): (c) UTC, with three conditions

**Every existing brand is in this state the moment the field ships.**

**(b) — suppressing the count — was declined:** no existing brand has the field, so suppression
would make **overdue unrepresentable again, for everyone** — the capability #160 restored.
**(a) — backfilling from `currentMarket` — was declined** as the proxy error wearing a correct
field name.

- **Condition 1 — the reference is visible.** The number carries its frame the way `44` carries
  *of 100*. **A silent default is one hoping not to be discovered.**
- **Condition 2 — the default asks for correction.** A visible default with a prompt invites the
  user to correct; a prefilled one invites them not to object. **Opposite invitations.**
- **Condition 3, load-bearing — UTC is adequate for ARITHMETIC DERIVED FROM A PUBLISHED DATE.
  Never for anything ASSERTING A LEGAL POSITION.** The moment a surface says *"you are compliant
  as of"*, real establishment is required and UTC will not do.

**Condition 1's rendering is DESIGN's** — see Part 1b, which covers the same copy. **Propose;
do not finalise.**

---

## OUT OF SCOPE

- **Any inference from the field.** See the hard boundary. **This is the one that matters.**
- **`_operatorStatus` (6733) and the RP requirement.** Unchanged.
- **#182 — `FRAMEWORK_VOCAB`'s label.** Raised separately: the vocabulary names
  *"EU-established economic operator"* with field `euOperator`, and the check tests only that a
  record exists. **The field name promises something the check does not do** — fifth instance of
  #160's legend, #118's comment and `hasCertData`. **A defect whatever the regulatory answer is**,
  but its fix depends on that answer and it is retailer-facing copy. **Not this shipment.**
- **Part 1b** — the frame in the copy, with DESIGN.
- #179, #147, #181, #165, #172, #162.

---

## STOP. NO COMMIT.

One field, one consumer, one absent-state rendering.

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **The precedent scout, before any edit.** Existing country fields, existing controls, existing
   lists — and whether reusing `estimateCarbon`'s list inherits #158.
3. The field: name, shape, where stored, **and confirmation that `brand.save` mirrors it without
   a new proxy action.**
4. **Evidence the field has EXACTLY ONE consumer.** Enumerate every read. **If any read is not the
   day count, that is a boundary violation — report and stop.**
5. The day count, measured: a brand with the field set, a brand without it, **and the same brand
   read at 23:30 and 00:30 in its own zone** — the count must not move.
6. The mechanism used for country → zone, and its failure mode.
7. The absent-state rendering proposal, against all three conditions.
8. Anything noticed and not fixed.

---

## VERIFY

**The expected mid-batch result changed at #174:** `FAIL | index.html … AWAITING NAME`,
`OVERALL: NOT GREEN — AWAITING NAME for: index.html`, exit 1. **That is correct.** Every other
gate passes; the ten other surfaces unchanged. **A GREEN run while `index.html` differs means the
#174 gate has been undone — report it and stop.**

---

## SMOKE

**Step 1.** A brand with establishment set to Sweden: the day count matches the Swedish calendar
date, **at 23:30 and again at 00:30 local. It must not move between them.**

**Step 2.** A brand with the field unset: the count still renders, **the frame is visible, and the
prompt asks for the country.** Nothing is suppressed.

**Step 3 — the boundary.** With establishment set, **the EU Responsible Person requirement is
byte-identical to before.** No obligation appeared, disappeared, or changed severity.
*Failure: any change to an RP or compliance state. That is the inference this shipment forbids.*
