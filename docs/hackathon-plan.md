# Hackathon Execution Plan

## Goal

Build a convincing public-sector/open-data prototype that turns forestry data into plain Estonian explanations. The demo must work end to end with mock data, while keeping clear extension points for Supabase, GIS datasets, and a real AI model.

## Success Criteria

- A user can open the app, choose a forest area, inspect map layers, generate an Estonian AI-style explanation, and create a Markdown report.
- The app works without real Supabase or OpenAI credentials.
- The codebase remains TypeScript-safe and buildable.
- The pitch clearly explains the public value, data flow, and next steps.

## Workstreams

### Frontend/UI

1. Verify the dashboard works at `http://localhost:3020`.
2. Keep the first screen focused on the real workflow: intro card, map, layer controls, AI sidebar.
3. Improve mobile behavior for the map/sidebar split if any overflow or tap target issues appear.
4. Add small credibility cues: prototype status, data-source chips, generated timestamp, and disclaimer.
5. Avoid adding decorative features unless they make the demo easier to understand.

### GIS/Data

1. Keep mock forest areas in `src/lib/forest-analysis.ts` as the canonical local dataset.
2. Ensure every mock area has county, hectares, species, cutting year, risk score, clear-cut info, remote-sensing signal, geometry, and data sources.
3. Tune layer colors so risk levels are immediately readable.
4. Confirm hover tooltip and selected polygon state work for every mock area.
5. If time allows, add one more realistic Estonian forest area with distinct risk and data-source profile.

### AI Analysis

1. Keep `/api/analyze-forest` as the single analysis entry point.
2. Maintain mock fallback when `OPENAI_API_KEY` is missing.
3. Preserve prompt rules: Estonian output, no hallucination, only provided data, facts vs assumptions, source references.
4. When adding a real AI call later, validate model output before returning it to the frontend.
5. Keep report sections stable so the UI and Markdown export do not break.

### Supabase/Backend

1. Keep the app independent of credentials for the demo.
2. Use `src/lib/supabase.ts` only through null-safe helpers until real credentials exist.
3. Treat `supabase/schema.sql` as the future persistence contract.
4. Do not migrate runtime state into Supabase during the hackathon unless the local demo is already stable.
5. If Supabase is connected, first persist generated reports; avoid broad rewrites.

### Pitch/Demo

1. Start with the public problem: forestry data exists, but is hard for non-specialists to interpret.
2. Demo one high-risk area.
3. Toggle map layers to show the system is data-driven.
4. Generate the explanation.
5. Generate the report and download Markdown.
6. Close by explaining that Supabase and OpenAI integration points are already prepared.

### QA

1. Run `npm run lint`.
2. Run `npm run build`.
3. Open the app on `localhost:3020`.
4. Test all three quick demo buttons.
5. Test clicking each polygon and marker.
6. Test `Selgita inimkeeles`, `Koosta raport`, `Copy report`, and `Download as Markdown`.
7. Confirm the app still works with no `.env.local`.

## Priority Order

1. Keep the map and AI sidebar working.
2. Keep the report workflow working.
3. Keep fallback behavior safe without credentials.
4. Polish copy and demo script.
5. Add persistence or real AI only if the demo is already stable.
