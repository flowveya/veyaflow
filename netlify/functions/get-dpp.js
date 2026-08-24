// ════════════════════════════════════════════════════════════════════════
// VeyaFlow get-dpp Netlify Function
// ════════════════════════════════════════════════════════════════════════
// Path:    /.netlify/functions/get-dpp?id=vf-xxxxx
// Method:  GET
// Returns: { payload, publishedAt, updatedAt, version, brandId, skuId }
//          or 404 { error: 'not_found' }
//
// Reads via SUPABASE_ANON_KEY through the dpp_public_read RLS policy.
// Format guard on dppId before query (rejects malformed IDs without hitting DB).
// ════════════════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const DPP_ID_REGEX = /^vf-[a-z0-9-]+$/;

function jsonResponse(statusCode, body, cacheable = false) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      // DPP data is intentionally cacheable for short windows. Re-publishes
      // are rare and consumers can tolerate a few minutes' stale read.
      // Cap at 60s to keep regulator scans current after a re-publish.
      'Cache-Control': cacheable ? 'public, max-age=60' : 'no-store',
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  // ── Method guard
  if (event.httpMethod !== 'GET') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  // ── Env guard
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return jsonResponse(500, { error: 'server_config_missing' });
  }

  // ── Extract + validate ID
  const dppId = (event.queryStringParameters || {}).id;
  if (!dppId) {
    return jsonResponse(400, { error: 'missing_id' });
  }
  if (!DPP_ID_REGEX.test(dppId)) {
    return jsonResponse(400, { error: 'invalid_id_format' });
  }

  // ── Supabase read ──────────────────────────────────────────────────────
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('dpp_records')
    .select('dpp_id, brand_id, sku_id, payload, published_at, updated_at, version')
    .eq('dpp_id', dppId)
    .maybeSingle();

  if (error) {
    return jsonResponse(500, { error: 'read_failed', detail: error.message });
  }

  if (!data) {
    return jsonResponse(404, {
      error: 'not_found',
      message: 'This product passport does not exist or has been removed.',
    });
  }

  // ── Success ────────────────────────────────────────────────────────────
  return jsonResponse(200, {
    dppId: data.dpp_id,
    brandId: data.brand_id,
    skuId: data.sku_id,
    payload: data.payload,
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
    version: data.version,
  }, /* cacheable */ true);
};
