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
| 6 | **RÄTTAD:** vilka fem SKU:er motsvarar Lykofilens fem rader | CC listar alla 51 · **Charlotte matchar mot filen** |
| 7 | **K44:** vad härleds produktlistans brickor, procenttal och `✓ CPNP confirmed` ur | **CC** |
| 8 | **NY:** lagrar appen i dag en källa för något fält, någonstans | **CC** |

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

### M6 — vilka fem SKU:er motsvarar Lykofilens fem rader

**RÄTTAD 5 okt (Strategy, tillägg).** Den tidigare frågan — *"vilka fem är verkliga"* — byggde på ett antagande som aldrig mättes.

> **Charlotte, mätt:** alla 51 utom *Cloud & Glow Face Serum* (EAN `1234567891023`) är **riktiga** C&G-produkter; vissa säljs inte längre. **50 verkliga, 1 fixtur.** Strategys *"5 verkliga, 46 fixturer"* var fel.

**EAN-kontrollsiffran är därmed inte diskriminanten** och lanens förslag i den riktningen faller. Fixturen är redan känd vid namn.

**Den nya frågan:** vilka fem SKU:er i arbetsytan motsvarar de fem raderna i **Lykoinlämningen av 2 okt**? **Matchas på EAN.** Kärnslingan körs på de fem.

**CC:s del — bara detta:** rapportera en tabell över **alla 51** SKU:er: `index · namn · EAN · productType`. Ingen bedömning, ingen sortering i verkliga och påhittade.

**Charlottes del:** matcha tabellen mot Lykofilen. **Filen ligger hos Charlotte, inte i repot — CC kan inte nå den och ska inte leta efter den.**

**Noterat för B1.1, inte CC:s uppgift här:** produkten får ett livscykeltillstånd `active · discontinued` med datum, satt av Charlotte, **aldrig härlett**. En `discontinued` produkt screenas inte och får inga positioner; posten står kvar. *Att vissa av de 50 inte längre säljs är skälet till att fältet finns.*

### M7 — K44: vad produktlistan härleder, element för element

*Rulat av Strategy 5 okt, klass 2. Mäts här eftersom det är samma fil och samma läsning — en egen rundtur för det vore en rundtur för intet.*

`renderSkus` renderar per produkt: **`✓ CPNP confirmed`**, ett **procenttal** (sett: 100 / 90 / 75 / 25), en **DPP-procent**, och **bockade eller kryssade återförsäljarbrickor** (`✓ Lyko`, `✗ Matas` …).

**Rapportera, ett element i taget:**

| element | vilken funktion producerar det | ur vilka fält | är det en RÄKNING ur posten eller en BEDÖMNING |

Den sista kolumnen är frågan. **Ett procenttal som räknar ifyllda fält är en räkning. Ett som väger dem är en bedömning.** `✓ CPNP confirmed` är det skarpaste fallet: **bekräftat av vem, och mot vad?** Om tecknet står för "ett nummer är inknappat" säger brickan något annat än vad posten bär — samma klass som de sex certifieringsbockarna, på en annan yta.

**Rapportera också vilka av dessa funktioner läsvyn skulle behöva undvika.** Strategys kontraktsrad för `verify.js` lyder *"läsvyn anropar ingen funktion som räknar status eller beredskap"* — **den raden är inte kontrollerbar förrän funktionerna har namn.** Den här mätningen ger dem.

---

### M8 — lagrar appen redan en källa för något fält?

*Strategys tillägg 5 okt. Förslaget är en sidotabell `product_field_source {product_id, field, source, recorded_at}`, **inte EAV för värdena**, och Strategy bad uttryckligen om invändning **med mätning**. Det här är den mätningen.*

> **SKÄRPNING, Strategy §8 — två axlar, inte en.**
> **KÄLLA** = varifrån värdet kom: *inmatat · importerat ur fil · läst ur Validoo*.
> **UNDERLAG** = vad som belägger påståendet: *CPSR · certifikat · intyg*.
> `product_field_source` bär **bara källa**. **Underlag hör till skiva 2.**
> **Rapportera de två var för sig.** Lanens första formulering slog ihop dem; `dossier.*.documentRef` är underlag, inte källa.

**Fråga inte blint — det finns redan en fångstmekanism i trädet, och den är halvbyggd.** `verify.sh` grindar på den under rubriken *"TIME AXIS — CONFIRMATION STAMPS ARE WRITE-ONLY (capture-only shipment)"*. Börja där:

**(a) Stämpelmekanismen.** `_appendStamp` (4 anropsställen, kontrakterat i `FIXED_CALLSITES`), `CHECKLIST_STAMP_KEY`, `CONFIRMATION_STAMP_KEY`.
- **Vilken form har en stämpel?** Rapportera nycklarna i objektet, ordagrant.
- **Är den per fält, per objekt eller per yta?** Det avgör om Strategys sidotabell är något nytt eller ett namnbyte på något som finns.
- **Bär den en källa, eller bara en tidpunkt?** En tidsstämpel utan källa svarar på *när*, aldrig på *varifrån*.
- **Bekräfta eller fäll att ingenting läser dem.** `verify.sh` påstår `0 direct getItem() by literal` för båda nycklarna. **Om det stämmer: mekanismen fångar och kastar.**

**(b) `confirmedAt`-mönstret.** Strategys `product_operators` bär `confirmedAt` och `source`. Finns något av de namnen redan i trädet? Var?

**(c) `certificationRecords`.** Den kanoniska läsaren är byte-identisk över tre ytor (2 269 B) och har 2 anropsställen. **Bär en certifieringspost något utöver namn och datum — en källa, en bekräftare, ett dokument?** Det är samma fråga som gav de sex bockarna.

**(d) `dossier.*.documentRef` — UNDERLAG, inte källa.** `safetyAssessment` och `pif` bär en `documentRef`: *"Where the signed CPSR is held — a reference, not the file"*. **Det belägger ett påstående; det säger inte varifrån värdet kom.** Mät det ändå, men **rapportera det under underlag** — det hör till skiva 2 och ska inte dras in i `product_field_source`.

**(e) Finns någon KÄLLA alls?** Letar efter spår av *hur ett värde kom in*: ett `source`-fält, en importmarkör från `confirmSkuImport` / `buildSkuPreview` / `renderSkuMapping` (massimporten skriver 51 rader — **noterar den var de kom ifrån?**), en Validoo-markering, eller en flagga som skiljer inmatat från importerat. **Om ingenting sådant finns är svaret på Strategys fråga nej, och `product_field_source` är en nykonstruktion.**

**Rapportformen — två tabeller, inte en:**

`KÄLLA (varifrån värdet kom)`

| mekanism | vad den lagrar | per fält / per objekt / per yta | läses den tillbaka |
|---|---|---|---|

`UNDERLAG (vad som belägger påståendet)`

| mekanism | vad den lagrar | vilka fält | läses den tillbaka |
|---|---|---|---|

**Slutsatsen är Strategys, inte CC:s.** CC rapporterar vad som finns. **Om något under KÄLLA redan bär `{fält, varifrån, när}` är sidotabellen en migrering, inte en nykonstruktion** — och det är en annan leverans. **Underlag avgör ingenting här**, hur fullständigt det än är.

---

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

En rubrik per mätning, i ordningen M2, M4, M5, M6, M7, M8. Varje påstående bär sitt `Belägg:` som ett namn. Allt som inte kunde mätas står som `OLÄST` med skälet. **Sedan STANNAR CC.**

Lanen verifierar mot källan och skickar vidare till Strategy. **B1.1 specas först när B1.0 är läst** — ett schema skrivet före mätningen är ett antagande med kolumner.
