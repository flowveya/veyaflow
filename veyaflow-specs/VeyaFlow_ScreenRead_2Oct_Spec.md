# VeyaFlow — screen-read, 2 October: one action, five measurements

**2 October 2026 · Strategy → coding lane → CC · THE FINDINGS ARE MEASURED ON SCREEN, THE CAUSES ARE NOT**

**The source is seventeen screenshots Charlotte took of the live app on 2 October, read against the
five-layer build structure. What a user sees is the measurement; what the code does is yours.**

**THE FULL READING IS IN `open-items.md` → `SKÄRMLÄSNING 2 okt — 17 YTOR MOT DE FEM LAGREN`.
IT IS NOT RESTATED HERE BEYOND WHAT THE WORK NEEDS.** *The register is the source; this spec names it.*

**MERGED 2 OCT WITH THE CODING LANE'S FRAMING, WHICH IS SHARPER FOR THREE OF THE FIVE:** *M2, M5a and
M5b are one class, not three errands — **a rendered number whose writer is unnamed.** Measured as
separate trivia the pattern is lost.* **The coding lane's wording stands for those three; Strategy's
for Part 1, M1, M3, M4.** One spec.

**TWO RULES THAT BIND EVERY MEASUREMENT BELOW:**
- **A screenshot is a VIEWPORT, not a page.** *Scoping a measurement to what was visible is the
  failure mode that produced ten failing rows where five were reported.* **Every measurement names
  its page id, and the scope is the page and the function — never the visible part.**
- **`Belägg: index.html:<function name>` — a NAME, never a line number.** *Find the writer, not the
  reader: a capability's state cannot be inferred from its output.*

**QUEUE POSITION:** *M1–M5 are report-only scouts; the one-edit-per-shipment rule binds edits, not
measurements. They run alongside `#252`.* **Part 1b is a data change, not a tree edit — whether it
counts against the rule is the coding lane's call, made before taking it.**

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, 57 gates GREEN, `0 of the 11 tracked
surfaces modified`, exit 0. **Confirm all eleven before starting.**

**AND THE BLOCKER THE CODING LANE WROTE INTO THE REGISTER 1 OCTOBER STANDS:** *nothing in the queue
touches the tree until `index.html` is pinned against `82395393`.* **Part 1 below is designed to
need no tree change. If measurement shows it does, STOP and report — do not take it.**

---

## PART 1 · THE ONE ACTION — BEFORE PART 0, AND THE ONLY ACTION IN THIS SPEC

**A published, buyer-facing document carries a false regulatory statement.**

| what the screen shows | where |
|---|---|
| `PAGE 1 PREVIEW — VERIFIED DATA ONLY, NO AI` · **`✓ EU RP · Cosmeservice GmbH`** | Brand Pack Generator |
| **`EU RP AGREEMENT EXPIRED · Cosmeservice GmbH · EXPIRED 2025-12-31`** | EU Responsible Person page, same brand, same session |
| `Generated 31 Aug 2026 · 31d ago · LIVE` · `https://veyaflow.netlify.app/brand/479e6985-…` | the share link, public |

> **A third party can open that link today and read that the brand has a valid Responsible
> Person. It does not.** *Same class as the 26 June fabrication catch — but in a PUBLISHED artefact,
> not a generator.* **This outranks every queue position.**

**THE ACTION, IN TWO STEPS, MEASURE FIRST:**

**1a · Measure where the pack is served from.** *Hypothesis, not a finding:* the share link is served
by `get-brand-pack.js` from a `shared_brand_packs` row *(the 2 July security note: "shared_brand_packs
(active-packs public read) policies confirmed correct")*. **If so, the pack can be made inactive by a
row change — no `index.html` touch, no deploy.** Report: the function, the table, the row id, the
field that governs `active`. `Belägg:` file and line, or table and column.

**1b · If 1a holds: deactivate the row for pack `479e6985-0d85-46b2-a517-be2d805c6b3b`.** Report the
before/after state of the row and confirm the URL no longer serves the page. **If 1a does NOT hold —
if taking the pack down needs a tree change — STOP, report, and leave it to Charlotte.** *A tree
change against an unpinned `index.html` is the thing the 1 October blocker forbids, and this spec
does not override it.*

**What this spec does NOT ask:** fixing the RP read. *That is Part 0 · M1 — measured, not fixed.*

---

## PART 0 · FIVE MEASUREMENTS, IN ORDER — STOP AND REPORT

**Each answer carries `Belägg:` (file:line, table:column, or the exact string) or `OLÄST`.**
**Report what IS. Propose nothing. Fix nothing.**

### M1 · The RP read — why three surfaces say "confirmed" against an expired date

**Page ids: `brandpack` (page-1 preview) · `retail-checklist` · `home` — against `rp-marketplace`, which renders `EXPIRED`.**

**Brand Pack page 1, Listing Checklist (`✓ EU Responsible Person confirmed · Auto-verified from your
data`) and Brand Home all render the RP as present. The RP page renders it expired.**

*31 August measured four independent "has an RP" implementations, none comparing `renewalDate` to
today (`#M6` in the register).* **Name each read site of `brand.euResponsible` that produces a
tick or a ✓ on screen. For each: does it read `renewalDate`? Does it compare it to a date? Which
date?** *If a site reads the field and compares it correctly, say so — the RP page itself is one.*

### M2 · The Danish EPR row — where is it derived from? *(coding lane's wording)*

**Page ids: `compliance-cal` (first card, October 2025) · and the global deadline strip on every page.**
Charlotte: *"vi säljer knappt till andra länder."*

**`#199`'s class: applicability before assertion.** The row asserts an obligation applies to a product
in a market. **The question is not what it says but what decided it applies.**
- **Find the writer, not the reader.** A row that reads correctly can still be produced by a
  country-code string comparison with no rule behind it.
- **Answer form: `Belägg: index.html:<function name>`.** Plus: **is the Danish row produced by the
  same resolver as the Swedish one, or by a separate branch?**
- **Falsifier:** if it comes from a hardcoded list rather than a rule set, this is the same shape as
  `validPages` — a hand-maintained list that must match something else.
- *Also: what produces `366d` for an overdue row — the `#201`/`#160` clamp, or something new?*
- **Report, rule nothing.**

### M3 · Forehead Tape's type — record or routing?

**Page ids: `retail-checklist` (the Product type row) · `skus` (the `Reformulation` action).**

**Listing Checklist: `PRODUCT TYPE · Cosmetics / Skincare` for Cloud & Glow Forehead Tape. My
Products: a `Reformulation` action on the same product.** The register measured the product as a
textile (AH PDX reading, 30 Sep).

**Report `productType` on the record for that SKU, verbatim. Then: which code path chose the
cosmetics checklist, and which code path decided to offer `Reformulation`?** *Two answers: the record
is mistyped, or the routing ignores the type. Say which — or both.*

### M4 · The `★★★` values in `RETAILER_REGISTRY` — and which LIVE surfaces read them

**Page ids: `crm` (parked; the writer) · suspected live readers `seasonal`, `skus`, `retail-checklist`.**

**Retailer CRM shows `Rossmann · 42-50% margin ★★★ · Q1 January / Q3 July`, `Whole Foods UK ·
45-55% ★★★ · April / October`, `Life Helsekost · 40-50% ★★★ · February / September`.** The CRM is
parked by ruling (1 Oct). **The registry is shared.**

**Report: (a) the field names that hold margin bands, windows and the star rating; (b) every
surface — live or parked — that reads any of them, by renderer; (c) whether any of those values
carry a source field, and what it holds.** *Seasonal Calendar's `✓ Confirmed cadence — verified
window` and My Products' per-retailer ticks are the two suspected live readers. Confirm or deny from
the bytes.*

**Why this matters beyond the CRM:** *the register ruled 2 Oct that parking a SURFACE does not park
the DATA it wrote into a shared store.* **This measurement is what makes that ruling actionable.**

### M5a · The ~75 aggregate — what is counted, and why are followers in it? *(coding lane's wording)*

**Page id: `home` — the top card, `OUTREACH READY · NORWAY · Biggest gap: Social following below 5K`.**

**This is the aggregate-binding rule directly:** binding an outcome to an aggregate decides the answer
before knowing what the number is made of. **Followers appearing inside it is the measurement that
matters, because it means the aggregate mixes kinds.**
- **Decompose it:** which fields sum into the number, in which function, and what each term means on
  its own.
- **Then the real question: does anything downstream bind to it** — a threshold, a badge, a tier, a
  readiness state? *An aggregate nobody keys off is cosmetic; one that gates something is a defect
  with a trigger.*
- **Falsifier:** if followers are a term, the number cannot mean what its label says, **and the
  label is the thing to remove — not the term, not a softened caption.**

### M5b · `Tier 0 of 3` — where does it come from? *(coding lane's wording)*

**Page id: `home` — right rail, `VERIFICATION STATUS · VeyaFlow Unverified · Tier 0 of 3 · Tier 1
ready 3/4 · Request verification`.** *Not one of the seventeen surfaces in the disposition pass — a
widget.*

**Two separate questions in one string; answer them separately.**
- **`0`** — is `Tier 0` a state in the tier model, or is it what a null renders as? *If a null
  renders as a number, that is `never default a value whose absence means something` in its most
  convincing form: an absence presented as a position.*
- **`of 3`** — is the denominator read from the tier data or written into the template? *A hardcoded
  `3` beside a live numerator is a claim about the data that nothing maintains. The register has
  this exact shape at `MFR_LISTING_TIERS`, where all twelve rows are `'free'`.*
- **Falsifier:** if the numerator is live and the denominator is literal, they disagree the first
  time a tier is added.
- **Plus:** what `Request verification` does when clicked, and whether anything downstream — Brand
  Pack, exports, the public passport — reads `verificationTier`.

---

## WHAT THIS SPEC DOES NOT TOUCH

- **The Claim Localizer colour/text disagreement** (*Anti-aging* red under "never safe", text says
  "permitted"). *Known since 18 June; it is the single-light ceiling, and it waits for slice 1's
  three-state model, not a patch.*
- **The Regulatory Monitor's triple CMR alert and its `Check claims →` button.** *The right action
  is "screen formulations", which is slice 1. Noted; not this spec.*
- **`[HONESTY_BANNER_BRANDPACK: …]` rendering as a literal.** *Strategy content slot, 2 July list.
  Strategy owes the copy; CC does nothing here.*
- **`Face Serum · EAN 1234567891023`** (invalid check digit, placeholder in a real record). *Data
  hygiene on Charlotte's side; goes with the C&G-as-fixture ruling of 1 Oct.*

---

## REPORT BACK

1. All eleven digests — **unchanged**, except as Part 1b documents if a row change was made.
2. **Part 1:** 1a's answer with `Belägg:`; 1b's before/after if taken, or the reason it was not.
3. **M1, M2, M3, M4, M5a, M5b**, each with `Belägg:` or `OLÄST`, in that order.
4. Anything noticed and not fixed.

**No decomposition, no proposals, no fixes beyond 1b.** *Every one of M1–M5 ends in a Strategy
ruling, and the ruling is made on the measurement, not on a fix that pre-empted it.*

> **STANDING INSTRUCTION FOR ALL FIVE (coding lane's, adopted): report the writer, the terms and the
> provenance. Rule nothing, fix nothing, and do not improve the label on the way past. A finding in a
> measurement's output is not a finding of the measurement, and a zero result is a claim about the
> pattern searched, never about the tree.**

---

## NO SMOKE — EXCEPT ONE

**Part 0 changes nothing, so there is nothing to smoke.** **Part 1b changes one row: the smoke is
opening the share URL in a private window and reporting what it serves.** *One step, one entry
point, one observable result.*

---

**Strategy, 2 October 2026. Everything above points at `open-items.md`; nothing here is new, only
ordered.**
