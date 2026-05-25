"use client";

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import {
  CircleMarker,
  GeoJSON as GeoJSONLayer,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { Feature, GeoJsonObject, Geometry } from "geojson";
import { realDataLayers } from "@/data/real-data-layers";
import { forestAreas, type ForestArea } from "@/lib/forest-analysis";

const defaultCenter: [number, number] = [58.5953, 25.0136];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: typeof markerIcon2x === "string" ? markerIcon2x : markerIcon2x.src,
  iconUrl: typeof markerIcon === "string" ? markerIcon : markerIcon.src,
  shadowUrl: typeof markerShadow === "string" ? markerShadow : markerShadow.src,
});

type LayerKey =
  | "forestAreas"
  | "clearCuts"
  | "riskScore"
  | "remoteSensing"
  | "realMetsaregister";

type LayerState = Record<LayerKey, boolean>;

const layerLabels: { key: LayerKey; label: string }[] = [
  { key: "forestAreas", label: "Metsaalad" },
  { key: "clearCuts", label: "Lageraie info" },
  { key: "riskScore", label: "Riskiskoor" },
  { key: "remoteSensing", label: "Kaugseire muutused" },
  { key: "realMetsaregister", label: "Metsaregistri WFS näidis" },
];

function getRiskLevel(score: number) {
  if (score >= 65) {
    return {
      label: "Kõrge",
      color: "#dc2626",
      fillColor: "#ef4444",
      subtleFill: "#fecaca",
    };
  }

  if (score >= 40) {
    return {
      label: "Keskmine",
      color: "#d97706",
      fillColor: "#f59e0b",
      subtleFill: "#fde68a",
    };
  }

  return {
    label: "Madal",
    color: "#15803d",
    fillColor: "#22c55e",
    subtleFill: "#bbf7d0",
  };
}

function getRemoteSensingColor(area: ForestArea) {
  if (area.remoteSensingChange === "Kõrge") {
    return "#7c3aed";
  }

  if (area.remoteSensingChange === "Mõõdukas") {
    return "#2563eb";
  }

  return "#0f766e";
}

function getTreeSpeciesName(code: unknown) {
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

  return typeof code === "string" ? species[code] ?? `Kood ${code}` : "Määramata";
}

function getRiskFromFireCode(code: unknown) {
  const parsed = typeof code === "number" ? code : Number(code);

  if (!Number.isFinite(parsed)) {
    return 35;
  }

  return Math.max(15, Math.min(85, Math.round(parsed * 17)));
}

function getFeatureCenter(geometry: Geometry | null): [number, number] {
  const points: [number, number][] = [];

  function collect(value: unknown) {
    if (!Array.isArray(value)) {
      return;
    }

    if (
      value.length >= 2 &&
      typeof value[0] === "number" &&
      typeof value[1] === "number"
    ) {
      points.push([value[1], value[0]]);
      return;
    }

    value.forEach(collect);
  }

  if (geometry && "coordinates" in geometry) {
    collect(geometry.coordinates);
  }

  if (geometry?.type === "GeometryCollection") {
    geometry.geometries.forEach((item) => {
      if ("coordinates" in item) {
        collect(item.coordinates);
      }
    });
  }

  if (points.length === 0) {
    return [58.432, 25.055];
  }

  const sum = points.reduce(
    (acc, point) => [acc[0] + point[0], acc[1] + point[1]],
    [0, 0],
  );

  return [sum[0] / points.length, sum[1] / points.length];
}

function forestAreaFromWfsFeature(feature: Feature): ForestArea {
  const properties = feature.properties ?? {};
  const getString = (key: string) =>
    typeof properties[key] === "string" ? properties[key] : undefined;
  const getNumber = (key: string) => {
    const value = properties[key];
    return typeof value === "number" ? value : Number(value);
  };
  const center = getFeatureCenter(feature.geometry);
  const eraldiseNr = getNumber("eraldise_nr");
  const kvartal = getString("kvartali_nr") ?? "teadmata kvartal";
  const inventoryDate = getString("invent_kp") ?? null;
  const inventoryYear = inventoryDate
    ? Number(inventoryDate.slice(0, 4))
    : new Date().getFullYear();
  const riskScore = getRiskFromFireCode(properties.tuleohu_kood);

  return {
    id: `real-${String(feature.id ?? properties.id ?? properties.sys_id)}`,
    name: `Metsaregistri eraldis ${kvartal}-${Number.isFinite(eraldiseNr) ? eraldiseNr : "?"}`,
    county: "Päris WFS näidisala",
    sizeHa: Number.isFinite(getNumber("pindala")) ? getNumber("pindala") : 0,
    dominantSpecies: getTreeSpeciesName(properties.peapuuliik_kood),
    lastCuttingYear: Number.isFinite(inventoryYear)
      ? inventoryYear
      : new Date().getFullYear(),
    riskScore,
    clearCutHa: 0,
    remoteSensingChange:
      riskScore >= 65 ? "Kõrge" : riskScore >= 40 ? "Mõõdukas" : "Madal",
    remoteSensingChangePct: Math.max(5, Math.round(riskScore / 3)),
    dataSources: ["Keskkonnaagentuur", "Metsaregister WFS"],
    center,
    bounds: [center],
    isRealData: true,
    sourceLayer: "metsaregister:eraldis",
    sourceId: String(feature.id ?? properties.id ?? properties.sys_id ?? ""),
    inventoryDate,
  };
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize({ animate: false });
    }, 150);

    resizeObserver.observe(container);

    return () => {
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

type LeafletMapClientProps = {
  selectedAreaId?: string;
  onSelectArea: (area: ForestArea) => void;
};

export default function LeafletMapClient({
  selectedAreaId,
  onSelectArea,
}: LeafletMapClientProps) {
  const [layers, setLayers] = useState<LayerState>({
    forestAreas: true,
    clearCuts: true,
    riskScore: true,
    remoteSensing: true,
    realMetsaregister: true,
  });
  const [realForestData, setRealForestData] = useState<GeoJsonObject | null>(
    null,
  );
  const [realLayerStatus, setRealLayerStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");

  useEffect(() => {
    let isMounted = true;
    const layer = realDataLayers[0];

    fetch(layer.url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load ${layer.url}`);
        }

        return response.json() as Promise<GeoJsonObject>;
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setRealForestData(data);
        setRealLayerStatus("ready");
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setRealForestData(null);
        setRealLayerStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function toggleLayer(key: LayerKey) {
    setLayers((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  return (
    <div className="relative h-full min-h-[420px] w-full">
      <MapContainer
        center={defaultCenter}
        zoom={7}
        scrollWheelZoom
        className="h-full min-h-[420px] w-full"
      >
        <MapResizeHandler />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {layers.realMetsaregister && realForestData ? (
          <GeoJSONLayer
            data={realForestData}
            pathOptions={{
              color: "#0f172a",
              fillColor: "#38bdf8",
              fillOpacity: 0.24,
              opacity: 0.9,
              weight: 2,
            }}
            onEachFeature={(feature, layer) => {
              const realArea = forestAreaFromWfsFeature(feature as Feature);

              layer.bindTooltip(
                `${realArea.name}<br />Pindala: ${realArea.sizeHa.toFixed(1)} ha<br />Allikas: Metsaregister WFS`,
                { sticky: true },
              );

              layer.on("click", () => onSelectArea(realArea));
            }}
          >
            <Tooltip sticky>Metsaregistri WFS näidis</Tooltip>
          </GeoJSONLayer>
        ) : null}
        {forestAreas.map((area) => {
          const isSelected = area.id === selectedAreaId;
          const risk = getRiskLevel(area.riskScore);

          if (!layers.forestAreas) {
            return null;
          }

          return (
            <Polygon
              key={area.id}
              positions={area.bounds}
              pathOptions={{
                color: isSelected ? "#111827" : risk.color,
                dashArray: layers.riskScore ? undefined : "5 6",
                fillColor: layers.riskScore ? risk.fillColor : risk.subtleFill,
                fillOpacity: isSelected ? 0.5 : layers.riskScore ? 0.34 : 0.22,
                opacity: 0.95,
                weight: isSelected ? 4 : 2,
              }}
              eventHandlers={{
                click: () => onSelectArea(area),
              }}
            >
              <Tooltip sticky direction="top" opacity={0.95}>
                <div>
                  <strong>{area.name}</strong>
                  <br />
                  Riskiskoor: {area.riskScore}/100 ({risk.label})
                </div>
              </Tooltip>
              <Popup>
                <div className="space-y-1">
                  <strong>{area.name}</strong>
                  <div>{area.county}</div>
                  <div>{area.sizeHa.toFixed(1)} ha</div>
                  <div>Riskiskoor: {area.riskScore}/100</div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
        {layers.clearCuts
          ? forestAreas.map((area) => (
              <CircleMarker
                key={`${area.id}-clearcut`}
                center={area.center}
                radius={Math.max(8, Math.min(18, area.clearCutHa / 1.8))}
                pathOptions={{
                  color: "#92400e",
                  fillColor: "#f97316",
                  fillOpacity: 0.72,
                  opacity: 0.9,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => onSelectArea(area),
                }}
              >
                <Tooltip sticky>
                  Lageraie mock-info: {area.clearCutHa.toFixed(1)} ha,{" "}
                  {area.lastCuttingYear}
                </Tooltip>
              </CircleMarker>
            ))
          : null}
        {layers.remoteSensing
          ? forestAreas.map((area) => (
              <CircleMarker
                key={`${area.id}-remote`}
                center={[area.center[0] + 0.018, area.center[1] + 0.035]}
                radius={Math.max(7, Math.min(16, area.remoteSensingChangePct / 2))}
                pathOptions={{
                  color: getRemoteSensingColor(area),
                  fillColor: getRemoteSensingColor(area),
                  fillOpacity: 0.52,
                  opacity: 0.95,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => onSelectArea(area),
                }}
              >
                <Tooltip sticky>
                  Kaugseire muutus: {area.remoteSensingChange} (
                  {area.remoteSensingChangePct}%)
                </Tooltip>
              </CircleMarker>
            ))
          : null}
        {forestAreas.map((area) => (
          <Marker
            key={`${area.id}-marker`}
            position={area.center}
            eventHandlers={{
              click: () => onSelectArea(area),
            }}
          >
            <Popup>{area.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex w-[230px] flex-col gap-3">
        <div className="pointer-events-auto rounded-lg border border-[#d8dfd2] bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5f6f5a]">
            Kaardikihid
          </div>
          <div className="space-y-2">
            {layerLabels.map((layer) => (
              <label
                key={layer.key}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-[#1d2a1d] hover:bg-[#f1f5ec]"
              >
                <span>{layer.label}</span>
                <input
                  type="checkbox"
                  checked={layers[layer.key]}
                  onChange={() => toggleLayer(layer.key)}
                  className="h-4 w-4 accent-[#14532d]"
                />
              </label>
            ))}
          </div>
          {realLayerStatus === "loading" ? (
            <p className="mt-3 text-xs leading-5 text-[#6a7668]">
              Laadin Metsaregistri WFS näidiskihti...
            </p>
          ) : null}
          {realLayerStatus === "error" ? (
            <p className="mt-3 text-xs leading-5 text-amber-700">
              Pärisandmete näidiskiht ei laaditud. Mock-kihid jäävad tööle.
            </p>
          ) : null}
        </div>

        <div className="pointer-events-auto rounded-lg border border-[#d8dfd2] bg-white/95 p-3 shadow-lg backdrop-blur">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#5f6f5a]">
            Riskitasemed
          </div>
          <div className="space-y-2 text-xs text-[#42513f]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-5 rounded-sm bg-[#22c55e]" />
              Madal risk: 0-39
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-5 rounded-sm bg-[#f59e0b]" />
              Keskmine risk: 40-64
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-5 rounded-sm bg-[#ef4444]" />
              Kõrge risk: 65-100
            </div>
          </div>
        </div>
      </div>

      {realLayerStatus === "ready" ? (
        <div className="pointer-events-none absolute bottom-8 left-4 z-[1000] max-w-[520px] rounded-md border border-[#d8dfd2] bg-white/95 px-3 py-2 text-xs leading-5 text-[#42513f] shadow-lg backdrop-blur">
          Andmeallikad: {realDataLayers[0].attribution}
        </div>
      ) : null}
    </div>
  );
}
