"use client";

import dynamic from "next/dynamic";
import type { ForestArea } from "@/lib/forest-analysis";

const LeafletMapClient = dynamic(() => import("./LeafletMapClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#edf1e8] text-sm text-[#536153]">
      Kaarti laaditakse...
    </div>
  ),
});

type LeafletMapProps = {
  selectedAreaId?: string;
  onSelectArea: (area: ForestArea) => void;
};

export function LeafletMap({ selectedAreaId, onSelectArea }: LeafletMapProps) {
  return (
    <LeafletMapClient
      selectedAreaId={selectedAreaId}
      onSelectArea={onSelectArea}
    />
  );
}
