# VeyaFlow — #110 item 5, first half: the reorder builder's invented input

**4 September 2026 · coding lane → CC**

Item 5 was "scout and report, do not fix" across roughly 40250–41040. The coding lane has
now scanned **the prompt half only** (40250–40336) independently, having lost CC's scout to
a context boundary. Two findings. One is ruled and is an edit; one is report-first. The
render half (40700–41040) is **not** covered by this spec and remains open.

---

## NAMED BASELINE

```
index.html   sha256   38dd86a54c0bb01cae6b5fd31caef13c20730e2a9def6debac4b18e4de9bf56e
             short    38dd86a5
             41,290 lines · 2,721,537 bytes · 2 inline <script> blocks
```

**This is a value the lane named**, from an independent `shasum -a 256` on Charlotte's
machine. Branch `f2b-async`, at `17a5f45`. Anything else: stop, report, wait.

---

## ITEM A — `reorder` paragraph 2, line 40298 — IMPLEMENT

This is the question item 2 sent back as report-first. Strategy's ruling on item 3 settles
it, so the lane is ruling rather than deferring.

Current:

```
'PARAGRAPH 2 — One-sentence next-market hint suggesting the brand pitch '
  + (ctx.nextMarket||'a similar market') + ' while this proof is fresh.\n\n'
```

When `ctx.nextMarket` is empty the data block prints `Next market to consider: (not set)`
and this line simultaneously instructs the model to suggest pitching **"a similar market"**
— one it must choose from nothing. That is the rejection builder's defect relocated:
generation into an empty source field.

**Ruling: when `nextMarket` is empty, paragraph 2 is omitted entirely.** Not softened, not
hedged. The prompt asks for one paragraph, the format instruction on the next line adjusts
to match, and the word count drops accordingly. When `nextMarket` IS set the paragraph is
grounded, because the app supplies the value.

**The `||'a similar market'` fallback is deleted with it.** A fallback that invents its own
input is a second scheme — the same shape as `||'Denmark'`, removed 3 Sep, and the same
shape as the `typeof` guard removed for #93 whose fallback hashed a different value.

**Not in scope, deliberately, and recorded so it is not swept in:** the trailing clause
"while this proof is fresh" asserts a decay the app has not established. The lane judges it
defensible — the reorder has just happened, so the proof IS fresh — and is leaving it. If a
later pass disagrees, this note is where the reasoning is.

---

## ITEM B — `rejection`, lines 40318–40319 — REPORT, DO NOT EDIT

The prohibition shipped at 40326 is correct and stays. But the framing above it still reads:

```
'A retailer rejected this brand\'s submission. Extract the operational learning a
 future-pitch should encode.\n'
'Output 1-2 sentences (max 35 words). ... Just the lesson — what changes for the next
 pitch to ' + (ctx.retailerName||'this retailer') + ' or similar retailers.\n'
```

**When no reason was given there is no lesson to extract.** The prompt commands extraction,
then two lines later permits stopping. That is #88's shape with the halves reversed —
demand first, prohibition second — and our own fix mitigated it without dissolving it.

**Report, do not edit.** State whether the framing can be expressed as a single conditional
instruction ("if a reason was stated, extract the operational learning; if not, record that
none was given") rather than a demand followed by an exception, and whether that changes
behaviour when `ctx.reason` is populated.

**The lane is not specifying wording.** The last time it specified wording inside an
instruction string, it produced the false confirm-dialog copy at 40855 that had to be
deleted in the same shipment that created it.

---

## ALSO REPORT

`loopEventAccept` was flagged by CC as unreachable for the delisting-risk trigger but not
defensively so. That flag is still unruled and is not in this spec. Restate it if it is
still true at this baseline, so it does not get lost again.

---

## OUT OF SCOPE

- **The render half, 40700–41040.** Cards, static buckets, `loopEventAccept`. The lane has
  not scanned it. Do not fix anything there.
- Everything from batch #9 still held.
- The Brand Pack prose removal; the 4b per-section budget. Separate shipments.

---

## STOP. NO COMMIT.

Item A is one edit. Item B and the `loopEventAccept` note are reports. Do not edit anything
under item B.

---

## REPORT BACK

1. sha256 before editing; confirm it matched `38dd86a5`.
2. Item A before/after, including how the format instruction and word count were adjusted.
3. Item B's answer.
4. The `loopEventAccept` restatement.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `38dd86a5`; the lane names the new value from an
independent digest, not from verify.sh's own line and not from a sha CC reports.

---

## SMOKE

Deferred with the rest of #110's smoke, which is already owed and needs a Netlify deploy
first: a rejection with an empty reason, a rejection with a stated reason, an untouched
`sell_through_high`, the static buckets card, and the two-sentence resolve dialog.

The step this shipment adds: **a reorder logged with no next market set.** The draft must
be a single paragraph, with no market named and none implied.
*Failure: any second paragraph, or any market appearing where none was set.*
