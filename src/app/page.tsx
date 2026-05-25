"use client";

import { useMemo, useState } from "react";
import { LeafletMap } from "@/components/LeafletMap";
import {
  forestAreas,
  generateMockAiAnalysis,
  generateMockAnalysis,
  type AiAnalysisResult,
  type AnalysisReport,
  type ForestArea,
} from "@/lib/forest-analysis";

function RiskBadge({ score }: { score: number }) {
  const label = score >= 65 ? "Kõrgem risk" : score >= 40 ? "Mõõdukas risk" : "Madal risk";
  const color =
    score >= 65
      ? "border-red-200 bg-red-50 text-red-700"
      : score >= 40
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${color}`}>
      {label} · {score}/100
    </span>
  );
}

function LoadingIndicator({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-[#d8dfd2] bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b8c8ae] border-t-[#14532d]" />
        <p className="text-sm font-medium text-[#1d2a1d]">{label}</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf1e8]">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-[#8fb889]" />
        </div>
        <p className="text-xs leading-5 text-[#6a7668]">
          Koondame registriandmed, kaardikihid ja riskisignaalid üheks
          loetavaks kokkuvõtteks.
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#e7ece2] py-3 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-[#6a7668]">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-[#1d2a1d]">{value}</dd>
    </div>
  );
}

function areaDisplayValue(area: ForestArea) {
  return area.displayValues?.areaHa ?? `${area.sizeHa.toFixed(1)} ha`;
}

function dominantTreeDisplayValue(area: ForestArea) {
  return area.displayValues?.dominantTree ?? area.dominantSpecies;
}

function lastCutYearDisplayValue(area: ForestArea) {
  if (area.displayValues?.lastCutYear) {
    return area.displayValues.lastCutYear;
  }

  return area.isRealData
    ? `Inventeerimise aasta: ${area.lastCuttingYear}`
    : String(area.lastCuttingYear);
}

function ReportSection({
  title,
  value,
}: {
  title: string;
  value: string | string[];
}) {
  return (
    <section className="rounded-md border border-[#dfe7d8] bg-white p-4">
      <h3 className="text-sm font-semibold text-[#1d2a1d]">{title}</h3>
      {Array.isArray(value) ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[#42513f]">
          {value.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2f855a]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[#42513f]">{value}</p>
      )}
    </section>
  );
}

function AiResponseCard({ analysis }: { analysis: AiAnalysisResult }) {
  return (
    <div className="rounded-lg border border-[#cad8c1] bg-[#eef5e9] p-3">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="text-base font-semibold text-[#1d2a1d]">
          AI selgitus
        </h2>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#536153]">
          Usaldusväärsus: {analysis.confidence}
        </span>
      </div>
      <div className="space-y-3">
        <ReportSection title="Kokkuvõte" value={analysis.summary} />
        <ReportSection title="Kindlad faktid" value={analysis.facts} />
        <ReportSection title="Võimalikud tõlgendused" value={analysis.risks} />
        <ReportSection
          title="Inimkeelne selgitus"
          value={analysis.plainLanguageExplanation}
        />
        <ReportSection
          title="Soovitatud kontrollid"
          value={analysis.recommendedChecks}
        />
        <ReportSection title="Andmeallikad" value={analysis.dataSources} />
        <ReportSection title="Usaldusväärsus" value={analysis.confidence} />
        <ReportSection title="Märkus" value={analysis.disclaimer} />
      </div>
    </div>
  );
}

function analysisResultToReport(analysis: AiAnalysisResult): AnalysisReport {
  return {
    summary: analysis.summary,
    dataObservations: analysis.facts,
    risks: analysis.risks,
    plainMeaning: analysis.plainLanguageExplanation,
    nextChecks: analysis.recommendedChecks,
    sources: analysis.dataSources,
  };
}

function formatReportMarkdown(area: ForestArea, report: AnalysisReport, timestamp: string) {
  return `# Metsaala raport

## Area overview

- Area name: ${area.name}
- County: ${area.county}
- Size: ${areaDisplayValue(area)}
- Dominant tree species: ${dominantTreeDisplayValue(area)}
- Last known cutting year: ${lastCutYearDisplayValue(area)}
- Clear-cutting info: ${area.clearCutHa.toFixed(1)} ha mock lageraieala
- Remote sensing changes: ${area.remoteSensingChange} (${area.remoteSensingChangePct}%)

## AI explanation

### Lühikokkuvõte

${report.summary}

### Mis andmetest näha on

${report.dataObservations.map((item) => `- ${item}`).join("\n")}

### Võimalikud riskid

${report.risks.map((item) => `- ${item}`).join("\n")}

### Mida see tähendab tavainimesele

${report.plainMeaning}

### Mida peaks edasi kontrollima

${report.nextChecks.map((item) => `- ${item}`).join("\n")}

## Risk score

${area.riskScore}/100

## Data sources

${area.dataSources.map((source) => `- ${source}`).join("\n")}

## Generated timestamp

${timestamp}

## Disclaimer

Tegemist on prototüübi automaatse kokkuvõttega. Järeldused tuleb kontrollida algandmetest.
`;
}

function ReportCard({
  area,
  report,
  timestamp,
  onClose,
}: {
  area: ForestArea;
  report: AnalysisReport;
  timestamp: string;
  onClose: () => void;
}) {
  const markdown = formatReportMarkdown(area, report, timestamp);

  async function copyReport() {
    await navigator.clipboard.writeText(markdown);
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `metsaala-raport-${area.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0f1f14]/55 p-4">
      <section className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-lg border border-[#cfdcc7] bg-[#fbfcf8] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#d8dfd2] bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6a7668]">
              Raport
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#1d2a1d]">
              Metsaala raport
            </h2>
            <p className="mt-1 text-sm text-[#536153]">{area.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#d8dfd2] px-3 py-2 text-sm font-medium text-[#1d2a1d] hover:bg-[#f1f5ec]"
          >
            Sulge
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-y-auto p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyReport}
              className="rounded-md bg-[#14532d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f3f23]"
            >
              Copy report
            </button>
            <button
              type="button"
              onClick={downloadMarkdown}
              className="rounded-md border border-[#b8c8ae] bg-white px-4 py-2 text-sm font-semibold text-[#1d2a1d] hover:bg-[#f1f5ec]"
            >
              Download as Markdown
            </button>
          </div>

          <article className="space-y-4 rounded-lg border border-[#dfe7d8] bg-white p-5">
            <section>
              <h3 className="text-sm font-semibold text-[#1d2a1d]">
                Area overview
              </h3>
              <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[#6a7668]">County</dt>
                  <dd className="font-medium text-[#1d2a1d]">{area.county}</dd>
                </div>
                <div>
                  <dt className="text-[#6a7668]">Size</dt>
                  <dd className="font-medium text-[#1d2a1d]">
                    {areaDisplayValue(area)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6a7668]">Dominant tree species</dt>
                  <dd className="font-medium text-[#1d2a1d]">
                    {dominantTreeDisplayValue(area)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#6a7668]">Last known cutting year</dt>
                  <dd className="font-medium text-[#1d2a1d]">
                    {lastCutYearDisplayValue(area)}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[#1d2a1d]">
                AI explanation
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-6 text-[#42513f]">
                <p>{report.summary}</p>
                <p>{report.plainMeaning}</p>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-[#dfe7d8] bg-[#f6f9f2] p-4">
                <h3 className="text-sm font-semibold text-[#1d2a1d]">
                  Risk score
                </h3>
                <p className="mt-2 text-2xl font-semibold text-[#14532d]">
                  {area.riskScore}/100
                </p>
              </div>
              <div className="rounded-md border border-[#dfe7d8] bg-[#f6f9f2] p-4">
                <h3 className="text-sm font-semibold text-[#1d2a1d]">
                  Generated timestamp
                </h3>
                <p className="mt-2 text-sm text-[#42513f]">{timestamp}</p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-[#1d2a1d]">
                Data sources
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {area.dataSources.map((source) => (
                  <li
                    key={source}
                    className="rounded-full border border-[#d8dfd2] bg-[#f6f9f2] px-3 py-1 text-xs font-medium text-[#42513f]"
                  >
                    {source}
                  </li>
                ))}
              </ul>
            </section>

            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
              Tegemist on prototüübi automaatse kokkuvõttega. Järeldused tuleb
              kontrollida algandmetest.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}

function Sidebar({
  selectedArea,
  report,
  aiAnalysis,
  reportTimestamp,
  isReportOpen,
  isGenerating,
  analysisError,
  isKorvemaaDemoActive,
  onGenerate,
  onOpenReport,
  onCloseReport,
}: {
  selectedArea: ForestArea | null;
  report: AnalysisReport | null;
  aiAnalysis: AiAnalysisResult | null;
  reportTimestamp: string | null;
  isReportOpen: boolean;
  isGenerating: boolean;
  analysisError: string | null;
  isKorvemaaDemoActive: boolean;
  onGenerate: () => void;
  onOpenReport: () => void;
  onCloseReport: () => void;
}) {
  if (!selectedArea) {
    return (
      <aside className="flex min-h-[420px] items-center justify-center border-t border-[#d8dfd2] bg-white p-8 text-center lg:min-h-[620px] lg:border-l lg:border-t-0">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6a7668]">
            AI Selgitaja
          </p>
          <h2 className="mt-3 text-xl font-semibold text-[#1d2a1d]">
            {isKorvemaaDemoActive
              ? "Vali Kõrvemaa metsaeraldis"
              : "Vali analüüsitav metsaala"}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#536153]">
            {isKorvemaaDemoActive
              ? "Kliki sinisel Metsaregistri eraldisel. Seejärel kuvame olemasolevad väljad ning saad lasta MetsaSelgitaja AI-l tehnilised andmed inimkeelde tõlkida."
              : "Kliki kaardil metsaalal või kasuta demo kiirnuppe. Andmed kuvatakse siin enne AI selgituse koostamist."}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full min-h-[520px] overflow-y-auto border-t border-[#d8dfd2] bg-[#fbfcf8] lg:border-l lg:border-t-0">
      <div className="sticky top-0 z-10 border-b border-[#d8dfd2] bg-white/95 p-5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#6a7668]">
          AI Selgitaja
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#1d2a1d]">
              {selectedArea.name}
            </h2>
            <p className="mt-1 text-sm text-[#536153]">
              {selectedArea.unknowns?.county
                ? `${selectedArea.county} (täpsustamata)`
                : selectedArea.county}
            </p>
            {selectedArea.isRealData ? (
              <p className="mt-2 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">
                Pärisandmete näidis: {selectedArea.sourceLayer}
              </p>
            ) : null}
          </div>
          <RiskBadge score={selectedArea.riskScore} />
        </div>
      </div>

      <div className="space-y-5 p-5">
        <dl className="rounded-md border border-[#dfe7d8] bg-white px-4">
          <DetailRow label="Area name" value={selectedArea.name} />
          <DetailRow
            label="County"
            value={
              selectedArea.unknowns?.county
                ? `${selectedArea.county} (täpsustamata)`
                : selectedArea.county
            }
          />
          <DetailRow
            label="Size in hectares"
            value={areaDisplayValue(selectedArea)}
          />
          <DetailRow
            label="Dominant tree species"
            value={dominantTreeDisplayValue(selectedArea)}
          />
          <DetailRow
            label="Last known cutting year"
            value={lastCutYearDisplayValue(selectedArea)}
          />
          <DetailRow
            label="Clear-cutting info"
            value={`${selectedArea.clearCutHa.toFixed(1)} ha mock lageraieala`}
          />
          <DetailRow
            label="Remote sensing changes"
            value={`${selectedArea.remoteSensingChange} (${selectedArea.remoteSensingChangePct}%)`}
          />
          <DetailRow
            label="Risk score"
            value={`${selectedArea.riskScore}/100`}
          />
          <DetailRow
            label="Data sources"
            value={selectedArea.dataSources.join(", ")}
          />
        </dl>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full rounded-md bg-[#14532d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f3f23] focus:outline-none focus:ring-2 focus:ring-[#14532d] focus:ring-offset-2 disabled:cursor-wait disabled:bg-[#7b927d]"
        >
          {isGenerating ? "Koostan selgitust..." : "Selgita inimkeeles"}
        </button>

        {isGenerating ? (
          <LoadingIndicator label="AI Selgitaja koostab inimkeelset kokkuvõtet" />
        ) : null}

        {analysisError ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-800">
            {analysisError}
          </p>
        ) : null}

        {report ? (
          <>
            <button
              type="button"
              onClick={onOpenReport}
              className="w-full rounded-md border border-[#b8c8ae] bg-white px-4 py-3 text-sm font-semibold text-[#1d2a1d] transition hover:bg-[#f1f5ec] focus:outline-none focus:ring-2 focus:ring-[#14532d] focus:ring-offset-2"
            >
              Koosta raport
            </button>

            {aiAnalysis ? <AiResponseCard analysis={aiAnalysis} /> : null}

            {isReportOpen && reportTimestamp ? (
              <ReportCard
                area={selectedArea}
                report={report}
                timestamp={reportTimestamp}
                onClose={onCloseReport}
              />
            ) : null}
          </>
        ) : null}
      </div>
    </aside>
  );
}

export default function Home() {
  const [selectedArea, setSelectedArea] = useState<ForestArea | null>(null);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [reportTimestamp, setReportTimestamp] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [demoFocusKey, setDemoFocusKey] = useState(0);
  const [isKorvemaaDemoActive, setIsKorvemaaDemoActive] = useState(false);

  const selectedAreaId = selectedArea?.id;
  const mapIntro = useMemo(
    () =>
      selectedArea
        ? `${selectedArea.name} on valitud. Vajuta raporti loomiseks nuppu.`
        : isKorvemaaDemoActive
          ? "Vali kaardilt metsaeraldis ja MetsaSelgitaja AI tõlgib tehnilised andmed inimkeelde."
          : "Vali kaardilt metsaala või käivita üks valmis demo stsenaarium.",
    [isKorvemaaDemoActive, selectedArea],
  );

  function handleSelectArea(area: ForestArea) {
    setSelectedArea(area);
    setReport(null);
    setAiAnalysis(null);
    setReportTimestamp(null);
    setIsReportOpen(false);
    setAnalysisError(null);
  }

  function handleOpenKorvemaaDemo() {
    setSelectedArea(null);
    setReport(null);
    setAiAnalysis(null);
    setReportTimestamp(null);
    setIsReportOpen(false);
    setAnalysisError(null);
    setIsKorvemaaDemoActive(true);
    setDemoFocusKey((current) => current + 1);
  }

  async function runAnalysis(area: ForestArea) {
    setIsGenerating(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze-forest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ area }),
      });

      if (!response.ok) {
        throw new Error("Analysis API request failed.");
      }

      const data = (await response.json()) as AiAnalysisResult;

      setAiAnalysis(data);
      setReport(analysisResultToReport(data));
      setReportTimestamp(null);
      setIsReportOpen(false);
    } catch {
      const fallbackAnalysis = generateMockAiAnalysis(area);

      setAiAnalysis(fallbackAnalysis);
      setReport(generateMockAnalysis(area));
      setReportTimestamp(null);
      setIsReportOpen(false);
      setAnalysisError(
        "API päring ebaõnnestus, seega kuvati turvaline lokaalne mock-analüüs.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateReport() {
    if (!selectedArea) {
      return;
    }

    await runAnalysis(selectedArea);
  }

  async function runDemo(area: ForestArea, openReport = false) {
    setSelectedArea(area);
    setReport(null);
    setAiAnalysis(null);
    setReportTimestamp(null);
    setIsReportOpen(false);

    await runAnalysis(area);

    if (openReport) {
      setReportTimestamp(new Date().toLocaleString("et-EE"));
      setIsReportOpen(true);
    }
  }

  function handleOpenReport() {
    setReportTimestamp(new Date().toLocaleString("et-EE"));
    setIsReportOpen(true);
  }

  function handleCloseReport() {
    setIsReportOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] p-3 text-[#1d2a1d] sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="rounded-lg border border-[#d8dfd2] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6a7668]">
                  Avaliku sektori avaandmete prototüüp
                </p>
                <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                  Päris avaandmete demo
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-semibold text-[#1d2a1d] sm:text-4xl">
                Muudame metsandusandmed inimkeelde
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#536153]">
                Metsa Selgitaja AI ühendab metsaalade kaardikihid, raieinfo,
                kaugseire signaalid ja riskiskoori selgeks töövooks, mis aitab
                ametnikul, ajakirjanikul või kogukonnal kiiresti aru saada, mida
                andmetest tegelikult näha on.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#1d2a1d]">
                Vali kaardilt metsaeraldis ja MetsaSelgitaja AI tõlgib
                tehnilised andmed inimkeelde.
              </p>
              <p className="mt-3 text-sm font-medium text-[#1d2a1d]">
                {mapIntro}
              </p>
              <p className="mt-4 max-w-3xl rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                Tegemist on häkatoni prototüübiga. Andmed ja järeldused tuleb
                kontrollida algallikatest.
              </p>
            </div>

            <div className="rounded-lg border border-[#d8dfd2] bg-[#f8faf5] p-4">
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6a7668]">
                  Kiirdemo
                </p>
                <h2 className="mt-1 text-base font-semibold text-[#1d2a1d]">
                  Vali valmis stsenaarium
                </h2>
                <p className="mt-2 text-sm leading-5 text-[#536153]">
                  Need nupud käivitavad kohtuniku jaoks kõige olulisemad
                  töövood: risk, raieinfo ja raport.
                </p>
              </div>

              <div className="grid gap-2">
              <button
                type="button"
                onClick={handleOpenKorvemaaDemo}
                disabled={isGenerating}
                className="rounded-md border border-sky-700 bg-sky-700 px-4 py-3 text-left transition hover:bg-sky-800 disabled:cursor-wait disabled:opacity-60"
              >
                <span className="block text-sm font-semibold text-white">
                  Ava Kõrvemaa demo
                </span>
                <span className="mt-1 block text-xs leading-5 text-sky-50">
                  Keskendab kaardi Aegviidu/Kõrvemaa päris Metsaregistri
                  eraldistele.
                </span>
              </button>
              <button
                type="button"
                onClick={() => runDemo(forestAreas[2])}
                disabled={isGenerating}
                className="group rounded-md border border-[#c9d7c0] bg-white px-4 py-3 text-left transition hover:border-[#14532d] hover:bg-[#f3f7ef] disabled:cursor-wait disabled:opacity-60"
              >
                <span className="block text-sm font-semibold text-[#1d2a1d]">
                  Analüüsi kõrge riskiga ala
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#61705d]">
                  Avab probleemsema metsaala ja koostab esmase selgituse.
                </span>
              </button>
              <button
                type="button"
                onClick={() => runDemo(forestAreas[0])}
                disabled={isGenerating}
                className="group rounded-md border border-[#c9d7c0] bg-white px-4 py-3 text-left transition hover:border-[#14532d] hover:bg-[#f3f7ef] disabled:cursor-wait disabled:opacity-60"
              >
                <span className="block text-sm font-semibold text-[#1d2a1d]">
                  Selgita lageraie infot
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#61705d]">
                  Näitab, kuidas raieandmed tõlgitakse inimkeelseks.
                </span>
              </button>
              <button
                type="button"
                onClick={() => runDemo(forestAreas[2], true)}
                disabled={isGenerating}
                className="rounded-md border border-[#14532d] bg-[#14532d] px-4 py-3 text-left transition hover:bg-[#0f3f23] disabled:cursor-wait disabled:opacity-60"
              >
                <span className="block text-sm font-semibold text-white">
                  Koosta raport ajakirjanikule
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#dcebdd]">
                  Loob jagatava kokkuvõtte koos allikate ja disclaimeriga.
                </span>
              </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid min-h-[620px] overflow-hidden rounded-lg border border-[#d8dfd2] bg-white shadow-sm xl:grid-cols-[minmax(0,1fr)_430px]">
          <div className="h-[55vh] min-h-[380px] sm:min-h-[460px] xl:h-full xl:min-h-[620px]">
            <LeafletMap
              selectedAreaId={selectedAreaId}
              demoFocusKey={demoFocusKey}
              onSelectArea={handleSelectArea}
            />
          </div>
          <Sidebar
            selectedArea={selectedArea}
            report={report}
            aiAnalysis={aiAnalysis}
            reportTimestamp={reportTimestamp}
            isReportOpen={isReportOpen}
            isGenerating={isGenerating}
            analysisError={analysisError}
            isKorvemaaDemoActive={isKorvemaaDemoActive}
            onGenerate={handleGenerateReport}
            onOpenReport={handleOpenReport}
            onCloseReport={handleCloseReport}
          />
        </section>
      </div>
    </main>
  );
}
