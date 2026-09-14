# VeyaFlow — #183: buyer-facing exports ship claims without the assessment the app performed

**14 September 2026 · coding lane → CC · ruled by Strategy**

**The app assesses every claim. The export strips the assessment and ships the claim.** Same shape
as the eleven days of *"No specific reason was given"* — it holds the answer and sends without it.

**Ruled before #164** — the gated exports reach buyers; Universal is a file the brand keeps. **Decide
the honest form once on the harder case; the easier one inherits it.**

---

## NAMED BASELINES

Eleven surfaces; `index.html` at `dd358cac5be5c8f25e6ef15930a8c7c45b5a4546e445301d7ea2cdb38b0e69dc`,
branch `f2b-async` at `abc56fc`. **Confirm all eleven. Only `index.html` moves.**

---

## THE EVIDENCE — A REAL FILE, NOT A HYPOTHETICAL

The first Apotek Hjärtat CSV ever produced, 11 September, downloaded and read:

```
…,Certifieringar,Påståenden,Beskrivning SV,Beskrivning EN
…,Cruelty Free International; FSC packaging,Smooths Wrinkles,"…"
```

**`Påståenden,Smooths Wrinkles` — a claim, with no assessment, on a document bound for a pharmacy
chain's compliance desk.**

**And the app holds the assessment.** `CLAIM_REGISTRY` rates `'reduces wrinkles'`:

- **amber** for cosmetics — *"Acceptable as cosmetic claim if not therapeutic"*
- **red for accessories** — *"Cosmetic efficacy claim — not permitted for accessories"*

**A forehead tape sits exactly on that boundary.** The export ships the assertion and withholds
everything the product knows about it.

---

## THE RULING — WRITE IT IN BEFORE IMPLEMENTING, IT WILL FEEL WRONG

> **Status travels IN-BAND, as a column — or the claim does not travel at all.**

**There is no third option, and the third option is what will suggest itself** the moment you find
that Apotek Hjärtat's template has a fixed column set.

**When the template is locked, the answer is: the claim does not travel.** Which means **the export
loses a field the brand deliberately filled in.**

### And that omission must be VISIBLE TO HER

> **Silently dropping the brand's own content is its own kind of dishonesty.**

The app says so, plainly, at export time — *the claim was not included in the Apotek Hjärtat export
because the template has no column for its assessment.*

> **Omitting without saying so is the same class as asserting without backing — with the sign
> reversed.**

**Do not invent a middle way.** Not a footnote in a description field, not the claim with an
asterisk, not the claim dropped quietly, not a status appended inside the claim string. **If you
find yourself designing a compromise because the template is locked, that is the moment this
ruling exists for — stop and report instead.**

---

## IMPLEMENT

**1. Establish the column reality per retailer, first, and report it before editing.** For each of
the five templates: is the column set fixed by the retailer, or ours to extend? **Name the
evidence for each** — `RETAILER_TEMPLATES`, the masterdata notes at 31932/31949, or nothing at
all. **"Nothing at all" is a valid and important answer**: a template we invented can take a
column; one the retailer publishes cannot.

**2. Where a column can be added:** the claim travels with its assessment beside it. **Reuse
`CLAIM_REGISTRY`'s own status and note — do not compute a second verdict.** Two surfaces
disagreeing about one claim is worse than neither speaking.

**3. Where it cannot:** the claim is **withheld**, and the export screen **says which claims were
withheld and why**, before or at download.

**4. The framework matters and must not be flattened.** The same claim is amber for a cosmetic and
red for an accessory. **Resolve through `resolveProductFramework`, never through brand category**
(#139's defect). An `unknown` framework yields no assessment — **and therefore, under this ruling,
the claim does not travel.**

---

## OUT OF SCOPE

- **#164** — Universal carries its own state. Ships after this and inherits its form.
- **#166** (`articleNo` allowlisted then stripped) and **#171** (INCI unvalidated). Same file, separate
  defects.
- **The Swedish/English description discrepancy.** The EN description claims *"reduce the
  appearance of sleep wrinkles"* and the SV makes no efficacy claim. **That is the brand's content,
  not a code defect** — but report whether anything in the product could have caught it, because
  cross-locale claim consistency is a capability question, not a bug.
- #186, #147, #181, #180 Part 2, #172, #162, #165.

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **The column reality per retailer, with evidence per template.** Report before editing.
3. **Every buyer-facing surface carrying a claim** — the five retailer CSVs, the TXT data sheets,
   the brand pack, the spec sheet, the line sheet, the portal submission, the DPP. **The count is
   the finding**, and any surface that ships a claim unassessed is in scope even if this shipment
   does not fix it.
4. Before/after for each surface changed.
5. **Evidence the assessment comes from `CLAIM_REGISTRY`** and not a second computation — name the
   line.
6. **The withheld-claim message**, and where it appears in the flow.
7. **Evidence a claim with no assessment does not travel** — construct an `unknown`-framework SKU.
8. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1 — correct since #174. Ten other surfaces
unchanged. **A GREEN run while `index.html` differs means the #174 gate has been undone: report and
stop.**

---

## SMOKE

**Step 1.** Forehead Tape → Apotek Hjärtat CSV. **Either `Smooths Wrinkles` travels with its
assessment beside it, or it is absent and the screen says why.** *Failure: the claim present and
unassessed — that is today's defect. Failure: the claim absent and nothing said — that is the
inverse, and it is equally forbidden.*

**Step 2.** A SKU whose claims are all green. **The export is unchanged from today** apart from the
new column.

**Step 3.** A SKU with no product type: the claims and assessment cells are empty in all three CSVs,
and the screen names the withheld claims and why.

**Step 3b.** The same SKU with the type set: the claims travel with their assessment beside them.

*Rewritten by lane ruling, 14 Sep. The original Step 3 — one product exported for two retailers
with different column freedom — tested a condition this product cannot reach: none of the five
retailer templates is locked. Same property — no assessment, no travel — through the reachable
case.*
