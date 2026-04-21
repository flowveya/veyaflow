// Netlify Function: get-brand-pack
// GET /.netlify/functions/get-brand-pack?id=<shareId>
// Returns brand pack data or 404 if not found / inactive / expired.
//
// Required env vars:
//   SUPABASE_URL
//   SUPABASE_ANON_KEY  — anon key is fine for public read (RLS must allow SELECT on active=true)

const SUPABASE_URL      = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store', // always fresh — pack may have been deactivated
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase not configured' }) };
  }

  const shareId = event.queryStringParameters?.id;
  if (!shareId || !/^[0-9a-f-]{36}$/.test(shareId)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid share ID' }) };
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/shared_brand_packs?id=eq.${shareId}&active=eq.true&select=id,brand_id,brand_pack_data,created_at,expires_at`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    }
  );

  if (!res.ok) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Database error' }) };
  }

  const rows = await res.json();

  if (!rows || rows.length === 0) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Brand Pack not found',
        message: 'This link is no longer active or does not exist.',
      }),
    };
  }

  const row = rows[0];

  // Check expiry
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: 'Brand Pack expired',
        message: 'This Brand Pack link has expired.',
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      shareId:       row.id,
      brandId:       row.brand_id,
      brandPackData: row.brand_pack_data,
      createdAt:     row.created_at,
      expiresAt:     row.expires_at,
    }),
  };
};
