import {
  generateMockAiAnalysis,
  type AiAnalysisResult,
  type ForestArea,
} from "@/lib/forest-analysis";

type AiProvider = "openrouter";

type OpenRouterMessage = {
  role: "system" | "user";
  content: string;
};

type OpenRouterResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
};

const DEFAULT_MODEL = "openai/gpt-5.4-mini";

function getProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER;

  if (!provider || provider === "openrouter") {
    return "openrouter";
  }

  return "openrouter";
}

function buildMessages(area: ForestArea): OpenRouterMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are MetsaSelgitaja AI, an assistant that explains Estonian forestry open data in plain language.",
        "Use only the provided input data.",
        "Do not hallucinate.",
        "Clearly separate facts, assumptions, risks, and recommended next checks.",
        "If data is insufficient, say so.",
        "Always include data sources from the input.",
        "Answer in Estonian.",
        "Return only valid JSON without Markdown.",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          task: "Koosta valitud metsaala kohta struktureeritud inimkeelne analüüs.",
          outputSchema: {
            summary: "string",
            facts: ["string"],
            risks: ["string"],
            plainLanguageExplanation: "string",
            recommendedChecks: ["string"],
            dataSources: ["string"],
            confidence: "low | medium | high",
            disclaimer: "string",
          },
          forestArea: area,
        },
        null,
        2,
      ),
    },
  ];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseConfidence(value: unknown): "low" | "medium" | "high" {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "low";
}

function parseAiAnalysis(value: unknown): AiAnalysisResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<AiAnalysisResult>;

  if (
    typeof candidate.summary !== "string" ||
    !isStringArray(candidate.facts) ||
    !isStringArray(candidate.risks) ||
    typeof candidate.plainLanguageExplanation !== "string" ||
    !isStringArray(candidate.recommendedChecks) ||
    !isStringArray(candidate.dataSources) ||
    typeof candidate.disclaimer !== "string"
  ) {
    return null;
  }

  return {
    summary: candidate.summary,
    facts: candidate.facts,
    risks: candidate.risks,
    plainLanguageExplanation: candidate.plainLanguageExplanation,
    recommendedChecks: candidate.recommendedChecks,
    dataSources: candidate.dataSources,
    confidence: parseConfidence(candidate.confidence),
    disclaimer: candidate.disclaimer,
  };
}

function parseJsonContent(content: string): AiAnalysisResult | null {
  try {
    return parseAiAnalysis(JSON.parse(content));
  } catch {
    const match = content.match(/\{[\s\S]*\}/);

    if (!match) {
      return null;
    }

    try {
      return parseAiAnalysis(JSON.parse(match[0]));
    } catch {
      return null;
    }
  }
}

export function hasAiProviderConfig() {
  const provider = getProvider();

  if (provider === "openrouter") {
    return Boolean(process.env.OPENROUTER_API_KEY);
  }

  return false;
}

export async function analyzeForestArea(area: ForestArea): Promise<AiAnalysisResult> {
  const provider = getProvider();

  if (provider !== "openrouter" || !process.env.OPENROUTER_API_KEY) {
    return generateMockAiAnalysis(area);
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3020",
      "X-Title": "MetsaSelgitaja AI",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || DEFAULT_MODEL,
      messages: buildMessages(area),
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    return generateMockAiAnalysis(area);
  }

  const payload = (await response.json()) as OpenRouterResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    return generateMockAiAnalysis(area);
  }

  return parseJsonContent(content) ?? generateMockAiAnalysis(area);
}
