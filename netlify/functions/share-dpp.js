// ════════════════════════════════════════════════════════════════════════
// VeyaFlow share-dpp Netlify Function
// ════════════════════════════════════════════════════════════════════════
// Path:    /.netlify/functions/share-dpp
// Method:  POST
// Body:    { dppId, brandId, skuId, dppPayload }
// Returns: { shareId, shareUrl, version, published }
//
// Architecture: UPSERT by client-provided dpp_id (PRIMARY KEY).
//   - First publish: INSERT, version = 1
//   - Re-publish: UPDATE, version increments via trigger
//   - URL stays stable across re-publishes (critical for physical packaging QRs)
//
// Server-side guardrail: Payload is filtered through DPP_PUBLIC_FIELDS allowlist
// + conditional gating BEFORE write. Even if client sends commercial-sensitive
// data, only allowlisted fields land in Supabase. Belt-and-suspenders alongside
// client-side filtering in saveDPP().
// ════════════════════════════════════════════════════════════════════════

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ─── Allowlist + gating (mirrors index.html DPP_PUBLIC_FIELDS) ──────────
// Server-side replica. If you update one, update both.
const DPP_PUBLIC_FIELDS = {
  identity:       ['name', 'ean', 'productType', 'netContent', 'netUnit'],
  composition:    ['inci', 'materialComposition', 'ingredientList'],
  origin:         ['countryOfMfr'],
  regulatory:     ['cpnp', 'cpnpStatus', 'ceMarking', 'novelFoodStatus'],
  certifications: ['certifications'],
  environmental:  ['carbonKg', 'carbonEstimated', 'recycledProduct',
                   'recyclability', 'takeback'],
};

const DPP_CONDITIONAL_GATING = {
  cpnp:            (p) => !!p.cpnp && (p.cpnpStatus === 'active' || !p.cpnpStatus),
  ceMarking:       (p) => p.productType === 'device',
  novelFoodStatus: (p) => ['supplement', 'food'].includes(p.productType),
  certifications:  (p) => Array.isArray(p.certifications) && p.certifications.length > 0,
  takeback:        () => true,
};

// Format guard: dppId must match the in-app format vf-{skuId}-{ts}
const DPP_ID_REGEX = /^vf-[a-z0-9-]+$/;
const MAX_PAYLOAD_BYTES = 50 * 1024;   // 50 KB cap — generous for DPP data
const MAX_BRAND_ID_LEN = 200;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

// ─── Server-side allowlist filter ────────────────────────────────────────
// Takes a flat object of merged SKU + dpp.fields. Returns sectioned object
// containing only allowlisted fields, with gated fields removed when their
// gate function returns false.
function filterPayload(input) {
  const filtered = {};
  for (const [section, fields] of Object.entries(DPP_PUBLIC_FIELDS)) {
    const sectionData = {};
    for (const field of fields) {
      if (input[field] === undefined || input[field] === null || input[field] === '') {
        continue;
      }
      // Apply gating if a rule exists for this field
      const gate = DPP_CONDITIONAL_GATING[field];
      if (gate && !gate(input)) {
        continue;
      }
      sectionData[field] = input[field];
    }
    // Only include the section if it has at least one field
    if (Object.keys(sectionData).length > 0) {
      filtered[section] = sectionData;
    }
  }
  return filtered;
}

exports.handler = async (event) => {
  // ── Method guard
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'method_not_allowed' });
  }

  // ── Env guard
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return jsonResponse(500, { error: 'server_config_missing' });
  }

  // ── Body parse
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return jsonResponse(400, { error: 'invalid_json' });
  }

  // ── Required fields
  const { dppId, brandId, skuId, dppPayload } = body;
  if (!dppId || typeof dppId !== 'string') {
    return jsonResponse(400, { error: 'missing_dpp_id' });
  }
  if (!brandId || typeof brandId !== 'string') {
    return jsonResponse(400, { error: 'missing_brand_id' });
  }
  if (!dppPayload || typeof dppPayload !== 'object') {
    return jsonResponse(400, { error: 'missing_dpp_payload' });
  }

  // ── Format guards
  if (!DPP_ID_REGEX.test(dppId)) {
    return jsonResponse(400, { error: 'invalid_dpp_id_format' });
  }
  if (brandId.length > MAX_BRAND_ID_LEN) {
    return jsonResponse(400, { error: 'brand_id_too_long' });
  }
  const payloadBytes = Buffer.byteLength(JSON.stringify(dppPayload), 'utf8');
  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    return jsonResponse(400, { error: 'payload_too_large', limit: MAX_PAYLOAD_BYTES });
  }

  // ── Allowlist filter (server-side guardrail) ───────────────────────────
  const filteredPayload = filterPayload(dppPayload);

  // Reject if filter produced an empty payload (no allowlisted fields present)
  if (Object.keys(filteredPayload).length === 0) {
    return jsonResponse(400, { error: 'payload_empty_after_filter' });
  }

  // ── Supabase UPSERT ────────────────────────────────────────────────────
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false },
  });

  // Determine if row exists (so we can return correct version + preserve published_at semantics)
  const { data: existing, error: lookupErr } = await supabase
    .from('dpp_records')
    .select('version')
    .eq('dpp_id', dppId)
    .maybeSingle();

  if (lookupErr) {
    return jsonResponse(500, { error: 'lookup_failed', detail: lookupErr.message });
  }

  const isNew = !existing;

  // Build the row. On UPSERT-update, the BEFORE UPDATE trigger handles
  // version increment + updated_at + published_at preservation.
  const row = {
    dpp_id: dppId,
    brand_id: brandId,
    sku_id: skuId || null,
    payload: filteredPayload,
  };

  const { data: upserted, error: upsertErr } = await supabase
    .from('dpp_records')
    .upsert(row, { onConflict: 'dpp_id' })
    .select('dpp_id, version, published_at, updated_at')
    .single();

  if (upsertErr) {
    return jsonResponse(500, { error: 'write_failed', detail: upsertErr.message });
  }

  // ── Success ────────────────────────────────────────────────────────────
  const origin = event.headers.host
    ? `https://${event.headers.host}`
    : 'https://veyaflow.netlify.app';

  return jsonResponse(200, {
    shareId: upserted.dpp_id,
    shareUrl: `${origin}/dpp/${upserted.dpp_id}`,
    version: upserted.version,
    published: isNew ? upserted.published_at : upserted.updated_at,
    isNew,
  });
};
