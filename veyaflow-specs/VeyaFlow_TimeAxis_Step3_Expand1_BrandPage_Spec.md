# VeyaFlow — Time axis step 3: expand phase 1, `brand/index.html`

**7 September 2026 · coding lane → CC**

First surface of expand → migrate → contract. **One site. Behaviour-neutral by requirement:
the rendered HTML must be byte-identical against today's data.**

This step also **establishes the canonical tolerant reader** that the remaining surfaces copy
verbatim. Getting its shape right matters more than the one line it serves.

---

## NAMED BASELINES

```
index.html                           9eb3da6917ba6ec516a846006f27d5579418edb730636a2d1fc5b9589c9c71e7
dpp/index.html                       6e946a279f2d43827bfba12a3994ba0400cc4983b658a065dca4760bde21357d
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     1e99d32c74b373a46bb02103ed9847ba81749d841c9dc942d012968dd487f775
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
```

Branch `f2b-async` at `9a8b6ef`. **Confirm all five. Only `brand/index.html` moves.**

---

## SEQUENCE CORRECTION — THE PROXY IS OUT

The scout proposed `netlify/functions/supabase-proxy.js` as expand step 1. **It is not in the
migration at all.** Its single `certifications` is at line 247, inside a manufacturer listing
application:

```js
country, city, website, specialisms, certifications, moq, status: 'pending_review'
```

That is **third-party reference data** — a manufacturer applying to be listed — and the
scout's own population table placed `requestListedForm` / `f.` in the third-party column. The
sequence and the population analysis disagreed. Under Strategy's boundary rule the proxy is
**permanently out of scope**, not merely later.

**Revised order:** `brand/index.html` (1) → `dpp/index.html` (3) → `index.html` (45, split).
`portal.html` and the proxy: no shipment, ever, for this migration.

---

## THE SITE

`brand/index.html:223` — **buyer-facing**:

```js
${(sku.certifications||[]).length
  ? `<div style="margin-top:.35rem">${sku.certifications.map(c=>`<span class="vf-cert">${esc(c)}</span>`).join('')}</div>`
  : ''}
```

`esc(c)` on an object renders **`[object Object]`** to a retail buyer. That is what the expand
phase prevents — this surface must tolerate the new form *before* anything writes it.

---

## THE CANONICAL READER — THREE SHAPES, NOT TWO

The scout found `sku.certifications` already appears in the wild as a bare comma-separated
string (`index.html:29957/29962` test `Array.isArray` and fall back). So the reader normalises
**three** inputs to `string[]`:

| input | today | normalised |
|---|---|---|
| `['COSMOS Organic','Ecocert']` | the common case | unchanged |
| `'COSMOS Organic, Ecocert'` | legacy | split and trimmed |
| `[{name:'COSMOS Organic', …}]` | the target form | `['COSMOS Organic']` |

**Requirements on the reader:**

- **Returns `string[]`, always.** Never null, never undefined, never a mixed array.
- **Order preserved exactly.** `_ssCanon` later sorts a normalised array into a hashed
  Document ID; if normalisation itself reorders, that hash moves. Not this surface's problem —
  but it is this reader's contract, and this is where the reader is defined.
- **An entry with no usable name is dropped, not rendered as empty.** An empty `<span
  class="vf-cert"></span>` is a badge asserting a certification with no name.
- **Pure.** No DOM, no storage, no dates. It normalises a shape; it does not interpret one.
- **Name it once and keep the name across all three surfaces** — the copies must be
  diff-comparable.

**Do not read `validUntil`, `verifiedDate` or any date here.** Expand tolerates the shape.
Rendering anything the new form carries is the migrate phase at the earliest, and validity
rendering is a separate Strategy ruling that has not been made.

---

## THE DUPLICATION PROBLEM — NAME IT NOW, GATE IT NEXT

These are separate HTML files with inline scripts and no module system, so the reader will
exist in **three copies**. #128 was decided this afternoon on exactly this hazard: a duplicated
file diverged, and the copy that rotted was the one nobody was overwriting.

**Requirement: the three copies must be byte-identical**, including comments and whitespace, so
that a diff between surfaces is a meaningful check.

The gate cannot exist yet — one copy cannot differ from itself. **It lands with `dpp/index.html`
in expand phase 2**, asserting the reader's source text is identical across all surfaces that
carry it. That gate *can* fail, which is why it is worth building, unlike the one correctly
declined for #128.

**Report** the exact text to be copied, so phase 2 copies rather than rewrites.

---

## REPORT, DO NOT IMPLEMENT

1. **The behaviour-neutrality evidence.** Render the site against today's data before and
   after. **The HTML must be byte-identical**, not "looks the same". State how you established
   it.
2. **Whether `esc` behaves identically** on the normalised output. If the reader ever returns a
   non-string, `esc` may differ — so the "always `string[]`" contract needs proving, not
   asserting.
3. **Where the reader should live in `index.html`** when phase 3 arrives — that file has 45
   sites and one of them is `_ssCanon`. Report only; do not place it.

---

## OUT OF SCOPE

- `dpp/index.html`, `index.html`, `portal.html`, the proxy.
- The writer (`toggleSkuCert`) — migrate phase.
- Anything reading `expiryDate`, including `buildComplianceEvents` and
  `renderComplianceCalendar`. **They are in `index.html` and they already read that field**;
  they are phase 3's problem and they need their own ruling.
- Third-party reference data. Permanently.

---

## STOP. NO COMMIT.

One site, one reader, three reports.

---

## REPORT BACK

1. sha256 of all five before and after — **only `brand/index.html` differs**.
2. The reader's full source text, verbatim, for phase 2 to copy.
3. Before/after for line 223.
4. The three reports. **Report 1 is the finding** — if the HTML is not byte-identical, the
   expand phase is not behaviour-neutral and the plan needs rethinking.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `brand/index.html` DIFFERS from `1e99d32c` — **its first move since batch #5**;
all four others UNCHANGED; `1 of the 5 tracked surfaces modified`.

---

## SMOKE

**Step 1.** Open a shared brand page with SKUs carrying certifications. The badges render
exactly as before.
*Failure: any change at all — different text, order, spacing, or a missing badge.*

**Step 2 — the step that proves tolerance rather than luck.** In the console on that page,
pass the reader an object-form array and a bare comma-separated string. Both return the same
`string[]` shape.
*Failure: `[object Object]`, an empty string in the array, or a non-array return.*

**Step 3.** A SKU with no certifications renders no badge row, as before.
