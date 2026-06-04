/* ════════════════════════════════════════════════════════════════════════
   BIL-F2 CEILING STRESS HARNESS — v2
   Trigger 8 — BIL Use Case A, finding #5 (vision extraction latency)

   WHAT CHANGED FROM v1: F2a is DECIDED and DEPLOYED (Netlify enabled a 30s
   function ceiling, 2 Jun 2026; redeploy verified, proxy returns 200). v1's job
   was to DECIDE F2a-vs-F2b against a 20s heuristic and an old 24s client abort —
   both obsolete. v2 does not decide anything. It STRESS-TESTS the live 30s
   ceiling with a worst-case multi-page payload and reports HEADROOM against 30s,
   so Sequence B can rely on it (or not) with eyes open.

   HOW TO RUN (Charlotte):
   1. Open https://veyaflow.netlify.app in Chrome → DevTools → Console
   2. Have your WORST-CASE deck pages ready as images (jpg/png). To model the
      real 15-page case, select MULTIPLE page images when the picker appears —
      they go into ONE call (multi-image), which is the true heavy path.
   3. Paste this entire file, press Enter.
   4. Multi-select your page images in the picker.
   5. It runs 3 sequential extractions of that full multi-image payload and
      reports p50/p95/max + headroom against the 30s ceiling.

   COST NOTE: real Vision path. A multi-page call costs more than v1's single
   image (~€0.10–0.50 per run depending on page count). 3 runs ≈ still small.
   No client-side abort — measures true latency even if it exceeds 30s (a fetch
   that 504s at the platform ceiling is itself the signal).
   ════════════════════════════════════════════════════════════════════════ */

(async function BIL_F2_CeilingHarness(){
  const MODEL = 'claude-sonnet-4-6';   // vision-capable; matches platform usage
  const RUNS  = 3;
  const PROXY = '/.netlify/functions/anthropic-proxy';

  // ── The live ceiling (Netlify grant, 2 Jun 2026) ──
  const CEILING_MS   = 30000;   // hard platform ceiling — beyond this the function 504s
  const TARGET_MAX   = 24000;   // want worst observed run comfortably under ceiling (≈6s margin)
  const COMFORT_P95  = 20000;   // p95 below this = healthy steady-state margin
  // F3.1 caps extraction at 15 pages; that is the worst case to model here.
  const PAGE_CAP = 15;

  const SYSTEM = `Extract brand commercial intelligence from this image (a brand deck or product sheet). Return JSON only, no markdown fences:
{"brandName":"string","categories":["string"],"products":[{"name":"string","priceRange":{"min":0,"max":0,"currency":"SEK|NOK|EUR|GBP|DKK"}}],"certifications":["string"],"markets":["string"],"claims":["string"],"confidence":"high|medium|low"}`;

  function pickImages(){
    return new Promise((resolve,reject)=>{
      const inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true;  // multi-page
      inp.onchange = () => {
        const files = inp.files ? [...inp.files] : [];
        if(!files.length) return reject(new Error('No files selected'));
        Promise.all(files.map(f => new Promise((res,rej)=>{
          const r = new FileReader();
          r.onload = e => res({dataUrl:e.target.result, name:f.name, size:f.size});
          r.onerror = () => rej(new Error('Read failed: '+f.name));
          r.readAsDataURL(f);
        }))).then(resolve).catch(reject);
      };
      inp.click();
    });
  }

  function mediaTypeFromDataUrl(d){
    const m = d.match(/^data:([^;]+);base64,/);
    return m ? m[1] : 'image/jpeg';
  }

  async function oneRun(images){
    // Build a single multi-image message — the real 15-page-style payload.
    const content = images.map(img => ({
      type:'image',
      source:{ type:'base64', media_type:mediaTypeFromDataUrl(img.dataUrl), data:img.dataUrl.split(',')[1] }
    }));
    content.push({ type:'text', text:'Extract the brand commercial intelligence as specified across all pages. JSON only.' });

    const body = { model: MODEL, max_tokens: 1024, system: SYSTEM,
      messages: [{ role:'user', content }] };

    const t0 = performance.now();
    let ok=false, status=0, errText='', textOut='';
    try{
      const res = await fetch(PROXY, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(body)
        // NO AbortController — measure true latency; a 504 at the ceiling is the signal.
      });
      status = res.status;
      const data = await res.json();
      ok = res.ok;
      textOut = (data.content||[]).filter(b=>b.type==='text').map(b=>b.text).join('').slice(0,200);
      if(!ok) errText = JSON.stringify(data).slice(0,300);
    }catch(e){
      errText = e.message;  // network/timeout — at the ceiling this is the 504 path
    }
    const ms = Math.round(performance.now() - t0);
    return {ms, ok, status, errText, textOut};
  }

  function pctile(arr, p){
    const s=[...arr].sort((a,b)=>a-b);
    const idx = Math.min(s.length-1, Math.floor((p/100)*s.length));
    return s[idx];
  }

  console.log('%c═══ BIL-F2 Ceiling Stress Harness v2 ═══','font-weight:bold;font-size:14px');
  console.log(`Live ceiling: ${CEILING_MS/1000}s · model: ${MODEL} · select your worst-case page images (multi-select)…`);

  let images;
  try{ images = await pickImages(); }
  catch(e){ console.error('Aborted:', e.message); return; }

  if(images.length > PAGE_CAP){
    console.warn(`%c⚠ ${images.length} pages selected, but F3.1 caps extraction at ${PAGE_CAP}. `+
      `Trimming to first ${PAGE_CAP} to model the real worst case.`,'color:#b26500');
    images = images.slice(0, PAGE_CAP);
  }
  const totalKB = Math.round(images.reduce((s,i)=>s+i.size,0)/1024);
  console.log(`Payload: ${images.length} page(s), ${totalKB}KB total — ${images.map(i=>i.name).join(', ')}`);
  console.log(`Running ${RUNS} sequential multi-image extractions through the live proxy…`);
  console.log('(REAL Vision path — multi-page call, ~€0.10–0.50 per run)');

  const results = [];
  for(let i=0;i<RUNS;i++){
    console.log(`  Run ${i+1}/${RUNS} …`);
    const r = await oneRun(images);
    results.push(r);
    if(r.ok){
      console.log(`    ✓ ${r.ms}ms (HTTP ${r.status}) — sample: ${r.textOut.slice(0,80)}…`);
    } else {
      console.warn(`    ✗ ${r.ms}ms (HTTP ${r.status||'no-response'}) — ${r.errText}`);
    }
  }

  const oks = results.filter(r=>r.ok).map(r=>r.ms);
  console.log('%c─── RESULTS ───','font-weight:bold');

  // A 504 / timeout at the ceiling is a meaningful result, not just a failure.
  const had504 = results.some(r => r.status===504 || /timeout|aborted|network/i.test(r.errText));
  if(!oks.length){
    console.error('All runs failed — interpret carefully:');
    results.forEach((r,i)=>console.log(`  Run ${i+1}: HTTP ${r.status||'none'} — ${r.errText}`));
    if(had504){
      console.error(`%c→ Hitting the ${CEILING_MS/1000}s ceiling. The worst-case multi-page payload `+
        `does NOT complete in time. Sequence B canNOT rely on synchronous extraction at this page count.`,'color:#c00;font-weight:bold');
      console.log('   Options: reduce page cap below 15, or move multi-page to an async/background path (the old F2b shape) for large decks only.');
    } else {
      console.error('   Not a timeout — likely a proxy/multimodal issue. Check the proxy whitelists multi-image content + the HTTP status above.');
    }
    return {p50:null,p95:null,max:null,runs:0,all:results,ceilingHit:had504};
  }

  const p50 = pctile(oks,50), p95 = pctile(oks,95), max = Math.max(...oks);
  const headroom = CEILING_MS - max;
  console.log(`  Successful runs: ${oks.length}/${RUNS}${oks.length<RUNS?' (some failed — see above)':''}`);
  console.log(`  Latencies (ms): ${oks.join(', ')}`);
  console.log(`  p50=${p50}ms  p95=${p95}ms  max=${max}ms`);
  console.log(`  Headroom at worst run: ${headroom}ms below the ${CEILING_MS/1000}s ceiling`);

  console.log('%c─── CEILING VERDICT ───','font-weight:bold;font-size:13px');
  if(max < TARGET_MAX && p95 < COMFORT_P95 && oks.length===RUNS){
    console.log(`%c→ COMFORTABLE: worst run ${max}ms, ~${Math.round(headroom/1000)}s headroom under 30s. `+
      `Synchronous extraction is safe for this page count.`,'color:green;font-weight:bold');
  } else if(max < CEILING_MS && oks.length===RUNS){
    console.log(`%c→ WORKS BUT TIGHT: worst run ${max}ms, only ${Math.round(headroom/1000)}s headroom under 30s. `+
      `Fine now, but variance/larger decks could clip the ceiling. Watch the tail; consider a page-count guard.`,'color:#b26500;font-weight:bold');
  } else {
    console.log(`%c→ AT/OVER CEILING: max ${max}ms vs ${CEILING_MS}ms (or a run failed). `+
      `This payload size is not safely synchronous. Cap pages lower or async the large-deck path.`,'color:#c00;font-weight:bold');
  }

  console.log('\nReport p50/p95/max + page count + any 504s back to coding chat for the Sequence B go/no-go.');
  return {p50, p95, max, headroom, pages:images.length, runs:oks.length, all:results, ceilingHit:had504};
})();
