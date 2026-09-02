# VeyaFlow — Batch #8 Shipment 1b: finish the assertion before the commit

**1 September 2026 · completes Shipment 1 · `index.html` only · Shipment 1 is VERIFIED GREEN and stays applied**

---

## BASELINE — I am naming this value

| File | sha256 |
|---|---|
| `index.html` | `fdb6dcc8e676dae30b09df9274b7f2b25486f129e870c384b82e622996705569` |

**This is a value I am naming.** Your Shipment 1 output, byte-verified here: digest matches, acorn clean, 2 blocks (html-lines 1176 / 39460), 40,978 lines, 20 hunks all inside specced regions. Proceed on it.

`dpp/index.html`, `portal.html`, `brand/index.html` — confirmed unchanged, not touched in 1b.

---

## SHIPMENT 1 — VERIFIED GREEN

Everything you reported, I checked. It holds.

- `OPERATOR_REGIME` 1 definition, three frameworks, **no `cite`, no placeholder, no article number in a comment**
- `getOperatorRegime` 1 · `_operatorStatus` 1 (2 call sites) · `_operatorValueFor` 1 · `_operatorRow` 1 · `_dppFwFields` 1
- newly-added `2019/1020` **0** · `2023/988` **0** (whole-file count still 2, the accessory form tags) · `Art. 4` **0** · `Art. 16` **0**
- `resolveProductFramework` byte-identical · `_rpDateExpired` 1 definition · `checkState` 1 · `_dppIsPublished` 1/4
- `comp+=6` present and unchanged in both branches — **the only diff on those lines is indentation**
- `window.location.origin` = 2, both inside comments, both byte-identical to baseline
- `@context` 1 · `DPP_CANONICAL_ORIGIN` 1 · `DPP_ORIGIN_LIVE` 1 · Truth Batch phrases 0

**Two things I checked that you did not claim, because they are how this project has been bitten before:**

1. **`brand.euOperator` survives a save.** `saveBrandState` → `persistCritical('ns_brand', brand)` writes the whole object with no key whitelist, and the Phase-3 prune scope is SKU-only. The DPP save path pruned an unknown key and silently lost it last night; the brand path does not. **The new field persists.**
2. **`_operatorRow`'s second argument is the cosmetic label only.** I went looking for it to fail — a shared short label would have made the hero tile read "✓ EU RP" for a device and defeated the whole batch on the one surface nobody would re-check. It routes correctly.

**The three helpers are ratified.** `_operatorValueFor` taking the caller's *existing* cosmetic expression is better than what I specced. It is why the Compliance Declaration still prints `rp.name · rp.email` for a cosmetic while every other surface keeps its own source — a single shared value source would have quietly changed four surfaces.

---

## THREE CORRECTIONS TO THE REPORT

### 1 · `isAccessory` IS read. The claim is wrong.

> *"`isAccessory` is already declared at line 6579 in `scoreReadiness` and is never read"*

In **your own output**:

```
6596:  const isAccessory = skuType==='beauty_accessory';
6702:    const ruleKey = isCosm?'cosmetic':isDevice?'device':isAccessory?'beauty_accessory':...
```

It is read 106 lines below the declaration, in the claims-ruleset router — it is what selects `CLAIMS_RULES.beauty_accessory`. **Nothing is broken; the report was.** Good news for Shipment 2: the accessory claims path already works and the branch you add must not disturb it.

### 2 · There is a THIRD cosmetic-visible change, and you declared two

Report item 7 named the CE row and the CE key. There is a third:

| | baseline | now |
|---|---|---|
| DPP PDF, operator row fallback | `sku.euResponsible \|\| '—'` | `sku.euResponsible \|\| '— not confirmed'` |

A cosmetic SKU with an empty `sku.euResponsible` renders `— not confirmed` where it rendered `—`. The Face Serum has the field populated so smoke step 1 is unaffected, and every other surface preserved its fallback exactly (`Not set`, `✗ Not set`, `— not provided`).

**Ruling: keep it.** `—` on a compliance document is ambiguous and `— not confirmed` is the same wording the non-cosmetic path uses. But it had to be *declared*, not *discovered* — that is the entire function of rule 7. A change that improves the output and arrives unannounced still spends the guarantee.

**Do not harmonise the other fallbacks.** Three different empty-strings now exist across surfaces (`— not provided`, `— not confirmed`, `Not set`). That inconsistency is pre-existing and per-surface; unifying it would change cosmetic output on purpose, which is the opposite of what this shipment is for.

### 3 · `normalizeBrandRP` does not exist — and you confirmed it byte-identical

There is no function by that name in the file. I invented it from the comment at baseline L17144. The real normaliser is the **Brand Schema Rationalization Phase 1** block (~L17311), and it *is* unchanged — the substance of your answer is correct.

But the process failed in both directions: **I asked you to confirm an object that does not exist, and you confirmed it.** A report item that can only be answered "yes" is not a check. If a future spec names something you cannot find, **say you cannot find it** — that answer is worth more than the confirmation.

---

# THE FIX — three parts, one of them report-first

## 1E — the CPNP mirror defect on the four remaining surfaces

You flagged this yourself and were right. My site table scoped those four to the operator row, and they carry the identical defect:

| Line | Surface | Still ungated |
|---|---|---|
| ~16714 | Brand Pack hero compliance tile | `'✓ CPNP notified' / '✗ CPNP'` |
| ~16929 | Brand Pack LLM prompt `complianceData` | `'CPNP: ' + …` |
| ~17133 | Brand Pack HTML compliance block | `['CPNP notified', …]` |
| ~25056 | Pitch LLM prompt `_pitchCompliance` | `'CPNP: ' + …` |
| ~30343 | Brand Pack PDF compliance rows | `['CPNP', …]` |

That is five, not four — the hero tile is a fifth, and you routed its operator row in 1C while leaving its CPNP badge beside it. **The exact shape of the L29517 defect this batch exists to remove: one row gated, its neighbour not.**

This ships in **1b, before the commit**, not in Shipment 2. Shipping Shipment 1 as it stands would fix half the assertion on five surfaces inside a batch whose spec spends three paragraphs warning against precisely that.

### REPORT FIRST, THEN APPLY — this part only

**Do not write 1E yet.** For each of those five compliance blocks, classify **every row** as framework-specific or framework-agnostic and send me the table. Rows I expect to see classified: CPNP, EU RP / operator (done), Safety Assessment, INCI, Certifications, Claims, and anything else present.

**`Safety Assessment` is the one I want your read on.** Under 1223/2009 the CPSR is a cosmetics artifact; a device's analogue is the technical file, held against a different obligation. If that row is as wrong as CPNP, it ships with it. If you think it is framework-agnostic as rendered — because `sku.safetyRef` is used as a generic safety-document reference across types — say so and show me where else it is read.

I would rather rule on your classification than have you guess at my scope. **Send the table, wait for the ruling, then apply.**

## 1F — the Apotek field map: the label stays, the value goes

`~L13533`, `_ATM_SEED_TEMPLATES.apotek_hjartat_se.fields[]`:

```js
{ label:'EU Responsible Person',  source:'brand.euResponsible' },
```

**Your reasoning is right and you closed half of it.** That label is Apotek Hjärtat's column name in their own submission format. Renaming it would break the submission, and it is not our claim to make.

**But the value is ours.** For a non-cosmetic SKU this sends `brand.euResponsible` — Cosmeservice GmbH — into a column headed "EU Responsible Person". That is the same false assertion, wearing a retailer's label instead of ours.

**Ruling: the `label` is untouched. The `source` yields empty when `getOperatorRegime(sku)` returns a non-cosmetic regime or `null`.** Apotek gets their column; we do not fill it with something untrue. Route it through the same resolver, take the label from the template, the value from the regime.

## 1G — the localised tables

Ratified as you built them. Keeping the Swedish and Danish headings for the cosmetic regime and the untranslated registry label for a non-cosmetic is the right trade: inventing a legal term of art in a language nobody here has verified would be fabricating provenance, which is worse than an English label a Nordic buyer can read.

**No change. Logged as an open item** — the official Swedish and Danish texts of the regulations carry the authoritative terms and can simply be quoted once the RP confirms which instrument applies. It rides with the citation question.

---

## STOP. NO COMMIT.

### SEQUENCE — this matters

1. **1F and 1G first** (1G is a no-op). Apply 1F.
2. **1E classification table** — report only, no code.
3. **Wait for my ruling on the table.**
4. Apply 1E.
5. Report, verify, then commit the whole of Shipment 1 + 1b as one commit.

### REPORT BACK

1. The 1E classification table — five surfaces, every row, framework-specific or agnostic, with your read on `Safety Assessment`.
2. 1F applied: confirm the `label` string is byte-identical and show how the value resolves for cosmetic / non-cosmetic / null.
3. Confirmation that **no rendered string changes for a cosmetic SKU in 1b** — 1F and 1E must both be no-ops on the cosmetic path. If either moves a cosmetic string, that is a finding, not a detail.
4. `sha256sum index.html`.

### VERIFY (byte — coding chat)

- acorn clean, 2 blocks
- all Shipment 1 single-definition counts hold; no new helper introduced without being named
- newly-added `2019/1020` = 0, `2023/988` = 0
- `resolveProductFramework` byte-identical
- cosmetic path: CPNP and operator rows render exactly as at `fdb6dcc8…` on all five surfaces
- all batch #3–#7 guards, **rendered-occurrence counting** — comment epitaphs expected and are not failures

---

## STILL SHIPMENT 2, UNCHANGED

- The `beauty_accessory` branch, 24 points, before `isUnknown`
- The two new form fields and their `BLOCKER_RESOLUTION` entries
- The device branch gaining the operator check
- **The unknown branch losing its `+6` and its green.** Your flag was right, the ruling stands: it asserts the cosmetic regime for an untyped SKU, which is #53 inside the scorer. Your explicit `{field:'euResponsible'}` with a comment saying what it is and is not was the correct way to hold it for one shipment.
