// ============================================================================
// VeyaFlow — BIL Vision extraction, ASYNC (F2b)
// Netlify BACKGROUND function: /.netlify/functions/anthropic-proxy-background
//
// The "-background" suffix makes Netlify return 202 to the caller immediately
// and run this handler OFF the 30s sync ceiling (up to 15 min). It performs the
// same Anthropic vision call that anthropic-proxy.js does synchronously today,
// but instead of returning the result to the caller it writes the result into
// the caller-supplied bil_extractions row. The client then polls that row.
//
// Contract:
//   POST { extractionId, body }
//     extractionId — bil_extractions row id. The client created the row via
//                    bilLogExtraction (status='processing') BEFORE calling here.
//     body         — the Anthropic request buildBilExtractionCall() produces
//                    today: { model, max_tokens, system, messages[] (image blocks) }.
//   → 202 immediately (automatic, from the -background suffix). Then:
//   On success: PATCH row → result=<raw Anthropic JSON>, status='done', latency_ms
//   On failure: PATCH row → status='failed', error_type=<reason>, latency_ms
//
// The raw model response is stored verbatim in the `result` jsonb column;
// validation stays CLIENT-SIDE (validateBilExtraction, unchanged). result is
// data, never executed — safe to store raw.
//
// Env (same names as anthropic-proxy.js + supabase-proxy.js):
//   ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY
// ============================================================================

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_KEY; // service_role
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

// PATCH a bil_extractions row by id. Mirrors supabase-proxy's REST shape exactly:
// apikey = anon key, Authorization = Bearer service_role key. Best-effort; logs
// and returns false on failure (the caller decides what to do next).
async function patchRow(extractionId, patch) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_ANON) {
    console.error('[bg] missing SUPABASE_* env — cannot write row');
    return false;
  }
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bil_extractions?id=eq.${encodeURIComponent(extractionId)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(patch),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error('[bg] PATCH failed HTTP ' + res.status + ' — ' + text.slice(0, 300));
      return false;
    }
    return true;
  } catch (e) {
    console.error('[bg] PATCH error ' + (e && e.message));
    return false;
  }
}

exports.handler = async (event) => {
  const t0 = Date.now();

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    console.error('[bg] invalid JSON body');
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const extractionId = payload && payload.extractionId;
  const body = payload && payload.body;

  // No extractionId → nowhere to write the result; nothing we can mark failed.
  if (!extractionId) {
    console.error('[bg] no extractionId — aborting');
    return { statusCode: 400, body: 'extractionId required' };
  }
  // Malformed body → mark the row failed so the client poll doesn't hang.
  if (!body || !Array.isArray(body.messages)) {
    console.error('[bg] missing body.messages for ' + extractionId);
    await patchRow(extractionId, { status: 'failed', error_type: 'bad_request', latency_ms: Date.now() - t0 });
    return { statusCode: 400, body: 'body.messages required' };
  }
  if (!ANTHROPIC_API_KEY) {
    await patchRow(extractionId, { status: 'failed', error_type: 'no_api_key', latency_ms: Date.now() - t0 });
    return { statusCode: 500, body: 'ANTHROPIC_API_KEY not set' };
  }

  // ── Call Anthropic (mirror anthropic-proxy.js) — no 30s ceiling here. ──────
  try {
    const aReq = {
      model: body.model || 'claude-sonnet-4-6',
      max_tokens: body.max_tokens || 4000,
      messages: body.messages,
    };
    if (body.system) aReq.system = body.system;
    if (body.tools)  aReq.tools  = body.tools;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(aReq),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[bg] Anthropic error HTTP ' + res.status + ' — ' + JSON.stringify(data).slice(0, 300));
      await patchRow(extractionId, {
        status: 'failed',
        error_type: 'anthropic_http_' + res.status,
        latency_ms: Date.now() - t0,
      });
      return { statusCode: 200, body: 'logged anthropic error' };
    }

    // Success — store the RAW Anthropic JSON envelope in result; the client runs
    // validateBilExtraction on it later (validation stays client-side).
    const wrote = await patchRow(extractionId, {
      status: 'done',
      result: data,
      latency_ms: Date.now() - t0,
    });
    if (!wrote) {
      // Couldn't write the result — at least try to unstick the row so the
      // client's poll surfaces a failure rather than hanging on 'processing'.
      await patchRow(extractionId, { status: 'failed', error_type: 'result_write_failed', latency_ms: Date.now() - t0 });
    }
    console.log('[bg] done ' + extractionId + ' latency_ms=' + (Date.now() - t0) + ' wrote=' + wrote);
    return { statusCode: 200, body: 'done' };

  } catch (err) {
    console.error('[bg] extraction exception ' + (err && err.message));
    await patchRow(extractionId, {
      status: 'failed',
      error_type: 'exception',
      latency_ms: Date.now() - t0,
    });
    return { statusCode: 200, body: 'logged exception' };
  }
};
