# VeyaFlow — Launch Readiness Assessment

**From the coding lane · 28 August 2026 · for Strategy**

Charlotte asked two questions: how far have we come, and when could this launch. She then sharpened the second one — *"I do not want a platform that works, it should be useful and needed."* That is the right correction, and this document is organised around it.

## Standard of evidence

Everything in the first three sections is **verified from bytes** — sha256-fingerprinted source, parsed, grepped, and in several cases tested against the deployed build. Where I am inferring rather than verifying, I say so. Where the question belongs to Strategy rather than to code, I say that too.

This matters because the last two days were spent removing numbers that had no referent. A launch date with no referent would be the same defect wearing a calendar.

---

## 1. What is built — verified

**A real compliance engine.** `scoreReadiness(brand, sku, market, retailer)` evaluates a product against a specific retailer in a specific market, routed by regulatory framework — CE for devices, CPNP for cosmetics, GPSR and REACH for accessories. Since batch #2 that routing runs through a single resolver with `unknown` as a first-class outcome, so an untyped product is never silently assumed to be a cosmetic.

**Retailer intelligence that isn't available elsewhere.** The registry carries primary-sourced operational facts: Apotek Hjärtat retired Excel notifications in 2026 and now requires a PDX portal invite from `Masterdata.supplier@apotekhjartat.se`; Åhléns has no supplier portal and auto-rejects incomplete masterdata files sent to a named buying-assistant inbox; Matas publishes full supplier terms; almost no Nordic retailer publishes a seasonal buying calendar, so windows must come from the buyer. **This is the asset.** It is not derivable from the product, it degrades if not maintained, and it is the reason a brand cannot simply do this in a spreadsheet.

**A working two-sided round trip.** Test 1 verified it end to end on the deployed build: a brand submits a pack, a retailer changes status in the portal, a rejection carries a structured reason, and the change syncs back to the brand within the poll interval. The retailer side is genuinely multi-tenant — Supabase auth, `retailer_accounts`, row-level security.

**Working output.** DPP passports with QR codes, retailer-specific Article Templates pre-filled from SKU data, claims evaluation per market, CSRD pack.

**An honesty architecture that is now enforced, not aspirational.** Four batches shipped in two days removed: a fabricated "pre-qualified by VeyaFlow — all compliance checks completed" banner shown to buyers above a table of failures; a Verified tier fabricated by a `|| 'Verified'` fallback; an ESPR indicator that had been structurally green since it was written; a readiness score blended from one arbitrary product and presented as a fact about the brand; and silent save failures that reported success while losing data.

That last cluster matters more than it looks. **A compliance product that fabricates is worse than no product**, because the customer's whole reason for buying is that they cannot personally verify the answer. The moat is not the feature list. It is that this thing tells the truth including when the truth is "we don't know" — and that is now demonstrably enforced rather than claimed.

---

## 2. What is not built — verified

**It is a single-tenant application on the brand side.** One brand, one browser, no accounts. `ns_skus`, `ns_brand`, `ns_crm` and the rest live in localStorage. There is no brand authentication and no server-side source of record for brand, SKU or CRM data.

**Thirteen RLS-enabled tables have zero policies.** They are default-deny, service-role-only. Any multi-brand use requires authoring per-account policies for all of them.

**No durability behind the most valuable data.** `ns_skus` has no server mirror at all, and the Supabase project is on the free tier, which the dashboard confirms takes **no backups**. Batch #3 fixed the app lying about failed saves; it did not give the data anywhere else to live.

**Eight of ten test modules have never been examined.**

---

## 3. What the test round actually says

Two modules tested. **Both returned `buggig`.**

- **Test 1 (portal round trip):** twelve findings, including a fabricated compliance claim on the buyer-facing surface.
- **Test 2 (My Products):** storage and migrations proved sound across four reloads — genuinely good for eight sequential migrations rewriting the store at every load — but the save path reported success it had not earned, losing work silently on the one store with no backup.

Findings now run **#13 to #44**, of which roughly thirty remain open. Two were withdrawn after testing contradicted them, which is how it should work.

**The honest inference: on a sample of two, the serious-defect rate is 100%.** Listing Checklist, Claims, DPP, CSRD, Article Templates, CRM, Buyer Comms and Performance are unexamined. Test 3 already has two findings pre-registered against it before anyone opens it.

**This is why I will not give a launch date yet.** The test round is not a quality checkpoint before launch — it *is* the estimate. Two or three more sessions of the kind we ran on 27–28 August will tell us what the remaining work is. Any number offered before that is invention.

---

## 4. The gate

Three things must be true before a brand that is not Charlotte touches this. None is negotiable and none is about features.

1. **The test round completes and its fix batches ship.** Not because the defects are individually fatal, but because we do not currently know what is in eight of ten modules, and the two we opened both contained something serious.
2. **Brand data survives the loss of a browser.** Either a server mirror, or an export-and-restore path a non-technical founder can actually use unaided. Today, clearing site data destroys a brand's entire catalogue with no recovery.
3. **Backups exist.** Free-tier Supabase has none. Once `submission_status_log` records what a buyer said and when, it is a commercial record, and commercial records need to survive.

**One dated item, unrelated but real:** the GitHub PAT expires **11 September 2026**. Pushes stop working that day unless rotated.

---

## 5. Two launch shapes, and why the distinction matters

These are different products with different dates, and conflating them is the main way this slips.

**A closed, hand-onboarded pilot** — three to five friendly brands, one or two retailers, Charlotte onboarding each personally. **This may not require the multi-user layer at all.** The retailer side is already multi-tenant; the brand side is device-local, which is exactly how Cloud & Glow uses it today. Each pilot brand works in their own browser and submits into the shared portal. Architecturally this is possible now. It needs the gate above, not a rebuild.

**Self-serve** — brands sign up unaided. This requires the full multi-user layer: authentication, server-side data, policies for thirteen tables, and re-verification of every surface that currently assumes one user. That is a project measured in weeks, not a batch, and it sits behind the pilot rather than before it.

**Strategy's decision, and I think it is the highest-leverage one available:** *can the first pilot run on device-local brand data?* If yes, the date moves left by a month or more and multi-user becomes a scaling problem rather than a launch blocker. If no, everything queues behind it.

---

## 6. Useful and needed

Charlotte's correction deserves a direct answer, and it needs a clear line between what code can establish and what it cannot.

**What the code establishes:** the product knows things a brand does not and cannot easily find. That Apotek Hjärtat's Excel route is dead. That Åhléns will reject an incomplete file rather than come back with questions. That a claim permitted in Sweden is amber in Germany. That an LED face mask is a device and CPNP does not apply to it. **That knowledge is the product. The platform is only its delivery mechanism.**

**What the code cannot establish:** whether a brand will pay for it. No amount of building answers that, and building more is the most expensive possible way to avoid asking.

**What the last two days did establish, sharply:** the failure mode of this category is confident wrongness. Every serious finding was the product asserting something it had not earned — a completed compliance check, a Verified tier, a green ESPR light, a readiness score, a successful save. All of them looked like competence. A brand relying on any of them would have carried the risk without knowing it.

So the answer to "useful and needed" has two halves. The registry knowledge is what makes it **useful**. The demonstrated refusal to fabricate is what could make it **needed** — because a compliance tool that guesses is a liability, and one that reliably says "product type not specified" instead of guessing is a different kind of object. That distinction is now enforced in code and can be shown to a buyer.

**A concrete suggestion.** The fastest way to learn whether this is needed is not to finish the platform. Three or four of the registry's operational facts — the PDX change, the Åhléns rejection behaviour, the absent buying calendars — can go in front of five Nordic beauty founders **this week**, as a document, with no login. If they already know all of it, the moat is thinner than it looks and better to learn now. If they don't, that reaction is worth more than another month of building, and it will shape what the pilot needs to prove.

That is Strategy's call, not mine. But it is the one piece of evidence the coding lane cannot generate, and it is currently the largest unknown in the project — larger than any finding in the ledger.

---

## 7. What I would do next, in order

1. **Finish the test round** — tests 3 to 10, at two or three modules per session. This converts an unknown into a plan.
2. **Ship the resulting fix batches**, DPP truth first: findings #41, #27, #30 and #31 sit on the `/dpp/` page, which is **public** and reached by a QR code on physical packaging. It is the only surface here that leaves the building without a login.
3. **Answer the durability question** — mirror or export path, plus backups. This is the real content of the "Supabase Pro vs keepalive" item, which was filed as a convenience question and is actually about whether brand data can survive.
4. **Then** decide multi-user versus hand-onboarded pilot, with the test round's results in hand rather than as a guess.
5. **Rotate the PAT before 11 September.**

## 8. Decisions Strategy owns

- Can the first pilot run on device-local brand data, or is multi-user a hard gate?
- Does the demand test happen now, in parallel with the test round, or after?
- What does a pilot have to prove — that brands will use it, that retailers prefer VeyaFlow submissions, or that brands will pay? Those need different pilots.
- Supabase Pro: now, as durability infrastructure, or later as a scaling cost?

---

**Summary in one line.** The engine is real, the knowledge is real, and the honesty is now enforced rather than claimed — but eight of ten modules are unexamined, brand data has no home outside one browser, and nobody outside this building has yet been asked whether they want it. The first two are knowable within weeks. The third is the one that decides whether any of the rest matters.
