# VeyaFlow — the predicate batch: close every route to a membership answer without the logic

**22 September 2026 · coding lane → CC · ruled by Strategy**

**The shipment has one purpose and it fits in a sentence:**

> **REMOVE THE ROUTES TO A MEMBERSHIP ANSWER THAT SKIP THE LOGIC.**

**Two routes exist. Both close here.** *They are not two cleanups that happen to share a file — they
are the same job, and leaving either open makes the shipment incomplete by its own definition.*

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`5dac24271252ead370f7054ef9fa1661e4ed40327320604e363a617cf4919341`, branch `f2b-async` at
`3820863`, clean tree, 57 gates GREEN. **Confirm all eleven. Only `index.html` moves.**

**BATCHED BY JUDGEMENT, NOT BY FILE.** *Both parts below are mechanical and verify by absence or by
#243's existing smoke. The marker move is a separate shipment because it requires a judgement — and
a batch of mechanical changes is only as well verified as the one judgement dropped into it.*

---

## PART 1 · THE PREDICATE — AND THE LIST GOES INTO A CLOSURE

**Yesterday's hoist made `EU_EEA_MEMBER_STATES` globally reachable, which opened the first route:**
anyone can now write `EU_EEA_MEMBER_STATES.includes(m)` inline and skip `regMarketApplies` — **losing
the `'EU'`/`'EU/EEA'` resolution and the code-to-name mapping that make the answer correct.**

> **CANON: a public list is a public predicate with its reasoning removed.** *A correct source with
> the logic stripped off — the same form as the brand pack's name list against the registry's
> reasoning, and we installed it in our own fix.*

**THE MEASUREMENT THAT UNBLOCKED THIS — both readers test per-market, neither iterates the list:**

```js
1957   mkts.some(m => EU_EEA_MEMBER_STATES.indexOf(m) > -1)     // regMarketApplies
16661  markets.some(m => EU_EEA_MEMBER_STATES.indexOf(m) >= 0)  // checkComplianceGap
```

**Neither reads the list's length or depends on its order.** **So both become
`.some(isEuEeaMarket)`.**

**THE EDIT:**

- **`isEuEeaMarket(marketName)` → boolean.** The 30 entries move **inside its closure** — *in a
  single-file app with no modules, private means closure. This is a structural change, not a
  wrapper: it makes the list genuinely unreachable rather than merely unfashionable to use.*
- **Both call sites call it.** *They currently write the same test two ways — `> -1` and `>= 0`. The
  predicate collapses that.*
- **The comment moves with it**, stating that this is the membership question and the only way to
  ask it.

**`regMarketApplies` keeps its `'EU'`/`'EU/EEA'` branch and its `C2N` mapping unchanged** — the
predicate replaces the membership test inside it, nothing else.

---

## PART 2 · `isEU` — DELETED

```js
24551  const isEU = ['Denmark','Germany','Netherlands','France','Belgium','Austria'].includes(s.market)
```

**Six markets of twenty-seven, declared in `renderLandedTab`, never read.** *Measured 21 Sep: landed
cost takes duty from `DUTY_RATES` and freight from `FREIGHT_EST`; neither consults it.*

**Dead code is inert TO THE MACHINE. It is still read by people, and the name makes a claim.**

> **`isEU` is the most natural name anyone would give the test *is this market in the EU*. Someone
> needing that test greps it, finds a plausible array of EU countries, and concludes IT ALREADY
> EXISTS. A brand selling in Sweden would be told Sweden is not in the EU.**

**AND THAT REUSE IS NOT HYPOTHETICAL — IT IS WHAT #243 WAS.** *`checkComplianceGap` needed a
membership answer, found `EU_RP_MARKETS` looking plausible, used it, and a legal obligation was
deleted for fifteen member states.* **`isEU` is a loaded version of the same mechanism: already
named as a membership test, already shaped as one.**

> **Live code is corrected by reality — someone would eventually see Sweden fall through. DEAD CODE
> NEVER GETS THAT CORRECTION. Nothing executes it, so the name's claim is never tested, and every new
> reader meets it as unbroken as the first.**

**AND IT MUST GO IN THIS SHIPMENT, NOT A LATER ONE.** **Once `isEuEeaMarket` lands, a search for the
EU check returns TWO candidates — one correct, one wrong.** *The collision is in IDE autocomplete on
`isE`, in case-insensitive search, and in a human scanning for "the EU check" — which is exactly how
someone reaching for a membership test looks.* **Leaving it would make the wrong one HARDER to tell
from the right one than it is today, where it at least stands alone and obviously odd.**

**Structure before policy: you cannot write a rule saying *don't use `isEU`*. You delete it, and the
question stops being askable.**

---

## OUT OF SCOPE

- **#239.** *It turned out NOT to be a spare field: `required:false, preferred:true` encodes THREE
  states in two booleans — required · preferred · neither. Deleting `preferred` would make ISO 14001
  indistinguishable from a requirement that does not matter. **It is a build item — the ESG modal
  does not distinguish preferred from indifferent and the data already can** — not a subtraction.*
- **The marker move.** Separate shipment; it requires a judgement and reports back.
- **#238's `4/3`**, which is blocked on the operand scout's Part 0.
- **Renaming or touching `RADAR_MARKETS` / `RP_DATA_MARKETS`.**

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **Every reference to `EU_EEA_MEMBER_STATES` after the change — expected: none outside the
   closure.** *If one survives, the route is still open.*
3. **Every reference to `isEU` — expected: none.**
4. **Whether `renderLandedTab` behaves identically** with the declaration gone. *It should: nothing
   read it.*
5. **`carbonTransparency:{required:false, preferred:true}` at 32620 uses the same two-field idiom
   outside the array.** *Report whether anything reads that `preferred`. Report only — the idiom is
   a convention, not a one-off, and whether it is read anywhere is unmeasured.*
6. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1. Ten other surfaces unchanged.

---

## SMOKE — ORIGIN NAMED, AND #243's EXISTING STEPS COVER THE BEHAVIOUR

**`http://localhost:8000/index.html`, seeded NORDLYS.**

**Step 1.** Compliance Calendar and the deadline strip: **the same rows, same order, as before the
edit.** *`regMarketApplies` now calls a predicate; if anything moves, the predicate is not
equivalent.*

**Step 2 · the step that can fail.** A brand whose **only** market is **Czechia**, RP name cleared.
**The RP gap banner appears** — exactly as it does today after #243. *Failure: it does not — the
predicate lost a member.*

**Step 3.** A **UK-only** brand: **no banner.** *The control — the predicate must not have gained a
member either.*

**Step 4.** Landed cost tab renders and calculates as today. *Nothing read `isEU`; this proves the
deletion touched nothing.*
