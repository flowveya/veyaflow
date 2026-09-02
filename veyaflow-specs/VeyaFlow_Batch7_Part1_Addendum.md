# VeyaFlow — Batch #7 Part 1 ADDENDUM: the canonical passport origin

**2 September 2026** · unblocks #70 · `index.html` only · everything else in batch #7 stays as applied

## BASELINE — your own output, unchanged since you stopped

| File | sha256 |
|---|---|
| `index.html` | `f1ab65b15ff9585f7cba5fa770abec1f040e72b97d4ea4bf72a68f536eb68ca4` |
| `dpp/index.html` | `6e946a279f2d43827bfba12a3994ba0400cc4983b658a065dca4760bde21357d` |

**These are values I am naming**, per the standing baseline rule — proceed on them. Byte-verified here: digests match, acorn clean (2 blocks / 1), `dpp/index.html` is exactly the two Part 6 hunks, `index.html` is thirteen hunks all in specced regions, every batch #3–#6 guard intact, Truth Batch phrases 0.

**`dpp/index.html` is not touched again.** This addendum is `index.html` only.

---

## THE ANSWER, AND WHY IT COMES WITH A SECOND CONDITION

**`veyaflow.com` does not serve the app.** It is a **parked domain at Loopia** — a placeholder page inviting visitors to buy the domain from the registrar. `veyaflow.com/dpp/<id>` returns that page.

That is worse than a 404. A retailer or regulator scanning a printed code today would land on a hosting company's advert, under a QR the brand put on its own packaging.

**Strategy's ruling, both branches pre-decided:** the constant is `https://veyaflow.com` regardless — it is the canonical identity whether or not it answers yet — **and no QR reaches a packaging proof until the domain resolves.**

**I am implementing the second half as a code rule, not a note.** Strategy's version depends on Charlotte remembering. The publication gate you built in Part 2 exists precisely because "remember not to print an unpublished passport" was not enough, and this is the same shape of risk with the same permanence. A convention that must be remembered is not a control.

---

# THE FIX

## 1A — one constant, one flag

Near the other DPP constants:

```js
// The canonical home of every published passport. NEVER derive a passport URL from
// window.location.origin — the QR then encodes whichever domain the brand happened to
// be browsing, permanently, on physical packaging.
const DPP_CANONICAL_ORIGIN = 'https://veyaflow.com';

// DNS is not yet pointed at the app — veyaflow.com currently serves a registrar parking
// page (verified 2 Sep 2026). Until it resolves to a passport, a printed QR would send a
// retailer to an advert. Flip to true ONLY when veyaflow.com/dpp/<id> loads a real
// passport, and confirm that before flipping.
const DPP_ORIGIN_LIVE = false;
```

**Both are single definitions.** No second copy, no per-call default.

## 1B — every passport URL reads the constant

Your scout found four `window.location.origin` sites — two the spec named, two it missed:

| Line | What it builds |
|---|---|
| ~L33979 `publicUrl` | publish payload + confirm dialog |
| ~L34769 `dppUrl` | the URL the QR encodes |
| ~L35047 `"dppUrl"` | **JSON export field** |
| ~L35215 `row('DPP URL', …)` | **PDF Declaration body** |

All four read `DPP_CANONICAL_ORIGIN`. The PDF strips the scheme for display — keep that behaviour, derive it from the constant.

**And the hardcoded literals** — the banner (~L34885), the unpublished refusal, the Brand Pack line you rewrote (~L16845), and any others: all read the constant. **Report the complete final list.**

**Re-scout before you finish.** The list has grown twice. If you find a fifth or sixth site, that is the finding, not a failure.

## 1C — `@context` stays literal — RULED

```js
"@context": "https://veyaflow.com/dpp/schema/v1"
```

**Your read was right and both lanes have ratified it.** It is a JSON-LD schema identifier, not a passport address. Repointing it would change the schema's identity and break anything resolving against it. **It must NOT read the constant.** Leave it byte-identical and note it in your report so no future pass sweeps it.

## 1D — the print gate

While `DPP_ORIGIN_LIVE` is `false`, **the QR download refuses** — in addition to, not instead of, the publication gate. Both conditions must hold.

Say plainly what is wrong: the passport is published, but the canonical address does not yet resolve, so a printed code would not reach it. Reuse `_dppRefuse` so the message is always visible.

**Scope it to the QR only.** JSON and PDF are filed and re-read, not printed and frozen — a URL that starts working later is recoverable there. A printed carton is not. **Do not gate them on this flag.**

**Do not** add a config screen, an override, or an environment lookup. One boolean, flipped by hand, after someone has actually loaded a passport at the canonical address.

---

# OUT OF SCOPE

Everything else in batch #7, already applied and verified — do not revisit it. `dpp/index.html`. The `@context` line. `getDPPId` and the id format. #76 (the eleven prompt siblings) and #77 (the two version counters) — both logged, both their own batches.

---

# STOP. NO COMMIT.

## REPORT BACK

1. The complete final list of sites reading `DPP_CANONICAL_ORIGIN`, including any you found beyond the eight — and confirmation that `window.location.origin` appears in **zero** passport-URL constructions.
2. Confirmation `@context` is byte-identical.
3. The QR refusal wording under `DPP_ORIGIN_LIVE = false`, and confirmation JSON and PDF are **not** gated on it.
4. Confirmation both constants have exactly one definition.
5. `sha256sum index.html dpp/index.html` — full digests. `dpp/index.html` must be unchanged at `6e946a27…`.

## VERIFY (byte — coding chat)

- acorn clean, `index.html` 2 blocks
- `window.location.origin` in passport-URL construction = **0**
- `DPP_CANONICAL_ORIGIN` and `DPP_ORIGIN_LIVE` = **1 definition each**
- `@context` line byte-identical; it is the **only** permitted `veyaflow.com` literal
- QR download unreachable while `DPP_ORIGIN_LIVE` is false; JSON and PDF unaffected by it
- `_dppIsPublished` still 1 definition / 4 call sites — the publication gate is not replaced
- `dpp/index.html` byte-identical to `6e946a27…`
- all batch #3–#7 guards, as in the main spec. Guards count **rendered** occurrences; comment epitaphs are expected.

## ON GREEN — commit the whole of batch #7

`DPP export truth pass: one canonical passport origin with a print gate until DNS resolves, all three exports gated on publication, print-resolution QR, framework-correct summary row, and the unearned ESPR and integration claims removed (fix batch #7)`

## SMOKE

1. Generate a QR from `veyaflow.netlify.app` — the displayed URL reads **veyaflow.com**.
2. Download QR on a **published** passport → **refuses**, explaining the domain does not resolve yet.
3. JSON and PDF on the same passport → **download normally**, carrying the veyaflow.com URL.
4. Unpublished passport → all three still refuse, on publication grounds.
5. The JSON's `@context` still reads `https://veyaflow.com/dpp/schema/v1`.

## THE ONE THING THAT UNBLOCKS PRINTING

Point `veyaflow.com` at the app, load a real passport there, then flip `DPP_ORIGIN_LIVE` to `true`. That is a DNS task and a one-character commit — **not** a code problem, and it should be tracked as infrastructure alongside the PAT rotation.
