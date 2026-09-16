# VeyaFlow — the RP trio: #218, #219, #217. Three deletions, and two of them have a closing window.

**16 September 2026 · coding lane → CC · ruled by Strategy**

**Nothing is built here. Three things are removed.** Two are free today and expensive the moment
`RP_PARTNERS` gains a row; the third expires by itself in fourteen days.

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`49cefac83a271e11c4dfce6d59fe92391cc342389739d592150b6994d0e92d6c`, branch `f2b-async` at
`3e75f63`. **Confirm all eleven. Only `index.html` moves.**

**Dirty and named:** `verify.expected.txt` (the lane's #183 note, corrected twice on 16 Sep), plus
the untracked `#199`, `#207` and census specs.

---

## #218 — DELETE THE COMMERCIAL TIER FROM THE ORDERING

**Strategy's ruling, and it is a business-model ruling, not a code one:**

> **VEYAFLOW TAKES NO COMMERCIAL CONSIDERATION THAT AFFECTS ORDERING.**

**The moat is being the party that says what is true about things the customer cannot check. A
brand choosing an RP CANNOT, by definition, assess RP quality — that is why they need us. A paid
ordering on that surface exploits exactly the asymmetry the product exists to close.**

**In `renderRpMarketplace` (16375–16392): remove the tier branch from the comparator and the
`tier` field from the partner shape.** Relevance, response time and rating remain, in that order.

**Why now and not later:** `RP_PARTNERS` is `[]`. **This is a three-line deletion today and a
renegotiation with signed partners afterwards.** *Same arithmetic as the schema: free now,
expensive at the first row.*

**If partnerships later carry commercial terms at all, the ordering stays independent of them and
the basis is stated ON THE SURFACE.** **A tier that exists for any reason is visible.** `hidden` in
a comment is a decision made in code that nobody ruled — **do not preserve it behind a flag, and do
not leave it commented out.** Deleted.

**Leave a comment recording the ruling and its date**, so the next person to consider a paid
ordering finds the ruling rather than the mechanism.

---

## #219 — REMOVE THE WORD "VETTED"

**Three occurrences to check — the subtitle (16407), the empty-state copy (16437), and the
non-empty branch of the same line.** Report any others.

> **The surface says "RP partners". Adding "vetted" the day we actually vet is FREE; removing it
> after a brand has trusted it is NOT.**

**Do not add `verifiedBy` / `verifiedDate` in this shipment.** What *vetted* means — registration,
ERT authorisation, references, insurance — **is unruled.** A provenance field with nothing defined
to verify is the same emptiness this lane has removed everywhere else. **The schema records the
check we define; until one is defined there is nothing to record.**

**`customerRatingAggregate` stays in the comparator** — it is a real field with no rows yet, not a
claim on the surface. *Noted, not changed.*

---

## #217 — REMOVE THE LAUNCH DATE

**Empty state, 16437:** *"EU Responsible Person marketplace launches Q3 2026 — vetted partners
coming soon."*

**Q3 ends in fourteen days. The code comment at 1546 says *"First partner appended here when Aug-Sep
2026 partnerships sign"* — August has passed.**

> **A date in product copy is a promise the product breaks by itself. Nobody has to do anything for
> it to become untrue.**

**Remove the date and the "coming soon".** The manual-entry path is the real content and it already
works — **say what the surface DOES, not when something else will arrive.**

**The comment at 1546 carries a date too.** Leave it: **a comment describing an internal expectation
is not a claim to a customer.** *Named so the distinction is deliberate rather than an oversight.*

---

## OUT OF SCOPE

- **Defining what "vetted" means.** Strategy's, unruled, and it does not block this.
- **Adding any provenance field to `RP_PARTNERS`.**
- **The empty state's structure.** It already says what is absent and offers the manual path —
  *two of the three parts of the honestly-empty test; the missing part is the "why", which the
  removed date was falsely supplying.*
- #199, #220, #214, #215 — and **#199 is not built before #220.**

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **Every occurrence of "vetted" on this surface and anywhere else it describes RP partners.**
3. **Every reader of `partner.tier`** — the comparator is one; report any other.
4. What the empty state reads after the edit, verbatim.
5. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1. Ten other surfaces unchanged.

---

## SMOKE — ORIGIN NAMED

**`http://localhost:8000/index.html`, seeded NORDLYS.** *Not the deployed site: a green production
page cannot test an uncommitted change (15 Sep).*

**Step 1.** EU RP page, no RP on file. **The page renders, the subtitle says "RP partners" with no
"vetted", the empty state names no date, and the manual-entry button works.** *Failure: any of the
three survives.*

**Step 2.** `RP_PARTNERS` temporarily seeded with two partners carrying different `tier` values and
identical relevance, response time and rating. **Their order does not change when the two `tier`
values are swapped.** *Failure: order follows tier — the comparator branch is still live.*
**Revert the seed; it must not be committed.**

**Step 3.** An RP already on file. **The existing box renders unchanged, expired-state colours
included** (#50's rule: a lapsed agreement never renders in a success colour).
