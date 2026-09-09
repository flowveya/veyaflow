# VeyaFlow — #131: near-copies are identical by luck; make the count a contract

**9 September 2026 · coding lane → CC**

**Harness only. No tracked surface moves.**

Built now rather than later because **migrate needs it**: the `csrdAutoFill` trio must move as
one unit, and this is the mechanism that makes that a **cannot** rather than a **must-not**.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           6d4d09b707228e89f99b68ae2b7b2ed3fe7374ebe98283e329ff4295afa245f7
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `0d75062`. **Confirm all six. ALL SIX MUST BE UNCHANGED AFTERWARDS** —
`0 of the 6 tracked surfaces modified`. Only `verify.js` moves.

---

## THE FINDING, TWICE IN TWO SHIPMENTS

**3b — six export locales.** All six are `['<label>', normalizeCertifications(sku.certifications).join('; ')]`,
differing only in the label.

**3c — `calcBrandESGScore` and `checkMandatoryESG`.** Byte-identical lines, confirmed by string
comparison rather than by eye.

**In both cases one `sed` with an exact count replaced them all — which was only possible
because nobody had hand-edited one.** That is not a property of the code; it is a fact about
what has not happened yet. #128 is what it looks like after it stops being true: six root
copies, five untracked and identical, one tracked and rotted three months.

**Nothing in the harness would notice.** A near-copy group is invisible to every gate we have:
single-definition invariants see one name, call-site contracts see one function, the copy gate
sees only the certification reader's banner.

---

## IMPLEMENT — A COUNT CONTRACT, NOT A SIMILARITY DETECTOR

Add a `NEAR_COPY_GROUPS` contract to `verify.js`: named groups, each an expression pattern
plus an **expected exact count**. A count that differs — up or down — **FAILS** until someone
updates the contract deliberately.

Same discipline as `FIXED_CALLSITES`: **a hardcoded number that must be changed on purpose.**
A floating count is not a contract.

**Three groups to start, and you pin the exact patterns — do not take the lane's wording:**

| group | expected | why it exists |
|---|---|---|
| export locale certification rows | **6** | 3b; differ only by label |
| ESG merged-cert expression | **2** | 3c; `calcBrandESGScore` / `checkMandatoryESG`, byte-identical |
| `csrdAutoFill` certification spread | **3** | 34759/34760/34761 — **must move as one unit in migrate** |

**Anchor by expression shape, not by line number.** Line numbers have moved in every shipment
this week and will move again in migrate.

**Report the count you measure for each before asserting it.** If any group's real count is not
what this spec says, **the spec is wrong and the measurement wins** — say so rather than
adjusting the code to match.

---

## WHAT THIS GATE MUST NOT BECOME

**Not a similarity detector.** Do not scan for "lines that look alike". That would fire on
unrelated coincidence, get muted, and become the check nobody reads — the failure mode worse
than no check.

**Not a ban on duplication.** Six export locales may be the right design. The gate does not
say *don't duplicate*; it says **if the count changes, someone decided something and must say
so.**

**It must fail.** Demonstrate it, as you did for the copy gate: change one member of a group
in a scratch copy, show the FAIL, revert. **A gate never seen to fail is a gate nobody knows
works** — this lane has written two that could not.

---

## REPORT, DO NOT IMPLEMENT

1. **Any other near-copy group in the file** worth a contract. **The count is the finding** —
   if there are twenty, the pattern is structural and deserves a different answer than three
   hardcoded numbers.
2. **Whether the trio's group survives migrate.** Those three lines *will* change together in
   the next shipment. State what the contract should become — a count of three with a
   different pattern, or a single expression — so migrate is not blocked by a gate that only
   knows the old shape.
3. **Whether this belongs in `verify.js` or `verify.sh`.** The patterns are textual rather than
   AST-shaped, and `verify.js` is the AST battery. Say which, and why.

---

## OUT OF SCOPE

- **The epitaph on 33362 / 33514.** **Superseded by Strategy's ruling 5**: after migrate the
  second accessor is the *only* path to `expiryDate`, so a direct read becomes impossible
  rather than forbidden and the comment is never needed. Do not add one.
- Migrate itself. This gate ships before it, deliberately.
- Any change to a tracked surface. **None.**

---

## STOP. NO COMMIT.

---

## REPORT BACK

1. sha256 of all six before and after — **all six identical**.
2. The measured count per group, before asserting it.
3. The gate's output, and **evidence it FAILS** — one member altered, FAIL shown, reverted.
4. The three reports.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; **`0 of the 6 tracked surfaces modified`**; the new section visible in the
output. A gate that runs silently is a gate nobody knows they have.
