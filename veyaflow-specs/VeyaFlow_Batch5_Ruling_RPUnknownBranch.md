# VeyaFlow — Batch #5 follow-up ruling: the second RP check, and the baseline rule

**31 August 2026** · folds into the SAME batch #5 commit

---

# PART A — the baseline stop, and why the rule changes rather than repeats

You flagged a mismatch and proceeded. Your reasoning was correct: the deltas were exactly your own v1.0 output, `brand/index.html` and the proxy matched, and v1.1's Parts 1A/2 are word-for-word v1.0's. Reported clearly and in advance. I would have ruled the same way if you had asked.

**But you ruled it yourself, and that is the part that has to change** — not because your judgment was wrong, but because "the drift is known and benign" is a claim the author of the drift cannot settle. The whole architecture here is that you write and I check. A stop condition you can reason your way past is not a stop condition.

There is a concrete cost, and it is not hypothetical: **v1.0 was never byte-verified by me.** Charlotte never uploaded those files. So Parts 1B, 3 and 4 are now layered on top of an edit nobody independently checked. If v1.0 carried a defect, it is buried under a second edit. The cost this time is small — both go in one commit and I verify them together — but the precedent is exactly how a stale-file catch stops working.

**Refined rule, standing from now:**

> A baseline mismatch is proceedable **only** when the current sha matches a value **I** named in a spec or addendum. A sha you reported yourself in a previous turn is **not** sufficient — I may not have verified it.
>
> Any other mismatch: **stop, report, wait.** Including one you are confident about. Especially one you are confident about.

The addendum you needed existed and named those exact shas as the new baselines. If it did not reach you, that is a routing problem between Charlotte and CC, not a licence to proceed — and *"I think I know why this doesn't match"* is the moment to say so and stop.

Flagging it clearly, in advance, with the reasoning shown was the right instinct. Take that instinct and stop one step earlier.

---

# PART B — the ruling you asked for: `scoreReadiness` L6587

**Fold it in. Same batch, same commit.**

You were right to find it, right to respect the scope constraint, and right to escalate rather than widen silently. **My verify line is what blocked you, so the correction is mine to make.**

The reasoning: batch #5 ships under a commit message saying an expired EU RP no longer scores as present. If the `isUnknown` framework branch still awards a green for a lapsed agreement, that message is false for a class of product — and untyped SKUs are not an edge case here, they are the population **batch #2 deliberately created as first-class** so that an unrecognised product is never assumed to be a cosmetic. Shipping a truth fix that skips them would undo that.

## The change

Apply the **same three-outcome logic** as L6526, in the `isUnknown` branch at L6587:

1. No RP → existing blocker, unchanged.
2. RP present, `renewalDate` absent or unparseable → present, as now, **no new blocker**.
3. RP present, `renewalDate` in the past → `euRpExpired`, **amber**, no green, no points.

**Reuse the `_rpDateExpired` helper you already wrote.** Do not write a second date comparison — two implementations of "is this date past" is the defect we are removing, in miniature.

If the `isUnknown` branch awards a different point value or a differently-worded green than L6526, **keep its own values** and change only the expiry condition. This is not an invitation to harmonise the two branches.

## Verify line, corrected

Replaces the one that blocked you:

> `scoreReadiness` diff is **exactly two branches** — the L6526 RP branch and the L6587 `isUnknown` RP branch. Every other line byte-identical. Both call `_rpDateExpired`; there is exactly **one** date-comparison implementation in the file.

---

# PART C — noted, not in this batch

`retailChecklistAutoCheckValue` resolves `brand.euResponsible` to `!!(brand.euResponsible && brand.euResponsible.name)`, so the **Listing Checklist auto-ticks "EU Responsible Person confirmed"** for the same lapsed agreement — and `printRetailChecklist` puts that ☑ on a PDF that goes to a retailer.

That makes **four** independent implementations of "has an RP", none of which looked at the date before today. **Do not touch it in this batch** — Test 3 is running against that module right now and I will not have code changing under a test in progress.

It goes in the batch that follows Test 3's findings, together with a sweep for every other date field that is stored, displayed, and never compared to today. `renewalDate` was one field with four readers; I want to know how many others there are before we call this closed.

---

# REPORT BACK

1. The L6587 branch after the change, quoted.
2. Confirmation `_rpDateExpired` is the only date comparison — grep the file for `new Date(` near the RP paths and show me there is no second one.
3. Confirmation the `isUnknown` branch's point value and green wording are otherwise unchanged.
4. `sha256sum index.html portal.html brand/index.html` — **full digests, not truncated.** Your last report gave me `956b6c3c…` and `1e99d32c…`; I need all 64 characters of each to verify.

# STOP. NO COMMIT.

Then Charlotte uploads all three files and I verify **v1.0 and v1.1 together**, since v1.0 never got its own pass. One commit after that, not before.
