# VeyaFlow — #110: THE EVENTS SURFACE FABRICATES INTO THE DATA LAYER

**4 September 2026 · coding lane → CC · ruled by Strategy the same evening**

**Why this outranks the Brand Pack fabrications, in Strategy's words:** those land in a
rendered document that can be regenerated. This lands in the **outcome records** — the
substrate §4 and §8.4 name for the rejection prognosis and the self-improving registry,
the only thing in the product that gets better with use. **A poisoned registry learns the
wrong thing permanently and carries it to the next customer.**

And a rejection with no stated reason **is a true and useful datum**. "The retailer said
nothing" is exactly what §8.2 calls the asset. Filling that void with three plausible
causes destroys the thing we claim cannot be copied.

---

## NAMED BASELINE

```
index.html   sha256   d186db186fcc4d99538654c6969e4f3807d39bdaf68b8db982ce1281a66edd65
             short    d186db18
             41,287 lines · 2,720,447 bytes · 2 inline <script> blocks (1176, 39769)
```

**This is a value I am naming.** Branch `f2b-async`, at `b3dcb16`. Anything else: stop,
report, wait.

---

## THE EVIDENCE

Live record, `public.loop_events` table, Lyko rejection 27 Aug:

**TABLE NAME CORRECTED 4 Sep.** This spec said `events` in three places, including the item 4
database instruction. There is no `events` table — `select … from events` returns
`42P01: relation "events" does not exist`. The name was carried from the label on the JSON
dump and never checked against the source, in a spec whose subject is asserting things the
data does not support. Confirmed two ways: `index.html:40245` and `:41151` both say
`loop_events`, and `information_schema.tables ilike '%event%'` returns exactly one
application table, `public.loop_events`. Item 4 is an instruction to write to a database;
had it been run as an `UPDATE` rather than a `SELECT`, the error is what stopped it.

```
"context": { "reason": "", ... }
"drafted_content": "No specific reason given. For beauty retailers like Lyko, rejection
 likely stems from: inadequate margin structure, oversaturated category positioning, or
 insufficient brand differentiation versus existing portfolio."
```

`reason` is empty. Three causes were invented and written to the database.

**This is not model drift. The prompt instructs it.** `index.html:40328`:

> `'If no specific reason was given, say so plainly and suggest the most likely
> category-level cause for this retailer type.'`

Same shape as **#88**: one rule string that does the right thing and the wrong thing in a
single breath, honest half first. #88 said *"state each item's factual status only"* then
*"say the appointment is in progress"*. This says *"say so plainly"* then *"suggest the
most likely cause"*.

---

## THE SWEEP — all four builders, `FEEDBACK_LOOP_PROMPTS` at 40250

| Builder | Line | Verdict |
|---|---|---|
| `sell_through_high` | 40251 | **CLEAN.** Grounded in supplied percentages. Use as the model. |
| `sell_through_low` | 40280 | Fabricates — see item 3, **report-first** |
| `reorder` | 40306 | Fabricates, milder — item 2 |
| `rejection` | 40328 | Fabricates — item 1 |

The clean one produced the Matas draft that was **accepted**. The rejection builder
produced the Lyko draft that was **not**.

---

## ITEM 1 — `rejection`, line 40328

Delete the second clause. The instruction becomes: if no specific reason was given, say
so and stop.

**Nothing is lost.** *"Lyko rejected without stating a reason"* is the true record, and
per §8.2 the silence is the asset. Do not replace the clause with a hedged version
("possible causes might include…") — a hedge is the same invention wearing a qualifier.

---

## ITEM 2 — `reorder`, line 40306

Remove **"Mention specifically why the timing matters."** The model holds no data about
why timing matters in the next market; specificity there can only be invented.

Also report: when `ctx.nextMarket` is empty the prompt prints `Next market to consider:
(not set)` while paragraph 2 still asks for a suggestion about "a similar market". State
whether paragraph 2 should be omitted entirely when no next market is set. **Do not
decide it — report it.**

---

## ITEM 3 — `sell_through_low`, line 40280 — IMPLEMENT (was report-first; Strategy ruled)

**Superseded 4 Sep.** This was sent as report-first; CC returned the four answers and
Strategy ruled on them. **It is now an implement.** The heading and STOP block below were
carried over unchanged when the ruling was inserted — the same failure as
`Generate the Brand Pack in 7 sections` surviving the renumbering to six, in the spec that
records that failure. Corrected here.

This one cannot be fixed by deletion, and that is why it is a rebuild rather than a trim.

```
DIAGNOSIS: <2 sentences naming the most likely causes from these standard buckets —
pricing vs category, in-store placement/visibility, lack of promotional support,
packaging/shelf-presence, product-market fit. Pick the 1-2 most plausible given the data
and brand context. Plain language, no hedging.>
```

Sell-through percentages **cannot distinguish** between those five causes. The prompt
hands the model a menu and instructs it to choose confidently — `no hedging` — then
builds three operational ACTIONS on top of the choice. The invention compounds into
advice.

Deleting the diagnosis removes the builder's entire output. So this is a design question,
and Strategy's §3 principle points at the answer without settling it: **the model should
structure, not formulate.** The five buckets are a real, useful checklist — as *questions
the brand should check*, not as a verdict the app picks.

### RULED BY STRATEGY, 4 SEP — REBUILD, DO NOT TRIM

**Nothing survives the deletion.** A sell-through percentage is a real number. Five
candidate causes are **indistinguishable from a single number**, and no wording makes a
diagnosis derivable from data that does not contain it.

**After rebuild the builder may emit only:**

- the number
- its direction, if a series exists
- the threshold **only if it is in the registry with a source**

`'delisting threshold typically <40% sustained'` is an unsourced factual claim fed to the
model as truth. **Into the registry with a source, or out.**

**ACTIONS 1/2/3 leave with the diagnosis.** Operational advice built on an invented cause
inherits the invention.

### THE FIVE BUCKETS SURVIVE — AS STATIC CONTENT, NEVER AS GENERATED OUTPUT

This is the general principle and it reaches past this builder:

> **The same five sentences are honest as a static help panel and dishonest as a
> generated diagnosis. The lie is not in the words — it is in the connection to this
> SKU's numbers. The connection is what makes a generic list read as a finding.**

The argument for keeping them is §8.3 — the product should be the KAM's knowledge without
the person. But §8.3 also locates the value in **timing and consequence**: now, for this
product, at this chain. A list identical for every SKU at every retailer fails that test.
It is the brand-level scalar in prose form.

**Real diagnosis is a layer-3 capability** and sits in the queue behind closing the
outcome loop. It has no data to stand on today.

**Implement:** strip DIAGNOSIS and ACTIONS from the builder; render the five buckets as
static content that is not generated, not ranked, and not attached to this SKU's figures.

---

## ITEM 4 — THE STORED RECORD — Charlotte, not CC

The Lyko event already holds the invented text in `drafted_content`. Removing the
instruction does not clean what is stored. That row needs correcting in the **Supabase SQL
Editor**, with the change appended to `db/CHANGELOG.sql`. Never from code.

`dedupe_key`: `sess_1776262521142_s1kn9gn::rejection::lyko_se::mtbbr1ba_96uzw2`

**THE COUNT IS ITSELF DATA (Strategy, 4 Sep).** How many rows carry invented causality is
**the measure of how much of the registry substrate is poisoned**. Log the number; do not
merely fix the rows. Then:

- the field is zeroed to the **literal string `not_recorded`** — **not `NULL`, not `''`**.
  `checkState` already treats `not_recorded` as first-class, and a blanked field is
  indistinguishable from one that was never written. The distinction between "we removed
  an invention here" and "nothing was ever generated" is the whole point.
- **the correction is registered in `db/CHANGELOG.sql`** rather than disappearing quietly
- **the changelog entry records the COUNT BEFORE correction, not only the statement.**
  The number is the datum — how much of the substrate was poisoned — and it becomes
  unrecoverable the moment the rows are fixed. Losing it would mean correcting the record
  without recording what was corrected, which is the failure §6.2 names.

That is the same principle §6.2 demands of the product: a change to a record that carries
consequence must say who changed it, when, and on what basis. A silent cleanup of a
poisoned record is the failure the product exists to prevent, performed on ourselves.

The Lyko row is the one we found, not necessarily the only one.

---

## ITEM 5 — THE SURFACE HAS NEVER BEEN SWEPT

`FEEDBACK_LOOP_PROMPTS` is four builders inside a region — roughly **40250–41040** — that
no truth pass has touched. The Truth Batch swept rendered surfaces; the prompt sweep is
scoped to #88/#76; this is neither.

**Scout and report, do not fix:** every place in that region where a string instructs the
model to supply something the data does not contain, or where a value is described as
typical, likely, probable or standard without a source.

---

## OUT OF SCOPE

- **The Brand Pack prose removal** — Strategy's separate ruling, its own shipment.
- **The 4b per-section budget.** Ruled structural: separate calls with their own
  `max_tokens`, **never** a sentence in the prompt stating a length. The measurement that
  justified the budget — the model exceeded an explicit 600-word instruction by 100%,
  `stop_reason: max_tokens`, `output_tokens: 1400` — also falsifies any fix that assumes
  the model obeys a number.
- **#88 and #76**, the prompt sweep. Same class, different surface.
- Everything held from batch #9.

---

## STOP. NO COMMIT.

Items 1, 2 and **3** are edits — item 3 was report-first, CC answered, Strategy ruled, and
it is now an implement. Items 4 and 5 are reports. Do not edit anything under items 4–5.

**Item 4 is Charlotte's, not CC's** — it is a database change, and those are hers alone
via the Supabase SQL Editor. CC has no read path to the `public.loop_events` table (no credentials, no
network, no local copy) and must report **NOT FOUND** rather than estimate the count. A
number invented for the report about invented causality would be the finding committed
inside its own remedy.

---

## REPORT BACK

1. sha256 before editing; confirm it matched `d186db18`.
2. Before/after for items 1 and 2.
3. Item 2's `(not set)` question.
4. Item 3, all four questions. **An honest "nothing survives the deletion" is the useful
   answer** — it means the builder needs redesigning rather than editing.
5. Item 4: how many rows carry drafted content from the three fabricating builders.
6. Item 5: the scout.
7. Anything noticed and not fixed.

---

## VERIFY

```
cd ~/claude-code-test
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `d186db18`; the lane names the new value.
Both blocks parse clean, block count 2. `_dppIsPublished` 1 definition / **3** call
sites — the contract was reduced on 4 Sep and `verify.js` carries the reasoning inline.

---

## SMOKE

Not a document surface, so no PDF. The check is the record:

**Step 1 — a rejection with no reason.** Log a rejection in the portal with the reason
field left empty. The drafted content must say the retailer gave no reason **and stop** —
no causes, no "likely", no hedged list.
*Failure: any cause appearing where the source field is empty.*

**Step 2 — a rejection with a reason.** Log one with a real stated reason. The draft must
carry that reason and add no others.
*Failure: causes beyond what was stated.*

**Step 3 — the step that passes only if nothing changed.** Trigger a `sell_through_high`
event. Its draft must be unchanged in character — grounded in the supplied percentages,
no invention. That builder is clean and item 1 must not have disturbed it.
