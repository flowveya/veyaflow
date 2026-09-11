#!/usr/bin/env bash
# VeyaFlow — one-command standing verification battery
# ============================================================================
#   ./verify.sh              full battery, assert against baselines
#   ./verify.sh --capture    (re)capture verify.baseline.json at a known-good tree
#
# Prints ONE report. Paste the whole thing to the coding lane — including the
# NOT CHECKED block, which is part of the verdict, not decoration.
#
# Exit 0 = green. Exit 1 = at least one FAIL or NOT FOUND.
#
# Separation of duties: CC applies edits and STOPS. The coding lane specs and
# rules. This script is run by Charlotte. CC does not write, edit, or run the
# harness that verifies CC.
# ============================================================================

set -uo pipefail
cd "$(dirname "$0")" || exit 2

CAPTURE=""
[ "${1:-}" = "--capture" ] && CAPTURE="--capture"

# ---- sha256, portably (macOS has shasum, not sha256sum) --------------------
if command -v sha256sum >/dev/null 2>&1; then
  SHA() { sha256sum "$1" | awk '{print $1}'; }
elif command -v shasum >/dev/null 2>&1; then
  SHA() { shasum -a 256 "$1" | awk '{print $1}'; }
else
  echo "FATAL: no sha256sum or shasum on PATH. Cannot produce digests."
  exit 2
fi

RC=0
# #174 — DIFFERS is counted apart from every other failure, so the verdict can say whether
# the ONLY thing standing between this tree and GREEN is an unnamed baseline. The exit code
# does not distinguish them: both are 1. Only the wording does.
DIFF_RC=0
DIFFS=""

echo "============================================================================"
echo " VeyaFlow verification battery"
echo " $(date '+%Y-%m-%d %H:%M:%S %Z')   host: $(hostname -s 2>/dev/null || echo '?')"
echo "============================================================================"

# ---- git state -------------------------------------------------------------
echo ""
echo "== GIT ====================================================================="
if [ -d .git ]; then
  BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  HEADSHA=$(git rev-parse HEAD 2>/dev/null)
  echo "INFO      | branch    $BRANCH"
  echo "INFO      | HEAD      $HEADSHA"
  DIRTY=$(git status --porcelain 2>/dev/null)
  if [ -z "$DIRTY" ]; then
    echo "PASS      | working tree clean"
  else
    echo "INFO      | working tree DIRTY:"
    echo "$DIRTY" | sed 's/^/          |   /'
    echo "          | Dirty is expected mid-batch (CC has applied and stopped)."
    echo "          | Dirty on a file the batch does not name is a red flag."
  fi
  # Upstream check — push target is f2b-async:coding-aug2026. NO force-push. NO PR merges.
  echo "INFO      | push target is 'git push origin f2b-async:coding-aug2026' (never --force)"
else
  echo "NOT FOUND | no .git directory — cannot establish provenance of these bytes"
  RC=1
fi

# ---- digests ---------------------------------------------------------------
echo ""
echo "== DIGESTS ================================================================="
# #126, 7 Sep 2026 — supabase-proxy.js added. It decides whether a write LANDS:
# loop.upsert is insert-if-absent, and loop.update carries a field whitelist that
# excludes `context`. Those two facts settled #114a, and this harness had never
# compared the file. A tracked surface list that omits the write layer cannot see the
# difference between "the client sent it" and "the row changed".
# #130, 9 Sep 2026 — share-dpp.js added. It decides what a published passport CONTAINS:
# DPP_PUBLIC_FIELDS builds the section shape the viewer reads, and DPP_CONDITIONAL_GATING
# decides which sections survive publish. Reading it settled a false report that the
# Certifications section was dead — the nesting the viewer reads is created HERE. A tracked
# surface list that omits the layer shaping a published, shareable record cannot see the
# difference between "the client sent it" and "the buyer receives it". Same finding as #126.
# #174, 11 Sep 2026 — the other five functions join, 6 → 11. Every file in
# netlify/functions/ is a public HTTP endpoint, and five of them could change under a GREEN
# run with no digest. The function members of FILES are DERIVED from FUNCTIONS_CONTRACT
# below rather than listed twice, so the directory contract and the digest list cannot
# drift: adding a name to the contract adds it here, and the battery then refuses until
# the coding lane names its baseline.
FUNCTIONS_DIR="netlify/functions"
FUNCTIONS_CONTRACT="netlify/functions/anthropic-proxy-background.js
netlify/functions/anthropic-proxy.js
netlify/functions/get-brand-pack.js
netlify/functions/get-dpp.js
netlify/functions/share-brand-pack.js
netlify/functions/share-dpp.js
netlify/functions/supabase-proxy.js"
FILES="index.html dpp/index.html portal.html brand/index.html $(echo ${FUNCTIONS_CONTRACT})"
EXPECTED_FILE="verify.expected.txt"

for f in $FILES; do
  if [ ! -f "$f" ]; then
    echo "NOT FOUND | $f — file absent. Its guards below assert nothing."
    RC=1
    continue
  fi
  D=$(SHA "$f")
  SHORT=${D:0:8}
  # NOTE: every expansion below is BRACED. Under `set -u` in a UTF-8 locale,
  # bash folds the bytes of a following multibyte character (the ellipsis) into
  # the variable name, so `$SHORT…` is read as a variable named `SHORT…` and
  # dies with "unbound variable". Run 1 failed here. Do not unbrace these.
  if [ -f "$EXPECTED_FILE" ]; then
    EXP=$(awk -v k="$f" '$1==k {print $2}' "$EXPECTED_FILE")
    if [ -z "$EXP" ]; then
      echo "NOT FOUND | $f  ${SHORT}…  — no named baseline for this file in $EXPECTED_FILE"
      RC=1
    elif [ "$SHORT" = "$EXP" ]; then
      echo "PASS      | $f  ${SHORT}…  matches named baseline"
    else
      # #174, ruled (a) 11 Sep 2026 — DIFFERS IS A FAIL, on every surface. It was INFO, and
      # never set the exit code: seen in a pristine copy, a one-byte change to
      # anthropic-proxy-background.js (the file holding ANTHROPIC_API_KEY and
      # SUPABASE_SERVICE_KEY) read `1 of 11 modified`, exit 0, OVERALL GREEN. A battery with a
      # false clean bill fails OPEN and carries authority. Failing closed costs nothing at
      # commit time: the expected value is updated IN THE SAME COMMIT as the change (this
      # file's header), so a named change is PASS by then. DIFFERS can only appear BEFORE
      # naming, which is exactly when "do not commit" is true.
      echo "FAIL      | $f  ${SHORT}…  DIFFERS from named baseline (${EXP}…) — AWAITING NAME"
      echo "          |   Expected mid-batch on the ONE surface the batch names: it stays FAIL"
      echo "          |   until the coding lane names the new value in $EXPECTED_FILE, and"
      echo "          |   a named change reads PASS by commit time. On any other file it is a"
      echo "          |   change nobody named: stop, report, wait. A sha CC reported itself"
      echo "          |   is not a name."
      DIFF_RC=1
      DIFFS="${DIFFS} $f"
    fi
  else
    echo "INFO      | $f  ${SHORT}…  (no $EXPECTED_FILE — nothing to compare against)"
  fi
  echo "          |   full: ${D}"
done

if [ ! -f "$EXPECTED_FILE" ]; then
  echo "NOT FOUND | $EXPECTED_FILE absent — digest comparison is INERT this run."
  RC=1
fi

# ---- the functions directory is the contract (#174) ------------------------
# The digest list above is a list of KNOWN members, and a list of known members is what
# failed: a throwaway background function sat untracked in this directory for three months,
# one `git add .` from being a live endpoint, because nothing watched what LANDED here.
# This gate asserts the directory's contents, not just its members. Anything not named in
# FUNCTIONS_CONTRACT fails the battery, by name, until it is added deliberately.
#
# INPUT IS GIT'S VIEW, not a raw listing: tracked files plus untracked files that are NOT
# gitignored — i.e. exactly what `git add .` could stage, which is exactly what could reach a
# git-driven deploy. Two consequences, both deliberate:
#   - a Finder .DS_Store (gitignored) does not fail the battery. A raw `ls` gate would fail the
#     first time someone opened this folder, and a gate that fails on normal use gets muted.
#   - ALL entries count, not just *.js: Netlify deploys subdirectory functions, .mjs and .ts
#     too, and on 10 Jun 2026 a web upload put an index.html in this directory (still present
#     on origin/legacy-web-uploads). A *.js glob would have been blind to both.
# Files present on disk only — a tracked member deleted from the working tree reads MISSING.
echo ""
echo "== FUNCTIONS DIRECTORY CONTRACT ============================================"
if [ -d .git ]; then
  FN_EXPECTED=$(printf '%s\n' "${FUNCTIONS_CONTRACT}" | sed '/^$/d' | LC_ALL=C sort)
  FN_ACTUAL=$(git -c core.quotePath=false ls-files -co --exclude-standard -- "${FUNCTIONS_DIR}/" \
              | while IFS= read -r p; do [ -e "$p" ] && printf '%s\n' "$p"; done \
              | sed '/^$/d' | LC_ALL=C sort)
  FN_EXTRA=$(comm -13 <(printf '%s\n' "${FN_EXPECTED}") <(printf '%s\n' "${FN_ACTUAL}") | sed '/^$/d')
  FN_MISSING=$(comm -23 <(printf '%s\n' "${FN_EXPECTED}") <(printf '%s\n' "${FN_ACTUAL}") | sed '/^$/d')
  FN_N=$(printf '%s\n' "${FN_EXPECTED}" | sed '/^$/d' | wc -l | tr -d ' ')
  if [ -z "${FN_EXTRA}" ] && [ -z "${FN_MISSING}" ]; then
    echo "PASS      | ${FUNCTIONS_DIR}/ holds exactly the ${FN_N} contracted files, nothing else"
  else
    if [ -n "${FN_EXTRA}" ]; then
      printf '%s\n' "${FN_EXTRA}" | while IFS= read -r x; do
        echo "FAIL      | UNCONTRACTED file in ${FUNCTIONS_DIR}/: ${x}"
      done
      echo "          |   Every file here is a public HTTP endpoint on deploy. Add it to"
      echo "          |   FUNCTIONS_CONTRACT deliberately, with a named digest — or remove it."
    fi
    if [ -n "${FN_MISSING}" ]; then
      # Two shapes, and they need different words (#176). A file that is GONE, and a file that
      # is sitting right there on disk but invisible to git — untracked and gitignored, so the
      # next deploy drops it. Calling the second one "missing" while `ls` shows it would read
      # as a broken gate. It is the more dangerous of the two: the digest gate PASSES it,
      # because its bytes are exactly the named ones.
      printf '%s\n' "${FN_MISSING}" | while IFS= read -r x; do
        if [ -e "$x" ]; then
          echo "FAIL      | contracted file on disk but untracked and gitignored — will not deploy: ${x}"
        else
          echo "FAIL      | contracted file absent from disk: ${x}"
        fi
      done
    fi
    RC=1
  fi
else
  echo "NOT FOUND | no git — cannot establish what this directory could deploy"
  RC=1
fi

# ---- one edit at a time ----------------------------------------------------
echo ""
echo "== ONE-EDIT-AT-A-TIME ======================================================"
if [ -d .git ]; then
  CHANGED=$(git status --porcelain -- $FILES 2>/dev/null | wc -l | tr -d ' ')
  CHANGED=${CHANGED:-0}
  # #126 — count is DERIVED from FILES, not written as a literal. The label said
  # "4 tracked HTML surfaces" while the gate already iterated five, and one of the
  # five is not HTML. A gate whose message contradicts its own behaviour is how a
  # future reader mis-reads a FAIL.
  NFILES=$(echo $FILES | wc -w | tr -d ' ')
  if [ "$CHANGED" -le 1 ]; then
    echo "PASS      | $CHANGED of the $NFILES tracked surfaces modified"
  else
    echo "FAIL      | $CHANGED tracked surfaces modified at once — §2 allows one edit"
    echo "          | at a time. Verify them separately or split the batch."
    RC=1
  fi
else
  echo "NOT FOUND | no git — cannot tell how many surfaces were touched"
  RC=1
fi

# ---- AST battery -----------------------------------------------------------
echo ""
echo "== AST BATTERY ============================================================="
if [ ! -f verify.js ]; then
  echo "NOT FOUND | verify.js absent — the entire structural battery did not run."
  echo "          | This is NOT a pass."
  RC=1
elif ! command -v node >/dev/null 2>&1; then
  echo "NOT FOUND | node not on PATH — the structural battery did not run."
  RC=1
else
  node verify.js $CAPTURE
  NODE_RC=$?
  [ $NODE_RC -ne 0 ] && RC=1
fi

# ---- overall ---------------------------------------------------------------
echo ""
echo "============================================================================"
if [ $RC -eq 0 ] && [ $DIFF_RC -eq 0 ]; then
  echo " OVERALL: GREEN — structure and provenance clean."
  echo " Not a shipping verdict. Layout and smoke are unrun; see NOT CHECKED above."
elif [ $RC -eq 0 ]; then
  # Every OTHER gate passed; the only failure is an unnamed baseline. Worded as the expected
  # mid-batch state, because that is what it usually is — but it still exits 1.
  echo " OVERALL: NOT GREEN — AWAITING NAME for:${DIFFS}"
  echo " Every other gate passed. Do not commit until the coding lane names the new value."
  echo " If the batch did not name this file, it is a change nobody made on purpose: stop."
else
  # A real failure is present. The awaiting-name wording is withheld so it cannot soften it.
  echo " OVERALL: NOT GREEN — do not commit. Paste this report to the coding lane."
  [ $DIFF_RC -ne 0 ] && echo " (Also awaiting name:${DIFFS} — but that is not the only failure.)"
fi
echo "============================================================================"
[ $RC -ne 0 ] || [ $DIFF_RC -ne 0 ] && exit 1
exit 0
