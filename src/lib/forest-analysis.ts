export type ForestArea = {
  id: string;
  name: string;
  county: string;
  sizeHa: number;
  dominantSpecies: string;
  lastCuttingYear: number;
  riskScore: number;
  clearCutHa: number;
  remoteSensingChange: "Madal" | "Mõõdukas" | "Kõrge";
  remoteSensingChangePct: number;
  dataSources: string[];
  center: [number, number];
  bounds: [number, number][];
  isRealData?: boolean;
  sourceLayer?: string;
  sourceId?: string;
  inventoryDate?: string | null;
};

export type AnalysisReport = {
  summary: string;
  dataObservations: string[];
  risks: string[];
  plainMeaning: string;
  nextChecks: string[];
  sources: string[];
};

export type AiAnalysisResult = {
  summary: string;
  facts: string[];
  risks: string[];
  plainLanguageExplanation: string;
  recommendedChecks: string[];
  dataSources: string[];
  confidence: "low" | "medium" | "high";
  disclaimer: string;
};

export type AnalyzeForestRequest = {
  area: ForestArea;
};

export type AnalyzeForestResponse = {
  report: AnalysisReport;
  mode: "mock" | "openai-ready";
  generatedAt: string;
};

export const forestAreas: ForestArea[] = [
  {
    id: "alam-pedja-001",
    name: "Alam-Pedja servamets",
    county: "Tartu maakond",
    sizeHa: 184.6,
    dominantSpecies: "Kask",
    lastCuttingYear: 2018,
    riskScore: 42,
    clearCutHa: 12.4,
    remoteSensingChange: "Mõõdukas",
    remoteSensingChangePct: 18,
    dataSources: ["Metsaregister", "Maa-ameti ortofoto", "Keskkonnaagentuur"],
    center: [58.443, 26.154],
    bounds: [
      [58.468, 26.09],
      [58.462, 26.216],
      [58.419, 26.208],
      [58.424, 26.081],
    ],
  },
  {
    id: "lahemaa-002",
    name: "Lahemaa männik",
    county: "Harju maakond",
    sizeHa: 96.2,
    dominantSpecies: "Mänd",
    lastCuttingYear: 2012,
    riskScore: 28,
    clearCutHa: 3.8,
    remoteSensingChange: "Madal",
    remoteSensingChangePct: 6,
    dataSources: ["Metsaregister", "Natura 2000 kaardikiht", "Maa-amet"],
    center: [59.512, 25.706],
    bounds: [
      [59.535, 25.655],
      [59.529, 25.768],
      [59.489, 25.754],
      [59.493, 25.642],
    ],
  },
  {
    id: "soomaa-003",
    name: "Soomaa lodumets",
    county: "Pärnu maakond",
    sizeHa: 131.8,
    dominantSpecies: "Kuusk",
    lastCuttingYear: 2021,
    riskScore: 67,
    clearCutHa: 28.7,
    remoteSensingChange: "Kõrge",
    remoteSensingChangePct: 34,
    dataSources: ["Metsaregister", "Mullastiku kaart", "Üleujutusalade andmestik"],
    center: [58.432, 25.055],
    bounds: [
      [58.456, 24.997],
      [58.447, 25.104],
      [58.404, 25.094],
      [58.411, 24.986],
    ],
  },
];

export function generateMockAnalysis(area: ForestArea): AnalysisReport {
  const yearsSinceCutting = new Date().getFullYear() - area.lastCuttingYear;
  const riskLevel =
    area.riskScore >= 65 ? "kõrgem" : area.riskScore >= 40 ? "mõõdukas" : "madal";
  const sourceContext = area.isRealData
    ? "See ala pärineb päris Metsaregistri WFS näidiskihist; riskiskoor ja tõlgendus on prototüübi arvutuslik lihtsustus."
    : "See ala pärineb demo mock-andmestikust.";

  return {
    summary: `${area.name} on ${area.sizeHa.toFixed(
      1,
    )} hektari suurune metsaala, mille peamine puuliik on ${area.dominantSpecies.toLowerCase()}. Praegune riskihinnang on ${riskLevel}, skooriga ${area.riskScore}/100.`,
    dataObservations: [
      `Ala paikneb halduslikult: ${area.county}.`,
      `Viimane teadaolev raieaasta on ${area.lastCuttingYear}, ehk ligikaudu ${yearsSinceCutting} aastat tagasi.`,
      `Puistu põhitunnusena on märgitud domineerivaks liigiks ${area.dominantSpecies.toLowerCase()}.`,
      `Mock-kaugseire muutuse tase on ${area.remoteSensingChange.toLowerCase()} (${area.remoteSensingChangePct}%).`,
      sourceContext,
      `Analüüs kasutab ${area.dataSources.length} mock-andmeallikat, mis imiteerivad registri-, kaardi- ja keskkonnaandmeid.`,
    ],
    risks: [
      area.riskScore >= 65
        ? "Riskiskoor viitab, et ala vajab enne otsuste tegemist täiendavat kontrolli, eriti kaitsepiirangute ja hiljutiste muutuste osas."
        : "Riskiskoor ei viita kriitilisele ohule, kuid seda ei tohiks käsitleda lõpliku otsusena.",
      yearsSinceCutting <= 5
        ? "Raieinfo on suhteliselt värske, mistõttu võib ala tegelik seis olla kiiresti muutunud."
        : "Raieinfo on vanem, seega tuleks kontrollida, kas andmed peegeldavad praegust olukorda.",
      "Kaardipõhine hinnang ei asenda kohapealset vaatlust ega ametlikku metsakorralduslikku dokumenti.",
    ],
    plainMeaning: `Tavainimese jaoks tähendab see, et ${area.name} ei ole lihtsalt roheline laik kaardil, vaid konkreetsete tunnustega metsaüksus. Enne ostu-, majandamis- või looduskaitseotsust tuleks aru saada, kas ala väärtus tuleb puidust, elurikkusest, kasutuspiirangutest või nende kombinatsioonist.`,
    nextChecks: [
      "Kontrollida ametlikust Metsaregistrist viimase inventeerimise ja raieandmete kuupäeva.",
      "Vaadata, kas alal on kaitseala, vääriselupaiga, Natura või kohaliku planeeringu piiranguid.",
      "Võrrelda ortofotot ja satelliidipilte, et näha hiljutisi muutusi.",
      "Küsida vajadusel metsaeksperdi või kohaliku omavalitsuse hinnangut.",
    ],
    sources: area.dataSources,
  };
}

export function generateMockAiAnalysis(area: ForestArea): AiAnalysisResult {
  const report = generateMockAnalysis(area);

  return {
    summary: report.summary,
    facts: report.dataObservations,
    risks: report.risks,
    plainLanguageExplanation: report.plainMeaning,
    recommendedChecks: report.nextChecks,
    dataSources: report.sources,
    confidence: area.isRealData ? "medium" : "low",
    disclaimer:
      "Tegemist on prototüübi automaatse kokkuvõttega. Järeldused tuleb kontrollida algandmetest.",
  };
}
