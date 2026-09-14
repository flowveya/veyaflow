# VeyaFlow — #186: the bearer credential is published

**14 September 2026 · coding lane → CC**

**`session_id` is an unexpiring bearer credential accepted from the request body without
verification, and three endpoints publish it.**

**Established from the code. NOT exercised against production, by CC or by the lane** — and it must
not be. Verifying an access-control defect by using it is not verification, it is the thing itself.

---

## WHY THIS OUTRANKS EVERYTHING — STRATEGY, 14 SEP. READ IT BEFORE THE DIFF.

**This is not "security" alongside the truth work. It is the foundation underneath it.**

> Everything else this week is about whether the product tells the truth. **#186 is about who can
> WRITE in the record.** The whole provenance model presumes that a brand-stated value was
> actually stated by the brand. **If anyone can write as the brand, `verifiedBy: 'brand'` means
> nothing.**
>
> **A false claim can be corrected. A foreign write in a compliance record cannot be
> distinguished from the brand's own.**

**So #135's dossier, #162's meter, #183's claims — every one of them rests on this.** There is no
point making a document honest about data anyone can change.

### THE ROOT ERROR: DUAL USE, IN ITS DANGEROUS FORM

**`session_id` is both the identifier and the proof of authentication.**

> **An identifier MUST be shareable. A proof MUST NOT be.**

Yesterday's criterion — *a field carries two purposes legitimately when it is the correct axis for
both* — **fails here in both directions at once.** Sixth instance of that family, and the first
time it appears as a security defect rather than a correctness one.

**The destination is therefore not "add auth". It is: separate the identifier from the credential
— a stable identifier for continuity, a separate secret for authorisation.**

---

## NAMED BASELINES

Eleven surfaces; `index.html` at `dd358cac5be5c8f25e6ef15930a8c7c45b5a4546e445301d7ea2cdb38b0e69dc`,
branch `f2b-async` at `abc56fc`. **Confirm all eleven.** This shipment moves
`netlify/functions/get-dpp.js`, `get-brand-pack.js` and `supabase-proxy.js` — **three tracked
surfaces, so the one-edit rule is deliberately broken here and Strategy has the reason: they are
one defect with three mouths.** Report it as `3 of the 11 modified` and expect the lane to name
three digests.

---

## THE CHAIN, VERIFIED AT THE BYTES BY THE LANE

```
supabase-proxy.js:159   const { action, session_id, data, accessToken } = payload;
supabase-proxy.js:170   if (action === 'brand.save') {
supabase-proxy.js:171     await supabase('POST','brands?on_conflict=session_id',{ session_id, …
supabase-proxy.js:406   // Auth is via session_id … No access_token required.
get-dpp.js:79           brandId: data.brand_id,        ← public, unauthenticated, cacheable
```

`brand_id` is built at `index.html:26469` and `34857` as **brand-name slug + `_` + `session_id`**.
Production carries `cloud___glow_sess_1776262521142_s1kn9gn` on three published passports.

**So a value that authorises writing as the brand is returned by an endpoint that requires
nothing.** Thirteen proxy actions accept it, including `brand.save` and
`portal.submission.create`.

**The repository is public**, so the action names, the payload shape and the endpoint path are
documented to anyone who reads it.

**Reported by CC, to be re-verified in this shipment rather than inherited:**
`get-brand-pack.js:82` and `supabase-proxy.js:118` (`brandSessionId`, returned to the retailer
portal). **The portal path is the widest: a retailer who receives a submission is handed the
brand's credential as a field in their response.**

---

## PART 1 — THE TOURNIQUET. THIS SHIPMENT.

**Named a tourniquet, not a fix — Strategy, 14 Sep, same discipline as #148's back-fill.** It
narrows the exposure dramatically without touching the auth model. **It leaves the auth model
exactly as broken as it is today.**

**Remove `brandId` / `brand_id` / `brandSessionId` from all three responses.**

**Establish what consumes them before removing anything — report first, edit second.**

- `dpp/index.html` — does rendering a passport need `brandId`, or only `payload`?
- `brand/index.html` — same question for the brand pack.
- `portal.html` — **what does it do with `brandSessionId`?** If the portal *needs* it to function,
  removing it breaks a live second-party surface, and **that changes this from a deletion to a
  redesign. Report and stop if so.**

**If a surface needs to identify a brand, it needs an opaque identifier that is not also a
credential.** Do not invent one in this shipment — report that it is needed.

### PART 1 IS CONTAINMENT, NOT A FIX. WRITE THAT INTO THE CODE.

**After Part 1, `session_id` is still an unexpiring bearer value accepted unverified from the
request body.** Anyone who obtained it by any other route still holds it. **A comment claiming this
shipment fixed the authentication would be the exact defect this lane has now named seven times —
an artefact certifying a check that never happened, in the one file where it would matter most.**

**The comment says what is true:** the credential is no longer published by these endpoints; it is
still a credential, and it is still trusted without verification until #147.

> **STANDING RULE, STRATEGY 14 SEP: a partial fix carries its own limitation IN THE FILE, not only
> in the log. The log is not where the next reader is. The code is.**

Same lesson as Friday's relay gap: **a truth that is not where the actor looks is not recorded.**

### AND PART 1 IS NOT DONE WHEN THE CODE SHIPS

`get-dpp.js` passes `cacheable: true`. **A CDN-cached response containing the credential survives
the code changing.**

> **Part 1 is complete when the cache no longer serves it — not when the deploy is green.**

**This is a verification criterion, not a detail.** Report the cache headers actually set, the CDN
TTL, and how a purge is performed on this site. **The shipment does not close until a fetch of a
published passport returns no `brandId`** — measured against the live URL, not against the source.

---

## PART 2 — THE EXPOSURE THAT ALREADY HAPPENED. STRATEGY'S DECISION, NOT CC's.

**Part 1 stops new leakage. It recalls nothing.** Every value already returned — to a retailer, in
a shared passport, in a cached response — remains valid **forever**, because nothing expires,
rotates or revokes.

### RULED, STRATEGY 14 SEP — THE CRITERION NOW, THE APPLICATION WHEN THE FACTS EXIST

> **Rotate if the credential actually reached a third party. Do not rotate if it did not** — let
> #147 replace the model instead, or we run the migration twice in one week.

**The deciding fact is unknown and is Charlotte's to answer: has any real retailer submission been
made?**

> **AND THE SEQUENCE IS NOT OBVIOUS: rotation happens AFTER the leak is closed, never before.
> Rotating into an open leak publishes the new value immediately.**

**Two options, and the lane recommends neither without that fact:**

**(a) Rotate, with a migration.** Feasible and larger than it looks: **nine tables are keyed by
`session_id`** — `brands`, `sourcing_crm`, `portal_submissions`, `loop_events`,
`bil_extractions`, `category_waitlist`, `submission_status_log`, plus the composite `brand_id` in
`dpp_records` and `shared_brand_packs`. **`dpp_id` is a separate column, so published passport URLs
survive a rotation** — that is the fact that makes (a) possible at all, and it should be verified
before anything is planned on it. **DB work, so Charlotte in the SQL Editor with
`db/CHANGELOG.sql` appended, never from code.**

**(b) Accept the existing exposure until #147 lands** (4–6 days, likely 5), on the grounds that the
blast radius is one brand's row plus its submissions, with no evidence of use.

**Rotation without a migration is the one clearly wrong answer** — it orphans the brand row, the
three passports and every submission, which is the P3/P4 failure #147's scout measured.

---

## PART 3 IS #147, AND IT IS NOT SPECCED SEPARATELY — RULED

**#186 and #147 are ONE piece of work: separate identity from credential.** CC's sizing already
contains *"the proxy stops trusting a client-sent `session_id`."*

> **Speccing them apart is doing the hard part twice.** — Strategy, 14 Sep

**So #147's implementation spec absorbs this**, and #147 stops being the durability shipment: **it
is the remediation, and durability is what it also buys.** 4–6 days, likely 5, measured.

**#183 does not ship before the tourniquet.** Making a document honest about data anyone can change
is solving the wrong layer first.

---

## ALSO IN SCOPE TO REPORT, NOT TO FIX

- **`session_id` in PostgREST query strings** (`brands?session_id=eq.…`, and eight more). Against
  the standing rule, server-side. **Report whether Supabase or Netlify access logs capture query
  strings and how long they are retained** — that decides whether this is untidy or a second
  disclosure path.
- **#187 — THE FOUR UNAUTHENTICATED ACTIONS, AND STRATEGY HAS RANKED THEM ABOVE THIS SHIPMENT,
  CONDITIONALLY.** `crm.delete`, `crm.upsert` by id, `listing.list`, `field.set` **require nothing
  at all.** #186 needs a DPP URL, a derivation and knowledge of the API; **these need a POST.**
  **The barrier is zero, and `crm.delete` is DESTRUCTIVE — an unauthenticated destructive call
  ranks above a derived write key.**
  **BUT THE GATE COMES FIRST, AND IT IS NOT A CODE QUESTION.** `listing.list` returns contact
  names and emails. **Establish whether those rows are REAL or SEEDED before classifying it.**
  Real third-party personal data on an open endpoint is a different class of obligation from a
  serious defect with no subject. **Strategy, verbatim: *"I have read test data as world twice
  this week and I am not going to do it a third time."*** Charlotte answers this from the DB;
  neither lane infers it.
- **Whether any endpoint response is cached** — `get-dpp` passes `cacheable: true`. A CDN-cached
  response containing a credential outlives its removal.

---

## STOP. NO COMMIT.

Three deletions, one consumer census, one honest comment.

---

## REPORT BACK

1. sha256 of all eleven before and after. **Exactly three differ.**
2. **The consumer census, before any edit** — what each of the three values is used for, on each
   client surface. **If the portal needs `brandSessionId`, stop and report.**
3. Before/after for the three responses.
4. **The comment text**, quoted, so the lane can check it claims containment and not a fix.
5. **Evidence the passport, brand pack and portal still render and function** without the removed
   fields.
6. The query-string log question, the four unchecked actions, and the caching question.
7. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

Mid-batch: **three `AWAITING NAME` lines**, `3 of the 11 tracked surfaces modified`, exit 1. **That
is correct for this shipment and for no other.** Eight surfaces unchanged, `index.html` among
them.

---

## SMOKE

**Step 1.** Open a published passport. **It renders exactly as before**, and the response contains
no `brandId`.

**Step 2.** Open a brand pack share link. Same.

**Step 3.** The retailer portal opens a submission and functions. **If it cannot, Part 1 is a
redesign and this shipment stops.**

**Step 4 — the one that states the limit.** After all three, **`session_id` is still accepted
unverified from the request body.** Nothing in this shipment changes that, and nothing in the UI
or the code may suggest otherwise.
