# VeyaFlow — #252a: the product records an intent the customer never expressed

**1 October 2026 · coding lane → CC · ruled by Strategy · SUBTRACTION, THREE LINES**

**The shipment has one purpose:**

> **STOP STORING A FACT ABOUT THE CUSTOMER THAT SHE NEVER ASSERTED.**

**This is the first item in the ruled queue and the smallest. It is not the escrow copy** — that is
#252 proper and waits on the reachability measurement.

## DISPATCH LOG

| date | sent | evidence |
|---|---|---|

---

## NAMED BASELINES

**Eleven surfaces at the values `verify.expected.txt` NAMES**, clean tree, 57 gates GREEN,
`0 of the 11 tracked surfaces modified`, exit 0. **Confirm all eleven before starting.**

---

## THE FINDING

```
36771   brand.interestedInEscrow = true;                      openEscrowModal — ON OPEN
36772   brand.escrowInterestDate = new Date()…slice(0,10);    openEscrowModal — ON OPEN
36900   brand.interestedInEscrow = true;                      on submit
```

**`Belägg: index.html:openEscrowModal`, `index.html:submitEscrowWaitlist`.**

**The first two fire when the customer clicks `Learn about escrow →` — AN INFORMATIONAL LINK.**
*Opening a modal that explains what escrow is records, with a date, that she is interested in it.*

> **A STORED DECLARATION STANDING IN FOR SOMETHING THE USER WAS NEVER ASKED.** *`filled:true`'s
> family — #134's class — and it is not a promise, so no copy ruling reaches it.*

**AND MEASURED: THREE WRITES, ZERO READERS.** *Nothing in `index.html`, the seven functions or any
other surface reads either field.* **It is write-only, persisted into `ns_brand`, and consulted by
nothing** — so the record exists solely to be wrong.

---

## THE EDIT

**All three lines removed. Nothing replaces them.**

**NO MIGRATION, AND THE REASON IS MEASURED:** *the fields have no readers, so a stale `true` in an
existing `ns_brand` harms nothing.* **Removing values from a customer's stored state is a write to
her data to fix a defect in ours** — *and the #148 reasoning applies: do not alter what you do not
have to.* **Report that the fields may persist in existing local state; do not clean them.**

**`openEscrowModal` KEEPS WORKING.** *This removes two lines from it, not the function.*

---

## OUT OF SCOPE — AND THE DISTINCTION IS THE POINT

- **The escrow COPY.** *Four more unsourced claims sit in the info and waitlist views — a
  partnership in the present tense, a 4-6 week timeline, a fee figure for a service that does not
  exist, and "manufacturer usually shares the fee".* **That is #252 proper, and it waits on the
  reachability measurement, which decides its queue position and not its correctness.**
- **The escrow mechanism.** *Escrow was the transaction layer on the sourcing side — the revenue
  model, in the shape NuOrder and RangeMe occupy.* **Removing the code would be the subtraction
  error in the other direction**, as with the dormant trial machinery.
- **`submitEscrowWaitlist` itself**, beyond its one write. *The sign-up is ruled out as part of #252
  proper, together with the view that renders it.*

---

## REPORT BACK

1. All eleven digests before and after.
2. **Confirmation that both field names have zero remaining occurrences** across all eleven
   surfaces — *the measurement that makes this safe is absence of readers, so absence is what the
   report states.*
3. **That `openEscrowModal` and `submitEscrowWaitlist` still execute**, minus those lines.
4. Anything noticed and not fixed.

**`Belägg: <file:name>` or `OLÄST` on every claim about the code.**

---

## SMOKE — ONE STEP, AND ITS ENTRY POINT IS NAMED

**Step 1 · the step that can fail. ENTRY: console on `localhost:8000`.**

Reach a manufacturer brief surface, click **`Learn about escrow →`**, then in the console:

```js
JSON.parse(localStorage.getItem('ns_brand')).interestedInEscrow
```

**It reads `undefined`.** *Failure: it reads `true` — the write still fires.*

> **IF THE PROMPT CANNOT BE REACHED, SAY SO AND DO NOT SUBSTITUTE A CONSOLE CALL FOR THE CLICK.**
> *Every escrow render site may sit inside a parked surface; that is the open measurement. A step
> whose entry point cannot be reached is unrunnable, and this lane has written six of those —* **the
> report states it rather than working around it.**

**NOT A TEST, AND IT SAYS SO:** confirming the modal still opens. *Two lines were removed from it;
it was never going to stop opening.*
