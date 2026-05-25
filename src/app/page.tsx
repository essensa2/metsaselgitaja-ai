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
  const [activeTab, setActiveTab] = useState<
    "summary" | "facts" | "risks" | "checks"
  >("summary");
  const tabs = [
    { id: "summary" as const, label: "Kokkuvõte" },
    { id: "facts" as const, label: "Faktid" },
    { id: "risks" as const, label: "Riskid" },
    { id: "checks" as const, label: "Soovitused" },
  ];

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-emerald-100 px-4 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#102217]">AI selgitus</h2>
          <p className="mt-1 text-xs text-[#66756a]">
            Struktureeritud tõlgendus valitud metsaeraldisest.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          {analysis.confidence}
        </span>
      </div>
      <div className="grid grid-cols-4 border-b border-emerald-100 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`border-b-2 px-2 py-3 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "border-[#14532d] text-[#14532d]"
                : "border-transparent text-[#66756a] hover:text-[#102217]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-3 p-4">
        {activeTab === "summary" ? (
          <>
            <ReportSection title="Kokkuvõte" value={analysis.summary} />
            <ReportSection
              title="Inimkeelne selgitus"
              value={analysis.plainLanguageExplanation}
            />
          </>
        ) : null}
        {activeTab === "facts" ? (
          <>
            <ReportSection title="Kindlad faktid" value={analysis.facts} />
            <ReportSection title="Andmeallikad" value={analysis.dataSources} />
          </>
        ) : null}
        {activeTab === "risks" ? (
          <>
            <ReportSection title="Võimalikud tõlgendused" value={analysis.risks} />
            <ReportSection title="Märkus" value={analysis.disclaimer} />
          </>
        ) : null}
        {activeTab === "checks" ? (
          <ReportSection
            title="Soovitatud järgmised kontrollid"
            value={analysis.recommendedChecks}
          />
        ) : null}
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0f1f14]/55 p-0 sm:p-4">
      <section className="h-full max-h-none w-full max-w-none overflow-hidden rounded-none border border-[#cfdcc7] bg-[#fbfcf8] shadow-2xl sm:max-h-[92vh] sm:max-w-3xl sm:rounded-lg">
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

        <div className="max-h-[calc(100vh-88px)] overflow-y-auto p-5 sm:max-h-[calc(92vh-88px)]">
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
  isMobileSheetOpen,
  onGenerate,
  onOpenReport,
  onCloseReport,
  onCloseMobile,
  onRunSampleDemo,
}: {
  selectedArea: ForestArea | null;
  report: AnalysisReport | null;
  aiAnalysis: AiAnalysisResult | null;
  reportTimestamp: string | null;
  isReportOpen: boolean;
  isGenerating: boolean;
  analysisError: string | null;
  isKorvemaaDemoActive: boolean;
  isMobileSheetOpen: boolean;
  onGenerate: () => void;
  onOpenReport: () => void;
  onCloseReport: () => void;
  onCloseMobile: () => void;
  onRunSampleDemo: () => void;
}) {
  if (!selectedArea) {
    return (
      <aside
        className={`fixed inset-x-0 bottom-0 z-[1100] flex max-h-[48vh] min-h-[260px] flex-col rounded-t-[28px] border-t border-emerald-100 bg-white/95 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl transition-transform duration-300 md:static md:h-[34vh] md:max-h-none md:min-h-[300px] md:translate-y-0 md:rounded-none md:border-l-0 lg:h-full lg:min-h-0 lg:border-l lg:border-t-0 ${
          isMobileSheetOpen ? "translate-y-0" : "translate-y-[calc(100%-84px)]"
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-emerald-200 lg:hidden" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-[#14532d]">
              AI
            </span>
            <p className="text-sm font-semibold tracking-tight text-[#102217]">
              AI Selgitaja
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            BETA
          </span>
        </div>
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-[#102217]">
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
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-[#314236]">
          <p className="font-semibold text-[#14532d]">Miks see oluline on?</p>
          <p className="mt-2">
            Vali kaardilt metsaeraldis ja MetsaSelgitaja AI tõlgib tehnilised
            andmed inimkeelde – kokkuvõte, faktid, riskid ja soovitused.
          </p>
        </div>
        <button
          type="button"
          onClick={onRunSampleDemo}
          disabled={isGenerating}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#14532d] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3f23] disabled:cursor-wait disabled:bg-[#7b927d]"
        >
          <span aria-hidden>⚡</span>
          {isGenerating ? "Koostan näidist..." : "Käivita näidisanalüüs"}
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed inset-x-0 bottom-0 z-[1100] max-h-[82vh] overflow-y-auto rounded-t-[28px] border-t border-emerald-100 bg-[#f8fbf6] shadow-2xl shadow-emerald-950/10 backdrop-blur-xl transition-transform duration-300 md:static md:h-[38vh] md:max-h-none md:min-h-[360px] md:translate-y-0 md:rounded-none md:border-l-0 lg:h-full lg:min-h-[520px] lg:border-l lg:border-t-0 lg:shadow-none ${
        isMobileSheetOpen ? "translate-y-0" : "translate-y-[calc(100%-92px)]"
      }`}
    >
      <div className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 p-5 backdrop-blur-xl">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-emerald-200 lg:hidden" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-[#14532d]">
              AI
            </span>
            <p className="text-sm font-semibold tracking-tight text-[#102217]">
              AI Selgitaja
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              BETA
            </span>
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 text-[#66756a] lg:hidden"
              aria-label="Sulge AI paneel"
            >
              ×
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#66756a]">
              Valitud ala
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#102217]">
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
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-base">📐</span>
              <p className="text-xs text-[#66756a]">Pindala</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-[#102217]">
              {areaDisplayValue(selectedArea)}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-base">⚠️</span>
              <p className="text-xs text-[#66756a]">Riskiskoor</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-[#102217]">
              {selectedArea.riskScore}/100
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-base">🌳</span>
              <p className="text-xs text-[#66756a]">Peamine puuliik</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-[#102217]">
              {dominantTreeDisplayValue(selectedArea)}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-base">🪓</span>
              <p className="text-xs text-[#66756a]">Viimane raie</p>
            </div>
            <p className="mt-2 text-lg font-semibold text-[#102217]">
              {lastCutYearDisplayValue(selectedArea)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-[#102217]">
            AI selgituse koostamine
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#536153]">
            AI koondab Metsaregistri eraldise andmed, kaardikihid ja riskisignaalid üheks
            loetavaks selgituseks. Saad valida vastusest kokkuvõtte, faktid, riskid või
            soovitused. Kõik järeldused tuleb kontrollida algandmetest – tegemist on
            häkatoni prototüübiga, kus AI tõlgib tehnilised andmed inimkeelde.
          </p>
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#14532d] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3f23] focus:outline-none focus:ring-2 focus:ring-[#14532d] focus:ring-offset-2 disabled:cursor-wait disabled:bg-[#7b927d]"
          >
            <span aria-hidden>📄</span>
            {isGenerating ? "Koostan selgitust..." : "Genereeri inimkeelne PDF"}
          </button>
        </div>

        <dl className="rounded-2xl border border-emerald-100 bg-white px-4 shadow-sm">
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
            value={
              selectedArea.isRealData
                ? "Andmetes puudub"
                : `${selectedArea.clearCutHa.toFixed(1)} ha mock lageraieala`
            }
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
              className="w-full rounded-2xl border border-[#14532d] bg-[#14532d] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f3f23] focus:outline-none focus:ring-2 focus:ring-[#14532d] focus:ring-offset-2"
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
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTabletAiCollapsed, setIsTabletAiCollapsed] = useState(false);

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
    setIsMobileSheetOpen(true);
    setIsTabletAiCollapsed(false);
  }

  function handleOpenKorvemaaDemo() {
    setSelectedArea(null);
    setReport(null);
    setAiAnalysis(null);
    setReportTimestamp(null);
    setIsReportOpen(false);
    setAnalysisError(null);
    setIsKorvemaaDemoActive(true);
    setIsMobileSheetOpen(true);
    setIsMobileMenuOpen(false);
    setIsTabletAiCollapsed(false);
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
    setIsMobileSheetOpen(true);
    setIsTabletAiCollapsed(false);

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
    <main className="flex h-[100dvh] flex-col overflow-hidden bg-[#eef3ec] text-[#102217]">
      <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-emerald-100 bg-white/95 px-4 shadow-sm backdrop-blur-xl lg:h-[72px] lg:px-5">
        <div className="flex items-center gap-3 lg:min-w-[230px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-xl text-emerald-800 lg:h-11 lg:w-11">
            <span aria-hidden>🌲</span>
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-semibold tracking-tight text-[#102217] sm:text-lg">
              MetsaSelgitaja AI
            </h1>
            <p className="mt-0.5 hidden text-[11px] text-[#66756a] sm:block">
              Pakume kindlust ja selgust metsandusandmete suhtes
            </p>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-center px-4 md:flex">
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-[#14532d] bg-[#f4f8f1] px-4 py-2 text-sm text-[#536153] shadow-inner focus-within:ring-2 focus-within:ring-[#14532d]/30">
            <span aria-hidden className="text-[#7d8b7c]">🔍</span>
            <input
              type="search"
              placeholder="Otsi metsa-eraldist, KÜ tunnust või asukohta…"
              className="flex-1 bg-transparent text-sm text-[#1d2a1d] placeholder:text-[#8a988a] focus:outline-none"
            />
          </div>
        </div>

        <nav className="hidden items-center gap-2 text-sm text-[#445247] md:flex">
          <button
            type="button"
            onClick={() => runDemo(forestAreas[0])}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-full bg-[#14532d] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0f3f23] disabled:opacity-60"
          >
            <span aria-hidden>▶</span>
            <span>Demo</span>
          </button>
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-[#445247] hover:bg-emerald-50 lg:inline-flex"
            aria-label="Teavitused"
          >
            <span aria-hidden>🔔</span>
          </button>
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-[#445247] hover:bg-emerald-50 lg:inline-flex"
            aria-label="Konto"
          >
            <span aria-hidden>👤</span>
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-white text-xl shadow-sm md:hidden"
          aria-label="Ava menüü"
        >
          ☰
        </button>
      </header>

      <div
        className={`grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] md:grid-cols-[84px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_auto] lg:grid-rows-1 ${
          isTabletAiCollapsed
            ? "lg:grid-cols-[220px_minmax(0,1fr)_72px]"
            : "lg:grid-cols-[220px_minmax(0,1fr)_430px]"
        }`}
      >
        <aside className="hidden border-r border-emerald-100 bg-white/85 p-3 shadow-sm backdrop-blur-xl md:flex md:flex-col lg:p-4">
          <div className="space-y-1.5">
            {[
              { label: "Ülevaade", icon: "▦" },
              { label: "Kaart", icon: "🗺" },
              { label: "Analüüsid", icon: "📊" },
              { label: "Aruanded", icon: "📄" },
              { label: "Andmeallikad", icon: "🗂" },
              { label: "Kasutusjuhend", icon: "❓" },
            ].map((item, index) => (
              <button
                key={item.label}
                type="button"
                title={item.label}
                className={`flex h-12 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition lg:h-auto lg:justify-start lg:px-3 lg:py-2.5 ${
                  index === 0
                    ? "bg-emerald-50 text-[#14532d]"
                    : "text-[#445247] hover:bg-[#f4f8f1]"
                }`}
              >
                <span aria-hidden className="text-base leading-none lg:text-sm">
                  {item.icon}
                </span>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-auto hidden space-y-3 lg:block">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs leading-5 text-[#314236]">
              <p className="font-semibold text-[#14532d]">Meie eesmärk</p>
              <p className="mt-2">
                Pakume kindlust ja selgust metsandusandmete suhtes igaühele.
              </p>
            </div>
            <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-[#8a988a]">
              Häkatoni prototüüp
            </p>
          </div>
        </aside>

        <section className="relative min-h-0 overflow-hidden bg-[#dfe8dc] md:col-start-2 lg:col-start-2">
          <LeafletMap
            selectedAreaId={selectedAreaId}
            demoFocusKey={demoFocusKey}
            onSelectArea={handleSelectArea}
          />

          <div className="pointer-events-none absolute left-4 right-4 top-4 z-[900] flex flex-col gap-3 sm:left-5 sm:right-auto sm:w-[540px]">
            <div className="pointer-events-auto hidden rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl backdrop-blur-xl sm:block">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                  Päris avaandmete demo
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#536153] shadow-sm">
                  Aegviidu / Kõrvemaa
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#102217]">
                Muudame metsandusandmed inimkeelde
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#536153]">{mapIntro}</p>
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                Tegemist on häkatoni prototüübiga. Andmed ja järeldused tuleb
                kontrollida algallikatest.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenKorvemaaDemo}
            disabled={isGenerating}
            className="absolute bottom-24 left-4 right-4 z-[900] rounded-2xl bg-[#14532d] px-5 py-4 text-sm font-semibold text-white shadow-2xl shadow-emerald-950/20 transition active:scale-[0.99] disabled:opacity-60 lg:hidden"
          >
            Ava Kõrvemaa demo
          </button>

          <div className="pointer-events-none absolute bottom-5 left-4 right-4 z-[900] hidden lg:block">
            <div className="pointer-events-auto mx-auto grid max-w-2xl grid-cols-3 overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                onClick={handleOpenKorvemaaDemo}
                disabled={isGenerating}
                className="px-4 py-4 text-sm font-semibold text-[#14532d] transition hover:bg-emerald-50 disabled:opacity-60"
              >
                Ava Kõrvemaa demo
              </button>
              <button
                type="button"
                onClick={() => runDemo(forestAreas[0])}
                disabled={isGenerating}
                className="border-l border-emerald-100 px-4 py-4 text-sm font-semibold text-[#314236] transition hover:bg-emerald-50 disabled:opacity-60"
              >
                Juhuslik metsaala
              </button>
              <button
                type="button"
                onClick={() =>
                  selectedArea ? handleGenerateReport() : runDemo(forestAreas[2])
                }
                disabled={isGenerating}
                className="border-l border-emerald-100 px-4 py-4 text-sm font-semibold text-[#314236] transition hover:bg-emerald-50 disabled:opacity-60"
              >
                Selgita
              </button>
            </div>
          </div>
        </section>

        <div
          className={`relative min-h-0 transition-all duration-300 md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1 ${
            isTabletAiCollapsed ? "lg:w-[72px]" : ""
          }`}
        >
          <button
            type="button"
            onClick={() => setIsTabletAiCollapsed((current) => !current)}
            className="absolute left-3 top-3 z-[1200] hidden h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-white/95 text-[#14532d] shadow-xl backdrop-blur-xl md:flex lg:-left-14"
            aria-label={
              isTabletAiCollapsed ? "Ava AI paneel" : "Ahenda AI paneel"
            }
          >
            {isTabletAiCollapsed ? "AI" : "›"}
          </button>
          <div
            className={`h-full transition-all duration-300 ${
              isTabletAiCollapsed
                ? "pointer-events-none hidden opacity-0 lg:block lg:w-[72px]"
                : "opacity-100"
            }`}
          >
            <Sidebar
              selectedArea={selectedArea}
              report={report}
              aiAnalysis={aiAnalysis}
              reportTimestamp={reportTimestamp}
              isReportOpen={isReportOpen}
              isGenerating={isGenerating}
              analysisError={analysisError}
              isKorvemaaDemoActive={isKorvemaaDemoActive}
              isMobileSheetOpen={isMobileSheetOpen}
              onGenerate={handleGenerateReport}
              onOpenReport={handleOpenReport}
              onCloseReport={handleCloseReport}
              onCloseMobile={() => setIsMobileSheetOpen(false)}
              onRunSampleDemo={() => runDemo(forestAreas[0])}
            />
          </div>
          {isTabletAiCollapsed ? (
            <div className="hidden h-full border-l border-emerald-100 bg-white/90 px-3 py-16 text-center shadow-sm lg:block">
              <p className="rotate-90 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-emerald-700">
                AI Selgitaja
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-[2100] bg-[#102217]/30 backdrop-blur-sm md:hidden">
          <div className="ml-auto h-full w-[82vw] max-w-sm bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#102217]">Menüü</h2>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 text-xl"
                aria-label="Sulge menüü"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              {["Ülevaade", "Kaart", "Analüüsid", "Aruanded", "Andmeallikad", "Kasutusjuhend"].map(
                (item, index) => (
                  <button
                    key={item}
                    type="button"
                    className={`w-full rounded-2xl px-4 py-4 text-left text-sm font-semibold ${
                      index === 0
                        ? "bg-emerald-50 text-[#14532d]"
                        : "text-[#445247]"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <div className="mt-8 rounded-3xl border border-emerald-100 bg-emerald-50/80 p-5 text-sm leading-6 text-[#314236]">
              <p className="font-semibold text-[#14532d]">Meie eesmärk</p>
              <p className="mt-2">
                Teeme keerulised metsandusandmed arusaadavaks igaühele.
              </p>
              <button
                type="button"
                onClick={handleOpenKorvemaaDemo}
                className="mt-4 w-full rounded-2xl bg-[#14532d] px-4 py-3 font-semibold text-white"
              >
                Ava Kõrvemaa demo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
