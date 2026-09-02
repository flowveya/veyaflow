# VeyaFlow — CODING LANE HANDOFF

**Written 2 September 2026, end of day. Read this first, then the CODING block of `VeyaFlow_Daily_Log.docx`.**

This document exists because the coding lane is moving to a new chat with the repo folder linked. It replaces the old coding chat — it does not join it. There are three lanes and each owns something; a fourth would mean two chats both believing they own byte-verification, and log divergence would come straight back.

---

## 1. WHAT THIS LANE IS

**This chat NEVER writes code.** A separate Claude Code instance (CC) makes every edit, then STOPS. This chat scouts, writes specs, byte-verifies CC's work against named baselines, gates commits and pushes, and keeps the daily log.

**Author ≠ verifier is the deliberate safety backbone.** It is not a workflow preference. It has caught real defects that CC's own reports missed, and it has caught defects in specs this lane wrote. Do not collapse it because the folder is now linked and reading is easy. **Reading directly is fine. Editing is not.**

The other two lanes: **STRATEGY** rules priorities and commercial questions. **DESIGN** owns the Daylight design system (zero-emoji hard rule).

---

## 2. STANDING RULES — do not relax any of these

**Verification**
- Never trust CC's report over the bytes. Verify everything independently.
- **Baseline mismatch is proceedable ONLY when the sha matches a value THIS CHAT named.** A sha CC reported itself is not sufficient. Anything else: stop, report, wait.
- Guards must state whether they count **RENDERED occurrences** or **raw string matches**. Every truth fix leaves the old literal inside its own removal comment; a raw `grep -c` counts those epitaphs and reports a false failure.
- **A check that cannot fail is not a check**, and reporting its result as a pass is worse than reporting nothing. Any guard whose subject is not found must report NOT FOUND. This binds specs as much as reports.
- One edit to `index.html` at a time.

**Spec-writing**
- When a finding is "X is labelled/gated wrongly", the spec must require a scout for **EVERY rendering and path of X**, not the quoted line. (The narrow-anchor pattern — it has bitten seven times.)
- When a value becomes a constant, **scout for the value, not the construction** — prose, comments and error messages carry it too.
- **A false claim can be phrased as an instruction.** Fix prompts, empty-state copy, blocker `fix` text and action-button labels are assertions. A truth fix must scout **remediation copy** as well as display copy.
- **Report-first for anything with a scope question.** Have CC classify and wait for a ruling rather than guessing at scope. Used for the first time on 2 Sep and it worked: it returned a correction, an evidenced recommendation, and two questions CC correctly refused to answer itself.
- House rules: **omit-beats-caveat**; **provenance-or-nothing**; **registry/product-type DATA drives framework logic, never hardcoded**.

**Git and data**
- **NO force-push ever. NO PR merges** (unrelated histories).
- Push is `git push origin f2b-async:coding-aug2026`. Netlify auto-deploys.
- **DB changes = Charlotte in the Supabase SQL Editor + append to `db/CHANGELOG.sql`.** Never from code.
- **NO SECRETS IN ANY OF THE THREE CHATS** — tokens, API keys, the Supabase service-role key, DB URLs with credentials. A PAT was pasted once and had to be revoked.
- Real Cloud & Glow packs never leave the machine. Fictional NORDLYS for external demos.

**Testing**
- **Batch N+1 does not ship until batch N is smoked**, or the debt is carried explicitly with what is unrun. Batch #6 still has four unrun steps because this was a preference rather than a rule.
- **Run smoke where the data is.** `file://` and every device have their own localStorage. A smoke run from the wrong origin passes against an empty catalogue — the worst kind of pass, because it looks like verification and tests nothing.
- Verdicts: **verklig / buggig / skal**. Observe first, fix later.

---

## 3. CURRENT STATE

**Repo** `/Users/charlotte/claude-code-test` → GitHub `flowveya/veyaflow`. Working branch `f2b-async`, pushed to `coding-aug2026`.

**HEAD: `649f0ef`** — batch #8, the regime truth pass.

| File | sha256 | Notes |
|---|---|---|
| `index.html` | `a7f44f07…` | 41,054 lines · acorn clean · 2 blocks at html-lines 1176 and 39536 |
| `dpp/index.html` | `6e946a27…` | unchanged since batch #7 |
| `portal.html` | `b96423ac…` | unchanged since batch #5 |
| `brand/index.html` | `1e99d32c…` | unchanged since batch #5 |

**Eight batches shipped, all byte-verified before commit:**
`fbc351e` Portal Truth · `f972ad2` routing · `8fd92bc` save integrity · `63cf567` readiness · `9e944fb` buyer-surface truth · `7f82323` DPP truth · `a29c8cc` DPP export truth · `649f0ef` regime truth.

**Architecture — the single-implementation invariants. Guard all of these every batch.**

| Symbol | Contract |
|---|---|
| `resolveProductFramework(sku)` | THE product-type resolver. `unknown` is first-class, never a synonym for cosmetic. No brand-category inference. |
| `FRAMEWORK_VOCAB` | 1 definition. Every framework-specific WORD, keyed by concept: `operator`, `safetyDoc`, `notification`, `mark`. Holds `cosmetic`, `device`, `beauty_accessory` only. **NO article numbers** — see §6. |
| `_frameworkVocab` + `getOperatorRegime` / `getSafetyDocRegime` / `getNotificationRegime` | 1 definition each. `null` means assert nothing — caller omits the row. |
| `_operatorStatus` | 1 definition, 2 call sites. present / expired / absent. Reuses `_rpDateExpired`. |
| `_operatorValueFor` | Cosmetic returns the **caller's own** expression, so cosmetic output cannot move. |
| `_operatorRow` | 2nd argument is the **cosmetic label only**. |
| `_dppFwFields` | Framework-scoped JSON keys. Emits nothing it has no mandate for. |
| `_rpDateExpired` | THE date comparison. One implementation. |
| `_dppIsPublished` | 1 definition / 4 call sites — the publication gate. |
| `checkState` | 1 definition. The emitted blocker is authoritative. |
| `DPP_CANONICAL_ORIGIN` / `DPP_ORIGIN_LIVE` | 1 definition each. `@context` stays a literal and must NOT read the constant. |

**Persistence** — localStorage-first: `ns_brand`, `ns_skus`, `ns_crm`, `ns_dpp`, `ns_retail_submissions`, `ns_retail_checklist`, `ns_session_id`. `ns_skus` has **no server mirror**. Savers: `saveSkus()`, `saveBrandState()`, both via `persistCritical`. The brand normaliser is **`migrateBrandSchemaV3`** (not `normalizeBrandRP` — that name does not exist and was invented by this lane).

**Trap:** the DPP save path **prunes unknown keys**. Do not stash anything inside `ns_dpp` expecting it to survive a reload. The brand path does not prune.

---

## 4. WHAT CHANGES NOW THAT THE FOLDER IS LINKED

**Git replaces the baseline snapshots.** The old chat kept local copies (`b7f-index.html`, `b8s1b-index.html`) in a cloud container to diff against. Those are gone and are not needed: `git show 649f0ef:index.html` is a better baseline store than any snapshot.

**The upload loop disappears.** Previously every verification round meant Charlotte uploading a 2.7MB file. Now: read the file, `sha256sum`, run the acorn parse, diff against the git baseline, run the guard battery. **This was the single largest cost in the old lane** — four round trips for one batch.

**What must not change:** CC still applies and STOPS. This lane still names baselines. Still no commit without a green verify.

**The harness** is a small acorn script that extracts inline `<script>` blocks from the HTML and parses each. Rebuild it in the repo (`npm i acorn`) and commit it — it lived only in a container before and was lost.

---

## 5. BATCH #9 — provisional scope, in order

1. **#95 — the 38mm column overlap.** FIRST. The Brand Pack PDF renders `doc.text(label, margin, y)` and `doc.text(value, margin+38, y)`. `EU-established economic operator` overruns the fixed column and overprints the value: a buyer-facing pack shipped 2 Sep reads `EU-established economic opNot set`. **A regression this lane introduced and signed off.**
2. **Brand Pack PDF family** — **#56** the red `[FLAG_COPY: …]` internal QA annotation printing on the buyer-facing cover page (detection correct, placement catastrophic); **#96** markdown leaking into the PDF (a literal `#` heading page overlapping the running header, a page containing only `---`, a stray `---` on every content page); **#97** `Target market: Market` and `Annual revenue 2500000 SEK` unformatted.
3. **#93 — the integrity stamp field list.** `_ssCanon` omits `cpnp`, `safetyRef`, `brand.euResponsible.renewalDate`, the SKU-level `euResponsible` and `certifications`, so almost the whole Regulatory status section sits outside the fingerprint the footer advertises. **Sized 2 Sep and small:** changing `ceMarking` moved the ID `916a40d70242` → `64898e75186e` and setting it back returned it exactly, so the mechanism is sound and only the field list is wrong. **Time-limited:** fixing it changes every Document ID the app produces, which is free today and permanent once documents have been issued.
4. **The prompt sweep** — **#88** the pitch prompt instructing fabrication (`if EU RP is "Not set", say the appointment is in progress`, inside the same rule string that forbids upgrading an absent item to present) and **#76** eleven prompts hardcoding "April 2026" as now. Scope this as *the prompt sweep*, not scattered fixes: prompt strings are a surface the Truth Batch never swept, and a false claim there propagates into prose that reads as the brand's own voice.
5. **#91 + #92 — the divergence pair.** #91 the in-app DPP summary scavenging a `Regulatory reference` from whichever field is populated, now disagreeing with its own JSON export; #92 the spec sheet printing an expired RP mandate flat while the scorer raises an amber on the same value.
6. **#89, #90, #94** fold in where they touch the same surface. #90 (`daysUntil` clamped with `Math.max(0,…)`, so expired deadlines render `0d` and the calendar renders `Today`) belongs to the date sweep.

**Also specced and waiting: batch #8 Shipment 2 (#73)** — a real `beauty_accessory` branch in `scoreReadiness`, before `isUnknown`, totalling 24 points so the ceiling does not move; the device branch gaining the operator check; and **the unknown branch losing its `+6` and its green**, which overturns part of the earlier #50 ruling. Spec is in the zip.

---

## 6. OPEN QUESTIONS THAT ARE NOT CODE

Four for the RP, all raised by products Charlotte actually has:

1. **MDR Annex XVI** — does the LED mask fall in scope?
2. **REACH Annex XVII** — adhesive skin contact on the face tape.
3. **The substance discriminator wording** — "does this product deliver a substance intended to act on the skin?", must return `unknown` when unclear.
4. **Which instrument grounds the operator obligation** for a device versus a non-harmonised accessory — plus the authoritative Swedish and Danish terms, which can be quoted from the official texts.

**Until the RP answers question 4, no article numbers go on any buyer-facing surface.** Strategy ruled this on 1 Sep: write the role, not the paragraph. When the answer comes, citations enter as registry data carrying their own source. Do not add a `cite:null` placeholder or park article numbers in a comment "for later".

---

## 7. FAILURE MODES OF THIS LANE — observed, not hypothetical

**Byte verification cannot see layout.** #95 passed every guard: acorn clean, thirteen call sites byte-identical, all counts correct — over a document that overprints itself. Byte verification checks what a string *says*, never where it *lands*. Only a human looking at the output catches this class.

**Smoke is a verification layer, not a debt.** Of ten findings on 2 Sep, nine came from using the app or reading generated documents. One came from reading a spec.

**Scout windows drawn too narrow.** Both misses on 2 Sep had the same shape: this lane read a render line without following its gate; CC read a declaration without following its reads. The narrow-anchor pattern is about how we *look*, not only how we *fix*.

**Describing the app from the code rather than the screen.** Four instructions on 2 Sep did not survive contact with the UI — a console check with no origin named, a six-step smoke with no location, a phone-storage assumption, and a document called "Compliance Declaration" which is actually the **Spec Sheet** at *Menu → Buyer Documents → Spec sheet · data artifact → Generate, VeyaFlow-standard*. When writing a test step, name the menu path, not the function.

**The log has been diverged three times** by a lane editing a stale copy. The LOG VERSION line at the top and the ownership seam exist because of that. Take the other lane's blocks **wholesale**; never retype them. When condensing your own block, don't — this lane nearly sanded the detail off seven to-do items in a single merge.

---

## 8. WHERE THINGS ARE

- **`VeyaFlow_Daily_Log.docx`** — the living memory. Newest day on top. CODING owns the CODING to-do block and coding day entries; STRATEGY owns everything else. Update the LOG VERSION line on every merge.
- **`veyaflow-specs.zip`** — 25 spec documents, batches #2–#8. **Uncommitted.** Unzip into the repo and commit them; they existed only in a cloud container.
- **The pilot gate** — a published artifact listing seven gates with size, owner and evidence. Republish to the same URL as gates close.

**First actions in the new chat:** commit the specs; rebuild and commit the acorn harness; confirm `git status` is clean and HEAD is `649f0ef`.

---

## 9. THE THING WORTH SAYING PLAINLY

Eight batches shipped this week and **not one of the four hard pilot gates moved.** The truth work was necessary and it is the actual differentiator — but Gate 1 is a day of DNS work that blocks a brand from putting a passport on a carton, and it has been open the whole time.

Gates 2 and 7 share a property: both are free to fix now and permanent to leave, because a brand id and a document fingerprint are both identity schemes, and identity schemes can only be changed before anything has been issued under them.

**The fastest path is not faster batches.**
