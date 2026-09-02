# VeyaFlow — Batch #8: the regime label, and the framework that scores itself clean

**v1.1 · 1 September 2026 · findings #53 and #73 · `index.html` only · TWO SHIPMENTS, hard STOP between them**

> ### AMENDMENT — v1.1 supersedes v1.0. Read this before anything else.
>
> **Strategy ruling, 1 Sep: no article numbers are cited until the RP has confirmed them.**
>
> v1.0 had `OPERATOR_REGIME` carry a `cite` field rendering `Reg. (EU) 2019/1020 Art. 4` and `GPSR (EU) 2023/988 Art. 16` onto buyer-facing documents. **That is withdrawn.** Write the role, not the paragraph.
>
> A document that says the right thing without a citation is stronger than one that says the right thing with the wrong citation. Getting the entity right and the article wrong is still a false declaration — and unlike our own bugs, it is one a retailer's compliance department catches rather than us.
>
> The question goes to the RP as the fourth boundary question, alongside MDR Annex XVI, REACH Annex XVII and the substance discriminator. When it comes back, the citations enter **as registry data with a source**, like everything else.
>
> **If you have already started from v1.0: stop, and re-read 1A, 1C's rendering rules, report item 6, the verify block, and smoke steps 1–2. Everything else is unchanged.**

---

## BASELINE — I am naming this value

| File | sha256 |
|---|---|
| `index.html` | `33675909ffff34b513e12d4d5630175c6c60710ced13f6123efc215776e7b8e8` |

**This is a value I am naming.** It is your batch #7 Part 1 output, committed as `a29c8cc`, byte-verified here: acorn clean, 2 blocks (html-lines 1176 and 39245), 40,763 lines. Proceed on it.

If your working tree does not match this digest: **STOP, report the digest you have, and wait.** Do not reconcile it yourself.

**Other files are not touched in this batch.** `dpp/index.html`, `portal.html`, `brand/index.html`, `netlify/functions/*` — report their digests unchanged in your final report.

---

## WHY THIS BATCH EXISTS

Two findings, one root.

**#53.** The app prints **"EU Responsible Person"** against products that have no Responsible Person, because they are not cosmetics. "Responsible Person" is a term of art from **EC 1223/2009 Article 4**. It has a specific legal meaning that does not extend to an LED face mask or a jade roller. Those products have a different obligation, under different law, discharged by a possibly different entity.

Today, the LED Face Mask's buyer-facing Compliance Declaration prints:

> **EU Responsible Person** — Cosmeservice GmbH

That is a false statement about a legal role, on a document a retailer files.

**#73.** `scoreReadiness` has a branch chain — `isCosm` → `isFood||isSupp` → `isDevice` → `isTextile` → `isUnknown` → `else`. **`beauty_accessory` has no branch.** It falls to:

```js
} else {
  comp += 24;
}
```

Twenty-four compliance points, no checks, no blockers. And `beauty_accessory` is **one of the three product types the UI actually offers** (`_CURRENT_PRODUCT_TYPES_LIST`, L17356). So a third of the shipped framework surface scores full marks on an empty record.

Worse than that: an **unknown** SKU at least raises `productTypeUnknown` and awards nothing. A **stated** accessory raises nothing and awards 24. **Setting the product type correctly makes the product look more compliant than leaving it blank.** That inverts the incentive the whole routing architecture was built to create.

Both findings are the same failure: the framework is known, and the compliance surface ignores it.

---

## WHAT WILL GET WORSE, AND WHY THAT IS THE POINT

After Shipment 1, the LED Face Mask's Compliance Declaration and DPP will **lose** the "EU Responsible Person: Cosmeservice GmbH" row and gain an economic-operator row reading **"— not confirmed"**. The document will look emptier.

It is not emptier. It is accurate. The mask never had an appointed Art. 4 operator; it had a cosmetics RP borrowed from a serum. Charlotte should expect this and it is not a regression.

---

# SHIPMENT 1 — #53: the regime label

## 1A — ONE registry, ONE resolver

Registry entry goes next to `FRAMEWORK_LABEL` (~L6505), the existing framework data table. **Data drives this, not branches.**

```js
// Which EU operator obligation applies, per framework. THE ROLE ONLY — no instrument,
// no article number. Strategy ruling 1 Sep 2026: a citation goes on a buyer-facing
// declaration only after the RP has confirmed it, and then as registry data carrying
// its own source. An unverified citation is worse than none.
// A framework ABSENT from this table asserts NOTHING — same posture as 'unknown'.
const OPERATOR_REGIME = {
  cosmetic:         { label:'EU Responsible Person',            field:'euResponsible' },
  device:           { label:'EU-established economic operator', field:'euOperator' },
  beauty_accessory: { label:'EU-established economic operator', field:'euOperator' },
};

// THE single lookup. Returns null when no regime is established for this SKU's framework
// — including 'unknown'. Callers MUST handle null by rendering neither label.
function getOperatorRegime(sku){
  var fw = resolveProductFramework(sku).framework;
  return OPERATOR_REGIME[fw] || null;
}
```

**Three deliberate omissions, each of which is the finding, not an oversight:**

- **There is no `cite` field.** Per the v1.1 amendment. Do not add one, do not leave a `cite:null` placeholder, and do not put the article numbers in a comment "for later" — a slot with a plausible value beside it is how an unverified citation ships six weeks from now. When the RP confirms, the field arrives with a `citeSource` alongside it, in its own change.
- **`textile`, `food`, `supplement` are absent.** They are unreachable from the UI today. I will not add a regime entry for a code path nobody can hit and nobody has reviewed. When those types are exposed, the entry gets added then.
- **`unknown` is absent**, so `getOperatorRegime` returns `null` and callers assert neither regime. This is the #50/#52 posture: an unstated framework yields no claim in either direction.

**Device and accessory share a label and that is deliberate**, not a copy-paste to be deduplicated. "EU-established economic operator" is true of both. The obligations behind them differ — an LED mask is under listed harmonisation legislation, a jade roller is not — but that difference lives in the citation, which we are not writing. Two entries, same string. **Do not collapse them into one shared constant**: they diverge the moment the RP answers, and a shared constant makes that a refactor instead of a data edit.

**One definition of `OPERATOR_REGIME`. One definition of `getOperatorRegime`.** No per-call fallback, no second copy, no inline `productType==='cosmetic'` test anywhere that renders an operator label.

## 1B — the field

`OPERATOR_REGIME` names two source fields. `euResponsible` exists. **`euOperator` does not.**

Add it at brand level, mirroring the existing `brand.euResponsible` shape exactly — `{ name, address, email, renewalDate }` — and surfaced in the same place in the Brand Profile, immediately after the RP block, under the heading:

> **EU economic operator** — for non-cosmetic products (devices, accessories). May be the same company as your Responsible Person, but the mandate is separate and must be separately agreed.

**Do NOT reuse `brand.euResponsible` for both.** The same legal entity may hold both roles, but holding one does not confer the other, and the app cannot know from the data whether it does. Reading the RP into the operator slot is precisely the false assertion this batch removes — it would remove the wrong *label* and keep the wrong *claim*.

Empty is the correct state on day one. Every non-cosmetic product will render "— not confirmed" until Charlotte fills it in. That is true.

**Field-name variants.** `normalizeBrandRP` (~L17144) consolidates legacy `euResponsiblePerson` variants into `euResponsible`. **Do not extend it to `euOperator`** — there is no legacy data to consolidate, and a normaliser that invents a source is a defect. Add nothing there. Confirm in your report that `normalizeBrandRP` is byte-identical.

## 1C — every product-scoped rendering routes through the resolver

**This is the part where this batch has failed five times before**, under a name I will use so you can watch for it: the **narrow-anchor pattern**. #30 gated one of three export doors. #41 fixed one line and missed a sibling table twenty lines below. #70's site list grew 2 → 4 → 8 → 9 across three passes. #72 fixed the public page and not the in-app summary.

**The finding is not "line 29517 is wrong." The finding is "the app asserts the cosmetic regime for non-cosmetics."** Every path that makes that assertion is in scope.

**Scout for the STRING, not the construction.** Grep `Responsible Person` — my count on the baseline is **67 occurrences in `index.html`**. Most are legitimate: knowledge-base prose about the cosmetics regulation, the RP marketplace page, market requirement tables, glossary entries. Those are statements *about the law*, not claims *about a product*, and they stay.

**The test for each occurrence is one question: does this render a claim about a specific SKU?** If yes, it routes. If no, it stays.

### Sites I found. This is a FLOOR, not a ceiling.

| Line | Surface | Today |
|---|---|---|
| ~L29517 | Compliance Declaration PDF, "Regulatory status" | ungated |
| ~L35238 | DPP PDF Declaration, "Compliance & Certifications" | ungated |
| ~L35111 | DPP JSON export, `"euResponsiblePerson"` | ungated |
| ~L35090 | DPP JSON export, `"manufacturer": sku.euResponsible` | **and wrong field — see below** |
| ~L30159 | Brand Pack PDF, "Compliance Status" | ungated |
| ~L16970 | Brand Pack HTML, "Compliance status" | ungated |
| ~L16773 | Brand Pack LLM prompt, `complianceData` | ungated |
| ~L24889 | Pitch LLM prompt, `_pitchCompliance` | ungated |
| ~L21525 | Boots UK export table, `'EU/UK Responsible Person'` | ungated |
| ~L21545, ~L21588 | sibling export tables | ungated |
| ~L13471 | Apotek field map, `label:'EU Responsible Person'` | ungated |
| ~L16259 | Brand Pack publish warning, "RP not yet designated" | ungated |

**Already correctly gated — verify, do not touch:**

| Line | Gate |
|---|---|
| ~L7601 | `categories:['cosmetic_skincare']` |
| ~L36397 | `productTypes:['cosmetic']` |
| ~L32771 | calendar RP renewal — **brand-level, not product-scoped. Leave it.** |

**L29517 deserves its own sentence**, because it is the pattern caught in the shipped bytes:

```js
if(isCosmetic) row('CPNP notification', sku.cpnp);   // CPNP = cosmetic notification (1223/2009) — N/A to devices/accessories
const rp = brand && brand.euResponsible;
row('EU Responsible Person', (rp&&rp.name) ? ... : '— not provided');
```

Someone gated the CPNP row, wrote a comment explaining exactly why, and left the row directly beneath it ungated. The reasoning was right and stopped one line early.

**The mirror defect at L35238.** The DPP PDF prints `row('CE marking', ...)` and `row('CPNP reference', ...)` **both ungated**. So a cosmetic gets a CE row and a device gets a CPNP row. Same failure, both directions. **Gate all three on framework in this batch** — CPNP and CE are the same finding as the RP row and splitting them would leave the surface half-true.

### Rendering rules

- **Regime present** → label reads exactly `regime.label`, value from the regime's `field`. **Nothing is appended.** No instrument, no article, no parenthetical.
- **Regime present, field empty** → same label, value `— not confirmed`. Say what is missing; do not omit the row.

**A consequence worth stating, because it is also your strongest verification signal: for a cosmetic SKU, Shipment 1 changes no rendered string at all.** The label was "EU Responsible Person" before and is "EU Responsible Person" after; only the path that produces it changes. Every visible difference in this shipment falls on non-cosmetic and untyped SKUs. If a cosmetic surface renders differently, something is wrong — report it rather than accepting it.
- **`getOperatorRegime` returns `null`** (unknown, or an unlisted framework) → **render no operator row at all**, and where the surface has a regulatory section, one line: `Product type not set — the applicable EU operator requirement cannot be determined.`
- **The two LLM prompt sites (L16773, L24889)** take the same routing. A prompt that is fed `EU Responsible Person: Cosmeservice GmbH` for a device will write it into the pack copy, and it will read as brand-authored prose rather than a field — harder to spot and harder to retract.

**Re-scout before you finish.** If you find a thirteenth or fourteenth site, **that is the finding, and I want it named in the report** — not quietly folded in.

## 1D — expiry, without a second date comparison

`_rpDateExpired` (~L16133) is the file's **single** date comparison and stays that way.

The RP-expiry logic currently exists **twice** — the cosmetic branch (~L6554) and the unknown branch (~L6627) — as two near-identical copies of the same eleven lines. That duplication is already a latent divergence bug, and adding a third and fourth copy for device and accessory would make it four.

**Extract it. One helper, four callers:**

```js
// The single operator-presence-and-currency check. Framework-agnostic: the CALLER
// supplies the regime (from getOperatorRegime) and the points; this decides only
// present / expired / absent. Reuses _rpDateExpired — no second date comparison.
// Three outcomes, per the #50 ruling (31 Aug): an operator that EXISTS is not a
// mandate that is CURRENT, and a MISSING renewalDate is not evidence of lapse.
function _operatorStatus(brand, sku, regime){ ... }
```

Returns enough for the caller to award points, push a blocker, or push a green. **The wording and point values of the cosmetic and unknown branches must not change** — this is a refactor of those two, not a rewrite. If the extraction changes a single rendered string or a single point value in those branches, you have gone too far: report it and stop.

Device and accessory become callers in **Shipment 2**, not here. Shipment 1 adds the helper and moves the two existing callers onto it.

---

## STOP. NO COMMIT. NO SHIPMENT 2.

### REPORT BACK — Shipment 1

1. **The complete final list of product-scoped sites now routing through `getOperatorRegime`**, including any beyond the twelve I listed. And the count of `Responsible Person` occurrences you classified as prose/knowledge-base and left alone, with a one-line reason for any that were borderline.
2. Confirmation that **`OPERATOR_REGIME` and `getOperatorRegime` have exactly one definition each**, and that no site tests `productType==='cosmetic'` inline to decide an operator label.
3. Confirmation `textile`, `food`, `supplement`, `unknown` are **absent** from `OPERATOR_REGIME`, and what a `null` return renders on each surface.
4. Confirmation `brand.euOperator` is **never** read from `brand.euResponsible`, and `normalizeBrandRP` is byte-identical.
5. The cosmetic and unknown branches after the `_operatorStatus` extraction: **confirm rendered strings and point values are unchanged**, and show the two call sites.
6. **Confirmation that no article number or instrument reference was introduced** by this shipment — not in `OPERATOR_REGIME`, not in a rendered label, not in a comment. Report the diff's count of newly-added occurrences of `2019/1020` and `2023/988`: both must be **0**. Existing occurrences elsewhere in the file are untouched and out of scope.
7. **Confirmation that no rendered string changes for a cosmetic SKU.** State how you established it.
8. `sha256sum index.html` — full digest. Plus digests of `dpp/index.html`, `portal.html`, `brand/index.html` confirmed unchanged.

### VERIFY (byte — coding chat)

- acorn clean, `index.html` 2 blocks
- `OPERATOR_REGIME` = **1 definition**; `getOperatorRegime` = **1 definition**
- `_operatorStatus` = **1 definition**, **2 call sites** in Shipment 1
- `_rpDateExpired` still **1 definition** — no second date comparison anywhere
- `_dppIsPublished` still 1 definition / 4 call sites; all batch #3–#7 guards intact
- Truth Batch phrases = 0
- **newly-added `2019/1020` = 0, newly-added `2023/988` = 0** (diff against the named baseline, not a whole-file count — `2023/988` already appears in the accessory form's section tags and must stay)
- **cosmetic-path rendered output unchanged** — the Face Serum's Compliance Declaration, Brand Pack compliance block and DPP export carry the same strings as at `a29c8cc`

**Guard counting method, stated explicitly:** these guards count **rendered occurrences** — string literals reachable in emitted output. Every truth fix in this project leaves the old literal behind inside its own removal comment; a raw `grep -c` counts those epitaphs and reports a false failure. Guards that count raw matches must say so and must state their expected non-zero comment count. A guard that does not declare which it counts is not a guard.

---

# SHIPMENT 2 — #73: a real GPSR branch

**Do not begin until Shipment 1 is verified and committed.** Shipment 2 depends on `getOperatorRegime` and `_operatorStatus` existing.

## 2A — the branch

Insert a `beauty_accessory` branch into the `scoreReadiness` chain, **before** `isUnknown`, mirroring the shape of the device branch.

**Total: 24 points — deliberately identical to the `else` it replaces.** The maximum achievable score does not move. Only the *unearned* part disappears. A brand with a fully documented accessory scores exactly what it scores today; a brand with an empty record stops scoring 24 for nothing. That is the entire change, and keeping the ceiling fixed is what makes it a truth fix rather than a re-weighting.

| Check | Points | Source field | Blocker on absence |
|---|---|---|---|
| EU economic operator present and current | 6 | via `_operatorStatus` | `euOperatorMissing` / `euOperatorExpired` — **amber** |
| Material composition declared | 6 | `sku.materialComposition` | `materialCompMissing` — amber |
| REACH Annex XVII screening confirmed | 6 | `sku.reachAnnexXVII` | `reachScreenMissing` — amber |
| GPSR technical documentation on file | 6 | `sku.gpsrTechFile` | `gpsrTechFileMissing` — amber |

**On the severities.** Every one is amber, matching `euRpMissing` in the cosmetic branch. I considered red for the operator — it is a prerequisite to placing the product on the market — and rejected it, because the same obligation is amber for cosmetics and **inconsistent severity for the same class of obligation across frameworks is exactly the thing that teaches a user to stop believing the colours.** If the operator check should be red, it should be red in both branches, and that is a separate ruling, not a side effect of this batch.

**The `else { comp += 24; }` stays.** It is now unreachable from the UI, but `resolveProductFramework` can still return `textile`, `food` and `supplement` from stored data. Deleting the fallback would silently zero those. Leave it and **add a comment saying what can still reach it.**

## 2B — the fields those checks need

`reachAnnexXVII` and `gpsrTechFile` **do not exist**. The accessory SKU form (~L20146) captures only `materialComposition`, `claims`, `certifications`.

**A blocker for a field with no input is not a blocker — it is a permanent red mark the user cannot clear.** Add both to the accessory form in the same card, under the existing `Regulatory core — GPSR 2023/988 · material safety` tag:

- **REACH Annex XVII screening** — select: `''` / `Confirmed` / `In progress` / `Not applicable`. `Confirmed` and `Not applicable` both satisfy the check; `Not applicable` is a legitimate answer for a product with no restricted-substance exposure and must not be penalised.
- **GPSR technical documentation** — free-text reference, same shape as `sku.safetyRef`.

**Model the `Not applicable` case explicitly in the check.** "The brand assessed it and it does not apply" and "the brand has not looked" are different states, and collapsing them is the provenance failure this project keeps removing.

## 2C — the registry entries that make the blockers usable

Four new blocker ids need entries in `BLOCKER_RESOLUTION` (~L6456), or the fix panel renders an empty card:

`euOperatorMissing` · `euOperatorExpired` · `reachScreenMissing` · `gpsrTechFileMissing`

**Do not invent costs or timelines.** Where you have no basis, reuse a sibling's figures and mark it in a trailing comment exactly as `euRpExpired` does today (`// figures reused from euRpMissing — not invented`). An invented "3,000 SEK" on a compliance fix panel is a fabricated number on a screen the brand budgets from.

## 2D — READINESS_FIELDS

Add `{key:'reachAnnexXVII',weight:2}` and `{key:'gpsrTechFile',weight:2}` to `READINESS_FIELDS.beauty_accessory` (~L18165).

**Report the denominator before and after.** This changes the data-completeness percentage for accessory SKUs. Charlotte has no accessory SKU on file yet, so live blast radius is nil — but the number must be stated, not discovered.

---

## STOP. NO COMMIT.

### REPORT BACK — Shipment 2

1. The accessory branch in full, and **the branch chain order** showing it lands before `isUnknown`.
2. **Arithmetic:** accessory branch maximum = 24. Show it. And confirm the `else { comp += 24; }` still exists with its new comment naming what reaches it.
3. Confirmation `_operatorStatus` now has **4 call sites** (cosmetic, unknown, device, accessory) and still **1 definition** — and that the **device branch gained the operator check** in this shipment. A device with no Art. 4 operator currently raises nothing; leaving that would fix the accessory and keep the device wrong, which is the narrow-anchor pattern with extra steps.
4. The two new form fields, and how `Not applicable` is distinguished from unanswered.
5. The four `BLOCKER_RESOLUTION` entries, with any reused figures explicitly marked.
6. `READINESS_FIELDS.beauty_accessory` denominator, before and after.
7. `sha256sum index.html`.

### VERIFY (byte — coding chat)

- acorn clean, 2 blocks
- `_operatorStatus` 1 definition / **4** call sites
- `beauty_accessory` branch present, before `isUnknown`, maximum 24
- `else { comp += 24; }` still present
- 4 new blocker ids each have exactly 1 `BLOCKER_RESOLUTION` entry
- `resolveProductFramework` **byte-identical** — this batch does not touch the resolver
- `_rpDateExpired` 1 definition
- all batch #3–#7 guards, **rendered-occurrence counting**

### ON GREEN — one commit for both shipments

```
Regime truth pass: operator obligation routed from product framework across every
buyer-facing surface, a separate EU economic operator field, and a real GPSR branch
for beauty accessories replacing the unearned 24-point fallback (fix batch #8)
```

---

# SMOKE (after commit — Charlotte runs this)

1. **Face Serum** (cosmetic) → Compliance Declaration PDF reads **"EU Responsible Person"** with Cosmeservice GmbH. **Byte-for-byte what it says today** — this step passes only if nothing changed.
2. **LED Face Mask** (device) → the same PDF reads **"EU-established economic operator" — "— not confirmed"**, with no instrument or article named. Cosmeservice GmbH appears **nowhere** on the mask's declaration.
3. **LED Face Mask DPP JSON** → no `euResponsiblePerson` field; the operator field is null; **no CPNP field**.
4. **Face Serum DPP PDF** → **no CE marking row**.
5. Create a SKU with **no product type** → declaration renders **neither** operator label, and the "product type not set" line instead.
6. Create a **beauty_accessory** SKU (the face tape) with nothing filled in → readiness shows **four amber blockers**, not a clean score. Fill all four → the accessory scores the same 24 an empty one scored before this batch.
7. Brand Profile → the **EU economic operator** block exists, is empty, and filling it changes step 2's row to the entered name.

---

# OUT OF SCOPE — logged, not fixed here

- **#78** `"manufacturer": sku.euResponsible` in the DPP JSON. The RP is not the manufacturer; the serum's export says `"manufacturer": "Cosmeservice GmbH"` when `manufacturing.countryOfManufacture` is Sweden. **Batch #9 (export content).** Named here only because you will be standing on that line for 1C and must not silently repair it — a fix outside the spec is unverifiable against it.
- **#79** the `"version"` field. Batch #9.
- **#80–#85** export content and the missing unpublish path.
- **#86** *(new, 1 Sep)* — five `ns_dpp` records against two SKUs. `vf-1775931914850-moh0uqut` is **published at v2 since 15 May 2026** for a SKU no longer in the catalogue, and #85 means it cannot be withdrawn through the app. Ships with #85.
- **#87** *(new, 1 Sep, found scouting for this batch)* — **Label Scan hardcodes the cosmetic regime.** `runLabelScan` (~L22150) sets `const brandCat = brand?.category||'Skincare & Beauty'` and opens its system prompt `You are a cosmetics regulatory compliance expert`, with the output schema seeded with `Art. 19(1)(g) EU 1223/2009`. Scanning a device carton returns a cosmetics analysis. Also: `const isCosmetic = brandCat.includes('Skincare')||brandCat.includes('Beauty')` at ~L22165 is **assigned and never read** — a surviving instance of the brand-category inference batch #2 deleted from the resolver. Its own batch: the honest fix probably requires asking which SKU is being scanned, which is a UX change, not a truth fix.
- **#76** the eleven prompt siblings hardcoding "April 2026" as now.
- The `||'SE'` audit, and `||'Skincare & Beauty'` at L22164 as its sibling.
