/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs/promises");
const path = require("node:path");

const inputPath =
  process.argv[2] ||
  path.join("public", "data", "raw", "metsaregister-eraldis-sample.raw.geojson");
const outputPath =
  process.argv[3] ||
  path.join("public", "data", "processed", "metsaregister-eraldis-sample.geojson");

function pickProperties(properties = {}) {
  return {
    id: properties.id ?? null,
    sys_id: properties.sys_id ?? null,
    invent_kp: properties.invent_kp ?? null,
    registreerimise_kp: properties.registreerimise_kp ?? null,
    katastri_nr: properties.katastri_nr ?? null,
    kvartali_nr: properties.kvartali_nr ?? null,
    eraldise_nr: properties.eraldise_nr ?? null,
    pindala: properties.pindala ?? null,
    peapuuliik_kood: properties.peapuuliik_kood ?? null,
    kasvukoht_kood: properties.kasvukoht_kood ?? null,
    keskm_vanus: properties.keskm_vanus ?? null,
    tuleohu_kood: properties.tuleohu_kood ?? null,
    omandivorm_kood: properties.omandivorm_kood ?? null,
    source: "Keskkonnaagentuur / Metsaregister WFS",
  };
}

async function main() {
  const raw = JSON.parse(await fs.readFile(inputPath, "utf8"));

  if (raw.type !== "FeatureCollection" || !Array.isArray(raw.features)) {
    throw new Error("Input is not a GeoJSON FeatureCollection.");
  }

  const processed = {
    type: "FeatureCollection",
    name: "metsaregister_eraldis_sample",
    metadata: {
      source:
        "https://gsavalik.envir.ee/geoserver/metsaregister/wfs",
      layer: "metsaregister:eraldis",
      note: "Small hackathon demo sample fetched with CQL BBOX around Soomaa demo area.",
      generatedAt: new Date().toISOString(),
    },
    features: raw.features
      .filter((feature) => feature && feature.geometry)
      .slice(0, 25)
      .map((feature) => ({
        type: "Feature",
        id: feature.id,
        properties: pickProperties(feature.properties),
        geometry: feature.geometry,
      })),
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(processed, null, 2)}\n`, "utf8");

  console.log(`Saved ${processed.features.length} features to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
