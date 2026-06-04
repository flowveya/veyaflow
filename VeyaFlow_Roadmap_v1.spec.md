# VeyaFlow Roadmap — Companion Spec

> **HTML = source of truth for *what*. This spec = source of truth for *why*.**
> Pairs with `VeyaFlow_Roadmap_v1.html`. Run against the *Design → Coding Handoff Checklist*.

---

## 1. Identity & status

| Field | Value |
|---|---|
| **Status** | `current` |
| **File** | `VeyaFlow_Roadmap_v1.html` |
| **Target repo file** | **TBD — coding to confirm.** Likely a *new* marketing/product page (e.g. `roadmap.html`), not a re-skin of an existing screen. Do not invent the path. |
| **Dated** | 2026-06-03 |
| **Token spec version** | **FLAG:** none exists. Tokens were lifted verbatim from `VeyaFlow Landing Sketch v1.html`, which cites no version. Confirm against the current locked token spec before building. |

## 2. What this page is for

A standalone, public-facing roadmap: where the product is **today (V1.0)**, what lands **next (V1.1)**, and what's being **explored (V1.5+)**. Read top-to-bottom; no interaction required. Intent is reassurance + momentum for prospective and current brands, not a project-management tool.

## 3. Real vs placeholder (the big one)

Nothing on this page is data. Specifically:

- **All card copy is design-authored and illustrative** — descriptions need product validation before shipping.
- **V1.0 / V1.1 card names** came from the project brief (Brand Pack viewer, Pipeline tracking, Compliance progress, Magic Link sharing; BIL Brand Intake Loader, Manufacturer sourcing CRM, RP Marketplace v1.5, Commercial-fit scoring / Vector 4). The *descriptions* are invented — **product to confirm they're accurate.**
- **"Exploring" card names are wholly invented by design** (Multi-market compliance radar, Buyer due-diligence rooms, Launch-readiness signals). These are *not committed features* — placeholders to show the tier, **needs validation by product/strategy.**
- **Domain / regulatory content** — `CSRD`, `ESPR`, markets `SE / DK / DE` — carried from the landing sketch. **Needs validation by the compliance owner**; design is not the source of truth here.
- **Status colors are OFF-TOKEN.** `--live #4E9D6B` (green), `--next #CC8E3C` (amber), `--explore` = `--ink-mute`. The locked system defines only the clay accent. **Flag for the token spec:** either adopt these as semantic status tokens or replace with the real ones.
- **Version labels** (V1.0 / V1.1 / V1.5+) and **"updated June 2026"** are a presentation choice, not committed release naming or a real date.
- **No icons used** — status is shown with colored dots, so there are no icon placeholders to resolve (no Lucide/Phosphor slots).

## 4. Structure grounded in reality

- **PROVISIONAL / guessed structure.** No real screenshot existed; this is a *new* surface, not a re-skin of something in the app. **Flagged for verification (checklist §4).**
- **No existing app patterns to preserve** here (no deadline bar / confidence tag / privacy pill appear on a roadmap). If strategy wants those shared components referenced, that's an open item.
- **IA note:** introduces a new page + a simplified nav. Page-set and nav are strategy's call — see divergences below.

## 5. Tokens & system fidelity

- Reuses the inherited `:root` tokens verbatim (clay/ink/warm-paper tiers, hairline).
- **Font roles honored:** Fraunces = display/headlines; **Newsreader = brand names only, upright** (nav wordmark, footer meta, *and the hero "VeyaFlow" — fixed, see §7*); Geist = body/UI; Geist Mono = codes/numbers/labels (badge, version tags, `vector-4`, status chips, footer).
- **Locked-rule audit (checklist §3):**
  - *Brand names = Newsreader upright, never italic* — **was violated, now fixed** (§7).
  - *Ampersand rule (v4.3)* — **rule text not available in handed-off files.** No `&` appears in visible copy, so likely N/A; **coding/strategy to confirm.**
  - *Covers-are-light (v4.1)* — N/A, page has no cover band.
  - *Privacy pill = green + shield-check (v4.2)* — N/A, not present.
  - *Semantic color stays semantic* — status colors are used semantically (live/next/explore), but are **new/off-token** (see §3).
- `--paper-deep` used exactly **once** (the Exploring band), per the brief's "sparingly."

## 6. States & completeness

- **Authored:** the single populated/default state, plus card **hover** (3px lift + shadow).
- **Empty / first-session state:** N/A — a roadmap is always populated. (Noting it explicitly because empty-state is the recurring gap.)
- **No loading / error states** — fully static, no data fetch, no JS.
- **Interaction notes:** hover lift is decorative only; nav links (`← Back`) and the mailto are the only real targets; no collapse/persistence behavior.

## 7. Divergences flagged (cross-chat hygiene)

1. **Hero brand name fixed.** Was `<em>VeyaFlow.</em>` in Fraunces italic clay — broke the locked rule. Now the italic-clay flourish sits on "shipping" (a non-brand word) and **"VeyaFlow" is Newsreader upright**. Confirm the resulting two-serif headline reads as intended.
2. **Status metadata is in an HTML comment + this spec, not a visible page banner.** The landing sketch used a visible "provisional" pill; the brief for this page was "polished, not wireframe," so the rendered page is kept clean. Flag if a visible banner is required.
3. **Newsreader was added** to the font stack (alongside Fraunces) per the brand-name font role — not a replacement for Fraunces.
4. **Nav simplified** (wordmark + Roadmap badge + "Back to veyaflow.com") vs. the landing site's full nav (Platform / Compliance / Retailers / Pricing / About + Sign in / Book a demo). **Strategy to confirm** whether the roadmap should carry full site nav.

## 8. Open items / decisions needed

| # | Item | Owner |
|---|---|---|
| 1 | Confirm target repo path / whether this page should exist at all | coding + strategy |
| 2 | Validate all card descriptions; confirm/replace invented "Exploring" names | product / strategy |
| 3 | Adopt status colors into the token spec, or swap for real semantic tokens | design + coding |
| 4 | Provide the ampersand-rule (v4.3) text; confirm N/A here | strategy |
| 5 | Decide: visible status banner vs. comment-only on a public page | strategy |
| 6 | Confirm nav treatment (simplified vs. full site nav) | strategy |
| 7 | Validate regulatory terms (CSRD / ESPR) and target markets | compliance owner |

## Considered & rejected (so they're not reopened)

- **A status-filter control (All / Live / Next / Exploring)** — rejected for v1: the brief specified no JavaScript, and a static roadmap reads fine top-to-bottom. Revisit if the list grows long.
- **Per-card target dates/quarters** — rejected in favor of version-tier labels, to avoid committing to dates design can't own.
- **A visible "SKETCH / provisional" pill** like the landing sketch — rejected to keep the page presentation-clean; metadata moved to the comment block + this spec instead.
