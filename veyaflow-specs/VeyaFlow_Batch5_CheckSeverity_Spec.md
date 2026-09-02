# VeyaFlow — Batch #5 v1.1: the buyer surface tells the truth about marks and dates — for Claude Code

**31 August 2026** · findings #45, #46, #47, #50 · touches `index.html`, `portal.html`, `brand/index.html`

**This supersedes v1.0**, which carried #45 only. Three findings from the batch #4 smoke round join it because they sit on the same two surfaces and, in one case, would be actively contradicted by shipping #45 alone.

## BASELINES (verify all three before editing)

| File | sha256 |
|---|---|
| `index.html` | `5230c508e90892fa0bab09d4e73e7b22d64d0959bb114bc4bddfbca3ec0dfa1c` |
| `portal.html` | `0ec4bed331d45dd06f61725b71c91076a9d5158d5a3658f0dd169bdd71eeb8ad` |
| `brand/index.html` | `6b255130d41a37bc755e17633f46ef5357247d1f4bdd780bc1c8f3ad70009352` |

`netlify/functions/supabase-proxy.js` is **not touched** (`78c4f6a2…`).

If any baseline doesn't match, STOP. Line numbers are from these files — **re-scout every anchor**.

## THE FOUR FINDINGS, IN ONE SENTENCE EACH

- **#45** — a red ✗ on the products table asserts a severity the data does not carry.
- **#50** — an EU RP agreement that expired in January 2025 renders a green ✓, because the check tests that an RP *exists*, never that the agreement is *current*.
- **#46** — the shared Brand Pack calls every brand a "Verified brand profile", hardcoded.
- **#47** — magic links to that pack never expire.

**#50 is why this cannot ship as v1.0.** Part 2 adds a legend reading *"✓ on file"*. Shipping that beside a tick earned by a lapsed agreement would take an existing quiet defect and give it an explicit written guarantee.

## THE FINDING

Live on the deployed build, on one portal card, four lines apart:

> **"2 of 2 products ready"** — *Ready = no blocking issues for this retailer.*
>
> …and in the products table below, **CLAIMS ✗** in red.

Both statements are true. The juxtaposition is not. A red ✗ means failure in every convention there is, and this one means *"no approved claims are recorded"* — which raises **no blocker at all** in `scoreReadiness`. Having no claims is not a compliance problem.

**The structural cause:** two systems describe the same products on the same card, and only one of them knows severity.

- The **Product readiness** panel derives from `scoreReadiness`, which classifies every issue **red** (blocking) or **amber** (not blocking).
- The **products table** computes its own ticks and crosses straight from boolean SKU fields — `sk.cpnp ? '✓' : '✗'` — and **has no concept of severity**. Every unmet check renders identically red.

Scouted severities, from the scorer's own blocker definitions:

| Table check | Blocker raised | Level |
|---|---|---|
| CPNP (EU cosmetic) | `cpnpMissing` | **red — blocks the listing** |
| CE marking (device) | `ceMarkingMissing` | **red — blocks the listing** |
| EU RP | `euRpMissing` | amber — does not block |
| Claims | *none* | **no severity at all** |

So the mark carrying the least meaning looks exactly as alarming as the one that stops a listing.

**Why this is in scope and not cosmetic.** It is the same family as the fabricated banner: a visual claim the underlying data does not support. And Strategy's readiness ruling already covers it — *dimensions derive from the same per-SKU checks displayed beside them, or they don't render.* The table and the panel must speak from one source.

---

# PART 1 — `index.html`: emit severity with the readiness

## The rule

**The portal must not compute severity.** Severity lives where `scoreReadiness` lives. The portal renders what it is given. Any fix that teaches `portal.html` which checks are serious re-implements regulatory knowledge in the wrong place and will drift.

## 1A — extend `buildSkuReadiness` (~L39205)

For each SKU, alongside the existing `ready` and `blockers`, emit a **`checks`** object giving the state of each check the portal renders:

```js
checks: {
  cpnp:      'ok' | 'blocking' | 'attention' | 'not_recorded',
  claims:    …,
  euRp:      …,
  ceMarking: …,
}
```

**Deriving each value — in this order:**

1. The check is satisfied in the SKU snapshot → **`ok`**.
2. Not satisfied, and the SKU's blockers contain a **red** blocker for it → **`blocking`**.
3. Not satisfied, and the blockers contain an **amber** blocker for it → **`attention`**.
4. Not satisfied and **no blocker corresponds** → **`not_recorded`**.

**Scout the blocker ids rather than trusting this table** — they are market-conditional and I have only read the EU path:

- `cpnp` → `cpnpMissing` (red in EU, amber as SCPN in UK, red in CH)
- `ceMarking` → `ceMarkingMissing`
- `euRp` → `euRpMissing`
- `claims` → `redClaim` / `amberClaim`, which fire only when declared claims are flagged. An empty claims list raises nothing → `not_recorded`.

**Report the correspondence you actually implemented.** If a check's blocker id differs by market and you cannot resolve it confidently, emit **`not_recorded`** and say so — never guess a severity upward.

**Only emit checks that apply to the SKU's framework.** A device has no `cpnp` key at all; a cosmetic has no `ceMarking`. Omission, not a false value.

**Do not change** `ready`, the `blockers` array, or anything else in the payload. `scoreReadiness` changes in **1B only**, exactly as specified there and nowhere else.

---

## 1B — finding #50: an expired EU RP scores as present

**Scouted, live, on Charlotte's own data.** The EU Responsible Person page renders:

> **EU RP ON FILE** — Nordic Compliance AB · rp@nordiccompliance.se · **renews 2025-01-12**

in a green box (`#ECFDF5` / `#A7F3D0`, L16042–16045). That date passed **nineteen months ago**. Nothing on that page compares it to today.

The scorer agrees with the green box, for the same reason — `scoreReadiness`, L6526:

```js
if(sku.euResponsible||(brand&&brand.euResponsible&&brand.euResponsible.name)){
  comp+=6; greens.push('EU Responsible Person on file');
}
else{ blockers.push({id:'euRpMissing',level:'amber',...}); }
```

**The test is `.name` being truthy.** `renewalDate` is stored (L17124 guarantees the field survives the legacy migration), read in four other places, and never once compared to the current date. So a lapsed RP agreement earns +6 compliance points, a green line reading *"EU Responsible Person on file"*, and — after batch #4 — a **✓ in the EU RP column on the buyer-facing products table**.

This is the Truth Batch family, with the polarity reversed. Every earlier finding was a false red or an unearned score. This one is a **false green on the buyer surface**: a retailer reading that ✓ concludes the brand has a current RP, and under EC 1223/2009 an absent RP is the retailer's problem too.

### The fix

**In `scoreReadiness` only, at L6526.** Add an expiry test to the existing branch. Three outcomes, not two:

1. No RP at all → `euRpMissing`, **amber**, unchanged. Do not alter this path.
2. RP present, `renewalDate` **absent or unparseable** → **treat as present**, exactly as now. We do not know it has lapsed, and inventing a blocker from a missing field is the same error we keep removing. Do not add a blocker here.
3. RP present and `renewalDate` **parses to a date before today** → a **new blocker**, `euRpExpired`, **amber**, label *"EU Responsible Person agreement expired"*, impact naming the date. Do **not** award the +6, and do **not** push the green.

**Amber, not red — deliberately.** An expired agreement is very likely renewable paperwork with an incumbent provider, not a missing appointment. Red is reserved for what stops a listing. If Strategy wants it red, that is Strategy's ruling to make; do not pre-empt it.

Add `euRpExpired` to the fix-cost map beside `euRpMissing` (L6447). Reuse `euRpMissing`'s cost if you have no better figure — **do not invent a number**; if you are not confident, omit the entry and say so.

**Then wire it to Part 1A:** with `euRpExpired` in the blockers, `checks.euRp` derives `attention` through the existing rule 3. No special case.

**Comparison rules.** Compare date-only, not timestamps — an agreement renewing today is current, not expired. `new Date(renewalDate)` on `isNaN` → outcome 2, never outcome 3.

**Also — the green box, L16042–16045.** When the date has passed, the box must not be green and must not read "on file" unqualified. Amber styling, and the date labelled as **expired** rather than "renews". Wording is yours; the requirement is that a lapsed date never renders in a success colour. This is the only change permitted in `renderEuRpPage`.

**Out of scope inside 1B:** `buildComplianceEvents` (L32662) silently drops past dates, which is why nothing warned her — that is a **batch #6** finding and belongs with the calendar's own date arithmetic. Do not touch it here.

---

# PART 2 — `portal.html`: render three states, not two

## 2A — the cell renderer (`FRAMEWORK_COLUMNS`, ~L1058–1075)

Each column's `cell` function currently returns a boolean and the caller renders `✓` or a red `✗`. Change to render from `sku.checks[key]` when present:

| State | Mark | Colour |
|---|---|---|
| `ok` | ✓ | green, as now |
| `blocking` | ✗ | **red — the only red on this table** |
| `attention` | ! or ▲ | amber |
| `not_recorded` | – | **muted grey, never red** |

**Fallback:** if `checks` is absent — a legacy row, or a SKU where Part 1 couldn't resolve — render the current boolean behaviour but use the **muted** mark for false, not red. Red is only ever asserted from a known red blocker. **Absence of information must never render as failure.** That principle is the whole point of this batch.

## 2B — a legend

Directly beneath the products table, one line explaining the marks. Something like:

> ✓ on file · ✗ blocks this listing · ▲ needs attention · – not recorded

Wording is yours; the requirement is that a buyer can tell the three non-✓ states apart without guessing.

## 2C — the summary line

The Product readiness panel says *"2 of 2 products ready"*. Keep the count and keep the definition line. **Append a non-blocking count when there is one:**

> **2 of 2 products ready** · 1 item needs attention

Derive that from the same `checks` — count `attention` states across the submission's SKUs. **Do not count `not_recorded`**; a thing nobody recorded is not an issue, and inflating the number would be the same error in the opposite direction.

If there are no `attention` states, the line reads exactly as it does now.

---

# PART 3 — `brand/index.html`: finding #46, the hardcoded verification claim

## The finding

`brand/index.html`, **L176–178** — the subtitle under the brand name on the shared pack:

```js
const subLine = displayRetailer
  ? esc(displayRetailer) + (displayMarket ? ' · ' + esc(displayMarket) : '')
  : 'Verified brand profile';
```

When no retailer is named, every pack in existence tells its reader it is a **"Verified brand profile"**. Nothing computes it. Nothing checks it. It is a string literal in a fallback branch.

This is the `|| 'Verified'` tier fallback we removed in the Truth Batch, alive on a second surface. Worse placed: this page is reached by a magic link in a cold pitch email, by a buyer with no VeyaFlow account, no session, and no other context by which to calibrate the claim. It is the first line they read under the brand's name.

And it is a claim VeyaFlow **cannot** currently make about anyone — the live Verification Status panel for Cloud & Glow reads *"VeyaFlow Unverified · Tier 0 of 3"*. The pack asserts verification the product's own tier system denies.

## The fix

**Delete the fallback string.** When there is no retailer to name, the subtitle renders **nothing** — no element, no empty line, no substitute.

Omit-beats-caveat: do not replace it with "Unverified", "Verification pending", or "Not yet verified". A buyer who was never promised verification does not need to be told it is absent, and a negative badge on a pitch document is a worse outcome for Charlotte than silence with no compensating honesty gain.

**If the layout depends on that line existing**, close the gap. No orphaned label, no reserved empty height.

**Scout before you assume this is the only one.** Grep `brand/index.html` for `Verified`, `verified`, `Compliant`, `Approved`, `Certified` and report **every** occurrence with its surrounding condition — I have read this file once and I want the whole set, not just the line I found. Anything else asserting a status from a hardcoded literal rather than from pack data: report it, **change nothing else without me confirming**.

---

# PART 4 — `index.html`: finding #47, magic links never expire

## The finding

`index.html` **L25653**, in `renderMagicLinkCard`:

```js
body: JSON.stringify({brandPackData, brandId, expiresInDays: null}),
```

`null` is not an oversight in the calling code — the field is named, present, and deliberately nulled. **Every Brand Pack link ever generated is live forever.**

What that link carries is a full commercial and regulatory snapshot: catalogue, compliance state, market positioning. It is pasted into cold pitch emails to buyers at Lyko, Matas, Apotek Hjärtat, and it is forwardable to anyone, indefinitely, with no revocation path. A pack shared in a pitch that went nowhere in 2026 is still readable in 2029, still asserting a compliance position that stopped being true within weeks.

There is a second-order problem, and it is the one that will bite first: **a pack is a snapshot, and nothing tells the reader how old it is.** Step 8 of the smoke test confirmed this — a pack generated on 5 May renders today identically to one generated this morning, with no date anywhere on it.

## The fix — two parts, both small

**4A — a default expiry.** Set `expiresInDays` to **90**.

Ninety days because it comfortably outlives a pitch cycle while guaranteeing that a stale compliance snapshot stops being readable within one quarter. If you find that `share-brand-pack.js` or the viewer cannot honour a non-null value, **stop and report** — do not implement expiry logic yourself in either place.

**Scout first and report before changing:** does `netlify/functions/share-brand-pack.js` read `expiresInDays`, store it, and does `get-brand-pack.js` enforce it on read? If the field is accepted and discarded, setting it to 90 achieves nothing and I need to know that rather than believe the link now expires. **Verifying the mechanism is the deliverable here, not the number.**

**4B — date the pack.** `brand/index.html` must render, in the pack footer, the date the pack was generated. If `brandPackData` carries no such field, add one in `renderMagicLinkCard` (an ISO date at generation time) and render it.

Wording along the lines of: *"Compliance snapshot generated 31 August 2026."* Not a caveat, not an apology — a date. A buyer holding a six-week-old snapshot should be able to see that it is six weeks old, and 4B is worth more than 4A: the expiry protects against the forgotten link, the date protects against the one being read right now.

---

# OUT OF SCOPE — do not touch

`ready` semantics · the Product readiness panel's structure · `scoreReadiness` **except the single L6526 branch in Part 1B** · `buildComplianceEvents` and `daysUntil` (batch #6) · `renderVerificationCard` and its Tier-1 checklist (batch #6, finding #48) · Brand Home hero, CRM cards, expansion overview, `renderReadinessScore` (batch #6) · the DPP surfaces (#41/#27/#30/#31 — their own batch) · the proxy.

**`renderMagicLinkCard` is in scope for Part 4 only** — the `expiresInDays` value and, if needed, a generation date. Nothing else in that function changes; it was rewritten in the batch #4 fixup and must not drift.

---

# STOP. NO COMMIT.

## REPORT BACK

**Part 1A/2 — severity**

1. The exact check → blocker-id correspondence you implemented, and any check you left as `not_recorded` because you could not resolve it confidently.
2. How market-conditional severity is handled — CPNP is red in the EU and amber as SCPN in the UK. Does `checks.cpnp` reflect the submission's actual market?
3. What a **legacy** submission (no `checks`) renders for an unmet check — confirm it is muted, not red.
4. Your legend wording and the summary line wording.
5. Confirmation that `not_recorded` is excluded from the attention count.

**Part 1B — RP expiry**

6. The exact L6526 branch after your change, quoted.
7. Confirm outcome 2: an RP with **no** `renewalDate` still scores as present with no new blocker.
8. What the green box renders for a past date now.
9. Whether you added a `euRpExpired` fix-cost entry, and where the figure came from.

**Part 3 — the pack**

10. Every `Verified` / `Compliant` / `Approved` / `Certified` occurrence in `brand/index.html`, with its condition. What you changed, and what you left alone pending my confirmation.
11. What the subtitle area renders now when no retailer is named.

**Part 4 — expiry**

12. **The mechanism, before the number:** does `share-brand-pack.js` store `expiresInDays`, and does `get-brand-pack.js` enforce it? Quote the handling. If the field is accepted and discarded, say so plainly — that answer is more useful to me than a working change.
13. Where the generation date comes from and where it renders.

14. `sha256sum index.html portal.html brand/index.html`

## VERIFY (byte — coding chat)

**Severity**

- acorn clean on `index.html` (2 blocks); `portal.html` and `brand/index.html` parse
- `checks` emitted in `buildSkuReadiness`; no severity logic anywhere in `portal.html` — quote the render
- red `✗` reachable **only** from a `blocking` state — grep the render and confirm no other path emits the red class
- framework-inapplicable checks are **omitted**, not false
- legacy path renders muted, never red

**RP expiry**

- `scoreReadiness` diff is **the L6526 branch and nothing else** — every other line byte-identical
- `euRpMissing` still fires on a genuinely absent RP, still **amber**
- no blocker on a missing/unparseable `renewalDate` — the no-date path must be provably unchanged
- `euRpExpired` reaches `checks.euRp` as `attention`, never `blocking`
- the green box `#ECFDF5` no longer reachable with a past date

**The pack**

- `'Verified brand profile'` = **0 occurrences** in `brand/index.html`
- no substitute literal introduced — grep `Unverified`, `pending`, `Not yet` and confirm the branch renders empty
- `readinessScore` still **0** in `renderMagicLinkCard` (batch #4 fixup holds)
- `expiresInDays: null` = **0**; the new value present once
- generation date renders; `renderMagicLinkCard` otherwise byte-identical

**No regression**

- batch #4 intact: `buildSkuReadiness` 1 · `skuReadiness` present · `readinessDimensions` 0 · `out of 100` 0 in portal
- batch #3 intact: `persistCritical` 1 · `showFailure` 1 · silent setItem catches **10**
- out-of-scope functions byte-identical: `renderReadinessHero`, `renderVerificationCard`, `initCRMCards`, `renderExpansionOverview`, `renderReadinessScore`, `buildComplianceEvents`, `daysUntil`
- guards: `['Margin','50%']` **0** · `Beauty Days participation` **6** · `launchSupport` **0** · `_bpAllowed` **2** · `renderCrmEditor` **3** · GLN **2** · validPages pitch-free
- Truth Batch phrases still **0**

## ON GREEN

`Buyer surface truth pass: red marks only where a blocking issue exists, expired EU RP no longer scores as present, shared pack drops the hardcoded verification claim and carries a generation date and expiry (fix batch #5)`

## SMOKE

1. New submission with both products. The Face Serum's **Claims** cell should now be a **muted "not recorded"**, not a red ✗ — and the card should still say 2 of 2 ready.
2. Remove the CPNP reference from a cosmetic SKU and submit again: that cell **should** be red, and the product **should** drop out of the ready count. The red mark and the count must agree.
3. Legacy submission: unmet checks render muted, nothing red.
4. **EU Responsible Person page** — the box for the 2025-01-12 date is no longer green and says expired. Then check the portal: the EU RP column for a cosmetic should now be **▲ attention**, not ✓.
5. **Clear the RP renewal date entirely** and reload. The RP must go back to scoring as present with no blocker — this is the regression that matters most in Part 1B.
6. **Fresh magic link** — no "Verified brand profile" line, a generation date in the footer, layout closes cleanly.
