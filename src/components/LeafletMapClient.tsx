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
import type { Feature, GeoJsonObject } from "geojson";
import { realDataLayers } from "@/data/real-data-layers";
import { normalizeForestFeature } from "@/lib/forest/normalizeForestFeature";
import { forestAreas, type ForestArea } from "@/lib/forest-analysis";

const defaultCenter: [number, number] = [59.286, 25.61];

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
  { key: "forestAreas", label: "Demoalad" },
  { key: "clearCuts", label: "Lageraie info" },
  { key: "riskScore", label: "Riskiskoor" },
  { key: "remoteSensing", label: "Kaugseire muutused" },
  { key: "realMetsaregister", label: "Päris Metsaregistri andmed" },
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

type StyleableLayer = {
  setStyle: (style: L.PathOptions) => void;
};

function isStyleableLayer(layer: L.Layer): layer is L.Layer & StyleableLayer {
  return "setStyle" in layer && typeof layer.setStyle === "function";
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
  demoFocusKey?: number;
  onSelectArea: (area: ForestArea) => void;
};

function KorvemaaDemoFocus({
  demoFocusKey,
  onFocus,
}: {
  demoFocusKey?: number;
  onFocus: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!demoFocusKey) {
      return;
    }

    map.flyTo(defaultCenter, 11, {
      duration: 0.8,
    });
    onFocus();
  }, [demoFocusKey, map, onFocus]);

  return null;
}

export default function LeafletMapClient({
  selectedAreaId,
  demoFocusKey,
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
  const [selectedRealFeatureId, setSelectedRealFeatureId] = useState<
    string | number | null
  >(null);

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

  function enableKorvemaaDemoLayer() {
    setLayers((current) => ({
      ...current,
      realMetsaregister: true,
      forestAreas: false,
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
        <KorvemaaDemoFocus
          demoFocusKey={demoFocusKey}
          onFocus={enableKorvemaaDemoLayer}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {layers.realMetsaregister && realForestData ? (
          <GeoJSONLayer
            key={selectedRealFeatureId ?? "korvemaa-metsaregister"}
            data={realForestData}
            style={(feature) => {
              const isSelected =
                String(feature?.id ?? feature?.properties?.id ?? "") ===
                String(selectedRealFeatureId ?? "");

              return {
                color: isSelected ? "#0f172a" : "#0369a1",
                fillColor: isSelected ? "#22c55e" : "#38bdf8",
                fillOpacity: isSelected ? 0.36 : 0.14,
                opacity: 0.95,
                weight: isSelected ? 3 : 1.4,
              };
            }}
            onEachFeature={(feature, layer) => {
              const realArea = normalizeForestFeature(feature as Feature);
              const defaultStyle = {
                color: "#0369a1",
                fillColor: "#38bdf8",
                fillOpacity: 0.14,
                opacity: 0.95,
                weight: 1.4,
              };

              layer.bindTooltip(
                `${realArea.name}<br />Pindala: ${realArea.displayValues?.areaHa ?? "Andmetes puudub"}<br />Allikas: Keskkonnaagentuur / Metsaregister WFS`,
                { sticky: true },
              );

              layer.on("mouseover", () => {
                if (!isStyleableLayer(layer)) {
                  return;
                }

                layer.setStyle({
                  color: "#0f172a",
                  fillColor: "#7dd3fc",
                  fillOpacity: 0.28,
                  weight: 2.4,
                });
              });

              layer.on("mouseout", () => {
                if (!isStyleableLayer(layer)) {
                  return;
                }

                const featureId = feature.id ?? feature.properties?.id ?? "";

                if (String(featureId) !== String(selectedRealFeatureId ?? "")) {
                  layer.setStyle(defaultStyle);
                }
              });

              layer.on("click", () => {
                setSelectedRealFeatureId(feature.id ?? feature.properties?.id ?? "");
                onSelectArea(realArea);
              });
            }}
          >
            <Tooltip sticky>Päris Metsaregistri andmed</Tooltip>
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
          Andmeallikas: {realDataLayers[0].attribution}
        </div>
      ) : null}
    </div>
  );
}
