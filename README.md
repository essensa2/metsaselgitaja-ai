# Metsa Selgitaja AI

Next.js App Router prototype for a forestry AI hackathon MVP. The app currently runs fully on local mock data and does not require Supabase or OpenAI credentials.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3020`.

## Environment variables

Copy `.env.example` to `.env.local` when you are ready to connect real services:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=
AI_MODEL=openai/gpt-5.4-mini
OPENAI_API_KEY=
```

These values are optional for now. If Supabase values are missing, `src/lib/supabase.ts` returns `null` and the app keeps using local mock data. If `OPENROUTER_API_KEY` is missing, `/api/analyze-forest` returns a safe mock analysis.

## AI provider

The server-side AI provider lives in `src/lib/ai/provider.ts`.

Current provider support:

- `AI_PROVIDER=openrouter`
- `OPENROUTER_API_KEY`
- `AI_MODEL`, default example `openai/gpt-5.4-mini`

The frontend never receives provider API keys. It sends the selected forest area JSON to `/api/analyze-forest`; the route either calls OpenRouter server-side or returns mock analysis if configuration is missing or the provider fails.

## Supabase skeleton

The initial database schema is in `supabase/schema.sql`.

It includes:

- `projects`
- `forest_areas`
- `datasets`
- `analysis_reports`
- `team_notes`

To apply it later, create a Supabase project, add credentials to `.env.local`, then run the SQL in the Supabase SQL editor or through the Supabase CLI.

## Current prototype features

- Leaflet map with forest area polygons
- Mock forestry layers: metsaalad, lageraie info, riskiskoor, kaugseire muutused
- Small real Metsaregister WFS sample layer loaded from `public/data/processed`
- AI Selgitaja sidebar with mock Estonian explanation
- Future-ready `/api/analyze-forest` API route with OpenRouter support and mock fallback when `OPENROUTER_API_KEY` is missing
- Report modal with copy and Markdown download
- Supabase-ready project skeleton with mock-data fallback

## Data fetching

The demo uses mock forestry analysis data by default and one small real public WFS sample for map context.

Fetch and prepare the current demo sample:

```bash
npm run data:prepare
```

This writes:

- `public/data/raw/metsaregister-eraldis-sample.raw.geojson`
- `public/data/processed/metsaregister-eraldis-sample.geojson`

The sample is fetched from the public Metsaregister WFS service with a small BBOX around the Soomaa demo area. Do not download national-scale datasets for the hackathon demo.

More source notes are documented in `docs/data-sources.md`.

## Real vs mock data

Real data currently used:

- Metsaregister forest compartment sample from `https://gsavalik.envir.ee/geoserver/metsaregister/wfs`

Mock data currently used:

- Demo forest area names and selected polygons
- Risk scores
- Clear-cutting summary values
- Remote-sensing change scores
- AI analysis text when `OPENAI_API_KEY` is missing

## Verification

```bash
npm run lint
npm run build
```
