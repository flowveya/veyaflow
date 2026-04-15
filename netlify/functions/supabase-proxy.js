// ═══════════════════════════════════════════════════
// VeyaFlow — Supabase Proxy
// Netlify function: /.netlify/functions/supabase-proxy
//
// Environment variables required (set in Netlify dashboard):
//   SUPABASE_URL      — e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY — service_role key (never anon key)
// ═══════════════════════════════════════════════════

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

// Simple Supabase REST helper — no SDK needed
async function supabase(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
headers: {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'return=representation',
},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

exports.handler = async (event) => {
  // CORS headers
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

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { action, session_id, data } = payload;

  try {

    // ── Brand ─────────────────────────────────────

    if (action === 'brand.load') {
      const rows = await supabase('GET', `brands?session_id=eq.${encodeURIComponent(session_id)}&limit=1`);
      return { statusCode: 200, headers, body: JSON.stringify({ brand: rows[0]?.data || null }) };
    }

    if (action === 'brand.save') {
      // Upsert by session_id
      const rows = await supabase('POST', 'brands?on_conflict=session_id', {
        session_id,
        data,
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ── Sourcing CRM ──────────────────────────────

    if (action === 'crm.load') {
      const rows = await supabase('GET', `sourcing_crm?session_id=eq.${encodeURIComponent(session_id)}&order=created_at.desc`);
      // Map snake_case DB fields back to camelCase for the client
      const mapped = rows.map(r => ({
        id: r.id,
        mfrId: r.mfr_id,
        mfrName: r.mfr_name,
        mfrCountry: r.mfr_country,
        mfrType: r.mfr_type,
        mfrContact: r.mfr_contact,
        mfrWebsite: r.mfr_website,
        status: r.status,
        enquiryDate: r.enquiry_date,
        lastContact: r.last_contact,
        brief: r.brief,
        notes: r.notes,
        feedbackGiven: r.feedback_given,
        feedbackAccurate: r.feedback_accurate,
        inaccuracyReported: r.inaccuracy_reported,
        inaccurateFields: r.inaccurate_fields,
      }));
      return { statusCode: 200, headers, body: JSON.stringify({ entries: mapped }) };
    }

    if (action === 'crm.upsert') {
      const entry = data;
      const row = {
        session_id,
        mfr_id: entry.mfrId,
        mfr_name: entry.mfrName,
        mfr_country: entry.mfrCountry,
        mfr_type: entry.mfrType,
        mfr_contact: entry.mfrContact,
        mfr_website: entry.mfrWebsite,
        status: entry.status,
        enquiry_date: entry.enquiryDate,
        last_contact: entry.lastContact,
        brief: entry.brief,
        notes: entry.notes,
        feedback_given: entry.feedbackGiven,
        feedback_accurate: entry.feedbackAccurate,
        inaccuracy_reported: entry.inaccuracyReported,
        inaccurate_fields: entry.inaccurateFields,
      };
      // If entry has a UUID id, update it; else insert
      if (entry.id && entry.id.includes('-')) {
        await supabase('PATCH', `sourcing_crm?id=eq.${entry.id}`, row);
      } else {
        await supabase('POST', 'sourcing_crm', row);
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'crm.delete') {
      await supabase('DELETE', `sourcing_crm?id=eq.${data.id}`);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ── Listing requests ──────────────────────────

    if (action === 'listing.submit') {
      await supabase('POST', 'listing_requests', {
        company_name: data.companyName,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        country: data.country,
        city: data.city,
        website: data.website,
        specialisms: data.specialisms,
        certifications: data.certifications,
        moq: data.moq,
        status: 'pending_review',
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'listing.list') {
      // Admin only — for Charlotte's review dashboard
      const rows = await supabase('GET', 'listing_requests?order=submitted_at.desc');
      return { statusCode: 200, headers, body: JSON.stringify({ requests: rows }) };
    }

    // ── Supplier field overrides ──────────────────

    if (action === 'field.load') {
      const rows = await supabase('GET', `supplier_field_overrides?mfr_id=eq.${data.mfrId}`);
      return { statusCode: 200, headers, body: JSON.stringify({ overrides: rows }) };
    }

    if (action === 'field.set') {
      await supabase('POST', 'supplier_field_overrides?on_conflict=mfr_id,field_name', {
        mfr_id: data.mfrId,
        field_name: data.fieldName,
        value: String(data.value),
        updated_by: data.updatedBy || 'brand_feedback',
        confidence: 'HIGH',
        last_updated: new Date().toISOString(),
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };

  } catch (err) {
    console.error('supabase-proxy error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
