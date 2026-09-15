# VeyaFlow — #147: identity. SCOUT, AND IT MUST SIZE, NOT ONLY MAP

**Monday 14 September 2026 · coding lane → CC · READ ONLY. NO EDITS.**

**Strategy, 11 Sep:** *"The risk with #147 is not that it is hard, but that 'identity = account'
quietly grows into a month and therefore never starts."*

**So this scout's deliverable is a NUMBER, not a map.** A survey that ends without a smallest
buildable thing and a day count has failed, however complete it is.

**#147 has been ruled and unscheduled.** Everything else on the board has a queue position;
identity had none — and it sits under **#143** (the catalogue does not mirror), which sits under
**the dossier surviving at all**, which sits under **the face-tape run meaning anything.**
Durability has not moved since Tuesday.

---

## NAMED BASELINES — ELEVEN SURFACES, UNCHANGED AT BOTH ENDS

Request the current values from the lane — `index.html` will have moved with #180 Part 1. **This
is a scout: `./verify.sh` must be GREEN, `0 of the 11 tracked surfaces modified`, exit 0, at the
end. Any digest movement is a failure of the shipment.** Measure in a pristine copy.

---

## RUN IT BESIDE #179 AND #181 — THEY ARE ONE QUESTION

**Is there a record?**

- **#179** — does it survive a **boot**?
- **#147** — does it survive a **browser**?
- **#181** — is it the **same for both parties**?

**A record that fails any one of the three is not a shared record**, which is what §9 says the
moat is. **Read the three answers together.**

---

## QUESTION 1 — WHAT IS IDENTITY TODAY, EXACTLY

**Report the full lifecycle of `session_id`**, at the bytes:

- Where is it minted, by what generator, with what entropy?
- `ns_session_id` shows **2 quoted occurrences** — confirm and classify both.
- **Does it ever leave the browser?** Which proxy actions carry it, and in what position — body,
  header, query? *(Never a query string: that is a standing rule, and if it is in one, that is a
  finding on its own.)*
- **What does possession of it authorise?** Name the rows a holder can read and write.
- **Does it expire?** The `CODING_STATUS.md` incident described it as *"an unexpiring bearer
  value"* — **confirm or refute at the bytes.**

**And the row it sits beside:** the same note described **~13 RLS-enabled tables with zero
policies**. `supabase-proxy.js:35` says it *"uses service_role, bypasses RLS."* **Report the
current count of RLS-enabled tables and how many carry a policy.** That number decides whether
identity is a feature or a control.

## QUESTION 1b — THE AUDIT TRAIL ALREADY HOLDS THE ANSWER, IN PRODUCTION

**Added 15 Sep. Not a hypothetical — six rows of real data, read out of the database.**

`SELECT changed_by, new_status, changed_at FROM submission_status_log` returns **two identity
schemes in one column:**

```
changed_by
buyer-test@veyaflow.internal     ← an email. A real account. Verified by Supabase Auth.
sess_1776262521142_s1kn9gn       ← a browser string. Verified by nothing.
```

**The second value is `ns_session_id`** — the same string inside `brand_id` on all three published
DPP records (`cloud___glow_sess_1776262521142_s1kn9gn`), and the same value #186 established is an
**unexpiring bearer credential.** It is minted at `index.html:40253`.

**So `changed_by` cannot answer "who". It answers "which browser".** And the two halves of the log
are asymmetric by construction: **the second party is authenticated, the paying customer is not** —
the ninth-and-clearest instance of the standing pattern, visible in production data rather than
argued from code.

**Three consequences the sizing must account for:**

1. **Clearing the browser severs the audit trail**, not only the workspace. Every future entry
   carries a different `changed_by` **with nothing linking it to the earlier ones** — the prior
   entries become permanently unattributable.
2. **Identity is what makes the trail mean something.** The lane's starting position resolves
   *user → brand row → that row's `session_id`*, **after which `changed_by` can hold a person.**
   That is a consequence of #147 nobody had named, and it belongs in Question 4's item 4.
3. **It is also a back-fill question.** Existing rows hold the session string. **Does the minimum
   migrate them, alias them, or leave them?** *"Leave them"* is an acceptable answer — **but it must
   be a stated one**, because an audit trail with two eras and no bridge is a finding of its own.

**Answer, in the report:** which other tables key on `session_id` **as an actor** rather than as an
owner. **That set, not the owner set, is what a person-shaped identity has to reach**, and it may be
larger or smaller than Question 4 assumes.

---

## QUESTION 2 — WHAT ALREADY EXISTS IN THE PORTAL, AND IS IT REUSABLE

**Strategy's first question, and it is the one that could halve the estimate.**

`portal.html` is a **tracked surface with a second party already using it.** Report:

- **How does a retailer reach a submission today?** A link, a token, a code — name it and its
  shape.
- **Is there any auth at all**, or is possession of the URL the whole of it?
- `share-dpp.js` and `share-brand-pack.js` mint share links. **What is in those tokens, how long
  do they live, and can they be enumerated?**
- **Does any of it transfer to brand-side identity**, or is it one-way share-link machinery that
  only looks like auth?

**Say which, plainly.** A share token and an identity are different things that resemble each
other, and the whole estimate turns on not confusing them.

## QUESTION 3 — WHAT SURVIVES A CLEARED BROWSER TODAY

**Measured, not recalled.** The 9 Sep audit found: `brand` survives, loop events survive, BIL rows
survive, portal submissions partly; **`sourcingCRM`, mfr overrides, listing submissions and SKUs
do not.**

**Re-measure it** — #135, #167 and four shipments have landed since — and add the fields that
matter now:

- **`sku.dossier`** — #135's record, the one the face-tape run depends on.
- The five dossier fields and `productCategory`.
- **And the trap already known:** `seedDemoNordlys()` **pre-empts `brand.load`'s gate**, so a
  cleared browser may show a *seeded* brand rather than a restored one. **A restore that looks
  like a restore and is actually a seed is the worst possible answer**, and it must be
  distinguished explicitly.

**State what a real user loses**, in their words: *"you would lose your 51 products."*

## DESIGN IS IN THIS SPEC, NOT AFTER IT — STRATEGY, 14 SEP, CORRECTING ITS OWN RULING

**#147 ADDS SCREENS THAT DO NOT EXIST TODAY** — registration, sign-in, account. Strategy had ruled
that design need not wait on #147 because identity does not change what is on screen. **That was
wrong: identity is the one shipment on the board that creates surfaces rather than correcting
them.**

> **An account means someone registers. That is the FIRST MINUTE — the surface canon calls the
> most important.**

**And the sizing below carries the defect it was written to avoid.** The client estimate reads
*"minimal sign-in and 'check your email' screen"* — **a screen produced as a byproduct of a
function landing**, which is precisely the pattern Strategy named on 14 Sep: *the surface was
produced, it was not drawn.* **The anti-scope-creep discipline that kept the number honest is the
same discipline that would make the first minute a side effect.**

**THE TWO OBJECTS ARE DIFFERENT:** *the minimum that survives a cleared browser* and *the first
minute a customer experiences* are not the same thing, **and the sizing optimised for the first.**

**What this changes and what it does not:**

- **Scope does NOT grow.** The "what it is NOT" list below stands in full — no password, no roles,
  no invites, no account-settings screens.
- **AUTHORSHIP changes.** The two or three screens that DO ship are **drawn by DESIGN**, not
  produced by CC. A minimal surface may still be a designed one.
- **The design SYSTEM is on this shipment's critical path** — palette, typography rule, weight
  steps, scale rule, absence pattern, layout width. It is **unblocked today** and depends on no
  shipment. **DESIGN's system work must land before #147's client half starts.**
- **Report the day cost of that dependency separately** from the engineering days, so the two
  numbers are not blended into one that hides which is which.

---

## QUESTION 4 — THE SIZING. THIS IS THE DELIVERABLE

**Not a design. The smallest thing that survives a cleared browser.**

**Propose ONE minimum, and state it as: what it is, what it is not, and how many days.**

The lane's starting position, for you to confirm or refute with reasons:

> **An email and a link. No password, no account UI, no roles, no org model, no invites, no
> reset flow.** The brand states an email; a link restores the workspace on any browser. That is
> the whole of it.

**For the proposal you land on, answer all four:**

1. **What does it replace `session_id` with**, and does the existing row key survive or does every
   table need a new column?
2. **What does it NOT do?** List the things a reader will assume are included and are not.
   **This list is the anti-scope-creep device and it is the most useful paragraph in the
   report.**
3. **How many days?** A range is fine; *"it depends"* is not. **If you cannot size it, say which
   single unknown prevents it** — that unknown then becomes the next scout, and it is smaller
   than this one.
4. **What does it unblock, in order?** #143's mirror, #148's back-fill, document upload
   (retention and custody, not plumbing — Storage is already in production), **the audit trail
   naming a person (Question 1b)**, and the durability of everything else.

**If the honest answer is that the minimum is larger than a week, say so.** An honest large number
is worth more than an optimistic small one, and Strategy has ruled twice this week that the
honest lower number wins.

---

## OUT OF SCOPE

- **Any edit.** This is a read.
- **Designing the account system.** Question 4 asks for a floor, not an architecture.
- **Fixing RLS.** Report the count; the policy work is its own shipment.
- #179, #181, #165, #172, #162.

---

## REPORT BACK

1. All eleven digests before and after — unchanged, `0 of the 11 tracked surfaces modified`.
2. `session_id`'s full lifecycle, **including whether it expires and what it authorises.**
2b. **Every table keying on `session_id` as an ACTOR, not as an owner** (Question 1b), and whether
   the minimum migrates, aliases or abandons the existing `submission_status_log` rows.
3. **RLS: tables enabled, policies present.** The number is the finding.
4. The portal's auth, and **whether it transfers — share token or identity, said plainly.**
5. The cleared-browser measurement, **with `sku.dossier` answered explicitly** and the seed-versus-
   restore trap distinguished.
6. **THE SIZING: one minimum, what it is not, how many days, what it unblocks.**
7. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

**GREEN, `0 of the 11 tracked surfaces modified`, 0 not found, exit 0.** A scout that moves a
digest has stopped being a scout.

---

## NO SMOKE

Nothing ships. **Question 4 is the evidence**, and the report is judged on whether a number came
back.
