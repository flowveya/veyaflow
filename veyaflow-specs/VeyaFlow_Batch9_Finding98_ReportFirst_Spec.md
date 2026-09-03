# VeyaFlow — FINDING #98, REPORT-FIRST SPEC

**3 September 2026 · coding lane → CC · REPORT ONLY, NO EDITS**

---

## READ THIS FIRST

**This spec asks you to classify and report. It does not ask you to change anything.**

Do not edit `index.html`. Do not edit any file. Do not commit. At the end of this
work `index.html` must still hash to the baseline named below — that is how the
lane will verify you stayed inside scope.

The reason is scope, not distrust. Two of the questions below are rulings the
lane has to make, and one of them may overturn a batch #2 decision. A fix applied
before those rulings would have to be unpicked.

---

## NAMED BASELINE

```
index.html   sha256   a7f44f073b3a425669c2054aacc878e8dfb819a6d380b6d582d92d903184b5b5
             short    a7f44f07
             41,054 lines · 2,704,870 bytes · 2 inline <script> blocks (1176, 39536)
```

**This is a value I am naming.** Start from this file. If your copy hashes to
anything else, stop and report — do not proceed on a sha you computed and
decided was probably fine.

Since this spec produces no edit, the same value must hold at the end.

---

## THE FINDING

`ESPR_TIMELINE` tells brands that an ESPR obligation is **already active** when
the app's own dated registry marks the same instrument **proposed**, with a
deadline eighteen months away.

```
L1469  "Skincare & Beauty":      "…Article 24 disclosure already active."
L1471  "Wellness & Supplements": "ESPR Article 24 disclosure required. …"

L1221  {id:"espr_disclosure", title:"ESPR Article 24 Disclosure",
        deadline:"2027-03-01", confidence:"proposed", …}
```

**Three legs, each sufficient on its own:**

1. Two constants in one file, 250 lines apart, assert opposite truth values
   about the same obligation.
2. `ESPR_TIMELINE` carries no `source` and no `confidence` field. Every
   neighbouring registry in that region carries both. Provenance-or-nothing.
3. "already active" is asserted for something dated `2027-03-01` at
   `confidence:"proposed"`.

**This finding is NOT grounded on §6.** Strategy's 1 September citation ruling
covered the *operator obligation* and which instrument grounds it. ESPR Article 24
is a different instrument, and stretching that ruling to cover it would be the
lane inventing scope. Do not cite §6 in your report.

---

## THE SURFACE — scouted 3 Sep, complete as far as the lane can see

An earlier version of this finding named two render sites. The real number is
five, across three constants. Every one of these is in scope for classification.

### Constants

| Line | Symbol | Note |
|---|---|---|
| 1467–1473 | `ESPR_TIMELINE` | 5 category keys, flat prose, no `source`, no `confidence` |
| 1218+ | `REG_DEADLINES` | dated registry; `espr_disclosure` row at **1221** |
| 1441 | `ESPR_BAN_CATS` | drives banner severity |
| 1442 | `ESPR_DISC_CATS` | drives banner severity **and the words "ESPR disclosure required"** |

### Readers and renders

| Path | Lines |
|---|---|
| `resolveEsprTimeline` definition (reads `ESPR_TIMELINE[cat]`) | 1458, read at 1463 |
| → its three callers | **34753**, **34812**, **35043** |
| Direct read into `esprtip` | **26812**, rendered at **26835**, **26840** |
| Direct `Object.entries(ESPR_TIMELINE)` | **34712** — renders **every row**, not the brand's own |
| `ESPR_BAN_CATS` / `ESPR_DISC_CATS` → banner class and heading | 26809, 26810 → rendered 26836–26838 |
| `ESPR_BAN_CATS` / `ESPR_DISC_CATS`, second read site | 26934, 26935 — **not examined by the lane** |

### The batch #2 comment that governs this constant

```
L1453  // ESPR timeline lookup (batch #2). ESPR_TIMELINE is keyed by brand CATEGORY and holds
L1454  // TEXT — it carries no urgency levels and none may be invented. Returns {text} or null.
L1455  // Callers render NOTHING when null: no dot, no blank label, never a green tick.
```

Batch #2 fixed the **gate** on this constant and never read the **strings inside
it**. That is the narrow-anchor pattern, eighth occurrence, and it is why this
spec lists paths rather than lines.

---

## WHAT TO REPORT

Answer each numbered item. Quote the line you are describing. Where you are
uncertain, say so — an "I cannot tell from the code" is a useful answer here and
a guess is not.

**1 · Classify every `ESPR_TIMELINE` string.**
For each of the five category keys, state: the exact string; whether it asserts a
legal obligation as current, future, or neither; and whether `REG_DEADLINES`
contains a row for that instrument and what its `confidence` and `deadline` say.
Produce a table. Include the keys that turn out to be fine — a classification
that only lists problems cannot be checked for completeness.

**2 · The every-row render at 34712.**
`Object.entries(ESPR_TIMELINE)` renders all five categories. Confirm or refute
that a Skincare & Beauty brand is therefore shown the Wellness & Supplements
assertion. State which page this is and how a user reaches it — **menu path, not
function name.** Treat this as a defect distinct from the rows being wrong: even
with every string corrected, showing a cosmetics brand another sector's
obligations may still be wrong.

**3 · `urgencyColor` against the batch #2 comment.**
`urgencyColor` is declared **three times** — 31120, 34713, 35044 — mapping
red/amber/green. Two of those declarations sit immediately after an
`ESPR_TIMELINE` read (34712, 35043). The batch #2 comment says the constant
"carries no urgency levels and none may be invented."
For each of the three: is `urgencyColor` applied to ESPR-derived data, or to
something else that merely sits nearby? Quote the application site. If it is
applied to ESPR data, say what determines which of the three colours is chosen.

**4 · The banner heading at 26838.**
That line prints `◎ ESPR disclosure required` for any category in
`ESPR_DISC_CATS`. Is that assertion reconcilable with
`confidence:"proposed"` at 1221? Report what `ESPR_DISC_CATS` contains and
whether anything gates that heading on a date.

**5 · The unexamined second read site.**
Report what 26934–26935 does with `ESPR_BAN_CATS` / `ESPR_DISC_CATS`. The lane
has not looked at it.

**6 · Anything you find that this spec did not anticipate.**
Report it. Do not fix it.

---

## OUT OF SCOPE — do not touch, do not fix, report only

- **Every file.** This is a report. No edits anywhere.
- `REG_DEADLINES` row content, dates or confidence values.
- The wider prompt sweep (#76, #88) — same category, different batch.
- `daysUntil` and the `0d` rendering (#90) — belongs to the date sweep.
- Article/annex references elsewhere in the file. The lane classified those on
  2 Sep: `REG_DEADLINES` and `INCI_RISK_FLAGS` carry their own `source` and are
  compliant. Do not re-open them.
- Any deduplication of `urgencyColor`. Report the three declarations; changing
  them is a separate ruling.

---

## STOP

**NO EDIT. NO COMMIT. NO PUSH.**

When you have written the report, stop. The lane will rule on scope and issue a
fix spec, which may overturn part of the batch #2 decision recorded at 1453.

---

## VERIFY

Charlotte runs, and pastes the whole output:

```
cd ~/claude-code-test
./verify.sh
```

**Expected: GREEN, with `index.html` matching `a7f44f07` — unchanged.**

For a report-first spec the verification is inverted: a digest that has *moved*
is the failure. If `index.html` differs from the named baseline, something was
edited that should not have been, and the report cannot be trusted until that is
explained.

Every guard in that battery counts AST references, not raw string matches, except
where its line says RAW.

---

## SMOKE

None. Nothing shipped, so there is nothing to smoke. The next spec on #98 will
carry smoke steps, and they will name menu paths rather than function names —
which is partly what question 2 exists to establish.
