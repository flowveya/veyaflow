// ════════════════════════════════════════════════════════════════════════════
//  VeyaFlow — BIL Use Case A — B5: extraction prompt + JSON schema + validator
//
//  Trigger 8 Sequence B, sub-edit B5.
//  Date: 1 June 2026.
//
//  Purpose:
//    Standalone reviewable artifact for the BIL extraction pipeline. This file
//    is NOT integrated into index.html yet — integration happens at Sequence B
//    execution proper. Authoring now during the Netlify ticket wait is
//    no-regret prework: the schema, prompt and validator are identical whether
//    final response-handling is F2a (sync) or F2b (async/polling).
//
//  Locks honoured (from BIL v1.1 supplement):
//    • F7.1 — productPortfolio per-SKU 8-field shape;
//              commercialIntelligence brand-level 7-field shape;
//              all free-text strings V1.0 (no normalization).
//    • F7.2 — founderName distinct from userName; positioning alias usp;
//              geographicOrigin alias currentMarket; primaryMarkets alias
//              targetMarkets.
//    • F7.3 — values[] distinct from sustainabilityGoals.
//    • V4   — foundingYear is STRING (preserves "circa 2018" fidelity);
//              draftStatus is enum.
//    • F3.1 — 15-page soft cap (handled upstream in B1; B5 receives ≤15 pages).
//    • F1.1 — bil_extractions log row consumes `fields_extracted_count` from
//              the validator output for low-quality detection.
//
//  Existing-codebase reference patterns honoured:
//    • Existing autofill extractor (L1617-1655 of index.html) uses the same
//      JSON-only system-prompt convention. BIL follows that convention but
//      with vision content blocks instead of text content.
//    • `safeJsonParse(text)` and `.replace(/```json|```/g,'').trim()` are the
//      existing SPA fence-strip + parse pattern; this file uses the same.
//    • Model is claude-sonnet-4-6 (locked by F2 harness — Haiku/Sonnet
//      vision-quality differential not measured but Sonnet is the v1.1
//      supplement lock for BIL).
//
//  Components in this file:
//    1. BIL_EXTRACTION_SCHEMA   — the canonical JSON output shape Vision must
//                                  produce. Reference for documentation,
//                                  validation, and (future) editor UX.
//    2. BIL_EXTRACTION_PROMPT   — the system prompt that instructs Vision.
//    3. buildBilExtractionCall  — constructs the messages array (text +
//                                  image blocks) for the Anthropic API call.
//    4. validateBilExtraction   — parses Vision's raw response, validates
//                                  shape, counts populated fields, surfaces
//                                  which fields are missing, classifies
//                                  low-quality cases.
//
//  Used by (future, Sequence B):
//    • B4 (Vision call construction) calls buildBilExtractionCall
//    • B6 (retry+fallback) consumes validateBilExtraction.outcome to drive
//      retry vs fallback CTA decisions.
//    • Sequence C (draft review UX) consumes validateBilExtraction.populated
//      and .missingFields to render the editable form with pre-filled fields
//      and clear gap indicators.
//
//  Not used by:
//    • Sequence A (already shipped) — that's schema + plumbing only.
//
//  Integration plan (deferred to Sequence B execution):
//    The three exports (SCHEMA, PROMPT, build/validate fns) will be inlined
//    into index.html as a `// ── BIL extraction pipeline (B5) ──` block,
//    positioned near the existing autofill code at L1617. JSON.stringify
//    of the schema is embedded directly in the prompt at integration time
//    (no fetch — schema travels with the SPA bundle).
// ════════════════════════════════════════════════════════════════════════════


// ────────────────────────────────────────────────────────────────────────────
// 1. BIL_EXTRACTION_SCHEMA — canonical output shape
//
// Three top-level objects + a _meta block. All string fields are V1.0
// free-text per F7.1 lock (no normalization). Arrays may be empty when the
// deck doesn't surface that information; never null. Missing/absent
// information should result in empty string ("") for string fields and
// empty array ([]) for array fields, NEVER null and NEVER "N/A"/"unknown"/
// hallucinated stand-ins.
//
// This object is exported for documentation and (future) editor-side schema-
// driven UI. It is NOT directly fed to Vision; the PROMPT below contains an
// inlined version Vision actually sees.
// ────────────────────────────────────────────────────────────────────────────

const BIL_EXTRACTION_SCHEMA = {
  // Brand-level identity, founder, positioning, audience (F7.2 + F7.3 locks).
  brandProfile: {
    name:             { type: "string",   required: true,  notes: "Brand display name as it appears on the deck cover or hero page." },
    founderName:      { type: "string",   required: false, notes: "Named founder if disclosed. DISTINCT from the VeyaFlow user. Leave empty if the deck doesn't name a founder." },
    foundingYear:     { type: "string",   required: false, notes: "STRING not number — preserves 'circa 2018', '2018-2019', 'Founded in 2015' fidelity. Extract verbatim from deck." },
    originStory:      { type: "string",   required: false, notes: "Origin / founding context narrative. 1-3 sentences max. Verbatim quotes from deck preferred over paraphrase." },
    positioning:      { type: "string",   required: false, notes: "Brand's positioning statement (alias maps to brand.usp on integration). Often labelled 'positioning', 'mission', 'we are', 'we believe'." },
    values:           { type: "string[]", required: false, notes: "Brand values as an array of short phrases. DISTINCT from sustainability goals — values may include heritage, craftsmanship, transparency, science-led, etc." },
    targetCustomer:   { type: "string",   required: false, notes: "Description of the brand's target customer. Often a persona, age range, lifestyle, or segment description." },
    geographicOrigin: { type: "string",   required: false, notes: "Country or region where brand is based / manufactured. Alias maps to brand.currentMarket. Examples: 'Sweden', 'Lund, Sweden', 'Nordic'." },
    primaryMarkets:   { type: "string[]", required: false, notes: "Markets currently sold into. Array of country names. Alias maps to brand.targetMarkets." },
  },

  // Per-SKU product portfolio (F7.1 lock — 8-field array of per-SKU objects).
  productPortfolio: {
    type:    "object[]",
    notes:   "One entry per distinct product. Order in array matches order in deck where determinable; otherwise order by hero-product-first heuristic.",
    itemSchema: {
      name:                { type: "string",   required: true,  notes: "Product display name." },
      category:            { type: "string",   required: false, notes: "Product category as the deck describes it (e.g. 'serum', 'face cream', 'LED device'). FREE TEXT V1.0 — no enum constraint. Category-enum mapping happens downstream at activation time." },
      productDescription:  { type: "string",   required: false, notes: "1-2 sentence description of what the product does and how it's positioned." },
      keyIngredients:      { type: "string[]", required: false, notes: "Hero ingredients mentioned for this SKU. Don't include filler/excipient ingredients unless the deck explicitly markets them. Verbatim names from deck." },
      heroBenefit:         { type: "string",   required: false, notes: "Single most-prominent benefit claim for this SKU. E.g. '24h hydration', 'restores barrier in 14 days'." },
      claims:              { type: "string[]", required: false, notes: "Other claims associated with this SKU — array of short phrases. Includes regulatory-relevant claims AND marketing claims; do not filter." },
      pricePoint:          { type: "string",   required: false, notes: "Price as written in the deck. FREE TEXT V1.0 — keep currency and any range. Examples: '€65', '€45-€85', 'SEK 590', '$48 RSP'." },
      sizes:               { type: "string[]", required: false, notes: "Size variants available. Examples: ['30ml', '50ml'], ['Standard', 'Travel']." },
    },
  },

  // Brand-level commercial intelligence (F7.1 lock — 7-field brand-level object).
  commercialIntelligence: {
    marginStructure:      { type: "string", required: false, notes: "Margin information as written in deck. FREE TEXT V1.0. Examples: '48-55%', '52% on hero SKU', 'standard 50% sliding by volume'." },
    moq:                  { type: "string", required: false, notes: "Minimum order quantity. FREE TEXT V1.0. Examples: '200 units mixed SKU', '50 units per SKU, MOQ 200 total', 'No MOQ for first order'." },
    leadTimes:            { type: "string", required: false, notes: "Lead time from order to delivery. FREE TEXT V1.0. Examples: '21 days ex-factory', '4-6 weeks', 'next-day for stock SKUs'." },
    existingRetailers:    { type: "string[]", required: false, notes: "Named retailers brand is currently in. Array of retailer names. Country annotations welcome inline (e.g. 'Kicks SE', 'Matas DK')." },
    salesChannels:        { type: "string[]", required: false, notes: "Channel mix descriptors. Examples: ['DTC website', 'Specialty beauty', 'Pharmacy chain', 'Trade shows']." },
    revenueStageSignal:   { type: "string", required: false, notes: "Stage/scale indicator: revenue figures, growth phase, funding status. FREE TEXT V1.0. Examples: 'SEK 31M FY2025', 'Bootstrapped, profitable since Q2 2024', 'Series A target Q4 2026'." },
    yearOverYearGrowth:   { type: "string", required: false, notes: "Growth rate as written. FREE TEXT V1.0. Examples: '+70% YoY', 'Doubled in 2024', 'Flat 2024, +30% YTD 2025'." },
  },

  // Vision-self-reported metadata about the extraction quality.
  _meta: {
    confidence: { type: "string", enum: ["high", "medium", "low"], required: true, notes: "Vision's self-reported confidence. HIGH: most fields populated, deck was a real brand pitch with structured info. MEDIUM: partial extraction, some sections unclear. LOW: deck wasn't actually a brand pitch (wrong document type), OR text was unreadable, OR fewer than ~5 fields could be populated." },
    notes:      { type: "string", required: false, notes: "Free-text observations from Vision about extraction quality, e.g. 'last 3 pages were appendix with no relevant info', 'deck appears to be product catalog not a brand pitch'." },
  },
};


// ────────────────────────────────────────────────────────────────────────────
// 2. BIL_EXTRACTION_PROMPT — the system prompt Vision sees
//
// Design principles:
//   • SCHEMA-FIRST: Vision sees the exact JSON shape it must produce, inline.
//   • LOSSY-RESILIENT: explicit instructions to leave fields empty rather
//     than invent. The most common Vision failure mode on brand decks is
//     plausible-sounding hallucination of fields the deck doesn't contain.
//   • CURRENCY-AWARE (Nordic-bloc): preserve currency markers verbatim,
//     don't auto-convert.
//   • DIGIT-PRESERVING: EAN-13 codes, SKU IDs, year figures — all kept as
//     literal strings, never paraphrased.
//   • CONFIDENCE-FORCING: Vision self-reports a confidence band; BIL.6 retry
//     logic uses this + the validator's populated-count to decide retry.
//
// The prompt is intentionally directive and structured. Anthropic Vision
// performs significantly better with explicit JSON schemas + per-field
// constraints than with general "extract brand info" prompts.
// ────────────────────────────────────────────────────────────────────────────

const BIL_EXTRACTION_PROMPT = `You are extracting brand intake data from a brand pitch deck for a European retail-buyer-facing platform. The deck has been split into one image per page; you will see up to 15 page images.

Your job: extract structured brand data into the JSON schema below. Return JSON only, no commentary, no markdown fences, no preamble.

═══ JSON SCHEMA ═══

{
  "brandProfile": {
    "name":             string,         // brand display name
    "founderName":      string,         // named founder if disclosed, else ""
    "foundingYear":     string,         // STRING not number — preserve "circa 2018", "2018-2019", "Founded in 2015" verbatim
    "originStory":      string,         // 1-3 sentences max, verbatim quotes preferred
    "positioning":      string,         // brand positioning / mission / "we are" statement
    "values":           string[],       // brand values — heritage, craftsmanship, transparency, science-led, etc. NOT sustainability goals only
    "targetCustomer":   string,         // target customer description / persona / segment
    "geographicOrigin": string,         // country or region brand is based/manufactured in
    "primaryMarkets":   string[]        // current markets sold into, as country names
  },
  "productPortfolio": [                 // one entry per distinct product
    {
      "name":               string,
      "category":           string,     // free-text — "serum", "face cream", "LED device", etc.
      "productDescription": string,     // 1-2 sentences
      "keyIngredients":     string[],   // hero ingredients only, verbatim names
      "heroBenefit":        string,     // single most-prominent claim
      "claims":             string[],   // other associated claims
      "pricePoint":         string,     // free-text including currency: "€65", "€45-€85", "SEK 590"
      "sizes":              string[]    // size variants: ["30ml", "50ml"], ["Standard", "Travel"]
    }
  ],
  "commercialIntelligence": {
    "marginStructure":    string,       // free-text — "48-55%", "52% on hero SKU", etc.
    "moq":                string,       // free-text — "200 units mixed SKU", etc.
    "leadTimes":          string,       // free-text — "21 days ex-factory", etc.
    "existingRetailers":  string[],     // named retailers brand is currently in
    "salesChannels":      string[],     // ["DTC website", "Specialty beauty", etc.]
    "revenueStageSignal": string,       // revenue + stage signals: "SEK 31M FY2025", "Bootstrapped, profitable since Q2 2024"
    "yearOverYearGrowth": string        // "+70% YoY", "Doubled in 2024", etc.
  },
  "_meta": {
    "confidence": "high" | "medium" | "low",
    "notes":      string                // your observations on extraction quality
  }
}

═══ CRITICAL EXTRACTION RULES ═══

1. EMPTY OVER INVENTED. If a field's information is NOT present in the deck, leave it as empty string "" or empty array []. NEVER invent plausible-sounding values. NEVER fill with "N/A", "unknown", "not specified" — use "" / [].

2. VERBATIM WHEN POSSIBLE. For phrases the deck states literally (founder name, brand values, claims, prices, dates), copy the deck's wording. Don't paraphrase brand-defining language.

3. PRESERVE DIGITS LITERALLY. EAN-13 codes ("5012345678901"), SKU IDs ("4521-AUR"), year figures ("2019"), revenue numbers ("SEK 31.2 M"), percentages ("+70% YoY") — extract as written, do not reformat. Currency markers stay attached to numbers.

4. CURRENCY: NORDIC-BLOC NORMAL. Common currencies are SEK, NOK, DKK, EUR, GBP, ISK. Preserve whatever the deck uses. Don't convert. If a price has no explicit currency, leave it as written ("€65" not "65 EUR", "190 SEK" not "190 kr").

5. PRODUCT SCOPE. productPortfolio is per-SKU. If the deck shows 4 distinct products, return 4 entries. If the deck only mentions products generically without naming SKUs, return [] for productPortfolio — do NOT invent SKU names.

6. RETAILER NAMES. Common Nordic beauty retailers include: Kicks, Lyko, Matas, Sephora, Apotek Hjärtat, Vita, Boots, Douglas. If retailers are mentioned in passing (e.g. "sold in Lyko"), include them in existingRetailers. If only aspirational ("we want to be in Sephora"), DO NOT include — that's not existing distribution.

7. VALUES vs SUSTAINABILITY. The "values" field is broader than sustainability. If the deck lists "Nordic provenance", "barrier respect", "clinical transparency" — those are values. If the deck lists "carbon-neutral by 2030" — that's a sustainability goal, NOT a value. Only include things the deck frames as values, mission, or principles.

8. CONFIDENCE SELF-REPORT.
   • "high"   — deck was clearly a brand pitch deck, most schema fields could be populated from clearly-presented information.
   • "medium" — deck was a brand pitch but some sections were sparse or unclear, only partial extraction possible.
   • "low"    — deck was NOT a brand pitch (e.g. it was a product catalog, a financial report, a wrong document type), OR text was largely unreadable, OR fewer than ~5 fields across the entire schema could be populated.

9. RETURN JSON ONLY. No markdown fences. No commentary before or after the JSON. No "Here is the extraction:" preamble. The first character of your response must be { and the last must be }.`;


// ────────────────────────────────────────────────────────────────────────────
// 3. buildBilExtractionCall(pdfPageImages, fileMetadata)
//
//   Constructs the messages array for the Anthropic API request.
//
//   pdfPageImages: Array<{ media_type: "image/jpeg" | "image/png", data: string (base64) }>
//                  One entry per PDF page after pdf.js render. F3.1 lock: max 15 entries.
//   fileMetadata:  { pdfFilename: string, pageCount: number, originalPageCount: number }
//                  Passed for logging only — not consumed by the call itself.
//
//   Returns: { model, max_tokens, system, messages } — ready to JSON.stringify
//             and POST to /.netlify/functions/anthropic-proxy.
//
//   Notes:
//     • Model is claude-sonnet-4-6 per F2 lock (vision quality > Haiku).
//     • max_tokens 4000 — accommodates 4 products × ~700-tok JSON each.
//     • System prompt is the BIL_EXTRACTION_PROMPT above.
//     • User message is a single content array: one text block (orientation
//       cue with the deck's filename + page count) followed by N image blocks.
// ────────────────────────────────────────────────────────────────────────────

function buildBilExtractionCall(pdfPageImages, fileMetadata) {
  if (!Array.isArray(pdfPageImages) || pdfPageImages.length === 0) {
    throw new Error("buildBilExtractionCall: pdfPageImages must be a non-empty array");
  }
  if (pdfPageImages.length > 15) {
    throw new Error("buildBilExtractionCall: max 15 pages per F3.1 lock — caller must truncate upstream");
  }

  const meta = fileMetadata || {};
  const filename = meta.pdfFilename || "(uploaded deck)";
  const pageCount = meta.pageCount || pdfPageImages.length;
  const originalPageCount = meta.originalPageCount || pageCount;

  // Page-count framing helps Vision orient (knows when it's seeing 1 vs 15 pages)
  // and surfaces F3.1 truncation honestly when originalPageCount > pageCount.
  const orientText = (originalPageCount > pageCount)
    ? `Brand pitch deck: ${filename}. Showing first ${pageCount} of ${originalPageCount} pages (truncated per platform policy; extract from what is visible).`
    : `Brand pitch deck: ${filename}. ${pageCount} page${pageCount === 1 ? "" : "s"} total.`;

  // Build content array: text first, then image blocks in page order.
  const contentBlocks = [
    { type: "text", text: orientText },
  ];

  for (const img of pdfPageImages) {
    contentBlocks.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.media_type,
        data: img.data,
      },
    });
  }

  return {
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: BIL_EXTRACTION_PROMPT,
    messages: [
      { role: "user", content: contentBlocks },
    ],
  };
}


// ────────────────────────────────────────────────────────────────────────────
// 4. validateBilExtraction(rawApiResponse)
//
//   Parses Vision's raw response, validates shape, computes the BIL.6 inputs.
//
//   rawApiResponse: the JSON object returned from the Anthropic API (already
//                   parsed by the caller). Expected shape:
//                   { content: [{ type: "text", text: "..." }], ... }
//
//   Returns:
//     {
//       outcome:                "success" | "partial" | "low_quality" | "parse_error" | "empty",
//       extracted:              <schema-shaped object>  OR null if parse failed,
//       populated:              <subset of schema with non-empty fields>,
//       missingFields:          string[]  (dot-paths of fields that came back empty),
//       fieldsExtractedCount:   number,
//       visionConfidence:       "high" | "medium" | "low" | null,
//       visionNotes:            string  (Vision's _meta.notes if present),
//       parseError:             string | null,
//     }
//
//   Outcome rules:
//     • "parse_error"  — could not parse JSON at all. Triggers BIL.6 mode 4
//                        (network/format failure → retry once, then fallback CTA).
//     • "empty"        — parsed cleanly but every schema field is empty.
//                        Almost certainly a wrong document type was uploaded.
//                        Triggers BIL.6 mode 2 (low quality → confirm + fallback).
//     • "low_quality"  — visionConfidence==="low" OR fieldsExtractedCount < 5.
//                        Triggers BIL.6 mode 2.
//     • "partial"      — between 5 and ~70% of schema fields populated.
//                        Proceeds to draft review (Sequence C) with clear gaps.
//     • "success"      — most fields populated, confidence high.
// ────────────────────────────────────────────────────────────────────────────

function validateBilExtraction(rawApiResponse) {
  const result = {
    outcome: null,
    extracted: null,
    populated: null,
    missingFields: [],
    fieldsExtractedCount: 0,
    visionConfidence: null,
    visionNotes: "",
    parseError: null,
  };

  // ── Step 1: extract the text block from Anthropic's response envelope ──
  let rawText = "";
  try {
    rawText = (rawApiResponse?.content || [])
      .find((b) => b.type === "text")?.text || "";
  } catch (e) {
    result.outcome = "parse_error";
    result.parseError = "Anthropic response envelope malformed: " + e.message;
    return result;
  }
  if (!rawText) {
    result.outcome = "parse_error";
    result.parseError = "No text block in Anthropic response.";
    return result;
  }

  // ── Step 2: strip markdown fences (existing SPA convention) ──
  const clean = rawText.replace(/```json|```/g, "").trim();

  // ── Step 3: parse JSON ──
  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    result.outcome = "parse_error";
    result.parseError = "Vision returned non-JSON: " + e.message + ". First 200 chars: " + clean.slice(0, 200);
    return result;
  }
  if (!parsed || typeof parsed !== "object") {
    result.outcome = "parse_error";
    result.parseError = "Vision returned non-object JSON.";
    return result;
  }

  // ── Step 4: shape-fill missing top-level keys (defensive) ──
  // Vision may omit entire top-level sections if the deck had nothing for
  // them. Don't treat as parse_error — treat as fully-empty section.
  if (!parsed.brandProfile || typeof parsed.brandProfile !== "object") parsed.brandProfile = {};
  if (!Array.isArray(parsed.productPortfolio))                          parsed.productPortfolio = [];
  if (!parsed.commercialIntelligence || typeof parsed.commercialIntelligence !== "object") parsed.commercialIntelligence = {};
  if (!parsed._meta || typeof parsed._meta !== "object")                 parsed._meta = {};

  // ── Step 5: count populated fields + collect missing paths ──
  // brandProfile fields (9)
  const bpFields = ["name", "founderName", "foundingYear", "originStory", "positioning", "values", "targetCustomer", "geographicOrigin", "primaryMarkets"];
  let populatedCount = 0;
  const populated = { brandProfile: {}, productPortfolio: [], commercialIntelligence: {} };
  const missing = [];

  for (const f of bpFields) {
    const v = parsed.brandProfile[f];
    if (isPopulated(v)) {
      populated.brandProfile[f] = v;
      populatedCount++;
    } else {
      missing.push("brandProfile." + f);
    }
  }

  // productPortfolio: each populated SKU adds to count, but per-product gaps
  // surface as missingFields scoped to that product index.
  parsed.productPortfolio.forEach((sku, idx) => {
    if (!sku || typeof sku !== "object") return;
    const popSku = {};
    let skuPopulated = false;
    const skuFields = ["name", "category", "productDescription", "keyIngredients", "heroBenefit", "claims", "pricePoint", "sizes"];
    for (const f of skuFields) {
      const v = sku[f];
      if (isPopulated(v)) {
        popSku[f] = v;
        skuPopulated = true;
      } else {
        missing.push("productPortfolio[" + idx + "]." + f);
      }
    }
    if (skuPopulated) {
      populated.productPortfolio.push(popSku);
      populatedCount++;   // count each non-empty SKU as one populated unit
    }
  });
  if (parsed.productPortfolio.length === 0) {
    missing.push("productPortfolio (no products extracted)");
  }

  // commercialIntelligence fields (7)
  const ciFields = ["marginStructure", "moq", "leadTimes", "existingRetailers", "salesChannels", "revenueStageSignal", "yearOverYearGrowth"];
  for (const f of ciFields) {
    const v = parsed.commercialIntelligence[f];
    if (isPopulated(v)) {
      populated.commercialIntelligence[f] = v;
      populatedCount++;
    } else {
      missing.push("commercialIntelligence." + f);
    }
  }

  // ── Step 6: read Vision's self-reported confidence ──
  const conf = parsed._meta.confidence;
  const validConf = (conf === "high" || conf === "medium" || conf === "low") ? conf : null;
  const notes = typeof parsed._meta.notes === "string" ? parsed._meta.notes : "";

  // ── Step 7: classify the outcome ──
  // Total possible "populated units" = 9 (brandProfile) + N (products, variable)
  // + 7 (commercialIntelligence). Use thresholds vs. a 16-unit reference baseline
  // (9 + 7 + ~assume 1 product min for "useful"), not strict %.
  let outcome;
  if (populatedCount === 0) {
    outcome = "empty";
  } else if (validConf === "low" || populatedCount < 5) {
    outcome = "low_quality";
  } else if (populatedCount >= 12) {
    outcome = "success";
  } else {
    outcome = "partial";
  }

  result.outcome = outcome;
  result.extracted = parsed;
  result.populated = populated;
  result.missingFields = missing;
  result.fieldsExtractedCount = populatedCount;
  result.visionConfidence = validConf;
  result.visionNotes = notes;
  return result;
}

// ──────────── helper ────────────
// "Populated" means: non-empty string, non-empty array, non-null, not "N/A"/etc.
// Catches lazy hallucination patterns even when Vision ignores the rule.
function isPopulated(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (!s) return false;
    if (s === "n/a" || s === "na" || s === "unknown" || s === "not specified" || s === "not provided") return false;
    return true;
  }
  if (Array.isArray(v)) {
    return v.length > 0 && v.some(isPopulated);
  }
  // Numbers, booleans, etc. — treat as populated if defined
  return true;
}


// ────────────────────────────────────────────────────────────────────────────
// Module exports (CommonJS-style for portability; can be inlined directly
// into index.html at integration time — these helpers become hoisted globals).
// ────────────────────────────────────────────────────────────────────────────

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    BIL_EXTRACTION_SCHEMA,
    BIL_EXTRACTION_PROMPT,
    buildBilExtractionCall,
    validateBilExtraction,
    // exported for unit-testability:
    isPopulated,
  };
}
