// ═══════════════════════════════════════════════════
// VeyaFlow — Supabase Proxy
// Netlify function: /.netlify/functions/supabase-proxy
//
// Environment variables required (set in Netlify dashboard):
//   SUPABASE_URL         — e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY — service_role key (never anon key)
//   SUPABASE_ANON_KEY    — anon key (used for auth endpoints only)
//
// Brand-side actions:
//   brand.load, brand.save
//   crm.load, crm.upsert, crm.delete
//   listing.submit, listing.list
//   field.load, field.set
//
// Retailer Portal actions:
//   portal.auth.login       — email+password → access_token + retailer info
//   portal.auth.verify      — access_token → retailer info (session restore)
//   portal.submission.list  — all submissions for authenticated retailer
//   portal.submission.get   — single submission (retailer-scoped)
//   portal.status.update    — update submission status + log change
//   portal.rejection.create — reject submission with structured reason
// ═══════════════════════════════════════════════════

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY;

// Simple Supabase REST helper — uses service_role, bypasses RLS
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

// ── Portal auth verification ─────────────────────
// Verifies an access_token via Supabase Auth and resolves the retailer_account.
// Throws with .code = 401 (bad/expired token) or 403 (no active retailer account).
async function verifyPortalAuth(accessToken) {
  if (!accessToken) {
    const err = new Error('Not authenticated');
    err.code = 401;
    throw err;
  }
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  if (!userRes.ok) {
    const err = new Error('Invalid or expired token');
    err.code = 401;
    throw err;
  }
  const user = await userRes.json();
  if (!user || !user.email) {
    const err = new Error('Invalid user');
    err.code = 401;
    throw err;
  }
  const accounts = await supabase('GET', `retailer_accounts?contact_email=eq.${encodeURIComponent(user.email)}&active=eq.true&limit=1`);
  if (!accounts.length) {
    const err = new Error('No active retailer account for this user');
    err.code = 403;
    throw err;
  }
  return {
    email: user.email,
    authUserId: user.id,
    retailerId: accounts[0].retailer_id,
    retailerName: accounts[0].retailer_name,
    role: accounts[0].role,
    accountId: accounts[0].id,
  };
}

// ── Submission row mapper ────────────────────────
// DB row (snake_case + jsonb) → portal.html client shape (camelCase, flattened).
function mapSubmissionRow(row) {
  const bp = row.brand_pack_data || {};
  return {
    id: row.id,
    brandName: row.brand_name,
    retailerId: row.retailer_id,
    readinessScore: row.readiness_score,
    status: row.status,
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    brandSessionId: row.brand_session_id,
    category: bp.category || '',
    homeMarket: bp.homeMarket || '',
    targetMarket: bp.targetMarket || '',
    readinessDimensions: bp.readinessDimensions || {},
    claims: bp.claims || [],
    notes: bp.notes || '',
    verified: bp.verified === true,
    verifiedTier: bp.verifiedTier || '',
    articleTemplate: bp.articleTemplate || {},
    rejectionReason: bp.rejectionReason || null,
    skus: row.sku_data || [],
  };
}

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

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { action, session_id, data, accessToken } = payload;

  try {

    // ── Brand ─────────────────────────────────────

    if (action === 'brand.load') {
      const rows = await supabase('GET', `brands?session_id=eq.${encodeURIComponent(session_id)}&limit=1`);
      return { statusCode: 200, headers, body: JSON.stringify({ brand: rows[0]?.data || null }) };
    }

    if (action === 'brand.save') {
      await supabase('POST', 'brands?on_conflict=session_id', {
        session_id,
        data,
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    // ── Sourcing CRM ──────────────────────────────

    if (action === 'crm.load') {
      const rows = await supabase('GET', `sourcing_crm?session_id=eq.${encodeURIComponent(session_id)}&order=created_at.desc`);
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
      if (entry.id && String(entry.id).includes('-')) {
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

    // ═══════════════════════════════════════════════
    // ── Retailer Portal ──────────────────────────
    // ═══════════════════════════════════════════════

    if (action === 'portal.auth.login') {
      const { email, password } = payload;
      if (!email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password required' }) };
      }
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const authData = await res.json();
      if (!res.ok || !authData.access_token) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid email or password' }) };
      }
      const accounts = await supabase('GET', `retailer_accounts?contact_email=eq.${encodeURIComponent(email)}&active=eq.true&limit=1`);
      if (!accounts.length) {
        return { statusCode: 403, headers, body: JSON.stringify({ error: 'No active retailer account for this email. Contact VeyaFlow admin.' }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_in: authData.expires_in,
        retailer: {
          email,
          retailerId: accounts[0].retailer_id,
          retailerName: accounts[0].retailer_name,
          role: accounts[0].role,
          accountId: accounts[0].id,
        },
      })};
    }

    if (action === 'portal.auth.verify') {
      const ctx = await verifyPortalAuth(accessToken);
      return { statusCode: 200, headers, body: JSON.stringify({
        retailer: {
          email: ctx.email,
          retailerId: ctx.retailerId,
          retailerName: ctx.retailerName,
          role: ctx.role,
          accountId: ctx.accountId,
        },
      })};
    }

    if (action === 'portal.submission.list') {
      const ctx = await verifyPortalAuth(accessToken);
      const rows = await supabase('GET', `portal_submissions?retailer_id=eq.${encodeURIComponent(ctx.retailerId)}&order=submitted_at.desc`);
      return { statusCode: 200, headers, body: JSON.stringify({ submissions: rows.map(mapSubmissionRow) }) };
    }

    if (action === 'portal.submission.get') {
      const ctx = await verifyPortalAuth(accessToken);
      const id = payload.id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) };
      const rows = await supabase('GET', `portal_submissions?id=eq.${encodeURIComponent(id)}&retailer_id=eq.${encodeURIComponent(ctx.retailerId)}&limit=1`);
      if (!rows.length) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Submission not found' }) };
      return { statusCode: 200, headers, body: JSON.stringify({ submission: mapSubmissionRow(rows[0]) }) };
    }

    if (action === 'portal.status.update') {
      const ctx = await verifyPortalAuth(accessToken);
      const { id, newStatus, note } = payload;
      if (!id || !newStatus) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id and newStatus required' }) };
      const existing = await supabase('GET', `portal_submissions?id=eq.${encodeURIComponent(id)}&retailer_id=eq.${encodeURIComponent(ctx.retailerId)}&limit=1`);
      if (!existing.length) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Submission not found' }) };
      const oldStatus = existing[0].status;
      const updated = await supabase('PATCH', `portal_submissions?id=eq.${encodeURIComponent(id)}`, {
        status: newStatus,
      });
      await supabase('POST', 'submission_status_log', {
        submission_id: id,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: ctx.email,
        note: note || '',
      });
      return { statusCode: 200, headers, body: JSON.stringify({
        ok: true,
        submission: mapSubmissionRow(updated[0]),
      })};
    }

    if (action === 'portal.rejection.create') {
      const ctx = await verifyPortalAuth(accessToken);
      const { id, reasonCategory, reasonDetail, internalNote } = payload;
      if (!id || !reasonCategory) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id and reasonCategory required' }) };
      const existing = await supabase('GET', `portal_submissions?id=eq.${encodeURIComponent(id)}&retailer_id=eq.${encodeURIComponent(ctx.retailerId)}&limit=1`);
      if (!existing.length) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Submission not found' }) };
      const oldStatus = existing[0].status;
      const existingPack = existing[0].brand_pack_data || {};
      const newPack = Object.assign({}, existingPack, { rejectionReason: {
        category: reasonCategory,
        detail: reasonDetail || '',
      }});
      const updated = await supabase('PATCH', `portal_submissions?id=eq.${encodeURIComponent(id)}`, {
        status: 'rejected',
        brand_pack_data: newPack,
      });
      await supabase('POST', 'submission_status_log', {
        submission_id: id,
        old_status: oldStatus,
        new_status: 'rejected',
        changed_by: ctx.email,
        note: reasonDetail || '',
      });
      await supabase('POST', 'rejection_reasons', {
        submission_id: id,
        retailer_id: ctx.retailerId,
        reason_category: reasonCategory,
        reason_detail: reasonDetail || '',
        internal_note: internalNote || '',
      });
      return { statusCode: 200, headers, body: JSON.stringify({
        ok: true,
        submission: mapSubmissionRow(updated[0]),
      })};
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: `Unknown action: ${action}` }) };

  } catch (err) {
    console.error('supabase-proxy error:', err.message);
    const code = (err.code && Number.isInteger(err.code)) ? err.code : 500;
    return {
      statusCode: code,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
