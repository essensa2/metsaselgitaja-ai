# Foreva / Metsaselgitaja Product Growth Recommendations

Date: 2026-06-22

## Context

Foreva is positioned as a plain-language "history + health + value" report for Estonian forest parcels. The current product direction is strong: public forestry data is available, but normal forest owners need interpretation, auditability, alerts, and trusted guidance.

The strongest next step is to turn each parcel report into a trusted forest passport: understandable for private owners, but structured enough for buyers, insurers, banks, municipalities, and compliance teams.

## Market Signals

- EU Deforestation Regulation creates demand for traceability, geolocation evidence, and due diligence records. The European Commission lists the application dates as 2026-12-30 for large and medium operators and 2027-06-30 for micro/small operators, with some timber-regulation-covered small operators also on 2026-12-30.
- Earth observation products are moving from raw imagery toward decision-ready insight. ESA project examples in June 2026 include forestry traceability, forest carbon stock estimation, storm exposure screening, parametric climate risk, and parcel sustainability passports.
- Nature data tools are becoming easier for non-specialists. New 2026 datasets and platforms emphasize ecosystem integrity, protected-area data, AI-powered land monitoring, long-term NDVI, and financial/supply-chain risk use cases.
- AI + satellite + LiDAR forest carbon measurement is becoming a trust layer for carbon markets and natural climate solutions, not just a scientific feature.

## Recommended Product Additions

1. Forest Passport PDF
   - One shareable, timestamped report per cadastral parcel.
   - Include parcel facts, stand table, value range, risk flags, recent changes, methodology, data freshness, and disclaimer.
   - Add a public verification URL or report ID so buyers and owners can reference the same evidence.

2. Owner Protection Mode
   - Translate report findings into negotiation guidance.
   - Show "fair offer range", "red flags before signing", "questions to ask a buyer", and "when to call an expert".
   - This directly supports the core user pain: owners fear undervaluation and confusing logging offers.

3. Monitoring And Alerts
   - Paid monthly alert product for parcel owners.
   - Alert on new cutting notices, protected-area overlap changes, nearby clearcuts, storm/fire/pest risk, and detected satellite disturbance.
   - This creates recurring revenue instead of one-off report purchases.

4. Timeline Playback
   - Make the forest timeline the signature demo moment.
   - Add map/time slider for works, damages, notices, imagery-derived disturbance, and inventory changes.
   - The user should immediately understand "what happened here" without reading tables.

5. Trust Score And Data Freshness
   - Every report should show confidence by section: registry freshness, satellite availability, valuation confidence, restriction confidence.
   - Explain missing/uncertain data openly. Trust is a feature, especially for valuation.

6. B2B Due Diligence Workspace
   - Portfolio import for multiple cadastral IDs.
   - Batch risk screen: value estimate, protected area, recent disturbance, harvest readiness, liquidity, EUDR-style traceability risk.
   - Target buyers, forestry firms, banks, insurers, municipalities, and investors.

7. Carbon And Biodiversity Potential
   - Keep it conservative and labeled as indicative.
   - Add estimated carbon stock, five-year trend, habitat/protection context, and "carbon project suitability" checklist.
   - Avoid selling carbon credits early; sell audit-ready insight first.

8. AI Forest Assistant With Sources
   - Chat with a single parcel report.
   - Answers must cite the report section and source dataset, not free-form hallucinated advice.
   - Good prompts: "Should I harvest now?", "Why is my value lower than expected?", "What should I ask a buyer?"

9. Expert Review Marketplace
   - Let users order a human review from certified forestry experts.
   - Start with "second opinion" and "offer review" before building a full marketplace.
   - This improves trust and provides a premium upsell when the AI report is uncertain.

10. Compliance Evidence Export
   - Export structured evidence for supply-chain due diligence: parcel geometry, geolocation, forest status, timestamped data sources, risk flags, and report hash.
   - This can later map to EUDR workflows without positioning Foreva as a legal compliance system too early.

## Suggested Roadmap

### Next 2 weeks

- Add downloadable forest passport PDF.
- Add data freshness/confidence section.
- Add owner protection mode copy and fair-offer checklist.
- Improve timeline as a first-screen demo component.

### Next 1-2 months

- Add monitoring alerts and saved parcels.
- Add AI assistant grounded only in the generated report.
- Add shareable report links with verification IDs.
- Add paid "expert second opinion" request flow.

### Next 3-6 months

- Build portfolio screening for B2B users.
- Add carbon/biodiversity potential module.
- Add compliance evidence export.
- Add API access for selected B2B partners.

## Monetization

- Free: basic snapshot, map, high-level health/value range.
- Paid per report: full passport PDF, timeline, detailed valuation, owner protection checklist.
- Subscription: saved parcels, monitoring alerts, report history.
- B2B: portfolio screening, API/export, compliance evidence, custom risk layers.
- Services: expert review, offer review, field inspection referral.

## Positioning

Primary message:

"Know your forest before someone else profits from it."

Product category:

"A trusted forest passport for owners, buyers, and risk teams."

## Sources Reviewed

- European Commission, Regulation on Deforestation-free Products: https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en
- ESA Space Solutions project themes, June 2026 examples: https://business.esa.int/projects/theme
- Stanford Report, AI and satellite systems for forest carbon tracking: https://news.stanford.edu/stories/2025/11/ai-satellites-benefits-forests-ecosystems-climate-change
- Nature Tech Collective, new biodiversity and nature data products in early 2026: https://www.naturetechcollective.org/stories/on-our-radar-new-biodiversity-and-nature-data-products-in-early-2026
- Existing Foreva repo context: README.md, description.md, sentinel-intelligence.md, sentinel-paywall.md, sources.md
