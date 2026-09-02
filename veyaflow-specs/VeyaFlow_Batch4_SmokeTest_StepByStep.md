# VeyaFlow — Batch #4 Smoke Test, step by step

**Run after pushing batch #4 and waiting ~2 min for Netlify.**
Roughly 20 minutes. Work top to bottom. **Do not fix anything** — record and move on.

Mark each step **PASS**, **FAIL**, or **N/A**. If a step fails, keep going: one failure rarely blocks the rest, and I need the whole picture.

---

## STEP 0 — Before you touch anything: record the starting state

**0.1** Open the app normally. Go to **Brand Home**.

**0.2** Write down: does it currently show a **VeyaFlow Verified** badge or tier anywhere? Yes / no, and what it says.

> Why: batch #4 changes how the tier is earned. Without knowing the "before", you can't tell whether it changed.

**0.3** Note the big **/100 readiness number** on Brand Home and the "Biggest gap" line beneath it.

> Why: that hero is *out of scope* for batch #4 — it belongs to batch #5. It should still be there and still work. If it has vanished or broken, that's a regression and I want to know immediately.

---

## STEP 1 — Confirm you are on the new build

**1.1** Open the app with a cache-buster: add `?v=5` to the URL, e.g. `https://veyaflow.netlify.app/?v=5`

**1.2** Open the browser console (Cmd-Option-J).

**1.3** Type and run:
```js
typeof buildSkuReadiness
```

**EXPECT:** `"function"`

**IF IT SAYS `"undefined"`** — stop. You're on the old build. Either the push didn't land or Netlify hasn't finished. Check the Netlify dashboard for the deploy, wait, retry. **Everything below is meaningless on the old build.**

**RECORD:** what it said.

---

## STEP 2 — Make a fresh submission

The portal only shows the new format for submissions created *after* this deploy. An older row will correctly show "Not scored" — that's Step 5, not a failure here.

**2.1** Brand side → **Submission Tracker** (or wherever you normally create a submission).

**2.2** Create a **new submission to Lyko** (the test retailer account).

**2.3** Include **both** products if you can — the Face Serum and the LED Face Mask. Two products with different types is the whole point: it lets the count say something other than "1 of 1".

**2.4** Note the time you submitted.

**RECORD:** did it submit without error? Any red failure toast? (Batch #3 added those — a red box here would mean a save failed.)

---

## STEP 3 — The portal card

**3.1** Open **portal.html**, log in as the test retailer.

**3.2** Find your new submission in the inbox.

**3.3** Look at where the big score number used to be.

**EXPECT:** something like **"1 of 2 products ready"** — a count, not a number out of 100.

**EXPECT:** if a product isn't ready, it is **named** with its reason, e.g. *"Cloud & Glow Led Face Mask — CE marking missing"*.

**FAIL LOOKS LIKE:** any number followed by `/100`, any percentage, any coloured score box, the words "out of 100".

**3.4** Check the tier text on the card.

**EXPECT:** no "Verified tier" wording unless the pack genuinely carries a verified flag.

**RECORD + SCREENSHOT** the whole card.

---

## STEP 4 — The inbox filter

**4.1** Look at the filter bar above the submissions.

**EXPECT:** the "Readiness ≥ 60/70/80/90" dropdown is **gone**, replaced by something like **All products / Has blocking issues**.

**4.2** Select **"Has blocking issues"**.

**EXPECT:** submissions with a blocked product appear; ones with everything ready do not.

**4.3** Switch back to **All**.

**EXPECT:** every submission reappears — **including the old one that has no per-product data**. Nothing should silently vanish.

**RECORD:** did the old submission stay visible under "All"?

---

## STEP 5 — The detail view (new submission)

**5.1** Click into your new submission.

**5.2** Look at the top-right card where the readiness breakdown used to be.

**EXPECT GONE:** the 3rem score number, the `/ 100` label, and the four coloured dimension bars (compliance / commercial / operational / brand).

**EXPECT PRESENT:** a **"Product readiness"** card listing each product by name, with its framework and either **Ready** or its named blockers.

**EXPECT PRESENT:** one line stating what Ready means — *"Ready = no blocking issues for this retailer."*

**FAIL LOOKS LIKE:** any dimension bars, any score, or a product listed with no status at all.

**5.3** Scroll to the products table.

**EXPECT:** columns still follow product type — a device shows CE marking and **no CPNP**; a cosmetic shows CPNP and Claims.

**5.4** Scroll to the bottom.

**EXPECT:** "Submitted via VeyaFlow — compliance status shown per product above." and nothing claiming checks were completed.

**RECORD + SCREENSHOT** the detail view, top and bottom.

---

## STEP 6 — The old submission (backward compatibility)

**6.1** Go back to the inbox. Open the **older test submission** (the one from yesterday).

**EXPECT:** **"Not scored"** in muted type.

**FAIL LOOKS LIKE:** any number. That row has a blended score stored in the database, and it must never be rendered again — banned whether it's fresh or historical.

**RECORD:** exactly what it says.

---

## STEP 7 — The magic-link Brand Pack (fresh)

This is the fixup. The pack goes to retailers in pitch emails.

**7.1** Brand side → **Brand Pack** page → generate or refresh the magic link.

**7.2** Copy the link and open it — **in a private window**, so you see it as a retailer would with no session.

**7.3** Scroll the whole pack, top to bottom.

**EXPECT GONE:** the entire "Market Readiness Score" section — the number, the `/100`, and the coloured progress bar.

**FAIL LOOKS LIKE:** the section present, a zero, a dash, an "N/A", or an empty labelled box where it used to be. It should be **absent**, not emptied.

**7.4** Check the rest of the pack still renders — cover, sections, product cards.

**EXPECT:** layout closes naturally with no gap or orphaned heading.

**RECORD + SCREENSHOT** the full pack.

---

## STEP 8 — The magic-link Brand Pack (previously shared)

**Only if you have an older link from before today.** If not, mark N/A.

**8.1** Open that older link in a private window.

**EXPECT:** also **no readiness section** — even though its stored data still contains the old score.

> Why this is a separate test: Step 7 proves the field is no longer *sent*. This proves old stored data can't *resurrect* it. Different halves of the same fix.

**RECORD:** what you saw.

---

## STEP 9 — The Verified tier

**9.1** Return to Brand Home. Compare against what you wrote in Step 0.2.

**EXPECT, most likely:** the Verified badge is **gone**.

> That is the correct outcome, not a bug. It was granted because one arbitrary product scored ≥70. The new rule requires **every** product to be clear of blocking issues in at least one target market. The LED Face Mask has an open blocker, so the tier should lapse.

**9.2 — If the badge is still there**, don't celebrate yet. Check whether it's genuinely earned: every product clear of red blockers somewhere. If you can't convince yourself that's true, tell me — a surviving badge may mean the new condition isn't being applied.

**RECORD:** gone or still present, and your read on why.

---

## STEP 10 — Regression sweep (the surfaces batch #4 touched indirectly)

Batch #4 deleted two functions and changed a snapshot. These four surfaces read from that neighbourhood and must still work.

**10.1 — Brand Home** — loads, hero number still shows (out of scope for this batch, should be unchanged).

**10.2 — COMPLY / readiness page** — loads, market and retailer selectors work, blockers list appears.

**10.3 — CRM cards** — load and show retailer cards.

**10.4 — Submission Tracker** — loads, your submissions appear, the expanded card renders.

**EXPECT:** all four render. Any blank page or missing section is a regression from batch #4 and I need to know immediately.

**RECORD:** any that failed.

---

## STEP 11 — Console check

**11.1** With the app open, look at the console.

**EXPECT:** no red errors mentioning `buildSkuReadiness`, `computeLiveReadiness`, `readLatestReadinessScore`, or `scoreReadiness`.

> `computeLiveReadiness` and `readLatestReadinessScore` were **deleted** in this batch. If anything still calls them you'll see a `ReferenceError` — that's the highest-value thing this step can catch.

**11.2** Note any 502 / 504 from `supabase-proxy` — we saw transient ones yesterday and the backend was healthy. Worth tracking whether they recur.

**RECORD:** any red errors, verbatim.

---

## STEP 12 — Batch #3 still holding

Quick confirmation that yesterday's fix survived.

**12.1** Dismiss any nudge or banner in the UI.

**EXPECT:** it dismisses silently. **No red failure toast** — those writes are meant to fail quietly, and a toast here would mean the warning has become noise.

**12.2** Edit a product and save normally.

**EXPECT:** the usual success toast, and the change persists after a reload.

**RECORD:** both.

---

# RESULTS — send me this

```
STEP 0  starting tier: ............   hero number: ......
STEP 1  typeof buildSkuReadiness: ......
STEP 2  submission created: PASS / FAIL   notes:
STEP 3  card shows counts: PASS / FAIL    what it said:
STEP 4  filter replaced + old row visible: PASS / FAIL
STEP 5  detail view, no score/bars: PASS / FAIL
STEP 6  old submission "Not scored": PASS / FAIL
STEP 7  fresh magic link, no score section: PASS / FAIL
STEP 8  old magic link: PASS / FAIL / N/A
STEP 9  Verified tier: gone / still there
STEP 10 regression sweep: all four OK? which failed:
STEP 11 console errors:
STEP 12 batch #3 holding: PASS / FAIL
```

Screenshots for steps 3, 5, 7 at minimum. Send it all in one go when you're done — this one I'd rather have complete than streamed.
