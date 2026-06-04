# VeyaFlow — Coding Continuation Brief

**Authored:** Wednesday 3 June 2026 · coding chat (BIL Sequence B scoping session)
**Purpose:** Hand off current state to whatever chat resumes this work — including the Claude Code setup, once that's done. Read this first. Do not scope from memory or from older docs without checking the corrections below; several pieces of canonical documentation are now operationally stale and will cause real bugs if followed literally.

> **Why this brief exists:** project-knowledge scope does not fully transfer between chats (confirmed this session — one chat saw 25 project files, this one saw 5). Assume a fresh chat starts blind. Upload this brief + the files listed in §6 directly. Verify with `ls /mnt/project/` early.

---

## 1. Two corrections that override existing docs

These are the highest-value items. A fresh chat reading the supplement or roadmap literally will get both wrong.

### 1.1 Function timeout / client-abort numbers — RESOLVED, docs are stale

Four numbers exist across the records. Here is the reconciled truth:

| Number | Source | Status |
|---|---|---|
| 10s | Personal plan cap | obsolete (upgraded to Pro) |
| 26s | Supplement §2.2 F2 lock; original netlify.toml | **STALE** — this was the *requested* value |
| 30s | Netlify's actual grant (support reply, 3 Jun) + **currently deployed** netlify.toml | **CANONICAL — this is reality** |
| 35s | Supplement §5.1 B4 ("ceiling 26 + 9s slack") | **WRONG against reality** — see below |

**The rule the supplement encodes is correct; its arithmetic is stale.** Supplement §5.1 B4 sets client abort = function ceiling + ~9s network slack. That logic is sound. But it computed against a 26s ceiling to get 35s. The real ceiling is **30s**, so the same rule yields **~39s client abort**, not 35.

**Action for B4:** client abort = **~39s** (30s ceiling + 9s slack). Do NOT wire 35s — it will look internally consistent with the supplement's own math while being incoherent against the deployed 30s ceiling.

**This needs canonicalizing, not just a session note.** Flag to strategy chat so the supplement's "26s timeout" lock and the §5.1 B4 "35s" line are corrected in the next Methodology Codification / Roadmap pass. (Same principle strategy applied to Insight 13: session notes drift; canon must absorb the fix.)

### 1.2 B6 was NOT authored

Roadmap line "B6 available as no-regret prework" means *B6 is the next prework that could be done*, not *B6 is done*. **Only B5 exists as a file** (`bil_extraction_pipeline_b5.js`). Do not search for a B6 file — there isn't one.

---

## 2. Brand Pack reskin — PRODUCED, NOT DEPLOYED

**State:** the reskin is authored and verified in this session's outputs (`brand-viewer.html`), but **`brand/index.html` on `main` is still the pre-reskin file** (verified 3 Jun: still carries `--navy:#1B2D4F`, `--gold:#C4A882`, Playfair, Inter, JetBrains Mono).

Do NOT re-author the reskin — it exists and is correct. It needs **committing**, which is Charlotte's action, not a build task.

- **Output file:** `/mnt/user-data/outputs/brand-viewer.html` (245→292 lines; clay/ink/paper tokens + Fraunces/Newsreader/Geist/Geist Mono; navy/gold/Playfair fully removed; fetch + `?retailer=` + `esc()` preserved byte-for-byte; acorn-clean; rendered populated + verified visually this session).
- **Commit path:** the working filename is `brand-viewer.html` but it deploys as **`brand/index.html`** (repo renamed it ~1 month ago; same convention as `dpp-viewer.html` → `dpp/index.html`). Commit to `brand/index.html`, not the root.
- **After commit:** redeploy, then verify a live `/brand/{uuid}` magic-link URL renders in the new system.

**Four flags carried from the ship report (unresolved, for whoever deploys or extends):**
1. `brand.positioning` and `brand.contactEmail` may not exist in the data model — cover sub-line and CTA mailto degrade gracefully if absent, but populating them needs schema fields.
2. Cover "Retailer-ready" pill is gated at readinessScore ≥ 70.
3. `coverAccent` is now dead (retained as no-op; removable from pack schema later).
4. Shared cover component: both Brand Pack and DPP specs want the framed cover built *once* and reused. Build it shared when the DPP viewer (`dpp/index.html`) is also in hand — not before.

---

## 3. F2a verification chain — COMPLETE

- Netlify granted 30s ceiling (3 Jun) → netlify.toml set to `timeout = 30` → **deployed netlify.toml is in outputs** (`netlify.toml`) → proxy verified HTTP 200 → single-page Vision extraction measured.
- **Measured (single-page, NORDLYS deck):** p50 11.4s / p95 12.7s / max 12.7s, 3/3 success, ~17s headroom under 30s.
- **Decision: synchronous extraction (F2a) is the path.** Single-page proven safe with margin.
- **netlify.toml commit note:** like brand-viewer, this output file must be committed to repo root and the site redeployed. (If already committed/deployed this session, mark done — verify against repo.)

**OPEN — multi-page latency never measured.** Only single-page ×3 was run. The 15-page worst case against 30s is modeled, not measured. Supplement §3.3 records Netlify's own warning that dense multi-page may hit 15–20s+. Consequence: **B6 fallback handling is load-bearing, not optional** — a 15-page deck could 504, and the slice must catch it gracefully.

---

## 4. BIL Sequence B — vertical slice scope (READY TO BUILD)

**Status per supplement §5.1:** B1, B2–B3, B4, B6 NOT STARTED. B5 DONE (`bil_extraction_pipeline_b5.js`, read + verified this session, syntax-clean, 495 lines: schema + prompt + `buildBilExtractionCall` + `validateBilExtraction` + `isPopulated`).

**B5 codebase anchors — VERIFIED present in current `index.html`:** autofill extractor ~L1617 (the integration template to mirror), `safeJsonParse` (43 uses), fence-strip pattern (6 uses), `claude-sonnet-4-6` (live). B5's 15-page cap is enforced in `buildBilExtractionCall` via a throw — caller must catch it.

**The minimal end-to-end testable slice:**

| Step | Slice scope | Notes |
|---|---|---|
| B5 | Inline its 4 components near autofill (~L1617); drop the CommonJS export guard | DONE as file; just needs inlining |
| B1 | File picker + 25MB + 15-page validation (skip drag/drop polish) | F3c lock |
| B2–B3 | pdf.js lazy-CDN (mirror jsPDF/xlsx lazy-load pattern); pages → canvas → base64 | irreducible |
| B4 | `buildBilExtractionCall` → fetch anthropic-proxy → response; **client abort ~39s** (see §1.1) | no proxy changes needed |
| B6 (minimal) | Catch parse_error / 504 → fallback message | **load-bearing** (see §3) |
| display | Dump `validateBilExtraction` result to a dev panel/console — NOT the Sequence C form | Sequence C deferred |

**Locks honored:** F1 (trust+monitor, no client-side enforcement — validation messaging only), F2a (sync, ~39s abort over 30s ceiling), F3c (15-page cap), F7 (5 fields + sub-schemas — already shipped in Sequence A's V4 migration).

**Explicitly deferred:** Sequence C (draft review UX), Sequence D (onboarding/ad-hoc entry points), full B6 retry sophistication.

**Agreed first checkpoint:** B5 inline + B1 upload UI, acorn-verified, as a contained first session before touching the heavier pdf.js/vision pieces. Build incrementally (verify after each sub-edit), never one giant edit into the 37k-line file.

---

## 5. Methodology rules in force (apply throughout)

- **#13** baseline grounding — scout actual file state before editing; grep fingerprints, don't trust cached line numbers.
- **#14** acorn verification — `node ast_verify.js <file>` after every meaningful edit. (Harness + acorn setup: ast_verify.js expects acorn at `/tmp/node_modules`; `pip`/`npm` installs work; the file's single-`<script>` heuristic suits brand-viewer but the main SPA has 6 script blocks — verify the right block.)
- **#19** defensive/idempotent loaders.
- **#20** prospective architectural verification — scout before scoping.
- **#22** SHAPE verification — dbCall nests under `.data`; portalCall flattens to root. BIL client wrappers use portalCall. Not interchangeable.
- **Insight 12** bidirectional scout — scout strategy/design artifacts before treating them as fully specified.
- **Insight 13 (candidate, zero validations)** reconciliation-friction-as-conceptual-signal. Gates Rule #24. Owned by strategy for canonicalization — do NOT hold a coding-side copy (session state is where definitions die).

---

## 6. Files the resuming chat needs (upload directly — won't transfer via project knowledge)

**In this session's outputs (ready to commit):**
- `brand-viewer.html` → commit to `brand/index.html`
- `netlify.toml` → commit to repo root
- `BIL_F2_latency_harness_v2.js` → reference tool (30s ceiling, multi-page payload)

**Must re-supply to a fresh chat:**
- `index.html` (the main SPA — the file all BIL work edits)
- `bil_extraction_pipeline_b5.js` (the B5 engine to inline)
- `VeyaFlow_BIL_UseCaseA_Supplement_v1_1_PLAINTEXT.md` (F-locks, sub-edit breakdown — but apply §1.1 correction over its stale 26/35 numbers)
- `ast_verify.js` (Rule #14 verifier — was context-only this session, not on disk; have a copy ready)
- Design refs if continuing reskins: `VeyaFlow_BrandPack_Reskin_v1.html`, `VeyaFlow_DPP_Reskin_v1.html`, `VeyaFlow_Design_Tokens_Locked_v4.md`

**Note on .docx files in project knowledge:** several are plain text mislabeled `.docx` (supplement, methodology codification). `python-docx` fails on them; read with `cat`/text tools.

---

## 7. Calendar / resolved this session

- Netlify F2a timeout: **RESOLVED** — approved 30s, decision moment (was 3 Jun EOD) cleared early. No F2b pivot needed.
- Rule #24 / Insight 13 reconciliation: closed — both survive distinct + cross-referenced; strategy owns canonicalizing; no coding-side copy held.

---

## 8. Immediate next actions for resuming chat

1. Confirm grounding: `ls /mnt/project/`, then baseline acorn check on `index.html`; grep `migrateSkuSchemaV8` (expect 1 def + 1 init = post-Option-B state) and `migrateBrandSchemaV4` (Sequence A shipped).
2. Verify Brand Pack + netlify.toml deploy status against the actual repo (this brief says produced/deployed-this-session, but confirm `main`).
3. Begin BIL slice at the agreed checkpoint: B5 inline + B1 upload, incremental, acorn-verified.
4. Wire B4 with **~39s** client abort (§1.1) — not 35.
5. If Claude Code is now set up: bring this brief in as the grounding doc; let the verify-edit-verify loop run in-repo with acorn as a pre-commit check.
