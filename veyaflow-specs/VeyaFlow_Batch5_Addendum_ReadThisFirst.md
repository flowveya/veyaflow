# VeyaFlow — Batch #5 ADDENDUM: read this BEFORE the v1.1 spec

**31 August 2026** · supersedes v1.1's baseline table and scope

## WHAT HAPPENED

You applied **v1.0** (Parts 1A + 2). The v1.1 spec was written before your report landed and its baseline table still lists the **pre-edit** shas. If you follow v1.1 literally you will stop on a baseline mismatch — correctly. Do not stop. Use this instead.

**Do not revert anything. Do not re-apply Parts 1A or 2. They are done and verified in your report.**

## NEW BASELINES — your own output, unchanged since you stopped

| File | sha256 |
|---|---|
| `index.html` | `1c348f2bb10188498a4854d9332792cc1f7f45c8e412acad1ddfd949cafa0734` |
| `portal.html` | `b96423ac3c931561ed29329d2864e884467dc8b6605b6c44f8e5fbbb24d2b408` |
| `brand/index.html` | `6b255130d41a37bc755e17633f46ef5357247d1f4bdd780bc1c8f3ad70009352` |

If `index.html` or `portal.html` no longer match those, **something touched them after you stopped — stop and say so.** `brand/index.html` is untouched from v1.1's table.

## SCOPE OF THIS PASS

From the v1.1 spec, apply **only**:

- **Part 1B** — finding #50, the expired EU RP scoring as present.
- **Part 3** — finding #46, the hardcoded `'Verified brand profile'` in `brand/index.html`.
- **Part 4** — finding #47, `expiresInDays: null`, plus the pack generation date.

**Skip Parts 1A, 2A, 2B, 2C entirely.** Already shipped.

Everything else in v1.1 stands: the out-of-scope list, the report-back questions (numbers 6–14), the verify checklist, the commit message, the smoke steps.

## ONE COMMIT, NOT TWO

Batch #5 commits once, after this pass. Part 2 added a legend reading **"✓ on file"**. Part 1B is what makes that line true for a lapsed EU RP agreement. Shipping the legend without 1B would put an explicit written guarantee under an existing false green — a worse state than before the batch. So the working tree stays uncommitted until 1B, 3 and 4 are in it.

## ON YOUR v1.0 WORK — accepted, with two notes

**`noRpUK` was the right call and it was yours, not mine.** My table missed that the UK path raises `noRpUK` rather than `euRpMissing`. Without your scout a UK submission with no Responsible Person would have rendered a muted "not recorded" for a condition the scorer treats as blocking — an unmarked failure on the buyer surface, which is the exact defect class this batch exists to remove. Reading severity off the emitted blocker's `level` rather than a static table is a better solution than the one I specified.

**The EAN→name join is the right thing to have flagged.** It goes in the smoke as its own step. Do not change it now.

## PART 1B — ONE CLARIFICATION AGAINST YOUR OWN ARCHITECTURE

Your v1.0 derivation reads severity off emitted blockers. `euRpExpired` must therefore need **no** portal change at all: emit it amber from `scoreReadiness`, and `checks.euRp` resolves to `attention` through the machinery you already built.

**If that is not what happens, stop and tell me before working around it** — a special case in the portal for this one blocker would undo the single-source property that is the whole point of what you just shipped.

Note also that your `lvlById[b.id] !== 'red'` most-severe-wins rule now has a case it did not have before: a brand could in principle raise both `euRpMissing` and `euRpExpired`. It should not — they are mutually exclusive by construction (no RP versus an RP with a past date). **Confirm they are, and that the L6526 branch cannot emit both.**

## REPORT BACK

Questions **6 through 14** from v1.1, plus:

- Confirmation that Parts 1A and 2 are byte-unchanged from your v1.0 output.
- Confirmation that `euRpExpired` required **no** edit to `portal.html`. If it did, what and why.
- `sha256sum index.html portal.html brand/index.html`

## STOP. NO COMMIT.
