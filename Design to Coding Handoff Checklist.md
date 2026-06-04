# Design → Coding Handoff Checklist

*The standard for any design file handed to the coding chat. Built from what actually tripped us up this project (wrong filenames, stale token refs, placeholder-vs-real ambiguity, superseded mockups). Run every deliverable through this before handing off.*

-----

## 0. The one rule

**The coding chat builds against the REAL app, not against a guess.** Every file must make clear what is real (from screenshots / the deployed app), what is placeholder, and what is a design decision. Ambiguity here is what costs the most time.

-----

## 1. Identity & status (top of every file)

- [ ] **Filename is descriptive and versioned** — `VeyaFlow_<Page>_Reskin_v<N>.html`. No generic `index.html`.
- [ ] **Names the real target file** it maps to, using the ACTUAL repo filename (e.g. `brand-viewer.html`, not a guessed `brand/index.html`). If unknown, say “target file TBD — coding to confirm path,” don’t invent one.
- [ ] **Status banner** in the file: `current` / `superseded` / `exploration-only`. Superseded files say what replaced them.
- [ ] **Dated** and notes which token-spec version it’s built against (e.g. “Tokens v4.3”).

## 2. Real vs placeholder (the big one)

- [ ] **Every placeholder is labelled as such.** Icons (the letter-glyphs / unicode stand-ins), sample copy, invented data, lorem — all explicitly flagged so coding never ships them as final.
- [ ] **Icons:** state they’re placeholders for library icons (Lucide/Phosphor), and which library + ideally which icon name per slot.
- [ ] **Domain content flagged** where design isn’t the source of truth — compliance vocabulary, regulatory requirement names, legal text. Mark “needs validation by [owner],” never present as fact.
- [ ] **Qualitative→visual mappings noted** — e.g. “bar fill widths for ‘High’/‘Very positive’ are a presentation choice, not data.”
- [ ] **Truncation noted** — if a page shows only part of a real document, say so (“real doc continues; built enough to prove structure”).

## 3. Tokens & system fidelity

- [ ] **Uses the current locked tokens** (clay/ink/semantic, the three font roles). No off-token hex values; if one’s needed, flag it for adding to the spec.
- [ ] **Points to the current token spec by version** — never an older one. (Stale token refs caused real confusion.)
- [ ] **Follows locked rules:** ampersand rule (v4.3), covers-are-light (v4.1), brand names = Newsreader upright (never italic), privacy pill = green + shield-check (v4.2), semantic color stays semantic.
- [ ] **Reuses shared components** (shell, framed cover, confidence tag, deadline bar) rather than re-inventing them per file — and says “uses shared X” so coding builds it once.

## 4. Structure grounded in reality

- [ ] **Built from a real screenshot** where one exists. If no screenshot, the file is marked **provisional / guessed structure** and flagged for verification — never presented as a re-skin of something unseen.
- [ ] **Preserves real patterns** the app already has (deadline bar, confidence tags, privacy treatment, section numbering) — re-skin them, don’t remove them.
- [ ] **Doesn’t re-architect IA** — page set, nav structure, naming are strategy’s call. Design re-skins what’s there.

## 5. Companion spec (for non-trivial surfaces)

- [ ] **Paired `.md` spec** stating intent: what the page is for, why each decision, states authored, and considered-and-rejected alternatives (so they’re not reopened).
- [ ] **Open items / decisions-needed** listed, with owner (design / strategy / coding).
- [ ] **HTML = source of truth for *what*; spec = source of truth for *why*.** Say this so coding knows which to trust for which question.

## 6. States & completeness

- [ ] **Which states are authored** (populated / empty / all-clear / loading / error) and which aren’t.
- [ ] **Empty/first-session state** addressed or explicitly flagged as a gap (it’s our biggest recurring one).
- [ ] **Interaction notes** for anything not visible in a static mock (collapse behavior, hover, persistence-across-pages, what’s a coding-state concern).

## 7. Cross-chat hygiene

- [ ] **Divergences from strategy/coding flagged** (e.g. “sidebar went light, not strategy’s dark vote”) so chats don’t silently drift.
- [ ] **No duplicate re-sends** — if coding already has a file, point to it by name, don’t re-upload. (Re-sending files they had caused a loop.)
- [ ] **Binary questions for coding are answerable by coding** — don’t ask design to resolve repo facts; route repo/file questions to whoever holds the repo.

## 8. Handoff packaging

- [ ] **Manifest exists** — one current list of deliverables with status (current / superseded / reference), so nobody hunts or reconciles folders by hand.
- [ ] **Superseded files marked, not deleted** — kept as reference but clearly labelled so they’re never built from.
- [ ] **Present the file** (don’t just describe it), with a succinct note on what it is and what’s still open.

-----

## Quick pre-handoff pass (the 6 that matter most)

1. Real filename named (not guessed)?
1. Placeholders all labelled (icons, copy, domain content)?
1. Built against a real screenshot — or flagged provisional?
1. Current token-spec version cited, locked rules followed?
1. States listed; empty-state addressed-or-flagged?
1. Divergences flagged; no duplicate re-sends?

*If all six pass, it’s ready for coding.*