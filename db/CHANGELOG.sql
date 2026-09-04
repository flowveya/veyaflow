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
-- that produced invented_causality = 1. UPDATE 1 is therefore proof that exactly
-- what was measured is what was corrected — no dedupe_key transcription can
-- widen or miss it.
update public.loop_events
set drafted_content = 'not_recorded',
    updated_at = now()
where trigger_type = 'rejection'
  and drafted_content is not null and drafted_content <> ''
  and nullif(trim(context->>'reason'), '') is null;
