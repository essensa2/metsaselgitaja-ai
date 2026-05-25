# Data Sources

This MVP uses small public/open geospatial samples only. Do not ingest national-scale datasets during the hackathon unless the demo is already stable.

## Demo Bounding Box

Primary demo area: Soomaa / Pärnu-Viljandi region.

For Metsaregister WFS fetching, the scripts use a small L-EST97 BBOX:

```text
520000,6450000,570000,6500000 EPSG:3301
```

The requested output CRS is `EPSG:4326`, so the processed GeoJSON can be rendered directly in Leaflet.

## Metsaregister: Forest Stand Compartments

- Name: Metsaregister metsaeraldised
- Source URL: `https://gsavalik.envir.ee/geoserver/metsaregister/wfs`
- Example layer: `metsaregister:eraldis`
- Access type: WFS, WMS, GeoJSON through WFS `outputFormat=application/json`
- License/attribution: The WFS capabilities state that data are public and, unless specified otherwise per layer, available under CC-BY 4.0 with attribution to the Ministry of Climate. Layer metadata in Maa- ja Ruumiamet Geoportaal attributes the layer to `Metsaregister: Keskkonnaagentuur`.
- Fields found: `sys_id`, `id`, `invent_kp`, `registreerimise_kp`, `katastri_nr`, `kvartali_nr`, `eraldise_nr`, `pindala`, `kasvukoht_kood`, `peapuuliik_kood`, `omandivorm_kood`, `keskm_vanus`, `tuleohu_kood`.
- Usefulness for MVP: High. This is the best real forestry layer for showing actual forest compartment geometries and attributes.
- Integration difficulty: Medium. WFS works with BBOX and GeoJSON output, but field semantics need lookup tables for production-quality explanation.
- Current integration: Used as a small processed sample in `public/data/processed/metsaregister-eraldis-sample.geojson`.

## Metsaregister: Cutting Notifications

- Name: Metsaregister metsateatised
- Source URL: `https://gsavalik.envir.ee/geoserver/metsaregister/wfs`
- Example layer: `metsaregister:teatis`
- Access type: WFS, WMS, GeoJSON through WFS `outputFormat=application/json`
- License/attribution: Same service-level attribution as Metsaregister WFS; attribute to Keskkonnaagentuur / Ministry of Climate unless a layer-specific condition says otherwise.
- Fields found: `sys_id`, `teatise_nr`, `kinnistu_nimetus`, `kinnistu_nr`, `metskond`, `katastri_nr`, `kvartali_nr`, `eraldise_nr`, `pindala`, `too_kood`, `raiutav_maht`, `otsus`, `otsuse_pohjendus`, `otsus_kinnitatud_kp`, `kehtiv_kuni`.
- Usefulness for MVP: High for explaining planned/approved cutting activity and linking it to forest stand areas.
- Integration difficulty: Medium to high. Requires filtering, code-list interpretation, and careful wording to avoid overclaiming.
- Current integration: Documented and script-ready, not yet displayed as a real layer.

## EELIS: Protected Areas

- Name: EELIS kaitsealad
- Source URL: `https://gsavalik.envir.ee/geoserver/eelis/wfs`
- Example layer: `eelis:kr_kaitseala`
- Access type: WFS, WMS, GeoJSON through WFS `outputFormat=application/json`
- License/attribution: Keskkonnaportaal states EELIS public map layers are available through public WMS/WFS services. Use service/layer attribution from Keskkonnaagentuur/Kliimaministeerium when displayed.
- Fields found: `sys_id`, `versioon`, `id`, `nimi`, `tyyp`, `kr_kood`, `valitseja`, `aluskaart`.
- Usefulness for MVP: High. Protected-area overlap is useful for risk explanation and "what to check next".
- Integration difficulty: Medium. Needs spatial intersection against selected forest areas for meaningful analysis.
- Current integration: Researched only.

## Maa- ja Ruumiamet: Current Administrative Boundaries

- Name: Kehtiv haldus- ja asustusjaotus
- Source URL: `https://teenus.maaamet.ee/ows/ajakohane-haldusjaotus`
- Example layers: `ms:maakond_pind`, `ms:omavalitsus_pind`, `ms:asustus_pind`
- Access type: WFS, WMS
- License/attribution: Maa- ja Ruumiamet public WMS/WFS service; attribute Maa- ja Ruumiamet when displayed.
- Fields found for `ms:maakond_pind`: `MNIMI`, `MKOOD`, `VERS_ALGUS`, `ALUS`, `IMP_STAMP`.
- Usefulness for MVP: Medium. Useful as a reliable fallback real data layer and for county/municipality context.
- Integration difficulty: Medium. Service returns useful GeoJSON, but output coordinates may remain in L-EST97 depending on request/layer, so conversion can be needed.
- Current integration: Researched only; not displayed because the Metsaregister WFS sample is a stronger forestry-specific demo layer.

## Maa- ja Ruumiamet: Orthophoto/Base Map Reference

- Name: Maa- ja Ruumiamet orthophoto/base map services
- Source URL: Maa- ja Ruumiamet public WMS/WFS service pages and X-GIS services.
- Access type: WMS/WMTS/WFS depending on layer
- License/attribution: Attribute Maa- ja Ruumiamet when displayed.
- Fields found: Not inspected for raster/base map because this MVP currently uses OpenStreetMap tiles.
- Usefulness for MVP: Medium. Good visual reference for a later "orthophoto" toggle.
- Integration difficulty: Low to medium for WMS display; higher for offline/demo reliability.
- Current integration: Researched only.

## Fetch Commands

```bash
npm run data:prepare
```

This fetches a small Metsaregister WFS sample into:

- `public/data/raw/metsaregister-eraldis-sample.raw.geojson`
- `public/data/processed/metsaregister-eraldis-sample.geojson`

Override the WFS URL if needed:

```bash
WFS_URL="https://example.com/geoserver/wfs?..." npm run data:fetch
```

## MVP Rule

For the hackathon, prefer small, explainable samples over complete ingestion. If a public endpoint is slow or unavailable, keep the app running with mock forestry data and show the processed sample only when it loads successfully.
