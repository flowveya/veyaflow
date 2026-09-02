# VeyaFlow — Concept #51: pack scan

**From the coding lane · 31 August 2026 · for Strategy**

Charlotte's idea, sharpened. **Not a build request** — a note arguing this belongs in the demand test rather than in the roadmap, and that the demand test does not require building it.

---

## The narrow version, which is the good one

**EU 1223/2009 Article 19** lists what must appear on a cosmetic label:

- responsible person's name and address
- nominal content at time of packaging
- date of minimum durability, or the PAO symbol where durability exceeds 30 months
- particular precautions for use
- batch number
- the product's function, unless clear from presentation
- the ingredient list, INCI, descending order by weight, headed *Ingredients*

That is a **closed, checkable set**. A photograph either shows a batch number or it does not. No interpretation, no regulatory judgment, no model opinion. This is the rare compliance question with a right answer that a picture can settle.

## The hook, and it is a Nordic one

Article 19 also requires the label to be in **the language of the member state where the product is sold**. VeyaFlow already knows the brand's target markets.

So: photograph a Swedish-language box, tell the system it is going to **Matas in Denmark**, and the answer is immediate and undeniable — *this label cannot be sold in that market as printed*.

That is the demo. Not "we checked your compliance" but one specific, concrete, expensive thing the founder had not thought about, produced from a photo in under a minute. It is also, from the registry work, **exactly the failure Nordic brands make when they expand one country sideways** — the assumption that Scandinavian markets are one market.

## The version to refuse

"Scan it and check the claims and ingredients."

A model reading a label photo will return an INCI list that is *nearly* right. Nearly-right ingredient data on a compliance record is worse than none — it is the confident-wrongness failure mode behind every finding in the ledger, with a new input channel.

**Design rule if this is ever built:** it reports what it could read and what it could not find. It never returns "label compliant."

> Batch number: **not found**
> PAO symbol: **not found**
> Ingredient list: read 14 entries, **low confidence on 3** — verify against your PIF
> Language: Swedish. Target market Denmark requires Danish.

Absence rendered as absence — the same principle as batch #5's muted "not recorded", and the reason that batch exists.

---

## The actual argument: this replaces the demand test, and needs no code

The launch assessment said the largest unknown in the project is whether anyone wants this, and proposed putting three registry facts in front of five Nordic beauty founders as a document.

**A pack scan is a better instrument than a document**, because a founder *reacts* to it rather than reading it. But the reaction is what we are testing — and the reaction does not require the feature to exist.

**Run it by hand.** Charlotte photographs a box. The Article 19 check is done manually against the list above. The founder sees the output, in the format above. What we learn is identical to what we would learn from a built version, and we learn it this week instead of after a sprint.

If five founders say *"I already check that"* — the moat is thinner than it looks, and one afternoon bought that answer. If they say *"can you do that for my Danish launch"* — that is the strongest signal this project has ever produced, and it justifies the build with evidence rather than enthusiasm.

**The trap to name explicitly:** this is the most fun idea in the project, and the test round is the least fun work in it. Building the demo instead of finishing the test round would feel like progress and would not be. Eight of ten modules are still unexamined; four of the ten findings so far were the product asserting something it had not earned. Adding a camera to that is premature.

## What it would cost, if it is built

Not large, and mostly not new:

- vision through the existing `anthropic-proxy` — the LLM path already exists
- the Article 19 element list as **registry data**, per market, with the language requirement — same shape as the retailer registry, same house rule: data drives the logic
- output through the existing readiness blocker structure — `labelElementMissing`, amber or red per element
- the Claim Localizer already takes text; pack copy is just another input to it

The genuinely new parts are image handling and confidence reporting. **Confidence reporting is the hard half**, and it is the half that decides whether this strengthens the honesty architecture or is the first thing to breach it.

---

## Strategy's call

1. Does the demand test happen this week, by hand, using pack scan as the instrument?
2. If the reaction is strong — does this go ahead of the multi-user layer, or behind it?
3. Is the Article 19 element list per Nordic market something the registry should carry regardless? **My view: yes, independent of this concept.** It is primary-sourced, checkable, market-conditional, and no brand has it in one place — the same shape as everything else that makes the registry an asset.

Logged as **#51**. No code, no batch, nothing scheduled. It does not touch the queue until the test round closes.
