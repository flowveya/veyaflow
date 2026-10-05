# VeyaFlow — B1.0 · Läsning mot trädet

**Till:** CC · **Från:** CODING · **Datum:** 5 okt 2026
**Leverans:** en **LÄSNING**. Ingen fil ändras. Ingen commit. CC rapporterar och **STANNAR**.

---

## 0 · ANKARE OCH FÄRSKHETSKONTROLL

Färskhetskontrollen är lanens, gjord 5 okt före utskick. CC når inte loggrepot och bär därför ingen kontroll CC saknar instrument för.

| Ruling | Sektion i `open-items.md` | Commit |
|---|---|---|
| B lager 1, omfång | `B LAGER 1 — OMFÅNG, I SPECBAR FORM` | `0d99368` |
| B1.0:s sex mätningar | samma sektion, §5 | `0d99368` |
| Omfattningsregeln (K36) | `STRATEGY 5 OKT, KVÄLL` §2 | `0d99368` |

**Rulingens operativa text för B lager 1, ordagrant:**

> Posten: **en rad per produkt, på servern, med ett id som servern utfärdat.**
> `brand.id` = server-utfärdat UUID vid skapande, **inget id härleds ur namn eller session**. `account → brands` 1:N i schemat från start. Operatörspost per SKU och regim: `{regime, name, renewalDate, confirmedAt, source}`. **Certifieringar och CPNP bor på produkten, aldrig på varumärket.**
> **INTE lager 1:** gränssnitt för flera varumärken · tillverkaren som källa · positionen (skiva 3) · `brandPackState.skuIds` · Supabase Pro.

**Omfattningsregeln, stående, för sammanhang — den styr vad B1.1 blir:**

> Ett värde som hör till en **produkt** renderas aldrig som ett påstående om **varumärket**. På varje yta som talar om varumärket eller katalogen står det som **N av M**, räknat av kod.

---

## 1 · DETTA ÄR EN LÄSNING

**Inga filer ändras. Inga filer skapas i repot. Ingen `git add`, ingen commit, ingen databassats.** CC läser, rapporterar, stannar.

**Belägg är namn, inte radnummer** — funktionsnamn, konstantnamn, filnamn, tabellnamn. Ett radnummer överlever inte nästa insättning.

**Där CC inte kan nå något: skriv `OLÄST` och varför.** Gissa inte, och härled inte ett svar ur koden där frågan gäller databasen. **En kodläsning belägger vad koden försöker, aldrig vad som finns.**

---

## 2 · ARBETSFÖRDELNING — tre av sex frågor når CC inte

Strategys §5 listar sex mätningar. **Tre av dem ligger utanför CC:s räckvidd** och lanen delar dem här hellre än att låta CC upptäcka det mitt i rapporten.

| # | Fråga | Vem |
|---|---|---|
| 1 | Vilka tabeller finns i Supabase, vilka bär postdata | **Charlotte** (SQL) + CC (vilka koden rör) |
| 2 | Vad läser och skriver `supabase-proxy.js`, tabell för tabell, med vilken nyckel | **CC** |
| 3 | Vad finns bara i `localStorage` för C&G-arbetsytan, nyckel för nyckel | **Charlotte** (webbläsaren) + CC (vilka nycklar koden skriver) |
| 4 | Formen på `brand.id` och `sku.id`, var de härleds, hur många ställen som läser dem | **CC** |
| 5 | Vilka SKU-fält bär regelefterlevnad | **CC** |
| 6 | Går det att läsa ur posten vilka fem SKU:er som är verkliga | **CC föreslår instrumentet, Charlotte avgör** |

---

## 3 · CC:S FYRA MÄTNINGAR

### M2 — `supabase-proxy.js`, tabell för tabell

Källa: `netlify/functions/supabase-proxy.js` (36 265 B, spårad yta, baslinje `7b498d16`).

Rapportera en rad per **operation**, inte per funktion:

| tabell | operation | nyckel som används | vem auktoriserar |
|---|---|---|---|

- Vilken nyckel varje anrop bär: `SUPABASE_ANON_KEY` eller `SUPABASE_SERVICE_KEY`.
- **Vad proxyn godtar från anropets kropp utan verifiering.** `get-brand-pack.js` bär en kommentar (fynd `#186`) som säger att `supabase-proxy.js` godtar `session_id` **utan verifiering** och att det är en **oförfallande bärarkredential**, öppet till `#147`. **Bekräfta eller fäll det i källan.**
- **Den avgörande frågan för B1.2:** om servern blir primärt lager, skriver varje arbetsyta då genom samma oförfallande bärarvärde? **Står `#186`/`#147` i vägen för B1.2 — ja eller nej, med belägg?**

### M4 — id-formerna

- Vilken form har `brand.id` i dag? Finns det ens? Rapportera var det sätts.
- Vilken form har `sku.id`? Seeden bär `id:'seed-serum'` — är det formen för alla, eller bara fixturen?
- **Var härleds ett id ur ett namn eller en session?** Känt ställe: `share-brand-pack` bygger `brandId` som `brand.name.toLowerCase().replace(/[^a-z0-9]/g,'_') + '_' + getSessionId()`. **Finns fler?**
- **Räkna läsställen** för `brand.id` och `sku.id` var för sig. Antalet är B1.3:s migreringsyta.
- Finns redan något server-utfärdat id i trädet? `shareId` returneras av `share-brand-pack` — rapportera var det lagras och vem som läser det.

### M5 — SKU-fälten som bär regelefterlevnad

**Listan blir B1.1:s kolumner, så den ska vara uttömmande.** Gå igenom `renderSkuEdit` och `skuForm` och rapportera varje fält med:

`fältnamn · etikett på skärmen · typ (fritext / lista / bool / datum) · var det läses`

Kända att leta efter, inte en komplett lista: `cpnp` / `cpnpNumber`, `euResponsible`, `safetyRef`, `safetyAssessor`, `pifRef`, `dossier.*.documentRef`, `certifications`, `inci`, `allergens`, `ph`, `ceMarking`, `productType`, `shelfLifeMonths`, `countryOfMfr`.

**Markera för varje fält om det är per-SKU eller om något ställe läser det som ett varumärkespåstående.** Det är omfattningsregelns mätning och den som avgör hur många ytor K36 rör.

### M6 — går det att skilja verkliga SKU:er från fixturer *ur posten*?

Lanens förslag, att **mäta, inte anta**: EAN-numret. Mätt i listan: *Forehead Tape* `7350105830624`, *Led Face Mask* `7350105830747`, *Face Serum* `1234567891023`. Den tredje är en uppenbar attrapp.

**CC mäter:** har varje SKU:s EAN en giltig GS1-kontrollsiffra, och vilket prefix? Rapportera en tabell `namn · EAN · kontrollsiffra giltig · prefix`. **Rapportera signalen, dra ingen slutsats om vilka fem som är verkliga** — det avgör Charlotte.

---

## 4 · CHARLOTTES TVÅ MÄTNINGAR

Lanen levererar dem separat. De står här så att CC vet varför M1 och M3 saknas i rapporten.

- **M1:** tabellistan ur Supabase (`information_schema.tables`), läsning.
- **M3:** `localStorage`-nycklarna för C&G-arbetsytan, lästa i webbläsarens **Application → Local Storage**. **Inte konsolen och inga konsolskärmdumpar** — K37:s regel står tills loggraden är ute.

---

## 5 · DETTA GÖR CC INTE

- Ändrar ingen fil. Skapar ingen fil i repot. Ingen `git add`, ingen commit.
- Kör ingen databassats och föreslår ingen.
- Härleder inte ett svar om databasen ur koden. **`OLÄST` är ett giltigt svar; en gissning är det inte.**
- Föreslår inget schema. B1.1 är en egen leverans.
- Namnger ingen digest.
- Rör inte `/share-brand-pack.js` i roten (ignorerad, fynd `#176`).

---

## 6 · RAPPORTFORM

En rubrik per mätning, i ordningen M2, M4, M5, M6. Varje påstående bär sitt `Belägg:` som ett namn. Allt som inte kunde mätas står som `OLÄST` med skälet. **Sedan STANNAR CC.**

Lanen verifierar mot källan och skickar vidare till Strategy. **B1.1 specas först när B1.0 är läst** — ett schema skrivet före mätningen är ett antagande med kolumner.
