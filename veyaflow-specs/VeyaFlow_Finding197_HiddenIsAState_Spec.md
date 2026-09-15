# VeyaFlow — #197: "hidden" must become a state the product can actually enforce

**15 September 2026 · coding lane → CC · ruled by Strategy**

**The ruling:** *finished, hidden, or honestly empty. No fourth state.* **This shipment builds the
second one.** It is small, and **the whole of its difficulty is that the mechanism already exists
and does not cover what it is named for.**

---

## NAMED BASELINES

Eleven surfaces; `index.html` at
`74f88657245ed4efb79153913bc47658b3acebfdace79e19f0d07b6e63a3ba9c`, branch `f2b-async` at
`2011765`. **Confirm all eleven before editing. Only `index.html` moves.**

**A mismatch stops the shipment and is reported, not worked around.**

---

## WHAT IS BEING HIDDEN — TWO SURFACES, NAMED

| id | label | why |
|---|---|---|
| `csrd` | CSRD Pack | **our absence** — not built for a pilot customer. Showing it shows the customer our gap. |
| `atm-admin` | Template Admin | **never customer-facing** — admin surface, currently gated only by `ns_atm_show_admin`. |

**That is the entire list.** Seasonal Calendar and Buyer Comms were on it and came off: both are
built, and their emptiness is the brand's, not ours. **Do not hide anything not named here**, and
if the implementation makes a third surface convenient to hide, **that is a finding to report, not
a scope to take.**

---

## WHY THE EXISTING MECHANISM CANNOT DO THIS — READ BEFORE DESIGNING

`getVisibleNav()` filters on `PARKED_IDS`, a nine-id enumeration. **Measured, not assumed:**

- **Eight of the nine could never render anyway.** `report`, `compare`, `bizcase`, `cfo`, `find`,
  `sourcing`, `circular` carry `group:"plan"` or `group:"source"` — **group keys absent from
  `NAV_GROUPS`** — so the rail's `n.group === grp.key` filter already excluded them. `pitch` is
  removed unconditionally at 4160.
- **One id is actually governed by the flag: `suppliers`.**
- **`atm-admin` declares `parked: true` at 4144 and is NOT in `PARKED_IDS`** — the object states
  the rule, the list enumerates cases, and the gate reads only the list.
- **`csrd` is in `NAV_GROUPS.comply.ids`** — structurally unreachable by the parked filter.

> **The mechanism exists and does not cover what it is named for.** Fourth instance of the
> signature this week, after `DPP_ORIGIN_LIVE`, `netlify.toml` and `.gitignore` #111.

**So do not extend `PARKED_IDS`.** Adding two ids to a list is the same defect one iteration later
— **the next surface to hide will be forgotten the same way `atm-admin` was.**

---

## THE RULING ON MECHANISM

> **The declaration on the object is the rule. Every gate reads the declaration. No gate carries
> its own list of ids.**

**One predicate, consulted everywhere:**

```
isSurfaceHidden(id)   // single source of truth
```

It reads a **declared property on the NAV entry** (`hidden: true`, or an equivalent you justify) —
**not a list of ids held beside it.** `PARKED_IDS` may remain for the parked/dev-X-ray concern it
already serves; **it must not become the vehicle for this one.**

**If you find yourself writing a second array of page ids anywhere in this shipment, stop and
report.** That is the defect being fixed, reappearing inside its own fix.

---

## THE HALF THAT MATTERS — HIDDEN MEANS UNREACHABLE, NOT UNLISTED

**`getVisibleNav()` filters the rail. `showPage()` is called by id from all over the file.** A
surface removed from the rail while a live control still routes into it produces **#122's shape: a
working path to somewhere the product decided you should not be. That is worse than leaving it
visible, because the app offered the route.**

**Three inbound routes to `csrd` are already known and are the floor, not the census:**

| site | what it is |
|---|---|
| `index.html:7924` | a compliance requirement with `actionPage:'csrd'`, `actionLabel:'Generate in CSRD Pack'` — the Compliance Radar's **Fix now →** |
| `index.html:35143` | a banner button `onclick="showPage('csrd')"` |
| `index.html:34760` | the deep-link handler's accepted-id list |

**1. Do the census first and report it before editing.** **Every** inbound route to the two ids:
`showPage('<id>')` calls, `actionPage`/`link`/`primaryCta`/`page:` fields in data structures,
deep-link and hash routing, the mobile drawer (`sec`-based, separate path), next-action cards,
`REG_DEADLINES` rows, module explainers, and anything that constructs a page id from a variable.
**The count is the finding.**

**2. A hidden surface must be unreachable by all of them.** Two different jobs, and both are
required:

- **The route must not be OFFERED.** A card, row or button whose only action is a hidden page is
  not rendered. **For the Compliance Radar, Strategy has ruled — and the ruling is not to replace
  the action:**

  > **Do not substitute the orphaned action. Check whether the ROW should exist at all.**

  **CSRD applies to large undertakings. Her customer has nought to four employees — 89.5% of the
  population.** `COMPLIANCE_REQS[csrd]` at 7924 carries `categories:['all']`,
  `markets:['all_eu','United Kingdom']` and **no size gate of any kind**, so it renders amber for
  every brand forever. **If the Radar asserts CSRD applies to her, it invents an obligation —
  #170's class — and the orphaned button is the smallest part of the problem.**

  **The primitive exists in the same array.** Citeo (7864) and Norwegian VAT (7918) are
  threshold-gated and resolve it by **asking the brand to confirm** — *"I confirm we're below the
  EUR 500K turnover and 10,000-units thresholds"* (8084). **CSRD has no equivalent. Absence sitting
  directly beside presence, inside one data structure.**

  **In THIS shipment: drop the action, report what the row renders without it, and report the
  applicability defect as #199.** **Do not build the size gate here** — that is its own shipment and
  it needs a brand-size field the model does not have. **Do not delete the row either.** Strategy
  rules on the row once #199 is written.

  *Also report, in passing:* the row's `check` reads
  `filled>=10?'green':filled>=5?'amber':'amber'` — **both branches of the inner ternary return the
  same value.** A three-state intention implemented as two. Not in scope to fix; in scope to name.
- **The route must not WORK if reached anyway.** `showPage('csrd')` typed, bookmarked, or reached
  from a stale deep link **falls through to home**, the way parked deep-links already do at 34766.
  **Silently — no error, no "this page is hidden" notice.** A notice tells a customer a feature
  exists that they cannot have, which is the disclosure this ruling exists to prevent.

**3. The gate must be reversible and it must say how, in the file.** `atm-admin` stays reachable
for Charlotte by its existing `ns_atm_show_admin` flag. **`csrd` needs an equivalent** — the work
is finished code and the parking is a launch decision, not a deletion.

---

## OUT OF SCOPE

- **The honestly-empty half.** Submission Tracker and Performance need empty states carrying *what
  is absent, why, and what would change it*. **Separate shipment.** Do not touch them here.
- **Buyer Comms' empty state** — it passes two of three parts; that is the same separate shipment.
- **#198** (`SEASONAL_INTELLIGENCE` provenance), **#190**, **#196**, **#147**, **#189**.
- **Deleting anything.** No feature code is removed. Hidden is a state, not a deletion.
- **`suppliers` / the parked flag's own behaviour.** Leave both as they are.

---

## REPORT BACK

1. All eleven digests before and after — only `index.html` differs.
2. **The inbound-route census, BEFORE editing.** Every route to `csrd` and `atm-admin`, by line.
   **The count is the finding**, and a route you found but did not close is in scope to report.
3. **The predicate**: where it lives, what property it reads, and **evidence no second id-list was
   introduced.**
4. **The Compliance Radar row without its action** — what it renders, plus **#199 written up: the
   applicability defect, the Citeo/Norwegian-VAT precedent, and the dead inner ternary.** No size
   gate built, no row deleted.
5. The reversal mechanism for `csrd`, and the line that documents it.
6. **Whether any route constructs a page id from a variable** rather than a literal — those cannot
   be found by grepping the id, and if they exist the census is incomplete by construction. **Say
   so plainly if you cannot rule it out.**
7. Anything noticed and not fixed.

---

## VERIFY

Mid-batch reads `AWAITING NAME for: index.html`, exit 1 — correct since #174. Ten other surfaces
unchanged. **A GREEN run while `index.html` differs means the #174 gate has been undone: report and
stop.**

---

## SMOKE

**Step 1.** Default browser (`ns_show_parked` false, `ns_atm_show_admin` unset). **Comply reads 5,
My Brand reads 2, the rail totals 15.** *Failure: 6 and 3 — the rail gate did not fire.*

**Step 2.** `showPage('csrd')` from the console. **Home renders. No CSRD page, no error, no
notice.** *Failure: the page renders — the rail was filtered and the router was not.*

**Step 3.** Compliance Radar with the CSRD requirement in amber. **No "Generate in CSRD Pack" action
anywhere on the surface — and no other control on any surface routes to `csrd`.** *Failure: the
button renders — a route to a hidden page was offered.* **The row itself still renders; that is
#199's question, not this shipment's.**

**Step 4.** Set `ns_atm_show_admin` true, reload. **Template Admin appears, My Brand reads 3.**
*Failure: it stays hidden — the new gate overrode Charlotte's own escape hatch.*

**Step 5.** The reversal flag for `csrd` set, reload. **CSRD Pack renders complete, with its
answers intact from `ns_csrd_answers`.** *Failure: anything missing — hiding removed function
rather than visibility.*
