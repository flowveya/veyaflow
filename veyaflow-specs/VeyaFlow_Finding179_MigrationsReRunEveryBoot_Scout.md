# VeyaFlow — #179: the SKU migration chain re-runs on every page load

**11 September 2026 · coding lane → CC · SCOUT. READ ONLY. NO EDITS.**

**Strategy raised this above #174 and it sits under #172, #162 and #165** — three shipments that
add writers for fields, count fields, and name missing fields. **If V3 prunes on every boot, all
three are undone at the next page load.**

**A cheap read that can invalidate four shipments runs before them, not after.** Same argument
already accepted three times this week: #148 before #135, #143 before #135, #167 before #165.

---

## NAMED BASELINES — ELEVEN SURFACES, UNCHANGED AT BOTH ENDS

```
index.html                                       <current — request from the lane; #167 is in flight>
dpp/index.html                                   e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                                      beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                                 fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js              78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js                   500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
netlify/functions/anthropic-proxy.js             7cf20b3fac29ae780403416729445ca1c5bdc65b16e11866cf0768fac273b8e5
netlify/functions/anthropic-proxy-background.js  1f6f47ab9ce46f91c7fe1fab9690272c544467f01efb30e8e330030edb96e0be
netlify/functions/get-brand-pack.js              fe285fe913766f6ac10da7e4ebd98566a8e0cdd40d35243908bba14369665382
netlify/functions/get-dpp.js                     3c050904cf530d2c2a1a9e5716b17736284d1891c2bf991ac88ef81e2b9fa395
netlify/functions/share-brand-pack.js            3791bbecc745fe5d5a31a6dd368e19d3105e272c027b6eeedbcd96f6c887cecb
```

**THIS IS A SCOUT. NO FILE CHANGES. `./verify.sh` must be GREEN, `0 of the 11 tracked surfaces
modified`, exit 0, at the end.** Any digest movement is a failure of the shipment.

**Measure in a pristine copy.** Nothing in the working tree is edited, including scratch.

---

## THE MECHANISM, ESTABLISHED AT THE BYTES — CONFIRM IT, DO NOT ASSUME IT

```
17846  migrateSkuSchemaV2:  if(sku._schemaVersion === 2) return;
17927  migrateSkuSchemaV3:  if(sku._schemaVersion === 3) return;
17992  migrateSkuSchemaV4:  if(sku._schemaVersion === 4) return;
18034  migrateSkuSchemaV5:  if(sku._schemaVersion >= 5)  return;
18100  migrateSkuSchemaV6:  if(sku._schemaVersion >= 6)  return;
18169  migrateSkuSchemaV7:  if(sku._schemaVersion >= 7)  return;
18223  migrateSkuSchemaV8:  if(sku._schemaVersion >= 8)  return;
```

**Three `===` guards, four `>=` guards.** A SKU at 8 fails `=== 2`, so **V2 runs and sets it back
to 2**; V3 then prunes, V4 backfills, and V5–V8 walk it up to 8 again. **Every boot. Forever.**

**Confirm the full chain on real bytes**, including what each of V2/V3/V4 writes to
`_schemaVersion`, and whether anything else in the load chain resets it. **State the version
sequence a single SKU passes through across two boots, measured.**

---

## THE FOUR QUESTIONS, IN ORDER OF WHAT THEY BLOCK

### 1. `_PHASE3_PRUNED_FIELDS` — what is deleted on every load

**Enumerate it.** For each name: is it written anywhere today, and by what?

**Then cross-reference against the shipments behind this scout:**

- **#135's dossier record** — `sku.dossier`, `sku.safetyAssessor`, `sku.pifRef`,
  `sku.safetyRef`, `sku.productCategory`. **This is the most important question in the scout.**
  #135 shipped yesterday and the face-tape run depends on it. **Does a confirmed dossier survive
  two boots? Measure it, do not reason about it.**
- **#172's six fields** — `nanomaterials`, `cmrSubstances`, `spf`, `frameFormulation`,
  `formulationRef`, `dtcWebsite`. If any is in the pruned list, **#172 cannot ship until this
  is fixed**, and that is the finding.
- **`manufacturerMoq`** — CC measured it survives two chain runs. **Say why**: absent from the
  pruned list, or protected by V3's legacy-product-type escape?

**V3 has an escape at 17928:** `if(!_CURRENT_PRODUCT_TYPES_LIST.includes(sku.productType))` →
preserve all fields, bump version, return. **So only SKUs with a CURRENT product type are
pruned.** Establish which of Cloud & Glow's 51 SKUs that covers. **A defect that spares legacy
records and eats current ones is worse than one that eats everything**, because the surviving
sample looks healthy.

### 2. `_PHASE4_BACKFILL_DEFAULTS` — what is re-created on every load

The inverse hazard, and **it may be the sharper one.** V4 writes a default for any key **not
present** in the SKU. So a field a user **deliberately cleared** is silently repopulated on the
next boot.

**Enumerate the map.** For each key: what is the default, and can a user reach a state where that
key is absent? **`''` and `[]` defaults are mostly harmless; a non-empty default is a value the
app asserts on the user's behalf**, which is #134's class arriving through the schema layer.

### 3. Is each re-run idempotent in effect, not just in name?

The guards are named "idempotency". **Test the claim.** For a SKU that has been through the full
chain, run it again and diff the object **key by key, value by value**.

**Report any field whose value differs after a second run.** Zero differences is the answer we
want and it must be measured, not assumed — this is the scout's central evidence.

**V6 and V7 also touch `dppData`,** and V7 calls `loadDPP()` defensively at 18162. **Report what
those two do on a re-run against already-migrated `dppData`** — a published DPP's fields are a
surface where a silent rewrite would be serious.

### 4. Size the fix

**Strategy's instruction for #147 applies here: size it, do not only map it.**

The obvious repair is `===` → `>=` on three lines. **Say whether that is sufficient and what it
would break.** Specifically: does any of V2/V3/V4 currently rely on re-running to repair a state
an earlier version left behind? **V7's own comment says it re-runs V6 logic for SKUs "stuck" at
6** — so at least one migration was written deliberately to catch stragglers. **If the chain's
re-entrancy is load-bearing anywhere, `>=` alone would strand those records**, and that changes
the fix from three characters to a migration of its own.

---

## OUT OF SCOPE

- **Any edit.** This is a read. The fix is specced after this report.
- **Brand migrations** (`migrateBrandSchemaV3`). SKUs only.
- #167 (in flight), #165, #172, #162, #147.

---

## REPORT BACK

1. **All eleven digests before and after — unchanged. `0 of the 11 tracked surfaces modified`.**
2. The version sequence one SKU passes through across two boots, measured.
3. `_PHASE3_PRUNED_FIELDS` in full, each classified, **with #135's dossier fields and #172's six
   answered explicitly.**
4. `_PHASE4_BACKFILL_DEFAULTS` in full, each classified, **flagging every non-empty default.**
5. **The key-by-key diff of a second chain run.** Zero differences, or the list.
6. What V6/V7 do to already-migrated `dppData` on a re-run.
7. **The sizing: is `===` → `>=` sufficient, and what relies on re-entrancy?**
8. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

**GREEN, `0 of the 11 tracked surfaces modified`, 0 not found, exit 0.** A scout that moves a
digest has stopped being a scout.

---

## NO SMOKE

Nothing ships. **Question 3's diff is the evidence**, and question 1's dossier measurement is
the one that decides whether yesterday's shipment survives a page refresh.
