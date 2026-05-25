import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type GeoJsonGeometry = {
  type: string;
  coordinates?: unknown;
  geometries?: GeoJsonGeometry[];
};

type GeoJsonFeature = {
  type: "Feature";
  id?: string | number;
  properties: Record<string, unknown> | null;
  geometry: GeoJsonGeometry | null;
};

type GeoJsonFeatureCollection = {
  type: "FeatureCollection";
  name?: string;
  features: GeoJsonFeature[];
  metadata?: Record<string, unknown>;
};

const WFS_ENDPOINT = "https://gsavalik.envir.ee/geoserver/metsaregister/ows";
const LAYER_NAME = "metsaregister:eraldis";
const MAX_FEATURES = 500;
const BBOX = {
  minLon: 25.45,
  minLat: 59.2,
  maxLon: 25.78,
  maxLat: 59.38,
};

const RAW_OUTPUT = path.join(
  "public",
  "data",
  "raw",
  "korvemaa-metsaregister-raw.geojson",
);
const PROCESSED_OUTPUT = path.join(
  "public",
  "data",
  "processed",
  "korvemaa-metsaregister.geojson",
);

function buildUrl(params: Record<string, string | number>) {
  const url = new URL(WFS_ENDPOINT);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function ensureFeatureCollection(value: unknown): GeoJsonFeatureCollection {
  if (!value || typeof value !== "object") {
    throw new Error("WFS response is not an object.");
  }

  const candidate = value as Partial<GeoJsonFeatureCollection>;

  if (
    candidate.type !== "FeatureCollection" ||
    !Array.isArray(candidate.features)
  ) {
    throw new Error("WFS response is not a GeoJSON FeatureCollection.");
  }

  return {
    type: "FeatureCollection",
    name: candidate.name,
    features: candidate.features.filter(
      (feature): feature is GeoJsonFeature =>
        feature?.type === "Feature" && "geometry" in feature,
    ),
    metadata: candidate.metadata,
  };
}

function normalizeProperties(properties: Record<string, unknown> | null) {
  const source = properties ?? {};

  return {
    id: source.id ?? null,
    sys_id: source.sys_id ?? null,
    inventoryDate: source.invent_kp ?? null,
    registeredAt: source.registreerimise_kp ?? null,
    cadastralNumber: source.katastri_nr ?? null,
    quarterNumber: source.kvartali_nr ?? null,
    compartmentNumber: source.eraldise_nr ?? null,
    areaHa: source.pindala ?? null,
    mainSpeciesCode: source.peapuuliik_kood ?? null,
    siteTypeCode: source.kasvukoht_kood ?? null,
    ownershipCode: source.omandivorm_kood ?? null,
    averageAge: source.keskm_vanus ?? null,
    fireRiskCode: source.tuleohu_kood ?? null,
    averageCuttingAge: source.keskm_raievanus ?? null,
    sourceLayer: LAYER_NAME,
    source: "Keskkonnaagentuur / Metsaregister WFS",
  };
}

function collectLonLatPairs(value: unknown, points: [number, number][]) {
  if (!Array.isArray(value)) {
    return;
  }

  if (
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    points.push([value[0], value[1]]);
    return;
  }

  value.forEach((item) => collectLonLatPairs(item, points));
}

function calculateFeatureCenter(geometry: GeoJsonGeometry | null) {
  const points: [number, number][] = [];

  if (geometry?.coordinates) {
    collectLonLatPairs(geometry.coordinates, points);
  }

  if (geometry?.type === "GeometryCollection" && geometry.geometries) {
    geometry.geometries.forEach((item) => {
      if (item.coordinates) {
        collectLonLatPairs(item.coordinates, points);
      }
    });
  }

  if (points.length === 0) {
    return null;
  }

  const [lonSum, latSum] = points.reduce(
    ([lonAcc, latAcc], [lon, lat]) => [lonAcc + lon, latAcc + lat],
    [0, 0],
  );

  return {
    lon: lonSum / points.length,
    lat: latSum / points.length,
  };
}

async function inspectCapabilities() {
  const url = buildUrl({
    service: "WFS",
    version: "2.0.0",
    request: "GetCapabilities",
  });
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GetCapabilities failed: ${response.status}`);
  }

  const text = await response.text();

  if (!text.includes(LAYER_NAME)) {
    throw new Error(`Layer ${LAYER_NAME} was not found in GetCapabilities.`);
  }
}

async function fetchKorvemaaData() {
  const url = buildUrl({
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeNames: LAYER_NAME,
    srsName: "EPSG:4326",
    outputFormat: "application/json",
    count: MAX_FEATURES,
    bbox: `${BBOX.minLon},${BBOX.minLat},${BBOX.maxLon},${BBOX.maxLat},EPSG:4326`,
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`GetFeature failed: ${response.status} ${response.statusText}`);
  }

  return {
    url,
    data: ensureFeatureCollection(await response.json()),
  };
}

async function saveJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  try {
    console.log(`Inspecting Metsaregister WFS capabilities for ${LAYER_NAME}...`);
    await inspectCapabilities();

    console.log("Fetching bounded Korvemaa Metsaregister sample...");
    const { url, data } = await fetchKorvemaaData();

    const rawOutput = {
      ...data,
      metadata: {
        sourceUrl: url,
        endpoint: WFS_ENDPOINT,
        layer: LAYER_NAME,
        bbox: BBOX,
        maxFeatures: MAX_FEATURES,
        fetchedAt: new Date().toISOString(),
      },
    };
    const processed: GeoJsonFeatureCollection = {
      type: "FeatureCollection",
      name: "korvemaa_metsaregister_eraldis",
      metadata: {
        sourceUrl: url,
        endpoint: WFS_ENDPOINT,
        layer: LAYER_NAME,
        bbox: BBOX,
        maxFeatures: MAX_FEATURES,
        note: "Simplified Aegviidu/Korvemaa hackathon sample. Not national coverage.",
        generatedAt: new Date().toISOString(),
      },
      features: data.features.slice(0, MAX_FEATURES).map((feature) => ({
        type: "Feature",
        id: feature.id,
        geometry: feature.geometry,
        properties: {
          ...normalizeProperties(feature.properties),
          center: calculateFeatureCenter(feature.geometry),
        },
      })),
    };

    await saveJson(RAW_OUTPUT, rawOutput);
    await saveJson(PROCESSED_OUTPUT, processed);

    console.log(`Saved raw GeoJSON: ${RAW_OUTPUT}`);
    console.log(`Saved processed GeoJSON: ${PROCESSED_OUTPUT}`);
    console.log(`Feature count: ${processed.features.length}`);
  } catch (error) {
    console.error("Korvemaa Metsaregister fetch failed.");
    console.error(error instanceof Error ? error.message : error);
    console.error("Existing mock data fallback remains unchanged.");
    process.exitCode = 0;
  }
}

void main();
