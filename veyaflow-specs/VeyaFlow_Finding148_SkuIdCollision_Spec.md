# VeyaFlow — #148: SKU ids collide on the recommended import path

**9 September 2026 · coding lane → CC**

**Two halves, and only the first is implemented here.** Stopping the bleeding is provably
safe; repairing existing data is not, and the reason is a printed QR code.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           80555dccd90119286eb5d48679e0abef203c75e20bb5d67ce201b411646a488b
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `0f8f77a`. **Confirm all six. Only `index.html` moves.**

---

## THE DEFECT — LIVE TODAY, NO MIRROR INVOLVED

`newSkuForm()` sets `id: Date.now().toString()` — **millisecond resolution** — and the
importer calls it inside a **synchronous `.map()`** over every row. Measured in the scout:

```
 20 rows →  2 distinct ids  (18 collisions)
100 rows →  1 distinct id   (99 collisions)
500 rows →  4 distinct ids  (496 collisions)
```

`id` is not in `SKU_FIELDS`, so nothing overwrites it downstream. There are **24
id-resolution points**, every one `.find()` returning the **first** match.

**So on the app's own RECOMMENDED import path, a brand imports a hundred products and Edit,
Export, CPNP, DPP, INCI and packaging all resolve every one of them to the same object.**

It is also **the precondition for the merge ruling**: *union on id* and *same id both sides →
keep both* are undefined when a hundred local SKUs already share one id.

---

## PART 1 — IMPLEMENT: STOP THE BLEEDING

`newSkuForm()` uses **`retailUuid()`** (37882) instead of `Date.now().toString()`.

```js
retailUuid(){ return Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8); }
```

Already in the tree, already used for retail rows, and it carries a random component — so it
is collision-safe within a millisecond. **Do not invent a generator.**

**Check the ordering.** `retailUuid` is defined at 37882; `newSkuForm` at ~18234. Function
declarations hoist **within a block** — confirm both are in the same script block and report
it. If they are not, say so and stop; that changes the fix.

**Report whether any other creator of SKU-shaped objects uses the same timestamp pattern.** The
importer is one path; there may be others. **The count is the finding.**

---

## PART 2 — REPORT ONLY: THE BACK-FILL CANNOT BE SPECIFIED BLIND

Part 1 fixes new SKUs. **Existing catalogues keep their collided ids**, and repairing them runs
a migration on data with **no server backup** — the scout established that nothing survives a
cleared browser.

**And a constraint that makes reassignment unsafe rather than merely risky:** a published DPP's
id is `vf-{skuId}-{ts}`. **The SKU's id is embedded in a URL behind a printed QR code**, and
the standing rule is that **QR is the only physically permanent surface.** Reassigning the id
of a SKU with a published passport breaks a link that exists on packaging.

**Report, do not implement:**

1. **How many SKUs in a colliding group can have published DPPs**, and how the tree records
   that — `dppData[skuId].dppId`, `publishedAt`, or the server row. **If two SKUs share an id
   and one is published, which one owns the passport?** State whether it is decidable from
   stored content (name, EAN) or genuinely ambiguous.
2. **Every reference keyed by `sku.id`.** The scout named `dppData` and
   `retailSubmissions[].skuIds`; enumerate the rest across all six surfaces. **Anything the
   back-fill misses becomes an orphan with no backup to recover from.**
3. **Whether `migrateBrandSchemaV3`'s pattern transfers** — `_schemaVersion` guard, idempotent,
   handles multiple prior states. Report what a SKU equivalent would need that the brand one
   did not.
4. **What a non-destructive back-fill looks like.** The lane's instinct, for you to confirm or
   refute: assign a new unique id, **preserve the old one as `legacyId`**, and resolve
   references through either — so nothing is deleted and a bug is recoverable by reading
   `legacyId`. Say whether that holds against the 24 resolution points.

---

## A RULING BY EXTENSION, FOR STRATEGY TO OVERTURN

Where a collision is genuinely ambiguous — two SKUs share an id, one published passport, no
content that distinguishes them — **the system does not choose.**

That follows directly from Strategy's merge ruling: *when two parties disagree about what is
true, the platform's job is to make the disagreement visible, not to guess.* So the passport
attaches to **neither**, both SKUs are marked `attention`, and the orphaned record is
**preserved, not deleted.**

**Flagged as an extension rather than assumed** — Strategy may want it ruled explicitly, since
it means a published passport can end up attached to nothing until a human resolves it.

---

## OUT OF SCOPE

- **#143** the mirror, **#147** identity. The scout put identity **upstream** of the mirror;
  this is upstream of both.
- The back-fill itself. Report only.
- #135, #136, #144, #145, #146, M2–M4.

---

## STOP. NO COMMIT.

One implement, four reports, one flagged ruling.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. Before/after for `newSkuForm`, and the block-ordering confirmation.
3. **Evidence the collision is gone**, measured the way the scout measured it: generate 100
   SKUs and count distinct ids.
4. **Evidence nothing else moved** — an existing catalogue's ids are untouched by this change.
5. The four reports.
6. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS; five others UNCHANGED; `1 of 6 modified`.

---

## SMOKE

**Step 1.** Import a CSV with 20 rows. Open each of three of them in the editor — **each shows
its own data.**
*Failure: two rows resolving to the same product. That is the defect, and it is what the app
does today.*

**Step 2.** Add a SKU manually, then another immediately. Both are editable independently.

**Step 3 — the step that proves nothing existing broke.** An existing SKU still opens, exports,
and shows its DPP as before.
*Failure: any existing SKU losing its passport link — this change must not touch existing ids.*
