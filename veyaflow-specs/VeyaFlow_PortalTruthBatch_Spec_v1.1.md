# VeyaFlow — Portal Truth Batch (fix batch #1 of the test round) — for Claude Code
**v1.1 · 27 August 2026** · supersedes v1.0 of 26 Aug
From Test 1's findings ledger (12 findings, one flow) · touches `portal.html` + `index.html`

> **v1.1 changes (read these first — three items were wrong in v1.0):**
> - **1-F** root cause found and proven — the fix is the opposite of what v1.0 implied. See 1-F.
> - **1-H** was partly unachievable as written (there is no `console.error` in the file). Rescoped. See 1-H.
> - **1-B** is worse than v1.0 described — a `||` fallback fabricates a "Verified" tier. Promoted to critical. See 1-B.
>
> **v1.0 was never applied.** Verified by byte inspection 27 Aug: both files are the `0ca4485` tree, `git status --porcelain` shows no modification to either. Work from the current files on disk, not from any earlier attempt.

## BASELINE FINGERPRINTS (verified 27 Aug, pre-batch)

| File | sha256 | lines |
|---|---|---|
| `index.html` | `f48a1a2f46caf26f0e6dd5862163a222fdd8586c8467131c92eecfd65c2d2bad` | 40,226 |
| `portal.html` | `93562c7b6817407413a5aaab3b2aa2b42f45c3ada2f7cf988dbfd4dc764bfb73` | 1,243 |

If your files don't match these shas, stop and say so before editing.

Line numbers below are from these exact files and were confirmed by direct read — but **re-scout each anchor anyway** before editing.

## WORKING MODEL

Apply → **STOP, no commit.** Coding chat byte-verifies. On green: ONE commit + push to `coding-aug2026` (= auto-deploy). Then Charlotte's visual smoke.

**Standing gate this batch lifts:** no real retailer account may be created until this ships (the fabricated banner is the reason). Reviewed after deploy + smoke.

**House rules that govern the fixes:**
- omit-beats-caveat — a label that can't be earned is omitted, not softened
- provenance or nothing
- registry/product-type DATA drives framework logic, never hardcoded cosmetics assumptions

---

# PART 1 — portal.html (buyer-facing truth fixes)

## 1-A — REMOVE the fabricated pre-qualification banner (CRITICAL)

**Location: L1064**, in `renderDetail()`, the last line before `host.innerHTML = html`:

```js
html += '<div class="veya-footer-note">This submission was pre-qualified by VeyaFlow. All compliance checks (CPNP, claims audit, EU Responsible Person, EUDR where applicable) were completed by the brand before submission.</div>';
```

This asserts completed checks regardless of reality and is contradicted on-screen by the ✗✗✗ table directly above it. **DELETE the line.**

Replacement, only if cheap: a provenance-true line derived from actual data, e.g. *"Submitted via VeyaFlow — compliance status shown per product below."* If any per-check claim can't be computed from the payload, it is not rendered. No conditional wording that still implies completed checks.

## 1-B — Fabricated "Verified" tier fallback (CRITICAL — upgraded in v1.1)

Two separate sites, only one of which is correctly gated:

**L946** (`renderSubmissionCard`) — **this is the bug:**
```js
html += '<div class="sub-score-label">out of 100 · ' + esc(s.verifiedTier||'Verified') + ' tier</div>';
```
The `||'Verified'` fallback manufactures an unearned trust claim whenever `verifiedTier` is absent. Same fabrication class as 1-A, on the same buyer surface.

**Fix:** render the tier clause **only** when `s.verified === true` **and** `s.verifiedTier` is a non-empty string. Otherwise the label reads `out of 100` and stops. No fallback string, no "unverified" caveat text — absence.

**L997–999** (`renderDetail` badge) is already correctly gated on `s.verified`; leave its guard intact, but drop the `esc(s.verifiedTier||'')` trailing separator if the tier is empty so it doesn't render a dangling `· `.

## 1-C — Readiness null-handling

Three sites render `0` for an uncomputed score:
- **L943** — `(s.readinessScore||0)` in the card's score box
- **L1012** — `(s.readinessScore||0)` in the detail hero, at 3rem
- **L1016–1022** — the four-dimension breakdown, each `dims[d] || 0`

**Fix:** when `readinessScore` is null/undefined, render `—` or `Not scored` in **muted** colour (not `scoreColor()`, which returns red for low values) and **hide the four-dimension breakdown entirely**. Never display `0/100` for an uncomputed score. Note `scoreColor(null)` currently returns `var(--red)` — that's why null reads as a failing score.

A real `0` (computed, genuinely zero) may still render as 0. Distinguish `null`/`undefined` from `0` — use `== null`, not falsy checks.

*(Populating the score is Part 2-B.)*

## 1-D — EU RP indicator must honour brand-level RP

Currently **L1042** reads per-SKU `sk.euRp` only, so a brand with an RP on file shows ✗ on every row.

**Fix:** when the payload carries brand-level RP (Part 2-C puts it there as `brandPack.euResponsible = {name, onFile:true}`), the EU RP cell shows ✓ with the RP name available. Per-SKU absence alone must not produce a buyer-visible ✗ when the brand has an RP on file.

**1-D and 2-C must ship together.** 1-D reads a field 2-C creates; applying one without the other leaves the same wrong compliance fact on screen with more code behind it.

## 1-E — Product-type-correct compliance columns

**L1034** hardcodes the header row:
```js
html += '<thead><tr><th>Product</th><th>EAN</th><th>CPNP</th><th>Claims</th><th>EU RP</th><th>RSP</th></tr></thead>';
```
CPNP is a cosmetics notification — it must not be applied to a device.

**Fix:** a small mapping object at the top of the render, keyed by `sku.productType` (the snapshot carries SKU fields):
- `device` → CE marking / (MDR-LVD status if present) / EU RP / RSP — **no CPNP column**
- `cosmetic_*` → CPNP / Claims / EU RP / RSP as today

Data-driven column set, not a second hardcoded list. If a submission mixes product types, decide and state your approach in the report (per-row cell suppression vs. split tables) — do not silently pick one.

## 1-F — Ampersand double-escape (CORRECTED in v1.1)

**Root cause proven.** `renderDetail` **L982** passes `esc(s.category)` into `updateTopbar`, which assigns it via **`textContent`** at **L633**. `esc()` converts `&` → `&amp;`, then `textContent` renders those five characters literally. That's the "Skincare &amp; Beauty" in the header.

The card path at **L941** is correct because it goes through `innerHTML`.

**Fix: remove `esc()` from the arguments passed to `updateTopbar`** (L982, and the sibling `updateTopbar` calls at L976 and L625 if they pass escaped values). `updateTopbar` uses `textContent`, which is already safe — escaping before it is the defect.

**Do NOT modify `esc()` itself.** Every `innerHTML` path in the file depends on it. v1.0's "double-escape or missing decode" wording could send you the wrong way — there is no missing decode.

Verify after the fix that the same string renders correctly in **both** the header and the card.

## 1-G — "-1 days ago"

**L579–583**, `daysAgo()`:
```js
return Math.floor((Date.now() - d.getTime()) / 86400000);
```
Unclamped, so a same-day or timezone-skewed timestamp goes negative. **L935** then renders `daysSince + ' day...ago'`.

**Fix:** clamp/floor the day diff so same-day or skewed timestamps render `Today`, never negative. Use UTC consistently on both sides of the subtraction.

## 1-H — Session expiry UX (RESCOPED in v1.1)

**v1.0 asked for "no console.error spam." There is no `console.error` in this file** — L731 is `console.warn`. The console noise is the browser's own native log of the 401 HTTP response, which JavaScript cannot suppress. **Do not attempt to silence it.**

The real defect: `restoreSession()`'s catch at **L730–737** clears state and returns `false`, landing the user on a bare login screen with **no message at all**. `handleAuthExpired()` has the correct friendly text at **L670** but is never called on this path.

**Fix (one line):** in the `restoreSession` catch, when `e.status === 401`, call
`showLoginError('Your session expired. Please sign in again.')`
before returning false. Leave the `console.warn` — it's useful and it isn't the noise Charlotte saw.

Token refresh remains out of scope — note it for the multi-user work.

## 1-I — Password field in a `<form>`

**L412–420**: the login inputs and submit button are bare, no `<form>` element (`<form` count = 0 in the file).

**Fix:** wrap them in a proper `<form>` with an `onsubmit` that calls `handleLogin()` and returns false (or `preventDefault()`), preserving the existing JS submit path, so browser autofill and password managers behave. The existing Enter-key handlers at L1225–1236 become redundant — remove them or keep them harmless, your call, but state which in the report.

---

# PART 2 — index.html (brand-side sync + score fixes)

Anchors confirmed against the `f48a1a2f…` file. Re-scout anyway.

## 2-A — Status-sync ordering

**L39060**, inside the sync handler:
```js
(res.changes||[]).forEach(function(change){
```
Raw, unsorted. Multiple changes arriving in one poll are applied in server order, so the OLDEST status wins the final write. The feed is right; the tracker row is wrong.

**Fix:** before applying, sort `res.changes` **ascending by `changedAt`**, or reduce to the latest change per `submissionId` and apply only that. Alerts remain as-is (the feed is correct today).

**Mandatory before editing:** scout the proxy's `portal.status.sync` handler and **state in your report which field it actually emits and in what order.** A `.sort()` on a field the payload doesn't carry is a silent no-op that looks fixed and isn't. If the proxy already returns ascending, find the real cause before editing — do not fix blind.

## 2-B — Real readiness score into submissions

**L38991–38997:**
```js
function readLatestReadinessScore(){
  if(typeof savedReports!=='undefined' && savedReports.length){
    var r = savedReports[0] || {};
    return r.readiness || r.score || null;
  }
  return null;
}
```
Reads `savedReports[0]` (stale or absent) → null → portal shows 0.

**Fix:** read the SAME live readiness value Brand Home displays. Scout the readiness computation the home hero uses and call it. Fall back to `savedReports`, then null. **Null stays null** — Part 1-C renders it honestly. Retain the `savedReports` fallback.

Note the same stale source feeds `pack.readinessDimensions` at **L38950–38958** — fix both or state why not.

## 2-C — Brand-level RP into the submission payload

**L38937–38948**, `buildPortalBrandPack(sub)` — the pack object currently ends at `articleTemplate: {}`.

**Fix:** add `euResponsible: {name, onFile:true}` sourced from `brand.euResponsible` when present. **Name only** — no address, no email. The buyer needs "RP on file: Cosmeservice GmbH", not contact details.

Enables Part 1-D. Ship together.

## 2-D — Rejection reason surfaced brand-side

`rejectionNote` = 0 and `reasonDetail` = 0 occurrences in index.html — nothing exists yet.

**Fix:** scout the sync payload. If `changes[]` carries the status-log `note` (the proxy writes `reasonDetail` there — confirmed present in portal.html's `portal.rejection.create` call at L1197–1202), store it on the local submission as `rejectionNote` and render it in the tracker's submission detail when status = rejected: *"Rejected — [category]: [detail]"* if the category is derivable, else the note verbatim.

If the sync payload lacks the note, **extend the proxy's sync handler** to include it (`netlify/functions/supabase-proxy.js` is in the repo — same commit, note it in the report).

## 2-E — Nav badge echo (approved enhancement)

The unseen portal-alert count already badges Brand Home. Add the same count to the Submission Tracker nav item; mark alerts seen when `retail-tracker` renders. Scout how Brand Home clears its badge and mirror it.

## 2-F — Alert "View →" deep-links

View should open `retail-tracker` **and** expand/scroll to the submission the alert refers to (alerts carry `submissionId` — confirmed at L39073). If expansion is nontrivial, minimum: highlight the row.

---

# OUT OF THIS BATCH (logged, do not touch)

- Token refresh for portal sessions (multi-user work)
- Listing Checklist manual-tick vs data reconciliation (finding #12 — Test 3's module)
- Dead "+ NEW SUBMISSION" button (needs repro detail first; report if you spot the cause while in the file, fix only if one-line)
- Submission page UX/pedagogy redesign (Design lane, v2 brief)
- Portal Submission v2 features (Sigrid brief — Strategy)
- Stray untracked root-level function files (`anthropic-proxy.js`, `get-brand-pack.js`, `share-brand-pack.js`, `get-dpp.js`, `share-dpp.js`) — cleanup queued separately, leave them alone
- `validPages` stale comment at index.html L33552 ("pitch un-parked") — behaviour is correct, comment is wrong; queued with the `#pitch` redirect item

---

# STOP. NO COMMIT.

## REPORT BACK

State explicitly, per item, what you changed and at which line. Plus:

1. The **proxy's `portal.status.sync` field and ordering** (2-A) — this is required, not optional.
2. Whether you extended `supabase-proxy.js` (2-D) — and if so, what.
3. Your decision on mixed-product-type submissions (1-E).
4. Your decision on the redundant Enter-key handlers (1-I).
5. `sha256sum index.html portal.html` after your edits.

Do not report an item as done if you did not write the bytes for it.

---

# VERIFY (byte — coding chat, not you)

- acorn clean on index.html (expect 2 inline blocks); portal.html parses (expect 1 block)
- 1-A: `pre-qualified by VeyaFlow` = 0 · `were completed by the brand` = 0 (whole repo)
- 1-B: no `||'Verified'` fallback; tier clause guarded on `verified===true` (quote the guard)
- 1-C: no path renders 0 for null (quote the null branch); breakdown hidden when unscored
- 1-D + 2-C: both present, or both absent — never one
- 1-E: column mapping object present; device branch has no CPNP
- 1-F: `esc()` removed from `updateTopbar` args; `esc()` itself unchanged
- 1-H: `showLoginError` called from the restore catch; `console.warn` retained
- 1-I: `<form` ≥ 1
- 2-A: sort/reduce before apply (quote); proxy order stated
- 2-B: live readiness source quoted; savedReports fallback retained
- 2-D: `rejectionNote` stored + rendered; proxy extension noted if made
- **No-regression guards** (index.html, baseline values confirmed 27 Aug):
  `['Margin','50%']` **0** · `Beauty Days participation` **6** · `launchSupport` **0** ·
  omit-strip IIFE `_bpAllowed` **1** (L16635) · `renderCrmEditor` **3** · `ns_crm` setItem **1** ·
  validPages pitch-free · `articleNotification` **1** · GLN `7312440012653` **2**

# ON GREEN

ONE commit:
`Portal Truth Batch: remove fabricated claims, honest null-states, correct sync ordering, framework-correct columns (test round fix batch #1)`
→ push `f2b-async:coding-aug2026` → auto-deploy.

# SMOKE (Charlotte, ~10 min, after deploy)

1. **Portal, fresh login → open the test submission:** no pre-qualification banner; no "Verified tier" on the card; readiness shows `—`/`Not scored` with no breakdown; products table shows device columns (CE, no CPNP); EU RP ✓ Cosmeservice; header ampersand renders as `&`; submitted-time not negative.
2. **Brand side:** create ONE new test submission to Lyko → in portal set **Under review**, then **Rejected** (with reason) in quick succession → brand side within ~1 min: row shows **REJECTED** (ordering fix), reason text visible in detail, Submission Tracker nav badge shows count, View → lands on the submission.
3. **Console:** browser-native 401 logging on an expired session is expected and not a defect. What to check is the friendly "Session expired" message appearing on the login screen — verify when a session expires naturally.

**Note:** 1-B can only be smoked negatively — nothing in the current data has `verified === true`, so the label's absence is the expected result but is not proof the guard works. The guard is verified by reading it. Recorded as observed-negative-only.
