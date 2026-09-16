# VeyaFlow — #207: the accessory framework resolves, then is judged as a cosmetic

**16 September 2026 · coding lane → CC · READ ONLY. NO EDITS.**

**This is a scout, and it is a scout on purpose.** The defect is already measured. **What is missing
is a RULING the lane may not make**, and the cheap read is what makes it rulable.

---

## NAMED BASELINES — UNCHANGED AT BOTH ENDS

Eleven surfaces; `index.html` at
`49cefac83a271e11c4dfce6d59fe92391cc342389739d592150b6994d0e92d6c`, branch `f2b-async` at
`3e75f63`.

**`verify.expected.txt` is DIRTY and that is expected and named** — the lane appended a correction
above #183's entry on 16 Sep. **It is not one of the eleven digested surfaces.** `./verify.sh` must
end **GREEN, `0 of the 11 tracked surfaces modified`, exit 0.** A scout that moves a digest has
stopped being a scout.

---

## THE DEFECT, ALREADY MEASURED — DO NOT RE-DERIVE IT

`FRAMEWORK_VOCAB` (6711–6722) defines **three** frameworks: `cosmetic` · `device` ·
`beauty_accessory`.
`CLAIMS_RULES` (18717–18793) defines **six** keys: `cosmetic` · `device` · `supplement` · `textile`
· `food` · `home`. **No `beauty_accessory`.**

```js
19051  const rules       = CLAIMS_RULES[productType] || CLAIMS_RULES.cosmetic;   // getClaimLight
6907   const activeRules = CLAIMS_RULES[ruleKey]     || CLAIMS_RULES.cosmetic;   // scoreReadiness
```

**Both guard `unknown` with care. Both let `beauty_accessory` fall through to cosmetic.** 6906
builds a six-branch ternary that produces `'beauty_accessory'` for a key that does not exist.

**And both carry a comment asserting the opposite** — 19044 *"not judged against cosmetics rules"*,
three lines above; 6903 *"uses correct ruleset per category"*.

---

## QUESTION 1 — THE CONSUMER CENSUS. THIS IS THE DELIVERABLE.

**Find EVERY site that indexes `CLAIMS_RULES` by a variable**, not only the two above. For each:
the line, the key expression, whether a fallback exists, and **what the fallback is.**

**And separately: every site that implements a claims verdict WITHOUT indexing `CLAIMS_RULES`** —
the same behaviour written out rather than called. *#201 was four independent day-count
computations that never called `daysUntil`. Ask the question here before assuming two sites is the
number.*

**Two is the lane's count and the lane has been wrong about counts three times this week.**

---

## QUESTION 2 — THE BLAST RADIUS OF EACH OPTION, SO STRATEGY CAN RULE

**Three options exist. The lane does not choose between them — report what each COSTS.**

**A · Build `CLAIMS_RULES.beauty_accessory`.** **Report only what is knowable from the tree:** does
any accessory-specific claim rating exist anywhere? **Do not write the ruleset and do not invent
ratings** — which claims are impermissible for an accessory is a regulatory question for the RP, not
a coding one. *The lane already asserted one such rating that does not exist; that is why this spec
exists.*

**B · Treat `beauty_accessory` as having no honest ruleset** — the answer 19044's own comment gives
for `unknown`. **Report the consequence precisely:** under #183, no assessment means **the claim
does not travel.** So — **for the Cloud & Glow Forehead Tape specifically** — which claims stop
appearing in which exports, and what the withheld-claim notice would say. **Name the files.**

**C · Fall back to cosmetic EXPLICITLY and say so on the surface.** Report where that sentence would
have to appear: every surface that renders a claim light for an accessory. **Count them.**

**What is NOT a choice, under any option: the silent substitution.** `|| CLAIMS_RULES.cosmetic` for
a framework the vocabulary defines is a substitution the reader cannot see.

---

## QUESTION 3 — #206, WHICH #207 ARMS

```js
30212  return { light, note, source: rule.source||'', lastReviewed: …, reviewedBy: … };
22234  return t.claim+': '+t.light+(t.note?' — '+t.note:'');        // drops all three
```

**`bdClaimInfo` computes the provenance and `formatClaimAssessment` discards it.** One discarded
value is **`reviewedBy: 'AI legal review — unconfirmed by RP'`.**

**Report:**

1. **Every consumer of `bdClaimInfo` and of `formatClaimAssessment`** — which surfaces would gain
   the provenance if it travelled, and which are buyer-facing.
2. **How many `CLAIMS_RULES` entries actually carry `source` / `lastReviewed` / `reviewedBy`
   non-empty**, per top-level key. *Most appear empty; the exact count decides whether this is a
   feature or a rounding error.*
3. **THE ORDERING HAZARD, confirmed or refuted:** today the cosmetic fallback attaches COSMETIC
   provenance to an ACCESSORY's claim, and that is inert only because the formatter throws it away.
   **If #206 lands before #207, does the export begin shipping cosmetic legal sourcing attached to
   an accessory's claim?** **Answer it at the bytes.**

**Do not implement #206.** Whether *"AI legal review — unconfirmed by RP"* should appear on a
document sent to a pharmacy chain's compliance desk **is a disclosure decision and it is
Strategy's.**

---

## OUT OF SCOPE

- **Any edit.** This is a read.
- **#205** — duplicate keys in `CLAIMS_RULES.cosmetic` (`'clinically proven'` 18719/18727,
  `'natural'` 18726/18734, where the UNSOURCED entry wins). Separate, and it is an AST walk over the
  battery's existing Acorn parse, not a new instrument.
- Writing any claim rating. **Writing any ruleset.**
- #199, #201, #202, #203, #204.

---

## REPORT BACK

1. All eleven digests before and after — unchanged, `0 of the 11 tracked surfaces modified`.
2. **The consumer census** — every `CLAIMS_RULES[…]` index site, and every independent
   implementation that does not index it.
3. **The three options' costs**, with B's file-level consequence for the Forehead Tape named.
4. **#206's consumers, the non-empty provenance counts, and the ordering hazard answered.**
5. **Whether any accessory-specific claim rating exists anywhere in the tree.** *A plain no is the
   expected answer and is worth as much as a yes.*
6. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

**GREEN, `0 of the 11 tracked surfaces modified`, 0 not found, exit 0.**

---

## NO SMOKE

Nothing ships. **Question 1's count and Question 2's blast radius are the evidence.**
