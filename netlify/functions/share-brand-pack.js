// Netlify Function: share-brand-pack
// POST { brandPackData: {...}, brandId: string, expiresInDays?: number }
// Returns { shareId, shareUrl }
// Writes to Supabase shared_brand_packs table.
//
// Required env vars (set in Netlify dashboard):
//   SUPABASE_URL      — e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY — service role key (not anon key — needs INSERT)

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY= process.env.SUPABASE_SERVICE_KEY;
const BASE_URL            = process.env.URL || 'https://veyaflow.com'; // set by Netlify automatically

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { brandPackData, brandId, expiresInDays } = body;

  if (!brandPackData || !brandId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'brandPackData and brandId required' }) };
  }

  // Compute expiry timestamp
  let expiresAt = null;
  if (expiresInDays && expiresInDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + expiresInDays);
    expiresAt = d.toISOString();
  }

  // Check if this brandId already has an active share — update it rather than create duplicate
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/shared_brand_packs?brand_id=eq.${encodeURIComponent(brandId)}&active=eq.true&select=id`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const existing = await checkRes.json();

  if (existing && existing.length > 0) {
    // Update existing share
    const existingId = existing[0].id;
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/shared_brand_packs?id=eq.${existingId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          brand_pack_data: brandPackData,
          expires_at: expiresAt,
          active: true,
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!updateRes.ok) {
      const err = await updateRes.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Update failed', detail: err }) };
    }

    const shareUrl = `${BASE_URL}/brand/${existingId}`;
    return { statusCode: 200, headers, body: JSON.stringify({ shareId: existingId, shareUrl }) };
  }

  // Insert new share
  const insertRes = await fetch(
    `${SUPABASE_URL}/rest/v1/shared_brand_packs`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        brand_id: String(brandId),
        brand_pack_data: brandPackData,
        expires_at: expiresAt,
        active: true,
      }),
    }
  );

  if (!insertRes.ok) {
    const err = await insertRes.text();
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Insert failed', detail: err }) };
  }

  const rows = await insertRes.json();
  const row  = Array.isArray(rows) ? rows[0] : rows;
  const shareId  = row.id;
  const shareUrl = `${BASE_URL}/brand/${shareId}`;

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ shareId, shareUrl }),
  };
};
