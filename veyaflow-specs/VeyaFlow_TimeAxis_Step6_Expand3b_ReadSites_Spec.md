# VeyaFlow — Time axis step 6: expand phase 3b, the read-to-display sites

**9 September 2026 · coding lane → CC**

The quiet shipment, and it should be quiet — that is the payoff for having taken `_ssCanon`
alone. Roughly eighteen sites, every one a read that produces a display string. **Nothing
hashed, nothing written, nothing published.**

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           8fd343de9d80bf17dfb89639e00d9be85e6f6e87c82f443fcf55b6f3505fd34c
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async`. **Confirm all six. Only `index.html` moves.**

---

## SCOPE — DEFINED BY SHAPE, NOT BY A LINE LIST

**In scope: every site that READS `sku.certifications` or `heroSku.certifications` and turns
it into a displayed or prompt string.** The lane's enumeration, to be checked rather than
trusted:

| | site |
|---|---|
| prompt context | 17214, 25407 — `heroSku…join(', ')` or `'None'` |
| readiness row | 17474 — `.slice(0,2).join(', ')` |
| pitch context | 21383 |
| **exports, six locales** | 21978, 21994, 22007, 22019, 22034, 22049 — `.join('; ')` |
| text export | 22093 |
| spec sheet row | 29997, 30002 — **the `Array.isArray` ternaries** |
| brand pack row | 30744 |
| PDF rows | 35464, 35864 |
| portal pack builder | 40129 — `(sk.certifications||[]).forEach` into `claimsSet` |
| DPP readiness boolean | 34674 — `!!(… && …length>0)` |

**Enumerate independently and report any site the lane missed or mis-scoped.** One line was
elided in the lane's grep (20356) and has not been classified — **classify it and say which
phase it belongs to.**

---

## EXPLICITLY NOT IN THIS SHIPMENT

- **34592** (`publishDPP` payload) and **35734** (`buildDPPJson`) — these **send** the raw
  field rather than display it. Normalising them would change **what is published**, which is
  migrate, not expand. They also interact with `share-dpp.js:41`'s `Array.isArray` gate and
  need that ruling first.
- **20449/20450, 20662/20663, 20704/20705** — the SKU editor's
  `skuForm.certifications?.includes(cert)` membership tests. `includes` on the object form
  fails, but `skuForm` is written by `toggleSkuCert`, so these move **with the writer** in the
  migrate phase. Splitting them from it would leave the editor reading one form and writing
  another.
- **`brand?.certifications` sites** — 26188, 32393, 32432, 32485, 34718 (existing hand-rolled
  `c.name||c`) and 33471 (`.some(c=>c.expiryDate)`). Those are **3c**, and 33471 needs its own
  ruling because it reads a field the reader deliberately does not.
- `_ssCanon` — done in 3a.
- Third-party reference data. Permanently.

---

## IMPLEMENT

Replace each in-scope read with `normalizeCertifications(...)`. **The reader already exists in
this file** at 4952 — do not add a second copy.

**29997 and 30002 lose their `Array.isArray` ternary entirely:**
```js
// before
row('Certifications', Array.isArray(sku.certifications) ? sku.certifications.join(', ') : sku.certifications);
// after
row('Certifications', normalizeCertifications(sku.certifications).join(', '));
```
Those ternaries were **defensive, not evidential** — established in 3a. The reader handles all
three shapes, so the branch is now a check that cannot fail.

**Watch the fallbacks.** Several sites end `|| 'None'`, `|| '—'`, or `|| ''`. An empty array
joins to `''`, which is falsy, so the fallback still fires — **but prove it per site rather
than assuming it.** `.length ? … : 'None'` and `.join() || 'None'` are not the same expression
and this shipment must not quietly convert one into the other.

**34674 is a boolean, not a string.** `!!(sku.certifications && sku.certifications.length>0)`
becomes `normalizeCertifications(sku.certifications).length > 0`. **This can change behaviour:**
a certifications array containing only unusable entries is currently `true` and would become
`false`. State whether that is reachable — if it is, it is a **fix**, and it must be reported
as a difference rather than a pass, exactly as 3a's whitespace case was.

---

## THE EVIDENCE

Same three-way method: capture each site's output **before** editing, compare old vs new vs
the capture across the same input set.

**Use 3a's eight shapes plus the empty and null cases**, and add one input per fallback style
so the `|| 'None'` / `|| '—'` behaviour is measured rather than reasoned about.

**Expected: byte-identical everywhere except 34674's unusable-entries case, if it is
reachable.** Any other difference stops the shipment.

---

## REPORT, DO NOT IMPLEMENT

1. **Whether 40129's `claimsSet` behaviour is unchanged.** It builds `pack.claims`, which is
   what the **portal renders to a buyer** — and #113 was a `claims` problem. If normalisation
   drops an entry that previously became a key, a badge disappears from a buyer-facing page.
   **Prove it, do not assume it.**
2. **Whether any in-scope site feeds something hashed, published, or persisted** rather than
   displayed. 3a established `certs` is the only hashed field; confirm none of these eighteen
   reaches storage.
3. **The six export locales — are they byte-identical to each other in structure?** If one
   diverges, that is a finding of its own: six near-copies is the shape that produced #128.

---

## STOP. NO COMMIT.

---

## REPORT BACK

1. sha256 of all six before and after — **only `index.html` differs**.
2. Your independent enumeration, and any site the lane missed or mis-scoped, including 20356.
3. The evidence table.
4. **34674's behaviour question**, answered with reachability.
5. The three reports.
6. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS; five others UNCHANGED; `1 of the 6 tracked surfaces
modified`. **The copy gate must still report three surfaces** — this shipment adds no copy,
and if the count changes something is wrong.

---

## SMOKE

**Step 1.** Export a retailer sheet for a SKU with certifications, in two different locales.
The certifications field reads exactly as before.

**Step 2.** Generate a Brand Pack. The certifications line is unchanged.

**Step 3 — the buyer-facing one.** Open a shared brand pack in the portal. The claim badges
are the same set as before this shipment.
*Failure: any badge missing. That is report 1 having been wrong.*

**Step 4 — the step that passes only if nothing else moved.** A SKU with no certifications
still shows `None` / `—` wherever it did before, and not an empty string.
