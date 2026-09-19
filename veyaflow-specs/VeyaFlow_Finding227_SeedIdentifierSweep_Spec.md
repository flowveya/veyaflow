# VeyaFlow — #227: the seed set has never been swept against its own rule

**19 September 2026 · coding lane → CC · READ ONLY. NO EDITS.**

**Runs BEFORE #241's fix, and that ordering is the point.**

> **When an instrument's founding case is also a pending fix, run the instrument first — otherwise
> the fix burns the test.**

**#241 — three real-company addresses as confirmed Supabase Auth users — is this sweep's only case
in hand.** Rename them first and there is nothing to demonstrate against.

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`f36d7f664d0d13e0f5f05521b96499f72e6095820098d6d38f80c25bc2515795`, branch `f2b-async` at
`aaaa56c`, clean tree, 57 gates GREEN. **`./verify.sh` GREEN, `0 of the 11 tracked surfaces
modified`, exit 0. A scout that moves a digest has stopped being a scout.**

---

## THE RULE BEING ENFORCED — WRITTEN 13 SEP, NEVER SWEPT

> **A test value that is a VALID REAL IDENTIFIER must come from a reserved range.**

**Cases already known, and they are the demonstration set:**

| case | what it is |
|---|---|
| `buyer@matas.dk` · `buyer@apotekhjartat.se` · `buyer@lyko.se` | **#241** — confirmed, active Supabase Auth users on real companies' mail domains. *Nothing has been sent; the exposure is forward* |
| `rp@nordiccompliance.se` | the seeded EU RP on Brand Home — **a credible real Swedish domain** |
| `buyer@matas.dk` (again) | **#112**, found weeks ago and fixed nowhere |

**Reserved ranges that are safe:** `example.com` / `example.org` / `example.net` (RFC 2606),
`.invalid`, `.test`, and our own `veyaflow.internal`.

---

## PART 0 — THE DEMONSTRATION, AND IT DECIDES WHETHER THE SWEEP RUNS AT ALL

**Fix the criteria in code BEFORE reading any output. Then check by content, not by line.**

**The three known cases above must be found by the criteria WITHOUT being told where to look.**

1. **Did the criteria find each one?** Name it by line.
2. **For any it missed: why** — *the blind spot stated in the sweep's own terms is worth more than
   the run.*
3. **Only then the general pass.** **If it misses one, say so and stop.**

*Two instruments were retired this week for failing exactly this. A third is expected to fail rather
than hoped to pass.*

---

## THE PRE-BUILD TEST, ANSWERED BEFORE THE SPEC WAS WRITTEN

> **Is the instrument's question answerable?**

**"Is this string a valid real-world identifier outside a reserved range?"** — **yes, definitively,
for the shapes below.** *Unlike "which of two lists is right", it needs no source and no semantics.*

**In scope — identifier shapes with a public reserved range:**

- **Email domains** — anything not in RFC 2606 / `.invalid` / `.test` / `.internal`
- **Web domains and URLs** in seed or fixture data
- **Phone numbers** outside the reserved ranges (`+44 7700 900xxx`, `555-01xx`)
- **EANs / GTINs** — check the check digit and whether the GS1 prefix belongs to a real issuer
- **Org numbers, VAT numbers, IBANs** in seed data

**OUT of scope, and stated so the sweep does not swell:** real REGULATIONS, real RETAILER names, real
MARKET names. *Those are the registry's subject matter, not test values. The rule is about
identifiers that address a real party, not about facts that describe one.*

---

## SCOPE

**In:** `index.html`, `portal.html`, `brand/index.html`, `dpp/index.html` and the seven
`netlify/functions/*.js` — **every string literal in seed, demo, fixture or placeholder data.**

**Also report, without access:** **the Supabase rows the lane has already measured** — the three
`auth.users` addresses and their `retailer_accounts` rows. *They are the same class and they are
where the live instance sits; the sweep cannot reach them, and saying so is part of its coverage
statement.*

**Out:** any edit · the registry's factual content · anything in `veyaflow-specs/`.

---

## COMPLETION CRITERION — SET BEFORE THE RUN

**Every candidate carries a verdict: LAWFUL / DEFECT / UNDECIDED.** **Or report the inventory and the
count and STOP.**

**And one extra column this sweep needs:** **does the identifier address a party who could RECEIVE
something?** *An email or phone can be delivered to. An EAN cannot. That distinction orders the
work, and it is the difference between #241 and a bad barcode.*

---

## REPORT BACK

1. **PART 0 FIRST** — the three known cases, found or missed, and why.
2. All eleven digests before and after — unchanged.
3. Every candidate with a verdict, and the deliverable-to column.
4. **The coverage statement in your own words** — what this sweep cannot reach, *including the
   database, which holds the only instance that matters today.*
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

**GREEN, `0 of the 11 tracked surfaces modified`, exit 0.**

---

## NO SMOKE

Nothing ships. **Part 0 is the evidence, and the general run counts only if Part 0 passes.**
