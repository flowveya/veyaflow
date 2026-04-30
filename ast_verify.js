#!/usr/bin/env node
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

const acorn = require('/tmp/node_modules/acorn');
const fs = require('fs');

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
  console.log('AST verification CLEAN — no top-level prompt-context-shaped declarations');
  console.log('referencing user state.');
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
