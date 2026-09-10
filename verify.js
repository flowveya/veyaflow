#!/usr/bin/env node
// VeyaFlow — standing verification battery
// ============================================================================
// Run via ./verify.sh (which adds digests and git state). Can be run alone.
//
//   node verify.js                  assert against verify.baseline.json
//   node verify.js --capture        (re)write verify.baseline.json from the tree
//
// Exit 0 = every gate green. Exit 1 = any FAIL or NOT FOUND.
//
// WHY THIS EXISTS
// ---------------
// It replaces ast_verify.js, whose line-18 extraction was
//     html.match(/<script>([\s\S]*?)<\/script>/)
// — non-global, first match only. It parsed block 1 and never touched block 2
// (which contains checkState). A parser blind to a block reports green over
// code it never read. A check that cannot fail is not a check.
//
// WHY AST AND NOT GREP
// --------------------
// Every truth fix leaves the old literal inside its own removal comment.
// At 649f0ef, `_operatorStatus` has 3 text matches but 2 real call sites —
// line 6638 is a comment epitaph. A raw `grep -c` reports a false failure.
// Conversely `_rpDateExpired` at 16225-16227 looks like a comment cluster and
// is 7 real rendered calls inside a template literal. Text cannot separate
// these; the AST can. Counts below are therefore RENDERED references unless a
// guard is explicitly labelled RAW.
// ============================================================================

const fs = require('fs');
const path = require('path');

let acorn;
try {
  acorn = require('acorn');
} catch (e) {
  console.error('FATAL: acorn not resolvable. Run `npm i acorn` in the repo root.');
  process.exit(2);
}

const ROOT = __dirname;
const TARGET = path.join(ROOT, 'index.html');
const BASELINE = path.join(ROOT, 'verify.baseline.json');
const CAPTURE = process.argv.includes('--capture');

const ECMA = 2022;

// ---------------------------------------------------------------------------
// Contracts from the CODING HANDOFF §3. These are HARD — they are asserted on
// every run whether or not a baseline exists. Changing one is a deliberate act
// and should be accompanied by a ruling in the daily log.
// ---------------------------------------------------------------------------

// Every one of these must have EXACTLY ONE definition, anywhere in any block.
const SINGLE_DEFINITION = [
  'resolveProductFramework',
  'FRAMEWORK_VOCAB',
  '_frameworkVocab',
  'getOperatorRegime',
  'getSafetyDocRegime',
  'getNotificationRegime',
  '_operatorStatus',
  '_operatorRow',
  '_operatorValueFor',
  '_rpDateExpired',
  '_dppIsPublished',
  '_dppFwFields',
  'checkState',
  'migrateBrandSchemaV3',
  'saveSkus',
  'saveBrandState',
  'persistCritical',
  'DPP_CANONICAL_ORIGIN',
  'DPP_ORIGIN_LIVE',
  // Time axis step 1 — the single write path for confirmation stamps.
  '_appendStamp',
  'CHECKLIST_STAMP_KEY',
  'CONFIRMATION_STAMP_KEY',
  // Time axis M1 — the record accessor; the ONLY authorised path to expiryDate.
  'certificationRecords',
];

// Call-site counts the handoff states outright.
const FIXED_CALLSITES = {
  _operatorStatus: 2,   // §3: 1 definition, 2 call sites
  // §3 recorded "1 definition / 4 call sites — the publication gate". Reduced to 3 on
  // 4 Sep 2026 by batch #9 shipment 4 item 6: the fourth call gated the passport line
  // inside the Brand Pack prompt's SECTION 5, and that section was removed because it
  // was regulatory prose by construction. The three survivors are batch #7's export
  // gates — QR, JSON, PDF — which are the gate's actual job. The definition is intact.
  // THIS IS A CHANGED ARCHITECTURAL CONTRACT, not a drifted count: the handoff §3 table
  // and CODING_STATUS.md both record 4 and must be corrected, or the next lane reads a
  // stale invariant and stops on a phantom.
  _dppIsPublished: 3,
  // Time axis step 1 (7 Sep 2026). THREE write sites, and the count is the contract:
  // toggleRetailChecklistItem, saveManualRp, saveManualOperator. A fourth call means a
  // new confirmation surface was stamped without a ruling; adding one is a spec decision,
  // not an implementation detail, so a floating count would not be a contract.
  //
  // FOUR since 10 Sep 2026 (#135). confirmDossier is the fourth, ruled in by Strategy as
  // an INSTANCE of the discrete-yes criterion rather than an extension of it: a human
  // presses "I confirm this is correct" against one named dossier record. That is the
  // same act as saveManualRp's, on a different object. The gate did its job — the count
  // failed the battery until it was ruled, which is why it is a contract and not a total.
  _appendStamp: 4,
  // Time axis M1 (9 Sep 2026). TWO consumers: buildComplianceEvents and hasCertData.
  // A third call means a new consumer of certificate metadata arrived — legitimate, but
  // it is a decision, so the number moves on purpose.
  certificationRecords: 2,
};

// ── NEAR-COPY GROUPS (#131) ─────────────────────────────────────────────────
// A group of expressions that must stay in agreement, pinned by an EXACT COUNT.
// Same discipline as FIXED_CALLSITES: a hardcoded number that must be changed on
// purpose. A count that moves — up OR down — fails until someone updates it here.
//
// THIS IS NOT A SIMILARITY DETECTOR. It does not scan for lines that look alike:
// index.html has 162 line-groups repeated 3+ times and 352 repeated logic lines,
// almost all registry data rows or re-render idioms. A detector over those would
// fire on coincidence, get muted, and become the check nobody reads.
//
// NOR IS IT A BAN ON DUPLICATION. Six export locales may be the right design. The
// gate says only: if the count changes, someone decided something and must say so.
//
// Each group is anchored by EXPRESSION SHAPE, never by line number — line numbers
// moved in every shipment this week and will move again in migrate.
const NEAR_COPY_GROUPS = [
  {
    name: 'export locale certification rows',
    expected: 6,
    note: '3b — six locale variants differing only by label; one sed replaced all six',
    count: src => (src.match(/normalizeCertifications\(sku\.certifications\)\.join\('; '\)/g) || []).length,
  },
  {
    name: 'ESG merged sku+brand certification spread',
    expected: 3,
    note: '3c — calcBrandESGScore, checkMandatoryESG, renderESGModal all build the same merged set',
    count: src => (src.match(/\.\.\.normalizeCertifications\(sku\?\.certifications\), \.\.\.normalizeCertifications\(brand\?\.certifications\)/g) || []).length,
  },
  {
    name: 'csrdAutoFill allCerts spread members',
    expected: 3,
    note: 'MUST MOVE AS ONE UNIT in migrate — all three feed one persisted string (ns_csrd_answers)',
    count: src => {
      const i = src.indexOf('const allCerts = [...new Set([');
      if (i < 0) return -1;                       // anchor gone — reported as NOT FOUND
      const j = src.indexOf('])]', i);
      if (j < 0) return -1;
      return src.slice(i, j).split('\n').filter(l => l.trim().startsWith('...')).length;
    },
  },
];

// Names that must NOT exist. `normalizeBrandRP` was invented by the coding lane
// and never existed in the tree; the real normaliser is migrateBrandSchemaV3.
// If this ever becomes non-zero, a spec has been written against a fiction.
const MUST_NOT_EXIST = ['normalizeBrandRP'];

// Inline <script> blocks expected in index.html.
// NOTE: index.html also contains the literal text `<script>` inside generated
// HTML strings (at 649f0ef: html-lines 32569, 32685, 39015). Those close with
// an escaped `<\/script>`, so a scan for a LITERAL `</script>` consumes them
// inside block 1 and never mistakes them for openers. That is correct today
// but fragile — hence this assertion, which fires if the shape ever changes.
const EXPECTED_BLOCKS = 2;

// Symbols whose contract is SEMANTIC and cannot be counted. Printed on every
// run as NOT CHECKED so that silence is never read as a pass.
const MANUAL_ONLY = [
  ['_operatorValueFor', 'cosmetic must return the CALLER\'S OWN expression, so cosmetic output cannot move'],
  ['_operatorRow', '2nd argument is the cosmetic label ONLY'],
  ['_dppFwFields', 'must emit nothing it has no mandate for'],
  ['resolveProductFramework', '`unknown` is first-class, never a synonym for cosmetic; no brand-category inference'],
  ['FRAMEWORK_VOCAB', 'holds cosmetic / device / beauty_accessory only, and NO article numbers (§6)'],
  ['checkState', 'the emitted blocker is authoritative'],
  ['_frameworkVocab', 'null means assert nothing — the caller omits the row'],
];

// RAW string guards. Explicitly labelled RAW because they are string matches
// over the whole file, comments included.
const PERSIST_KEYS = [
  'ns_brand', 'ns_skus', 'ns_crm', 'ns_dpp',
  'ns_retail_submissions', 'ns_retail_checklist', 'ns_session_id',
];

// ---------------------------------------------------------------------------

const report = [];
let failures = 0;
let notFound = 0;

function line(status, text) {
  if (status === 'FAIL') failures++;
  if (status === 'NOT FOUND') notFound++;
  report.push({ status, text });
  const pad = status.padEnd(9);
  console.log(pad + ' | ' + text);
}
function section(title) {
  console.log('');
  console.log('== ' + title + ' ' + '='.repeat(Math.max(0, 68 - title.length)));
}

// ---------------------------------------------------------------------------
// 1. Extract EVERY inline block
// ---------------------------------------------------------------------------

if (!fs.existsSync(TARGET)) {
  console.error('NOT FOUND | index.html at ' + TARGET);
  process.exit(1);
}
const html = fs.readFileSync(TARGET, 'utf8');

// True line count. A file ending in a newline yields a phantom empty final
// element from split('\n'); counting it reported 41,055 for a 41,054-line file
// on run 1. Line counts are DIAGNOSTICS here, never gates (they change every
// batch, so any expected value is stale by the next commit) — but a diagnostic
// that is wrong by one is still wrong.
const _split = html.split('\n');
const totalLines = (_split[_split.length - 1] === '') ? _split.length - 1 : _split.length;

const blocks = [];
const openRe = /<script>/g;
let m;
while ((m = openRe.exec(html)) !== null) {
  const codeStart = m.index + m[0].length;
  const closeIdx = html.indexOf('</script>', codeStart);
  if (closeIdx === -1) {
    line('FAIL', 'unterminated <script> opening at offset ' + m.index);
    break;
  }
  const code = html.slice(codeStart, closeIdx);
  blocks.push({
    openLine: html.slice(0, m.index).split('\n').length,
    closeLine: html.slice(0, closeIdx).split('\n').length,
    codeStartOffset: codeStart,
    code,
  });
  openRe.lastIndex = closeIdx + '</script>'.length;
}

section('FILE');
line('INFO', 'index.html — ' + totalLines.toLocaleString() + ' lines, ' +
  Buffer.byteLength(html, 'utf8').toLocaleString() + ' bytes');

section('BLOCK EXTRACTION');
if (blocks.length === 0) {
  line('NOT FOUND', 'no inline <script> blocks found — extraction is broken, not the file');
} else {
  blocks.forEach((b, i) => {
    // Content lines strictly between the opening and closing tags.
    const contentLines = Math.max(0, b.closeLine - b.openLine - 1);
    line('INFO', 'block ' + (i + 1) + ' — opens html-line ' + b.openLine +
      ', closes ' + b.closeLine + ' (' + contentLines.toLocaleString() + ' content lines)');
  });
  if (blocks.length === EXPECTED_BLOCKS) {
    line('PASS', 'block count = ' + EXPECTED_BLOCKS + ' as expected');
  } else {
    line('FAIL', 'block count = ' + blocks.length + ', expected ' + EXPECTED_BLOCKS +
      ' — extraction shape changed; do NOT trust any count below until resolved');
  }
}

// ---------------------------------------------------------------------------
// 1b. CROSS-CHANNEL CHECK
//
// The coding lane reads index.html through its file tools. Charlotte runs this
// script and pastes the result. Those are TWO CHANNELS onto what is supposed to
// be one file, and a digest alone cannot detect a divergence between them — the
// lane would be reasoning about bytes nobody hashed, while trusting a hash of
// bytes nobody read. That is precisely the failure the baseline-naming rule
// exists to catch, and the shell gap reopened it.
//
// So: print facts the lane can independently reproduce with a Read. If these
// agree, the two channels are looking at the same file and the digest above is
// trustworthy. If any disagree, STOP — the digest is describing a file the lane
// has not read, and no guard below means anything.
//
// Byte offsets are deliberately NOT used as witnesses: the lane cannot derive
// them by reading, so confirming one would only be agreeing with a number it
// has no independent access to. Verbatim line content can be checked character
// for character. These are DIAGNOSTICS — the lane compares, the script does not
// gate on them, because every one of them legitimately moves when code lands.
// ---------------------------------------------------------------------------

const WITNESS_LINES = [1480, 1488, 6533, 16327, 39724];
const WITNESS_LITERALS = ['FRAMEWORK_VOCAB', 'DPP_CANONICAL_ORIGIN', 'DPP_ORIGIN_LIVE'];

section('CROSS-CHANNEL CHECK (diagnostics — lane compares against its own Read)');
line('INFO', 'true line count (wc -l equivalent): ' + totalLines);
line('INFO', 'final line ' + totalLines + ': ' + JSON.stringify(_split[totalLines - 1]));
blocks.forEach((b, i) => {
  line('INFO', 'block ' + (i + 1) + ' <script> opens line ' + b.openLine +
    ', </script> closes line ' + b.closeLine);
});
WITNESS_LITERALS.forEach(lit => {
  const at = [];
  _split.forEach((l, i) => { if (l.indexOf(lit) !== -1) at.push(i + 1); });
  if (at.length === 0) {
    line('NOT FOUND', 'witness literal ' + lit + ' — absent. Either the file diverged ' +
      'or the symbol was renamed; both invalidate the cross-channel check.');
  } else {
    line('INFO', 'witness literal ' + lit + ' — ' + at.length +
      ' RAW occurrence(s) at line ' + at.join(', '));
  }
});
WITNESS_LINES.forEach(ln => {
  const content = _split[ln - 1];
  if (content === undefined) {
    line('NOT FOUND', 'witness line ' + ln + ' — beyond end of file (' + totalLines + ' lines)');
  } else {
    line('INFO', 'witness line ' + ln + ': ' + JSON.stringify(content));
  }
});
console.log('          | Compare every line above against a direct Read before trusting');
console.log('          | any digest or count in this report. A mismatch means two files.');

// ---------------------------------------------------------------------------
// 2. Parse every block
// ---------------------------------------------------------------------------

section('ACORN PARSE (every block)');
const asts = [];
const commentText = [];
for (let i = 0; i < blocks.length; i++) {
  const b = blocks[i];
  const comments = [];
  try {
    const ast = acorn.parse(b.code, {
      ecmaVersion: ECMA,
      sourceType: 'script',
      locations: true,
      onComment: comments,
    });
    asts.push({ ast, block: b, index: i });
    comments.forEach(c => commentText.push(c.value));
    line('PASS', 'block ' + (i + 1) + ' parsed clean (ecmaVersion ' + ECMA + ')');
  } catch (e) {
    const htmlLine = b.openLine + (e.loc ? e.loc.line - 1 : 0);
    line('FAIL', 'block ' + (i + 1) + ' PARSE ERROR at html-line ~' + htmlLine + ': ' + e.message);
  }
}
if (asts.length !== blocks.length) {
  console.log('');
  console.log('Parse failed on at least one block. Counts below are computed only over');
  console.log('the blocks that parsed and are therefore INCOMPLETE. Fix the parse first.');
}

// ---------------------------------------------------------------------------
// 3. Walk: definitions and call sites (RENDERED references, not text)
// ---------------------------------------------------------------------------

const defs = {};       // name -> [html lines]
const calls = {};      // name -> [html lines]
const identRefs = {};  // name -> count (any identifier reference)

function push(map, name, ln) {
  if (!map[name]) map[name] = [];
  map[name].push(ln);
}

function walk(node, block, parent) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.type === 'string') {
    const ln = node.loc ? block.openLine + node.loc.start.line - 1 : null;

    if (node.type === 'FunctionDeclaration' && node.id && node.id.name) {
      push(defs, node.id.name, ln);
    }
    if (node.type === 'VariableDeclarator' && node.id && node.id.name) {
      push(defs, node.id.name, ln);
    }
    if (node.type === 'CallExpression' && node.callee &&
        node.callee.type === 'Identifier') {
      push(calls, node.callee.name, ln);
    }
    if (node.type === 'Identifier') {
      // Skip property keys and member properties — those are not references
      // to the binding of the same name.
      const isKey = parent && (
        (parent.type === 'Property' && parent.key === node && !parent.computed) ||
        (parent.type === 'MemberExpression' && parent.property === node && !parent.computed)
      );
      if (!isKey) identRefs[node.name] = (identRefs[node.name] || 0) + 1;
    }
  }
  for (const k in node) {
    if (k === 'loc' || k === 'start' || k === 'end' || k === 'range') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => walk(c, block, node));
    else if (v && typeof v === 'object' && typeof v.type === 'string') walk(v, block, node);
  }
}

asts.forEach(a => walk(a.ast, a.block, null));

// ---------------------------------------------------------------------------
// 4. HARD contracts
// ---------------------------------------------------------------------------

section('SINGLE-DEFINITION INVARIANTS (§3)');
SINGLE_DEFINITION.forEach(name => {
  const d = defs[name];
  if (!d || d.length === 0) {
    line('NOT FOUND', name + ' — no definition found. The guard has no subject; ' +
      'this is NOT a pass.');
  } else if (d.length === 1) {
    line('PASS', name + ' — 1 definition (html-line ' + d[0] + ')');
  } else {
    line('FAIL', name + ' — ' + d.length + ' definitions at html-lines ' + d.join(', ') +
      ' — single-implementation invariant broken');
  }
});

section('FIXED CALL-SITE CONTRACTS (§3)');
Object.keys(FIXED_CALLSITES).forEach(name => {
  const expected = FIXED_CALLSITES[name];
  const c = calls[name] || [];
  const epitaphs = commentText.filter(t => t.indexOf(name) !== -1).length;
  const suffix = epitaphs ? '  [' + epitaphs + ' comment mention(s) correctly excluded]' : '';
  if (!defs[name]) {
    line('NOT FOUND', name + ' — subject absent; call-site count is meaningless');
  } else if (c.length === expected) {
    line('PASS', name + ' — ' + c.length + ' call sites (html-lines ' + c.join(', ') + ')' + suffix);
  } else {
    line('FAIL', name + ' — ' + c.length + ' call sites, expected ' + expected +
      ' (html-lines ' + c.join(', ') + ')' + suffix);
  }
});

// ── TIME AXIS STEP 1 — WRITE-ONLY GATE ──────────────────────────────────────
// "Renders nothing" must be a CANNOT, not a MUST-NOT. Without this, the first person who
// wants a "last confirmed" chip adds one in good faith and nothing stops them.
// The contract has three parts, and all three must hold:
//   1. each key LITERAL is quoted exactly once — its const declaration, nowhere else
//   2. each key CONSTANT is referenced only inside _appendStamp (1 ref each per write
//      site it serves; the literal itself is not a reference)
//   3. localStorage.getItem of either key appears ONLY inside _appendStamp, which is a
//      read-modify-write, not a read site
// A render of a stamp would have to break one of these to exist.
section('TIME AXIS — CONFIRMATION STAMPS ARE WRITE-ONLY (capture-only shipment)');
{
  const STAMP_KEYS = ['ns_retail_checklist_stamps', 'ns_confirmation_stamps'];
  STAMP_KEYS.forEach(k => {
    const quoted = (html.match(new RegExp("'" + k + "'|\"" + k + "\"", 'g')) || []).length;
    if (quoted === 1) line('PASS', k + ' — 1 quoted occurrence (its const declaration only)');
    else if (quoted === 0) line('NOT FOUND', k + ' — key absent; the capture shipment is not in this tree');
    else line('FAIL', k + ' — ' + quoted + ' quoted occurrences, expected 1. A second quote means the key is being read or written outside _appendStamp.');
    // A getItem of the key by LITERAL is the read that must never exist.
    const direct = (html.match(new RegExp("getItem\\(\\s*['\"]" + k + "['\"]", 'g')) || []).length;
    if (direct === 0) line('PASS', k + ' — 0 direct getItem() by literal');
    else line('FAIL', k + ' — ' + direct + ' direct getItem() by literal; this key is write-only');
  });
  // The stamp map must never reach a render. Any of these names inside a render/HTML
  // path would mean step 1 grew a UI, which is explicitly out of scope until the data
  // has existed long enough to reason about.
  const renderLeak = (html.match(/(?:innerHTML|html\s*\+=)[^\n]*(?:CHECKLIST_STAMP_KEY|CONFIRMATION_STAMP_KEY|_appendStamp)/g) || []).length;
  if (renderLeak === 0) line('PASS', 'no stamp identifier appears in an innerHTML or html+= line');
  else line('FAIL', renderLeak + ' render line(s) reference a stamp identifier — capture-only was violated');
  // Not evictable: _evictCaches is an allowlist, and widening it would silently make
  // unbackfillable history droppable under quota pressure.
  const evictList = (html.match(/const _EVICTABLE_CACHE_PREFIXES\s*=\s*\[([^\]]*)\]/) || [])[1] || '';
  const widened = /ns_retail|ns_confirmation/.test(evictList);
  if (!widened) line('PASS', '_EVICTABLE_CACHE_PREFIXES does not match either stamp key (allowlist: ' + evictList.trim() + ')');
  else line('FAIL', '_EVICTABLE_CACHE_PREFIXES was widened to cover a stamp key — history could be evicted under quota pressure');
}

// ── CANONICAL CERTIFICATION READER — THE COPIES MUST NOT DIVERGE ────────────
// There is no module system here: separate HTML files with inline scripts, so the
// reader exists once per surface. #128 was decided on exactly this hazard — a
// duplicated file diverged and the copy that rotted was the one nobody overwrote.
//
// THIS GATE CAN FAIL, which is why it earns its place: alter one character of any
// copy and the battery refuses. Contrast #128's must-not-exist gate, correctly
// declined because it could never fail.
//
// Located by BANNER TEXT and closing brace, never by line number — witness lines
// pinned to fixed numbers degrade after every edit (3 Sep, already in the log).
// Compares EVERY surface carrying the banner, not a hardcoded pair, so a third copy
// landing in index.html at phase 3 is checked automatically. A gate that silently
// checked two of three copies would be worse than none.
section('CANONICAL CERTIFICATION READER — BYTE-IDENTICAL ACROSS SURFACES');
{
  const BANNER = '// \u2500\u2500 CANONICAL CERTIFICATION READER';
  const SURFACES = ['index.html', 'dpp/index.html', 'portal.html', 'brand/index.html'];
  const copies = [];
  SURFACES.forEach(rel => {
    const fp = path.join(ROOT, rel);
    if (!fs.existsSync(fp)) return;
    const src = fs.readFileSync(fp, 'utf8');
    const i = src.indexOf(BANNER);
    if (i < 0) return;                        // surface does not carry the reader
    const j = src.indexOf('\nfunction normalizeCertifications(raw){', i);
    const k = j < 0 ? -1 : src.indexOf('\n}\n', j);
    if (j < 0 || k < 0) {
      line('FAIL', rel + ' — carries the reader banner but no complete normalizeCertifications() follows it');
      return;
    }
    copies.push({ rel: rel, text: src.slice(i, k + 3) });
  });
  if (copies.length === 0) {
    line('NOT FOUND', 'canonical certification reader — no surface carries the banner');
  } else if (copies.length === 1) {
    line('INFO', 'canonical reader present on 1 surface (' + copies[0].rel + ') — nothing to compare yet');
  } else {
    const ref = copies[0];
    let diverged = 0;
    copies.slice(1).forEach(c => {
      if (c.text !== ref.text) {
        diverged++;
        line('FAIL', c.rel + ' — reader DIVERGED from ' + ref.rel +
          ' (' + c.text.length + ' bytes vs ' + ref.text.length + '); copies must be byte-identical');
      }
    });
    if (!diverged) {
      line('PASS', 'canonical reader byte-identical across ' + copies.length +
        ' surfaces (' + copies.map(c => c.rel).join(', ') + '; ' + ref.text.length + ' bytes each)');
    }
  }
}

// #131 — near-copies are identical by luck until they are not. #128 is what that
// looks like afterwards: six root copies, five identical and untracked, one tracked
// and rotted for three months. No other gate sees a near-copy group — single-definition
// invariants see one name, call-site contracts see one function, and the reader copy
// gate sees only its own banner.
// ── RULING 5 · expiryDate HAS EXACTLY ONE AUTHORISED PATH ───────────────────
// A flat "zero .expiryDate outside the accessor" is unsatisfiable: the consumers must
// read the field OFF THE RECORDS the accessor returns — that is the whole point of
// having one. What ruling 5 forbids is reading it off the RAW field.
//
// So the gate asserts: every .expiryDate outside the accessor's own body sits inside a
// function that calls certificationRecords(). Reintroducing
// `(brand?.certifications||[]).some(c=>c.expiryDate)` in a fresh function fails, because
// that function contains no accessor call. Located by banner and closing brace, never by
// line number.
//
// This is what retires the epitaph: the two consumers stop being special sites that
// needed a comment to explain why they read raw. They stop reading raw.
section('RULING 5 — expiryDate READ ONLY VIA certificationRecords (time axis M1)');
{
  const BANNER = '// \u2500\u2500 CERTIFICATION RECORD ACCESSOR';
  const i = html.indexOf(BANNER);
  const j = i < 0 ? -1 : html.indexOf('\nfunction certificationRecords(raw){', i);
  const k = j < 0 ? -1 : html.indexOf('\n}\n', j);
  if (i < 0 || j < 0 || k < 0) {
    line('NOT FOUND', 'certification record accessor — banner or body absent; ruling 5 cannot be checked');
  } else {
    const bodyStart = i, bodyEnd = k + 3;
    const lines = html.split('\n');
    // map char offsets to line numbers for the accessor body
    let off = 0; const lineStart = lines.map(l => { const s0 = off; off += l.length + 1; return s0; });
    const inBody = idx => idx >= bodyStart && idx < bodyEnd;
    const offenders = [];
    lines.forEach((l, n) => {
      if (l.indexOf('expiryDate') < 0) return;
      if (l.trim().startsWith('//')) return;               // comments are not reads
      if (inBody(lineStart[n])) return;                     // inside the accessor: authorised
      // walk back to the enclosing function and check it calls the accessor
      let fnStart = -1;
      for (let m = n; m >= 0; m--) {
        if (/^\s*(?:async\s+)?function\s+[A-Za-z_$][\w$]*/.test(lines[m])) { fnStart = m; break; }
      }
      if (fnStart < 0) { offenders.push([n + 1, l.trim().slice(0, 90), 'no enclosing function']); return; }
      let fnEnd = lines.length;
      for (let m = fnStart + 1; m < lines.length; m++) { if (/^\}/.test(lines[m])) { fnEnd = m; break; } }
      const block = lines.slice(fnStart, fnEnd).join('\n');
      if (block.indexOf('certificationRecords(') < 0) {
        offenders.push([n + 1, l.trim().slice(0, 90), 'enclosing function never calls certificationRecords()']);
      }
    });
    if (offenders.length === 0) {
      line('PASS', 'every expiryDate read outside the accessor is inside a function that calls certificationRecords()');
    } else {
      offenders.forEach(o => line('FAIL', 'html-line ' + o[0] + ' reads expiryDate off a raw value — ' + o[2] + ': ' + o[1]));
    }
  }
}

section('NEAR-COPY GROUPS — COUNT IS A CONTRACT (#131)');
NEAR_COPY_GROUPS.forEach(g => {
  const n = g.count(html);
  if (n < 0) {
    line('NOT FOUND', g.name + ' — anchor absent; the group cannot be counted');
  } else if (n === g.expected) {
    line('PASS', g.name + ' — ' + n + ' as contracted  (' + g.note + ')');
  } else {
    line('FAIL', g.name + ' — ' + n + ', contract says ' + g.expected +
      '. A member was added, removed or edited out of shape; update NEAR_COPY_GROUPS deliberately if that was intended.');
  }
});

section('NAMES THAT MUST NOT EXIST');
MUST_NOT_EXIST.forEach(name => {
  const n = (identRefs[name] || 0);
  const raw = (html.match(new RegExp('\\b' + name + '\\b', 'g')) || []).length;
  if (n === 0 && raw === 0) {
    line('PASS', name + ' — absent, as required (0 AST refs, 0 RAW matches)');
  } else {
    line('FAIL', name + ' — present: ' + n + ' AST refs, ' + raw + ' RAW matches. ' +
      'This name does not exist in the product; a spec has been written against a fiction.');
  }
});

section('DPP ORIGIN CONTRACT (§3)');
{
  const ctxLines = [];
  html.split('\n').forEach((l, i) => { if (l.indexOf('@context') !== -1) ctxLines.push(i + 1); });
  if (ctxLines.length === 0) {
    line('NOT FOUND', '@context — subject absent from index.html; this is NOT a pass');
  } else {
    line('INFO', '@context — ' + ctxLines.length + ' RAW occurrence(s) at html-line ' + ctxLines.join(', '));
    const lines = html.split('\n');
    let bad = ctxLines.filter(ln => lines[ln - 1].indexOf('DPP_CANONICAL_ORIGIN') !== -1);
    if (bad.length === 0) {
      line('PASS', '@context stays a literal — does not read DPP_CANONICAL_ORIGIN (RAW, same-line check)');
    } else {
      line('FAIL', '@context reads DPP_CANONICAL_ORIGIN at html-line ' + bad.join(', ') +
        ' — §3 requires it stay a literal');
    }
  }
}

// ---------------------------------------------------------------------------
// 5. RAW guards
// ---------------------------------------------------------------------------

section('PERSISTENCE KEYS (RAW string matches, comments included)');
PERSIST_KEYS.forEach(k => {
  const n = (html.match(new RegExp("'" + k + "'|\"" + k + "\"", 'g')) || []).length;
  if (n === 0) line('NOT FOUND', k + ' — no quoted occurrence; storage key missing or renamed');
  else line('INFO', k + ' — ' + n + ' RAW quoted occurrence(s)');
});

section('ARTICLE NUMBERS (§6) — REPORT ONLY, NOT A GATE');
{
  const re = /\bArticle\s+\d+|\bArt\.\s*\d+|\bAnnex\s+[IVXL]+\b/g;
  const hits = [];
  html.split('\n').forEach((l, i) => {
    const found = l.match(re);
    if (found) hits.push({ ln: i + 1, what: found.join(', ') });
  });
  line('INFO', hits.length + ' line(s) carry an article/annex reference (RAW).');
  console.log('          | §6: until the RP answers question 4, no article numbers go on any');
  console.log('          | BUYER-FACING surface. This script CANNOT tell a buyer-facing string');
  console.log('          | from an internal comment or a blocker `impact` field. Drift against');
  console.log('          | baseline is flagged; classification is a human ruling.');
  hits.slice(0, 25).forEach(h => console.log('          |   html-line ' + h.ln + ': ' + h.what));
  if (hits.length > 25) console.log('          |   … ' + (hits.length - 25) + ' more');
}

// ---------------------------------------------------------------------------
// 6. Baseline drift for everything not hard-contracted
// ---------------------------------------------------------------------------

const observed = {
  blocks: blocks.map(b => ({ open: b.openLine, close: b.closeLine })),
  totalLines,
  defs: Object.fromEntries(Object.keys(defs).sort().map(k => [k, defs[k].length])),
  calls: Object.fromEntries(Object.keys(calls).sort().map(k => [k, calls[k].length])),
};

section('BASELINE DRIFT');
if (CAPTURE) {
  fs.writeFileSync(BASELINE, JSON.stringify(observed, null, 2) + '\n');
  line('INFO', 'baseline CAPTURED to verify.baseline.json — ' +
    Object.keys(observed.defs).length + ' definitions, ' +
    Object.keys(observed.calls).length + ' called names');
  console.log('          | A captured baseline asserts nothing on its own. It only makes the');
  console.log('          | NEXT run able to fail. Commit it alongside the tree it describes.');
} else if (!fs.existsSync(BASELINE)) {
  line('NOT FOUND', 'verify.baseline.json absent — drift detection is INERT. ' +
    'Run `node verify.js --capture` at a known-good commit, then commit the baseline.');
} else {
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const watch = ['_operatorRow', '_operatorValueFor', '_rpDateExpired', '_dppFwFields',
                 'resolveProductFramework', '_frameworkVocab', 'getOperatorRegime',
                 'getSafetyDocRegime', 'getNotificationRegime', 'persistCritical',
                 'saveSkus', 'saveBrandState', 'migrateBrandSchemaV3'];
  let drifted = 0;
  watch.forEach(name => {
    const was = base.calls[name];
    const now = calls[name] ? calls[name].length : 0;
    if (was === undefined && now === 0) {
      line('NOT FOUND', name + ' — absent from both baseline and tree; nothing is being checked');
      return;
    }
    if (was === undefined) { line('INFO', name + ' — new since baseline: ' + now + ' call sites'); drifted++; return; }
    if (was !== now) {
      line('FAIL', name + ' — call sites ' + was + ' → ' + now +
        ' (html-lines ' + (calls[name] || []).join(', ') + ')');
      drifted++;
    } else {
      line('PASS', name + ' — ' + now + ' call sites, unchanged');
    }
  });
  if (base.totalLines !== totalLines) {
    line('INFO', 'index.html ' + base.totalLines + ' → ' + totalLines + ' lines');
  }
  if (!drifted) line('PASS', 'no call-site drift against baseline');
}

// ---------------------------------------------------------------------------
// 7. What this battery does NOT check
// ---------------------------------------------------------------------------

section('NOT CHECKED — semantic contracts requiring a human');
MANUAL_ONLY.forEach(([name, contract]) => {
  console.log('NOT CHECKED | ' + name + ': ' + contract);
});
console.log('');
console.log('NOT CHECKED | LAYOUT. Byte verification checks what a string SAYS, never where');
console.log('NOT CHECKED | it LANDS. Finding #95 passed every guard over a document that');
console.log('NOT CHECKED | overprints itself. Only a human reading the generated output');
console.log('NOT CHECKED | catches that class. A green run here is not a shippable pack.');
console.log('NOT CHECKED |');
console.log('NOT CHECKED | SMOKE. Run smoke where the data is — file:// and every device have');
console.log('NOT CHECKED | their own localStorage. A run from the wrong origin passes against');
console.log('NOT CHECKED | an empty catalogue: the worst kind of pass.');

// ---------------------------------------------------------------------------

section('VERDICT');
if (failures === 0 && notFound === 0) {
  console.log('GREEN — ' + report.filter(r => r.status === 'PASS').length + ' gates passed, 0 failed, 0 not found.');
  console.log('This is a bytes-and-structure verdict only. See NOT CHECKED above.');
  process.exit(0);
} else {
  console.log('NOT GREEN — ' + failures + ' FAIL, ' + notFound + ' NOT FOUND.');
  console.log('Do not commit. Report to the coding lane and wait for a ruling.');
  process.exit(1);
}
