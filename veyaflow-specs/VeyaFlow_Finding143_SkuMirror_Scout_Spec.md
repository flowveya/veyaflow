# VeyaFlow — #143 scout: mirroring the catalogue

**9 September 2026 · coding lane → CC**

**REPORT ONLY. NO EDITS. NOT ONE LINE.**

`saveSkus` is never mirrored and **no SKU action exists in the proxy at all**. The catalogue —
the product's most-used data, and where all five of #135's blocked dossier fields live — exists
in one browser.

**This blocks #135.** Building write paths for five SKU fields whose store has no server mirror
would be solving the 64% wall on sand.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           80555dccd90119286eb5d48679e0abef203c75e20bb5d67ce201b411646a488b
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `0f8f77a`. **Confirm all six, and confirm all six identical afterwards.**

---

## THE PATTERN TO FOLLOW, AND WHERE IT STOPS BEING SUFFICIENT

```js
if (action === 'brand.load') {
  const rows = await supabase('GET', `brands?session_id=eq.${session_id}&limit=1`);
  return { brand: rows[0]?.data || null };
}
if (action === 'brand.save') {
  await supabase('POST', 'brands?on_conflict=session_id', { session_id, data });
}
```

One row, one jsonb blob, upsert on `session_id`, restored on boot when local is empty.

**A brand is one object. A catalogue is a collection**, and every difference between those is a
question this scout must answer before anything is written.

---

## WHAT THE SCOUT MUST ANSWER

**1 · Size, measured.** Serialise the current catalogue and report bytes. Then extrapolate to
20, 100 and 500 SKUs using real field occupancy, not empty templates. **BIL exists because
~569KB of base64 could not pass through a Netlify function** — state where the SKU payload
crosses that boundary, and whether it does at any plausible catalogue size.

**2 · Blob or rows.** One `data` blob mirroring `brand`, or one row per SKU. Report the trade
with a recommendation:
- a blob is the proven pattern and needs no id reconciliation
- rows survive partial failure, allow per-SKU queries, and do not rewrite 500 records to change
  one
**Say which, and say what would change your mind.**

**3 · MERGE SEMANTICS — RULED BY STRATEGY, NOT AN OPEN QUESTION.**

> **Never delete on merge. Union on id. The system does not choose.**

Strategy ruled this **before** the case list, deliberately: *writing the merge policy from the
case list optimises for the common case and loses the rare one — and the rare one is where the
two hours of dossier work live. The policy is a decision about what we are prepared to lose,
not an observation about what usually happens.*

- **Union on id, never deletion.** A merge that discards data is **a deletion the user did not
  order.**
- **Same id on both sides with different content → both versions are kept**, the conflict is
  surfaced, and the system does not pick a winner.
- **State is `attention`, not `blocking`.** The product is not wrong; there are two versions.
- **Minimum form: two blobs and a flag.** No version history is required.

The principle already exists in the product: when two parties disagree about what is true, the
platform's job is to **make the disagreement visible, not to guess.** Here the two parties are
the same user on two devices, which changes nothing.

**Report how to implement this**, not whether to. Specifically: where the conflict flag lives,
what a consumer sees when one is set, and whether `checkState`'s existing vocabulary covers
`attention` here or needs extending. **Report the cases you would otherwise have used to derive
a policy** — they are still worth having, now as tests rather than as input.

**4 · DO NOT INHERIT `brand`'s LAST-WRITER-WINS.**

`on_conflict=session_id` silently overwrites. **Strategy: copying a known-bad pattern to a new
surface because it is the existing one is the same error as merging the certification schemas
"for consistency's sake" — ruled against earlier today.**

The concrete scenario is not theoretical: **two hours of dossier work on the laptop, open the
app on another device, the work is gone.** That is precisely what #143 exists to prevent,
reintroduced by its own fix.

**The SKU mirror uses the merge semantics above. `brand`'s exposure becomes its own finding —
#147** — and this scout should confirm it exists rather than assume it: state whether
`brand.save` can silently overwrite across two devices today.

**5 · Does a `skus` table exist?** Check `db/CHANGELOG.sql` and report. **A DB change is
Charlotte's alone, in the Supabase SQL Editor, appended to the changelog — never from code.**
If a table is needed, report the shape it would take; do not write SQL.

**And a condition on that, from Strategy: Charlotte does not run the SQL until she has read
what it does.** The database is her responsibility, and a ruling from Strategy does not absolve
her of it. So whatever statement is eventually written must be **readable by someone who did
not write it** — no clever one-liners, and every clause explicable in a sentence.

**6 · What else rides along.** `saveSkus` has 6 call sites. `dppData`, `retailChecklistState`
and the rest are equally unmirrored. **Report whether a SKU mirror is separable from them, or
whether the catalogue drags dependants with it** — the DPP payload references SKU ids, and a
restored catalogue with orphaned DPP records would be worse than neither.

---

## OUT OF SCOPE

- **#144** — the four implemented-and-never-called actions. It rides along later; **it does not
  displace this.** Cheapness is a tiebreaker, not a priority.
- #135, #136, #137, #145, #146, M2–M4.
- Any SQL. Any schema change. Any edit at all.

---

## STOP. NO EDITS.

Six digests identical at both ends.

---

## REPORT BACK

1. sha256 of all six before and after — **identical**.
2. The six answers, with measurements where the question asks for them.
3. **A recommended shape and the one thing that would most likely make it wrong.**
4. Anything noticed and not fixed.

---

## VERIFY

**Do not run `./verify.sh`.** Nothing is edited, so it would compare the tree against itself —
the precedent from #121. Report the six digests instead.
