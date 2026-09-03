# VeyaFlow — FINDINGS #96, #57 AND #97, FIX SPEC

**3 September 2026 · coding lane → CC · batch #9, second shipment**

Confirmed live three times on 3 September, in Brand Packs generated for Normal,
Lyko and Matas. Every defect below was observed in a generated PDF, not inferred.

---

## NAMED BASELINE

```
index.html   sha256   844d3887ccc22c15679fad5c79d7e60e174a52fe3b9526d4aa6ffa2528f4558d
             short    844d3887
             41,066 lines · 2,705,805 bytes · 2 inline <script> blocks (1176, 39548)
```

**This is a value I am naming.** It is the post-#95 tree at `eada442`. If your copy
hashes to anything else: stop, report, wait.

---

## THE DEFECTS — four causes, one apparent symptom

All four live in `downloadBrandPackPDF`, between lines 30302 and 30470.

### A · The section title never passes through `stripMd` (L30307)

```js
const sections = (brandPackState.result||'').split(/^## /m).filter(s=>s.trim().length>10).map(s=>{
  const lines=s.split('\n'); return {title:lines[0]..., body:stripMd(lines.slice(1).join('\n').trim())};
});
```

`body` is stripped. `title` is not. A title line beginning `#` keeps its hash and is
then rendered at heading size by `pdfHeader`, where it collides with the running
header. **Observed:** page 3 of all three packs.

### B · The preamble becomes a phantom section (L30306)

`.split(/^## /m)` returns everything before the first `## ` as element 0. The model
opens with a document title (`# CLOUD & GLOW — BRAND PACK FOR LYKO`), so element 0
is that title plus whitespace — over 10 characters, so it survives the filter and
becomes a section with a `#` title and an empty body.

**Observed:** page 3 is a hash-prefixed heading over a blank page, in every pack.
A and B compound: A keeps the hash, B creates the page it sits on.

### C · `stripMd` handles four constructs and the model emits seven (L30157)

```js
.replace(/\*\*([^*]+)\*\*/g,'$1')   // bold — PAIRED ONLY
.replace(/\*([^*]+)\*/g,'$1')       // italic — PAIRED ONLY
.replace(/^#{1,4}\s/gm,'')          // headings
.replace(/^[-•]\s/gm,'• ')          // bullets
```

Not handled: **horizontal rules** (`---`), **tables** (`| … |` and `|---|---|`),
and **unpaired** emphasis markers.

**Observed:** a stray `---` closing every content page; raw pipe tables on Lyko p6/p7,
Matas p6/p7/p9, Normal p5/p8; and `positions at **Step` where an unpaired `**`
survived because the regex requires a closing pair.

### D · Fallback placeholders print as data (L30302–30303)

```js
const retailer = brandPackState.retailer||'Retailer';
const market   = brandPackState.market||'Market';
```

When `brandPackState.market` is empty the pack tells the buyer the target market is
**"Market"** — in the cover line, the running subheader of all ten pages, and the
`Target market` row of the Brand Snapshot.

**Observed:** Normal and Matas packs throughout. The Lyko pack had a market set and
correctly read "Sweden", which is what makes this a fallback defect rather than a
rendering one. `retailer||'Retailer'` is the same defect, latent.

This is a truth defect, not a cosmetic one: the document states a fact about the
brand's commercial intent that the brand never entered.

---

## THE FIX

### A · Strip the title

Pass the title through `stripMd` on the same line it is built. Do not write a second
stripper — the standing principle in the comment at L30172 is *enhance shared
helpers, don't fork them*.

### B · Drop the preamble

Discard element 0 of the split when it contains no `## `-derived title — i.e. the
text before the first section marker is document preamble, not a section. Do not
raise the `length>10` threshold; that is a magic number that would silently drop a
real short section instead.

### C · Extend `stripMd` — carefully, because it is shared

`stripMd` is called at **30307**, **30501** and **30608**. Two of those are other
generators. Extending it changes their output too, so:

- Remove standalone horizontal rules (a line of three or more `-`, `*` or `_`).
- Convert table rows to plain text: drop separator rows (`|---|---|`), and render
  content rows as their cell values joined by ` · ` with outer pipes removed.
- Remove unpaired `**` and `*` markers left after the paired passes.

**Report the effect on the other two call sites before shipping.** If the change
would move output in the Market Entry Report or the Business Case, say so and stop —
that is a separate ruling, not something to absorb here.

### D · Omit rather than invent

Replace the `||'Market'` and `||'Retailer'` fallbacks with an explicit unset check,
and **omit** the market from the cover line, the running subheader and the Brand
Snapshot row when it is not set. House rule: omit-beats-caveat. Do not substitute
`'Not set'` in the subheader — a header reading `Cloud & Glow · Matas · Not set`
is noise on all ten pages.

The row in Brand Snapshot may read `Target market  — not set` if a row is required
for layout; the header and cover line must simply drop the segment and its separator.

---

## OUT OF SCOPE — report only, do not fix

- **The bracket annotations.** `[BASKET_PROVENANCE: …]` at **L30448** is written
  deliberately by the code, as is `[FLAG_COPY: …]` and `[HONESTY_BANNER_BRANDPACK: …]`.
  These are not escaping failures — they are internal-token-styled copy shown to
  buyers, which is a design decision and belongs to **#56**, which Strategy has not
  yet ruled on (gate-vs-warn). Leave every one of them exactly as it is.
- **The mid-sentence ending on the last page.** `Cloud & Glow LED Face Mask positions
  at **Step` — the unpaired `**` suggests the model's response itself was cut, not
  that the PDF truncated it. Nothing detects or reports a truncated generation.
  Diagnose and report; do not fix. Its own finding.
- **`Annual revenue 2500000 SEK`** — unformatted, deterministic path, not markdown.
- **The AI-prose regulatory contradictions** (GPSR "not applicable" on Lyko p9 versus
  "buyer must confirm" on Matas p9; "Product type not set" in prose while page 2
  prints the device regime). Serious, separate, and pending Strategy.
- **`pdfKeyValue` and the other two-column renderers** — held since #95.

---

## STOP. NO COMMIT.

Apply, then stop. Do not commit, do not push, do not fix anything else you notice.

---

## REPORT BACK

1. The sha256 before you edited, and that it matched the baseline named above.
2. Before and after text of every changed line.
3. **The effect of the `stripMd` change on its other two call sites (30501, 30608)** —
   which generators they belong to, and whether their output moves. This is the
   question most likely to make the batch wrong.
4. Confirmation that no `[FLAG_COPY`, `[BASKET_PROVENANCE` or `[HONESTY_BANNER`
   string was touched.
5. Whether element 0 of the split can ever contain a legitimate section, and how you
   satisfied yourself either way.
6. Anything noticed and not fixed.

---

## VERIFY

```
cd ~/claude-code-test
./verify.sh
```

Expected **GREEN**, `index.html` **DIFFERS** from `844d3887`. The lane names the new
value before any commit.

Guards, AST references unless marked RAW:

- `stripMd` — 1 definition, **3 call sites** (30307, 30501, 30608), unchanged in count
- `pdfWrap` — 1 definition, call count unchanged
- `_operatorRow` — 10 call sites, unchanged
- Both blocks parse clean; block count 2
- **RAW**: `[FLAG_COPY`, `[BASKET_PROVENANCE`, `[HONESTY_BANNER_BRANDPACK` —
  occurrence counts unchanged

**And this time, before smoking:** confirm `git log --oneline origin/coding-aug2026 -1`
shows the commit, and that Netlify's Deploy tab lists it. Two smoke rounds were lost
on #95 because the change existed only on the laptop while the battery said GREEN.

---

## SMOKE

Origin `veyaflow.netlify.app`, in the browser holding the Cloud & Glow data. Hard-refresh
(Cmd-Shift-R) — `index.html` *is* the app, so a normal reload serves the cached one.

Menu → **MY BRAND → Brand Pack**. Generate twice.

**Step 1 — target market SET (e.g. Sweden, as the Lyko pack had).**
Cover reads `Prepared for <Retailer> · Sweden`. No page consists of a hash-prefixed
heading over blank space. No page ends with a stray `---`. No `|` table rows anywhere.
*Failure: any `#`, `---` or `|` visible as literal text.*

**Step 2 — target market NOT set.**
The cover line and every running subheader **omit** the market segment entirely.
`Target market` does not read "Market".
*Failure: the word "Market" appearing anywhere as if it were a market name.*

**Step 3 — the step that passes only if nothing changed.**
The Compliance Status block on page 2 must be unchanged from the Matas pack of
3 September: `EU-established economic operator` in full, a gap, `Not set`; and
`Technical file` / `Certifications` values at the same x-position. #95 shipped hours
ago and this batch touches the same function.
*Failure: any horizontal movement in that block.*

Send the PDFs, not a verdict.
