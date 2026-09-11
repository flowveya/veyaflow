# VeyaFlow — #174: five of seven Netlify functions are outside the battery

**11 September 2026 · coding lane → CC · HARNESS ONLY**

**No tracked digest moves.** `index.html` and the other five surfaces are untouched. Only
`verify.sh` and `verify.expected.txt` change. **The #131 precedent: a shipment that is recorded
here even though no baseline moves.**

---

## NAMED BASELINES — ALL SIX MUST BE UNCHANGED AT BOTH ENDS

```
index.html                           4b268e1774a4a5f90f218bb2df28b71cf6c96159ff7c487d804849345787d3b4
dpp/index.html                       e480976126cb980ab8d248d651c9f60e3be27a33274d59494d8778e602a29714
portal.html                          beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
brand/index.html                     fc6c0586e209f6c67e48d8b770da3e9a2aafa1006647db13beab136d3937da73
netlify/functions/supabase-proxy.js  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
netlify/functions/share-dpp.js       500806f0016201f6cdc839856351ca62b59d68552d82ae56d816ff9a7412f242
```

Branch `f2b-async` at `347dee5`. **Expected at the end: `0 of the 6 tracked surfaces modified`,
then `0 of 11` once the list grows.**

---

## THE FINDING

`netlify/functions/` holds **seven** files. The battery names **two**.

| file | tracked | what it is |
|---|---|---|
| `supabase-proxy.js` | **yes** | the DB proxy — service_role, bypasses RLS (its own comment, line 35) |
| `share-dpp.js` | **yes** | DPP share link |
| `anthropic-proxy.js` | **no** | AI proxy; `netlify.toml` gives it a 30s ceiling |
| `anthropic-proxy-background.js` | **no** | **background** function — 202 immediately, up to 15 min; holds `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY` |
| `get-brand-pack.js` | **no** | public read endpoint |
| `get-dpp.js` | **no** | public read endpoint |
| `share-brand-pack.js` | **no** | called from `index.html:26245` |

**Every one is a public HTTP endpoint.** A change to any of the five passes `./verify.sh` GREEN
at `0 of 6 modified`, with no digest, no baseline, and no place in the one-edit count.

**No hardcoded secrets anywhere in the directory** — verified 11 Sep; every reference is
`process.env.*`. **This is a provenance gap, not a disclosure gap.**

---

## WHY NOW, AND IT IS NOT THE COUNT

**This morning a throwaway background function was found sitting untracked in this directory.**
It had been uploaded through **github.com's web interface** on 5 June, lived on two branches for
31 minutes, and was deleted. It reached zero rows in production and never touched the deploy
branch — a near-miss, closed.

**But it was still in the working tree three months later, one `git add .` from being a live
unauthenticated write endpoint into production.**

**And the control that exists would not have stopped it.** `netlify.toml` blocks
`/netlify/functions/*` from being *served as static text*, and its own comment says why that is
irrelevant here:

> *Blocking these cannot affect the functions themselves — they are invoked at
> `/.netlify/functions/*` (leading dot), which is a different path.*

**The existing control covers disclosure. The hazard is deployment.** Nothing in the repository
watches what lands in this directory.

**The battery has grown for this exact reason twice** — 4→5 at #126, 5→6 at #130, each time
because a surface that mattered was unwatched. **This is 6→11.**

---

## IMPLEMENT

### Part A — five surfaces join `FILES`

Add to `verify.sh`'s `FILES` and to `verify.expected.txt`:

```
netlify/functions/anthropic-proxy.js
netlify/functions/anthropic-proxy-background.js
netlify/functions/get-brand-pack.js
netlify/functions/get-dpp.js
netlify/functions/share-brand-pack.js
```

**The lane names all five digests. Do not write them yourself** — report the measured values and
stop, exactly as for an app surface. **A sha CC reported itself is not sufficient**, and that
rule does not relax because these are small files.

**Check the one-edit label derives from `FILES` and is not a literal.** #126 established this;
confirm it still holds at 11 rather than assuming. **If any string says "6", that is the
finding.**

### Part B — the directory itself becomes the contract

**Part A is another deny-list, and a deny-list is what failed.** Five names added today, and
file number eight is unwatched the moment it appears — which is precisely how the spike sat
here for three months.

**So: assert the directory's contents, not just its known members.**

A gate that lists `netlify/functions/*.js`, sorts, and compares against an expected set of
**exactly these seven names**. **An eighth file FAILS the battery**, naming it, until someone
adds it deliberately — same discipline as `FIXED_CALLSITES` and `NEAR_COPY_GROUPS`.

**This is the half that matters.** Part A watches seven files; **Part B watches the directory**,
and it is the only part that would have caught the spike.

**Report the shape before implementing**, in particular: does anything else legitimately write
to this directory — a build step, `esbuild`, a Netlify plugin? **If the directory is not stable
at rest, say so and stop** rather than shipping a gate that fails on a normal build.

---

## OUT OF SCOPE

- **`index.html` and the other five app surfaces.** Nothing in them moves. If any digest
  changes, **stop** — something is wrong with the shipment.
- **Reading the five functions for defects.** They join the battery as they are today; whatever
  they contain becomes the baseline. **Auditing their contents is a separate shipment** and it
  should happen — `anthropic-proxy-background.js` in particular has never been read by this
  lane — but a provenance gate must not wait on a code review.
- **#99's publish-directory restructure.** Same class — a deny-list where the default is
  exposure — and the real fix for both. Specced this week, not here; it changes deploy
  configuration on a live site and deserves its own day.
- **The spike file.** Moved to `~/veyaflow-spikes/`, outside the repo. The F2b deploy question it
  was written to answer is still open.
- #167, #165, #172, #162.

---

## THE CONDITION — STRATEGY, 11 SEP. EVERY NEW CHECK IS DEMONSTRATED AGAINST A KNOWN FAILING CASE

**Three times this week an artefact vouched for a check that never happened:** #160's legend
advertising an unreachable `Overdue` state, #118's comment standing over the clamp it warned
about, and #134's report noting the renderer keys off `f.value` — which #168 then walked
straight through.

> **THE FOURTH INSTANCE WOULD BE THE BATTERY ITSELF.**

**A new check that passes on clean code proves nothing.** It must be shown catching the thing it
was written for.

**And the asymmetry is why this is a condition rather than a preference:**

> **A strict battery with a bug fails CLOSED — it refuses something it should have allowed, and
> that gets noticed within minutes. A battery with a false clean bill fails OPEN, and it is more
> dangerous than no battery at all, because it carries authority.**

The whole point of this shipment is that someone reads GREEN and believes the functions
directory is watched. **If the gate cannot refuse, GREEN becomes the fourth false artefact — and
this one is the instrument the other checks are judged by.**

**So: both gates in Part A and Part B are demonstrated failing, then passing, from a pristine
copy.** Not only the directory gate.

- **Part A** — alter one of the five newly-tracked functions by a single byte. The digest gate
  must FAIL and NAME that file. Revert. PASS.
- **Part B** — add a scratch file to `netlify/functions/`. The directory gate must FAIL and NAME
  it. Remove it. PASS.

**Report both transcripts.** A gate that has not been seen refusing is not known to work, and
this lane has declined that shape eight times.

---

## STOP. NO COMMIT.

Five names, one directory gate, one shape report, **two failure demonstrations.**

---

## REPORT BACK

1. **sha256 of all six existing surfaces, before and after — ALL SIX UNCHANGED.** This is the
   shipment's central claim and the only one that can fail silently.
2. The five measured digests, reported for the lane to name.
3. **The one-edit label at 11 surfaces** — derived, not literal. Quote the line that produces it.
4. Part B's shape report: what writes to `netlify/functions/`, and whether it is stable at rest.
5. **BOTH GATES SEEN FAILING, then passing, from a pristine copy — Strategy's condition, see
   above.** Part A: alter one newly-tracked function by a single byte; the digest gate must FAIL
   and NAME it; revert; PASS. Part B: add a scratch file to the directory; the gate must FAIL and
   NAME it; remove it; PASS. **Report both transcripts.** A check that passes on clean code
   proves nothing — it must be shown catching what it was written for.
6. `./verify.sh` output, full.
7. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected. **`0 of the 11 tracked surfaces modified`** — no digest moves in this shipment.

---

## SMOKE

**There is no browser smoke. This ships no behaviour.**

The equivalent is report 5: **the gate must be seen failing and then passing.** A provenance gate
that has never refused anything is the shape this lane has declined eight times.
