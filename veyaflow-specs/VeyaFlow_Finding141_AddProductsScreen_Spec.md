# VeyaFlow — #141: the Add Products screen — emoji removal and retailer-template demotion

**9 September 2026 · coding lane → CC · approved by Strategy**

Found by **using the app**, not reading it. Small, approved, and it does not wait for the
larger work behind it.

---

## NAMED BASELINES — SIX SURFACES

```
index.html                           5461416e60ab5c0e9b50a6ada0692d490baed339d3672f32d4cd711facb4babc
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

**Confirm all six. Only `index.html` moves.** Note the `index.html` baseline moved with #134 —
`5461416e`, not `c8a754f2`.

---

## PART A — THE EMOJIS. ENFORCEMENT, NOT A NEW DECISION

Canon already forbids emoji in the UI. Two are present, **written as unicode escapes so a
search for emoji glyphs finds nothing**:

```
19-line 20005   📂   📂
19-line 20011   ✏️   ✏️
```

**Remove both.** They sit in `<div style="font-size:1.4rem;margin-bottom:.5rem">` wrappers —
**report whether the wrapper should go with them or stay as spacing**, and say which you chose.

**Sweep the file for the class, not the pair.** Search for **codepoints**, not characters:
emoji ranges and the escaped forms `\uD83C`–`\uD83E` surrogate pairs, plus
`←`–`➿` symbols that carry `️`. **Report the count.** Arrows and `✓`/`✗`
already in use as typographic marks are **not** in scope — the rule is about emoji, and
distinguishing them is a judgment, so state which you excluded and why.

---

## PART B — THE RETAILER TEMPLATE IS AN OUTPUT, NOT THE HEADLINE

The screen leads with **Upload a file · RECOMMENDED**, subtitled *"Excel (.xlsx), CSV, or an
existing Apotek Hjärtat / Matas template. Columns mapped automatically"* (20007), and repeats
the claim at 20023.

**The claim is true** — `RETAILER_TEMPLATES` (19835) really does map Apotek Hjärtat's Swedish
column names. **This is not a truth defect.** It is a structural one: *My Products* is the
brand's own product master, and a retailer's form is something the platform should **produce**,
not lead with consuming.

**Changes:**

1. **`Download VeyaFlow .xlsx template` becomes the recommended path.** It is the file that maps
   to the master; it currently sits at the bottom as an afterthought (20027).
2. **The retailer-template line moves out of the headline** to a secondary line — *"Already
   filled a retailer's template? Upload it."* Keep the capability; stop advertising it as the
   way in.
3. **`RECOMMENDED` moves with the recommendation.**

**Copy is DESIGN's under Daylight.** Propose wording, do not finalise it, and **use vocabulary
already in the file** rather than inventing a register.

---

## WHAT THIS SHIPMENT DOES NOT DO

- **No change to the import mechanism.** `SKU_FIELDS`, `RETAILER_TEMPLATES`,
  `handleSkuFileUpload` and the column mapper are untouched. The finding underneath this
  screen — **the importer carries 4 of the CPNP helper's 14 required fields** — is **#135**,
  and it is a different shipment.
- **No document upload.** Strategy: it sits behind gate points 2 and 3, because *a lost text
  field can be rewritten and a lost CPSR may be the customer's only copy.*
- **No `documentRef`.** M4's schema reserves it; nothing implements it here.

---

## REPORT, DO NOT IMPLEMENT

1. **The emoji sweep count across all four HTML surfaces**, with the search terms stated. Per
   the standing rule: **report a negative as "not found, with these searches", never as "does
   not exist."**
2. **Whether SKUs and brand data mirror to the server at all.** `persistCritical` is
   `localStorage` with a read-back check; loop events reach Supabase through the proxy.
   **Does anything else?** This is not idle — it decides how far behind the gate document
   upload actually sits, and the lane has not checked it.
3. **Every other place that names Apotek Hjärtat or Matas in user-facing copy.** Those two
   appear wherever the product needs to look capable — `LISTING_REQUIREMENTS` (2 of 158),
   printable checklists, and now the importer. **The count is the finding**, and whether each
   instance is earned differs case by case.

---

## STOP. NO COMMIT.

Two parts, three reports.

---

## REPORT BACK

1. sha256 of all six before and after — only `index.html` differs.
2. Before/after for both emoji sites and the copy changes.
3. The three reports.
4. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `5461416e`; five others UNCHANGED; `1 of 6
modified`.

---

## SMOKE

**Step 1.** Open Add Products. **No emoji anywhere on the screen.**

**Step 2.** The VeyaFlow template download is the visually primary action; the retailer-template
option is present but secondary.

**Step 3 — the step that proves nothing broke.** Upload a CSV and an Apotek Hjärtat–style file.
**Both still import, with the same columns mapped as before.**
*Failure: any change to what imports. This shipment moves copy, not machinery.*
