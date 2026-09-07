# VeyaFlow — Time axis, step 1: stamp every human confirmation

**7 September 2026 · coding lane → CC · ruled by Strategy the same day**

**Capture only. This shipment renders nothing and reasons about nothing.**

---

## WHY THIS IS URGENT AND NOTHING ELSE IN THE QUEUE IS

**Data we do not capture today cannot be backfilled.** Every day without the stamp is a day
of history that can never be reconstructed. Strategy's rule, and it is a new standing one:

> **"Nothing new is built before evidence" stands. But capture and rendering are not the
> same thing, and the difference is asymmetric: deferring a feature costs waiting time,
> deferring collection destroys the option permanently.**
>
> **Collection that cannot be backfilled may precede evidence. Anything that renders or
> reasons about it may not.** The stamp passes. A "last confirmed" chip in the UI does not.
> A staleness flag definitely does not.

The whole thesis is that the history accrues in real time and cannot be migrated in — nobody
can build our customers' past. Right now we are not building it either.

---

## NAMED BASELINES

```
index.html   sha256  48fe2758068e96918b9cb1becb98016aae2b990a1a6758cdca44b02ced7a2d76
                     41,428 lines
portal.html  sha256  beaa72b85e853dab6cae4d29413fc15e131999e3ee8a2b71bd20e0beb13cd237
netlify/functions/supabase-proxy.js  sha256  78c4f6a2ddc551ce63b1b24e307e1b770454b17633c24c6f3acbcb4d50dbb376
```

Branch `f2b-async` at `6f68026`. **Confirm all three before editing.**

---

## THE ONE WRITE SITE

`toggleRetailChecklistItem` (39332–39340) is the only place in the app where a human records
a confirmation:

```js
function toggleRetailChecklistItem(reqId){
  loadRetailChecklist();
  var stateKey = retailChecklistSelRetailer+'::'+retailChecklistSelSku;
  var s = retailChecklistState[stateKey] || {};
  s[reqId] = !s[reqId];
  retailChecklistState[stateKey] = s;
  saveRetailChecklist();
  renderPage('retail-checklist');
}
```

Provenance already knows **who** (single-user app). It does not know **when**.

---

## THE TRAP — READ THIS BEFORE WRITING ANYTHING

**Do not change the shape of the boolean.**

`retailChecklistState[key][reqId]` is a bare `bool`, and the renderer reads it as truthy:

```js
if(autoDone || state[r.id]) doneCount++;
```

Turn the value into `{done, at}` and **every object is truthy** — including
`{done:false, at:…}`. Every requirement would render as complete, and a brand's entire
compliance checklist would silently show as done. A capture-only change that marks
everything complete is the worst available outcome of an edit whose whole claim is that it
breaks nothing.

**So the stamp goes in a parallel map**, keyed identically, in its own storage key:

```
ns_retail_checklist_stamps   →   { "<retailerId>::<skuId>": { "<reqId>": "<ISO timestamp>" } }
```

The existing read path never sees it. That is not caution; it is the reason this is safe.

---

## IMPLEMENT

1. **A parallel stamp map** under `ns_retail_checklist_stamps`, written in
   `toggleRetailChecklistItem` alongside the existing save, through `persistCritical` like
   every other key.

2. **Stamp the toggle, never the auto-check.** The checklist has two sources per row:
   `state[r.id]`, which a human toggled, and `autoDone` from `r.autoCheck`, which the app
   **derived**. Only the first is a confirmation. **Stamping a derived value would record
   that a person confirmed something the app inferred** — manufactured provenance, the exact
   class this lane has spent the week removing.

3. **Record the untick too.** `s[reqId] = !s[reqId]` toggles both ways. An unconfirmation is
   history as much as a confirmation, and a stamp that only survives while the box is ticked
   is not a record of what happened. State how you represent it.

4. **Nothing reads this key.** No render, no count, no badge, no colour, no sort.

---

## THE GATE — because "write-only" must be a cannot, not a must-not

Strategy's decision filter, applied to this spec: *when a rule is phrased as "must not", ask
whether it can be phrased as "cannot".*

**Add a guard to `verify.js`**: `ns_retail_checklist_stamps` appears in exactly the write
sites this shipment creates, and **zero read sites**. Any `getItem` of that key, any
reference in a render function, fails the battery.

Without it, "renders nothing" is a rule someone has to remember, and the first person who
wants a "last confirmed" chip will add one in good faith. With it, the gate says no before
review does. **Name the expected write-site count as a fixed contract**, the way
`FIXED_CALLSITES` already does — a floating count is not a contract.

---

## REPORT, DO NOT IMPLEMENT

1. **Every other surface where a human confirms something.** Brand profile saves, SKU saves,
   the DPP publish action, claim approvals, outcome capture. For each: does a timestamp
   already exist, client or server side? **The outcome-capture flow already gets `created_at`
   server-side — that pattern may already cover more than we think.** Report the list; do not
   stamp any of them. **Whether they count as "a human pressing yes" is Strategy's ruling.**
2. **Whether `persistCritical` is the right vehicle** for a write-only key, or whether it
   carries behaviour (remote mirroring, quota handling) that makes a second key costly.
3. **Storage growth.** One ISO string per requirement per retailer-SKU pair. State the
   realistic ceiling — `localStorage` has a hard limit and #114a showed us what silent
   failure at that boundary looks like.

---

## OUT OF SCOPE

- **The certificate schema migration** — step 2, the first vertebra. Its own spec, next.
- **Soft staleness of any kind.** Strategy: it waits until the stamp has existed for a while,
  because only then is there something to reason about.
- **The RP agreement.** Built, correct, amber-not-blocking. **Do not touch it.**
- Any UI showing when something was confirmed. That is a render and it is forbidden here.
- #122/#127, #123, #114c, #119, #115, #116, #117.

---

## STOP. NO COMMIT.

Four implements, one harness guard, three reports.

---

## REPORT BACK

1. sha256 of all three tracked surfaces; confirm they matched.
2. Before/after for `toggleRetailChecklistItem`, and how the untick is represented.
3. The `verify.js` guard, and the fixed write-site count it asserts.
4. The three reports. **Report 1 is the finding** — how many confirmation surfaces exist.
5. Anything noticed and not fixed.

---

## VERIFY

```
./verify.sh
```

GREEN expected; `index.html` DIFFERS from `48fe2758`; `portal.html` and the proxy UNCHANGED.
The new guard must be **visible in the output** — a gate that runs silently is a gate nobody
knows they have.

---

## SMOKE

**Step 1.** Tick a checklist requirement. In the console:
```js
JSON.parse(localStorage.getItem('ns_retail_checklist_stamps')||'{}')
```
The stamp is there, with an ISO timestamp.

**Step 2 — the one that catches the trap.** The checklist renders **exactly as before**.
Same items ticked, same percentage, same bar.
*Failure: any requirement appearing complete that you did not tick. That is the truthy trap
and it means the boolean's shape moved.*

**Step 3.** Untick it. The stamp map records that too.

**Step 4 — the step that proves it is write-only.** Nothing anywhere in the UI shows a
confirmation time.
*Failure: any visible timestamp. This shipment captures; it does not tell.*
