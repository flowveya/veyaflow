// Self-contained rebuild of scratch/f183/shake2.js (session copy): pulls named top-level
// declarations plus everything they reference, and top-level ExpressionStatements touching them.
const fs=require('fs'),acorn=require('acorn');
function walk(n,cb,p){ if(!n||typeof n.type!=='string')return; cb(n,p); for(const k in n){ if(k==='loc'||k==='start'||k==='end')continue; const v=n[k]; if(Array.isArray(v)) v.forEach(c=>{if(c&&typeof c.type==='string')walk(c,cb,n)}); else if(v&&typeof v.type==='string') walk(v,cb,n); } }
function build(file, roots, stubs, log){
  const html=fs.readFileSync(file,'utf8'); const i=html.indexOf('<script>')+8, j=html.indexOf('</script>',i);
  const code=html.slice(i,j); const ast=acorn.parse(code,{ecmaVersion:2022,sourceType:'script'});
  const decl=new Map(), order=[], kind=new Map();
  ast.body.forEach(n=>{
    if(n.type==='FunctionDeclaration'&&n.id){ decl.set(n.id.name,n); order.push(n.id.name); kind.set(n.id.name,'fn'); }
    if(n.type==='VariableDeclaration') n.declarations.forEach(d=>{ if(d.id.type==='Identifier'){ decl.set(d.id.name,{...n,__one:d}); order.push(d.id.name); kind.set(d.id.name,n.kind); } });
  });
  const refs=node=>{const s=new Set(); walk(node,(n,p)=>{ if(n.type!=='Identifier')return;
    if(p&&p.type==='MemberExpression'&&p.property===n&&!p.computed)return;
    if(p&&p.type==='Property'&&p.key===n&&!p.computed)return; if(decl.has(n.name)) s.add(n.name);}); return s;};
  const need=new Set(); const q=[...roots];
  const close=()=>{ while(q.length){ const nm=q.shift(); if(need.has(nm)||stubs.includes(nm)||!decl.has(nm)) continue; need.add(nm);
    const node=decl.get(nm); refs(node.__one||node).forEach(r=>{ if(!need.has(r)) q.push(r); }); } };
  close();
  const stmts=ast.body.filter(n=>n.type==='ExpressionStatement'); const extra=[]; let grew=true;
  while(grew){ grew=false; stmts.forEach(st=>{ if(extra.includes(st)) return; const r=refs(st); if([...r].some(x=>need.has(x))){ extra.push(st); r.forEach(x=>{ if(!need.has(x)) q.push(x); }); close(); grew=true; } }); }
  extra.sort((a,b)=>a.start-b.start);
  const parts=order.filter(nm=>need.has(nm)).map(nm=>{ const n=decl.get(nm); return n.__one ? (n.kind+' '+code.slice(n.__one.start,n.__one.end)+';') : code.slice(n.start,n.end); });
  const lets=order.filter(nm=>need.has(nm)&&(kind.get(nm)==='let'||kind.get(nm)==='var'));
  const api='return {'+roots.filter(r=>need.has(r)&&kind.get(r)==='fn').map(r=>r+':'+r).join(',')+',set:{'+lets.map(v=>v+':x=>{'+v+'=x}').join(',')+'},get:{'+lets.map(v=>v+':()=>'+v).join(',')+'}};';
  return new Function(...stubs, parts.join('\n')+'\n'+extra.map(st=>'try{'+code.slice(st.start,st.end)+'}catch(e){}').join('\n')+'\n'+api);
}
module.exports={build};
