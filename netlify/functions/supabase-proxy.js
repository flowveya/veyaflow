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

// Simple Supabase REST helper — uses service_role, bypasses RLS.
// When the path contains 'on_conflict=', PostgREST needs the
// 'resolution=merge-duplicates' Prefer header to actually upsert
// (otherwise duplicates throw 409). Detect and add automatically.
async function supabase(method, path, body) {
  const isUpsert = method === 'POST' && /[?&]on_conflict=/.test(path);
  const preferHeader = isUpsert
    ? 'return=representation,resolution=merge-duplicates'
    : 'return=representation';
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': preferHeader,
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

    // ─── Brand → Portal bridge ───────────────────
    // These actions are called by the BRAND side, not the retailer portal.
    // Auth is via session_id (the brand's localStorage identifier) — matches
    // existing brand.save / crm.upsert pattern. No access_token required.

    // Brand submits its Brand Pack to a retailer's portal inbox
    if (action === 'portal.submission.create') {
      if (!session_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required' }) };
      const { retailerId, brandName, readinessScore, brandPack, skus } = payload;
      if (!retailerId || !brandName) return { statusCode: 400, headers, body: JSON.stringify({ error: 'retailerId and brandName required' }) };

      // Verify the retailer exists in retailer_accounts — otherwise submission would be orphan
      const accounts = await supabase('GET', `retailer_accounts?retailer_id=eq.${encodeURIComponent(retailerId)}&active=eq.true&limit=1`);
      if (!accounts.length) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Retailer not on VeyaFlow portal yet' }) };
      }

      const inserted = await supabase('POST', 'portal_submissions', {
        brand_session_id: session_id,
        brand_name: brandName,
        retailer_id: retailerId,
        readiness_score: readinessScore || null,
        brand_pack_data: brandPack || {},
        sku_data: skus || [],
        status: 'received',
      });
      // Initial status log entry — so the brand can see "Received by Matas" in their own polling
      if (inserted.length) {
        await supabase('POST', 'submission_status_log', {
          submission_id: inserted[0].id,
          old_status: null,
          new_status: 'received',
          changed_by: session_id,
          note: 'Brand submission created via VeyaFlow',
        });
      }
      return { statusCode: 200, headers, body: JSON.stringify({
        ok: true,
        submission: inserted.length ? mapSubmissionRow(inserted[0]) : null,
      })};
    }

    // Brand polls for status changes on its submissions since a given timestamp.
    // Returns: current submissions + any status_log entries since `since`.
    if (action === 'portal.status.sync') {
      if (!session_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required' }) };
      // Default to 24h ago if no `since` — caps payload size on first sync
      const since = payload.since || new Date(Date.now() - 86400000).toISOString();
      const subs = await supabase('GET', `portal_submissions?brand_session_id=eq.${encodeURIComponent(session_id)}&order=submitted_at.desc`);
      if (!subs.length) {
        return { statusCode: 200, headers, body: JSON.stringify({
          submissions: [],
          changes: [],
          lastChecked: new Date().toISOString(),
        })};
      }
      // Fetch log entries for these submission ids since the cutoff
      const subIds = subs.map(s => s.id).map(id => encodeURIComponent(id));
      const subIdList = subIds.join(',');
      const logs = await supabase('GET', `submission_status_log?submission_id=in.(${subIdList})&changed_at=gt.${encodeURIComponent(since)}&order=changed_at.desc&limit=50`);
      // Lookup retailer names once so client doesn't have to guess
      const retailerIds = Array.from(new Set(subs.map(s => s.retailer_id)));
      let retailerMap = {};
      if (retailerIds.length) {
        const retailerIdList = retailerIds.map(r => `"${r}"`).join(',');
        const retailers = await supabase('GET', `retailer_accounts?retailer_id=in.(${retailerIdList})&select=retailer_id,retailer_name`);
        retailers.forEach(r => { retailerMap[r.retailer_id] = r.retailer_name; });
      }
      return { statusCode: 200, headers, body: JSON.stringify({
        submissions: subs.map(mapSubmissionRow),
        changes: logs.map(l => ({
          id: l.id,
          submissionId: l.submission_id,
          oldStatus: l.old_status,
          newStatus: l.new_status,
          changedBy: l.changed_by,
          note: l.note,
          changedAt: l.changed_at,
          retailerName: retailerMap[subs.find(s => s.id === l.submission_id)?.retailer_id] || null,
        })),
        retailerNames: retailerMap,
        lastChecked: new Date().toISOString(),
      })};
    }

    // ═══════════════════════════════════════════════
    // ── Feedback Loop Engine (Phase 1) ──────────
    // ═══════════════════════════════════════════════
    //
    // All three actions use session_id auth (matches brand-side pattern).
    // No access_token required — these are brand-side only.

    // Idempotent upsert by dedupe_key. If an event with this key already
    // exists, return it untouched (isNew=false). Otherwise insert (isNew=true).
    if (action === 'loop.upsert') {
      if (!session_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required' }) };
      const ev = payload.event || {};
      if (!ev.dedupe_key || !ev.trigger_type || !ev.severity) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'event.dedupe_key, trigger_type, severity required' }) };
      }
      const existing = await supabase('GET', `loop_events?dedupe_key=eq.${encodeURIComponent(ev.dedupe_key)}&limit=1`);
      if (existing.length) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true, isNew: false, event: existing[0] }) };
      }
      const inserted = await supabase('POST', 'loop_events', {
        session_id,
        trigger_type:  ev.trigger_type,
        severity:      ev.severity,
        retailer_id:   ev.retailer_id   || null,
        retailer_name: ev.retailer_name || null,
        sku_id:        ev.sku_id        || null,
        sku_name:      ev.sku_name      || null,
        market:        ev.market        || null,
        context:       ev.context       || {},
        dedupe_key:    ev.dedupe_key,
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, isNew: true, event: inserted[0] || null }) };
    }

    // Fetch active and recent events for this session.
    // Returns events ordered by created_at DESC, default limit 100.
    if (action === 'loop.list') {
      if (!session_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required' }) };
      const limit = Math.min(parseInt(payload.limit || 100, 10) || 100, 500);
      const rows = await supabase('GET', `loop_events?session_id=eq.${encodeURIComponent(session_id)}&order=created_at.desc&limit=${limit}`);
      return { statusCode: 200, headers, body: JSON.stringify({ events: rows }) };
    }

    // Update a single event's mutable fields (accept/dismiss/resolve/drafted_content).
    // Only whitelisted fields can be updated; everything else is ignored.
    if (action === 'loop.update') {
      if (!session_id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'session_id required' }) };
      const id = payload.id;
      const updates = payload.updates || {};
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'id required' }) };

      // Verify ownership before update — session_id guard prevents cross-session writes
      const existing = await supabase('GET', `loop_events?id=eq.${encodeURIComponent(id)}&session_id=eq.${encodeURIComponent(session_id)}&limit=1`);
      if (!existing.length) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Event not found' }) };

      const allowed = {};
      const now = new Date().toISOString();
      if (updates.accepted === true)        { allowed.accepted = true;  allowed.accepted_at = now; }
      if (updates.dismissed === true)       { allowed.dismissed = true; allowed.dismissed_at = now; }
      if (updates.resolved === true)        { allowed.resolved = true;  allowed.resolved_at = now; }
      if (typeof updates.drafted_content === 'string') {
        allowed.drafted_content = updates.drafted_content;
        allowed.drafted_at      = now;
      }
      if (Object.keys(allowed).length === 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'No valid fields to update' }) };
      }

      const updated = await supabase('PATCH', `loop_events?id=eq.${encodeURIComponent(id)}&session_id=eq.${encodeURIComponent(session_id)}`, allowed);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, event: updated[0] || null }) };
    }

    // ── Category waitlist (Round-1 beauty foundation) ──────────────────
    // Captures emails for soft-blocked categories (Fashion & Apparel, Food &
    // Beverage) and free-text product-type suggestions from My Products. No
    // session_id required — onboarding may submit before a session is set.
    if (action === 'waitlist.create') {
      const email = (data && data.email || '').trim().toLowerCase();
      const category = (data && data.category || '').trim();
      const source = (data && data.source || 'onboarding').trim();
      const brandName = (data && data.brandName || '').trim() || null;
      // Basic format check — proxy is the last line of defence; the SQL CHECK
      // constraint will reject malformed values too.
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };
      }
      if (!category) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Category required' }) };
      }
      const allowedSources = ['onboarding', 'setup_modal', 'sku_type_feedback'];
      const safeSource = allowedSources.indexOf(source) >= 0 ? source : 'onboarding';
      const inserted = await supabase('POST', 'category_waitlist', {
        email,
        category,
        source: safeSource,
        brand_name: brandName,
        session_id: session_id || null,
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, entry: inserted[0] || null }) };
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
