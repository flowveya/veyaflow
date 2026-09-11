# VeyaFlow — #176: .gitignore ignores five production endpoints

**11 September 2026 · coding lane → CC**

**Five of the seven live Netlify functions are gitignored.** They survive only because git does
not apply ignore rules to files that are already tracked. **Delete any one and `git add .`
silently skips it; the next deploy has no such endpoint and nothing reports an error.**

**Found by CC during #174, and demonstrated live** — not inferred.

---

## NAMED BASELINES — ELEVEN SURFACES, ALL UNCHANGED AT BOTH ENDS

```
index.html                                       4b268e1774a4a5f90f218bb2df28b71cf6c96159ff7c487d804849345787d3b4
dpp/index.html                                   e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                                      beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                                 fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js              78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js                   500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
netlify/functions/anthropic-proxy.js             7cf20b3fac29ae780403416729445ca1c5bdc65b16e11866cf0768fac273b8e5
netlify/functions/anthropic-proxy-background.js  1f6f47ab9ce46f91c7fe1fab9690272c544467f01efb30e8e330030edb96e0be
netlify/functions/get-brand-pack.js              fe285fe913766f6ac10da7e4ebd98566a8e0cdd40d35243908bba14369665382
netlify/functions/get-dpp.js                     3c050904cf530d2c2a1a9e5716b17736284d1891c2bf991ac88ef81e2b9fa395
netlify/functions/share-brand-pack.js            3791bbecc745fe5d5a31a6dd368e19d3105e272c027b6eeedbcd96f6c887cecb
```

Branch `f2b-async` at `e1e23c6`. **Only `.gitignore` changes. Expected at both ends:
`0 of the 11 tracked surfaces modified`, GREEN, exit 0.**

---

## THE DEFECT

`.gitignore` lines 32–39, added by **#111 on 4 Sep** for *"local-only working files"*:

```
_untracked_backup/
anthropic-proxy.js
get-brand-pack.js
get-dpp.js
share-brand-pack.js
share-dpp.js
VeyaFlow_Nav_5Group_Reskin_v1.html
brandhome_pass2_sketch.html
```

**No leading slash, so every one of these matches AT ANY DEPTH — including
`netlify/functions/`.**

**The file states the principle itself**, at line 20, for the daily-log block above:

> *No leading slash on these patterns, so they match at any depth — moving the files to another
> folder does not un-ignore them.*

**Deliberate there. Reused without noticing here.** And #111's own comment says:

> *They are already absent from the remote, so this changes nothing about what deploys.*

**True of the root copies. False of `netlify/functions/`.**

### Demonstrated live in #174, in a pristine copy

`get-dpp.js` made untracked via `git rm --cached`, file left on disk:

```
on disk: yes | tracked: 0 | ignored: yes
PASS      | netlify/functions/get-dpp.js  3c050904…  matches named baseline
FAIL      | contracted file on disk but untracked and gitignored — will not deploy: …/get-dpp.js
```

**The digest gate PASSES** — the bytes on disk are exactly the named ones, and it cannot know git
will no longer ship them. **Only #174's directory gate refuses it.** Before this morning, that
state read GREEN.

**`share-dpp.js` is one of the six ORIGINALLY tracked surfaces.** This has been true of a
baselined file for as long as the baseline has existed.

**Exposure today is zero** — nothing has deleted them. **The failure mode is silent and total,
and the recovery path is the one that fails.**

---

## IMPLEMENT — A LEADING SLASH PER PATTERN

```
/anthropic-proxy.js
/get-brand-pack.js
/get-dpp.js
/share-brand-pack.js
/share-dpp.js
```

**That is what #111 meant**: root-level working copies stay ignored, `netlify/functions/` stops
being caught. **Zero behaviour change today** — tracked files appear in `git status` regardless
of ignore rules, so nothing about the current workflow moves. The change is purely protective.

**Do not use `!netlify/functions/…` negations.** A negation is a second rule that must stay in
agreement with the first; a leading slash makes the pattern say what it means. Same reasoning as
refusing an alias in #135's Part A and #167.

### Report first — this decides whether the fix is right

**Do the root-level copies actually exist?** `netlify.toml:171` calls `/supabase-proxy.js` a
*"Stray root-level function copy (tracked, unlike the other five)"*, which implies five
untracked root copies exist. **Establish it, do not infer it.**

- **If they exist** — leading slashes are correct, as specced.
- **If they do not** — the five patterns protect nothing and the honest fix is to **delete
  them**, not to scope them. **Report which, and stop for a ruling.** A rule that ignores
  nothing is an artefact asserting a control that isn't there, which is this week's named class.

---

## THE CENSUS — EVERY PATTERN IN THE FILE

**Classify all eight #111 entries plus lines 38–39, and state for each: does it match anything
outside the repo root today, and could it?**

`VeyaFlow_Nav_5Group_Reskin_v1.html` and `brandhome_pass2_sketch.html` have the same shape. Lower
stakes — no deploy consequence — **but the same defect, and the count is the finding.**

**Lines 22–23 (`VeyaFlow_Daily_Log.docx` / `.txt`) are DELIBERATELY unanchored** and documented as
such at line 20. **They stay. Do not touch them.** Report them as correct-by-intent so the
distinction is recorded rather than rediscovered.

---

## OUT OF SCOPE

- **`netlify.toml`.** Untouched.
- **#177 (raised below).** Separate.
- **Deleting or moving any function.** This shipment changes one file and it is `.gitignore`.
- #167, #165, #172, #162.

---

## #177 RAISED — TWO FILES DECIDE WHAT DEPLOYS AND NEITHER IS WATCHED

**`.gitignore` decides what git will ship. `netlify.toml` decides what Netlify serves, which
functions exist, their timeouts, and 24 redirect rules standing between internal documents and
the public web.** Neither has a named baseline. A change to either passes GREEN.

**This is #174's exact argument one level up** — and #174's own finding depended on reading
`.gitignore`, a file the battery does not watch.

**Reported, not specced.** It is a third harness shipment in one day and that deserves a decision
rather than momentum. **Report what it would take: the two digests, and whether either file is
rewritten by any tool.**

---

## STOP. NO COMMIT.

Five slashes, one existence check, one census.

---

## REPORT BACK

1. **All eleven digests before and after — ALL UNCHANGED.** `.gitignore` is the only file that
   moves.
2. **Do the five root-level copies exist?** Measured, per file.
3. **The proof, both directions**, run before and after:
   ```
   git check-ignore -v netlify/functions/get-dpp.js
   git check-ignore -v get-dpp.js
   ```
   **Before:** the first names `.gitignore:35`. **After:** the first returns nothing, exit 1,
   **and the second still names the rule** — the root copy must stay ignored. **Both halves, or
   the fix is half a fix.**
4. **The decisive demonstration:** in a pristine copy, delete `netlify/functions/get-dpp.js`,
   re-create it from the known bytes, run `git add .`, and show `git status` — **STAGED after the
   fix, SILENTLY SKIPPED before it.** That is the failure this shipment exists to prevent, and it
   must be seen both ways.
5. The census of all ten patterns.
6. #177's two digests and whether either file is tool-written.
7. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

**GREEN, `0 of the 11 tracked surfaces modified`, 0 not found, exit 0 — at both ends.**
`.gitignore` is not a tracked surface, so no digest moves. **If any digest moves, stop.**

---

## SMOKE

**No browser smoke. This ships no behaviour.**

Report 4 is the smoke: **the same delete-and-recreate sequence must be silently skipped before
the change and staged after it.** A protective change that cannot be shown protecting is the
shape this lane has now declined nine times — and #174 proved this morning that the shape reaches
the instruments too.
