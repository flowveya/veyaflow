# VeyaFlow — a written disposition per surface

**25 September 2026 · coding lane → CC · ruled by Strategy · A RECORD, NOT A PAGE CHANGE**

**The shipment has one purpose:**

> **EVERY LIVE NAV SURFACE GETS ONE WRITTEN LINE SAYING WHETHER IT IS SOLD, AND WHO DECIDED.**

**This changes no surface. It produces a record that does not exist.**

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## WHY — THE FINDING THIS CLOSES

**Part 0 of the respine spec asked, for every live nav surface absent from the pricing page, whether
a record of a decision existed. `Belägg:` or `OLÄST`.**

> **EVERY CELL CAME BACK `OLÄST`. No file in the repo holds a per-surface disposition for the
> pricing page** — searched by name and by shape (`disposition`, `keep/cut`, `not sellable`,
> `internal only`: zero hits).

**So nothing was decided about the ten and left unwritten. NOTHING WAS DECIDED AT ALL — which means
the EIGHTEEN on the page are equally undecided.** *Two specs went into correcting a list nobody
chose. The corrections stand; the claims were false however the rows arrived.* **The remedy is not a
third correction pass.**

**One-time cost, and it closes the class: the next time someone asks why `dpp` is not on the page,
there is an answer in a file instead of an inference.**

---

## THE FORM — AND A LINE ALONE IS NOT ENOUGH

> ```
> <surface> · sold at position N | not sold — reason · <who> <date>
> ```

**A DISPOSITION WITHOUT AN AUTHOR IS A FACT WITHOUT PROVENANCE, and we would have recreated the
finding in tidier form.**

> **THE DECISION'S `Belägg:` IS WHO MADE IT AND WHEN.** *Without that, the next reader cannot
> distinguish **we decided this** from **someone wrote a line**.*

**Same requirement we place on every other claim.** *`Belägg:` for code points at a file and a name;
for a decision it points at a person and a date.*

**`sold at position N` uses the four-position spine**, named 25 Sep:

> **1 Know what applies · 2 Meet your duties · 3 Get on the shelf · 4 Stay on the shelf**

**AND THE CONDITION ON THE AXIS TRAVELS WITH ANY LINE THAT CITES IT: the spine describes THE
CUSTOMER'S GOAL, NOT OUR COMMITMENT.** *Rendered as a list of what we do, all four positions become
overstatements at once.*

---

## SCOPE

**Every LIVE nav surface** — not in `PARKED_IDS`, not declared `parked:true`, holding its own
`renderPage` branch. **Part 0 measured seventeen.** `Belägg: index.html:NAV`,
`index.html:renderPage`, `index.html:isParkedSurface`.

**Parked surfaces are OUT OF SCOPE.** *Their disposition is already recorded — `PARKED_IDS` is the
record, and the parked marker states it on the screen.*

**A surface with no line is the finding**, and it is checkable rather than rememberable.

---

## WHERE IT LIVES

**`veyaflow-specs/` is for shipments; this is state.** *A disposition is a living record that changes
when a decision changes — the same property that put the register in `open-items.md` rather than in
a dated entry.*

**Proposed: `docs/pricing-disposition.md`, one line per surface, in the repo so it travels with the
code it describes.** *This lane proposes the location and does not choose it — Strategy rules where
state lives, as it did for the register.*

---

## WHAT THIS SPEC DOES NOT DO

- **It does not add rows to the pricing page.** *The disposition may say `sold` for a surface not
  currently listed; ACTING on that is the respine spec's Part 1, not this.*
- **It does not decide any disposition.** *This lane writes the file and fills what is already
  ruled; **every undecided line is Charlotte's or Strategy's**, and an unfilled line stays unfilled
  rather than being guessed.*
- **It does not touch `index.html`.** *No digest moves, `verify.sh` is not involved.*

---

## REPORT BACK

1. **The seventeen live surfaces**, each with its id and its `renderPage` branch cited.
2. **Which already have a ruling recorded anywhere** — and per the near-citation rule, **any
   near-miss must name the question it does NOT answer.** *A plausible citation beside a question
   gets read as its answer six months later; that is `Belägg:`'s failure mode.*
3. **The file, with every line either filled or explicitly blank.** A blank line names what is
   missing: the decision, or its author, or its date.

**No disposition is inferred. `OLÄST` for an author is as legitimate an answer as a name.**
