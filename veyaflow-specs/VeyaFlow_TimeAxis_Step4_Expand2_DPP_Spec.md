# VeyaFlow — Time axis step 4: expand phase 2, `dpp/index.html` + the copy gate

**9 September 2026 · coding lane → CC**

Second surface. Three sites, the second copy of the canonical reader, and **the gate that
makes byte-identity across copies a `cannot` rather than a `must-not`.**

Also closes **#129**, a latent defect this surface already carries.

---

## NAMED BASELINES

```
index.html                           9eb3da6917ba6ec516a846006f27d5579418edb730636a2d1fc5b9589c9c71e7
dpp/index.html                       6e946a279f2d43827bfba12a3994ba0400cc4983b658a065dca4760bde21357d
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
```

Branch `f2b-async` at `561c7f8`. **Confirm all five. Only `dpp/index.html` moves.**

---

## THE SITES

**177** — the source, and an odd shape worth reporting:
```js
const certs = (payload.certifications && payload.certifications.certifications) || [];
```

**275, 277** — the count:
```js
const certificationsHTML = certs.length ? `
  <div class="vf-section-title">Certifications (${certs.length})</div>
```

**279** — a hand-rolled reader that is **not** the canonical one:
```js
${certs.map(c => `<span class="vf-cert">${esc(typeof c === 'string' ? c : (c.name || ''))}</span>`).join('')}
```

---

## #129 — THE COUNT AND THE BADGES CAN DISAGREE

A nameless entry — an object with `expiryDate` but no `name` — renders
`<span class="vf-cert"></span>`: **an empty badge asserting a certification with no name**,
on a published Digital Product Passport. And `certs.length` counts it, so the heading says
**Certifications (3)** above two visible badges and one blank.

That is #127's class — a number not backed by what it claims — and #113's — a badge asserting
more than the data supports — on the most permanent surface the product has. **A passport is
published and shared; it is not a page a brand refreshes.**

**It is LATENT, not live**, and the distinction matters: it requires a payload carrying a
nameless entry, which today's writer does not produce. Recorded honestly rather than
overstated, the way `loopEventAccept` was.

**The canonical reader closes it as a side effect** — its contract already drops an entry with
no usable name. So adopting the reader is behaviour-identical against **today's** data and
strictly better against data we can now write. Both are true and both must be stated; a fix
smuggled in under "expand" is the sort of thing this lane exists to catch.

---

## IMPLEMENT

**1 · Copy the canonical reader VERBATIM.**

From `brand/index.html` — comments, whitespace, blank lines, everything. **Do not improve it,
reformat it, or adapt it to this file's style.** The copies must be byte-identical or the gate
below is theatre. If this file's conventions differ, the divergence is the point being
prevented, not a reason to deviate.

**2 · Use it at 279**, replacing the hand-rolled ternary.

**3 · Use it at 275 and 277 — the count must come from the SAME normalised array.**

Normalise once into a local and use it for the guard, the count and the map. If the count
comes from `certs` while the badges come from the normalised list, the two can disagree by
construction — which is the defect being fixed, reintroduced one line up.

**4 · Leave 177 alone.** The nested `payload.certifications.certifications` is odd and is
reported below, not changed. Changing where the data comes from is not the expand phase.

---

## THE GATE — the reason this phase exists as much as the three sites

**Assert the reader's source text is byte-identical in every surface that carries it.**

Extract it **by locating the comment banner and the closing brace — never by line number.**
Witness lines pinned to fixed numbers degrade after every edit (3 Sep, already in the log).

**This gate can fail**, which is why it is worth building: edit one copy and the battery
refuses. Contrast #128's `must-not-exist` gate, correctly declined because it could never
fail. This is the same distinction, and it is the fifth time this week it has decided whether
a guard earns its place.

**It also must survive phase 3**, when a third copy lands in `index.html`. Write it to compare
*every* surface carrying the banner, not a hardcoded pair — a gate that silently checks two of
three copies is worse than none.

---

## REPORT, DO NOT IMPLEMENT

1. **Byte-identity evidence, the same three-way method as phase 1.** Capture the old
   expression's output *before* editing; compare old vs new vs the capture. **Include a
   nameless-entry input** — that one must differ, and the difference is #129 being closed.
   State it as a difference, not as a pass.
2. **The nested `payload.certifications.certifications` (177).** Why two levels? Is the outer
   one a section wrapper with siblings, or an accident? **Report only** — but if published
   passports carry a different shape than the writer produces, that is a finding of its own.
3. **Whether any published passport could already contain a nameless entry.** `publishDPP` and
   `buildDPPJson` are in `index.html`; state what they can emit. If a nameless entry is
   reachable through any path, **#129 is live rather than latent** and its ranking changes.

---

## OUT OF SCOPE

- `index.html` (phase 3), `portal.html` (zero occurrences), the proxy (third-party,
  permanently out).
- The writer, `toggleSkuCert` — migrate phase.
- `expiryDate` rendering of any kind. **The reader must not read it**, here or anywhere, until
  Strategy rules on validity display.
- Third-party reference data. Permanently.

---

## STOP. NO COMMIT.

Four implements, one gate, three reports.

---

## REPORT BACK

1. sha256 of all five before and after — **only `dpp/index.html` differs**.
2. Proof the copied reader is byte-identical to `brand/index.html`'s, and how you established
   it.
3. Before/after for 275, 277, 279.
4. The gate's implementation, and evidence it **fails** when a copy is altered — change one
   character in a scratch copy, show the FAIL, revert. **A gate never seen to fail is a gate
   nobody knows works.**
5. The three reports.
6. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `dpp/index.html` DIFFERS from `6e946a27` — **its first move since batch #7**;
all four others UNCHANGED; `1 of the 5 tracked surfaces modified`. The new gate must be
visible in the output.

---

## SMOKE

**Step 1.** Open a published passport with certifications. Badges and the count render exactly
as before.
*Failure: any change — text, order, spacing, count.*

**Step 2 — #129 closed.** In the console, pass the reader an array containing a nameless
object. It is dropped, and a count taken from the normalised array excludes it.
*Failure: an empty badge, or a count higher than the badges rendered.*

**Step 3 — the gate is real.** Alter one character of the reader in a scratch copy of
`dpp/index.html`, run the battery, confirm FAIL, restore.
*Failure: GREEN. That would mean the gate is comparing something other than what it claims.*
