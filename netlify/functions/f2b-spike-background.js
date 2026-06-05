// ============================================================================
// THROWAWAY SPIKE — NOT part of the F2b build. DELETE after the smoke-test.
// f2b-spike-background.js
//
// Purpose: retire the F2b deploy unknown — prove a Netlify Background Function
// on this (Pro) account can:
//   (A) deploy and be reachable,
//   (B) return 202 immediately (the background-function contract),
//   (C) run PAST the old 30s sync ceiling (deliberate ~35s wait, then finish),
//   (D) write to Supabase from inside the background function.
//
// The "-background" filename suffix is REQUIRED: it tells Netlify to treat this
// as a Background Function — Netlify auto-returns 202 to the caller, then runs
// the handler for up to 15 minutes with no synchronous response body.
//
// Placement: this file lives in the toml's declared functions dir,
// netlify/functions/ (see netlify.toml: functions = "netlify/functions").
//
// Cleanup after the spike:
//   DELETE FROM bil_extractions WHERE dedupe_key LIKE 'spike-%';
//   ...then delete this file. No client/B4/B6/C-layer code references it.
// ============================================================================

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY; // service_role
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

exports.handler = async () => {
  const t0 = Date.now();
  console.log('[f2b-spike] start', new Date().toISOString());

  // (C) Deliberate ~35s wait — exceeds the old 30s sync ceiling. If the platform
  // kills the function before the lines below run, the ceiling is NOT gone.
  await new Promise(function (resolve) { setTimeout(resolve, 35000); });
  console.log('[f2b-spike] past 35s wait, elapsed_ms=' + (Date.now() - t0));

  // (D) Write to Supabase using the SAME REST shape as supabase-proxy's helper
  // (apikey = anon key, Authorization = service_role key). Writes a throwaway
  // row whose dedupe_key starts 'spike-' for easy cleanup. Also exercises the
  // new `result` jsonb column.
  let write = 'skipped (SUPABASE_* env not present)';
  if (SUPABASE_URL && SUPABASE_KEY && SUPABASE_ANON) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/bil_extractions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          session_id: 'spike-test',
          dedupe_key: 'spike-' + Date.now(),
          status: 'spike_done',
          result: { spike: true, elapsed_ms: Date.now() - t0, wrote_at: new Date().toISOString() },
        }),
      });
      const text = await res.text();
      write = res.ok ? ('ok HTTP ' + res.status) : ('FAILED HTTP ' + res.status + ' — ' + text.slice(0, 300));
    } catch (e) {
      write = 'ERROR ' + (e && e.message);
    }
  }

  // Return value is IGNORED by Netlify for background functions (the caller
  // already received 202). The console logs are the confirmation surface.
  console.log('[f2b-spike] done total_ms=' + (Date.now() - t0) + ' write=' + write);
  return { statusCode: 200, body: JSON.stringify({ total_ms: Date.now() - t0, write: write }) };
};
