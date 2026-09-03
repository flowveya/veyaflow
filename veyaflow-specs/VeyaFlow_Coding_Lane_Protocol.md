# VeyaFlow — HOW THE CODING LANE WORKS

**2 September 2026 · companion to `VeyaFlow_Coding_Lane_Handoff.md` · read both before starting a batch**

This document is written for two readers at once. **Charlotte** needs to know what she is being asked to do and why. **The coding lane** needs to know what to produce at each step. Where they differ, the step says who acts.

---

## PART 1 — WHO DOES WHAT

Three parties. The whole method depends on them staying separate.

| | Does | Never does |
|---|---|---|
| **The coding lane** (this chat) | Scouts the repo, writes specs, rules on evidence, gates commits, keeps the log | **Writes app code.** Runs commands (no shell here) |
| **CC** (Claude Code, on the laptop) | Applies every edit, then **STOPS**. Reports what it did | Commits. Pushes. Decides scope. Writes the verifier |
| **Charlotte** | Runs the commands, moves files between chats, runs the smoke test, rules on priorities | Needs to remember any of this — the protocol is written down so she doesn't have to |

**Why the separation exists:** the author of a change is the worst judge of whether it worked. CC has reported "done" on work that left a defect; the lane has written specs with errors in them. Each has caught the other. On 2 September the lane found a claim in CC's report that was wrong (`isAccessory` *is* read), and CC found a check in the lane's spec that could not fail (`normalizeBrandRP` does not exist). Neither would have surfaced with one party doing both.

**The one thing that must never collapse:** CC does not verify CC. If a batch is ever green only because CC said so, the method is gone.

---

## PART 2 — THE BATCH CYCLE, STEP BY STEP

### Step 1 — Scout · *lane*

The lane reads the repo directly and finds every place the defect lives. **Not the line that was reported — every rendering, every path, every caller.**

The rule exists because the narrow-anchor pattern has bitten seven times: a fix lands on the one line someone quoted and misses its sibling twenty lines below.

**Output:** a list of sites, with line numbers, and a count of what was deliberately left alone and why.

### Step 2 — Spec · *lane*

The lane writes a document containing, always:

- **A named baseline** — the sha256 of the file CC must start from, and the words *"this is a value I am naming."* CC may proceed on a baseline the lane named. **CC may never proceed on a sha it reported itself.**
- **The fix**, in enough detail that CC does not have to guess at scope
- **Out of scope** — named explicitly, so a fix outside the spec cannot slip in unverifiable
- **STOP. NO COMMIT.**
- **Report back** — the exact list of things CC must state
- **Verify** — the guard battery, each guard saying whether it counts rendered occurrences or raw matches
- **Smoke** — see Part 3

**Charlotte's part:** paste the whole document into CC. Never split it — a STOP only works if CC can see what comes after it.

### Step 3 — Apply · *CC*

CC edits `index.html` (one file at a time), then **stops** and reports. It does not commit.

**Charlotte's part:** paste CC's report back to the lane.

### Step 4 — Verify · *lane rules, Charlotte executes*

The lane has no shell. Charlotte runs one command and pastes the output:

```
cd ~/claude-code-test
./verify.sh
```

The lane reads the output and rules **green** or **stop**. It also reads the changed regions of the file directly to check things the battery cannot — that the fix does what the spec asked, that nothing outside the specced regions moved.

**What green does and does not mean.** Green means the strings, counts and structure are right. It does **not** mean the batch works. Byte verification checks what a string *says* and cannot see where it *lands* — on 2 September a completely green batch shipped a buyer-facing PDF that printed `EU-established economic opNot set`, because a longer label overran a fixed column. That is what Part 3 is for.

### Step 5 — Commit and push · *Charlotte, on the lane's word*

Only after green. The lane supplies the exact message.

```
git status            # must show index.html only
git add index.html
git commit -m "<message the lane gives you>"
git push origin f2b-async:coding-aug2026
```

Netlify deploys automatically.

**A free check worth doing every time:** the commit line says `N insertions, M deletions`. `N − M` should equal the change in total line count between the old and new file. A difference of more than one means the commit does not contain the bytes that were verified. **A difference of exactly one is not proof of anything** — a trailing-newline change moves it by one, and we lost a round to that byte already.

### Step 6 — Smoke · *lane writes, Charlotte runs*

**The batch is not finished until this is done.** See Part 3.

### Step 7 — Log · *lane*

At the end of the day, not during it.

**The coding lane's state lives in `CODING_STATUS.md` in the repo** — plain text, under git, readable and writable by a lane with no shell. It holds what the CODING to-do block held: shipped batches, smoke owed, the findings queue, standing rules, infrastructure.

**`VeyaFlow_Daily_Log.docx` remains the shared memory across all three lanes.** Strategy owns it and the day entries. Its CODING section becomes one line pointing at `CODING_STATUS.md`, not a copy — a duplicate would diverge, which is the failure this whole seam exists to prevent.

**Why the split:** the lane cannot read a `.docx` without a shell. A lane that cannot read its own memory cannot check whether something is already recorded — and on 2 September, batch #6's four unrun smoke steps were recovered precisely by *reading* the existing block before rewriting it.

**Rule, unchanged:** take the other lane's blocks **wholesale**. Never retype them, never condense them. The log has been diverged three times by a lane editing a stale copy, and once nearly damaged by this lane summarising its own to-do items into vaguer versions of themselves.

**Charlotte's part:** when Strategy needs the coding picture, paste `CODING_STATUS.md` — it's plain text. Day entries still go into the `.docx`; the lane writes them as markdown and you paste them in.

---

## PART 3 — THE SMOKE TEST

### What it is, and why it is not optional

A smoke test is Charlotte using the deployed app and reporting what she sees. It exists because **the byte harness is structurally blind to three things**:

1. **Layout** — whether text fits, overlaps, or is cut off
2. **Behaviour** — whether a button does what it says
3. **Whether the change was the right change** — a perfectly implemented wrong idea passes every guard

On 2 September, ten findings came out of one day. **Nine came from Charlotte looking at screens and generated documents. One came from reading a spec.** That ratio is the argument.

**Standing rule: batch N+1 does not ship until batch N is smoked**, or the debt is carried in the log with exactly what is unrun. Batch #6 has four steps unrun since 1 September because this was treated as a preference.

### How the lane writes smoke steps

Every step must contain four things. A step missing any of them will waste a round trip.

**1. Where — the menu path a person can follow, never a function name.**

> ✗ *"Generate the Compliance Declaration PDF"* — that phrase appears nowhere in the app
> ✓ *"Menu → Buyer Documents → the card headed 'Spec sheet · data artifact (per product)' → choose LED Face Mask → Generate, VeyaFlow-standard"*

**2. Which origin.** `veyaflow.netlify.app`, in the browser that holds the Cloud & Glow data. Never a local `file://` copy — that has its own separate storage and cannot reach the server functions, so every step "passes" against an empty catalogue. Every device and every browser has its own storage; a phone shows the NORDLYS demo seed, not Cloud & Glow.

**3. The exact expected string**, quoted.

> ✓ *"Regulatory status reads `EU-established economic operator` with the value `— not confirmed`, and there is no CPNP row at all"*

**4. What a failure looks like**, so Charlotte does not have to judge.

> ✓ *"If Cosmeservice GmbH appears anywhere on the mask's document, stop and report"*

### The step type that is easiest to skip and most valuable

**A step that passes only if nothing changed.** Batch #8's step 1 was "generate the Face Serum spec sheet — every label and value identical to before." That is not filler. It is the only thing standing between a targeted fix and a change that quietly moved something it had no business touching.

Write at least one of these in every smoke.

### How Charlotte runs it

1. Wait for Netlify to finish deploying, then **hard-refresh**.
2. Work through the steps **in order**. Report as you go rather than at the end — the lane can catch a problem at step 2 that makes steps 3–6 pointless.
3. **Send the evidence, not a summary.** A screenshot or the generated PDF is worth more than "looks right". Every one of 2 September's findings came from evidence, not from a verdict — the identical Document ID on two different documents, the overlapping label, the markdown page, the `0d` on a deadline 33 days past.
4. **Observe first, fix later.** If something looks wrong, report it and carry on. Do not stop to investigate and do not change data to make a step pass unless the step asks you to.
5. If a step cannot be run — the button isn't where the lane said, the data isn't there — **say so.** That is a finding about the spec, and four of them happened on 2 September.

### Verdicts

Each test gets one word, recorded in the log:

- **verklig** — real. It does what it claims.
- **buggig** — the logic is sound, but something reading or rendering it is broken. *(Test 3's verdict: the checklist itself was correct; every defect was in what consumed it.)*
- **skal** — a shell. It looks like a working feature and computes nothing.

### What happens to what the smoke finds

Findings get a number and go in the log. They do **not** get folded into the batch being smoked.

On 2 September the batch #8 addendum was explicitly closed to new work, and twenty minutes later a finding arrived on a surface already in scope. It was held. **Boundaries that bend on the first test are not boundaries** — and the cost of holding one line of debt is far lower than the cost of a lane that treats its own rules as suggestions.

The exception: if the finding means the batch is **actively harmful** rather than incomplete, reopen it. Decide that on evidence, not preference. When #89 arrived, the ruling was "reopen only if the mask carries a CPNP" — one console command settled it, and the answer was no.

---

## PART 4 — CHARLOTTE'S CHEAT SHEET

| Moment | What you do |
|---|---|
| Lane sends a spec | Paste **the whole thing** into CC. Never split it. |
| CC reports back | Paste the whole report to the lane. |
| Lane says verify | `cd ~/claude-code-test` then `./verify.sh` — paste the output. |
| Lane says green | Run the four git commands the lane gives you. Check `git status` shows one file. |
| Lane sends a smoke | Hard-refresh `veyaflow.netlify.app`, work in order, send screenshots and PDFs as you go. |
| Something looks wrong | Say so and carry on. Don't fix it, don't investigate it. |
| End of day | Ask for the log. Send the updated copy to Strategy. |

**Two things that are always true:**

- **No secrets in any chat.** No tokens, API keys, the Supabase service-role key, or database URLs with credentials.
- **Database changes are yours alone** — Supabase SQL Editor, then append to `db/CHANGELOG.sql`. Never from code, never from CC.

**Console commands:** type them by hand rather than pasting. Pasting has mangled commands more than once — a stray character prefixed a function name and produced a confusing error. If a command is longer than one line, ask for it to be shortened.

---

## PART 5 — WHERE IT STOPS

Four hard stops. Any one of them means the lane stops and reports rather than continuing.

**Two are enforced by the harness. Two are the lane reading the diff.** That distinction is stated because a documented control nobody implemented is worse than no control — people rely on it.

| | Stop | Enforced by |
|---|---|---|
| 1 | **Baseline mismatch** — CC's starting file is not the sha the lane named. A sha CC named itself is never sufficient. | Harness (digest compare) |
| 2 | **A guard whose subject is not found** — reports `NOT FOUND` and fails, never a pass. A check that cannot fail is not a check. | Harness |
| 3 | **Anything outside the specced regions changed** — even an improvement. A fix made outside the spec cannot be verified against it. | **Lane judgement.** Reads the diff hunks against the spec's named regions. Mechanisable via `git diff -U0` hunk ranges — not yet built. |
| 4 | **A cosmetic-path string moved when the spec said it must not.** That guarantee is the verification signal; if it goes, the signal goes with it. | **Lane judgement.** Wants a fingerprint over the cosmetic output path. Not yet built, and the more valuable of the two. |

Stops 3 and 4 hold today because a human reads the diff. They should be mechanised, in that order, **after** the harness has run green once. No unrun code on an unrun harness.

---

## THE ONE-LINE VERSION

**CC writes it. The lane checks it at the bytes. Charlotte checks it on the screen.** Three parties, three kinds of error caught, and no batch ships until all three have looked.
