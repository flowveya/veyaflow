# VeyaFlow — THE TARGET MARKET FIELD, FIX SPEC

**3 September 2026 · coding lane → CC · batch #9, third shipment**
**Number owed — five findings are currently unnumbered; Strategy/log to assign.**

Found by Charlotte using the app: the Target market dropdown opens already showing
Denmark, which nobody chose. Everything below follows from that.

---

## NAMED BASELINE

```
index.html   sha256   3ff93df4ce60cf322a0e35d292a135533f56de41c868ad67cfc25cd0752a2428
             short    3ff93df4
             41,083 lines · 2,707,508 bytes · 2 inline <script> blocks (1176, 39565)
```

**This is a value I am naming.** Post-#96/#97 tree at `39b7725`. Anything else: stop,
report, wait.

---

## THE DEFECT

`brandPackState.market` initialises to `''` (**16084**). The market `<select>` at
**16696** builds its options with no empty placeholder:

```js
${PACK_MARKETS.map(m=>`<option${brandPackState.market===m?' selected':''}>${m}</option>`).join('')}
```

With an empty state nothing carries `selected`, so the browser displays the **first**
option — Denmark. The `onchange` handler at 16695 only fires on change, and choosing
the Denmark already displayed is not a change. **The screen shows a market the state
does not hold.**

Three sites then absorb the empty value, each differently:

| Line | Code | Effect |
|---|---|---|
| **16674** | `PACK_RETAILERS[brandPackState.market\|\|'Denmark']` | offers Danish retailers, which is what makes the screen look coherent |
| **16912** | `const market = brandPackState.market\|\|'Denmark'` | feeds `getRelevantIntel(…, market, retailer)` — **the LLM writes a Denmark pack** |
| **30303** | was `\|\|'Market'` | printed the placeholder as data. Fixed earlier today; the PDF now omits it |

**Observed:** the Normal pack's AI page reads `# CLOUD & GLOW BRAND PACK | DENMARK |
SEPTEMBER 2026` while every running header reads `Market`. 16912 and 30303 gave two
different answers in one buyer document.

### The reference implementation is five lines away

The **Target retailer** field, in the same `grid-2`, does all three things correctly:

```js
16701   <option value="">Select retailer…</option>     // placeholder
16901   if(!brandPackState.retailer){ …error…; return; } // guard
        // and no silent default anywhere
```

The market field has none of the three. This spec makes market match retailer.

---

## THE FIX — four sites

**1 · 16696 — add the placeholder.** Mirror 16701 exactly, including its `value=""`
and its `…` character:

```js
<option value="">Select market…</option>
```
placed before the mapped options. Do not add `selected` to it — the browser selects
the first option when nothing matches, which is precisely how 16701 works.

**2 · 16674 — no retailers until a market is chosen.**

```js
const retailers = brandPackState.market ? (PACK_RETAILERS[brandPackState.market]||[]) : [];
```

Without this, step 1 replaces one mismatch with another: "Select market…" above a list
of Danish retailers, and a user able to pick a Danish retailer with no market set.

**3 · 16901 — guard on market, mirroring the retailer guard.** Same shape, same error
styling, placed **before** the retailer check so the user is asked for the market
first — it is the field the retailer list depends on. Copy the existing block's
structure rather than inventing a second error mechanism.

**4 · 16912 — remove `||'Denmark'`.** With the guard in place it is unreachable; leaving
it means that if the guard is ever bypassed the *prompt* silently receives Denmark
again, which is the defect that produced the DENMARK/Market contradiction. Delete the
fallback rather than relying on the guard alone.

---

## OUT OF SCOPE — report only

- **17132 and 17146** render `${brandPackState.market}` unguarded. With fix 3 these
  should be unreachable with an empty market, because generation cannot start. **Say
  whether that reasoning holds** — if there is any path to those lines without
  generation, report it and do not fix it here.
- **`||'Denmark'` elsewhere.** Report any other occurrence you find. Do not touch.
- **`[FLAG_COPY: …]`** — `honestyFlagCopy` at 16895 carries the comment "STRATEGY may
  swap". That is #56 and it is Strategy's, not ours.
- **The AI-prose findings** — the Kicks pack asserts "registered as a Swedish operator"
  and "complies with GPSR" while page 2 says operator Not set, certifications None.
  With Strategy. Do not touch prompts.
- **#96C** — the `stripMd` extension, held because it moves Business Case output.

---

## STOP. NO COMMIT.

Apply, stop, report. Do not commit, do not push.

---

## REPORT BACK

1. sha256 before editing, and that it matched the baseline.
2. Before/after for each of the four sites.
3. Whether the retailer `<select>` still behaves identically when a market *is*
   chosen — fix 2 changes what feeds it.
4. Your answer on 17132/17146.
5. Any other `||'Denmark'` or `||'Market'` fallback in the file.
6. Noticed, not fixed.

---

## VERIFY

```
cd ~/claude-code-test
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `3ff93df4`; the lane names the new value.

- `_operatorRow` 10 call sites, `_operatorValueFor` 4 — unchanged
- Both blocks parse clean, block count 2
- **RAW**: `[FLAG_COPY` count unchanged

Then, before smoking: `git log --oneline origin/coding-aug2026 -1` must show the
commit, and Netlify's Deploy tab must list it.

---

## SMOKE — Menu → MY BRAND → Brand Pack, `veyaflow.netlify.app`, hard-refresh

**Step 1 — the field opens honest.**
Target market reads `Select market…`, not Denmark. Target retailer offers only
`Select retailer…` — **no Danish retailers listed**.
*Failure: any market name shown before one is chosen; any retailer offered.*

**Step 2 — the guard holds.**
Press Generate with no market. An error appears naming the market, and nothing
generates.
*Failure: a pack generates.*

**Step 3 — Denmark is reachable in one action.**
Choose Denmark from the placeholder state. Retailers appear. Generate.
Every surface says Denmark — cover line, running headers, Brand Snapshot row, **and
the AI content pages**. This is the step that proves 16912 and 30303 now agree.
*Failure: any page saying "Market", or an AI page naming a different market.*

**Step 4 — the step that passes only if nothing changed.**
Page 2's Compliance Status: `EU-established economic operator` in full, a gap,
`Not set`; `Technical file` and `Certifications` at the same x-position. Page 3 is a
real section, not a hash-prefixed heading over blank space.
*Failure: any movement. #95 and #96 both shipped into this document today.*

Send the PDFs.
