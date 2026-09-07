# VeyaFlow — #128: the tracked copy of supabase-proxy.js is a three-month-old fossil

**7 September 2026 · coding lane → CC**

Found by the certification scout. **It ships before the migration touches the live proxy**,
because a delete and an edit to two files of the same name in one diff is the ambiguity this
finding is about.

---

## NAMED BASELINES

```
index.html                           9eb3da6917ba6ec516a846006f27d5579418edb730636a2d1fc5b9589c9c71e7
dpp/index.html                       6e946a279f2d43827bfba12a3994ba0400cc4983b658a065dca4760bde21357d
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     1e99d32c74b373a46bb02103ed9847ba81749d841c9dc942d012968dd487f775
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
```

Branch `f2b-async` at `bb52efa`. **Confirm all five. None of them changes in this shipment** —
the file being removed is not a tracked surface.

---

## THE FINDING

Two files named `supabase-proxy.js`:

| | path | lines | dated | tracked |
|---|---|---|---|---|
| **live** | `netlify/functions/supabase-proxy.js` | 737 | 28 Aug | yes |
| **fossil** | `supabase-proxy.js` (repo root) | 730 | **8 June** | **yes** |

`netlify.toml` sets `functions = "netlify/functions"`, so the root copy has **never been
deployed as a function**. It diverges by 9 lines, and the divergence is **batch #4's work
missing**: it still carries `readinessDimensions`, removed as finding **#38**, and lacks
`skuReadiness`, the `euResponsible` passthrough, and the legacy-`readinessScore` comment.

**The stale copy is the tracked one.** Its `share-dpp.js` twin — byte-identical to its live
counterpart — is gitignored under #111. So the repo tracks the wrong file of one pair and
ignores the right-and-identical file of the other.

**And `publish = "."` makes the root copy fetchable as a static file** (#99), which is why
`netlify.toml` already carries an explicit 404 rule for `/supabase-proxy.js`. A three-month-old
copy of our server logic sits at a guessable URL, protected only by an enumerated rule — the
control form we already know fails, because it depends on remembering.

---

## WHY THIS IS A FINDING AND NOT HOUSEKEEPING

**Ambiguity about which file executes is not acceptable in a codebase whose selling point is
knowing what is true.** Nothing imports the root copy today. But #114a was settled by reading
`loop.upsert`'s semantics out of the proxy, and had the lane opened the root copy instead it
would have read three-month-old logic and concluded confidently from it. **The next person
who greps for a proxy behaviour has a coin-flip chance of reading the fossil.**

---

## IMPLEMENT

**Delete the root `supabase-proxy.js`.**

- `git rm supabase-proxy.js` — it is tracked, so this is a tracked deletion, not an untracked
  cleanup.
- **Do not touch `netlify/functions/supabase-proxy.js`.** Its digest must be unchanged
  afterwards.
- **Do not touch the root `share-dpp.js`** — gitignored, identical, and therefore local
  clutter rather than a divergence. It is a separate decision and not this one.

---

## REPORT, DO NOT IMPLEMENT

1. **The `netlify.toml` 404 rule for `/supabase-proxy.js`.** Once the file is gone the rule
   protects nothing. State whether removing it is safe or whether it should stay as
   defence-in-depth against the file returning. **Do not change `netlify.toml`** — it is not a
   tracked surface and it carries #99's mitigation.
2. **Any other root-level file with a `netlify/functions/` twin.** `share-dpp.js` is one;
   report whether there are more, and whether any pair has diverged. **The count is the
   finding** — one diverged pair suggests a copy-then-forget habit rather than an accident.
3. **Whether `verify.sh` should track the deletion.** A file that must not exist is a
   contract, and this lane has a NOT-FOUND idiom for exactly that (`normalizeBrandRP —
   absent, as required`). State whether adding `supabase-proxy.js at repo root — must not
   exist` is worth a gate, or whether that is a check that cannot fail once the file is gone.

---

## OUT OF SCOPE

- The certification migration. This clears its path; it is not part of it.
- #99's structural fix (the app into its own directory). Still open, still queued.
- Everything else in the ledger.

---

## STOP. NO COMMIT.

One deletion. Three reports.

---

## REPORT BACK

1. sha256 of all five tracked surfaces before and after — **all five identical**.
2. Confirmation the deleted file is the root one, with its pre-deletion digest recorded for
   the log (`7af2e74f…`).
3. The three reports.
4. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; **all five surfaces UNCHANGED**; `0 of the 5 tracked surfaces modified`. A
deletion outside the tracked set should move nothing — and if it does, that is a finding of
its own.

---

## SMOKE

**Step 1.** `veyaflow.netlify.app/supabase-proxy.js` returns 404 — as it did before, since
the rule already covered it. This confirms the deletion changed nothing publicly.

**Step 2 — the step that proves the live function is untouched.** Any portal-synced action
still works: set a submission's status from the portal and confirm it lands in the tracker
within a poll cycle.
*Failure: any proxy error. The live function must not have moved.*
