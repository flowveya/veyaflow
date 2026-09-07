# VeyaFlow — #113: brand claims render to the buyer as verified fact

**7 September 2026 · coding lane → CC**

Found on the live retailer portal during #110 smoke. **This is buyer-facing**, it concerns
certification claims, and the same page contradicts itself about them.

---

## NAMED BASELINES — TWO SURFACES

```
portal.html  sha256   b96423ac3c931561ed29329d2864e884467dc8b6605b6c44f8e5fbbb24d2b408
             short    b96423ac
index.html   sha256   4a3a2e982ebc75ba3104de8aac697e6a217be5b61d96b2adb1beee21801c0a0b
             short    4a3a2e98   · 41,307 lines · 2,722,881 bytes
```

Branch `f2b-async` at `e42b66b`, which is the current production deploy. **Confirm both
before editing** — several days have passed.

**`portal.html` has been unchanged since batch #5.** It is one of the four tracked surfaces
`verify.sh` compares. Touching it moves a baseline that has been stable for weeks, so the
new value must be named by the lane in the same commit, exactly as `index.html`'s is.

---

## THE DEFECT

`portal.html:1050`:

```js
(s.claims||[]).forEach(function(c){
  html += '<span class="detail-badge detail-badge-green">' + esc(c) + '</span>';
});
```

Six items — COSMOS ORGANIC, B CORP, VEGAN SOCIETY, CRUELTY FREE INTERNATIONAL, NORDIC SWAN,
FSC PACKAGING — render to a retail buyer as green badges. `.detail-badge-green` is
`#ECFDF5` / `#065F46`: the **success palette**, the same visual language as the `✓` in the
compliance table further down the same page.

The field is called `claims`. They are rendered as findings.

### THE PAGE CONTRADICTS ITSELF

The compliance table below (`renderCheckCell`, 1160–1215) is scrupulous. It has four
states, a legend, and a comment at 1170 reading *"absence of information must not render as
failure."* On the observed submission, the Face Serum's **CLAIMS column shows `–` — not
recorded.**

So one page tells a buyer, ten inches apart:

- **six claims, in success green, unqualified**
- **CLAIMS: `–` not recorded**

Same brand, same submission, same screen. This is the DENMARK/Market contradiction (fixed
3 Sep) on a surface that goes to a customer.

### THE STATE ALREADY EXISTS AND IS BEING DISCARDED

`index.html:38323–38327`, inside `buildSubmitSnapshot`:

```js
// per-market claim lights: run the SKU's declared claims (if any) through getClaimLight
var claims = (sku0 && Array.isArray(sku0.claims)) ? sku0.claims : [];
claimLights = claims.map(function(c){ var L = getClaimLight(c); return { claim:c, light:L.light }; });
```

`claimLights` is computed at submit time and frozen into the snapshot. **The portal renders
`s.claims` and ignores `s.claimLights`.** This is not a missing capability. The work was
done, and the buyer-facing surface throws the answer away and paints everything green.

---

## IMPLEMENT

Claim badges must carry their state, and green must mean on this surface what it means in
the table twenty lines below.

- Render from the claim's **light**, not from the bare string.
- A claim whose light is not the satisfied state **must not use the success palette.**
- The badge row needs the same legend discipline the table has: a buyer must be able to
  tell the states apart without guessing.

**The lane is not specifying the visual treatment.** Colour and badge styling are DESIGN's
(Daylight, zero-emoji). Implement the state distinction using tokens already in
`portal.html`; if the honest rendering needs a treatment that does not exist yet, **report
that instead of inventing one.**

---

## REPORT, DO NOT IMPLEMENT

1. **Does `claimLights` reach the portal payload at all?** It is in `buildSubmitSnapshot`'s
   return, but the portal reads `s.claims`. State whether both fields arrive, whether they
   agree, and whether `s.claims` is the SKU's claim list or something else. **If
   `claimLights` does not reach the portal, say so — the fix is then a payload change and
   this spec is wrong about the remedy.**
2. **`★ VeyaFlow Verified` — line 1048. This is the most important report in this spec.**
   ```js
   if(s.verified){ … '★ VeyaFlow Verified' + (s.verifiedTier ? ' · ' + esc(s.verifiedTier) : '') … }
   ```
   This badge asserts **our own verification**, in gold, to a buyer. State exactly what sets
   `s.verified` and `s.verifiedTier`, and on what basis. **Do not fix it. Do not guess.** If
   it is brand-entered or trivially defaulted, we are putting our name on a verification we
   did not perform, and that is a Strategy decision, not a code change.
3. **The unknown-claim path.** State what `getClaimLight` returns for a claim it does not
   recognise, and whether that state is distinguishable from a satisfied one. **Fail-closed
   is the requirement**: an unrecognised claim must not render as verified.

---

## OUT OF SCOPE

- **#114** — the `other` rejection reason (populated but uninformative). Separate spec.
- **#112** — the off-screen add form. Separate spec, may already be in flight.
- #110's render half, 40700–41040, still unscanned.
- The "2 of 2 products ready / 1 item needs attention" headline. Registered, ranked below
  this, not in this spec: the legend does define Ready as *no blocking issues*, so it is
  honest — but the headline is large and the definition is small.

---

## STOP. NO COMMIT.

One implement, three reports. Report 2 in particular: **do not touch line 1048.**

---

## REPORT BACK

1. sha256 of `portal.html` and `index.html` before editing; confirm both matched.
2. Before/after for the badge rendering, and which existing tokens were used.
3. The three reports above.
4. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected. **`portal.html` will DIFFER from `b96423ac` — the first time since batch
#5.** The lane names the new value from an independent `shasum`. `index.html` should be
UNCHANGED at `4a3a2e98` unless report 1 forces a payload change, in which case stop and
report before touching it.

---

## SMOKE

**Step 1.** Open the Lyko submission in the retailer portal. Each claim badge shows a state
that a buyer can read, and no unrecognised or unsubstantiated claim appears in the success
palette.
*Failure: any claim rendering as established when the table below records it as not
recorded.*

**Step 2 — the contradiction is gone.** Read the badge row and the CLAIMS column together.
They must not say different things about the same claim.
*Failure: any disagreement between the two, in either direction.*

**Step 3 — the step that passes only if nothing else changed.** A submission whose claims
are all genuinely satisfied renders exactly as it did before.
*Failure: any change to the satisfied case — this fix must only affect claims that were
being over-stated.*
