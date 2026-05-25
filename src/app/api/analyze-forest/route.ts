import { NextResponse } from "next/server";
import { analyzeForestArea } from "@/lib/ai/provider";
import { generateMockAiAnalysis, type ForestArea } from "@/lib/forest-analysis";

type AnalyzeForestRequest = {
  area: ForestArea;
};

function isForestArea(value: unknown): value is ForestArea {
  if (!value || typeof value !== "object") {
    return false;
  }

  const area = value as Partial<ForestArea>;

  return (
    typeof area.id === "string" &&
    typeof area.name === "string" &&
    typeof area.county === "string" &&
    typeof area.sizeHa === "number" &&
    typeof area.dominantSpecies === "string" &&
    typeof area.lastCuttingYear === "number" &&
    typeof area.riskScore === "number" &&
    Array.isArray(area.dataSources)
  );
}

async function parseRequest(request: Request): Promise<AnalyzeForestRequest | null> {
  try {
    const body = (await request.json()) as Partial<AnalyzeForestRequest>;

    if (!isForestArea(body.area)) {
      return null;
    }

    return { area: body.area };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const payload = await parseRequest(request);

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid forest area payload." },
      { status: 400 },
    );
  }

  try {
    const analysis = await analyzeForestArea(payload.area);

    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json(generateMockAiAnalysis(payload.area));
  }
}
