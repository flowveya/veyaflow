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
FILES="index.html dpp/index.html portal.html brand/index.html netlify/functions/supabase-proxy.js"
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
      echo "INFO      | $f  ${SHORT}…  DIFFERS from named baseline (${EXP}…)"
      echo "          |   Proceedable ONLY if this file is the one the batch names AND"
      echo "          |   the coding lane named the new value. A sha CC reported itself"
      echo "          |   is not sufficient. Otherwise: stop, report, wait."
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
if [ $RC -eq 0 ]; then
  echo " OVERALL: GREEN — structure and provenance clean."
  echo " Not a shipping verdict. Layout and smoke are unrun; see NOT CHECKED above."
else
  echo " OVERALL: NOT GREEN — do not commit. Paste this report to the coding lane."
fi
echo "============================================================================"
exit $RC
