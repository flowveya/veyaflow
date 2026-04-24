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

// ─── Auth helpers (for Retailer Portal) ──────────────
// The auth endpoints use a different base path (/auth/v1/) and the anon key
// in the apikey header. The user's access_token goes in the Authorization
// header for user-scoped endpoints like /user.

async function supabaseAuthPost(pathWithQuery, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${pathWithQuery}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    const err = new Error(`Supabase Auth ${res.status}: ${JSON.stringify(data)}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function supabaseAuthGetUser(accessToken) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    const err = new Error(`Supabase Auth ${res.status}: ${JSON.stringify(data)}`);
    err.status = res.status;
    err.code = res.status === 401 ? 'TOKEN_EXPIRED' : 'AUTH_FAILED';
    throw err;
  }
  return data;
}

// Given an access_token, resolve the caller's retailer_account row.
// Every portal action calls this first — retailer_id is never trusted
// from the client, it's derived from the authenticated email.
async function verifyTokenAndGetRetailer(accessToken) {
  if (!accessToken) {
    const err = new Error('Missing access_token');
    err.code = 'NO_TOKEN';
    throw err;
  }
  const user = await supabaseAuthGetUser(accessToken);
  const email = user && user.email;
  if (!email) {
    const err = new Error('Authenticated user has no email');
    err.code = 'NO_EMAIL';
    throw err;
  }
  const rows = await supabase(
    'GET',
    `retailer_accounts?contact_email=eq.${encodeURIComponent(email)}&active=eq.true&limit=1`
  );
  if (!rows.length) {
    const err = new Error('No active retailer account for this email');
    err.code = 'NO_RETAILER_ACCOUNT';
    throw err;
  }
  const a = rows[0];
  return {
    account_id:    a.id,
    retailer_id:   a.retailer_id,
    retailer_name: a.retailer_name,
    contact_name:  a.contact_name,
    contact_email: a.contact_email,
    role:          a.role,
    user_id:       user.id,
  };
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

  const { action, session_id, data, access_token } = payload;

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

    // ── Retailer Portal — Auth ────────────────────
    // Login flow:
    //   portal → action=portal.auth.login with {email, password}
    //   ← returns {access_token, refresh_token, expires_at, retailer}
    // Portal stores tokens in localStorage; every later call sends access_token.
    // On 401 w/ TOKEN_EXPIRED, portal calls portal.auth.refresh with refresh_token.

    if (action === 'portal.auth.login') {
      const email    = data && data.email;
      const password = data && data.password;
      if (!email || !password) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email and password required' }) };
      }
      try {
        const tok = await supabaseAuthPost('token?grant_type=password', { email, password });
        const retailer = await verifyTokenAndGetRetailer(tok.access_token);
        return {
          statusCode: 200, headers,
          body: JSON.stringify({
            ok: true,
            access_token:  tok.access_token,
            refresh_token: tok.refresh_token,
            expires_at:    tok.expires_at,
            retailer,
          }),
        };
      } catch (err) {
        if (err.code === 'NO_RETAILER_ACCOUNT') {
          return { statusCode: 403, headers, body: JSON.stringify({ error: 'This account has no active retailer access. Contact VeyaFlow admin.', code: 'NO_RETAILER_ACCOUNT' }) };
        }
        // Bad credentials come back as 400 from Supabase Auth
        if (err.status === 400) {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' }) };
        }
        throw err;
      }
    }

    if (action === 'portal.auth.verify') {
      try {
        const retailer = await verifyTokenAndGetRetailer(access_token);
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, retailer }) };
      } catch (err) {
        if (err.code === 'TOKEN_EXPIRED') {
          return { statusCode: 401, headers, body: JSON.stringify({ error: 'Session expired', code: 'TOKEN_EXPIRED' }) };
        }
        if (err.code === 'NO_RETAILER_ACCOUNT') {
          return { statusCode: 403, headers, body: JSON.stringify({ error: 'Retailer access revoked', code: 'NO_RETAILER_ACCOUNT' }) };
        }
        return { statusCode: 401, headers, body: JSON.stringify({ error: err.message || 'Invalid session' }) };
      }
    }

    if (action === 'portal.auth.refresh') {
      const refresh_token = data && data.refresh_token;
      if (!refresh_token) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'refresh_token required' }) };
      }
      try {
        const tok = await supabaseAuthPost('token?grant_type=refresh_token', { refresh_token });
        const retailer = await verifyTokenAndGetRetailer(tok.access_token);
        return {
          statusCode: 200, headers,
          body: JSON.stringify({
            ok: true,
            access_token:  tok.access_token,
            refresh_token: tok.refresh_token,
            expires_at:    tok.expires_at,
            retailer,
          }),
        };
      } catch (err) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Refresh failed', code: 'REFRESH_FAILED' }) };
      }
    }

    // ── Retailer Portal — Submissions ─────────────
    // Every action re-verifies the token and derives retailer_id server-side.
    // The client never sends retailer_id — prevents cross-tenant leakage.

    if (action === 'portal.submission.list') {
      const retailer = await verifyTokenAndGetRetailer(access_token);
      const rows = await supabase(
        'GET',
        `portal_submissions?retailer_id=eq.${encodeURIComponent(retailer.retailer_id)}&order=submitted_at.desc`
      );
      return { statusCode: 200, headers, body: JSON.stringify({ submissions: rows, retailer }) };
    }

    if (action === 'portal.submission.get') {
      const retailer = await verifyTokenAndGetRetailer(access_token);
      const id = data && data.id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) };
      const rows = await supabase(
        'GET',
        `portal_submissions?id=eq.${encodeURIComponent(id)}&retailer_id=eq.${encodeURIComponent(retailer.retailer_id)}&limit=1`
      );
      if (!rows.length) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Submission not found' }) };
      }
      // Also load rejection reason if status is rejected (for detail view)
      let rejection = null;
      if (rows[0].status === 'rejected') {
        const rj = await supabase(
          'GET',
          `rejection_reasons?submission_id=eq.${encodeURIComponent(id)}&order=created_at.desc&limit=1`
        );
        rejection = rj[0] || null;
      }
      return { statusCode: 200, headers, body: JSON.stringify({ submission: rows[0], rejection }) };
    }

    if (action === 'portal.status.update') {
      const retailer = await verifyTokenAndGetRetailer(access_token);
      const id         = data && data.id;
      const new_status = data && data.new_status;
      const note       = (data && data.note) || '';
      if (!id || !new_status) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'id and new_status required' }) };
      }
      // Verify ownership + fetch current status for log
      const cur = await supabase(
        'GET',
        `portal_submissions?id=eq.${encodeURIComponent(id)}&retailer_id=eq.${encodeURIComponent(retailer.retailer_id)}&limit=1`
      );
      if (!cur.length) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Submission not found' }) };
      }
      const oldStatus = cur[0].status;
      if (oldStatus === new_status) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, unchanged: true }) };
      }
      await supabase('PATCH', `portal_submissions?id=eq.${encodeURIComponent(id)}`, { status: new_status });
      await supabase('POST', 'submission_status_log', {
        submission_id: id,
        old_status:    oldStatus,
        new_status,
        changed_by:    retailer.contact_email,
        note,
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (action === 'portal.rejection.create') {
      const retailer = await verifyTokenAndGetRetailer(access_token);
      const submission_id   = data && data.submission_id;
      const reason_category = (data && data.reason_category) || 'other';
      const reason_detail   = (data && data.reason_detail)   || '';
      const internal_note   = (data && data.internal_note)   || '';
      if (!submission_id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'submission_id required' }) };
      }
      // Verify ownership
      const cur = await supabase(
        'GET',
        `portal_submissions?id=eq.${encodeURIComponent(submission_id)}&retailer_id=eq.${encodeURIComponent(retailer.retailer_id)}&limit=1`
      );
      if (!cur.length) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Submission not found' }) };
      }
      const oldStatus = cur[0].status;
      // Write rejection reason, then flip status, then log
      await supabase('POST', 'rejection_reasons', {
        submission_id,
        retailer_id:     retailer.retailer_id,
        reason_category,
        reason_detail,
        internal_note,
      });
      await supabase('PATCH', `portal_submissions?id=eq.${encodeURIComponent(submission_id)}`, { status: 'rejected' });
      await supabase('POST', 'submission_status_log', {
        submission_id,
        old_status: oldStatus,
        new_status: 'rejected',
        changed_by: retailer.contact_email,
        note:       reason_detail,
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
