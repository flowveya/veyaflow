# VeyaFlow — #114a: the portal poll erases the rejection reason

**7 September 2026 · coding lane → CC**

**This is the most damaging finding on the board.** The feedback loop exists to collect why
retailers say no. It has collected **zero reasons in eleven days**, and the app tells the
brand "No specific reason was given" every time — including the time the brand gave one.

---

## NAMED BASELINES

```
index.html   sha256  a1756c3bc195fc7d7cde7488948e57e4ff1e8fa19dc20bf78c6de1026c2c5d70
                     41,411 lines
portal.html  sha256  beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
```

Branch `f2b-async` at `d2933e6`. **Confirm before editing.**

---

## THE EVIDENCE — measured, not deduced

Charlotte went through the outcome-capture flow, selected `missing_documentation`, typed
"Missing Docs", saved. `public.loop_events`, all four rejection rows the app has ever
recorded:

```
key                                        source   created_at        updated_at
…::lyko_se::mtr9sadz_hrx                   portal   09-07 13:27:49    09-07 13:29:53
…::lyko_se::mtr6u4m7_3c1                   portal   09-07 12:04:35    09-07 12:05:06
…::lyko_se::mtr644zo_vfo                   portal   09-07 11:44:31    09-07 12:02:51
…::lyko_se::mtbbr1ba_96u                   portal   08-27 09:55:58    09-07 12:02:45
```

**`source` is `portal` on all four. `context.reason` is empty on all four. There has never
been a `manual`-sourced row.**

**Row 1** was created by the capture at 13:27:49 and **rewritten 124 seconds later** — two
poll ticks — ending as `portal` with an empty reason.

**Row 4** was created on **27 August** and rewritten **today at 12:02:45**, six seconds
before row 3. **One poll tick re-logged the entire rejection history.**

---

## THE MECHANISM

Two writers, one `dedupe_key`, and the key does not distinguish them (40719):

```
sessionId + '::rejection::' + retailerId + '::' + subId
```

**Writer A — the capture flow (38585), `source:'manual'`:**
```js
reason: taxonomyEntry.label + (st.notes ? ' — ' + st.notes : ''),
```
Carries the real reason.

**Writer B — the portal poll (41294), `source:'portal'`:**
```js
reason: '', // Portal rejection_reasons may have details — not pulled in this version
```
Hardcoded empty. Runs every 60 seconds. **Always writes last.**

**And it re-logs history.** The guard is `if(s.status === 'rejected' && !rejectedBefore[s.id])`,
with `rejectedBefore` rebuilt from `localStorage` on each run. When that pre-state is empty
or stale, **every historical rejection looks newly rejected** and is re-logged blank. Row 4
proves this happened: an 11-day-old rejection rewritten today.

So this is not a race a faster capture could win. **A captured reason survives only until
the next full re-log.**

---

## WHAT SURVIVED, AND WHY IT MATTERS

`upsertLoopEvent` **preserves `drafted_content`** while overwriting `context` — verified:
row 4 still reads `not_recorded` from #110 item 4's correction. That is load-bearing for the
fix: the draft is *not* being regenerated from the blanked reason, which is why the card
still shows the old sentence rather than re-deriving it. **Do not change that behaviour as a
side effect.**

---

## IMPLEMENT

**1 · The poll must never overwrite a populated reason with an empty one.**

A writer with no data must not clobber a writer that had data. State the mechanism you
choose — a merge in `upsertLoopEvent` that leaves `context.reason` alone when the incoming
value is empty, or the poll omitting the field entirely rather than sending `''`. **Prefer
whichever makes the blank *unable* to reach the row, over one that removes it afterwards** —
structural beats corrective, per #110 item A.

**2 · The poll must not re-log rejections it has already logged.**

Row 4 was re-logged after 11 days. Establish why `rejectedBefore` fails to remember, and fix
it so a rejection is logged **once**. If the pre-state genuinely cannot be trusted, the
dedupe must come from the stored event rather than from `localStorage`.

**3 · `source` must not be downgraded.** A row whose reason came from the capture flow is
`manual`. A blank poll write must not relabel it `portal` — that erases the provenance of
the erasure itself.

---

## REPORT, DO NOT IMPLEMENT

1. **Does the capture flow reach `logRejectionLoopEvent` at all?** Row 1's `created_at`
   matches the save to the second, but a poll tick could also have created it. Establish
   which writer created it — from the code, not the timestamps.
2. **The portal's real reason.** The comment says *"Portal rejection_reasons may have details
   — not pulled in this version."* State what the portal actually holds and whether it can be
   fetched. **If it can, that is the real fix and this spec's item 1 is a mitigation.**
3. **Whether any other trigger has two writers on one `dedupe_key`.** `reorder`,
   `sell_through_high`, `sell_through_low` — same pattern, same hazard. **Report the count.**

---

## OUT OF SCOPE

- **#114b** — a taxonomy label like `other` carrying no information. Real, separate, and
  currently unreachable because no reason survives at all.
- #122, #123, #119, #115, #116, #117.
- #110's render half, 40700–41040.

---

## STOP. NO COMMIT.

Three implements, three reports.

---

## REPORT BACK

1. sha256 before editing; confirm it matched `a1756c3b`.
2. Before/after for each implement, and the mechanism chosen for item 1 with the reasoning.
3. How you established `drafted_content` preservation is unchanged.
4. The three reports. Report 3's count is the finding.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `a1756c3b`; `portal.html` UNCHANGED.

---

## SMOKE — this is the one that has never passed

**Step 1.** Set a submission to Rejected through the capture flow with a real reason and
notes. **Wait three minutes** — at least three poll ticks. Then query:

```sql
select context->>'reason', context->>'source', created_at, updated_at
from public.loop_events where trigger_type='rejection' order by created_at desc limit 1;
```

The reason must still be there. `source` must still be `manual`.
*Failure: an empty reason, or `source` flipped to `portal`.*

**Step 2.** Brand Home shows a draft built from that reason, and only that reason.
*Failure: "No specific reason was given" — which is what it says today.*

**Step 3 — the step that passes only if nothing else changed.** The four existing rows keep
their `drafted_content`, including row 4's `not_recorded`.
*Failure: any change to a stored draft — this fix must touch `context`, never the draft.*
