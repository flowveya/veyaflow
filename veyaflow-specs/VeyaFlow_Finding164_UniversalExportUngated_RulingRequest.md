# VeyaFlow — #164: the Universal export is ungated. Ruling request, not a spec.

**10 September 2026 · coding lane → STRATEGY**

**This is a question, not a shipment.** The lane can implement either answer; it should not pick
one, because the two answers serve different customers and the choice is commercial.

---

## WHAT IS TRUE TODAY, MEASURED

`showSkuExport`'s `EXPORT_OPTIONS` (22037–22102). Every retailer option computes its gate:

```js
{name:'Apotek Hjärtat', format:'CSV', …, ready:r.ready.includes('Apotek Hjärtat')},
{name:'Boots UK',       format:'CSV', …, ready:r.ready.includes('Boots UK')},
```

The last two do not:

```js
{name:'Universal', format:'JSON data pack', …, ready:true},   // 22095
{name:'Universal', format:'CSV all fields', …, ready:true},   // 22100
```

**`ready:true`, hardcoded.**

**Observed 10 Sep, Forehead Tape:** five retailers blocked with *"Missing required fields"*,
both format cards greyed — and immediately beneath them, **JSON DATA PACK and CSV ALL FIELDS
with live download buttons.**

Both Universal files run through `sanitiseSkuForRetailer`, so **no private field leaks** — that
is verified and is not the question. The question is that they carry **more fields than any
retailer-specific file**, and they are the ones a brand would attach to an email.

---

## THE TWO READINGS, PUT FAIRLY

**A — the gate is real and this is a hole.**
If refusing an incomplete retailer file is right, then refusing the file that contains a
superset of it is right too. A brand blocked from the Apotek Hjärtat CSV scrolls four inches and
sends the JSON instead. **The gate then stops nothing and only teaches the user where the
unlocked door is** — which is worse than no gate, because it signals a safety that is not there.
Same form as the three artefacts named today: *something certifies a check that did not happen.*

**B — the gate is retailer-specific and Universal is correctly outside it.**
The retailer files are *submissions* — formatted to a buyer's template, sent to a buyer, and an
incomplete one wastes a listing slot. The Universal files are explicitly labelled *"for your own
system or developer handoff"*: a brand exporting its own data to its own tools has every right
to that data at any completeness. **Gating it would mean the platform withholding a brand's own
records because the platform judges them incomplete** — which sits badly beside every ruling
this lane has taken about where authority lives.

**The lane leans B on principle and A on observed behaviour**, and cannot resolve it from the
code. **The determining question is one only Strategy can answer: is the Universal export
positioned as the brand's own data, or as a shortcut to a buyer?** If a real customer would
attach the JSON to a buyer email, B's principle is sound and the product is still handing them a
loaded gun.

---

## A THIRD SHAPE, IF NEITHER IS RIGHT

Neither gate nor open, but **labelled**: the Universal files download at any completeness and
carry a header line stating what is missing — *"Exported 10 Sep 2026. Incomplete: INCI list,
CPNP number."*

**That keeps the brand's data theirs, and makes the file self-describing if it is forwarded.**
It also converts the argument from *"may they have it"* to *"does the file say what it is"*,
which is the distinction the lane has landed on repeatedly this week — `verifiedBy: 'brand'`,
`not_recorded`, *entered but not confirmed*.

**Raised as an option, not recommended.** It costs more than either A or B and it invents a
convention the file format does not currently have.

---

## RELATED, AND NOT THE SAME QUESTION

**#166 — `articleNo`.** The Universal CSV requests `['Article no', sku.articleNo||'']` (22248),
but `articleNo` is in `PRIVATE_SKU_FIELDS` (17619) and `sanitiseSkuForRetailer` strips it. **A
column that is empty by construction**, because the export builder and the privacy allowlist
disagree about one field.

**No leak today, and the disagreement fails in the safe direction.** It is filed because it
becomes a leak the moment someone "fixes" the empty column by reading the raw SKU — the defect
would then be introduced by someone tidying up, with the privacy list untouched and looking
correct.

**Not a Strategy question.** It ships with whichever export shipment lands next, and the lane
will name it then.

---

## WHAT THE LANE NEEDS BACK

**One sentence: A, B, or the third shape.** The implementation is small either way — a boolean
at 22095/22100, or a header line in `exportForRetailer`.

**Not urgent, and it should not delay #160, #167 or #165.** But it should be answered before
#165 lands, because #165 names the missing fields on that screen — and a screen that explains
precisely why five retailers are blocked, directly above two ungated downloads, makes the hole
considerably easier to find than it is today.
