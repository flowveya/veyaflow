# VeyaFlow Design Tokens & System — Locked Spec v4

*Supersedes v3. Changes marked **[v4]**. Color tokens unchanged since v1. v4 adds the persistent shell (top bar, deadline bar, light sidebar, collapse behavior), corrects the inventory to reflect the real app (re-skin not redesign), and records the sidebar light decision.*

---

## 1. Color tokens (unchanged since v1)

```css
:root {
  --accent:#C0613A; --accent-deep:#9E4A28; --accent-soft:#F3E3DA;
  --ink:#1C1A17; --ink-soft:#4A463F; --ink-mute:#8A857B;
  --paper:#FFFFFF; --surface:#FAF8F4; --paper-deep:#F0ECE4;
  --line:#E7E2D8; --line-strong:#D8D1C4; --on-accent:#FFFFFF;
}
```
Three surface tiers in use. Contrast pairs pending QA; fallbacks per v1.

**[v4] Note on dark contexts:** the dark-ink sidebar was explored and rejected (see §7). **[v4.1] Cover blocks are also LIGHT** — the warm-dark cover treatment was tried on the Market Report and rejected in favor of the light cover (white card, clay left spine, clay brand accent, green verified pill) used by DPP and Brand Pack. The system is now light end-to-end. The only non-light surfaces are the deadline bar's amber. `--cover` (warm-dark) is **deprecated/unused**; remove from new work. If gravitas is ever wanted back, the lever is a report header band or the brand name — not the cover.

---

## 2. Fonts — three roles (unchanged since v2)

```css
--serif:'Fraunces', Georgia, serif;        /* display */
--brand-name:'Newsreader', Georgia, serif; /* brand names only */
--sans:'Geist', system-ui, sans-serif;     /* body + UI */
--mono:'Geist Mono','IBM Plex Mono',monospace;
```
Four web fonts. Flag PDF embedding (Fraunces, Newsreader).

---

## 3. Typographic rules (unchanged since v2)
Italic-Fraunces = one word in a phrase, never a name. Brand names → Newsreader, upright, identical everywhere. Logo used if available; Newsreader is the no-logo fallback.

**[v4.3] Ampersand rule (refined).** Fraunces's `&` is ornate and clashes when it sits near the calmer Newsreader `&`. So, for any `&`:
- **Heading that is a string of brand/proper names** (e.g. "Cloud & Glow | Skincare & Beauty | Normal") → set the WHOLE heading in Newsreader (`--brand-name`).
- **Genuine display headline that happens to contain `&`** (e.g. "Executive Summary & Market Intelligence") → keep Fraunces, wrap ONLY the ampersand in a Newsreader span (`.amp { font-family:var(--brand-name) }`).
- Coding sweep: anywhere `&` appears inside a Fraunces headline, apply one of the two above. Don't leave a raw Fraunces ampersand in display text.

---

## 4. Status chips — semantic, retuned (unchanged since v1)
```css
--green-bg:#DCEBE0; --green-text:#2F6B45;
--amber-bg:#F6E7CC; --amber-text:#8A6516;
--red-bg:#F3D6D0;   --red-text:#B23A2A;
--blue-bg:#DBE3F4;  --blue-text:#3A4F8A;
```
Validated against the real app (Compare Markets, margins, confidence tags already use semantic color). Keep semantic; retune values only.

**[v4.4] Roadmap status pills → existing semantic tokens (no new tokens).** Done → green; Shipping → blue; Exploring → amber; Later/unscheduled → `--paper-deep` bg + `--ink-mute` text. Pill = dot + uppercase label (same shape as other status pills). Chosen over a bespoke roadmap palette to keep the token set tight and reuse already-learned meanings (amber = in-progress, green = done, blue = informational). Replaces the off-token green/amber/grey the coding chat improvised on the roadmap. *Note: deliberately NOT clay for "Shipping" — clay is the interactive/accent color and would read as clickable on a status pill (same reason the privacy pill avoided clay).*

---

## 5. Shared components (v2/v3 + **[v4]**)

- **Framed cover** (v2): white card + clay left spine + inline status pill. DPP restrained; Brand Pack expressive. **[v4.1] Report cover blocks in-app use this SAME light treatment** (Market Report confirmed) — covers are light everywhere, no warm-dark variant. Leading font follows the type rules: brand name leads → Newsreader; product/report title leads → Fraunces.
- **[v4.2] Privacy pill** (CFO View and any client-side/private surface): **green fill** (`--green-bg` bg, `--green-text` text) + **shield-check** line icon (from the icon library) + label. Shield-check + green is the universal "protected & verified" pairing. Considered: red (rejected — reads as error/warning), ink (vault feel, rejected), clay-soft (rejected — competes with active/CTA states), outline. The earlier "red-as-trust-signal exception" note is **retired** — privacy no longer uses red. *Note: green is also the semantic success color; on CFO View it doubles as "your data is safe," which is consistent rather than conflicting.*
- **[v4] Persistent shell** — frames all ~24 pages:
  - **Top bar:** ☰ toggle · VeyaFlow wordmark (Fraunces, clay "Flow") · search · Inbox/Help · avatar. Wordmark lives HERE only.
  - **Deadline bar:** persistent amber strip below the top bar — "UPCOMING DEADLINES" + regulatory countdowns (mono days) + arrow affordances. Always visible. Amber tokens.
  - **Sidebar (light):** off-white panel. Workspace card → green "BEAUTY · TRADING" sector label → 3-tab switcher (BRAND/SOURCE/RETAILER, clay active underline) → nav items (icon + name + subtitle, clay active spine + soft-clay fill) → "N saved reports" footer.
  - **Collapse = icon rail (64px):** labels/subtitles/badges hide, icons remain; the 3 tabs persist as a **B/S/R** strip so all sections stay reachable. Active state preserved. Collapsed state should **persist across pages** (coding). On narrow widths, auto-collapse.
  - **[v4] Considered & rejected:** full-collapse + hover-reveal (Linear/GitLab pattern). Tested, user chose the icon rail. The rail makes library-icon legibility load-bearing.

---

## 6. Color mapping (navy/gold → clay) — for the re-skin
| Current | → New |
|---|---|
| Navy `#1B2D4F` chrome/sidebar | light sidebar (`--surface`) + clay accents; report cover blocks → **light cover treatment** (white card, clay spine) |
| Gold `#C4A882` | `--accent` / `--accent-deep` |
| Playfair → Fraunces; JetBrains Mono → Geist Mono; Inter → Geist |
| Existing greens/blues | retuned semantic tokens |

---

## 7. **[v4] Sidebar light vs dark — decided**
Explored dark-ink (strategy's vote, for gravitas). Built it, reviewed, **user chose light.** Gravitas now carried by report cover blocks + deadline bar, not chrome. Recorded so it isn't reopened. Divergence from strategy's vote synced via `Design_to_Strategy_Shell_Sync.md`.

---

## 8. Naming approach (unchanged) / 9. JS constants (unchanged since v2, + brandName)
Semantic aliases + deprecate-and-sweep. JS TOKENS object mirrors §1 + fonts (serif/brandName/sans/mono).

---

## 10. **[v4] Surface inventory — corrected to re-skin reality**

The app is largely BUILT (navy/gold). Job = re-skin, not redesign. Real IA = 3 tabs × ~24 destinations.

| Surface | Status |
|---|---|
| **Persistent shell** (top bar, deadline bar, light sidebar) | ✓ authored (this is the frame for everything) |
| DPP viewer re-skin | ✓ mockup + spec |
| Brand Pack viewer re-skin | ✓ mockup + spec |
| Landing page | ✓ sketch |
| **Real app pages (~24)** | ⏳ re-skin per sequenced plan (Audit & Plan doc) |
| Pipeline Board / Pipeline Table / Compliance Overview / Home v2 mockups | ⚠️ SUPERSEDED — built on guessed IA before real screenshots. Visual-language reference only, NOT page specs. Real app has Retailer CRM (not Pipeline Board), distributed compliance (not a zone), Brand Home (not the Home v2 structure). |

---

## 11. Open items for coding chat (running)
- Contrast QA on flagged pairs.
- Library icons (Lucide/Phosphor) — load-bearing for the collapsed rail.
- Persist collapse state across pages; mobile auto-collapse.
- **ATM Admin** definition (scout).
- Re-skin sequence: tokens → shell → shared components → viewers → high-traffic BRAND pages → rest → PDF/export. (Audit & Plan doc.)
- Build shell + framed cover once, reuse.

---

## Changelog
- **v4.4** — roadmap status pills mapped to existing semantic tokens (Done→green, Shipping→blue, Exploring→amber, Later→grey); no new tokens. Replaces coding's improvised off-token colors.
- **v4.3** — refined ampersand rule (name-string headings → Newsreader; display headlines → Newsreader ampersand span only).
- **v4.2** — privacy pill locked (green + shield-check); red-as-trust-exception retired.
- **v4.1** — covers light everywhere (warm-dark cover deprecated).
- **v4** — persistent shell (top bar/deadline bar/light sidebar/icon-rail collapse with B/S/R); sidebar light decision; inventory corrected to re-skin reality (page mockups marked superseded).
- **v3** — collapsible rail pattern + icon-library decision; by-market compliance lock; inventory.
- **v2** — brand-name role; type rules; framed cover.
- **v1** — initial.
