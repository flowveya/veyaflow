# VeyaFlow — #241: seeded auth accounts sit on real companies' mail domains

**23 September 2026 · coding lane → Charlotte (Supabase SQL Editor) · NOT CC, NOT CODE**

> **DB CHANGES ARE CHARLOTTE IN THE SQL EDITOR, PLUS AN APPEND TO `db/CHANGELOG.sql`. NEVER FROM
> CODE.** This lane writes the note and never runs the statement.

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|
| | | |

---

## WHY THIS IS NOT "LATENT, THEREFORE LATER"

**Most of our triggers fire on a decision or an edge case. This one fires on the product working as
intended.** The moment the retailer portal sends its first mail, the exposure goes live — **and the
portal is what we are building. The window is closed by planned work, not by an accident.**

**And the content is the worst possible first contact:** *confirm your VeyaFlow account*, to a buyer
who never created one, **from precisely the three companies we intend to sell to.** It reads as an
intrusion or as spam.

**Measured, and it is why this is still latent:** `confirmation_sent_at`, `recovery_sent_at` and
`email_change_sent_at` are all NULL; `email_confirmed_at` lands 13ms after creation — admin
auto-confirm. **No mail has ever been dispatched from this project.**

---

## PHASE 0 · SCOPE — RUNS BEFORE ANY CHANGE, AND ITS ANSWER MAY CHANGE THE PHASE 1 LIST

> **IS THREE A COUNT OR A FLOOR? Every enumeration this week has been a floor.** The number states
> its scope in the same breath or it is not reported.

**PRIVACY CONSTRAINT ON EVERY QUERY BELOW: return DOMAINS, never addresses.** *Third-party emails
and personal data are never pasted into chat — this lane already had to correct itself once for
asking for `contact_email` instead of `split_part(contact_email,'@',2)`.*

**0a — every auth row, by domain:**

```sql
select split_part(email,'@',2) as domain, count(*) as rows
from auth.users
group by 1
order by 2 desc;
```

**Reserved and therefore fine:** `example.com`, `example.org`, `example.net`, anything ending
`.example`, `.invalid`, `.test`, `.internal`, `localhost`. **Everything else is in scope for
Phase 1**, not just the three we know about.

**0b — one level out. Did real domains land anywhere else?** Run the same shape against every table
holding an address. At minimum:

```sql
select 'retailer_accounts' as tbl, split_part(email,'@',2) as domain, count(*)
  from retailer_accounts group by 1,2
union all
select 'portal_submissions', split_part(contact_email,'@',2), count(*)
  from portal_submissions group by 1,2
union all
select 'brands', split_part(contact_email,'@',2), count(*)
  from brands group by 1,2;
```

*Column names are this lane's guess and have been wrong six times this month — if one does not
exist, the error names the real one and the query is corrected from it rather than from memory.*

**STOP AFTER PHASE 0 AND REPORT THE DOMAINS.** *The Phase 1 list is whatever Phase 0 returns, not
whatever this spec assumed.*

---

## PHASE 1 · UPDATE — NEVER DELETE

> **#148's reasoning applies: do not destroy identity to fix a leak.** An email change keeps the
> `id`; a delete orphans everything referencing it. **Update is safe in both directions. Delete is
> not.**

```sql
update auth.users
set email = 'buyer-<retailer>@example.com'
where id = '<uuid>';
```

**One statement per row, each naming its `id` explicitly. No `where email like …`.** *A predicate
over the thing being changed can match more than intended; an id cannot.*

**`example.com`, NOT `veyaflow.internal` — AND THE DIVERGENCE IS CLOSED, NOT FOLLOWED.**

Canon says `example.com`. `verify.expected.txt:982–983` says `buyer-test@veyaflow.internal`. **Two
conventions for *this is test data* is the vocabulary problem a third time.**

> **Both are technically safe. But `veyaflow.internal` is only obviously fake IF YOU KNOW OUR
> CONVENTIONS. `example.com` is obviously fake to anyone** — RFC-reserved, in canon, recognisable
> everywhere. **The whole point of a marker is that a stranger reading the line can see it is test
> data.**

**The local part keeps the retailer name** (`buyer-matas@example.com`). *The retailer's NAME is
legitimate business data and is already throughout the registry; the exposure was the deliverable
ADDRESS, and `example.com` cannot deliver.*

---

## PHASE 2 · `db/CHANGELOG.sql` — THE ONLY THING THAT WILL HOLD WHAT THE ADDRESSES WERE

> **After the `UPDATE` it is no longer derivable that these were on real company domains. The
> evidence disappears with the change.** A fix whose before-state is unrecoverable is a measurement
> that cannot be repeated — **and that is testimony, not evidence.**

**The entry carries, per row: the `id`, the BEFORE domain, and the AFTER address.**

```sql
-- 2026-09-23 · #241 · seeded auth accounts moved off real companies' mail domains.
-- UPDATE, never DELETE: the id is preserved so nothing referencing it is orphaned.
-- Trigger that made this urgent: the portal's first outbound mail — planned work, not an accident.
-- BEFORE (domain only, see note): <id> matas.dk → buyer-matas@example.com
--                                 <id> apotekhjartat.se → buyer-apotek@example.com
--                                 <id> lyko.se → buyer-lyko@example.com
-- Phase 0 scope: <n> auth rows on non-reserved domains, <n> found outside auth.users.
```

### A COLLISION WITH THE PUBLIC-REPO RULE, AND THE CALL THIS LANE MADE

**The instruction is to record the before-values. The repo is treated as FULLY PUBLIC.** A complete
before-address is a plausible, guessable mailbox at a real company — **which is the same exposure
class this fix removes, moved from the database into a public file.**

**CALL: record `id` + BEFORE DOMAIN + AFTER address. Omit the before local part.** That reconstructs
which rows changed and what class of change it was — everything repeatability needs — **without
publishing a guess at a real company's mailbox.**

**Flagged rather than decided silently. If Strategy wants the full before-values, they go in a
non-public note and `CHANGELOG.sql` points at it.**

---

## WHAT THIS DOES NOT DO

- **It does not make #227's sweep able to see these.** *The instrument reads code; these live in
  data.* Fixing them changes nothing about that, in either direction — **which is why the ordering
  gate between the two is discharged.**
- **It does not touch the application.** No surface moves, no digest changes, `verify.sh` is not
  involved.
