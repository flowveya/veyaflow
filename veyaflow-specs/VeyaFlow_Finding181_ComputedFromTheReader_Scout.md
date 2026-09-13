# VeyaFlow — #181: what is computed from the reader instead of from the record

**12 September 2026 · coding lane → CC · SCOUT. READ ONLY. NO EDITS.**

**THE RULE, STRATEGY, 11 SEP:**

> **Every value rendered to more than one party must be a property of the RECORD, never of the
> one who is looking.**

**THIS SCOUT IS SENT ON THE RULE, NOT ON AN INSTANCE — and that is deliberate.** The case that
raised the rule (#180's day count) **turned out not to be an instance at all**: the lane claimed
two readers could disagree, CC measured four timezones, and they agreed with each other in every
case. **The rule survived; the example did not.**

> **A scout sent to confirm a claimed instance finds it. A scout sent to look finds what is
> there.**

**So: do not go looking for timezone bugs.** Go looking for **anything rendered to more than one
party whose value depends on who is rendering it.** Report what exists, including nothing.

---

## NAMED BASELINES — ELEVEN SURFACES, UNCHANGED AT BOTH ENDS

Request current values from the lane. **`./verify.sh` must be GREEN, `0 of the 11 tracked
surfaces modified`, exit 0, at the end.** Measure in a pristine copy. **A scout that moves a
digest has stopped being a scout.**

---

## RUN IT BESIDE #179 AND #147 — THEY ARE ONE QUESTION

**Is there a record?** #179: does it survive a **boot**. #147: does it survive a **browser**.
**#181: is it the same for both parties.** A record failing any one of the three is not a shared
record, which is what §9 says the moat is.

---

## WHAT COUNTS AS READER-DEPENDENT

**Reader-dependent** — the value or its rendering changes with who is looking:

- `toLocaleDateString`, `toLocaleTimeString`, `toLocaleString` (dates **and** numbers)
- `Intl.DateTimeFormat`, `Intl.NumberFormat`, `Intl.Collator`, `Intl.RelativeTimeFormat`
- `localeCompare` — **ordering that differs by locale is a reader-dependent LIST**
- `navigator.language`, `navigator.languages`
- `Intl.DateTimeFormat().resolvedOptions().timeZone`
- any bare `new Date()` reaching a rendered string, and `getHours`/`getDate`/`getFullYear`
  (local getters) where `getUTC*` was meant
- currency symbols or decimal/thousands separators chosen at render time

**NOT reader-dependent, do not report:** `toFixed`, `JSON.stringify`, template literals over plain
values, `Array.prototype.sort` with no comparator (lexicographic by code unit, not locale), and
**UTC-anchored arithmetic — `daysUntil` after #180 Part 1 is correct and is not a target.**

---

## WHERE IT COSTS — SEARCH THESE FIRST

**Ranked by how many parties see the output. Report per surface.**

1. **`dpp/index.html`** — the public product passport. **Read by consumers, scanned from a QR code
   on packaging, and the QR is the only physically permanent surface.** Widest audience in the
   product.
2. **`portal.html`** — the retailer's side. **A tracked baseline that has never been swept for
   this**, and the two-sided surface Strategy named.
3. **`brand/index.html`** — the shared brand pack.
4. **The exports** — CSV, TXT, JSON, and the PDFs (line sheet, spec sheet). **Generated in the
   BRAND's browser and read by the RETAILER.** A date rendered `9/11/2026` in one locale and
   `11/9/2026` in another is not a formatting preference; **it is an ambiguous date on a
   commercial document**, and nothing downstream can recover which was meant.
5. **`index.html`** — mostly single-party, so report it last and only where output leaves the
   browser.

---

## THE ONE THAT WOULD BE WORST, CHECK IT EXPLICITLY

**Does any reader-dependent value feed a HASH, an ID, or a persisted string?**

`_ssCanon` builds the spec sheet's **Document ID** with SHA-256. Time-axis step 3a established
that a change there makes **every previously issued spec sheet silently unreproducible** —
**#93's one-time cost re-paid, with no symptom.**

**If a locale-formatted date or number is inside that hash, then two people generating the same
spec sheet from the same record get DIFFERENT DOCUMENT IDs.** That is the rule's worst possible
violation: not a cosmetic difference but **a record that cannot prove it is the same record.**

**Check it directly and report it first, whatever the answer.** The same question applies to
`dppId`, `outputFileHash`, `templateVersionUsed`, and anything written to `ns_*` storage or sent
through the proxy.

---

## REPORT BACK

1. All eleven digests before and after — unchanged, `0 of the 11 tracked surfaces modified`.
2. **THE HASH QUESTION, ANSWERED FIRST.** Does any reader-dependent value reach `_ssCanon`'s
   Document ID, `dppId`, `outputFileHash`, a persisted string, or a proxy payload? **Yes or no,
   with the lines.**
3. **The census, per surface, in the order above.** For each site: the expression, what it
   renders, **how many parties see it**, and whether the difference is cosmetic or changes
   meaning. **A date is the case where cosmetic becomes meaning.**
4. **Classify each as: violates the rule · reader-dependent but single-party · not
   reader-dependent.** The middle class is not a defect today and becomes one the moment that
   surface is shared — **name those, because they are the cheapest to fix before they matter.**
5. **What the correct form would be** for the worst three. Not an implementation — one line each.
6. **NOTHING FOUND IS A VALID AND USEFUL RESULT.** If a surface is clean, say so with the searches
   used, per the standing rule. **Do not manufacture instances to justify the scout.**
7. Anything noticed and not fixed.

---

## OUT OF SCOPE

- **Any edit.** This is a read.
- **#180's day count.** Correct after Part 1; its residual is Part 2's, already ruled.
- **Language of COPY** — a Swedish and an English description are deliberately different strings.
  **The rule is about one value rendering differently, not about translations.**
- #179, #147, #165, #172, #162.

---

## VERIFY

```
./verify.sh
```

**GREEN, `0 of the 11 tracked surfaces modified`, 0 not found, exit 0.**

---

## NO SMOKE

Nothing ships. **Report 2 is the evidence** — and if the answer is no, that is the scout's best
possible outcome and it should be stated as plainly as a finding would be.
