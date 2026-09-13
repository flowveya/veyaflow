# VeyaFlow — #164: the Universal export must carry its own state

**12 September 2026 · coding lane → CC · ruled by Strategy 10 Sep**

**The gate stays off. The file starts telling the truth about itself.**

---

## THE RULING, SO IT TRAVELS WITH THE CODE

The lane asked Strategy to choose between **(a)** gating the Universal export like the retailer
ones and **(b)** leaving it open. **Strategy refused the frame.**

**(b)'s principle is not negotiable:** a brand's own data is the brand's own, and **we never hold
it hostage behind our own scoring.** **And (a)'s observation is also true:** five blocked retailer
cards sitting above two live download buttons teaches the user where the unlocked door is.

> **THE RESOLUTION IS IN THE RECIPIENT, NOT THE LOCK.** The retailer-specific exports are gated
> because they are **documents addressed to a buyer**. Universal, as the brand's own record, is
> **addressed to the brand**. *Same cut as the badge ruling and the calendar ruling — third
> instance.*

**The condition:** Universal carries **the same state markers as the app**, and **nothing that
reads as a readiness claim.**

**The test:** *would this file embarrass us if a retailer's compliance department had it in hand?*
**If yes, it is a buyer document in disguise and must be gated.**

> **The way to make a shortcut safe is to make the shortcut HONEST, not to lock it. If the export
> shows the gaps, whoever walks around the gate takes the gaps with them.**

---

## NAMED BASELINES

Request current values from the lane. `index.html` at `dd358cac…` as of `50c307f`; the other ten
unchanged. **Only `index.html` moves.**

---

## WHAT EXISTS TODAY

`EXPORT_OPTIONS` (≈22065) gives both Universal rows `ready:true`, **hardcoded** — every retailer
row computes `r.ready.includes(…)`. `exportForRetailer` (≈22160) runs everything through
`sanitiseSkuForRetailer`, so **no private field leaks** — verified on the first real export, 11
Sep. That is not in question.

**The JSON path already has a `_meta` block** — `generatedBy`, `date`, `brand`, `retailer`,
`format`. **The CSV path has no metadata of any kind.** That asymmetry is the hook.

---

## IMPLEMENT — THE FILE DESCRIBES ITS OWN STATE

**Both Universal formats carry, at the top and unmissable:**

1. **What is missing.** The SKU's incomplete required fields, **named** — `skuReadiness().missing`
   already computes exactly this list and the CPNP modal already renders it. **Reuse it; do not
   compute a second answer.** Two surfaces disagreeing about what is missing is worse than
   neither saying.
2. **When it was generated**, and **that VeyaFlow generated it** — the JSON's `_meta` already
   does this; the CSV must too.
3. **Nothing that reads as a readiness claim.** No percentage, no "complete", no tick, no score.
   **A number invites a reading the file cannot support.**

**The label is currently false and must be fixed in the same shipment:** *"Full product data in
JSON"* — it is the 40-name `RETAILER_SAFE_FIELDS` allowlist, deliberately and correctly. **Say
what it is.** A file that overstates its own contents fails Strategy's test on its own.

**DESIGN owns the wording. The lane owns that the three facts are present.**

**For the CSV specifically: report how metadata can lead a file that must still open cleanly in
Excel.** Comment rows, a header block, a sidecar — **say what you propose and what it costs**, and
whether it survives Apotek Hjärtat's *"opens directly in Excel"* promise. **If there is no form
that does both, that is the finding**, and the answer is a ruling, not a workaround.

---

## #183 RAISED — THE CONDITION IS ALREADY FAILED ON THE GATED EXPORTS

**Strategy's test was written for Universal. Apply it to the file that actually went out on 11
September and it does not pass.**

The first Apotek Hjärtat CSV ever produced carries:

- **`Påståenden,Smooths Wrinkles`** — a claim, with **no compliance status**, **while the app holds
  that status.** `CLAIM_REGISTRY` rates `'reduces wrinkles'` **amber** for cosmetics and **red for
  accessories** (*"cosmetic efficacy claim — not permitted"*). **A forehead tape sits exactly on
  that boundary.** The export ships the assertion and withholds the assessment — the
  eleven-days-of-*"no specific reason"* shape.
- **`Artikelnummer`**, blank by construction (#166), on a file bound for an article portal.
- **`INCI: Aqua, Glucerin, Asorbic Acid`** — free text, unvalidated, in a controlled vocabulary
  (#171).

**So "would this embarrass us in a compliance department's hands" is not a Universal question.**
The gated exports are the ones that reach buyers, and they carry claims without the assessment
the product performed.

**Reported, not folded in.** #164 is about a file the brand keeps; **#183 is about files a buyer
receives**, and they are different shipments with different audiences. **But #183 is the more
serious of the two**, and the lane's view is that it should be specced before #164 ships, so that
the honest form is decided once on the harder case and inherited by the easier one.

**Strategy to rule on the order.**

---

## OUT OF SCOPE

- **Gating Universal.** Ruled: it stays open.
- **#183** — state markers on the retailer-facing exports. Raised above.
- **#166** (`articleNo` allowlisted and stripped) and **#171** (INCI unvalidated). Separate.
- #179, #147, #181, #180 Part 2, #165, #172, #162.

---

## STOP. NO COMMIT.

Three facts in two formats, one false label, one CSV-metadata proposal.

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **Evidence the missing-field list comes from `skuReadiness().missing`** and not a second
   computation. **Name the line.**
3. Before/after for both Universal formats, **and the corrected label.**
4. **The CSV metadata proposal, with the Excel cost stated.**
5. **Evidence no retailer export changed** — this shipment touches the two Universal rows only.
6. **Evidence the file carries no readiness claim**: no percentage, no "complete", no score, in
   either format.
7. Anything noticed and not fixed.

---

## VERIFY

**Mid-batch reads `AWAITING NAME for: index.html`, exit 1 — correct since #174.** Every other gate
passes; ten other surfaces unchanged.

---

## SMOKE

**Step 1.** Export Universal JSON for an **incomplete** SKU. **The missing fields are named at the
top**, and the file says who made it and when.

**Step 2.** The same for CSV — **and it still opens in Excel without a warning.**

**Step 3.** Export for a **complete** SKU. **The file says nothing is missing and still makes no
readiness claim.** *Failure: a percentage, a tick, or the word "complete" — that is the claim the
ruling forbids.*

**Step 4 — Strategy's test, run by a human.** Read the file as if you were a retailer's compliance
officer who was sent it by mistake. **Does it embarrass us?** If yes, it is a buyer document in
disguise and the ruling says gate it.
