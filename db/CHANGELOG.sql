-- ============================================================
-- VeyaFlow — Supabase database changelog
-- Every schema/permission change run against the production
-- Supabase project, dated, newest last. Statements were executed
-- by Charlotte in the SQL Editor after coding-chat ruling and
-- screen-verified against the Security Advisor.
-- This file is documentation-as-code: appending here is part of
-- every future DB change. It is NOT an automated migration runner.
-- ============================================================

-- ── 2026-08-15 · Security item #3 (2 Jul log) — v_retailer_users leak ──
-- The view was SECURITY DEFINER in public, joining retailer_accounts
-- to auth.users and exposing auth_user_id / last_sign_in_at / emails
-- to API roles while bypassing RLS. App never queries it (0 refs);
-- only legitimate consumer is the service-role proxy.
-- Verified: Security Advisor errors 2 -> 0.
alter view public.v_retailer_users set (security_invoker = true);
revoke all on public.v_retailer_users from anon, authenticated;

-- ── 2026-08-25 · Advisor warning triage, part 1 — admin/trigger RPCs ──
-- Both were anon-callable SECURITY DEFINER functions via /rest/v1/rpc.
-- Triggers keep firing regardless of EXECUTE grants.
-- Verified: Advisor warnings 24 -> 20.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- ── 2026-08-25 · Advisor warning triage, part 2 — orphaned OTP quartet ──
-- Zero call sites across portal.html, brand/, dpp/ and all Netlify
-- functions (read-only grep, Claude Code): remnants of a superseded
-- OTP/magic-intake design; shipped portal uses password auth via
-- supabase-proxy portal.auth.login. Bodies PRESERVED in the DB —
-- reversible by GRANT if the intake flow is ever revived.
revoke execute on function public.generate_otp(uuid) from public, anon, authenticated;
revoke execute on function public.verify_otp(uuid, text) from public, anon, authenticated;
revoke execute on function public.validate_intake_token(text) from public, anon, authenticated;
revoke execute on function public.link_profile_to_brand() from public, anon, authenticated;

-- ── 2026-08-25 · Advisor warning triage, part 3 — search_path pinning ──
-- All 10 linter-flagged functions pinned to search_path = public
-- (public, not '', deliberately: '' breaks unqualified table refs;
-- public closes the schema-hijack vector the linter targets).
-- Verified: Advisor warnings 20 -> 2.
alter function public.generate_otp(uuid) set search_path = public;
alter function public.verify_otp(uuid, text) set search_path = public;
alter function public.validate_intake_token(text) set search_path = public;
alter function public.link_profile_to_brand() set search_path = public;
alter function public.update_submission_geometry() set search_path = public;
alter function public.loop_events_touch_updated_at() set search_path = public;
alter function public.portal_submissions_touch_updated_at() set search_path = public;
alter function public.dpp_records_on_update() set search_path = public;
alter function public.update_updated_at() set search_path = public;
alter function public.set_updated_at() set search_path = public;

-- ── Residual Advisor state after 2026-08-25 (no action, documented) ──
-- WARN extension_in_public: pg_trgm installed in public schema.
--   Deferred to a cleanup pass — moving extensions can break references.
-- WARN auth_leaked_password_protection: Pro-gated on Free plan.
--   Accepted-for-now; revisit with the Pro-vs-keepalive decision.
-- INFO rls_enabled_no_policy on 13 tables: RLS on, zero policies =
--   default-deny, service-role-only. Correct for the single-user
--   architecture; per-account policies are multi-user-layer work.

-- ── Dashboard-level events (not SQL, recorded for completeness) ──
-- 2026-08-15: Supabase project resumed after free-tier auto-pause
--   (root cause of the supabase-proxy 500 outage; zero code changes).
-- 2026-08-25: buyer@matas.dk sessions revoked (backup-file tokens dead).

-- ── 2026-09-04 · #110 item 4 — invented causality removed from loop_events ──
-- FIRST DATA CORRECTION IN THIS FILE. Every entry above changes schema or
-- permissions. This one changes a stored value, and it is recorded here for the
-- reason §6.2 demands of the product itself: a change to a record that carries
-- consequence must say who changed it, when, and on what basis. A silent cleanup
-- of a poisoned record is the failure the product exists to prevent, performed
-- on ourselves.
--
-- THE COUNT BEFORE CORRECTION, WHICH IS ITSELF THE DATUM (Strategy, 4 Sep):
--   rows_total          2
--   rows_with_content   2
--   invented_causality  1     <- corrected by the statement below
--
-- Read that as 1 of 2, not as "one row". The loop_events registry — the
-- self-improving outcome substrate of §4 and §8.4, the thing ranked above the
-- Brand Pack fabrications because "a poisoned registry learns the wrong thing
-- permanently and carries it to the next customer" — contains two rows in total.
-- One clean (sell_through_high, the grounded builder), one invented. The ranking
-- was argued from principle and the principle stands; nobody counted first, and
-- the magnitude was assumed for a full working day.
--
-- IT ALSO CAPS A HYPOTHESIS PERMANENTLY. The observation that the clean builder's
-- Matas draft was accepted while the fabricating builder's Lyko draft was not is
-- logged as a hypothesis, not a finding. Those two drafts are now known to be the
-- entire dataset: n=1 per arm. No existing data can promote it.
--
-- THE ROW: Lyko rejection, 27 Aug. context->>'reason' was empty; drafted_content
-- asserted three causes ("inadequate margin structure, oversaturated category
-- positioning, or insufficient brand differentiation"). The prompt instructed it
-- (index.html:40334 before the #110 fix), so this is not model drift.
--
-- WHY THE LITERAL not_recorded AND NOT NULL OR '': a blanked field is
-- indistinguishable from one that was never written. "We removed an invention
-- here" and "nothing was ever generated" must stay distinguishable.
--
-- KNOWN AND ACCEPTED: the loop-event card renders drafted_content directly and
-- has no handling for this sentinel, so the row now displays the raw string
-- not_recorded. checkState's four-state treatment covers the compliance surface
-- only. Bringing the events surface to the same handling is follow-up work.
--
-- PREDICATE IDENTITY: the WHERE clause below is character-identical to the one
-- that produced invented_causality = 1, so the write cannot reach a row the
-- measurement did not count.
--
-- BUT THE CODING LANE FIRST CLAIMED MORE THAN THAT AND WAS WRONG, recorded here
-- because the error is instructive. The claim was that re-running the count after
-- the update would return 0, making the statement self-proving. IT CANNOT. The
-- sentinel 'not_recorded' is itself non-null and non-empty, so a corrected row
-- STILL SATISFIES the predicate. The count reads 1 before and 1 after, forever.
-- That is a check that cannot fail — the exact defect verify.js exists to prevent,
-- authored by the lane, into the post-condition of the shipment about checks that
-- cannot fail. Third instance in one day (the others: grep -l matching
-- process.env.API_KEY as if it were a secret; a spec guard counting a comment as
-- a call site).
--
-- WHAT ACTUALLY VERIFIED IT was reading the rows rather than asking a question
-- with one possible answer:
--   c8d5b017 sell_through_high Matas  original text intact, updated_at 2026-04-27
--   2d6169af rejection         Lyko   'not_recorded',      updated_at 2026-09-04
--                                                                    18:29:42Z
-- That check fails in both directions: it catches an update that did nothing AND
-- an update that also hit the clean control row.
--
-- ORDERING DEFECT, OURS: this entry was committed (83d04f2) BEFORE the statement
-- was executed. For the interval between that commit and the execution, the file
-- asserted a database change that had not happened — in a file whose header says
-- "Statements were executed by Charlotte in the SQL Editor." Corrected forward by
-- executing, not by rewriting history. The rule this establishes: the changelog
-- entry and the commit go in AFTER the statement runs and its effect is read back.
--
-- FOR NEXT TIME: add `returning id` to a corrective UPDATE. It prints the rows it
-- touched, so the statement evidences its own effect instead of depending on a
-- separate check that may not be capable of failing.
update public.loop_events
set drafted_content = 'not_recorded',
    updated_at = now()
where trigger_type = 'rejection'
  and drafted_content is not null and drafted_content <> ''
  and nullif(trim(context->>'reason'), '') is null;

-- ── 2026-09-23 · #241 — seeded auth accounts moved off real companies' mail domains ──
-- Executed by Charlotte in the SQL Editor. Entry written AFTER the statements ran and
-- their effect was read back, per the rule established by the #110 entry above.
--
-- WHY THIS WAS NOT "LATENT, THEREFORE LATER". Most triggers fire on a decision or an
-- edge case. This one fires on THE PRODUCT WORKING AS INTENDED: the moment the retailer
-- portal sends its first mail, "confirm your VeyaFlow account" reaches a buyer who never
-- created one, at the three companies we intend to sell to. The window is closed by
-- planned work, not by an accident.
-- Measured before the change and the reason it was still latent: confirmation_sent_at,
-- recovery_sent_at and email_change_sent_at all NULL; email_confirmed_at 13ms after
-- creation (admin auto-confirm). NO MAIL HAS EVER BEEN DISPATCHED FROM THIS PROJECT.
--
-- UPDATE, NEVER DELETE — #148's reasoning: do not destroy identity to fix a leak. An
-- email change keeps the id; a delete orphans everything referencing it. Every statement
-- keyed by an explicit id, never by a predicate over the column being changed.
--
-- SCOPE, MEASURED RATHER THAN ASSUMED — and it came back THREE TIMES LARGER than the
-- three rows this item was opened for:
--   auth.users            4 rows total, grouped over the whole table with no filter,
--                         so this is a CEILING as well as a floor. 3 non-reserved.
--   address columns       found via information_schema across the public schema, NOT
--                         from memory — the lane's guessed list named two tables with
--                         no address column at all and one column that does not exist.
--                         7 columns hold addresses; only profiles and retailer_accounts
--                         carried any of the three domains.
--   raw_user_meta_data    checked by regex for the three names: no rows. The one place
--                         a seeded address could hide that no split_part() would see.
--   => NINE rows, not three: the same address stored in three tables.
--
-- THE ROWS (id + BEFORE DOMAIN + AFTER address; see the privacy note below):
--   39e73a6f-a209-4de8-91de-0e5b3a72013f  apotekhjartat.se -> buyer-apotek@example.com
--     (auth.users, profiles) + retailer_accounts 712748d8-aec8-42ef-bb29-34a887b5ea26
--   fca10f07-e107-40a5-a9ae-24d4486963de  lyko.se          -> buyer-lyko@example.com
--     (auth.users, profiles) + retailer_accounts afb2ff12-6ee6-488c-9d3d-e90477b487af
--   2a7d21be-e995-408e-864c-ac508e9697e1  matas.dk         -> buyer-matas@example.com
--     (auth.users, profiles) + retailer_accounts 463c100b-0a55-4f3a-9ad6-230cf56e2f12
--
-- example.com, NOT veyaflow.internal, AND THE DIVERGENCE IS CLOSED RATHER THAN FOLLOWED.
-- Canon says example.com; verify.expected.txt:982-983 said buyer-test@veyaflow.internal.
-- Two conventions for "this is test data" is the vocabulary problem a third time. Both
-- are technically safe, but veyaflow.internal is only obviously fake IF YOU KNOW OUR
-- CONVENTIONS; example.com is obviously fake to anyone. A marker exists so that a
-- STRANGER reading the line can see it is test data.
-- The fourth row (e9542fec... / 6a431a21..., already on veyaflow.internal) was NOT
-- changed. It removes no exposure; normalising it is a separate, deferred judgement.
--
-- PRIVACY CALL, FLAGGED RATHER THAN MADE SILENTLY. The instruction was to record the
-- before-values so the change stays repeatable. THIS REPO IS TREATED AS FULLY PUBLIC,
-- and a complete before-address is a plausible, guessable mailbox at a real company —
-- the same exposure class this change removes, moved from the database into a public
-- file. So: id + before DOMAIN + after address, local parts omitted. That reconstructs
-- which rows changed and what class of change it was.
-- PRE-EXISTING AND NOT COMPOUNDED: line 66 of this file already carries one of these
-- addresses in full, from 25 Aug. It stays. History is corrected forward, never
-- rewritten — the same rule the #110 entry above established, and no force-push.
--
-- VERIFIED BY READING THE ROWS BACK, and the check can fail in both directions: the
-- domain query re-run across all three tables returns example.com x3 and
-- veyaflow.internal x1 in each, with NO real-company domain anywhere. It would catch an
-- update that did nothing AND one that reached further than intended.
-- BUT THE INSTRUCTION FOR THIS WAS ALREADY ON THE PAGE AND WAS NOT FOLLOWED: line 138
-- above says "add `returning id` to a corrective UPDATE" so the statement evidences its
-- own effect. It was not added. The separate check happens to be capable of failing, so
-- the verification stands — but the file held the instruction and the lane did not read
-- it. Fourth instance this week of an artefact answering a question nobody asked it.
-- (The RLS status queried before this change was likewise already recorded at line 59.)
--
-- RAISED AND NUMBERED BEFORE THESE STATEMENTS RAN, so that closing #241 could not bury
-- it: #249 — THE SAME ADDRESS IS STORED IN THREE TABLES AND NOTHING RECONCILES THEM.
-- on_auth_user_created is AFTER INSERT; set_updated_at is a timestamp. The copies are
-- written once at creation and never again. profiles.id = auth.users.id, but
-- retailer_accounts has NO key to auth at all — the only join is the email string
-- itself, a foreign key made of a mutable value. AND NO SURFACE RENDERS BOTH COPIES, so
-- the divergence is not merely undetected but UNDETECTABLE THROUGH USE. It does not fail
-- safely either: company addresses get reassigned or sit on shared mailboxes, so a stale
-- value may point at someone else rather than at nothing.
--
-- SCOPE NOTE: this changes no application surface. No digest moves, verify.sh is not
-- involved, and #227's sweep still cannot see any of it — that instrument reads code and
-- these live in data, in either direction, which is why the ordering gate between the
-- two was discharged rather than satisfied.

-- ── 2026-10-02 · Part 1 of the 2 Oct screen-read — PUBLISHED BRAND PACK ASSERTS AN RP IT DOES NOT HAVE ──
-- A published, buyer-facing Brand Pack at veyaflow.netlify.app/brand/479e6985-… renders
-- "✓ EU RP · Cosmeservice GmbH" under the heading "VERIFIED DATA ONLY, NO AI", while the
-- EU Responsible Person page for the same brand in the same session shows
-- "EU RP AGREEMENT EXPIRED · Cosmeservice GmbH · EXPIRED 2025-12-31". A third party can
-- open that link today and read that the brand has a valid Responsible Person. It does not.
--
-- BEFORE-VALUES, read in the SQL Editor by Charlotte 2 Oct 2026 before the statement ran:
--   id          479e6985-0d85-46b2-a517-be2d805c6b3b
--   brand_id    cloud__glow_sess_1776262521142_s1kn9gn
--   active      true
--   created_at  2026-05-05 11:12:58.40101+00
--   expires_at  2026-11-29 11:24:11.054+00
-- brand_pack_data deliberately NOT read or recorded: it is real Cloud & Glow content and
-- this repo is treated as fully public. The id and brand_id are already in the published
-- URL, so recording them adds no exposure — the same privacy call as the #241 entry above,
-- made explicitly rather than silently.
--
-- SUFFICIENCY MEASURED FIRST, AND IT IS WHY A ROW CHANGE IS ENOUGH. pg_policies on
-- shared_brand_packs returns exactly one row: "Public can read active packs", cmd SELECT,
-- qual ((active = true) AND ((expires_at IS NULL) OR (expires_at > now()))), with_check NULL.
-- So active=false fails the POLICY, not merely the query in get-brand-pack.js — the row
-- becomes unreadable to anon on every path, not just through the function. Had the policy
-- been unscoped, the takedown would have been an RLS change and not this.
-- `Mätt: Supabase SQL Editor, Charlotte 2 okt. Metadata only — the pack was never fetched
-- to test it, per the standing constraint that an access-control defect is never verified
-- by exercising it against production.`
-- This also closes, three months late, what the 2 Jul note asserted without a measurement
-- ("policies confirmed correct"), and shows shared_brand_packs is NOT among the thirteen
-- RLS-on-zero-policy tables recorded 2026-08-15. Those thirteen are still unnamed here.
--
-- WHY active AND NOT expires_at. Backdating expires_at would also 404 the link, but the
-- function's message for that path reads "This Brand Pack link has expired" — which asserts
-- the link was once valid and timed out. It wasn't; it is being withdrawn. Remove, don't
-- soften, and don't state a false reason. active=false yields "no longer active or does not
-- exist", which is true.
--
-- `returning` ADDED PER LINE 138 OF THIS FILE, which the #241 entry recorded as an
-- instruction the file already held and the lane did not follow. The statement evidences
-- its own effect: one row, active false.
--
-- SCOPE: no application surface changes. No named digest moves, verify.sh stays GREEN with
-- 0 of 11 tracked surfaces modified, and #227's sweep cannot see this — it reads code and
-- this lives in data. That invisibility is exactly why this entry exists: it is the only
-- trace the change leaves.
--
-- THIS IS NOT THE FIX, AND THE ENTRY SAYS SO RATHER THAN IMPLYING IT. index.html:
-- buildPortalBrandPack sets euResponsible = { name, onFile: true } — onFile derived from
-- the presence of a NAME, never from the renewal date — so the next pack generated will
-- carry the same false assertion. Seven further sites produce a tick from the name alone,
-- against one correct comparator (index.html:_rpDateExpired, seven call sites, correct).
-- Measured by CC 2 Oct; the repair is queued as its own shipment.
--
-- FLAGGED, NOT RESOLVED: created_at is 2026-05-05 while the published pack renders
-- "Generated 31 Aug 2026". One active share per brand_id means the row is reused on
-- re-share, so the two fields measure different events and neither is labelled as such.
-- Not touched by this change.
update public.shared_brand_packs
   set active = false
 where id = '479e6985-0d85-46b2-a517-be2d805c6b3b'
returning id, active;

-- ── 2026-10-05 · CORRECTION to the entry at ecaabc5 — NOT an edit of it ──
-- History is corrected forward, never rewritten. The entry at ecaabc5 stands as written;
-- this one records what it got wrong and what was measured instead.
--
-- THAT ENTRY STATES that the published page rendered "✓ EU RP · Cosmeservice GmbH" under
-- the heading "VERIFIED DATA ONLY, NO AI".
--
-- MEASURED 5 Oct 2026: brand/index.html has no RP row and no compliance panel. It renders
-- coverHTML + sectionsHTML + skusHTML + snapshotHTML, and sectionsHTML is the MODEL'S
-- output (brandPackState.result split on '## '). The payload shareBrandPack builds carries
-- no euResponsible field at all. That string was on the GENERATOR'S OWN PREVIEW —
-- Charlotte's screen — not in the published document.
--
-- WHAT THE PUBLISHED PACK DID CARRY, read from brand_pack_data on 5 Oct 2026 by a reading
-- select against shared_brand_packs (Charlotte, SQL Editor): a MODEL-GENERATED table with
-- the row "EU Responsible Person | Cosmeservice GmbH" — name only, no tick, no date, no
-- state — and six rows marked "✓ Certified":
--   COSMOS Organic · B Corp · Vegan Society · Cruelty Free International ·
--   Nordic Swan · FSC Packaging
-- Whether those six are true, and whether any evidence for them is on record:
-- NOT ESTABLISHED. Their source is not measured either; brand.certifications is a
-- candidate, not a finding.
--
-- THE TAKEDOWN STANDS. The pack carried real Cloud & Glow data at a public URL from 5 May,
-- and the link was live and unmonitored. That was reason enough on its own.
--
-- NO DATABASE STATEMENT ACCOMPANIES THIS ENTRY. Nothing is being changed; this is the
-- record catching up with the measurement.
--
-- AND THE CLASS, because it is not a one-off: a model was handed a list of certification
-- names and rendered them as ticked assertions in a buyer-facing document. The brand-pack
-- prompt already forbids UPGRADING AN ABSENT ITEM to ✓ (generateBrandPack, and the same
-- rules are in generatePitch). It does not forbid the tick itself for a PRESENT list entry
-- — and a name typed into a field is not evidence of certification.
-- Ruled by Strategy 5 Oct: model prose never carries a tick, and never the words certified
-- / verified / compliant / notified. Such things are rendered by CODE from the record, with
-- state + date + source, or not at all.
