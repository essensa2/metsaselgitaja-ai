/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("node:fs/promises");
const path = require("node:path");

const DEFAULT_URL =
  "https://gsavalik.envir.ee/geoserver/metsaregister/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=metsaregister:eraldis&srsName=EPSG:4326&count=25&outputFormat=application/json&CQL_FILTER=BBOX(shape,520000,6450000,570000,6500000,%27EPSG:3301%27)";

const outputPath =
  process.argv[2] ||
  path.join("public", "data", "raw", "metsaregister-eraldis-sample.raw.geojson");
const url = process.env.WFS_URL || DEFAULT_URL;

async function main() {
  console.log(`Fetching WFS sample:\n${url}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`WFS request failed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, text, "utf8");

  console.log(`Saved ${Buffer.byteLength(text, "utf8")} bytes to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
