# VeyaFlow — FINDING #95, FIX SPEC

**3 September 2026 · coding lane → CC · batch #9, ships FIRST**

A regression this lane introduced in batch #8 and signed off green. Every guard
passed — acorn clean, thirteen call sites byte-identical, all counts correct —
over a document that overprints itself. Byte verification checks what a string
*says* and cannot see where it *lands*.

---

## NAMED BASELINE

```
index.html   sha256   a7f44f073b3a425669c2054aacc878e8dfb819a6d380b6d582d92d903184b5b5
             short    a7f44f07
             41,054 lines · 2,704,870 bytes · 2 inline <script> blocks (1176, 39536)
```

**This is a value I am naming.** If your copy hashes to anything else: stop,
report, wait. A sha you computed and judged plausible is not sufficient.

---

## THE DEFECT

`index.html:30419–30423` — the Brand Pack PDF's Compliance Status rows:

```js
compRows.forEach(([l,v,ok])=>{
  pdfSetFont(doc,'label'); doc.setTextColor(120,120,120); doc.text(l,margin,y);
  pdfSetFont(doc,'body');  doc.setTextColor(...);         doc.text((ok?'✓ ':'')+String(v).slice(0,45), margin+38, y);
  y+=5.5;
});
```

The label is drawn at `margin`. The value is drawn at a **fixed** `margin+38`.
Nothing measures the label, so a label wider than 38mm runs under the value.

**Geometry.** `margin=14`, `pageW=210`, `contentW=182` (30301). The label font is
`helvetica bold 8pt` (`pdfSetFont` map, 29486). 38mm ≈ 107.7pt, which fits about
24 characters of Helvetica Bold at that size.

**The four labels that can reach this column** (`compRows`, 30402–30418):

| Source | Label | Chars | Fits 38mm |
|---|---|---|---|
| `getNotificationRegime().label` | `CPNP` | 4 | yes |
| `_operatorRow(heroSku,'EU Responsible Person')[0]` | `EU Responsible Person` | 21 | yes |
| `_operatorRow(...)` for device/accessory | **`EU-established economic operator`** | **31** | **NO — overruns by ~11mm** |
| `getSafetyDocRegime().label` | `Safety Assessment` / `Technical file` / `Safety documentation` | ≤20 | yes |
| literal | `Certifications` | 14 | yes |

So the defect fires **only when the hero SKU is a device or accessory** — the
exact case batch #8 created. Observed output on a pack shipped 2 September:

```
EU-established economic opNot set
```

---

## THE FIX

In the `compRows.forEach` at 30419–30423 **only**, compute the value column
instead of hardcoding it:

1. After drawing the label, measure it with `doc.getTextWidth(l)` **while the
   label font is still active** — the measurement is font-dependent and taking it
   after `pdfSetFont(doc,'body')` would measure the wrong face.
2. Start the value at `margin + Math.max(38, labelWidth + 2)`.

`doc.getTextWidth` is already used in this file at 30204, 30272 and 30279 — this
is an existing technique, not a new dependency.

### Why `Math.max(38, …)` and not a wider fixed column

**Because it cannot move cosmetic output.** For every label that already fits,
`labelWidth + 2` is less than 38, the max returns 38, and the value lands on
exactly the pixel it lands on today. Only the 31-character device label moves.

That is the verification signal this lane runs on: the cosmetic path must be
provably unchanged, and here it is unchanged *by construction* rather than by
inspection. A wider fixed column — say `margin+52` — would fix the overlap and
move every cosmetic row at the same time, and there would be no way to tell a
correct fix from a careless one.

### Headroom check, so the fix does not create the next defect

Longest label 31 chars ≈ 49mm, so the value starts at ~51mm. The value is capped
at 45 characters ≈ 71mm at `body` 9pt. 51 + 71 = 122mm against `contentW` 182.
Fits with ~60mm spare.

---

## OUT OF SCOPE — do not touch, report only

**`pdfKeyValue` (30146) and the other three two-column renderers.** This is the
real root and it is deliberately held:

| Line | Renderer | Label column | Value wraps? |
|---|---|---|---|
| 30146 | `pdfKeyValue(doc,label,value,x,y,labelW)` — the shared primitive | caller-supplied | no |
| 30421 | Brand Pack compliance rows — a hand-inlined copy of the above | 38 | no, truncated at 45 chars |
| 29691 | Spec sheet `row()` | 52 | yes, via `pdfWrap` |
| 35478 | DPP PDF `section()` | 65 | yes, via `splitTextToSize` |

Four implementations of one idea, **none of which measures the label**. The other
three are safe only because their labels are short today — the spec sheet clears
the same 31-character label by roughly 3mm.

**Held because fixing the primitive changes documents that currently render
correctly.** Moving output on a correct document to fix a different document is
exactly what the cosmetic-path guarantee forbids doing casually. It needs its own
spec, its own baseline and its own before/after PDFs. Recorded as a new finding —
number it and queue it; do not fold it in here.

**Also held:** `String(v).slice(0,45)` on line 30421 is a silent mid-word
truncation — the same family as #60. Real, not in this spec, do not fix.

**Also held:** everything else in the Brand Pack PDF batch (#56, #96, #97).

---

## STOP. NO COMMIT.

Apply the edit to `index.html` and stop. Do not commit. Do not push. Do not fix
anything else you notice in that function.

---

## REPORT BACK — state each of these

1. The sha256 of `index.html` **before** you edited, and confirmation it matched
   the baseline named above.
2. The exact before and after text of every line you changed.
3. The number of lines changed. Expected: the two `doc.text` lines and whatever
   you add to measure. If it is more than 4, say why.
4. Confirmation that `margin+38` no longer appears in the file **as a value
   column**, and whether the literal `38` survives inside the `Math.max`.
5. That you changed nothing inside `compRows` itself (30402–30418) — the rows,
   labels and values are not in scope, only where they are drawn.
6. Anything you noticed and did not fix.

---

## VERIFY — Charlotte runs, and pastes the whole output

```
cd ~/claude-code-test
./verify.sh
```

Expected: **GREEN**, with `index.html` **DIFFERS** from the named baseline — this
spec ships an edit, so a moved digest is correct here. The lane will name the new
value before any commit.

Guards that must hold, all counting **AST references** unless marked RAW:

- `_operatorRow` — 1 definition, **10 call sites**, unchanged
- `_operatorValueFor` — 1 definition, 4 call sites, unchanged
- `getNotificationRegime` / `getSafetyDocRegime` — 1 definition each, unchanged
- `FRAMEWORK_VOCAB` — 1 definition; **RAW count 2**, unchanged
- Both inline blocks parse clean; block count 2

The lane will additionally read 30386–30425 directly, because the battery cannot
see a fixed offset becoming a computed one.

---

## SMOKE — the step that matters more than the battery

Origin: **`veyaflow.netlify.app`**, in the browser holding the Cloud & Glow data.
Never a local `file://` copy — it has its own localStorage and would pass against
an empty catalogue.

Wait for Netlify, then hard-refresh.

**Step 1 — the step that passes only if nothing changed.**
Menu → **Buyer Documents** → **Brand Pack** → hero SKU **Cloud & Glow Face Serum**
→ generate. On the Compliance Status block, every label and value must be
**identical to the pack generated before this batch**, in the same positions:
`CPNP notification`, `EU Responsible Person`, `RP agreement renewal`.
*Failure: any cosmetic row has moved horizontally at all. That means the
`Math.max` floor is not holding and the fix is wrong even though it looks right.*

**Step 2 — the defect itself.**
Same path, hero SKU **Cloud & Glow LED Face Mask** → generate. The Compliance
Status block must read `EU-established economic operator` in full, then a visible
gap, then `Not set` — as two separate, non-overlapping pieces of text.
*Failure: any character of the label touches or sits under the value.*

**Step 3 — send the PDF, not a verdict.** Both packs. "Looks right" is not
evidence; #95 exists because a green report was believed over a document nobody
opened.
