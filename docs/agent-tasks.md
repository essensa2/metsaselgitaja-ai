# Agent Task List

Tasks are ordered for a coding agent. Complete one task, run verification, then move to the next. Prefer a working demo over broad refactors.

## Frontend/UI

### UI-1: Verify Dashboard First Screen

Goal: Ensure the first screen communicates the product clearly.

Steps:

1. Open `src/app/page.tsx`.
2. Confirm the intro card includes `Muudame metsandusandmed inimkeelde`.
3. Confirm no forest area is selected by default.
4. Confirm the sidebar has a clear empty state.
5. Run `npm run lint` and `npm run build`.

Done when: The dashboard loads cleanly and the first action is obvious.

### UI-2: Improve Mobile Layout

Goal: Make the demo usable on tablet and mobile.

Steps:

1. Inspect the map/sidebar grid in `src/app/page.tsx`.
2. Ensure the map appears before the sidebar on small screens.
3. Ensure the sidebar does not create horizontal overflow.
4. Ensure quick demo buttons wrap cleanly.
5. Run `npm run build`.

Done when: The layout is usable at mobile, tablet, and desktop widths.

### UI-3: Polish Report Modal

Goal: Make the generated report look credible.

Steps:

1. Open `ReportCard` in `src/app/page.tsx`.
2. Check title, area overview, AI explanation, risk score, sources, timestamp, and disclaimer.
3. Test `Copy report`.
4. Test `Download as Markdown`.
5. Keep the output Markdown readable.

Done when: A judge can understand and export the report without explanation.

## GIS/Data

### GIS-1: Add One Additional Mock Forest Area

Goal: Make the map feel less sparse.

Steps:

1. Open `src/lib/forest-analysis.ts`.
2. Add one new `ForestArea` object with realistic Estonian county and geometry.
3. Use a different risk profile from existing areas.
4. Include all required fields.
5. Run `npm run lint` and `npm run build`.

Done when: The new area appears on the map and works in the sidebar.

### GIS-2: Tune Layer Visuals

Goal: Make risk and data layers legible.

Steps:

1. Open `src/components/LeafletMapClient.tsx`.
2. Check risk colors for low, medium, and high risk.
3. Confirm selected polygon state is visible on top of risk color.
4. Confirm layer toggles do not hide essential interactions.
5. Run `npm run build`.

Done when: The map can be explained in under 30 seconds.

## AI Analysis

### AI-1: Keep API Fallback Safe

Goal: Ensure the app works without `OPENAI_API_KEY`.

Steps:

1. Open `src/app/api/analyze-forest/route.ts`.
2. Confirm missing key returns `generateMockAnalysis`.
3. Confirm invalid payload returns HTTP 400.
4. Confirm prompt rules remain in the future OpenAI structure.
5. Run `npm run build`.

Done when: Local demo works with no `.env.local`.

### AI-2: Prepare Structured OpenAI Integration

Goal: Make the future real AI call easy to add.

Steps:

1. Keep `AnalysisReport` as the expected output contract.
2. Add comments only where integration steps are unclear.
3. Do not add a real API call unless keys and model choice are confirmed.
4. Ensure frontend does not depend on OpenAI-specific fields.

Done when: A future agent can add OpenAI without changing UI contracts.

## Supabase/Backend

### BE-1: Validate Schema Against MVP Flow

Goal: Ensure `supabase/schema.sql` supports the demo story.

Steps:

1. Open `supabase/schema.sql`.
2. Confirm tables exist: `projects`, `forest_areas`, `datasets`, `analysis_reports`, `team_notes`.
3. Confirm each table has `id uuid primary key` and `created_at`.
4. Confirm `analysis_reports` can store generated report content and sources.
5. Do not require Supabase at runtime.

Done when: Schema matches the MVP without blocking local demo.

### BE-2: Add Optional Report Persistence Later

Goal: Persist generated reports only after the demo is stable.

Steps:

1. Use `src/lib/supabase.ts`.
2. If `supabase` is `null`, skip persistence silently.
3. Insert into `analysis_reports` after report generation.
4. Do not block UI if persistence fails.
5. Keep Markdown export local.

Done when: Persistence is optional and never breaks the demo.

## Pitch/Demo

### PITCH-1: Rehearse Script

Goal: Keep the demo under 3 minutes.

Steps:

1. Open `docs/demo-script.md`.
2. Run through the exact clicks.
3. Remove or shorten any section that slows the story.
4. Keep the close focused on next steps, not limitations.

Done when: The demo can be delivered without improvising.

### PITCH-2: Prepare Judge Answers

Goal: Be ready for likely questions.

Steps:

1. Explain why mock data is used.
2. Explain how real GIS data would be connected.
3. Explain how hallucination is reduced.
4. Explain why Supabase is included but optional.
5. Explain why Markdown report comes before PDF.

Done when: The team can answer technical and policy questions clearly.

## QA

### QA-1: Full Demo Smoke Test

Goal: Confirm end-to-end demo stability.

Steps:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Run `npm run dev`.
4. Open `http://localhost:3020`.
5. Click each quick demo button.
6. Toggle every map layer.
7. Click every polygon.
8. Generate explanation.
9. Generate report.
10. Copy report.
11. Download Markdown.

Done when: No blocking console, build, or UI errors appear.

### QA-2: No-Credentials Test

Goal: Verify the fallback story.

Steps:

1. Remove or rename `.env.local` if present.
2. Restart `npm run dev`.
3. Generate an explanation.
4. Confirm mock analysis is returned.
5. Confirm no Supabase error appears in the UI.

Done when: The app works fully offline from external credentials.
