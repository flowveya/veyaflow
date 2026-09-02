#!/usr/bin/env node
// ############################################################################
// ## SUPERSEDED — DO NOT USE FOR VERIFICATION.                              ##
// ##                                                                        ##
// ## Line 18 below is `html.match(/<script>([\s\S]*?)<\/script>/)` — NON-    ##
// ## GLOBAL, first match only. It parses block 1 (html-lines 1176-39535) and ##
// ## never touches block 2 (39536-41052), which contains checkState. A clean ##
// ## exit from this script is a green over 63% of the file, reported as if   ##
// ## it covered all of it. A check that cannot fail is not a check.          ##
// ##                                                                        ##
// ## Use ./verify.sh instead. Its block scan is global and asserts the block ##
// ## count. This file is retained ONLY until its USER_STATE / TDZ lint is    ##
// ## ported into verify.js with its own test case, at which point it is      ##
// ## deleted in that same commit.                                            ##
// ############################################################################

// VeyaFlow — AST verification check
// Run after any change touching prompt-context construction, AI generators, or
// module-level declarations. Flags top-level string-typed declarations that
// interpolate user-state variables (which would freeze at module load and feed
// stale data into AI prompts).
//
// Usage: node ast_verify.js [path-to-index.html]
//   exits 0 if clean, 1 if any violations found
//
// Background: shipped Apr 2026 after the brandCtx orphan TDZ + staleness incident.

const acorn = require('acorn');
const fs = require('fs');

// Runtime guard. The header comment stops a reader; it does not stop a runner.
// Anyone invoking this directly must not be able to walk away with a verdict.
console.error('');
console.error('  ########################################################################');
console.error('  ##  SUPERSEDED SCRIPT — parses block 1 ONLY (63% of index.html).      ##');
console.error('  ##  It cannot see block 2, which contains checkState.                  ##');
console.error('  ##  Any "CLEAN" it prints is a green over code it never read.          ##');
console.error('  ##                                                                     ##');
console.error('  ##  Run ./verify.sh instead.                                           ##');
console.error('  ########################################################################');
console.error('');
if (!process.argv.includes('--i-know-this-is-partial')) {
  console.error('Refusing to emit a verdict. Re-run with --i-know-this-is-partial only if');
  console.error('you are porting the USER_STATE lint and need its output for a test case.');
  process.exit(2);
}

const path = process.argv[2] || '/home/claude/index.html';
const html = fs.readFileSync(path, 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('No <script> block found'); process.exit(2); }
const code = m[1];
const beforeScript = html.slice(0, m.index);
const scriptStartLine = beforeScript.split('\n').length;

const ast = acorn.parse(code, {ecmaVersion:2022, sourceType:'script', locations:true});

// User-state variables — declarations that mutate after module load.
// Update this list when new user-state variables are added to the platform.
const USER_STATE = new Set([
  'reportForm','brand','skus','pitchForm','bizCaseState','brandPackState',
  'compareForm','onboardForm','findForm','crmCards','crmFilter','sourcingCRM',
  'submissions','submissionPipeline','articleTemplates','dppRecords',
  'retailChecklist','retailPerf','reportState','pitchResult','savedReports',
  'circularResult','circularForm','dppState','retailComms',
]);

function getUserStateRefs(node, refs){
  if (!node || typeof node !== 'object') return;
  if (node.type === 'Identifier' && USER_STATE.has(node.name)) refs.add(node.name);
  if (node.type === 'MemberExpression' && node.object) {
    const o = node.object;
    if (o.type === 'Identifier' && USER_STATE.has(o.name)) refs.add(o.name);
  }
  for (const k in node) {
    if (k === 'loc') continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach(c => getUserStateRefs(c, refs));
    else if (v && typeof v === 'object' && v.type) getUserStateRefs(v, refs);
  }
}

function isStringInitializer(init) {
  if (!init) return false;
  if (init.type === 'TemplateLiteral') return true;
  if (init.type === 'Literal' && typeof init.value === 'string') return true;
  // String-returning conditional/binary/logical that contains template literals
  if (init.type === 'ConditionalExpression') return true;
  if (init.type === 'BinaryExpression' && init.operator === '+') return true;
  if (init.type === 'LogicalExpression') return true;
  return false;
}

const violations = [];

for (const node of ast.body) {
  if (node.type !== 'VariableDeclaration') continue;
  for (const d of node.declarations) {
    if (!d.id || !d.id.name) continue;
    if (!isStringInitializer(d.init)) continue;
    const refs = new Set();
    getUserStateRefs(d.init, refs);
    if (refs.size === 0) continue;
    const fileLine = scriptStartLine + d.loc.start.line - 1;
    violations.push({
      fileLine,
      name: d.id.name,
      kind: node.kind,
      refs: [...refs],
    });
  }
}

if (violations.length === 0) {
  console.log('PARTIAL — no top-level prompt-context-shaped declarations referencing');
  console.log('user state IN BLOCK 1. Block 2 was not parsed. This is NOT a clean bill');
  console.log('for index.html and must not be quoted as one.');
  process.exit(0);
}

console.error('AST verification FAILED — ' + violations.length + ' violation(s):');
console.error('');
for (const v of violations) {
  console.error('  L' + v.fileLine + ': ' + v.kind + ' ' + v.name +
    ' references user-state vars: ' + v.refs.join(', '));
  console.error('    → This declaration evaluates at module load with empty/');
  console.error('      undefined user state. Move inside the consuming function.');
  console.error('');
}
console.error('Background: see April 2026 brandCtx orphan incident — top-level');
console.error('declarations referencing reportForm/brand/skus/etc. freeze at module');
console.error('load with empty values, then feed stale data into AI prompts.');
process.exit(1);
