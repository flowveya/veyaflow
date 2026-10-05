# VeyaFlow — B1.0b · DPP-tillåtlistan

**Till:** CC · **Från:** CODING · **Datum:** 5 okt 2026
**Leverans:** **en fil, tre ändringar.** Före `B1.1a`. **Ingen rök, ingen publicering, ingen databassats.**

---

## 0 · ANKARE OCH FÄRSKHETSKONTROLL

Färskhetskontrollen är lanens, gjord 5 okt före utskick. CC når inte loggrepot.

| Ruling | Sektion | Commit |
|---|---|---|
| `B1.0b` antagen, tre ändringar | `B1.0b RULAD` | `4c0bd07` |
| Grinden för live, nya fel lagas direkt | `GRINDEN FÖR LIVE — EN LISTA, INTE EN HÖG` | `05df878` |

**Rulingens operativa text, ordagrant:**

> **a)** `cpnpStatus` **TAS UR** tillåtlistan. **Grindas inte.** *En självdeklaration hör inte hemma på ett publikt pass under något villkor.*
> **b)** Grinden på numret: `cpnp` publiceras **när numret finns, `!!cpnp`, oberoende av status.** INTE ett test mot enumet. *Det som publiceras är att ett nummer är angivet; att knyta det till status återinför kopplingen till deklarationen.*
> **c)** Kommentaren om klientsidans tvilling rättas till det som är sant: **serverfiltret är det enda filtret.**

**Stänger rad 20, 21, 22.** Rad 19 (`A′.7`) och rad 23 står kvar. **`index.html` rörs inte** — brickan är rad 18, efter `B1.2b`.

---

## 1 · KÄLLAN

| Fil | Bytes | Spårad yta | Baslinje |
|---|---|---|---|
| `netlify/functions/share-dpp.js` | 7553 | ja | `500806f0` |

**Ingen annan fil rörs.** Inte `index.html`, inte `verify.js`, inte `verify.sh`, inte `share-brand-pack.js`.

**Belägg är namn:** `share-dpp.js:DPP_PUBLIC_FIELDS` · `share-dpp.js:DPP_CONDITIONAL_GATING` · `share-dpp.js:filterPayload`.

---

## 2 · VARFÖR DET HÄR ÄR ETT FYND OCH INTE EN FÖRBÄTTRING

**Mätt 5 okt.** `index.html:renderSkus` renderar `✓ CPNP confirmed` ur **enbart** `sku.cpnpStatus` — den läser aldrig `sku.cpnp`. `index.html:setCPNPStatus` skriver vad modalen skickar. **Brickan kan stå med numret tomt.**

`index.html:publishDPP` skickar `cpnpStatus` till servern. `share-dpp.js` tillåtlistar det **utan grind**. Filens egen rubrik: *"URL stays stable across re-publishes (critical for physical packaging QRs)."*

**Alltså: en självdeklaration som ingen kontrollerat kan bli ett regelefterlevnadspåstående på ett produktpass som nås från en QR-kod på en förpackning.**

**Levande i dag? Nej — latent.** Tre publicerade pass, lästa 5 okt: `{ "ceMarking": "Yes" }`, `NULL`, `{ "ceMarking": "Yes" }`. **Ingen bär `cpnpStatus` eller `cpnp`.** Skälet är tur, inte konstruktion: alla tre är enhetstyp, och CPNP-modalen renderas bara för Skincare & Beauty. **Ett kosmetiskt SKU med status `confirmed` publicerat som DPP är det enda som skiljer.**

---

## 3 · DE TRE ÄNDRINGARNA

### (a) `cpnpStatus` ur tillåtlistan

I `DPP_PUBLIC_FIELDS`, raden `regulatory`:

```js
  regulatory:     ['cpnp', 'cpnpStatus', 'ceMarking', 'novelFoodStatus'],
```

blir

```js
  // cpnpStatus BORTTAGET 5 okt 2026 (B1.0b, registret 4c0bd07). Det är en
  // SJÄLVDEKLARATION: index.html:setCPNPStatus skriver vad modalen skickar, och
  // index.html:renderSkus renderar '✓ CPNP confirmed' ur enbart det fältet — den läser
  // aldrig sku.cpnp. Brickan kan stå med numret tomt. En självdeklaration hör inte hemma
  // på ett publikt pass under något villkor, och den grindas därför inte: en grind är ett
  // villkor som kan bli fel, vilket cpnp-grinden nedan var.
  regulatory:     ['cpnp', 'ceMarking', 'novelFoodStatus'],
```

### (b) Grinden på numret

I `DPP_CONDITIONAL_GATING`:

```js
  cpnp:            (p) => !!p.cpnp && (p.cpnpStatus === 'active' || !p.cpnpStatus),
```

blir

```js
  // cpnp 5 okt 2026 (B1.0b): publiceras när numret finns, oberoende av status.
  // DEN GAMLA GRINDEN VAR DÖD: cpnpStatus antar aldrig 'active' — enumet är
  // not_started | ready | submitted | confirmed (index.html:STATUS_OPTS), noll förekomster
  // av 'active'. Villkoret föll därmed till (!!cpnp && !cpnpStatus): numret publicerades
  // BARA när ingen status var satt, och ströks när statusen sade 'confirmed'. Omvänt mot
  // varje läsbar avsikt. Att i stället testa mot de riktiga statusvärdena vore att återinföra
  // kopplingen till deklarationen som (a) just tog bort. Det som publiceras är att ett
  // nummer är angivet.
  cpnp:            (p) => !!p.cpnp,
```

### (c) Kommentaren om klientsidans tvilling

Två ställen påstår ett filter som inte finns. Filhuvudet:

```js
// Server-side guardrail: Payload is filtered through DPP_PUBLIC_FIELDS allowlist
// + conditional gating BEFORE write. Even if client sends commercial-sensitive
// data, only allowlisted fields land in Supabase. Belt-and-suspenders alongside
// client-side filtering in saveDPP().
```

och ovanför konstanten:

```js
// ─── Allowlist + gating (mirrors index.html DPP_PUBLIC_FIELDS) ──────────
// Server-side replica. If you update one, update both.
```

**Mätt:** `DPP_PUBLIC_FIELDS` förekommer i `index.html` **en gång — i en kommentar** (`index.html:35192`). **Det finns ingen klientlista.** Klienten skickar varje kandidatfält och servern är enda filtret.

Rätta båda till det sanna. Förslag, ordalydelsen är CC:s att justera så länge påståendet är sant:

```js
// Server-side guardrail: Payload is filtered through the DPP_PUBLIC_FIELDS allowlist
// + conditional gating BEFORE write. Even if the client sends commercial-sensitive
// data, only allowlisted fields land in Supabase.
// THIS IS THE ONLY FILTER. Corrected 5 Oct 2026 (B1.0b): the comment here claimed a
// client-side twin in saveDPP() and a replica to keep in sync. Neither exists —
// DPP_PUBLIC_FIELDS appears in index.html exactly once, in a comment. publishDPP sends
// every candidate-public field and this allowlist is what stops anything else.
```

```js
// ─── Allowlist + gating — the only filter, no client-side counterpart ───
```

---

## 4 · HUR ÄNDRINGEN BEVISAS UTAN ATT PUBLICERA

**Rulat: röken får inte mynta en ny DPP-URL.** Den får heller inte republicera ett befintligt pass — det muterar en levande rad och ökar `version` oåterkalleligt.

**Beviset är av konstruktion, samma form som `A′.4` skeppning 1.**

`filterPayload` bygger sitt utdata **enbart** ur `Object.entries(DPP_PUBLIC_FIELDS)`; ingenting passerar ofiltrerat, och `filteredPayload` är det enda som når `upsert`. **Ett fält som inte står i tillåtlistan kan inte emitteras.** Det är ingen bedömning — det är kontrollflödet.

**Golvet är dessutom mätt:** tre publicerade pass, inget bär `cpnpStatus`. **Ändringen kan därför inte göra något värre och tar bort vägen framåt.**

**`EJ FASTSTÄLLT`, utskrivet hellre än utelämnat:** att den ändrade funktionen är **utrullad** går inte att verifiera utifrån. `index.html` kunde hashas mot den distribuerade adressen; en Netlify-funktion serveras inte som en fil och har ingen digest utifrån. **Enda utifrånbeviset vore ett beteende, och beteendet kräver en publicering.** Leveransen bevisas alltså i repot, inte på plattformen. *Det är en plattformsbegränsning, inte ett val, och den gäller alla sju funktioner.*

---

## 5 · EXPECT — CC verifierar, rapporterar, STANNAR

- `Expect:` **ingen KOD refererar fältet** — kommentarer exkluderade:
  `grep -vE '^[[:space:]]*//' netlify/functions/share-dpp.js | grep -c "cpnpStatus"` → **0**
  *Begränsning, utskriven: formen exkluderar helradskommentarer, inte en efterhängd kommentar på en kodrad. I den här filen är de berörda kommentarerna helradiga.*

  > **RÄTTAD 5 okt efter CC:s rapport. Den ursprungliga raden löd `grep -c "cpnpStatus" … → 0` och **motsade §3(a)**, vars kommentar namnger fältet för att dokumentera varför det togs bort. Invarianten är *koden refererar inte fältet*, inte *strängen förekommer inte*. En kommentar som inte får nämna sitt eget ämne är en sämre kommentar, och att skriva om den för att passa kontrollen vore att anpassa artefakten efter en felskriven grind. Samma form som `#183`:s Smoke Step 3. **CC gjorde rätt som rapporterade i stället för att lösa den.** `verify.js` använder redan den här uteslutningen och skriver ut `[N comment mention(s) correctly excluded]`.**
- `Expect:` `DPP_PUBLIC_FIELDS.regulatory` har **tre** poster: `cpnp`, `ceMarking`, `novelFoodStatus`
- `Expect:` `DPP_CONDITIONAL_GATING.cpnp` är `(p) => !!p.cpnp` — inget `&&`, ingen referens till status
- `Expect:` de övriga grindarna (`ceMarking`, `novelFoodStatus`, `certifications`, `takeback`) är **ordagrant oförändrade**
- `Expect:` `filterPayload` är **ordagrant oförändrad** — ändringen ligger i data, inte i logiken
- `Expect:` ordet `saveDPP` förekommer inte längre i ett påstående om ett filter
- `Expect:` `git diff --stat` visar **exakt en fil**
- `Expect:` `git status --short` nämner ingen annan fil
- `Expect:` filen parsar (`node --check`)

**Avviker något: ändra inte specen, rapportera avvikelsen och stanna.** *Det inträffade i första passet och hanterades rätt.*

### Tillägg efter första passet — §3(b):s kommentar återställs

CC parafraserade statusfältets namn i §3(b):s kommentar för att undvika den felskrivna Expect-raden ovan. **Rimligt under den grinden; grinden är nu borta.** Skriv tillbaka §3(b):s kommentar **ordagrant som §3 anger den**, med fältet namngivet. *Precision i posten slår att undvika en sträng.* Övriga två ändringar rörs inte.

---

## 6 · DETTA GÖR CC INTE

- Rör ingen annan fil. **Inte `index.html`** — brickan är rad 18, efter `B1.2b`.
- Rör inte `verify.js` eller `verify.sh`. **En kontraktsrad som förbjuder `cpnpStatus` i tillåtlistan är önskad men hör till en EGEN leverans** (`B1.0c`): harnessen får inte ändras i samma leverans som det den kontrollerar.
- Publicerar ingen DPP. Republicerar ingen DPP. Kör ingen databassats.
- Lägger inte till en grind för `cpnpStatus`. **Borttagning, inte villkor.**
- Namnger ingen digest. Committar inte.

---

## 7 · CHARLOTTES STEG — namngivna

1. **`shasum -a 256 netlify/functions/share-dpp.js`** — andra oberoende beräkningen. Lanen namnger digesten först när den och CC:s stämmer.
2. **`./verify.sh`** efter att lanen skrivit baslinjen och narrativet i `verify.expected.txt`. **Förvänta GRÖNT, 57 grindar, `1 av 11`.**
3. **Commit-kedjan**, som lanen ger den.

**Ingen rök. Inget steg i webbläsaren. Ingen select.** Databasen rörs inte av den här leveransen, så det finns inget tillstånd att kontrollera efteråt.
