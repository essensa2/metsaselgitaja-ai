# Pitch Outline

## One-Liner

Metsa Selgitaja AI muudab keerulised metsandus-, GIS- ja kaugseireandmed inimkeelseks selgituseks ning jagatavaks raportiks.

## Problem

- Metsandusandmed on olemas, kuid killustatud registrites, kaardikihtides ja erialases sõnavaras.
- Tavainimesel, ajakirjanikul või kohalikul kogukonnal on raske aru saada, mida andmed tegelikult tähendavad.
- Avaliku sektori andmed loovad väärtust alles siis, kui neid saab tõlgendada ja kontrollida.

## Solution

- Kaardipõhine töövoog metsaala valimiseks.
- Riskiskoori, lageraie info ja kaugseire muutuste visualiseerimine.
- AI Selgitaja, mis koostab eestikeelse struktureeritud kokkuvõtte ainult sisendandmete põhjal.
- Raport, mida saab kopeerida või Markdownina alla laadida.

## Demo Narrative

1. Valime kõrge riskiga metsaala.
2. Näitame kaardikihte ja riskilegendit.
3. Laseme AI Selgitajal andmed inimkeelde tõlkida.
4. Koostame raporti ajakirjaniku või ametniku jaoks.
5. Näitame, et Supabase ja OpenAI ühenduskohad on valmis, kuid demo töötab ka ilma võtmeteta.

## Why Now

- Avaliku sektori avaandmeid on palju, kuid nende kasutamine nõuab tihti erialateadmisi.
- AI sobib hästi andmete seletamiseks, kui mudel on piiratud ainult kontrollitava sisendiga.
- Kaugseire ja registriandmete ühendamine võimaldab kiiremat eelanalüüsi.

## Technical Architecture

- Next.js App Router frontend.
- Leaflet map and local mock GIS polygons.
- `/api/analyze-forest` analysis route with mock fallback.
- Supabase schema prepared for projects, forest areas, datasets, reports, and team notes.
- Report export as Markdown.

## Current Prototype Boundaries

- Mock forestry data only.
- No real OpenAI call yet.
- No real Supabase persistence yet.
- No PDF export yet.
- Outputs are decision support, not official conclusions.

## Impact

- Makes forestry data easier to understand.
- Helps journalists ask better questions.
- Helps local communities inspect changes around them.
- Helps public-sector teams turn open data into usable services.

## Next Steps

1. Connect real Metsaregister, Maa-amet, and remote-sensing datasets.
2. Persist selected areas and generated reports in Supabase.
3. Add OpenAI structured output with strict validation.
4. Add source-level citations and confidence scoring.
5. Add PDF export and shareable report links.
