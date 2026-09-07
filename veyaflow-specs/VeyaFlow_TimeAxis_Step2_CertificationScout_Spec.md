# VeyaFlow — Time axis step 2, scout: certifications before any migration

**7 September 2026 · coding lane → CC · ruled by Strategy the same evening**

**REPORT ONLY. NO EDITS. NOT ONE LINE.**

The certificate schema migration is approved as the first vertebra of the time axis. This
spec does not perform it. It establishes whether it can be performed **verifiably**, and the
answer decides the shape of everything after.

---

## NAMED BASELINES — ALL FIVE

```
index.html                           9eb3da6917ba6ec516a846006f27d5579418edb730636a2d1fc5b9589c9c71e7
dpp/index.html                       6e946a279f2d43827bfba12a3994ba0400cc4983b658a065dca4760bde21357d
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     1e99d32c74b373a46bb02103ed9847ba81749d841c9dc942d012968dd487f775
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
```

Branch `f2b-async` at `bb52efa`. **Confirm all five.** Nothing should differ afterwards
either — this shipment ends with the tree byte-identical to how it started.

---

## THE RULE THAT SHAPES THE MIGRATION — §2 STANDS, NO EXCEPTION

`certifications` appears **186 times across 8 files**, spanning four of the five tracked
surfaces. That collides with one-edit-at-a-time.

**Strategy ruled against an exception, on the meta-rule written this morning applied to
Strategy's own side:** an exception for "a coordinated migration" turns a structural guard
into a procedural one. The label becomes available to anyone who believes their change is
coordinated, and the guard survives only as long as someone remembers not to abuse it. That
is precisely the failure seen four times this week.

**So: expand → migrate → contract. One surface per shipment.**

1. **Expand** — every consumer gets a tolerant reader accepting **both** `string[]` and the
   triple form.
2. **Migrate** — the write moves to the new form.
3. **Contract** — the old form is removed.

**And the sequencing makes verification stronger, not weaker.** The expand phase is
**behaviour-neutral**: a tolerant reader against old data must render *exactly* the same
string as before. Every step becomes a **diff test rather than a judgment** — the same
mechanism as batch #8 v1.1's free gift, where no cosmetic SKU could move and the check became
mechanical. **The sequencing is not a tax the migration pays. It is what makes the migration
verifiable at all.**

---

## THE BOUNDARY — A RULE, NOT A SCOPE NOTE

> **A brand's own certifications and our reference data about third parties MUST NOT share a
> schema, now or ever.**

They are not merely different data. **They carry different responsibility.**

- A brand's certification on a buyer-facing document is **the brand's legal exposure.**
- Our registry entry about a manufacturer is **our editorial claim, carrying a confidence
  level.**

If they share a schema, sooner or later something renders a `research_verified` third-party
fact with the authority of a brand-confirmed one. That is the narrow-anchor family one level
up — and unlike a narrow anchor, it would be invisible, because both would be well-formed.

The third-party sets — the manufacturer registry (≈1561–1667), supplier entries, retailer
requirements — **already carry primitive 1** (`verifiedBy` / `verifiedDate` → confidence
tier). Putting `validUntil` on them would assert knowledge of another company's documents.
**They are out of scope permanently, not just for this shipment.**

---

## WHAT THE SCOUT MUST ANSWER

**1 · Separate the two populations, and count each.**
Of the 186 occurrences, how many are **the brand's own or a SKU's** certifications, and how
many are reference data about third parties? Enumerate the brand/SKU sites by function.
**The count is the finding** — it sizes the migration and it is currently unknown.

**2 · Every consumer of the brand/SKU form, per surface.**
Which functions read it, and what does each produce? Brand Pack, DPP, portal payload,
`buildPortalBrandPack`, `pack.claims`, PDFs. **A consumer missed here is a consumer that
breaks in the contract phase**, months later, when the old form is gone.

**3 · Can a tolerant reader be added per surface WITHOUT any rendered string changing?**

**This is the question the whole plan rests on.** If the expand phase cannot be
behaviour-neutral on some surface — because a reader normalises, sorts, truncates, or
`.join()`s in a way the two forms cannot both satisfy — then that surface's step is a
judgment call rather than a diff test, and **the sequencing does not hold there.**

Answer it **per surface**, with the specific reason. **If the answer is no anywhere, stop and
say so: the plan is rethought before a line is written.** That is the entire point of
scouting first.

**4 · #128 — the root-level duplicates.**
`share-dpp.js` and `supabase-proxy.js` exist at the repo root **and** under
`netlify/functions/`. Both root copies contain `certifications`. They were gitignored in #111
as local-only.

**The duplication is the defect regardless of what you find.** Determine which is live —
`netlify.toml`, the functions directory convention, any import. Then:

- **Root copies dead** → they are removed (a later shipment; report only here).
- **Anything reads them** → one copy must become the only one.

**Ambiguity about which file executes is not acceptable in a codebase whose selling point is
knowing what is true.** Report the diff between each pair: if they have already diverged, say
by how much — that tells us whether a fix has been applied to one and not the other.

**5 · The proposed sequence.**
Given 1–4, state the surface order for expand, and which surface is riskiest. Do not assume
`index.html` first because it is largest.

---

## OUT OF SCOPE — PERMANENTLY

- **Third-party reference data.** See the boundary rule. Not "not yet" — never.
- **The RP agreement.** Built, correct, amber-not-blocking.
- **Soft staleness.** Waits until the stamp has run for a while.
- Any rendering of validity, confirmation dates, or state on a badge. **#113 already made the
  badges honest; this shipment does not touch them.**

---

## OUT OF SCOPE FOR NOW

#114c, #123, #119, #115, #116, #117, #121's report, #125, #110's render half.

---

## STOP. NO EDITS AT ALL.

Not a comment, not a whitespace fix, not a typo. The tree must hash identically afterwards,
and that is checkable.

---

## REPORT BACK

1. sha256 of all five tracked surfaces before and after. **They must be identical.**
2. The two population counts (question 1), with the brand/SKU sites enumerated by function.
3. The consumer list per surface (question 2).
4. **The behaviour-neutrality answer per surface (question 3) — with reasons.** This one
   decides whether the plan survives.
5. #128: which copy is live, and the diff between each pair.
6. The proposed sequence and the riskiest surface.
7. Anything noticed and not fixed.

---

## VERIFY

**Do not run `./verify.sh`.** Nothing was edited, so it would compare the tree against itself
and pass vacuously — the precedent you set on #121. Report the five digests instead; that is
the check that can actually fail here.
