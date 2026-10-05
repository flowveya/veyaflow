# VeyaFlow — A′.4 · `share-brand-pack` vägrar

**Till:** CC · **Från:** CODING · **Datum:** 5 okt 2026
**Leverans:** två filer, en shipment. Ingen miljövariabel, ingen flagga.

---

## 0 · ANKARE OCH FÄRSKHETSKONTROLL

Färskhetskontrollen är lanens, gjord 5 okt innan denna spec skickades. CC bär
ingen kontroll CC saknar instrument för — CC når inte loggrepot.

| Ruling | Sektion i `open-items.md` | Commit |
|---|---|---|
| A′.4:s spec | `## 2 · A′.4 — villkoret var fel, vägran står` | `5ee1711` |
| Ordningen (A′.4 först) | `## 3 · ORDNINGEN — A′.4 FÖRST` | `e43c57b` |
| Modellprosa bär aldrig bock | `## 2 · REGELN — rulat` | `e43c57b` |

Kontrollerat: `e43c57b` ändrar **inte** spectexten i `5ee1711`. Den ändrar ordningen
och vidgar upplåsningsvillkor (2). Ingen annan ruling rör A′.4.

**Rulingens operativa text, ordagrant:**

> **`A′.4`, spec:** `share-brand-pack.js` vägrar överst i hanteraren, före varje
> skrivning, med ett namngivet skäl i svaret. **Ingen miljövariabel, ingen flagga**
> (ersätter 4 okt-rulingens "serverflagga, default av") — **upplåsning är en
> kodändring som bär en ruling.** Befintlig rad rörs inte.
> **Rök (Charlotte kör själv):** tryck på dela i generatorn → kortet visar skälet,
> ingen ny rad (`totalt` fortfarande 1).

**Förhandsgrind, körd 5 okt (Charlotte, SQL-editorn, läsning):**
`select count(*) as totalt, count(*) filter (where active) as aktiva from shared_brand_packs;`
→ **`totalt 1 · aktiva 0`.** Grinden passerad. A′.4 får gå.

---

## 1 · KÄLLAN — aldrig en kopia

| Fil | Bytes | Spårad yta | Baslinje |
|---|---|---|---|
| `netlify/functions/share-brand-pack.js` | 4242 | ja | `3791bbec` |
| `index.html` | 2783410 | ja | `752320fd` |

**`/share-brand-pack.js` i repo-roten rörs INTE.** Den är byte-identisk med
produktionskopian och ignorerad av `.gitignore` rad 45 — det inledande snedstrecket
är bärande (fynd `#176`, 11 sep). Den får inte redigeras, inte `git add`:as, och
`git add -A` / `git add .` är förbjudet i hela denna leverans.

**Belägg är namn, inte radnummer.** Alla namn nedan är mätta 5 okt ur ovanstående
baslinjer.

---

## 2 · VARFÖR TVÅ FILER — premissen som föll

Rulingen säger *"namngivet skäl i svaret"* och röken säger *"kortet visar skälet"*.
Mätt i `index.html`, funktionen `shareBrandPack`:

```js
if(!res.ok){
  throw new Error('Function not deployed');   // kroppen läses aldrig
}
```

och i dess `catch(err)`:

```js
var errMsg = 'Could not generate Brand Pack link. Check your connection and try again. ' +
             '(If this persists, the share-brand-pack Netlify function may need redeployment.)';
alert(errMsg);
```

**En vägran från servern ensam når aldrig kortet.** Den ger i stället en `alert()`
som anger ett falskt skäl — nätverket eller en utebliven deploy — för en vägran som
är avsiktlig. Det vore en ny osanning på en yta, vilket är det A′.4 finns för att
stoppa. Därför två filer.

**Mätt i hanteraren:** det finns **två** skrivningar, inte en.
`PATCH`-anropet vars JSON-kropp sätter `active: true`, och `POST`-anropet mot
`${SUPABASE_URL}/rest/v1/shared_brand_packs`. Existenskontrollen filtrerar
`active=eq.true`, så med 2 okt-raden på `active=false` **återupplivas inget vid ett
tryck — i stället tas insert-vägen och en andra levande rad skapas med nytt id.**
Nedtagningen skyddar alltså inte mot ett tryck. En vägran överst täcker båda.

---

## 3 · ÄNDRING 1 — hanteraren

`netlify/functions/share-brand-pack.js`. Infoga **omedelbart efter** `OPTIONS`-
grenens `return` inuti `exports.handler`, före metodkontrollen och före all parsning:

```js
  // A′.4 — VÄGRAN. Rulat 5 okt 2026 (registret 5ee1711, §"A′.4 — villkoret var fel,
  // vägran står"). Ingen miljövariabel, ingen flagga: att låsa upp detta är en
  // kodändring som bär en ruling. Villkoren står i §9 i specen.
  //
  // Placerad EFTER OPTIONS-grenen, inte före den, så att CORS-preflighten fortfarande
  // lyckas och POST:en når hit. Annars ser webbläsaren ett CORS-fel i stället för
  // skälet, och kortet kan inte visa något.
  //
  // Den ligger före BÅDA skrivningarna — PATCH:en och INSERT:en nedan. Ingen av dem
  // tas bort; att de blir onåbara är hela poängen.
  return {
    statusCode: 403,
    headers,
    body: JSON.stringify({
      refused: true,
      reason: 'Brand Pack sharing is turned off in the code. The published pack renders model-generated prose, and the pack taken down on 2 October asserted six certifications that are not on record. Sharing stays off until the pack states which parts are model-generated and every compliance statement comes from the record with its state and date. Turning it back on is a code change.',
    }),
  };
```

`headers` är redan i scope vid den punkten. **Inget nedanför tas bort.**

---

## 4 · ÄNDRING 2 — klienten

`index.html`. Mätt: `renderMagicLinkCard()` har **exakt två** tillstånd —
*"Not set up"* när `brand.magicLinkUrl` saknas, och *"Live"* när den finns. Den
anropas från två ställen, generatorsidan och pitchsidan.

**(a)** Lägg en modulnivåvariabel bredvid de övriga tillståndsvariablerna:

```js
// A′.4 — sätts ENBART av ett 403-svar från share-brand-pack. Den låser inte upp
// något och konfigureras inte: den registrerar vad servern svarade. Skälet har en
// enda källa, hanteraren.
var shareRefusal = null;
```

**(b)** I `shareBrandPack`, ersätt `!res.ok`-grenen:

```js
    if(!res.ok){
      var refusal = null;
      try { refusal = await res.json(); } catch(e) { refusal = null; }
      if(res.status === 403 && refusal && refusal.refused && refusal.reason){
        // A′.4 — en vägran är inte ett fel. Visa det namngivna skälet i kortet.
        // Ingen alert, inget påstående om nätverk eller deploy, och magicLinkUrl
        // skrivs inte (γ-arkitekturen, Bug B).
        shareRefusal = refusal.reason;
        if(btn){ btn.disabled = false; btn.textContent = 'Generate Brand Pack link →'; }
        if(currentPage === 'brandpack'){
          renderBrandPack(document.getElementById('page-brandpack'));
        } else if(currentPage === 'pitch'){
          renderPitch(document.getElementById('page-pitch'));
        }
        return;
      }
      throw new Error('Function not deployed');
    }
```

`catch(err)`-grenen rörs inte. Ett verkligt fel beter sig precis som i dag.

**(c)** I `renderMagicLinkCard`, överst, efter `if(!brand) return '';` — ett tredje
block som ligger **före** de två befintliga tillstånden:

```js
  if(shareRefusal){
    return `
      <div style="background:#F7F5F0;border:1px solid var(--border);padding:.95rem 1.1rem;margin-bottom:1rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.55rem;flex-wrap:wrap;gap:.5rem">
          <div style="font-family:var(--mono);font-size:.62rem;color:var(--navy);letter-spacing:.08em;text-transform:uppercase;font-weight:700">Brand Pack link</div>
          <span style="display:inline-block;padding:.15rem .55rem;border:1px solid #D1D5DB;background:#F3F4F6;color:#6B7280;font-family:var(--mono);font-size:.55rem;letter-spacing:.04em;text-transform:uppercase">Sharing off</span>
        </div>
        <div style="font-family:var(--sans);font-size:.78rem;color:var(--muted);line-height:1.5;margin-bottom:.75rem">${shareRefusal}</div>
        <button class="btn-primary" onclick="shareBrandPack(false)" id="share-pack-btn"
                style="font-family:var(--mono);font-size:.65rem;padding:.55rem 1.1rem;letter-spacing:.06em">
          Generate Brand Pack link →
        </button>
      </div>
    `;
  }
```

Geometrin är State 1:s, oförändrad. Brickan är **samma dämpade grå som "Not set up"**
— inte grön, inte röd. Knappen lämnas aktiv: ett nytt tryck vägras likadant, och
ingenting på ytan påstår något om vad som kommer att hända.

**Copy:** skälsträngen ovan är lanens utkast. Den innehåller bara mätta påståenden.
Design och Strategy får rätta ordalydelsen; mekaniken ändras inte av det.

---

## 5 · EXPECT — CC verifierar, rapporterar, STANNAR

- `Expect:` `grep -c "refused: true" netlify/functions/share-brand-pack.js` → `1`
- `Expect:` `PATCH`-anropet och `POST`-anropet mot `shared_brand_packs` finns **kvar**
  i filen, oförändrade. Inget borttaget.
- `Expect:` inga `process.env`-rader tillagda eller borttagna.
- `Expect:` `git status --short` nämner **inte** `share-brand-pack.js` i roten.
- `Expect:` `git diff --stat` visar **exakt två** filer.
- `Expect:` `renderMagicLinkCard` har efter ändringen tre `return`-grenar, och de två
  befintliga är ordagrant oförändrade.
- `Expect:` ordet `alert(` förekommer lika många gånger som före ändringen.

**Avviker något av detta: ändra inte specen, rapportera avvikelsen och stanna.**
En avvikelse har två gånger den här veckan visat sig vara specens fel, inte kodens.

---

## 6 · DETTA GÖR CC INTE

- Rör inte `/share-brand-pack.js` i roten.
- `git add -A` och `git add .` är förbjudna. Namnge varje sökväg.
- Kör ingen databassats. A′.4 rör ingen rad.
- Lägg inte till en miljövariabel, en konfigurationsrad eller en konstant som kan
  slås av. Vägran är ovillkorlig i koden.
- Ta inte bort `alert()`-grenen. Den hör till verkliga fel.
- Namnge ingen digest. Charlotte kör `shasum`; lanen namnger efter två oberoende
  beräkningar.

---

## 7 · RÖK — Charlotte kör själv, efter att CC är klar

**Hårdladda först** (`localhost:8000`).

1. Brand Pack-generatorn → tryck **Generate Brand Pack link →**.
   **Förvänta:** kortet visar skälet, brickan läser **Sharing off** i dämpad grå.
   **Ingen popup.** Knappen står kvar och går att trycka igen.
2. `select count(*) as totalt, count(*) filter (where active) as aktiva from shared_brand_packs;`
   **Förvänta:** `totalt 1 · aktiva 0` — oförändrat. **Ändras talet är leveransen underkänd.**
3. Pitchsidan → samma kort, samma skäl.

**Att vänta sig och inte bli förvirrad av:** om `brand.magicLinkUrl` ligger kvar i
webbläsarens sparade tillstånd visar kortet i stället State 2 med den gröna
**Live**-brickan och en Preview-länk till en död URL. Det är inte A′.4:s fel och
A′.4 lagar det inte — det är `A′.5` (länktillståndet mätt). Tryck då **↻ Refresh
data**: även den vägen går genom hanteraren och ska visa skälet.

---

## 8 · NYA KÖPOSTER SOM MÄTNINGEN GAV — rörs inte här

- **K34a:** State 1:s brödtext säger *"your **verified** profile"*. Ordet är förbjudet
  i samma klass som upplåsningsvillkor (3). Operatörsyta, klass 2.
- **K34b:** samma brödtext säger *"updated **live** as you change data"*. Paketet är en
  ögonblicksbild skriven vid delningstillfället; PATCH:en körs bara vid *Refresh data*.
  Påståendet är falskt som mätt. Operatörsyta, klass 2.
- **K35:** `netlify.toml`-kommentaren vid `/supabase-proxy.js` säger *"tracked, unlike
  the other five"*. Rotkopian finns inte längre och är inte spårad; regeln är kvarleva
  och kommentaren falsk. Rättas framåt.

---

## 9 · UPPLÅSNING — för C, alla tre, ordagrant ur registret

1. den publicerade sidan säger själv vilka delar som är modellgenererade och vilka
   som kommer ur posten;
2. varje påstående om regelefterlevnad **och certifiering** i sidan kommer ur posten
   med tillstånd + datum — modellprosan får inte bära sådana;
3. ordet *verification* ur `Full brand verification pack: <url>` tills något är verifierat.

Upplåsning sker genom att ta bort `return`-blocket i §3 — en kodändring som bär en
ruling, inget annat.
