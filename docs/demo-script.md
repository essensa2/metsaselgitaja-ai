# Demo Script

## Setup

1. Start the app:

```bash
npm run dev
```

2. Open `http://localhost:3020`.
3. Keep browser zoom at 100%.
4. Make sure no `.env.local` credentials are required.

## 3-Minute Demo Flow

### 1. Opening

Say:

"Metsa Selgitaja AI on avaliku sektori avaandmete prototüüp. Idee on muuta metsandusandmed arusaadavaks inimesele, kes ei ole metsaregistri või GIS-andmete ekspert."

Show:

- Intro card: `Muudame metsandusandmed inimkeelde`
- Map
- AI Selgitaja sidebar empty state

### 2. Select a High-Risk Area

Click:

`Analüüsi kõrge riskiga ala`

Say:

"Alustame kõrge riskiga alast. Prototüüp valib metsaala, kuvab selle kaardil ja koondab olulisemad tunnused parempoolsesse paneeli."

Show:

- Selected polygon state
- Risk score
- County, hectares, species, cutting year
- Data sources

### 3. Explain Map Layers

Toggle:

- `Metsaalad`
- `Lageraie info`
- `Riskiskoor`
- `Kaugseire muutused`

Say:

"Kihid on hetkel mock-andmed, kuid struktuur peegeldab päris töövoogu: registriandmed, raieinfo, kaugseire muutused ja riskiskoor."

Show:

- Risk legend
- Tooltip with area name and risk score
- Layer toggles changing the visualization

### 4. Generate Human Explanation

Click:

`Selgita inimkeeles`

Say:

"Analüüs käib läbi API route'i. Kui OpenAI võtit ei ole, tagastab süsteem turvalise mock-analüüsi. See hoiab demo töökindlana."

Show sections:

- Lühikokkuvõte
- Mis andmetest näha on
- Võimalikud riskid
- Mida see tähendab tavainimesele
- Mida peaks edasi kontrollima
- Kasutatud andmeallikad

### 5. Generate Report

Click:

`Koosta raport`

Say:

"Tulemuse saab vormistada raportiks, mida saab kopeerida või Markdownina alla laadida. PDF-i pole veel tehtud, sest hackathonis on esmane eesmärk töötav otsast-lõpuni demo."

Show:

- Title: `Metsaala raport`
- Area overview
- AI explanation
- Risk score
- Data sources
- Generated timestamp
- Disclaimer

### 6. Close

Say:

"Järgmine samm on ühendada päris Supabase tabelid, päris GIS-andmed ja OpenAI struktureeritud vastus. Skeem ja API piirid on repos juba ette valmistatud."

## Backup Demo Path

If API call fails:

1. Point out the fallback warning.
2. Explain that local mock fallback is intentional for hackathon reliability.
3. Continue with the generated mock report.

If map tiles fail:

1. Continue with sidebar and report workflow.
2. Explain that polygons and data workflow are local; only base tiles depend on network.
