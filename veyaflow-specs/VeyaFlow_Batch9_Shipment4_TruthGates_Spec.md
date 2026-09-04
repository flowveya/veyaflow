# VeyaFlow — BATCH #9 SHIPMENT 4: THE TRUTH GATES

**3 September 2026 · coding lane → CC · five items, one surface**
**Approved by Strategy 3 Sep (evening). This is the shipment that lets a Brand Pack
leave the house again — which is why #93 rides with it and not after it.**

---

## NAMED BASELINE

```
index.html   sha256   be86c431c632557aeb50eaa546b75a1a637ab8fc6a79d5a8788b9c6fccd39c2b
             short    be86c431
             41,100 lines · 2,708,821 bytes · 2 inline <script> blocks (1176, 39582)
```

**This is a value I am naming.** Branch `f2b-async`, at `d831a18`. Anything else: stop,
report, wait.

### BASELINE FOR ITEM 6 — different, because items 1–5 have shipped

Items 1–5 were applied, verified and committed on 4 Sep as `62aaa80` (code) and
`145d386` (baseline). **Item 6 starts from the post-shipment tree:**

```
index.html   sha256   ef786f2a2987ee22582b82f5a9c528b822cd7067fea18011fc1d0f64122c69c2
             short    ef786f2a
             41,254 lines · 2,718,898 bytes · 2 inline <script> blocks (1176, 39736)
```

**This is a value I am naming.** If you are picking this spec up for item 6 only, that is
your baseline — not `be86c431`.

---

## WHY THESE FIVE TOGETHER

Nothing leaves the house that cannot be evidenced, and what leaves can point back.
Item 5 (#93) is here because **the first pack generated after this shipment is the first
whose Document ID has to mean something.** Landing it later means deliberately issuing
documents we plan to invalidate.

---

## ITEM 1 — #107 · the broken counter (mechanical, certain)

`index.html:16869`:

```js
_COMPLIANCE_CERTAINTY_PATTERNS.forEach(re=>{ const m=text.match(re); if(m){ … push(tok); } });
```

Those patterns carry `/i` and **no `/g`**, and `.match()` on a non-global regex returns
only the first hit — so **at most one occurrence per pattern is ever flagged**, however
many times the claim repeats. The number patterns at 16868 do it correctly with
`while((m=re.exec(text))!==null)`.

**Fix:** make the compliance patterns global and iterate them the same way 16868 does.
Report whether making them global changes behaviour anywhere else — `lastIndex` on a
shared global regex is stateful across calls, and these constants are module-level.
That is the one way this small fix can go wrong.

---

## ITEM 2 — #106 · the regulatory-prose gate (the ruling, not a repair)

**Do not extend the blocklist.** `_COMPLIANCE_CERTAINTY_PATTERNS` is a list of certainty
phrasings (`verified`, `fully compliant`, `substantiated?`) and the model did not hedge —
it stated plainly: *"is registered as a Swedish operator"*, *"complies with GPSR"*,
*"Clinical substantiation file available"*. It missed the third **by one word-form**.
A blocklist is a prompt instruction wearing different clothes: it fails open on whatever
nobody enumerated. Strategy §1 requires structural incapacity, which is a higher bar.

**Fix — fail closed.** Add a check that AI prose contains **no regulatory-status
vocabulary at all**, and gate on it. Vocabulary to detect (extend as scouted, do not
narrow): registered / registration · complies / compliant / compliance · certified /
certification · CE mark · declaration of conformity · notified body · technical file ·
substantiation / substantiated · Responsible Person · economic operator · CPNP · GPSR ·
MDR · LVD · EMC · RoHS · WEEE · REACH.

**It applies to ALL AI prose, not the compliance section.** *"Registered as a Swedish
operator"* appeared in **Brand Overview**. A section-scoped check misses it.

### THE GATE DOES NOT TRY TO TELL A CLAIM FROM A QUESTION — Strategy, 3 Sep

The lane raised the obvious difficulty: the gate must catch *"complies with GPSR"* while
sparing *"Buyer must confirm whether the mask falls under GPSR"* — a claim and a question,
identical vocabulary. **Strategy ruled that the gate does not attempt the distinction, and
the reasoning matters more than the rule:**

> A detector that separates assertion from question is making a **semantic judgement on
> exactly the surface where we have just ruled the model may not judge.** A gate that
> guesses is formulating.

So: **if prose on a compliance-bearing surface contains regulatory vocabulary at all, it
does not render there.** No exceptions, no cleverness, no confidence threshold.

**The meaning is not lost, and this is the part to understand before implementing.**
*"The buyer must confirm whether the mask falls under GPSR"* **is not prose** — it is a
`not_recorded` in the verified rows. It is an open item with a `checkState`, which is
where a question about regulatory status belonged from the beginning. The gate does not
delete that question; it moves it to the surface that can carry it honestly.

**Do not build a claim/question classifier. Do not add a confidence score. Do not ship a
list of exceptions.** Any of those reintroduces the judgement this ruling removes.

---

## ITEM 3 — #56 · gate, not warn

**Ruled by Strategy 3 Sep.** The evidence arrived while the question was open:
`[FLAG_COPY]` printed on buyer-facing covers for days and packs kept generating. A flag
the **buyer** sees that does not stop the document is worse than no flag — it shows the
customer our internal uncertainty and ships the document anyway.

Today, `index.html:17110` stores the verdict:

```js
brandPackState.verify = verifyBrandPackProof(text, _bpAllowed, complianceData);
```

…and `17139–17141` renders a red banner when `!verify.clean`. **Nothing acts on it.**

**Fix:** when `verify.clean === false`, the pack does not render and does not export.
Show the brand what was flagged and why, in the app, with a way to correct the data and
regenerate. The `[FLAG_COPY]` string must **stop reaching the PDF at all** — a document
that ships with an internal QA annotation on its cover is the failure this ruling ends.

`honestyFlagCopy` is called at **17140** (in-app), **25354** (pitch) and **30378** (PDF
cover). Only the Brand Pack paths are in scope. **Report what gating the pitch path would
require; do not change it.**

---

## ITEM 4 — #105 · completeness, and the ceiling behind it

Three generations, three truncations, always the final section:
`positions at **Step` · `| Step` · and worst, `veyaflow.com/dpp/vf-1` — **a severed
passport URL inside a compliance section.** An assertion leading nowhere, automatically,
with nobody having clicked.

**The probable cause, found while scouting:** every long-document generator calls
`callAPI(prompt, 1400)` — a max-output ceiling. Brand Pack is **17104**. Running out of
budget mid-final-section is exactly this symptom.

**Two halves, both required:**

**4a — the gate (Strategy's ruling).** A completeness check on the generation output
**before rendering**. If the response ends mid-token, the document does not render at
all. Better no document than a severed one. Signals to test for, in order of reliability:
an unterminated markdown construct (unpaired `**`, an unclosed `|` table row), a final
line with no terminal punctuation, a response whose length is at the token ceiling.

**4b — the ceiling.** Report what `1400` actually costs: how many tokens the Brand Pack
prompt asks for across its five sections, and what ceiling would fit them. **Do not raise
it in this shipment** — that changes generation cost and output length on every document
and needs its own before/after. Report the number.

**Known in advance, so nobody reads it as a regression (Strategy, 3 Sep):** if the ceiling
is the cause, **this gate will block packs that previously rendered.** That is the correct
outcome, not a fault — it converts a silent defect into a visible blocker. It also means
the ceiling work is the **next** shipment, not "sometime".

**Conditional ruling, decided on your measurement and not before:** the choice between
raising the ceiling and generating section-by-section with a per-section budget is made
**on the number you report in 4b**. Report the measurement; do not pick the approach.

**Scope — and this is the part most likely to be got wrong.** The check must **not** live
in one generator. Brand Pack, `generateBizCasePDF` and the magic-link path all generate,
and only Brand Pack was touched today. A check in one of them repeats exactly the copied-
pattern problem that produced #96, #97 and #104.

I have verified **17104** (Brand Pack). I have **not** exhaustively enumerated the others —
there are 20+ `callAPI` sites and only some build multi-section documents.
**Enumerate every call site that builds a multi-section document from a `callAPI`
response, report the list, and put the check in a shared helper all of them call.**
If a site cannot use the shared helper, say why rather than duplicating the check.

---

## ITEM 5 — #93 · the integrity stamp field list

`_ssCanon` at **29786** hashes identity, technical and commercial fields, claim verdicts
and `brand.euResponsible.name` — and **omits** `sku.cpnp`, `sku.safetyRef`,
`brand.euResponsible.renewalDate`, `sku.euResponsible` and `sku.certifications`. Almost
the entire Regulatory status section sits outside the fingerprint the footer advertises,
while the device's `ceMarking` and `docOnFile` are inside it.

**Sized conclusively on 2 Sep**: changing `ceMarking` moved the ID `916a40d70242 →
64898e75186e` and setting it back returned it **exactly**, across separate generations.
The mechanism is content-derived, stable and reproducible. **Only the field list is
wrong.** Reproduced again on 3 Sep: a serum sheet showing `CPNP-2025-0231233` still
carried `56220dbef259`, the same ID as the version with no CPNP.

**Fix:** add the five omitted fields. **Plus a sixth the lane found on 3 Sep and which is
not in the original finding:** `sku.productType` is absent — the payload carries only
`dev:isDevice`, a boolean. Changing a SKU from `cosmetic` to `beauty_accessory` leaves
`isDevice` false and **the Document ID does not move**, while the operator row, the
vocabulary and the regime printed on the page all change, because those route through
`resolveProductFramework`. Add the **resolved framework**, not the boolean.

**This changes every Document ID the app produces.** That is free today and permanent
once a document has gone to a real retailer — which this shipment enables. Report the
before/after ID for one unchanged SKU so the change is evidenced rather than assumed.

**#108 — the boolean is an instance of a pattern, not a one-off (Strategy, 3 Sep).**
This is the **third** time a boolean stands proxy for a regime: `isCosmetic` at L29517
(CPNP gated, EU RP not), `isCosmetic` in `runLabelScan` (#87 — dead but still readable),
and now `dev:isDevice` in `_ssCanon`. **Standing instruction: a surviving boolean regime
proxy is a finding on sight**, and the class is fixed as a family rather than one at a
time — this error type comes from reasoning that ran out, not from carelessness.

**In this shipment, fix only `_ssCanon`.** Report any other boolean-regime-proxy you pass
while working; #108 is the sweep and it is a separate batch. Do not fix them here.

---

## ITEM 6 — remove SECTION 5 from the Brand Pack prompt

**Added by Strategy 4 Sep, after the gate refused its first pack.** This is not a
separate shipment: the whole purpose of this shipment is to let a Brand Pack leave the
house again. Shipping the gate without removing section 5 means **no pack can ever
leave**, and the shipment fails at its own purpose. Same change, same delivery.

### Why no wording survives

The section 5 prompt is already hardened — *"Render ONLY the items in the COMPLIANCE DATA
block… NEVER render it as ✓, 'Confirmed', 'Complete', or 'substantiated', and NEVER invent
dates, audit results, or substantiation."* It produced a fabricated Swedish operator
registration anyway. That is §0 demonstrated, not disputed.

But the gate does not fire on fabrication — **it fires on vocabulary**, and the same
section instructs: *"briefly note what the status means operationally — what the retailer
should confirm, what remains outstanding."* That cannot be written without regulatory
vocabulary. Even a perfectly honest line — *"Certifications: none on file; retailer should
request LVD/EMC/RoHS documentation"* — carries three blocked terms.

**Section 5 is regulatory prose by construction.** No rewording survives the gate,
because the gate is correctly catching the category.

### The fix

Delete `## SECTION 5 — Compliance & Sustainability` (currently **17158–17175**) from the
prompt. Renumber sections 6 and 7 to 5 and 6. The `Digital Product Passport: published
at …` line at **17173** goes with it.

Note the section number is cosmetic in output — `title:lines[0].replace(/SECTION \d+ — /,'')`
strips it — but renumber anyway so the prompt does not present the model with a gap.

### THE REMOVAL IS NOT LOSSLESS — and this must not be recorded as if it were

Section 5 carried **two** things:

1. **A prose duplicate of page two's verified rows.** This goes without cost; page two
   already carries it, built from saved data.
2. **A translation** — what the status means *operationally*, what the retailer should
   confirm, what remains outstanding. **This does not exist in the verified rows.** Per §8
   of the AI direction it is not decoration; it is *the product*: the brand thinks in
   products, the retailer thinks in articles, and the translation between them is what
   VeyaFlow is for.

**Calling the whole section a duplicate would silently close a capability by renaming
it.** It is not being deleted, it is being moved off a surface that cannot carry it.

**It goes in the queue as a STRUCTURED FIELD** — one open item per compliance row,
carrying `not_recorded` via `checkState`, which is where a question about regulatory
status belonged from the start. **Never as generated text again.** Record it in
`CODING_STATUS.md` as an owed capability, not as a removed section.

### #103 IS NOT CLOSED BY THIS

Removing 17173 removes **one occurrence**, not the class. `DPP_CANONICAL_ORIGIN` is read
at **ten** sites, including the DPP PDF's own `section('Digital Product Passport')` at
**35724**. #103 stays open until the surface is swept.

*Correction to the ruling's evidence, checked at the bytes:* Strategy cited a second
occurrence "appended to the prompt at L16832, outside `complianceData`". That line in the
current tree is a regex inside `_COMPLIANCE_CERTAINTY_PATTERNS`, and no second
`Digital Product Passport: published at` exists anywhere in the prompt. The reference is
from a pre-shift tree. **The conclusion stands on the ten read sites instead.**

**And the line gets no new home while the domain is parked.** Do not relocate it into the
verified rows.

---

## OUT OF SCOPE — report only

- **The fourth and fifth copies of the preamble defect.** `renderBrandPackResult` at
  **17133** has `split(/^## /m).filter(length>10)` with no `slice(1)` and no `stripMd` —
  the in-app view carries #96A/#96B, unfixed. `generateBizCasePDF` and the magic-link path
  at 25938 carry them too. Report; do not fix.
- **#96C** — the `stripMd` extension. Still held: it moves Business Case output.
- **`generateBizCasePDF`'s `||'Denmark'` (15814) and `||'Market'` (30531)** — the #104
  defect, live in a second buyer-facing document.
- **Prompts.** Do not edit any prompt string. #88 and #76 are the prompt sweep.

---

## STOP. NO COMMIT.

Apply, stop, report. Five items is more than one edit — apply them in the order above and
report each separately, so a failure in one can be isolated without unpicking the rest.

---

## REPORT BACK

1. sha256 before editing; confirm it matched `be86c431`.
2. Before/after for every changed line, grouped by item.
3. **Item 1:** whether making those patterns global affects anything else (`lastIndex`).
4. **Item 2:** the vocabulary list you implemented, and every place AI prose reaches a
   compliance-bearing surface. **Do not report on claim-versus-question** — that
   distinction is ruled out of the gate; report instead whether any surface you found
   cannot be gated without also removing legitimate non-regulatory prose.
5. **Item 4:** the full list of multi-section document generators, and the token cost of
   the Brand Pack prompt against the 1400 ceiling.
6. **Item 5:** before/after Document ID for one unchanged SKU.
7. **Item 6:** the exact prompt lines removed; confirmation that sections 6 and 7 were
   renumbered; and that **no** compliance content was relocated into another section or
   into the verified rows. Moving it would defeat the removal.
8. **Item 6:** every other place the prompt still asks for regulatory content, if any.
   The gate refusing a pack after this change would mean the vocabulary is entering from
   a section nobody scouted.
9. Anything noticed and not fixed.

---

## VERIFY

```
cd ~/claude-code-test
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `be86c431`; the lane names the new value.
Guards, AST references unless marked RAW: `_operatorRow` 10 call sites · `_dppIsPublished`
1 definition / 4 call sites · both blocks parse clean, block count 2 · **RAW**
`[FLAG_COPY` count — report it, it may legitimately change.

**Then, before smoking:** `git rev-parse HEAD origin/coding-aug2026` must print the same
value twice, and Netlify must list that commit as Published. Two smoke rounds were lost
on #95 to code that existed only on the laptop, and a branch check would have caught a
third confusion today.

---

## SMOKE — `veyaflow.netlify.app`, hard-refresh (Cmd-Shift-R)

**1 · The gate holds.** Generate a Brand Pack with the LED Face Mask as hero. If the
verify is unclean, **no pack renders and no PDF exports** — the app shows what was flagged
and offers to correct it.
*Failure: a pack rendering, or a PDF exporting, with a flag raised.*

**2 · No `[FLAG_COPY]` reaches a PDF.** If a pack does generate, its cover carries no
bracketed internal annotation.
*Failure: any `[FLAG_COPY`, `[BASKET_PROVENANCE` or `[HONESTY_BANNER` string in the PDF.*

**3 · No fabricated regulatory status.** In any pack that generates, no prose asserts
registration, compliance, certification or the existence of documentation. Cross-check
page two: whatever the verified rows say is the only regulatory claim in the document.
*Failure: prose asserting a status page two says is absent.*

**4 · Nothing severed.** No page ends mid-sentence, mid-token or mid-URL.
*Failure: any truncation — this is the finding, not a cosmetic issue.*

**5 · The Document ID moves on a regulatory field.** Generate a spec sheet for the serum,
note the Document ID. Add or change the CPNP number. Regenerate. **The ID must change.**
Set it back. **The ID must return to the original value.**
*Failure: an unchanged ID — #93 is not fixed.*

**6 · The step that passes only if nothing changed.** Page 2's Compliance Status:
`EU-established economic operator` in full, a gap, `Not set`; short rows at the same
x-position. Page 3 a real section. Market on every surface including AI pages.
*Failure: any movement. Three shipments landed in these functions today.*

Send the PDFs, not a verdict.
