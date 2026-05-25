import type { Feature, Geometry } from "geojson";
import type { ForestArea } from "@/lib/forest-analysis";

type GeoJsonProperties = Record<string, unknown>;

const UNKNOWN_TEXT = "Andmetes puudub";
const UNKNOWN_SPECIES = "Andmetes täpsustamata";
const DEFAULT_COUNTY = "Harjumaa / Järvamaa piirkond";
const DEFAULT_NAME = "Kõrvemaa metsaeraldis";
const DEFAULT_CENTER: [number, number] = [59.286, 25.61];

function readString(properties: GeoJsonProperties, keys: string[]) {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return null;
}

function readNumber(properties: GeoJsonProperties, keys: string[]) {
  for (const key of keys) {
    const value = properties[key];
    const parsed = typeof value === "number" ? value : Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function readYear(properties: GeoJsonProperties, keys: string[]) {
  for (const key of keys) {
    const value = properties[key];

    if (typeof value === "number" && value >= 1800 && value <= 2200) {
      return value;
    }

    if (typeof value === "string") {
      const match = value.match(/\b(19|20)\d{2}\b/);

      if (match) {
        return Number(match[0]);
      }
    }
  }

  return null;
}

function getTreeSpeciesName(value: string | null) {
  if (!value) {
    return UNKNOWN_SPECIES;
  }

  const code = value.toUpperCase();
  const species: Record<string, string> = {
    KU: "Kuusk",
    MA: "Mänd",
    KS: "Kask",
    HB: "Haab",
    LM: "Sanglepp",
    LV: "Hall lepp",
    SA: "Saar",
    TA: "Tamm",
  };

  return species[code] ?? value;
}

function collectCoordinates(value: unknown, points: [number, number][]) {
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

  value.forEach((item) => collectCoordinates(item, points));
}

function collectGeometryCoordinates(geometry: Geometry | null) {
  const points: [number, number][] = [];

  if (!geometry) {
    return points;
  }

  if ("coordinates" in geometry) {
    collectCoordinates(geometry.coordinates, points);
  }

  if (geometry.type === "GeometryCollection") {
    geometry.geometries.forEach((item) => {
      if ("coordinates" in item) {
        collectCoordinates(item.coordinates, points);
      }
    });
  }

  return points;
}

function calculateFeatureCenter(geometry: Geometry | null): [number, number] {
  const points = collectGeometryCoordinates(geometry);

  if (points.length === 0) {
    return DEFAULT_CENTER;
  }

  const [lonSum, latSum] = points.reduce(
    ([lonAcc, latAcc], [lon, lat]) => [lonAcc + lon, latAcc + lat],
    [0, 0],
  );

  return [latSum / points.length, lonSum / points.length];
}

function calculateApproxAreaHa(geometry: Geometry | null) {
  const points = collectGeometryCoordinates(geometry);

  if (points.length < 3) {
    return null;
  }

  const avgLatRad =
    (points.reduce((sum, [, lat]) => sum + lat, 0) / points.length) *
    (Math.PI / 180);
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLon = 111_320 * Math.cos(avgLatRad);
  const projected = points.map(([lon, lat]) => [
    lon * metersPerDegreeLon,
    lat * metersPerDegreeLat,
  ]);
  let area = 0;

  for (let index = 0; index < projected.length; index += 1) {
    const [x1, y1] = projected[index];
    const [x2, y2] = projected[(index + 1) % projected.length];
    area += x1 * y2 - x2 * y1;
  }

  const areaHa = Math.abs(area) / 2 / 10_000;

  return Number.isFinite(areaHa) && areaHa > 0
    ? Number(areaHa.toFixed(2))
    : null;
}

function calculateRiskScore(properties: GeoJsonProperties) {
  const explicitRisk = readNumber(properties, [
    "riskScore",
    "risk_score",
    "riskiskoor",
  ]);

  if (explicitRisk !== null) {
    return Math.max(0, Math.min(100, Math.round(explicitRisk)));
  }

  const fireRisk = readNumber(properties, ["fireRiskCode", "tuleohu_kood"]);

  if (fireRisk !== null) {
    return Math.max(25, Math.min(80, Math.round(fireRisk * 16)));
  }

  const age = readNumber(properties, ["averageAge", "keskm_vanus"]);

  if (age !== null) {
    return Math.max(35, Math.min(70, Math.round(age / 2)));
  }

  return 50;
}

export function normalizeForestFeature(feature: Feature): ForestArea {
  const properties = (feature.properties ?? {}) as GeoJsonProperties;
  const sourceId =
    feature.id ?? properties.id ?? properties.sys_id ?? crypto.randomUUID();
  const quarter = readString(properties, ["quarterNumber", "kvartali_nr"]);
  const compartment = readString(properties, [
    "compartmentNumber",
    "eraldise_nr",
  ]);
  const explicitName = readString(properties, [
    "name",
    "nimi",
    "eraldis_nimi",
    "kinnistu_nimetus",
  ]);
  const county = readString(properties, [
    "county",
    "maakond",
    "MNIMI",
    "countyName",
  ]);
  const areaHa =
    readNumber(properties, ["areaHa", "pindala", "area_ha", "ha"]) ??
    calculateApproxAreaHa(feature.geometry);
  const dominantTree = getTreeSpeciesName(
    readString(properties, [
      "dominantTree",
      "dominant_tree",
      "mainSpeciesCode",
      "peapuuliik_kood",
      "puuliik",
    ]),
  );
  const lastCutYear = readYear(properties, [
    "lastCutYear",
    "last_cut_year",
    "raie_aasta",
    "otsus_kinnitatud_kp",
    "kehtiv_kuni",
  ]);
  const center = calculateFeatureCenter(feature.geometry);

  return {
    id: `real-${String(sourceId)}`,
    name:
      explicitName ??
      (quarter || compartment
        ? `Metsaregistri eraldis ${quarter ?? "?"}-${compartment ?? "?"}`
        : DEFAULT_NAME),
    county: county ?? DEFAULT_COUNTY,
    sizeHa: areaHa ?? 0,
    dominantSpecies: dominantTree,
    lastCuttingYear: lastCutYear ?? new Date().getFullYear(),
    riskScore: calculateRiskScore(properties),
    clearCutHa: 0,
    remoteSensingChange: "Mõõdukas",
    remoteSensingChangePct: 0,
    dataSources: ["Keskkonnaagentuur / Metsaregister WFS"],
    center,
    bounds: [center],
    isRealData: true,
    sourceLayer:
      readString(properties, ["sourceLayer", "layer"]) ?? "metsaregister:eraldis",
    sourceId: String(sourceId),
    inventoryDate: readString(properties, ["inventoryDate", "invent_kp"]),
    unknowns: {
      areaHa: areaHa === null,
      dominantTree: dominantTree === UNKNOWN_SPECIES,
      lastCutYear: lastCutYear === null,
      county: county === null,
    },
    displayValues: {
      areaHa: areaHa === null ? UNKNOWN_TEXT : `${areaHa.toFixed(2)} ha`,
      dominantTree,
      lastCutYear: lastCutYear === null ? UNKNOWN_TEXT : String(lastCutYear),
    },
  };
}
