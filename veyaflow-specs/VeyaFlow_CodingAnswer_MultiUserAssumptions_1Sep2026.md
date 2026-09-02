# VeyaFlow — coding-lane answer: does the code already assume "one login = one brand"?

**1 September 2026 · answering Strategy's open question on the role-based multi-user ruling**

**No development started. This is a scout report, verified against `index.html` at commit 9e944fb (+ batch #6 in the working tree) and `netlify/functions/supabase-proxy.js` at `78c4f6a2…`.**

---

## The short answer

**No — and for a reason that changes the shape of the problem.**

There is no "one login = one brand" assumption in the code, because **on the brand side there is no login at all.** Nothing to unpick, no wrong auth model entrenched. The role model can be introduced additively rather than by rewriting something that assumed otherwise.

**But there is a different assumption, and it is the expensive one:**

> **One browser = one tenant.** Server-side brand data is keyed by `session_id` — a string the browser generates for itself and keeps in localStorage.

Strategy's requirement is safe. The migration cost sits somewhere else than expected, and one decision that costs nothing today gets expensive if it is made wrong before accounts exist.

---

## What the bytes show

### 1. The server tenancy key is a browser-generated string

```js
function getSessionId(){
  var sid = localStorage.getItem('ns_session_id');
  if(!sid){ sid = 'sess_'+Date.now()+'_'+Math.random().toString(36).slice(2,9); persistCritical('ns_session_id', sid); }
  return sid;
}
```

Every server call sends it:

```js
body: JSON.stringify({ action, session_id: getSessionId(), data })
```

And the proxy uses it directly as the ownership filter — its own comment says so (L406):

```js
// Auth is via session_id (the brand's localStorage identifier)
```

```js
brands?session_id=eq.<session_id>
portal_submissions?brand_session_id=eq.<session_id>
sourcing_crm?session_id=eq.<session_id>
loop_events?session_id=eq.<session_id>
```

**Three consequences worth stating plainly:**

- **It is an identifier, not authentication.** Anyone able to send that string to the proxy receives that brand's server data. Guessing it is impractical, but it is a bearer value with no expiry and no revocation.
- **Clearing site data destroys the link to server-side rows.** The brand's own submissions still exist in Supabase, owned by a string nobody holds any more. This compounds the durability gap already in the launch assessment — that one was about `ns_skus` having no mirror; this is about the mirror existing but becoming unreachable.
- **It has no owner.** Not a person, not an account, not an email.

### 2. Every localStorage store is implicitly single-brand

Roughly forty `ns_*` keys — `ns_brand`, `ns_skus`, `ns_crm`, `ns_dpp`, `ns_retail_submissions`, `ns_retail_checklist` and the rest. **Not one is namespaced by brand.** `brand` is a single global object (`let brand = null;`), `skus` a single array. `dppData` is keyed by SKU id; `retailChecklistState` by `retailerId::skuId`. No brand dimension anywhere.

This is not a defect today — it is exactly right for a device-local single-brand pilot, and it is why Strategy's device-local ruling holds. It does mean a partner holding twelve brands cannot be served by this storage model at all. That is a rewrite of the persistence layer, not a parameter change.

### 3. Brand identity is derived from the display name

```js
const brandId = brand?.name
  ? brand.name.toLowerCase().replace(/[^a-z0-9]/g,'_') + '_' + (getSessionId()||'sess')
  : (getSessionId()||'anonymous');
```

Used for magic-link Brand Packs and published DPPs. So a brand's identity is **its typed name plus its browser's session string**. Rename the brand and the id changes. Two brands with the same name are distinguished only by which browser they used.

**This is the cheapest thing to fix and the most expensive to leave.** A stable brand id, generated once and stored, costs almost nothing now. Retrofitting one after packs and passports have been published under name-derived ids means either breaking published URLs or maintaining a translation table forever — and DPP URLs are **printed on physical packaging**.

### 4. The event substrate is already ahead of the application

```js
// createOutcomeRecord requires brandId, retailerId, outcomeType
// createAuditRecord requires brandId and retailerId
```

`brandId` is a required primitive in the outcome/audit record layer. **That layer is already brand-addressable in the way the role model needs.** The application state around it is not. Whoever designed that substrate anticipated this; it is the part that will need least rework.

---

## One correction to the ruling's point 1

> *"De 13 RLS-tabellerna som saknar policyer ska skrivas med rollmodellen i huvudet, inte enbart 'brand'."*

**The intent is right; the action is not yet possible, and it is worth knowing why before it is scheduled.**

An RLS policy for brand data has to test something about the caller. Today there is nothing to test: brand-side calls arrive through the proxy under the **service role**, which bypasses RLS entirely, carrying a `session_id` in the request body rather than a verified identity. A policy written against `auth.uid()` would match nothing, because no brand user exists to have a uid. A policy written against `session_id` would encode the browser-as-tenant assumption we are trying not to entrench.

**So those thirteen policies cannot be meaningfully authored ahead of accounts** — they would be written against an identity that does not exist. Attempting it now produces either dead policies or the wrong model made durable.

**What CAN be done ahead of time, cheaply, and should be:**

1. **Give brands a stable id now** — generated once, persisted, independent of name and of `session_id`. Then published DPP and Brand Pack URLs stay valid across the account migration. This is the single highest-leverage pre-decision.
2. **Keep `brandId` as a required field wherever new server rows are written**, as the outcome/audit layer already does. A row that knows which brand it belongs to can be re-associated with an account later. A row that only knows a browser string cannot.
3. **Treat access as a relation from the start.** Strategy's delegated-access point is right and its implication is a schema one: a `(account, brand, state)` relation, never an owner field on the brand. Nothing in the current code contradicts this because nothing currently expresses ownership at all — which is a good position to start from.

---

## What I will flag in ongoing batches

Per point 2 of the ruling. Nothing in batches #4, #5 or #6 introduced a single-brand assumption — they touched rendering, severity and DPP truth, not identity or storage. Two live queue items *do* touch this ground and I will flag rather than build:

- **#55, the magic-link expiry backfill.** A DB change. If it is written against `session_id` it entrenches browser-as-tenant in a migration. Should be keyed on the pack row's own id.
- **The `||'SE'` audit and any work touching `brandId` construction.** That is where the stable-id decision would naturally land.

---

## The one thing worth deciding before the pilot

Not multi-user — that stays behind the gate. **The stable brand id.**

If the device-local pilot runs with name-derived ids, then every pack and passport a pilot brand publishes carries an identifier that changes if they rename themselves and cannot be cleanly mapped to an account later. The DPP case is the sharp one, because those URLs go onto printed packaging and the code's own publish dialog promises *"The URL is stable across re-publishes."*

That promise is true today only as long as the brand never renames and never clears their browser.

**Cost to fix before the pilot: small, and it is a coding-lane task.
Cost to fix after brands have published: a permanent translation table, or broken QR codes.**

That is the sequencing input Strategy asked for.

---

## Not answered here

Whether the RP-agency segment is the sharper buyer — that is Strategy's call and the code has nothing to say about it. The only observation the bytes support is that the data shape a partner needs (many brands, each with products, PIF references, CPNP numbers, renewal dates) is **the shape VeyaFlow already models per brand**, plus one dimension. Nothing about the compliance engine, the registry, or `scoreReadiness` assumes a single brand. The assumption lives entirely in storage and identity — the two layers that were always going to be rewritten for multi-user anyway.
