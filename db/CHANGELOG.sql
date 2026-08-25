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
